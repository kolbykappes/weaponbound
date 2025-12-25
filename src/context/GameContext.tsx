// context/GameContext.tsx

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, GameAction, TreeData } from '../types/game.types';
import { createInitialState, addMasteryXp, addLegacyXp, canAllocateNode, findNode, createEnemy } from '../utils/gameLogic';
import { calculateStats, calculateRewards, calculateWeaponLevelCost } from '../utils/calculations';
import { saveGame, loadGame } from '../utils/storage';
import { GAME_CONSTANTS } from '../utils/constants';

import masteryDaggerData from '../data/mastery-dagger.json';
import legacyTreeData from '../data/legacy-tree.json';
import fighterTreeData from '../data/fighter-tree.json';

const masteryTree = masteryDaggerData as TreeData;
const legacyTree = legacyTreeData as TreeData;
const fighterTree = fighterTreeData as TreeData;

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  masteryTree: TreeData;
  legacyTree: TreeData;
  fighterTree: TreeData;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'GAME_TICK': {
      const { deltaSec, now } = action.payload;
      let newState = { ...state, lastTickTime: now };

      // 1. Regenerate energy
      newState.energy = Math.min(
        newState.maxEnergy,
        newState.energy + newState.energyRegenPerSecond * deltaSec
      );

      // 2. Tick down swing timer and attack when ready
      newState.swingTimer -= deltaSec;
      if (newState.swingTimer <= 0 && newState.enemyQueue.length > 0) {
        // Auto-swing at front enemy
        const damage = newState.stats.passiveDps * (GAME_CONSTANTS.DAGGER_BASE_SWING_INTERVAL / 1.0); // Normalize for swing interval
        newState = dealDamageToFrontEnemy(newState, damage);
        newState.swingTimer = GAME_CONSTANTS.DAGGER_BASE_SWING_INTERVAL;
      }

      // 3. Tick down enemy spawn timer and spawn when ready
      newState.nextEnemySpawnTimer -= deltaSec;
      if (newState.nextEnemySpawnTimer <= 0 &&
          newState.enemyQueue.length < 10 &&
          newState.enemiesRemainingOnFloor > newState.enemyQueue.length) {
        // Spawn new enemy
        const newEnemy = createEnemy(
          newState.currentFloor,
          newState.isBossFloor && newState.enemiesRemainingOnFloor === 1,
          newState.enemyHpMultiplier,
          newState.bossHpMultiplier
        );
        newState.enemyQueue = [...newState.enemyQueue, newEnemy];
        newState.nextEnemySpawnTimer = newState.enemySpawnInterval;
      }

      // 4. Check if front enemy is dead
      if (newState.enemyQueue.length > 0 && newState.enemyQueue[0]!.hp <= 0) {
        newState = handleEnemyDeath(newState);
      }

      // 5. Update boss timer if on boss floor
      if (newState.isBossFloor && newState.bossTimerRemaining !== null) {
        newState.bossTimerRemaining -= deltaSec;

        if (newState.bossTimerRemaining <= 0 && newState.enemyQueue.length > 0) {
          newState = handleBossFailure(newState);
        }
      }

      return newState;
    }

    case 'ACTIVE_ATTACK': {
      if (state.energy >= state.energyPerClick && state.enemyQueue.length > 0) {
        const damage = state.stats.activeDps;
        let newState = {
          ...state,
          energy: state.energy - state.energyPerClick,
        };

        // Deal damage to front enemy
        newState = dealDamageToFrontEnemy(newState, damage);

        // Check for enemy death
        if (newState.enemyQueue.length > 0 && newState.enemyQueue[0]!.hp <= 0) {
          newState = handleEnemyDeath(newState);
        }

        return newState;
      }
      return state;
    }

    case 'LEVEL_WEAPON': {
      const cost = calculateWeaponLevelCost(state.weapon.runLevel);
      if (state.gold >= cost && state.weapon.runLevel < GAME_CONSTANTS.WEAPON_MAX_RUN_LEVEL) {
        const newWeapon = {
          ...state.weapon,
          runLevel: state.weapon.runLevel + 1,
        };
        const newState = {
          ...state,
          gold: state.gold - cost,
          weapon: newWeapon,
        };
        newState.stats = calculateStats(newState, masteryTree, legacyTree);
        return newState;
      }
      return state;
    }

    case 'ALLOCATE_MASTERY_NODE': {
      const node = findNode(masteryTree, action.payload.nodeId);
      if (!node) return state;

      if (state.weapon.masteryPointsAvailable >= node.cost &&
        canAllocateNode(node, state.weapon.masteryAllocated, masteryTree)) {
        const newAllocated = {
          ...state.weapon.masteryAllocated,
          [node.id]: true,
        };
        const newWeapon = {
          ...state.weapon,
          masteryPointsAvailable: state.weapon.masteryPointsAvailable - node.cost,
          masteryAllocated: newAllocated,
        };
        const newState = { ...state, weapon: newWeapon };
        newState.stats = calculateStats(newState, masteryTree, legacyTree);
        return newState;
      }
      return state;
    }

    case 'ALLOCATE_LEGACY_NODE': {
      const node = findNode(legacyTree, action.payload.nodeId);
      if (!node) return state;

      if (state.legacyPointsAvailable >= node.cost &&
        canAllocateNode(node, state.legacyAllocated, legacyTree)) {
        const newAllocated = {
          ...state.legacyAllocated,
          [node.id]: true,
        };
        const newState = {
          ...state,
          legacyPointsAvailable: state.legacyPointsAvailable - node.cost,
          legacyAllocated: newAllocated,
        };
        newState.stats = calculateStats(newState, masteryTree, legacyTree);
        return newState;
      }
      return state;
    }

    case 'UPDATE_ENEMY_HP_MULT': {
      return {
        ...state,
        enemyHpMultiplier: action.payload,
      };
    }

    case 'UPDATE_BOSS_HP_MULT': {
      return {
        ...state,
        bossHpMultiplier: action.payload,
      };
    }

    case 'UPDATE_ENEMY_SPAWN_INTERVAL': {
      return {
        ...state,
        enemySpawnInterval: action.payload,
      };
    }

    case 'RESET_GAME': {
      const initialState = createInitialState();
      initialState.stats = calculateStats(initialState, masteryTree, legacyTree);
      return initialState;
    }

    case 'LOAD_GAME': {
      const loadedState = action.payload;
      // Ensure multipliers exist (for backwards compatibility)
      if (!loadedState.enemyHpMultiplier) {
        loadedState.enemyHpMultiplier = GAME_CONSTANTS.ENEMY_HP_MULTIPLIER;
      }
      if (!loadedState.bossHpMultiplier) {
        loadedState.bossHpMultiplier = GAME_CONSTANTS.BOSS_HP_MULTIPLIER;
      }
      loadedState.stats = calculateStats(loadedState, masteryTree, legacyTree);
      return loadedState;
    }

    default:
      return state;
  }
}

function dealDamageToFrontEnemy(state: GameState, damage: number): GameState {
  if (state.enemyQueue.length === 0) return state;

  const updatedQueue = [...state.enemyQueue];
  const frontEnemy = updatedQueue[0]!;
  frontEnemy.hp = Math.max(0, frontEnemy.hp - damage);
  updatedQueue[0] = frontEnemy;

  return {
    ...state,
    enemyQueue: updatedQueue,
  };
}

function handleEnemyDeath(state: GameState): GameState {
  if (state.enemyQueue.length === 0) return state;

  const deadEnemy = state.enemyQueue[0]!;
  const rewards = calculateRewards(state.currentFloor, deadEnemy.isBoss, state.stats);

  let newState = {
    ...state,
    gold: state.gold + rewards.gold,
    enemyQueue: state.enemyQueue.slice(1), // Remove dead enemy from front
  };

  // Add weapon mastery XP
  newState.weapon = addMasteryXp(newState.weapon, rewards.masteryXp);

  // Add legacy XP
  newState = addLegacyXp(newState, rewards.legacyXp);

  // Check if all enemies on floor are defeated (none in queue, none waiting to spawn)
  const totalEnemiesLeft = newState.enemyQueue.length + (newState.enemiesRemainingOnFloor - state.enemyQueue.length);
  if (totalEnemiesLeft === 0) {
    // Floor complete, advance to next floor
    newState = advanceFloor(newState);
  }

  // Recalculate stats (in case level up happened)
  newState.stats = calculateStats(newState, masteryTree, legacyTree);

  return newState;
}

function advanceFloor(state: GameState): GameState {
  const nextFloor = state.currentFloor + 1;
  const isBoss = nextFloor % GAME_CONSTANTS.BOSS_FLOOR_INTERVAL === 0;

  // Create first enemy for new floor
  const firstEnemy = createEnemy(nextFloor, isBoss, state.enemyHpMultiplier, state.bossHpMultiplier);

  return {
    ...state,
    currentFloor: nextFloor,
    isBossFloor: isBoss,
    enemiesRemainingOnFloor: isBoss ? 1 : GAME_CONSTANTS.ENEMIES_PER_FLOOR,
    enemyQueue: [firstEnemy],
    nextEnemySpawnTimer: state.enemySpawnInterval,
    bossTimerRemaining: isBoss ? GAME_CONSTANTS.BOSS_TIMER_SECONDS : null,
  };
}

function handleBossFailure(state: GameState): GameState {
  // Move back to previous non-boss floor
  const previousFloor = state.currentFloor - 1;

  // Create first enemy for previous floor
  const firstEnemy = createEnemy(previousFloor, false, state.enemyHpMultiplier, state.bossHpMultiplier);

  return {
    ...state,
    currentFloor: previousFloor,
    isBossFloor: false,
    enemiesRemainingOnFloor: GAME_CONSTANTS.ENEMIES_PER_FLOOR,
    enemyQueue: [firstEnemy],
    nextEnemySpawnTimer: state.enemySpawnInterval,
    bossTimerRemaining: null,
  };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const savedState = loadGame();
  const initialState = savedState || createInitialState();

  // Calculate initial stats
  initialState.stats = calculateStats(initialState, masteryTree, legacyTree);

  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Auto-save every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveGame(state);
    }, 5000);

    return () => clearInterval(interval);
  }, [state]);

  const value = {
    state,
    dispatch,
    masteryTree,
    legacyTree,
    fighterTree,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

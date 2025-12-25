// utils/gameLogic.ts

import { GameState, Weapon, TreeData, TreeNode, Enemy } from '../types/game.types';
import { GAME_CONSTANTS } from './constants';
import { calculateEnemyHp, calculateMasteryLevel, calculateLegacyLevel } from './calculations';

export function createInitialWeapon(): Weapon {
  return {
    id: 'dagger',
    name: 'Dagger',
    runLevel: 1,
    masteryXp: 0,
    masteryLevel: 1,
    masteryPointsAvailable: 0,
    masteryAllocated: {},
    quality: 1,
    activeLoadoutIndex: 0,
    loadouts: [
      { id: 'loadout_1', name: 'Default' }
    ]
  };
}

export function createEnemy(floor: number, isBoss: boolean, enemyHpMult: number, bossHpMult: number): Enemy {
  const maxHp = calculateEnemyHp(floor, isBoss, enemyHpMult, bossHpMult);
  return {
    id: `enemy_${Date.now()}_${Math.random()}`,
    hp: maxHp,
    maxHp,
    isBoss,
  };
}

export function createInitialState(): GameState {
  const startingFloor = GAME_CONSTANTS.STARTING_FLOOR;
  const enemyHpMult = GAME_CONSTANTS.ENEMY_HP_MULTIPLIER;
  const bossHpMult = GAME_CONSTANTS.BOSS_HP_MULTIPLIER;
  const spawnInterval = GAME_CONSTANTS.ENEMY_SPAWN_INTERVAL;

  // Create first enemy
  const firstEnemy = createEnemy(startingFloor, false, enemyHpMult, bossHpMult);

  return {
    currentFloor: startingFloor,
    isBossFloor: false,
    enemiesRemainingOnFloor: GAME_CONSTANTS.ENEMIES_PER_FLOOR,
    enemyQueue: [firstEnemy],
    nextEnemySpawnTimer: spawnInterval,
    bossTimerRemaining: null,
    gold: GAME_CONSTANTS.STARTING_GOLD,

    weapon: createInitialWeapon(),
    swingTimer: GAME_CONSTANTS.DAGGER_BASE_SWING_INTERVAL,

    legacyXp: 0,
    legacyLevel: 1,
    legacyPointsAvailable: 0,
    legacyAllocated: {},

    fighterRunPointsAvailable: 0,
    fighterRunAllocated: {},

    stats: {
      totalDps: 0,
      passiveDps: 0,
      activeDps: 0,
      baseDamage: 0,
      critChance: 0,
      critMultiplier: 0,
      attackSpeed: 0,
      goldMultiplier: 1,
      masteryXpMultiplier: 1,
      legacyXpMultiplier: 1,
    },

    energy: GAME_CONSTANTS.STARTING_ENERGY,
    maxEnergy: GAME_CONSTANTS.BASE_MAX_ENERGY,
    energyRegenPerSecond: GAME_CONSTANTS.BASE_ENERGY_REGEN_PER_SECOND,
    energyPerClick: GAME_CONSTANTS.BASE_ENERGY_PER_CLICK,

    lastTickTime: Date.now(),
    isRunActive: true,

    enemyHpMultiplier: enemyHpMult,
    bossHpMultiplier: bossHpMult,
    enemySpawnInterval: spawnInterval,
  };
}

export function addMasteryXp(weapon: Weapon, xp: number): Weapon {
  const newMasteryXp = weapon.masteryXp + xp;
  const newMasteryLevel = calculateMasteryLevel(newMasteryXp);
  const levelGained = newMasteryLevel - weapon.masteryLevel;

  return {
    ...weapon,
    masteryXp: newMasteryXp,
    masteryLevel: newMasteryLevel,
    masteryPointsAvailable: weapon.masteryPointsAvailable + levelGained,
  };
}

export function addLegacyXp(state: GameState, xp: number): GameState {
  const newLegacyXp = state.legacyXp + xp;
  const newLegacyLevel = calculateLegacyLevel(newLegacyXp);
  const levelGained = newLegacyLevel - state.legacyLevel;

  return {
    ...state,
    legacyXp: newLegacyXp,
    legacyLevel: newLegacyLevel,
    legacyPointsAvailable: state.legacyPointsAvailable + levelGained,
  };
}

export function canAllocateNode(
  node: TreeNode,
  allocated: Record<string, boolean>,
  _tree: TreeData
): boolean {
  // Check if already allocated
  if (allocated[node.id]) {
    return false;
  }

  // Check if all parents are allocated
  for (const parentId of node.parents) {
    if (!allocated[parentId]) {
      return false;
    }
  }

  return true;
}

export function findNode(tree: TreeData, nodeId: string): TreeNode | null {
  return tree.nodes.find(n => n.id === nodeId) || null;
}

export function getEnemyName(floor: number, isBoss: boolean): string {
  if (isBoss) {
    return `Boss ${Math.floor(floor / GAME_CONSTANTS.BOSS_FLOOR_INTERVAL)}`;
  }
  return `Enemy`;
}

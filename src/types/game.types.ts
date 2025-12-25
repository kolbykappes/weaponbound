// types/game.types.ts

export interface Enemy {
  id: string;
  hp: number;
  maxHp: number;
  isBoss: boolean;
}

export interface GameState {
  // Run state
  currentFloor: number;
  isBossFloor: boolean;
  enemiesRemainingOnFloor: number;
  enemyQueue: Enemy[]; // Active enemies in the zone (max 10)
  nextEnemySpawnTimer: number; // seconds until next enemy spawns
  bossTimerRemaining: number | null; // seconds, null if not boss floor
  gold: number;

  // Weapon (single Dagger for POC)
  weapon: Weapon;
  swingTimer: number; // seconds until next auto-swing

  // Account-wide progression
  legacyXp: number;
  legacyLevel: number;
  legacyPointsAvailable: number;
  legacyAllocated: Record<string, boolean>;

  // Fighter class (run-level, resets each run)
  fighterRunPointsAvailable: number;
  fighterRunAllocated: Record<string, boolean>;

  // Combat stats (derived/calculated)
  stats: CombatStats;

  // Energy
  energy: number;
  maxEnergy: number;
  energyRegenPerSecond: number;
  energyPerClick: number;

  // Meta
  lastTickTime: number;
  isRunActive: boolean;

  // Balance settings
  enemyHpMultiplier: number;
  bossHpMultiplier: number;
  enemySpawnInterval: number; // seconds between enemy spawns
}

export interface Weapon {
  id: string;           // "dagger"
  name: string;         // "Dagger"
  runLevel: number;     // in-run weapon level (resets each run)
  masteryXp: number;    // permanent XP
  masteryLevel: number; // derived from masteryXp
  masteryPointsAvailable: number;
  masteryAllocated: Record<string, boolean>;
  quality: number;      // start at 1
  activeLoadoutIndex: number;
  loadouts: Loadout[];
}

export interface Loadout {
  id: string;
  name: string;
  // For POC, loadouts share same mastery allocations
  // In full game, each loadout would have separate allocations
}

export interface CombatStats {
  totalDps: number;
  passiveDps: number;
  activeDps: number;
  baseDamage: number;
  critChance: number;
  critMultiplier: number;
  attackSpeed: number;
  goldMultiplier: number;
  masteryXpMultiplier: number;
  legacyXpMultiplier: number;
}

export interface TreeNode {
  id: string;
  name: string;
  description: string;
  cost: number;
  parents: string[];
  effects: NodeEffect[];
}

export interface NodeEffect {
  type: string;
  value: number;
  target?: string;
}

export interface EnemyData {
  name: string;
  hp: number;
  maxHp: number;
  isBoss: boolean;
  floor: number;
}

export interface TreeData {
  treeId: string;
  weaponId?: string;
  nodes: TreeNode[];
}

export type GameAction =
  | { type: 'GAME_TICK'; payload: { deltaMs: number; deltaSec: number; now: number } }
  | { type: 'ACTIVE_ATTACK' }
  | { type: 'LEVEL_WEAPON' }
  | { type: 'ALLOCATE_MASTERY_NODE'; payload: { nodeId: string } }
  | { type: 'ALLOCATE_LEGACY_NODE'; payload: { nodeId: string } }
  | { type: 'UPDATE_ENEMY_HP_MULT'; payload: number }
  | { type: 'UPDATE_BOSS_HP_MULT'; payload: number }
  | { type: 'UPDATE_ENEMY_SPAWN_INTERVAL'; payload: number }
  | { type: 'END_RUN' }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_GAME'; payload: GameState };

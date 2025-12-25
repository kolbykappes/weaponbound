// utils/constants.ts

export const APP_VERSION = '0.3.1';

export const GAME_CONSTANTS = {
  // Tick rate
  TICK_INTERVAL_MS: 250,

  // Floor structure
  ENEMIES_PER_FLOOR: 10,
  BOSS_FLOOR_INTERVAL: 5,
  BOSS_TIMER_SECONDS: 30,

  // Starting stats
  STARTING_FLOOR: 1,
  STARTING_GOLD: 0,
  STARTING_ENERGY: 100,

  // Energy
  BASE_MAX_ENERGY: 100,
  BASE_ENERGY_REGEN_PER_SECOND: 25,
  BASE_ENERGY_PER_CLICK: 5,

  // Weapon - Dagger base stats
  DAGGER_BASE_DAMAGE: 1,
  DAGGER_BASE_PASSIVE_DPS: 2,
  DAGGER_BASE_ATTACK_SPEED: 1,
  DAGGER_BASE_CRIT_CHANCE: 0,
  DAGGER_BASE_CRIT_MULTIPLIER: 1.5,
  DAGGER_BASE_SWING_INTERVAL: 1.0, // seconds between auto-swings

  // Weapon leveling (in-run)
  WEAPON_LEVEL_DAMAGE_INCREASE: 3,
  WEAPON_LEVEL_BASE_COST: 20,
  WEAPON_LEVEL_COST_MULTIPLIER: 1.15,
  WEAPON_MAX_RUN_LEVEL: 50,

  // Enemy scaling
  ENEMY_BASE_HP: 5,
  ENEMY_HP_MULTIPLIER: 1.20,
  BOSS_HP_MULTIPLIER: 5,

  // Rewards - Normal Enemy
  NORMAL_ENEMY_GOLD_BASE: 10,
  NORMAL_ENEMY_MASTERY_XP_BASE: 1,
  NORMAL_ENEMY_LEGACY_XP_BASE: 0.2,

  // Rewards - Boss
  BOSS_GOLD_BASE: 50,
  BOSS_MASTERY_XP_BASE: 5,
  BOSS_LEGACY_XP_BASE: 2,

  // XP to Level conversion
  MASTERY_XP_PER_LEVEL: 100,
  LEGACY_XP_PER_LEVEL: 50,

  // Enemy spawning
  ENEMY_SPAWN_INTERVAL: 2.0, // seconds between enemy spawns

  // Storage
  STORAGE_KEY: 'weaponbound-game-state',
  STORAGE_VERSION: 2, // Incremented for new enemy queue system
};

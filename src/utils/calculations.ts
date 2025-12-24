// utils/calculations.ts

import { GameState, CombatStats, TreeData, NodeEffect } from '../types/game.types';
import { GAME_CONSTANTS } from './constants';

export function calculateEnemyHp(floor: number, isBoss: boolean): number {
  const baseHp = GAME_CONSTANTS.ENEMY_BASE_HP *
    Math.pow(GAME_CONSTANTS.ENEMY_HP_MULTIPLIER, floor - 1);

  return isBoss ? baseHp * GAME_CONSTANTS.BOSS_HP_MULTIPLIER : baseHp;
}

export function calculateWeaponLevelCost(currentLevel: number): number {
  return Math.floor(
    GAME_CONSTANTS.WEAPON_LEVEL_BASE_COST *
    Math.pow(GAME_CONSTANTS.WEAPON_LEVEL_COST_MULTIPLIER, currentLevel - 1)
  );
}

export function getActiveEffects(allocated: Record<string, boolean>, tree: TreeData): NodeEffect[] {
  const effects: NodeEffect[] = [];

  for (const node of tree.nodes) {
    if (allocated[node.id]) {
      effects.push(...node.effects);
    }
  }

  return effects;
}

export function calculateStats(
  state: GameState,
  masteryTree: TreeData,
  legacyTree: TreeData
): CombatStats {
  // Start with base values
  let baseDamage = GAME_CONSTANTS.DAGGER_BASE_DAMAGE;
  let passiveDpsBase = GAME_CONSTANTS.DAGGER_BASE_PASSIVE_DPS;
  let activeDpsBase = 1; // Base multiplier for active damage
  let critChance = GAME_CONSTANTS.DAGGER_BASE_CRIT_CHANCE;
  let critMultiplier = GAME_CONSTANTS.DAGGER_BASE_CRIT_MULTIPLIER;
  let attackSpeed = GAME_CONSTANTS.DAGGER_BASE_ATTACK_SPEED;
  let goldMultiplier = 1.0;
  let masteryXpMultiplier = 1.0;
  let legacyXpMultiplier = 1.0;

  // Multipliers
  let baseDamageMult = 1.0;
  let passiveDpsMult = 1.0;
  let activeDpsMult = 1.0;
  let passiveDpsMultGlobal = 1.0;
  let attackSpeedMult = 1.0;
  let activeAttackSpeedMult = 1.0;
  let energyCostMult = 1.0;

  // Apply weapon run levels
  baseDamage += (state.weapon.runLevel - 1) * GAME_CONSTANTS.WEAPON_LEVEL_DAMAGE_INCREASE;

  // Apply mastery tree effects
  const masteryEffects = getActiveEffects(state.weapon.masteryAllocated, masteryTree);
  for (const effect of masteryEffects) {
    switch (effect.type) {
      case 'base_damage_mult':
        baseDamageMult += effect.value;
        break;
      case 'passive_dps_mult':
        passiveDpsMult += effect.value;
        break;
      case 'active_dps_mult':
        activeDpsMult += effect.value;
        break;
      case 'crit_chance_add':
        critChance += effect.value;
        break;
      case 'crit_multiplier_add':
        critMultiplier += effect.value;
        break;
      case 'attack_speed_mult':
        attackSpeedMult += effect.value;
        break;
      case 'active_attack_speed_mult':
        activeAttackSpeedMult += effect.value;
        break;
      case 'energy_cost_mult':
        energyCostMult += effect.value;
        break;
      case 'gold_mult':
        goldMultiplier += effect.value;
        break;
      case 'mastery_xp_mult':
        masteryXpMultiplier += effect.value;
        break;
    }
  }

  // Apply legacy tree effects
  const legacyEffects = getActiveEffects(state.legacyAllocated, legacyTree);
  for (const effect of legacyEffects) {
    switch (effect.type) {
      case 'legacy_xp_mult':
        legacyXpMultiplier += effect.value;
        break;
      case 'mastery_xp_mult_global':
        masteryXpMultiplier += effect.value;
        break;
      case 'weapon_base_damage_mult':
        baseDamageMult += effect.value;
        break;
      case 'passive_dps_mult_global':
        passiveDpsMultGlobal += effect.value;
        break;
      case 'energy_regen_mult':
        // This will be applied when calculating energy regen
        break;
    }
  }

  // Calculate final values
  baseDamage = baseDamage * baseDamageMult;
  const passiveDps = baseDamage * passiveDpsBase * passiveDpsMult * passiveDpsMultGlobal * attackSpeedMult;
  const activeDps = baseDamage * activeDpsBase * activeDpsMult * attackSpeedMult * activeAttackSpeedMult;
  const totalDps = passiveDps + (activeDps * 0.3); // Estimate assuming some clicking

  return {
    totalDps,
    passiveDps,
    activeDps,
    baseDamage,
    critChance,
    critMultiplier,
    attackSpeed: attackSpeed * attackSpeedMult * activeAttackSpeedMult,
    goldMultiplier,
    masteryXpMultiplier,
    legacyXpMultiplier,
  };
}

export function calculateRewards(floor: number, isBoss: boolean, stats: CombatStats) {
  const floorMult = floor;

  if (isBoss) {
    return {
      gold: Math.floor(GAME_CONSTANTS.BOSS_GOLD_BASE * floorMult * stats.goldMultiplier),
      masteryXp: Math.floor(GAME_CONSTANTS.BOSS_MASTERY_XP_BASE * floorMult * stats.masteryXpMultiplier),
      legacyXp: GAME_CONSTANTS.BOSS_LEGACY_XP_BASE * floorMult * stats.legacyXpMultiplier,
    };
  } else {
    return {
      gold: Math.floor(GAME_CONSTANTS.NORMAL_ENEMY_GOLD_BASE * floorMult * stats.goldMultiplier),
      masteryXp: Math.floor(GAME_CONSTANTS.NORMAL_ENEMY_MASTERY_XP_BASE * floorMult * stats.masteryXpMultiplier),
      legacyXp: GAME_CONSTANTS.NORMAL_ENEMY_LEGACY_XP_BASE * floorMult * stats.legacyXpMultiplier,
    };
  }
}

export function calculateMasteryLevel(masteryXp: number): number {
  return Math.floor(masteryXp / GAME_CONSTANTS.MASTERY_XP_PER_LEVEL) + 1;
}

export function calculateLegacyLevel(legacyXp: number): number {
  return Math.floor(legacyXp / GAME_CONSTANTS.LEGACY_XP_PER_LEVEL) + 1;
}

export function formatNumber(num: number, decimals: number = 1): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K';
  } else {
    return num.toFixed(decimals);
  }
}

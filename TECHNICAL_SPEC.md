# Weaponbound - POC Technical Specification

## 1. Project Overview

### 1.1 Objective
Build a browser-based incremental/idle game prototype to validate core mechanics. Focus on functionality over visual polish.

### 1.2 Technology Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Plain CSS or inline styles (simple colored boxes, minimal UI)
- **State Management**: React Context + useReducer
- **Persistence**: Browser localStorage
- **Target**: Desktop web browsers (Chrome/Firefox)

### 1.3 Out of Scope for POC
- Complex animations or graphics
- Mobile responsiveness
- Sound effects or music
- Multiple weapons beyond Dagger
- Multiple classes beyond Fighter
- Detailed visual themes

---

## 2. Project Structure

```
weaponbound/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── CombatView.tsx
│   │   ├── EnemyDisplay.tsx
│   │   ├── DPSPanel.tsx
│   │   ├── WeaponPanel.tsx
│   │   ├── LegacyPanel.tsx
│   │   ├── FighterPanel.tsx
│   │   ├── ResourceBars.tsx
│   │   └── Header.tsx
│   ├── context/
│   │   └── GameContext.tsx
│   ├── data/
│   │   ├── mastery-dagger.json
│   │   ├── legacy-tree.json
│   │   └── fighter-tree.json
│   ├── hooks/
│   │   └── useGameLoop.ts
│   ├── types/
│   │   └── game.types.ts
│   ├── utils/
│   │   ├── calculations.ts
│   │   ├── constants.ts
│   │   ├── storage.ts
│   │   └── gameLogic.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 3. Core Data Structures

### 3.1 TypeScript Types

```typescript
// types/game.types.ts

export interface GameState {
  // Run state
  currentFloor: number;
  isBossFloor: boolean;
  enemiesRemainingOnFloor: number;
  currentEnemyHp: number;
  maxEnemyHp: number;
  bossTimerRemaining: number | null; // seconds, null if not boss floor
  gold: number;
  
  // Weapon (single Dagger for POC)
  weapon: Weapon;
  
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
```

---

## 4. Game Constants

### 4.1 Balance Parameters

```typescript
// utils/constants.ts

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
  BASE_ENERGY_REGEN_PER_SECOND: 10,
  BASE_ENERGY_PER_CLICK: 15,
  
  // Weapon - Dagger base stats
  DAGGER_BASE_DAMAGE: 5,
  DAGGER_BASE_PASSIVE_DPS: 2,
  DAGGER_BASE_ATTACK_SPEED: 1,
  DAGGER_BASE_CRIT_CHANCE: 0,
  DAGGER_BASE_CRIT_MULTIPLIER: 1.5,
  
  // Weapon leveling (in-run)
  WEAPON_LEVEL_DAMAGE_INCREASE: 3,
  WEAPON_LEVEL_BASE_COST: 20,
  WEAPON_LEVEL_COST_MULTIPLIER: 1.15,
  WEAPON_MAX_RUN_LEVEL: 50,
  
  // Enemy scaling
  ENEMY_BASE_HP: 20,
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
  
  // Storage
  STORAGE_KEY: 'weaponbound-game-state',
  STORAGE_VERSION: 1,
};
```

---

## 5. Tree Data Files

### 5.1 Mastery Tree (Dagger)

```json
// data/mastery-dagger.json
{
  "treeId": "dagger-mastery",
  "weaponId": "dagger",
  "nodes": [
    {
      "id": "dagger_core_1",
      "name": "Sharpened Edge",
      "description": "+20% base damage for Dagger",
      "cost": 1,
      "parents": [],
      "effects": [
        { "type": "base_damage_mult", "value": 0.20 }
      ]
    },
    {
      "id": "dagger_core_2",
      "name": "Balanced Grip",
      "description": "+10% Passive DPS, +10% Active DPS",
      "cost": 1,
      "parents": ["dagger_core_1"],
      "effects": [
        { "type": "passive_dps_mult", "value": 0.10 },
        { "type": "active_dps_mult", "value": 0.10 }
      ]
    },
    {
      "id": "dagger_core_3",
      "name": "Reliable Strikes",
      "description": "+10% crit chance",
      "cost": 1,
      "parents": ["dagger_core_2"],
      "effects": [
        { "type": "crit_chance_add", "value": 0.10 }
      ]
    },
    {
      "id": "dagger_crit_1",
      "name": "Precise Cuts",
      "description": "+50% crit damage multiplier",
      "cost": 1,
      "parents": ["dagger_core_3"],
      "effects": [
        { "type": "crit_multiplier_add", "value": 0.50 }
      ]
    },
    {
      "id": "dagger_crit_2",
      "name": "First Blood",
      "description": "+30% damage to enemies above 80% HP",
      "cost": 1,
      "parents": ["dagger_crit_1"],
      "effects": [
        { "type": "high_hp_damage_mult", "value": 0.30, "target": "above_80_percent" }
      ]
    },
    {
      "id": "dagger_crit_keystone",
      "name": "Executioner's Focus",
      "description": "+50% damage to bosses, -10% damage to normal enemies",
      "cost": 2,
      "parents": ["dagger_crit_2"],
      "effects": [
        { "type": "boss_damage_mult", "value": 0.50 },
        { "type": "normal_enemy_damage_mult", "value": -0.10 }
      ]
    },
    {
      "id": "dagger_speed_1",
      "name": "Light Blade",
      "description": "+25% attack speed for Active hits, -10% energy cost per click",
      "cost": 1,
      "parents": ["dagger_core_3"],
      "effects": [
        { "type": "active_attack_speed_mult", "value": 0.25 },
        { "type": "energy_cost_mult", "value": -0.10 }
      ]
    },
    {
      "id": "dagger_speed_2",
      "name": "Flurry",
      "description": "+33% Passive DPS (extra hit every 3 seconds)",
      "cost": 1,
      "parents": ["dagger_speed_1"],
      "effects": [
        { "type": "passive_dps_mult", "value": 0.33 }
      ]
    },
    {
      "id": "dagger_speed_keystone",
      "name": "Overclocked Strikes",
      "description": "+40% total attack speed, +20% Active click Energy cost",
      "cost": 2,
      "parents": ["dagger_speed_2"],
      "effects": [
        { "type": "attack_speed_mult", "value": 0.40 },
        { "type": "energy_cost_mult", "value": 0.20 }
      ]
    },
    {
      "id": "dagger_util_1",
      "name": "Efficient Kill",
      "description": "+10% Gold gain from enemies killed with Dagger",
      "cost": 1,
      "parents": ["dagger_core_3"],
      "effects": [
        { "type": "gold_mult", "value": 0.10 }
      ]
    },
    {
      "id": "dagger_util_2",
      "name": "Weapon Insight",
      "description": "+25% Weapon Mastery XP from Dagger kills",
      "cost": 1,
      "parents": ["dagger_util_1"],
      "effects": [
        { "type": "mastery_xp_mult", "value": 0.25 }
      ]
    },
    {
      "id": "dagger_util_keystone",
      "name": "Master's Bond",
      "description": "Defeating a boss grants bonus Weapon Mastery XP and Legacy XP",
      "cost": 2,
      "parents": ["dagger_util_2"],
      "effects": [
        { "type": "boss_mastery_xp_bonus", "value": 20 },
        { "type": "boss_legacy_xp_bonus", "value": 10 }
      ]
    }
  ]
}
```

### 5.2 Legacy Tree

```json
// data/legacy-tree.json
{
  "treeId": "legacy",
  "nodes": [
    {
      "id": "legacy_trunk",
      "name": "First Legacy",
      "description": "+10% Legacy XP gain, +10% Weapon Mastery XP gain (global)",
      "cost": 1,
      "parents": [],
      "effects": [
        { "type": "legacy_xp_mult", "value": 0.10 },
        { "type": "mastery_xp_mult_global", "value": 0.10 }
      ]
    },
    {
      "id": "legacy_weapon_1",
      "name": "Armory Foundations",
      "description": "+1 maximum weapon slot in stable (future use)",
      "cost": 1,
      "parents": ["legacy_trunk"],
      "effects": [
        { "type": "weapon_slots", "value": 1 }
      ]
    },
    {
      "id": "legacy_weapon_2",
      "name": "Sharpened Traditions",
      "description": "Weapons gain +10% base damage",
      "cost": 1,
      "parents": ["legacy_weapon_1"],
      "effects": [
        { "type": "weapon_base_damage_mult", "value": 0.10 }
      ]
    },
    {
      "id": "legacy_weapon_3",
      "name": "Expanded Loadouts",
      "description": "Each weapon gains +1 Loadout slot (future use)",
      "cost": 1,
      "parents": ["legacy_weapon_2"],
      "effects": [
        { "type": "loadout_slots", "value": 1 }
      ]
    },
    {
      "id": "legacy_weapon_keystone",
      "name": "Quality Breakthrough",
      "description": "Unlocks Quality Rank 2 for Dagger (future use)",
      "cost": 2,
      "parents": ["legacy_weapon_3"],
      "effects": [
        { "type": "quality_cap", "value": 2 }
      ]
    },
    {
      "id": "legacy_class_1",
      "name": "Fighter's Foundation",
      "description": "Unlocks Tier 1 of Fighter run-tree (future use)",
      "cost": 1,
      "parents": ["legacy_trunk"],
      "effects": [
        { "type": "fighter_tier_unlock", "value": 1 }
      ]
    },
    {
      "id": "legacy_class_2",
      "name": "Veteran Fighter",
      "description": "+50% Fighter run XP gain (future use)",
      "cost": 1,
      "parents": ["legacy_class_1"],
      "effects": [
        { "type": "fighter_xp_mult", "value": 0.50 }
      ]
    },
    {
      "id": "legacy_class_keystone",
      "name": "Advanced Tactics",
      "description": "Unlocks Tier 2 of Fighter run-tree (future use)",
      "cost": 2,
      "parents": ["legacy_class_2"],
      "effects": [
        { "type": "fighter_tier_unlock", "value": 2 }
      ]
    },
    {
      "id": "legacy_qol_1",
      "name": "Basic Automation",
      "description": "+5% Passive DPS",
      "cost": 1,
      "parents": ["legacy_trunk"],
      "effects": [
        { "type": "passive_dps_mult_global", "value": 0.05 }
      ]
    },
    {
      "id": "legacy_qol_2",
      "name": "Efficient Energy",
      "description": "+20% Energy regeneration per second",
      "cost": 1,
      "parents": ["legacy_qol_1"],
      "effects": [
        { "type": "energy_regen_mult", "value": 0.20 }
      ]
    },
    {
      "id": "legacy_qol_keystone",
      "name": "Auto-Strike",
      "description": "Unlocks auto-clicker (future use)",
      "cost": 2,
      "parents": ["legacy_qol_2"],
      "effects": [
        { "type": "auto_clicker_unlock", "value": 1 }
      ]
    }
  ]
}
```

### 5.3 Fighter Tree (Stub)

```json
// data/fighter-tree.json
{
  "treeId": "fighter",
  "nodes": [
    {
      "id": "fighter_stub_1",
      "name": "Fighter Basics",
      "description": "Placeholder node for future Fighter tree",
      "cost": 1,
      "parents": [],
      "effects": [
        { "type": "placeholder", "value": 0 }
      ]
    }
  ]
}
```

---

## 6. Core Game Logic

### 6.1 Initialization

```typescript
// utils/gameLogic.ts

export function createInitialState(): GameState {
  return {
    currentFloor: 1,
    isBossFloor: false,
    enemiesRemainingOnFloor: GAME_CONSTANTS.ENEMIES_PER_FLOOR,
    currentEnemyHp: calculateEnemyHp(1, false),
    maxEnemyHp: calculateEnemyHp(1, false),
    bossTimerRemaining: null,
    gold: 0,
    
    weapon: {
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
    },
    
    legacyXp: 0,
    legacyLevel: 1,
    legacyPointsAvailable: 0,
    legacyAllocated: {},
    
    fighterRunPointsAvailable: 0,
    fighterRunAllocated: {},
    
    stats: calculateStats(/* will be properly calculated */),
    
    energy: GAME_CONSTANTS.STARTING_ENERGY,
    maxEnergy: GAME_CONSTANTS.BASE_MAX_ENERGY,
    energyRegenPerSecond: GAME_CONSTANTS.BASE_ENERGY_REGEN_PER_SECOND,
    energyPerClick: GAME_CONSTANTS.BASE_ENERGY_PER_CLICK,
    
    lastTickTime: Date.now(),
    isRunActive: true,
  };
}
```

### 6.2 Calculations

```typescript
// utils/calculations.ts

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

export function calculateStats(state: GameState, trees: TreeData): CombatStats {
  // Start with base values
  let baseDamage = GAME_CONSTANTS.DAGGER_BASE_DAMAGE;
  let passiveDps = GAME_CONSTANTS.DAGGER_BASE_PASSIVE_DPS;
  let activeDps = 0;
  let critChance = GAME_CONSTANTS.DAGGER_BASE_CRIT_CHANCE;
  let critMultiplier = GAME_CONSTANTS.DAGGER_BASE_CRIT_MULTIPLIER;
  let attackSpeed = GAME_CONSTANTS.DAGGER_BASE_ATTACK_SPEED;
  let goldMultiplier = 1.0;
  let masteryXpMultiplier = 1.0;
  let legacyXpMultiplier = 1.0;
  
  // Apply weapon run levels
  baseDamage += (state.weapon.runLevel - 1) * GAME_CONSTANTS.WEAPON_LEVEL_DAMAGE_INCREASE;
  
  // Apply mastery tree effects
  const masteryEffects = getActiveEffects(state.weapon.masteryAllocated, trees.masteryTree);
  applyEffects(masteryEffects, /* modify stats */);
  
  // Apply legacy tree effects
  const legacyEffects = getActiveEffects(state.legacyAllocated, trees.legacyTree);
  applyEffects(legacyEffects, /* modify stats */);
  
  // Calculate final DPS values
  passiveDps = baseDamage * passiveDps; // simplified
  activeDps = baseDamage * attackSpeed; // damage per click
  
  return {
    totalDps: passiveDps + (activeDps * 0.5), // estimate assuming some clicking
    passiveDps,
    activeDps,
    baseDamage,
    critChance,
    critMultiplier,
    attackSpeed,
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
```

### 6.3 Game Loop

```typescript
// hooks/useGameLoop.ts

export function useGameLoop(state: GameState, dispatch: React.Dispatch<GameAction>) {
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - state.lastTickTime;
      const deltaSec = deltaMs / 1000;
      
      dispatch({ 
        type: 'GAME_TICK', 
        payload: { deltaMs, deltaSec, now } 
      });
    }, GAME_CONSTANTS.TICK_INTERVAL_MS);
    
    return () => clearInterval(interval);
  }, [state.lastTickTime]);
}

// In reducer, handle GAME_TICK:
case 'GAME_TICK': {
  const { deltaSec, now } = action.payload;
  let newState = { ...state, lastTickTime: now };
  
  // 1. Regenerate energy
  newState.energy = Math.min(
    newState.maxEnergy,
    newState.energy + newState.energyRegenPerSecond * deltaSec
  );
  
  // 2. Apply passive DPS
  const damage = newState.stats.passiveDps * deltaSec;
  newState.currentEnemyHp -= damage;
  
  // 3. Check for enemy death
  if (newState.currentEnemyHp <= 0) {
    newState = handleEnemyDeath(newState);
  }
  
  // 4. Update boss timer if on boss floor
  if (newState.isBossFloor && newState.bossTimerRemaining !== null) {
    newState.bossTimerRemaining -= deltaSec;
    
    if (newState.bossTimerRemaining <= 0 && newState.currentEnemyHp > 0) {
      newState = handleBossFailure(newState);
    }
  }
  
  return newState;
}
```

---

## 7. UI Specification

### 7.1 Visual Style Guide

**Simple, functional design using:**
- Solid color backgrounds for panels (`#f0f0f0`, `#e0e0e0`, etc.)
- Border-radius: 8px for cards/panels
- Padding: 16px standard
- Font: System sans-serif
- Color palette:
  - Primary: `#4a90e2` (blue)
  - Success: `#7ed321` (green)
  - Warning: `#f5a623` (orange)
  - Danger: `#d0021b` (red)
  - Neutral: `#9b9b9b` (gray)
  - Background: `#ffffff` (white)
  - Panel BG: `#f5f5f5` (light gray)

**Progress bars:**
- Container: gray background, 4px height, rounded
- Fill: colored bar based on resource type
- Text overlay showing current/max values

**Buttons:**
- Rectangle with rounded corners
- Padding: 12px 24px
- Hover state: slightly darker
- Disabled state: gray with 0.5 opacity

### 7.2 Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ HEADER                                              │
│ Floor 7 | Boss - 23.5s | Gold: 1,234 | XP bars     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐    ┌────────────────────┐   │
│  │  ENEMY DISPLAY   │    │   DPS PANEL        │   │
│  │                  │    │                    │   │
│  │  ┌────────────┐  │    │  Total: 125.3 DPS │   │
│  │  │ Enemy Icon │  │    │  Passive: 80.0    │   │
│  │  └────────────┘  │    │  Active: 45.3     │   │
│  │                  │    │                    │   │
│  │  Boss Dummy      │    └────────────────────┘   │
│  │  [======= 70%]   │                             │
│  │  700 / 1000 HP   │                             │
│  └──────────────────┘                             │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │         [  ATTACK  ]  (large button)         │  │
│  │         Energy: [======== 75%]               │  │
│  │         75 / 100                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌────────┬────────┬─────────────────┐            │
│  │ Weapon │ Legacy │ Fighter (stub)  │            │
│  └────────┴────────┴─────────────────┘            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 7.3 Component Specifications

#### Header Component
```tsx
// Displays current game state at top of screen
- Current Floor number (large, bold)
- Boss indicator and timer (if boss floor)
- Gold amount
- Weapon Mastery XP progress bar
- Legacy XP progress bar
- Reset button (top right corner)
```

#### Enemy Display Component
```tsx
// Shows current enemy
- Enemy name (text)
- Simple visual representation (colored square or circle)
  - Normal enemy: blue circle
  - Boss: red square (larger)
- HP bar (colored fill, percentage, numbers)
- Boss timer bar (if applicable, red/orange)
```

#### DPS Panel Component
```tsx
// Shows damage output stats
- Total DPS (large number)
- Passive DPS breakdown
- Active DPS breakdown
- Simple labels and numbers, no charts
```

#### Attack Button Component
```tsx
// Large clickable button
- Width: 80% of container
- Height: 60px
- Text: "ATTACK" or "CLICK"
- On click: attempt active attack if energy sufficient
- Visual feedback: brief color change on click
```

#### Energy Bar Component
```tsx
// Shows energy resource
- Label: "Energy"
- Progress bar (blue fill)
- Text: "{current} / {max}"
- Red tint when < 20%
```

#### Weapon Panel (Modal/Overlay)
```tsx
// Triggered by "Weapon" tab button
- Title: "Dagger"
- Section: Run Stats
  - Current run level
  - Base damage
  - Gold: {amount}
  - Button: "Level Weapon" (cost: {gold})
- Section: Mastery
  - Mastery XP bar
  - Mastery Level
  - Mastery Points Available: {points}
- Section: Mastery Tree
  - Render tree nodes as simple boxes/buttons
  - Grid or vertical list layout
  - Each node:
    - Name (bold)
    - Description (small text)
    - Cost (if not allocated)
    - Status: Available/Locked/Allocated
    - Click to allocate (if available and points exist)
  - Visual: gray box if locked, blue if available, green if allocated
  - Show parent connections with simple lines or indentation
```

#### Legacy Panel (Modal/Overlay)
```tsx
// Triggered by "Legacy" tab button
- Title: "Legacy"
- Legacy Level and XP bar
- Legacy Points Available: {points}
- Legacy Tree (same rendering as Mastery tree)
  - Nodes shown as boxes
  - Three main branches visible
```

#### Fighter Panel (Modal/Overlay)
```tsx
// Stub for POC
- Title: "Fighter (Coming Soon)"
- Simple text: "Fighter run tree will be available in future update"
```

### 7.4 Tree Node Rendering

```tsx
// For both Mastery and Legacy trees

interface TreeNodeVisualProps {
  node: TreeNode;
  isAllocated: boolean;
  isAvailable: boolean; // parents allocated and points available
  pointsAvailable: number;
  onAllocate: (nodeId: string) => void;
}

// Visual states:
// - ALLOCATED: Green background, checkmark icon
// - AVAILABLE: Blue background, can click to allocate
// - LOCKED (missing parents): Gray background, disabled
// - INSUFFICIENT_POINTS: Orange background, show cost in red

// Layout: Simple grid or vertical list with indentation
// Parent connections: Indent child nodes or draw simple lines
```

---

## 8. Game Actions and State Management

### 8.1 Actions

```typescript
// Game actions for reducer

type GameAction =
  | { type: 'GAME_TICK'; payload: { deltaMs: number; deltaSec: number; now: number } }
  | { type: 'ACTIVE_ATTACK' }
  | { type: 'LEVEL_WEAPON' }
  | { type: 'ALLOCATE_MASTERY_NODE'; payload: { nodeId: string } }
  | { type: 'ALLOCATE_LEGACY_NODE'; payload: { nodeId: string } }
  | { type: 'END_RUN' }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_GAME'; payload: GameState };
```

### 8.2 Key Action Handlers

```typescript
case 'ACTIVE_ATTACK': {
  if (state.energy >= state.energyPerClick) {
    const damage = state.stats.activeDps;
    return {
      ...state,
      energy: state.energy - state.energyPerClick,
      currentEnemyHp: state.currentEnemyHp - damage,
    };
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
    newState.stats = calculateStats(newState);
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
    newState.stats = calculateStats(newState);
    return newState;
  }
  return state;
}

function handleEnemyDeath(state: GameState): GameState {
  const rewards = calculateRewards(state.currentFloor, state.isBossFloor, state.stats);
  
  let newState = {
    ...state,
    gold: state.gold + rewards.gold,
  };
  
  // Add weapon mastery XP
  newState.weapon = addMasteryXp(newState.weapon, rewards.masteryXp);
  
  // Add legacy XP
  newState = addLegacyXp(newState, rewards.legacyXp);
  
  // Check if more enemies remain on floor
  if (state.enemiesRemainingOnFloor > 1) {
    newState.enemiesRemainingOnFloor -= 1;
    newState.currentEnemyHp = state.maxEnemyHp; // respawn with full HP
  } else {
    // Floor complete, advance to next floor
    newState = advanceFloor(newState);
  }
  
  return newState;
}

function advanceFloor(state: GameState): GameState {
  const nextFloor = state.currentFloor + 1;
  const isBoss = nextFloor % GAME_CONSTANTS.BOSS_FLOOR_INTERVAL === 0;
  const enemyHp = calculateEnemyHp(nextFloor, isBoss);
  
  return {
    ...state,
    currentFloor: nextFloor,
    isBossFloor: isBoss,
    enemiesRemainingOnFloor: isBoss ? 1 : GAME_CONSTANTS.ENEMIES_PER_FLOOR,
    currentEnemyHp: enemyHp,
    maxEnemyHp: enemyHp,
    bossTimerRemaining: isBoss ? GAME_CONSTANTS.BOSS_TIMER_SECONDS : null,
  };
}

function handleBossFailure(state: GameState): GameState {
  // Move back to previous non-boss floor
  const previousFloor = state.currentFloor - 1;
  const enemyHp = calculateEnemyHp(previousFloor, false);
  
  return {
    ...state,
    currentFloor: previousFloor,
    isBossFloor: false,
    enemiesRemainingOnFloor: GAME_CONSTANTS.ENEMIES_PER_FLOOR,
    currentEnemyHp: enemyHp,
    maxEnemyHp: enemyHp,
    bossTimerRemaining: null,
  };
}
```

---

## 9. Persistence

### 9.1 Save/Load

```typescript
// utils/storage.ts

export function saveGame(state: GameState): void {
  try {
    const saveData = {
      version: GAME_CONSTANTS.STORAGE_VERSION,
      timestamp: Date.now(),
      state: state,
    };
    localStorage.setItem(GAME_CONSTANTS.STORAGE_KEY, JSON.stringify(saveData));
  } catch (error) {
    console.error('Failed to save game:', error);
  }
}

export function loadGame(): GameState | null {
  try {
    const saved = localStorage.getItem(GAME_CONSTANTS.STORAGE_KEY);
    if (!saved) return null;
    
    const saveData = JSON.parse(saved);
    
    // Version check
    if (saveData.version !== GAME_CONSTANTS.STORAGE_VERSION) {
      console.warn('Save version mismatch, resetting');
      return null;
    }
    
    return saveData.state;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
}

export function resetGame(): void {
  localStorage.removeItem(GAME_CONSTANTS.STORAGE_KEY);
}

// Auto-save every 5 seconds
export function useAutoSave(state: GameState) {
  useEffect(() => {
    const interval = setInterval(() => {
      saveGame(state);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [state]);
}
```

### 9.2 Reset Functionality

```tsx
// Add prominent reset button
<button 
  onClick={() => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      resetGame();
      window.location.reload();
    }
  }}
  style={{
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '8px 16px',
    backgroundColor: '#d0021b',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  }}
>
  Reset Game
</button>
```

---

## 10. Implementation Checklist

### Phase 1: Foundation
- [ ] Set up Vite + React + TypeScript project
- [ ] Create basic project structure
- [ ] Implement type definitions
- [ ] Create constants file
- [ ] Set up tree data JSON files

### Phase 2: Core Game Logic
- [ ] Implement state initialization
- [ ] Create calculation utilities
- [ ] Build game reducer with all actions
- [ ] Implement game loop hook
- [ ] Add persistence layer (save/load/reset)

### Phase 3: UI Components
- [ ] Header component
- [ ] Enemy display component
- [ ] DPS panel component
- [ ] Attack button + energy bar
- [ ] Tab navigation
- [ ] Weapon panel with tree
- [ ] Legacy panel with tree
- [ ] Fighter stub panel

### Phase 4: Integration
- [ ] Wire up game context
- [ ] Connect components to state
- [ ] Implement tree node allocation logic
- [ ] Add effect application system
- [ ] Test full game loop

### Phase 5: Polish
- [ ] Add basic styling
- [ ] Improve visual feedback
- [ ] Add number formatting
- [ ] Test edge cases
- [ ] Balance tuning

---

## 11. Testing Checklist

### Gameplay Flow
- [ ] Can start game from floor 1
- [ ] Enemies die when HP reaches 0
- [ ] Floor advances after all enemies killed
- [ ] Boss appears every 5 floors
- [ ] Boss timer counts down correctly
- [ ] Boss failure drops to previous floor
- [ ] Gold is awarded correctly
- [ ] XP is awarded correctly

### Progression
- [ ] Can level weapon with gold
- [ ] Weapon level increases damage
- [ ] Mastery XP accumulates
- [ ] Mastery levels grant points
- [ ] Legacy XP accumulates
- [ ] Legacy levels grant points

### Trees
- [ ] Can allocate mastery nodes
- [ ] Parent requirements work
- [ ] Point costs deduct correctly
- [ ] Effects apply to stats
- [ ] Can allocate legacy nodes
- [ ] Legacy effects work globally

### Persistence
- [ ] Game saves automatically
- [ ] Can reload and continue
- [ ] Reset button works
- [ ] No data corruption

### UI
- [ ] All panels render correctly
- [ ] Numbers format nicely
- [ ] Progress bars update
- [ ] Buttons respond to clicks
- [ ] Modals open/close

---

## 12. Known Limitations (POC)

1. **Single weapon only** - Dagger is hardcoded
2. **No class diversity** - Fighter is stub only
3. **Simple combat** - No hero HP, no complex mechanics
4. **Basic visuals** - Colored boxes, no animations
5. **No sound** - Audio not implemented
6. **Desktop only** - Not mobile responsive
7. **No achievements** - Milestone system not included
8. **Limited automation** - Auto-clicker is stub
9. **No biome variety** - All floors are cosmetically identical
10. **Simple math** - No crit rolls, simplified damage calculations

---

## 13. Future Enhancements (Post-POC)

1. Add visual assets (sprites, icons, animations)
2. Implement additional weapons (Sword, Broadsword)
3. Build out Fighter tree fully
4. Add biome system with resistances
5. Implement NG+ mechanics
6. Add achievement/milestone system
7. Create auto-clicker functionality
8. Add sound effects and music
9. Improve mobile support
10. Add data export/import

---

## 14. Development Notes

### Code Style
- Use TypeScript strict mode
- Prefer functional components
- Use meaningful variable names
- Add comments for complex calculations
- Keep components small and focused

### Performance
- Avoid unnecessary re-renders (use React.memo where appropriate)
- Keep tick interval at 250ms for smooth gameplay
- Debounce localStorage saves
- Cache calculated stats when possible

### Debugging
- Add console logs for key events (enemy death, level up, etc.)
- Include state inspection in dev tools
- Add error boundaries for component crashes
- Log tree effect applications for verification

---

## End of Specification

This document should provide all necessary information to build the Weaponbound POC. Focus on getting the core loop working first, then layer in the progression systems, and finally polish the UI.

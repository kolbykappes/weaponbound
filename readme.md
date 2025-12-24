# Weaponbound

A browser-based incremental RPG where weapons are the real characters. Build your arsenal, master combat techniques, and progress through increasingly challenging floors in this weapon-centric idle game.

## Overview

Weaponbound is an incremental/idle game built around a unique progression philosophy: your hero is merely a vessel—true power and identity come from the weapons you wield and master over time. Players progress through a linear sequence of floors, fighting enemies and bosses while developing their weapons through multiple interconnected progression systems.

### Core Features

- **Weapon-Centric Progression**: Each weapon has its own permanent mastery system, skill trees, and multiple loadouts
- **Multi-Layered Meta Progression**: Four distinct resource systems (Gold, Weapon Mastery, Legacy, Energy) that work together to create meaningful short and long-term advancement
- **Roguelite Elements**: Campaign runs with permanent meta progression that unlocks new strategic options
- **Active + Idle Gameplay**: Balance between active clicking and passive DPS with an energy management system
- **New Game Plus**: Post-campaign content with increased difficulty, new biomes, and expanded progression trees

## Tech Stack

- **Framework**: React 18+
- **Language**: TypeScript
- **State Management**: React Context/Hooks
- **Persistence**: Browser localStorage
- **Build Tool**: Vite (recommended) or Create React App
- **Styling**: TBD (Tailwind CSS or styled-components recommended)

## Project Status

🚧 **Early Prototype Phase** 🚧

Current implementation focuses on:
- Single class (Fighter)
- Single weapon (Dagger)
- Core combat loop and floor progression
- Basic UI for combat and progression systems
- Resource system foundations

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd weaponbound

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
npm run build
```

## Project Structure

```
weaponbound/
├── src/
│   ├── components/     # React components
│   ├── data/          # Game data and configuration
│   │   ├── mastery-dagger.json
│   │   ├── legacy-tree.json
│   │   └── fighter-tree.json
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Helper functions and game logic
│   └── App.tsx        # Main application component
├── public/            # Static assets
└── README.md
```

## Game Systems (High Level)

### Progression Resources

- **Gold**: In-run currency for immediate weapon power upgrades
- **Weapon Mastery**: Per-weapon XP that unlocks permanent skill nodes
- **Legacy**: Account-wide meta progression that unlocks classes, weapon types, and system expansions
- **Energy**: Regenerating resource that gates active combat abilities

### Run Structure

Players progress through numbered floors, facing standard enemies and bosses every 5 floors. Failed boss attempts end the run but preserve all earned meta progression. The game is designed for 3-5 hour initial campaign completion with extensive New Game Plus content.

## Development Roadmap

### Phase 1: Core Prototype (Current)
- ✅ Basic combat loop
- ✅ Floor and boss progression
- ✅ Resource system foundations
- 🔄 UI implementation
- 🔄 Data-driven skill trees

### Phase 2: Content Expansion
- Multiple weapon types (Sword, Broadsword)
- Additional classes beyond Fighter
- Biome variety and resistance mechanics
- Expanded skill trees

### Phase 3: Polish & Balance
- Visual and audio polish
- Balance tuning across all systems
- New Game Plus mechanics
- Achievement/milestone system

## Configuration & Tuning

Game balance parameters are centralized in configuration files for easy tuning:
- Enemy scaling curves
- Resource acquisition rates
- Weapon damage formulas
- Boss timers and difficulty

See `/src/data/` and configuration constants for adjustment points.

## Contributing

This project is currently in early development. Contribution guidelines will be established as the project matures.

## License

[License TBD]

---

**Note**: This is a prototype in active development. Features, balance, and systems are subject to significant change.

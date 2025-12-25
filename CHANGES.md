# Changelog

All notable changes to Weaponbound will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2024-12-24

### Added
- Version number display in UI header
- Enemies remaining counter in header
- Slide-out settings panel for real-time game balance tuning
- Adjustable enemy HP multiplier in settings
- Adjustable boss HP multiplier in settings
- "Weaponbound" title branding in header
- Max weapon level indicator in Weapon panel

### Changed
- Consolidated attack button and DPS panel for better space utilization
- Moved gold display from header to Weapon panel
- Weapon panel now shows as default view on initial load
- Improved weapon level up button with disabled state when unaffordable
- Reorganized header layout for better information hierarchy
- Moved reset game button to settings panel

### Fixed
- UI spacing issues with attack button taking too much vertical space
- Weapon level up button now properly disables based on gold availability

## [0.1.0] - 2024-12-24

### Added
- Initial game implementation
- Floor-based progression system with bosses every 5 floors
- Dual combat system (active clicking + passive DPS)
- Energy management system for active attacks
- Multi-layered progression (Gold, Weapon Mastery, Legacy)
- Dagger mastery skill tree with 12 nodes across 3 paths
- Legacy skill tree with 11 nodes for account-wide progression
- Dynamic skill node unlocking based on parent requirements
- Game state management with React Context
- Auto-save to localStorage every 5 seconds
- Enemy HP scaling by floor (1.20x multiplier)
- Boss fights with 30-second timer and 5x HP multiplier
- Weapon leveling system with gold (1.15x cost scaling)
- XP-based mastery and legacy progression
- Combat stat calculation from skill tree effects
- Responsive UI with tabbed navigation
- Interactive skill tree visualization
- Vercel deployment configuration
- TypeScript strict mode compliance

### Technical
- React 18 + TypeScript + Vite setup
- Game loop with 250ms tick rate
- Browser localStorage persistence
- Comprehensive type definitions
- Modular component architecture
- JSON-based skill tree data

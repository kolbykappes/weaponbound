// components/Header.tsx

import { useGame } from '../context/GameContext';
import { GAME_CONSTANTS, APP_VERSION } from '../utils/constants';

export function Header() {
  const { state } = useGame();

  const masteryXpProgress = (state.weapon.masteryXp % GAME_CONSTANTS.MASTERY_XP_PER_LEVEL) / GAME_CONSTANTS.MASTERY_XP_PER_LEVEL * 100;
  const legacyXpProgress = (state.legacyXp % GAME_CONSTANTS.LEGACY_XP_PER_LEVEL) / GAME_CONSTANTS.LEGACY_XP_PER_LEVEL * 100;

  return (
    <div className="header">
      <div className="header-left">
        <div className="title-section">
          <h1 className="game-title">Weaponbound</h1>
          <span className="version">v{APP_VERSION}</span>
        </div>
        <div className="floor-display">
          Floor {state.currentFloor}
          {state.isBossFloor && (
            <span className="boss-indicator"> - BOSS</span>
          )}
          {state.isBossFloor && state.bossTimerRemaining !== null && (
            <span className="boss-timer"> ({Math.max(0, state.bossTimerRemaining).toFixed(1)}s)</span>
          )}
        </div>
        {!state.isBossFloor && state.enemiesRemainingOnFloor > 0 && (
          <div className="enemies-remaining">
            Enemies: {state.enemiesRemainingOnFloor} / {GAME_CONSTANTS.ENEMIES_PER_FLOOR}
          </div>
        )}
      </div>

      <div className="header-right">
        <div className="xp-bars">
          <div className="xp-bar">
            <div className="xp-label">Mastery Lv.{state.weapon.masteryLevel} ({state.weapon.masteryPointsAvailable} pts)</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${masteryXpProgress}%`, backgroundColor: '#4a90e2' }}></div>
            </div>
          </div>
          <div className="xp-bar">
            <div className="xp-label">Legacy Lv.{state.legacyLevel} ({state.legacyPointsAvailable} pts)</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${legacyXpProgress}%`, backgroundColor: '#7ed321' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

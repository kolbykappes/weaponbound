// components/Header.tsx

import { useGame } from '../context/GameContext';
import { GAME_CONSTANTS } from '../utils/constants';
import { resetGame } from '../utils/storage';

export function Header() {
  const { state } = useGame();

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      resetGame();
      window.location.reload();
    }
  };

  const masteryXpProgress = (state.weapon.masteryXp % GAME_CONSTANTS.MASTERY_XP_PER_LEVEL) / GAME_CONSTANTS.MASTERY_XP_PER_LEVEL * 100;
  const legacyXpProgress = (state.legacyXp % GAME_CONSTANTS.LEGACY_XP_PER_LEVEL) / GAME_CONSTANTS.LEGACY_XP_PER_LEVEL * 100;

  return (
    <div className="header">
      <div className="header-left">
        <div className="floor-display">
          Floor {state.currentFloor}
          {state.isBossFloor && (
            <span className="boss-indicator"> - BOSS</span>
          )}
          {state.isBossFloor && state.bossTimerRemaining !== null && (
            <span className="boss-timer"> ({Math.max(0, state.bossTimerRemaining).toFixed(1)}s)</span>
          )}
        </div>
        <div className="gold-display">
          Gold: {Math.floor(state.gold).toLocaleString()}
        </div>
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
        <button className="reset-button" onClick={handleReset}>
          Reset Game
        </button>
      </div>
    </div>
  );
}

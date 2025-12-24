// components/EnemyDisplay.tsx

import { useGame } from '../context/GameContext';
import { getEnemyName } from '../utils/gameLogic';
import { GAME_CONSTANTS } from '../utils/constants';

export function EnemyDisplay() {
  const { state } = useGame();

  const hpPercent = (state.currentEnemyHp / state.maxEnemyHp) * 100;
  const enemyName = getEnemyName(state.currentFloor, state.isBossFloor);

  return (
    <div className="enemy-display">
      <div className={`enemy-icon ${state.isBossFloor ? 'boss' : 'normal'}`}>
        {state.isBossFloor ? '👹' : '🎯'}
      </div>
      <div className="enemy-info">
        <div className="enemy-name">{enemyName}</div>
        <div className="enemy-hp-bar">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.max(0, hpPercent)}%`,
                backgroundColor: state.isBossFloor ? '#d0021b' : '#4a90e2'
              }}
            ></div>
          </div>
          <div className="hp-text">
            {Math.max(0, Math.floor(state.currentEnemyHp)).toLocaleString()} / {Math.floor(state.maxEnemyHp).toLocaleString()} HP
          </div>
        </div>
        {state.isBossFloor && state.bossTimerRemaining !== null && (
          <div className="boss-timer-bar">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(state.bossTimerRemaining / GAME_CONSTANTS.BOSS_TIMER_SECONDS) * 100}%`,
                  backgroundColor: '#f5a623'
                }}
              ></div>
            </div>
          </div>
        )}
        {state.enemiesRemainingOnFloor > 1 && (
          <div className="enemies-remaining">
            Enemies remaining: {state.enemiesRemainingOnFloor}
          </div>
        )}
      </div>
    </div>
  );
}

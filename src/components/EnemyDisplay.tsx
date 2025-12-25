// components/EnemyDisplay.tsx

import { useGame } from '../context/GameContext';
import { getEnemyName } from '../utils/gameLogic';
import { GAME_CONSTANTS } from '../utils/constants';
import { Enemy } from '../types/game.types';

export function EnemyDisplay() {
  const { state } = useGame();

  if (state.enemyQueue.length === 0) {
    return (
      <div className="enemy-display">
        <div className="enemy-info">
          <div className="enemy-name">No enemies</div>
        </div>
      </div>
    );
  }

  const frontEnemy = state.enemyQueue[0]!;
  const queuedEnemies = state.enemyQueue.slice(1);

  return (
    <div className="enemy-display">
      <div className="front-enemy">
        <EnemyCard enemy={frontEnemy} isFront={true} floor={state.currentFloor} />
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
      </div>

      {queuedEnemies.length > 0 && (
        <div className="enemy-queue">
          {queuedEnemies.map((enemy) => (
            <EnemyCard key={enemy.id} enemy={enemy} isFront={false} floor={state.currentFloor} />
          ))}
        </div>
      )}
    </div>
  );
}

function EnemyCard({ enemy, isFront, floor }: { enemy: Enemy; isFront: boolean; floor: number }) {
  const hpPercent = (enemy.hp / enemy.maxHp) * 100;
  const enemyName = getEnemyName(floor, enemy.isBoss);

  return (
    <div className={`enemy-card ${isFront ? 'front' : 'queued'} ${enemy.isBoss ? 'boss' : 'normal'}`}>
      <div className={`enemy-icon ${enemy.isBoss ? 'boss' : 'normal'}`}>
        {enemy.isBoss ? '👹' : '🎯'}
      </div>
      <div className="enemy-info">
        <div className="enemy-name">{enemyName}</div>
        <div className="enemy-hp-bar">
          <div className="progress-bar-rtl">
            <div
              className="progress-fill-red"
              style={{
                width: `${Math.max(0, hpPercent)}%`,
              }}
            ></div>
          </div>
          <div className="hp-text">
            {Math.max(0, Math.floor(enemy.hp)).toLocaleString()} / {Math.floor(enemy.maxHp).toLocaleString()} HP
          </div>
        </div>
      </div>
    </div>
  );
}

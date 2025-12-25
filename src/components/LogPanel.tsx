// components/LogPanel.tsx

import { useGame } from '../context/GameContext';

export function LogPanel() {
  const { state } = useGame();

  const getLogColor = (type: string) => {
    switch (type) {
      case 'damage':
        return '#d0021b';
      case 'kill':
        return '#7ed321';
      case 'gold':
        return '#f5a623';
      case 'floor':
        return '#4a90e2';
      case 'level':
        return '#9013fe';
      case 'spawn':
        return '#666';
      default:
        return '#333';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="log-panel">
      <h3>Game Log</h3>
      <div className="log-stats">
        <div className="stat-item">
          <span className="stat-label">Total DPS:</span>
          <span className="stat-value">{state.stats.totalDps.toFixed(1)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Base Damage:</span>
          <span className="stat-value">{state.stats.baseDamage.toFixed(1)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Energy Regen:</span>
          <span className="stat-value">{state.energyRegenPerSecond}/s</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Swing Timer:</span>
          <span className="stat-value">{state.swingTimer.toFixed(2)}s</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Spawn Timer:</span>
          <span className="stat-value">{state.nextEnemySpawnTimer.toFixed(2)}s</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Queue Size:</span>
          <span className="stat-value">{state.enemyQueue.length}/10</span>
        </div>
      </div>

      <div className="log-entries">
        {state.gameLog.length === 0 ? (
          <div className="log-entry-empty">No events yet</div>
        ) : (
          state.gameLog.map((entry) => (
            <div key={entry.id} className="log-entry">
              <span className="log-time">{formatTime(entry.timestamp)}</span>
              <span
                className="log-type"
                style={{ color: getLogColor(entry.type) }}
              >
                [{entry.type.toUpperCase()}]
              </span>
              <span className="log-message">{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

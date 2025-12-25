// components/SettingsPanel.tsx

import { resetGame } from '../utils/storage';
import { LogPanel } from './LogPanel';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  enemyHpMult: number;
  bossHpMult: number;
  enemySpawnInterval: number;
  onEnemyHpMultChange: (value: number) => void;
  onBossHpMultChange: (value: number) => void;
  onEnemySpawnIntervalChange: (value: number) => void;
}

export function SettingsPanel({
  isOpen,
  onClose,
  enemyHpMult,
  bossHpMult,
  enemySpawnInterval,
  onEnemyHpMultChange,
  onBossHpMultChange,
  onEnemySpawnIntervalChange,
}: SettingsPanelProps) {
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      resetGame();
      window.location.reload();
    }
  };

  return (
    <>
      {isOpen && <div className="settings-overlay" onClick={onClose}></div>}
      <div className={`settings-panel ${isOpen ? 'open' : ''}`}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <LogPanel />
          </div>

          <div className="settings-section">
            <h3>Game Balance</h3>

            <div className="setting-item">
              <label>Enemy HP Multiplier: {enemyHpMult.toFixed(2)}x</label>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.05"
                value={enemyHpMult}
                onChange={(e) => onEnemyHpMultChange(parseFloat(e.target.value))}
              />
              <div className="slider-labels">
                <span>1.00x</span>
                <span>2.00x</span>
              </div>
            </div>

            <div className="setting-item">
              <label>Boss HP Multiplier: {bossHpMult.toFixed(1)}x</label>
              <input
                type="range"
                min="2"
                max="10"
                step="0.5"
                value={bossHpMult}
                onChange={(e) => onBossHpMultChange(parseFloat(e.target.value))}
              />
              <div className="slider-labels">
                <span>2x</span>
                <span>10x</span>
              </div>
            </div>

            <div className="setting-item">
              <label>Enemy Spawn Interval: {enemySpawnInterval.toFixed(1)}s</label>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={enemySpawnInterval}
                onChange={(e) => onEnemySpawnIntervalChange(parseFloat(e.target.value))}
              />
              <div className="slider-labels">
                <span>0.5s</span>
                <span>5.0s</span>
              </div>
            </div>

            <p className="setting-note">
              Note: Changes apply to newly spawned enemies. Current enemy HP is not affected.
            </p>
          </div>

          <div className="settings-section">
            <h3>Danger Zone</h3>
            <button className="reset-button-settings" onClick={handleReset}>
              Reset Game
            </button>
            <p className="setting-note">
              This will erase all progress including mastery, legacy, and current run data.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export function SettingsToggleButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="settings-toggle" onClick={onClick} title="Settings">
      ⚙️
    </button>
  );
}

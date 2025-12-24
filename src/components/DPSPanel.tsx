// components/DPSPanel.tsx

import { useGame } from '../context/GameContext';
import { formatNumber } from '../utils/calculations';

export function DPSPanel() {
  const { state } = useGame();

  return (
    <div className="dps-panel">
      <h3>Damage Output</h3>
      <div className="stat-row">
        <span className="stat-label">Total DPS:</span>
        <span className="stat-value">{formatNumber(state.stats.totalDps)}</span>
      </div>
      <div className="stat-row">
        <span className="stat-label">Passive DPS:</span>
        <span className="stat-value">{formatNumber(state.stats.passiveDps)}</span>
      </div>
      <div className="stat-row">
        <span className="stat-label">Active DPS:</span>
        <span className="stat-value">{formatNumber(state.stats.activeDps)}</span>
      </div>
      <div className="stat-row">
        <span className="stat-label">Base Damage:</span>
        <span className="stat-value">{formatNumber(state.stats.baseDamage)}</span>
      </div>
    </div>
  );
}

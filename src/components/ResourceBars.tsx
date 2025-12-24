// components/ResourceBars.tsx

import { useGame } from '../context/GameContext';

export function ResourceBars() {
  const { state } = useGame();

  const energyPercent = (state.energy / state.maxEnergy) * 100;

  return (
    <div className="resource-bars">
      <div className="resource-bar">
        <div className="resource-label">Energy</div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${energyPercent}%`,
              backgroundColor: energyPercent < 20 ? '#d0021b' : '#4a90e2'
            }}
          ></div>
        </div>
        <div className="resource-text">
          {Math.floor(state.energy)} / {state.maxEnergy}
        </div>
      </div>
    </div>
  );
}

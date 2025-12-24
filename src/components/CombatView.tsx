// components/CombatView.tsx

import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { EnemyDisplay } from './EnemyDisplay';
import { DPSPanel } from './DPSPanel';
import { ResourceBars } from './ResourceBars';
import { WeaponPanel } from './WeaponPanel';
import { LegacyPanel } from './LegacyPanel';
import { FighterPanel } from './FighterPanel';

export function CombatView() {
  const { state, dispatch } = useGame();
  const [activePanel, setActivePanel] = useState<'none' | 'weapon' | 'legacy' | 'fighter'>('none');

  const handleAttack = () => {
    dispatch({ type: 'ACTIVE_ATTACK' });
  };

  const canAttack = state.energy >= state.energyPerClick;

  return (
    <div className="combat-view">
      <div className="combat-area">
        <div className="combat-row">
          <EnemyDisplay />
          <DPSPanel />
        </div>

        <div className="attack-section">
          <button
            className="attack-button"
            onClick={handleAttack}
            disabled={!canAttack}
          >
            ATTACK
          </button>
          <ResourceBars />
        </div>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activePanel === 'weapon' ? 'active' : ''}`}
          onClick={() => setActivePanel(activePanel === 'weapon' ? 'none' : 'weapon')}
        >
          Weapon
        </button>
        <button
          className={`tab-button ${activePanel === 'legacy' ? 'active' : ''}`}
          onClick={() => setActivePanel(activePanel === 'legacy' ? 'none' : 'legacy')}
        >
          Legacy
        </button>
        <button
          className={`tab-button ${activePanel === 'fighter' ? 'active' : ''}`}
          onClick={() => setActivePanel(activePanel === 'fighter' ? 'none' : 'fighter')}
        >
          Fighter
        </button>
      </div>

      {activePanel === 'weapon' && <WeaponPanel />}
      {activePanel === 'legacy' && <LegacyPanel />}
      {activePanel === 'fighter' && <FighterPanel />}
    </div>
  );
}

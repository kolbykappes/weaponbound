// App.tsx

import { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { useGameLoop } from './hooks/useGameLoop';
import { Header } from './components/Header';
import { CombatView } from './components/CombatView';
import { SettingsPanel, SettingsToggleButton } from './components/SettingsPanel';
import './styles.css';

function GameContent() {
  const { state, dispatch } = useGame();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [enemyHpMult, setEnemyHpMult] = useState(1.20);
  const [bossHpMult, setBossHpMult] = useState(5.0);
  const [enemySpawnInterval, setEnemySpawnInterval] = useState(2.0);

  // Start the game loop
  useGameLoop(state, dispatch);

  // Update game constants when multipliers change
  const handleEnemyHpMultChange = (value: number) => {
    setEnemyHpMult(value);
    dispatch({ type: 'UPDATE_ENEMY_HP_MULT', payload: value });
  };

  const handleBossHpMultChange = (value: number) => {
    setBossHpMult(value);
    dispatch({ type: 'UPDATE_BOSS_HP_MULT', payload: value });
  };

  const handleEnemySpawnIntervalChange = (value: number) => {
    setEnemySpawnInterval(value);
    dispatch({ type: 'UPDATE_ENEMY_SPAWN_INTERVAL', payload: value });
  };

  return (
    <div className="app">
      <Header />
      <CombatView />
      <SettingsToggleButton onClick={() => setIsSettingsOpen(true)} />
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        enemyHpMult={enemyHpMult}
        bossHpMult={bossHpMult}
        enemySpawnInterval={enemySpawnInterval}
        onEnemyHpMultChange={handleEnemyHpMultChange}
        onBossHpMultChange={handleBossHpMultChange}
        onEnemySpawnIntervalChange={handleEnemySpawnIntervalChange}
      />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;

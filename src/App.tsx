// App.tsx

import { GameProvider, useGame } from './context/GameContext';
import { useGameLoop } from './hooks/useGameLoop';
import { Header } from './components/Header';
import { CombatView } from './components/CombatView';
import './styles.css';

function GameContent() {
  const { state, dispatch } = useGame();

  // Start the game loop
  useGameLoop(state, dispatch);

  return (
    <div className="app">
      <Header />
      <CombatView />
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

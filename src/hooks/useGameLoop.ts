// hooks/useGameLoop.ts

import { useEffect } from 'react';
import { GameState, GameAction } from '../types/game.types';
import { GAME_CONSTANTS } from '../utils/constants';

export function useGameLoop(state: GameState, dispatch: React.Dispatch<GameAction>) {
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - state.lastTickTime;
      const deltaSec = deltaMs / 1000;

      dispatch({
        type: 'GAME_TICK',
        payload: { deltaMs, deltaSec, now }
      });
    }, GAME_CONSTANTS.TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [state.lastTickTime, dispatch]);
}

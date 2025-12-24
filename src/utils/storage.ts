// utils/storage.ts

import { GameState } from '../types/game.types';
import { GAME_CONSTANTS } from './constants';

export function saveGame(state: GameState): void {
  try {
    const saveData = {
      version: GAME_CONSTANTS.STORAGE_VERSION,
      timestamp: Date.now(),
      state: state,
    };
    localStorage.setItem(GAME_CONSTANTS.STORAGE_KEY, JSON.stringify(saveData));
  } catch (error) {
    console.error('Failed to save game:', error);
  }
}

export function loadGame(): GameState | null {
  try {
    const saved = localStorage.getItem(GAME_CONSTANTS.STORAGE_KEY);
    if (!saved) return null;

    const saveData = JSON.parse(saved);

    // Version check
    if (saveData.version !== GAME_CONSTANTS.STORAGE_VERSION) {
      console.warn('Save version mismatch, resetting');
      return null;
    }

    return saveData.state;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
}

export function resetGame(): void {
  localStorage.removeItem(GAME_CONSTANTS.STORAGE_KEY);
}

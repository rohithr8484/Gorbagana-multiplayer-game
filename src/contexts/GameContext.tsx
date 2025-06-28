import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GameState {
  isPlaying: boolean;
  score: number;
  gameMode: 'blitz' | 'endurance' | 'tournament';
  roomId?: string;
}

interface GameContextType {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  currentScreen: 'lobby' | 'game' | 'leaderboard';
  setCurrentScreen: React.Dispatch<React.SetStateAction<'lobby' | 'game' | 'leaderboard'>>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    score: 0,
    gameMode: 'blitz',
  });
  
  const [currentScreen, setCurrentScreen] = useState<'lobby' | 'game' | 'leaderboard'>('lobby');

  return (
    <GameContext.Provider value={{
      gameState,
      setGameState,
      currentScreen,
      setCurrentScreen,
    }}>
      {children}
    </GameContext.Provider>
  );
};
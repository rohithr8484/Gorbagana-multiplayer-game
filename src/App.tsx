import React, { useState, useEffect } from 'react';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { clusterApiUrl } from '@solana/web3.js';
import WalletContextProvider from './components/WalletContextProvider';
import GameLobby from './components/GameLobby';
import GameArena from './components/GameArena';
import Leaderboard from './components/Leaderboard';
import { GameProvider, useGame } from './contexts/GameContext';
import { Coins, Trophy, Users } from 'lucide-react';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

const wallets = [
  new BackpackWalletAdapter(),
];

function AppContent() {
  const { gameState, currentScreen, setCurrentScreen } = useGame();
  const [isConnected, setIsConnected] = useState(false);

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'lobby':
        return <GameLobby />;
      case 'game':
        return <GameArena />;
      case 'leaderboard':
        return <Leaderboard />;
      default:
        return <GameLobby />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Coins className="w-8 h-8 text-yellow-400" />
              <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                GOR Rush
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm text-gray-300">
              <span>Gorbagana Testnet</span>
              <span>•</span>
              <span>Multiplayer Token Game</span>
            </div>
          </div>

          <nav className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentScreen('lobby')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentScreen === 'lobby'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Lobby
            </button>
            <button
              onClick={() => setCurrentScreen('leaderboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentScreen === 'leaderboard'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Leaderboard
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {renderCurrentScreen()}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-12 p-6 border-t border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>Built on Gorbagana • Powered by Solana • Compatible with Backpack Wallet</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <WalletContextProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </WalletContextProvider>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { clusterApiUrl } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import WalletContextProvider from './components/WalletContextProvider';
import GameLobby from './components/GameLobby';
import GameArena from './components/GameArena';
import Leaderboard from './components/Leaderboard';
import { GameProvider, useGame } from './contexts/GameContext';
import { Coins, Trophy, Users, Wallet, Zap, Shield, Star, LogOut } from 'lucide-react';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

const wallets = [
  new BackpackWalletAdapter(),
];

// Wallet Connection Gate Component
const WalletConnectionGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connected, connecting, publicKey } = useWallet();

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-8 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto p-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 text-center">
            {/* Logo and Title */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Coins className="w-16 h-16 text-yellow-400 animate-bounce" />
                <h1 className="text-5xl font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  GOR Rush
                </h1>
              </div>
              <p className="text-xl text-gray-300 mb-2">Multiplayer Coin Collection Game</p>
              <p className="text-lg text-blue-400">Powered by Gorbagana Testnet</p>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white/5 rounded-xl p-4">
                <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h3 className="text-white font-bold mb-1">Power-ups</h3>
                <p className="text-gray-400 text-sm">Multipliers, shields, and special abilities</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <h3 className="text-white font-bold mb-1">Tournaments</h3>
                <p className="text-gray-400 text-sm">Compete for massive GOR rewards</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <Shield className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <h3 className="text-white font-bold mb-1">Anti-Cheat</h3>
                <p className="text-gray-400 text-sm">Fair play with server validation</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <Star className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <h3 className="text-white font-bold mb-1">Achievements</h3>
                <p className="text-gray-400 text-sm">Unlock rewards and showcase skills</p>
              </div>
            </div>

            {/* Wallet Connection Section */}
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-400/30 rounded-xl p-6 mb-6">
              <Wallet className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3">Connect Your Backpack Wallet</h2>
              <p className="text-gray-300 mb-6">
                Connect your Backpack wallet to start playing and earning GOR coins on Gorbagana testnet
              </p>
              
              <div className="mb-4">
                <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !rounded-xl !font-bold !px-8 !py-4 !text-lg !transition-all !transform hover:!scale-105" />
              </div>
              
              {connecting && (
                <div className="flex items-center justify-center space-x-2 text-blue-400">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting to wallet...</span>
                </div>
              )}
            </div>

            {/* Game Features */}
            <div className="text-left space-y-4">
              <h3 className="text-xl font-bold text-white text-center mb-4">What You Can Do:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Play FREE Quick Match games</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-300">Earn real GOR tokens</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">Compete in tournaments</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Climb global leaderboards</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-gray-300">Unlock achievements</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Use power-ups and multipliers</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-600/20 border border-blue-400/30 rounded-lg">
              <h4 className="text-blue-400 font-bold mb-2">Need Backpack Wallet?</h4>
              <p className="text-gray-300 text-sm mb-3">
                Download the Backpack wallet extension for your browser to get started.
              </p>
              <a
                href="https://www.backpack.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all text-sm"
              >
                <span>Download Backpack</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

function AppContent() {
  const { gameState, currentScreen, setCurrentScreen } = useGame();
  const { connected, publicKey, disconnect } = useWallet();

  const handleDisconnect = async () => {
    try {
      if (disconnect) {
        await disconnect();
        // Reset to lobby screen after disconnect
        setCurrentScreen('lobby');
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

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
    <WalletConnectionGate>
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
                <span>Multiplayer Coin Game</span>
                {connected && publicKey && (
                  <>
                    <span>•</span>
                    <span className="text-green-400">
                      Connected: {publicKey.toString().slice(0, 8)}...
                    </span>
                  </>
                )}
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
              
              {/* Wallet Connection/Disconnection */}
              <div className="flex items-center space-x-2">
                {connected ? (
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Disconnect</span>
                  </button>
                ) : (
                  <WalletMultiButton className="!bg-gradient-to-r !from-green-600 !to-emerald-600 hover:!from-green-700 hover:!to-emerald-700 !rounded-lg !font-medium !px-4 !py-2" />
                )}
              </div>
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
    </WalletConnectionGate>
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
import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useGame } from '../contexts/GameContext';
import { Play, Users, Coins, Zap, Trophy, Clock } from 'lucide-react';

const GameLobby: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { setCurrentScreen, gameState, setGameState } = useGame();
  const [playerCount, setPlayerCount] = useState(0);
  const [gorBalance, setGorBalance] = useState(1000); // Mock GOR balance
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 23,
    tokensCollected: 1847,
    highScore: 156,
    rank: 47
  });

  useEffect(() => {
    // Simulate real-time player count updates
    const interval = setInterval(() => {
      setPlayerCount(Math.floor(Math.random() * 50) + 10);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const startGame = () => {
    if (connected) {
      setGameState({ ...gameState, isPlaying: true });
      setCurrentScreen('game');
    }
  };

  const GameModeCard = ({ title, description, entryFee, reward, icon: Icon, onClick }: any) => (
    <div 
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-gray-300 text-sm">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-red-400 text-sm">Entry: {entryFee} GOR</div>
          <div className="text-green-400 text-sm">Reward: {reward} GOR</div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm">Active Players: {playerCount}</span>
        <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all group-hover:scale-105">
          Join Game
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Game Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Section */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">
                Welcome to <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">GOR Rush</span>
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Compete in real-time multiplayer token collection battles. Collect falling GOR tokens faster than your opponents!
              </p>
              
              {!connected ? (
                <div className="space-y-4">
                  <p className="text-yellow-400 font-medium">Connect your Backpack wallet to start playing</p>
                  <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !rounded-lg !font-bold !px-8 !py-3" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-4 text-green-400">
                    <Zap className="w-5 h-5" />
                    <span>Wallet Connected: {publicKey?.toString().slice(0, 8)}...</span>
                  </div>
                  <button
                    onClick={startGame}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Play className="w-6 h-6 inline mr-2" />
                    Quick Match
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Game Modes */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Game Modes
            </h3>
            
            <GameModeCard
              title="Blitz Rush"
              description="60-second intense token collection"
              entryFee={10}
              reward={50}
              icon={Zap}
              onClick={connected ? startGame : undefined}
            />
            
            <GameModeCard
              title="Endurance Race"
              description="5-minute marathon collection"
              entryFee={25}
              reward={150}
              icon={Clock}
              onClick={connected ? startGame : undefined}
            />
            
            <GameModeCard
              title="Tournament"
              description="Elimination-style competition"
              entryFee={50}
              reward={500}
              icon={Trophy}
              onClick={connected ? startGame : undefined}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Player Stats */}
          {connected && (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Coins className="w-5 h-5 mr-2 text-yellow-400" />
                Your Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">GOR Balance</span>
                  <span className="text-yellow-400 font-bold">{gorBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Games Played</span>
                  <span className="text-blue-400 font-bold">{gameStats.gamesPlayed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Tokens Collected</span>
                  <span className="text-green-400 font-bold">{gameStats.tokensCollected.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">High Score</span>
                  <span className="text-purple-400 font-bold">{gameStats.highScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Global Rank</span>
                  <span className="text-orange-400 font-bold">#{gameStats.rank}</span>
                </div>
              </div>
            </div>
          )}

          {/* Live Activity */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Live Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300 text-sm">Player just collected 47 tokens!</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300 text-sm">New high score: 189 tokens</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300 text-sm">Tournament starting in 5 minutes</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300 text-sm">{playerCount} players online</span>
              </div>
            </div>
          </div>

          {/* How to Play */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">1.</span>
                <span>Connect your Backpack wallet</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">2.</span>
                <span>Choose a game mode and pay entry fee</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">3.</span>
                <span>Click falling GOR tokens to collect them</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">4.</span>
                <span>Compete for the highest score</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">5.</span>
                <span>Win GOR tokens based on your ranking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useGame } from '../contexts/GameContext';
import { Play, Users, Coins, Zap, Trophy, Clock, Star, Shield, Target, TrendingUp, Gift, ExternalLink, AlertCircle } from 'lucide-react';
import GorbaganaIntegration from './GorbaganaIntegration';
import { GorbaganaRPC, getEntryFee, estimateRewards, formatGOR } from '../utils/gorbaganaRPC';

const GameLobby: React.FC = () => {
  const { connected, publicKey, wallet } = useWallet();
  const walletContext = useWallet();
  const { setCurrentScreen, gameState, setGameState } = useGame();
  const [playerCount, setPlayerCount] = useState(0);
  const [gorBalance, setGorBalance] = useState(1000);
  const [showGorbaganaModal, setShowGorbaganaModal] = useState(false);
  const [gorbaganaRPC, setGorbaganaRPC] = useState<GorbaganaRPC | null>(null);
  const [isBackpackWallet, setIsBackpackWallet] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 23,
    coinsCollected: 1847,
    highScore: 156,
    rank: 47,
    winRate: 68,
    totalEarned: 2340
  });
  const [liveEvents, setLiveEvents] = useState([
    { id: 1, text: 'CoinMaster just scored 247 points!', type: 'score', time: '2s ago' },
    { id: 2, text: 'New tournament starting in 3 minutes', type: 'tournament', time: '1m ago' },
    { id: 3, text: 'Daily bonus: +50 GOR available!', type: 'bonus', time: '5m ago' },
    { id: 4, text: 'GORCollector achieved 20x streak!', type: 'achievement', time: '8m ago' },
  ]);

  useEffect(() => {
    // Initialize Gorbagana RPC when wallet connects
    if (connected && publicKey && wallet) {
      // Check if connected wallet is Backpack
      const isBackpack = wallet.adapter.name === 'Backpack';
      setIsBackpackWallet(isBackpack);
      
      if (isBackpack) {
        const rpc = new GorbaganaRPC(walletContext);
        setGorbaganaRPC(rpc);
        loadGORBalance(rpc);
      }
    }
  }, [connected, publicKey, wallet, walletContext]);

  useEffect(() => {
    // Simulate real-time player count updates
    const interval = setInterval(() => {
      setPlayerCount(Math.floor(Math.random() * 100) + 50);
    }, 3000);

    // Simulate live events
    const eventInterval = setInterval(() => {
      const events = [
        { text: `Player just collected ${Math.floor(Math.random() * 100) + 50} coins!`, type: 'score' },
        { text: 'New high score: ' + (Math.floor(Math.random() * 200) + 200) + ' coins', type: 'score' },
        { text: 'Tournament starting soon!', type: 'tournament' },
        { text: 'Someone just earned 500 GOR!', type: 'bonus' },
        { text: 'Epic 15x multiplier achieved!', type: 'achievement' },
      ];
      
      const newEvent = {
        id: Date.now(),
        ...events[Math.floor(Math.random() * events.length)],
        time: 'now'
      };
      
      setLiveEvents(prev => [newEvent, ...prev.slice(0, 3)]);
    }, 8000);

    return () => {
      clearInterval(interval);
      clearInterval(eventInterval);
    };
  }, []);

  const loadGORBalance = async (rpc: GorbaganaRPC) => {
    try {
      setBalanceLoading(true);
      const balance = await rpc.getGORBalance();
      setGorBalance(balance.balance);
    } catch (error) {
      console.error('Failed to load GOR balance:', error);
    } finally {
      setBalanceLoading(false);
    }
  };

  const startGame = async (mode: string, isFree: boolean = false) => {
    if (!connected) {
      alert('Please connect your Backpack wallet first.');
      return;
    }

    if (!isBackpackWallet) {
      alert('Please connect using Backpack wallet only for GOR token functionality.');
      return;
    }

    const gameMode = mode as 'blitz' | 'endurance' | 'tournament';
    
    // For free games (Quick Match), skip entry fee processing
    if (isFree) {
      setGameState({ ...gameState, isPlaying: true, gameMode: gameMode as any });
      setCurrentScreen('game');
      return;
    }

    // For paid games, process GOR token entry fee
    if (gorbaganaRPC) {
      const entryFee = getEntryFee(gameMode);
      
      try {
        // Check GOR balance first
        const balanceCheck = await gorbaganaRPC.checkGORBalance(entryFee);
        
        if (!balanceCheck.hasEnough) {
          alert(`Insufficient GOR tokens. ${balanceCheck.message}`);
          return;
        }

        // Pay entry fee in GOR tokens
        const transaction = await gorbaganaRPC.payEntryFee(gameMode);
        
        if (transaction.status === 'confirmed') {
          // Update balance and start game
          await loadGORBalance(gorbaganaRPC);
          setGameState({ ...gameState, isPlaying: true, gameMode: gameMode as any });
          setCurrentScreen('game');
        } else {
          alert('Failed to process GOR token entry fee. Please try again.');
        }
      } catch (error) {
        console.error('Failed to start game:', error);
        alert(`Failed to start game: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const openGorbaganaFaucet = () => {
    window.open('https://faucet.gorbagana.wtf/', '_blank');
  };

  const GameModeCard = ({ title, description, entryFee, reward, icon: Icon, duration, features, onClick, gameMode, isFree = false }: any) => {
    const canAfford = isFree || (isBackpackWallet && gorBalance >= entryFee);
    const rewardRange = estimateRewards(gameMode);
    
    return (
      <div 
        className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer group transform hover:scale-105 ${
          !canAfford && !isFree ? 'opacity-60' : ''
        }`}
        onClick={canAfford || isFree ? onClick : undefined}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg group-hover:from-purple-400 group-hover:to-blue-400 transition-all">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="text-gray-300 text-sm">{description}</p>
              <p className="text-blue-400 text-xs">{duration}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm ${isFree ? 'text-green-400 font-bold' : canAfford ? 'text-red-400' : 'text-red-500 font-bold'}`}>
              {isFree ? 'FREE' : `Entry: ${formatGOR(entryFee)}`}
            </div>
            <div className="text-green-400 text-sm">
              Rewards: {formatGOR(rewardRange.min)}-{formatGOR(rewardRange.max)}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {features.map((feature: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full">
                {feature}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {playerCount + Math.floor(Math.random() * 20)} playing
          </span>
          <button 
            className={`px-4 py-2 rounded-lg font-medium transition-all group-hover:scale-105 ${
              canAfford || isFree
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700' 
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
            }`}
            disabled={!canAfford && !isFree}
          >
            {isFree ? 'Play Free' : canAfford ? 'Join Game' : 'Insufficient GOR'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Game Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Wallet Status Alert */}
          {connected && !isBackpackWallet && (
            <div className="bg-red-600/20 border border-red-400/30 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="text-red-400 font-bold">Backpack Wallet Required</h3>
                  <p className="text-gray-300 text-sm">
                    Please connect using Backpack wallet to access GOR token functionality and paid game modes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Section */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">
                Welcome to <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">GOR Rush</span>
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                The ultimate multiplayer coin collection experience on Gorbagana testnet. Compete, collect, and earn real GOR tokens!
              </p>
              
              {!connected ? (
                <div className="space-y-4">
                  <p className="text-yellow-400 font-medium">Connect your Backpack wallet to start earning GOR tokens</p>
                  <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !rounded-lg !font-bold !px-8 !py-3" />
                  <div className="text-sm text-gray-400 mt-4">
                    <p>🎮 Play games • 🏆 Earn GOR • 📈 Climb leaderboards</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-4 text-green-400">
                    <Zap className="w-5 h-5" />
                    <span>
                      {isBackpackWallet ? 'Backpack Wallet Connected' : 'Wallet Connected'}: {publicKey?.toString().slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => startGame('blitz', true)} // Make Quick Match free
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg"
                    >
                      <Play className="w-6 h-6 inline mr-2" />
                      Quick Match (FREE)
                    </button>
                    <button
                      onClick={() => setShowGorbaganaModal(true)}
                      className="px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-bold hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg"
                    >
                      <Zap className="w-5 h-5 inline mr-2" />
                      Gorbagana Testnet
                    </button>
                    <button
                      onClick={openGorbaganaFaucet}
                      className="px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
                    >
                      <Gift className="w-5 h-5 inline mr-2" />
                      Claim GOR
                    </button>
                  </div>
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
              description="Fast-paced 60-second coin collection frenzy"
              duration="60 seconds"
              entryFee={10}
              reward={50}
              icon={Zap}
              gameMode="blitz"
              isFree={true}
              features={['Power-ups', 'Multipliers', 'Streak bonuses', 'FREE TO PLAY']}
              onClick={() => startGame('blitz', true)}
            />
            
            <GameModeCard
              title="Endurance Race"
              description="5-minute marathon with increasing difficulty"
              duration="5 minutes"
              entryFee={25}
              reward={150}
              icon={Clock}
              gameMode="endurance"
              features={['Scaling difficulty', 'Special coins', 'Shield protection', 'GOR ENTRY FEE']}
              onClick={() => startGame('endurance')}
            />
            
            <GameModeCard
              title="Tournament Mode"
              description="Elimination-style competition with massive rewards"
              duration="Multiple rounds"
              entryFee={50}
              reward={500}
              icon={Trophy}
              gameMode="tournament"
              features={['Elimination rounds', 'Live spectating', 'Champion rewards', 'GOR ENTRY FEE']}
              onClick={() => startGame('tournament')}
            />
          </div>

          {/* Coin Guide */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Coin Types & Strategy
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">1</div>
                <p className="text-white font-medium">Basic</p>
                <p className="text-gray-400 text-sm">1 GOR</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">10</div>
                <p className="text-white font-medium">Bonus</p>
                <p className="text-gray-400 text-sm">10 GOR</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <p className="text-white font-medium">Multiplier</p>
                <p className="text-gray-400 text-sm">Boost earnings</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <p className="text-white font-medium">Shield</p>
                <p className="text-gray-400 text-sm">Protection</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-6">
          {/* Player Stats */}
          {connected && (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Coins className="w-5 h-5 mr-2 text-yellow-400" />
                Your Profile
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">GOR Balance</span>
                  <div className="flex items-center space-x-2">
                    {balanceLoading && <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>}
                    <span className={`font-bold text-lg ${isBackpackWallet ? 'text-yellow-400' : 'text-gray-500'}`}>
                      {isBackpackWallet ? formatGOR(gorBalance) : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Wallet Type</span>
                  <span className={`font-bold ${isBackpackWallet ? 'text-green-400' : 'text-orange-400'}`}>
                    {isBackpackWallet ? 'Backpack ✓' : 'Other Wallet'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Games Played</span>
                  <span className="text-blue-400 font-bold">{gameStats.gamesPlayed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Win Rate</span>
                  <span className="text-green-400 font-bold">{gameStats.winRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">High Score</span>
                  <span className="text-purple-400 font-bold">{gameStats.highScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Earned</span>
                  <span className="text-orange-400 font-bold">{formatGOR(gameStats.totalEarned)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Global Rank</span>
                  <span className="text-pink-400 font-bold">#{gameStats.rank}</span>
                </div>
              </div>
            </div>
          )}

          {/* Live Activity Feed */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Live Activity
            </h3>
            <div className="space-y-3">
              {liveEvents.map((event) => (
                <div key={event.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 animate-pulse ${
                    event.type === 'score' ? 'bg-green-400' :
                    event.type === 'tournament' ? 'bg-purple-400' :
                    event.type === 'bonus' ? 'bg-yellow-400' :
                    'bg-blue-400'
                  }`}></div>
                  <div className="flex-1">
                    <span className="text-gray-300 text-sm">{event.text}</span>
                    <div className="text-xs text-gray-500">{event.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Network Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Players Online
                </span>
                <span className="text-blue-400 font-bold">{playerCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Games Today</span>
                <span className="text-green-400 font-bold">4,892</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">GOR Distributed</span>
                <span className="text-yellow-400 font-bold">287K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Active Tournaments</span>
                <span className="text-purple-400 font-bold">12</span>
              </div>
            </div>
          </div>

          {/* How to Play */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Pro Tips</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start space-x-2">
                <Star className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <span>Build streaks for massive score multipliers</span>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <span>Collect shields to protect against bombs</span>
              </div>
              <div className="flex items-start space-x-2">
                <Zap className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <span>Multiplier coins stack for huge bonuses</span>
              </div>
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span>Time coins extend your game duration</span>
              </div>
              <div className="flex items-start space-x-2">
                <Trophy className="w-4 h-4 text-gold-400 mt-0.5 flex-shrink-0" />
                <span>Higher ranks earn more GOR rewards</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gorbagana Integration Modal */}
      {showGorbaganaModal && (
        <GorbaganaIntegration onClose={() => setShowGorbaganaModal(false)} />
      )}
    </div>
  );
};

export default GameLobby;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../contexts/GameContext';
import { Coins, Users, Clock, Trophy, ArrowLeft, Zap, Star, Shield, Target } from 'lucide-react';

interface Token {
  id: string;
  x: number;
  y: number;
  value: number;
  speed: number;
  color: string;
  type: 'normal' | 'bonus' | 'multiplier' | 'bomb' | 'shield' | 'time';
  size: number;
  rotation: number;
  pulse: boolean;
}

interface Player {
  id: string;
  name: string;
  score: number;
  avatar: string;
  streak: number;
  multiplier: number;
  shields: number;
}

interface PowerUp {
  type: 'shield' | 'multiplier' | 'time' | 'magnet';
  duration: number;
  active: boolean;
}

const GameArena: React.FC = () => {
  const { setCurrentScreen, gameState, setGameState } = useGame();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(true);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [shields, setShields] = useState(0);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [comboText, setComboText] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'You', score: 0, avatar: '🎮', streak: 0, multiplier: 1, shields: 0 },
    { id: '2', name: 'TokenHunter', score: 0, avatar: '🚀', streak: 0, multiplier: 1, shields: 0 },
    { id: '3', name: 'GORMaster', score: 0, avatar: '⚡', streak: 0, multiplier: 1, shields: 0 },
    { id: '4', name: 'CoinRush', score: 0, avatar: '🔥', streak: 0, multiplier: 1, shields: 0 },
  ]);
  const [particles, setParticles] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Enhanced token generation with special types
  const generateToken = useCallback(() => {
    if (!gameAreaRef.current) return;
    
    const gameArea = gameAreaRef.current.getBoundingClientRect();
    const tokenTypes = [
      { value: 1, color: 'bg-yellow-400', type: 'normal', weight: 40, size: 40 },
      { value: 5, color: 'bg-blue-400', type: 'normal', weight: 25, size: 45 },
      { value: 10, color: 'bg-purple-400', type: 'bonus', weight: 15, size: 50 },
      { value: 25, color: 'bg-red-400', type: 'bonus', weight: 8, size: 55 },
      { value: 0, color: 'bg-green-400', type: 'multiplier', weight: 5, size: 45 },
      { value: -10, color: 'bg-gray-800', type: 'bomb', weight: 4, size: 40 },
      { value: 0, color: 'bg-cyan-400', type: 'shield', weight: 2, size: 45 },
      { value: 0, color: 'bg-orange-400', type: 'time', weight: 1, size: 45 },
    ];
    
    const totalWeight = tokenTypes.reduce((sum, type) => sum + type.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedType = tokenTypes[0];
    
    for (const type of tokenTypes) {
      random -= type.weight;
      if (random <= 0) {
        selectedType = type;
        break;
      }
    }
    
    const newToken: Token = {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (gameArea.width - selectedType.size),
      y: -selectedType.size,
      value: selectedType.value,
      speed: Math.random() * 2 + 1.5,
      color: selectedType.color,
      type: selectedType.type as any,
      size: selectedType.size,
      rotation: 0,
      pulse: selectedType.type !== 'normal',
    };
    
    setTokens(prev => [...prev, newToken]);
  }, []);

  // Enhanced token click handling with power-ups and combos
  const handleTokenClick = (tokenId: string) => {
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;

    let scoreGain = 0;
    let newStreak = streak;
    let newMultiplier = multiplier;
    let newShields = shields;
    let comboMessage = '';

    switch (token.type) {
      case 'normal':
      case 'bonus':
        scoreGain = token.value * multiplier;
        newStreak = streak + 1;
        
        // Streak bonuses
        if (newStreak >= 10) {
          scoreGain *= 2;
          comboMessage = 'STREAK BONUS! x2';
        } else if (newStreak >= 5) {
          scoreGain = Math.floor(scoreGain * 1.5);
          comboMessage = 'COMBO! x1.5';
        }
        break;
        
      case 'multiplier':
        newMultiplier = Math.min(multiplier + 1, 5);
        comboMessage = `MULTIPLIER x${newMultiplier}!`;
        setPowerUps(prev => [...prev, { type: 'multiplier', duration: 10, active: true }]);
        break;
        
      case 'bomb':
        if (shields > 0) {
          newShields = shields - 1;
          comboMessage = 'SHIELD PROTECTED!';
        } else {
          scoreGain = token.value;
          newStreak = 0;
          newMultiplier = 1;
          comboMessage = 'BOMB HIT!';
        }
        break;
        
      case 'shield':
        newShields = Math.min(shields + 1, 3);
        comboMessage = 'SHIELD GAINED!';
        break;
        
      case 'time':
        setTimeLeft(prev => Math.min(prev + 5, 120));
        comboMessage = '+5 SECONDS!';
        break;
    }

    setScore(prev => Math.max(0, prev + scoreGain));
    setStreak(newStreak);
    setMultiplier(newMultiplier);
    setShields(newShields);
    setComboText(comboMessage);
    
    // Clear combo text after 2 seconds
    setTimeout(() => setComboText(''), 2000);

    setTokens(prev => prev.filter(t => t.id !== tokenId));

    // Enhanced particle effects
    const particleCount = token.type === 'bonus' ? 8 : 5;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      x: token.x + token.size / 2,
      y: token.y + token.size / 2,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 15,
      life: 1,
      value: scoreGain,
      color: token.color,
      type: token.type,
    }));
    
    setParticles(prev => [...prev, ...newParticles]);

    // Check for achievements
    checkAchievements(newStreak, score + scoreGain, newMultiplier);
  };

  // Achievement system
  const checkAchievements = (currentStreak: number, currentScore: number, currentMultiplier: number) => {
    const newAchievements: string[] = [];
    
    if (currentStreak >= 20 && !achievements.includes('streak_master')) {
      newAchievements.push('streak_master');
      setAchievements(prev => [...prev, 'streak_master']);
    }
    
    if (currentScore >= 500 && !achievements.includes('high_scorer')) {
      newAchievements.push('high_scorer');
      setAchievements(prev => [...prev, 'high_scorer']);
    }
    
    if (currentMultiplier >= 5 && !achievements.includes('multiplier_max')) {
      newAchievements.push('multiplier_max');
      setAchievements(prev => [...prev, 'multiplier_max']);
    }

    // Show achievement notifications
    newAchievements.forEach(achievement => {
      setTimeout(() => {
        // Achievement notification logic here
      }, 500);
    });
  };

  // Enhanced token updates with rotation and AI opponents
  const updateTokens = useCallback(() => {
    setTokens(prevTokens => {
      return prevTokens
        .map(token => ({ 
          ...token, 
          y: token.y + token.speed,
          rotation: token.rotation + (token.pulse ? 5 : 2)
        }))
        .filter(token => token.y < window.innerHeight + 100);
    });

    // Enhanced AI opponent behavior
    setPlayers(prev => prev.map(player => {
      if (player.id !== '1') {
        // Simulate more realistic AI behavior
        const baseIncrease = Math.random() < 0.08 ? Math.floor(Math.random() * 8) + 1 : 0;
        const streakBonus = player.streak > 5 ? Math.floor(baseIncrease * 1.5) : baseIncrease;
        const multiplierBonus = Math.floor(streakBonus * player.multiplier);
        
        return { 
          ...player, 
          score: player.score + multiplierBonus,
          streak: baseIncrease > 0 ? player.streak + 1 : Math.max(0, player.streak - 1),
          multiplier: Math.random() < 0.05 ? Math.min(player.multiplier + 1, 4) : Math.max(1, player.multiplier - 0.1)
        };
      }
      return { ...player, score, streak, multiplier, shields };
    }));
  }, [score, streak, multiplier, shields]);

  // Power-up management
  useEffect(() => {
    const interval = setInterval(() => {
      setPowerUps(prev => prev.map(powerUp => ({
        ...powerUp,
        duration: powerUp.duration - 1
      })).filter(powerUp => powerUp.duration > 0));
      
      // Reset multiplier when power-up expires
      const hasMultiplierPowerUp = powerUps.some(p => p.type === 'multiplier' && p.duration > 0);
      if (!hasMultiplierPowerUp && multiplier > 1) {
        setMultiplier(1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [powerUps, multiplier]);

  // Enhanced particle updates
  const updateParticles = useCallback(() => {
    setParticles(prev => 
      prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vx: particle.vx * 0.98,
          vy: particle.vy * 0.98,
          life: particle.life - 0.02,
        }))
        .filter(particle => particle.life > 0)
    );
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameActive) return;

    const gameLoop = () => {
      updateTokens();
      updateParticles();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameActive, updateTokens, updateParticles]);

  // Enhanced token generation with difficulty scaling
  useEffect(() => {
    if (!gameActive) return;

    const baseInterval = Math.max(500, 1200 - (60 - timeLeft) * 10); // Gets faster over time
    const interval = setInterval(() => {
      if (Math.random() < 0.8) {
        generateToken();
      }
    }, baseInterval);

    return () => clearInterval(interval);
  }, [gameActive, generateToken, timeLeft]);

  // Timer
  useEffect(() => {
    if (!gameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive]);

  const exitGame = () => {
    setGameActive(false);
    setGameState({ ...gameState, isPlaying: false });
    setCurrentScreen('lobby');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTokenIcon = (type: string) => {
    switch (type) {
      case 'multiplier': return <Zap className="w-4 h-4" />;
      case 'shield': return <Shield className="w-4 h-4" />;
      case 'time': return <Clock className="w-4 h-4" />;
      case 'bomb': return <Target className="w-4 h-4" />;
      default: return null;
    }
  };

  const GameOverModal = () => {
    const finalRank = players.sort((a, b) => b.score - a.score).findIndex(p => p.id === '1') + 1;
    const earnedGOR = Math.max(0, 100 - (finalRank - 1) * 20);
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
            <div className="space-y-3 mb-6">
              <p className="text-2xl text-yellow-400 font-bold">Final Score: {score}</p>
              <p className="text-green-400 font-bold">GOR Earned: +{earnedGOR}</p>
              <p className="text-gray-300">Best Streak: {Math.max(...players.map(p => p.streak))}</p>
              <p className="text-gray-300">Max Multiplier: x{Math.max(...players.map(p => p.multiplier))}</p>
              <p className="text-gray-300">Rank: #{finalRank} of {players.length}</p>
              
              {achievements.length > 0 && (
                <div className="mt-4 p-3 bg-purple-600/20 rounded-lg">
                  <p className="text-purple-400 font-bold">Achievements Unlocked!</p>
                  <div className="flex justify-center space-x-2 mt-2">
                    {achievements.map(achievement => (
                      <Star key={achievement} className="w-5 h-5 text-yellow-400" />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={exitGame}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all"
              >
                Back to Lobby
              </button>
              <button
                onClick={() => {
                  setScore(0);
                  setTimeLeft(60);
                  setGameActive(true);
                  setTokens([]);
                  setStreak(0);
                  setMultiplier(1);
                  setShields(0);
                  setAchievements([]);
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Game Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-black/20 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button
            onClick={exitGame}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit</span>
          </button>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-white">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-2xl font-bold">{score}</span>
              {multiplier > 1 && (
                <span className="text-purple-400 text-sm">x{multiplier}</span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-white">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-xl font-mono">{formatTime(timeLeft)}</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center space-x-2 text-orange-400">
                <Star className="w-5 h-5" />
                <span className="font-bold">{streak}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {shields > 0 && (
              <div className="flex items-center space-x-1 text-cyan-400">
                <Shield className="w-5 h-5" />
                <span>{shields}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-white">
              <Users className="w-5 h-5 text-green-400" />
              <span>{players.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Power-up Status Bar */}
      {powerUps.length > 0 && (
        <div className="absolute top-20 left-4 z-20 bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-3">
          <div className="flex space-x-3">
            {powerUps.map((powerUp, index) => (
              <div key={index} className="flex items-center space-x-2 text-white">
                {powerUp.type === 'multiplier' && <Zap className="w-4 h-4 text-purple-400" />}
                {powerUp.type === 'shield' && <Shield className="w-4 h-4 text-cyan-400" />}
                <span className="text-sm">{powerUp.duration}s</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Combo Text */}
      {comboText && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <div className="text-4xl font-bold text-yellow-400 animate-bounce drop-shadow-lg">
            {comboText}
          </div>
        </div>
      )}

      {/* Enhanced Leaderboard Sidebar */}
      <div className="absolute top-20 right-4 z-20 bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-4 w-64">
        <h3 className="text-white font-bold mb-3 flex items-center">
          <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
          Live Rankings
        </h3>
        <div className="space-y-2">
          {players
            .sort((a, b) => b.score - a.score)
            .map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  player.id === '1' ? 'bg-purple-600/30' : 'bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{player.avatar}</span>
                  <div>
                    <span className={`text-sm ${player.id === '1' ? 'text-white font-bold' : 'text-gray-300'}`}>
                      {player.name}
                    </span>
                    {player.streak > 0 && (
                      <div className="text-xs text-orange-400">🔥{player.streak}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 font-bold">{player.score}</div>
                  <div className="text-xs text-gray-400">#{index + 1}</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="absolute inset-0 cursor-crosshair"
        style={{ paddingTop: '80px' }}
      >
        {/* Enhanced Falling Tokens */}
        {tokens.map(token => (
          <div
            key={token.id}
            className={`absolute ${token.color} rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer transition-all shadow-lg ${
              token.pulse ? 'animate-pulse' : ''
            } hover:scale-110`}
            style={{
              left: `${token.x}px`,
              top: `${token.y}px`,
              width: `${token.size}px`,
              height: `${token.size}px`,
              transform: `rotate(${token.rotation}deg)`,
              boxShadow: token.type === 'bonus' ? '0 0 20px rgba(255, 255, 255, 0.5)' : undefined,
            }}
            onClick={() => handleTokenClick(token.id)}
          >
            {token.type === 'normal' || token.type === 'bonus' ? (
              token.value
            ) : (
              getTokenIcon(token.type)
            )}
          </div>
        ))}

        {/* Enhanced Particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute font-bold text-sm pointer-events-none"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              opacity: particle.life,
              transform: `scale(${particle.life})`,
              color: particle.type === 'bomb' ? '#ef4444' : '#fbbf24',
            }}
          >
            {particle.value > 0 ? `+${particle.value}` : particle.type === 'bomb' ? '💥' : '✨'}
          </div>
        ))}

        {/* Game Instructions */}
        {gameActive && tokens.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Coins className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-3xl font-bold mb-2">Get Ready!</h2>
              <p className="text-xl text-gray-300 mb-4">Click the falling GOR tokens to collect them!</p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 max-w-md">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs">1</div>
                  <span>Normal tokens</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center text-xs">10</div>
                  <span>Bonus tokens</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                    <Zap className="w-3 h-3" />
                  </div>
                  <span>Multiplier boost</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                    <Shield className="w-3 h-3" />
                  </div>
                  <span>Shield protection</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Game Over Modal */}
      {!gameActive && <GameOverModal />}
    </div>
  );
};

export default GameArena;
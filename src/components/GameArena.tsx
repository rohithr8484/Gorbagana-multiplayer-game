import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../contexts/GameContext';
import { Coins, Clock, ArrowLeft, Zap, Star, Shield, Target, Trophy, User } from 'lucide-react';

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
  const [gameStarted, setGameStarted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [shields, setShields] = useState(0);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [comboText, setComboText] = useState<string>('');
  const [tokensCollected, setTokensCollected] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [particles, setParticles] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(3);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Start game countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setGameStarted(true);
    }
  }, [countdown]);

  // Enhanced token generation with BIGGER sizes for easier gameplay
  const generateToken = useCallback(() => {
    if (!gameAreaRef.current || !gameStarted || !gameActive) return;
    
    const gameArea = gameAreaRef.current.getBoundingClientRect();
    const tokenTypes = [
      { value: 1, color: 'bg-yellow-400', type: 'normal', weight: 50, size: 60 },
      { value: 5, color: 'bg-blue-400', type: 'normal', weight: 30, size: 65 },
      { value: 10, color: 'bg-purple-400', type: 'bonus', weight: 12, size: 70 },
      { value: 25, color: 'bg-red-400', type: 'bonus', weight: 5, size: 75 },
      { value: 0, color: 'bg-green-400', type: 'multiplier', weight: 2, size: 65 },
      { value: -10, color: 'bg-gray-800', type: 'bomb', weight: 1, size: 60 },
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
      speed: Math.random() * 1.5 + 1.5, // Speed: 1.5-3 pixels per frame
      color: selectedType.color,
      type: selectedType.type as any,
      size: selectedType.size,
      rotation: 0,
      pulse: selectedType.type !== 'normal',
    };
    
    setTokens(prev => [...prev, newToken]);
  }, [gameStarted, gameActive]);

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
        setTokensCollected(prev => prev + 1);
        
        // Update highest streak
        if (newStreak > highestStreak) {
          setHighestStreak(newStreak);
        }
        
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

    // Update score immediately
    const newScore = Math.max(0, score + scoreGain);
    setScore(newScore);
    setStreak(newStreak);
    setMultiplier(newMultiplier);
    setShields(newShields);
    setComboText(comboMessage);
    
    // Clear combo text after 2 seconds
    setTimeout(() => setComboText(''), 2000);

    // Remove the clicked token immediately
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
    checkAchievements(newStreak, newScore, newMultiplier);
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
  };

  // Enhanced token updates with rotation - ENSURE TOKENS FALL TO BOTTOM
  const updateTokens = useCallback(() => {
    setTokens(prevTokens => {
      return prevTokens
        .map(token => ({ 
          ...token, 
          y: token.y + token.speed,
          rotation: token.rotation + (token.pulse ? 3 : 1)
        }))
        .filter(token => token.y < window.innerHeight + 100); // Allow tokens to fall completely off screen
    });
  }, []);

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

  // Game loop - runs at 60fps
  useEffect(() => {
    if (!gameActive || !gameStarted) return;

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
  }, [gameActive, gameStarted, updateTokens, updateParticles]);

  // Token generation - slower for easier gameplay
  useEffect(() => {
    if (!gameActive || !gameStarted) return;

    const interval = setInterval(() => {
      generateToken();
    }, 1000); // Generate a token every 1 second

    return () => clearInterval(interval);
  }, [gameActive, gameStarted, generateToken]);

  // Timer
  useEffect(() => {
    if (!gameActive || !gameStarted) return;

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
  }, [gameActive, gameStarted]);

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
      case 'multiplier': return <Zap className="w-6 h-6" />;
      case 'shield': return <Shield className="w-6 h-6" />;
      case 'time': return <Clock className="w-6 h-6" />;
      case 'bomb': return <Target className="w-6 h-6" />;
      default: return null;
    }
  };

  const GameOverModal = () => {
    const earnedGOR = Math.max(0, score * 2);
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Coins className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
            <div className="space-y-3 mb-6">
              <p className="text-2xl text-yellow-400 font-bold">Final Score: {score}</p>
              <p className="text-green-400 font-bold">GOR Earned: +{earnedGOR}</p>
              <p className="text-gray-300">Tokens Collected: {tokensCollected}</p>
              <p className="text-gray-300">Best Streak: {highestStreak}</p>
              <p className="text-gray-300">Max Multiplier: x{multiplier}</p>
              
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
                  setGameStarted(false);
                  setCountdown(3);
                  setTokens([]);
                  setStreak(0);
                  setMultiplier(1);
                  setShields(0);
                  setAchievements([]);
                  setTokensCollected(0);
                  setHighestStreak(0);
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
      {/* Countdown Overlay */}
      {countdown > 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-8xl font-bold text-white mb-4 animate-pulse">
              {countdown}
            </div>
            <p className="text-2xl text-gray-300">Get Ready!</p>
          </div>
        </div>
      )}

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
          </div>
        </div>
      </div>

      {/* User Scoreboard */}
      <div className="absolute top-20 right-4 z-20 bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-4 w-64">
        <h3 className="text-white font-bold mb-3 flex items-center">
          <User className="w-4 h-4 mr-2 text-blue-400" />
          Your Stats
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
            <div className="flex items-center space-x-2">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Score</span>
            </div>
            <span className="text-yellow-400 font-bold">{score}</span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Collected</span>
            </div>
            <span className="text-green-400 font-bold">{tokensCollected}</span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-300">Current Streak</span>
            </div>
            <span className="text-orange-400 font-bold">{streak}</span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">Best Streak</span>
            </div>
            <span className="text-purple-400 font-bold">{highestStreak}</span>
          </div>
          
          {multiplier > 1 && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-purple-600/20">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">Multiplier</span>
              </div>
              <span className="text-purple-400 font-bold">x{multiplier}</span>
            </div>
          )}
          
          {shields > 0 && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-600/20">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-gray-300">Shields</span>
              </div>
              <span className="text-cyan-400 font-bold">{shields}</span>
            </div>
          )}
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

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="absolute inset-0 cursor-crosshair"
        style={{ paddingTop: '80px' }}
      >
        {/* Enhanced Falling Tokens - BIGGER SIZES */}
        {tokens.map(token => (
          <div
            key={token.id}
            className={`absolute ${token.color} rounded-full flex items-center justify-center text-white font-bold text-lg cursor-pointer transition-all shadow-lg ${
              token.pulse ? 'animate-pulse' : ''
            } hover:scale-110 border-2 border-white/20`}
            style={{
              left: `${token.x}px`,
              top: `${token.y}px`,
              width: `${token.size}px`,
              height: `${token.size}px`,
              transform: `rotate(${token.rotation}deg)`,
              boxShadow: token.type === 'bonus' ? '0 0 20px rgba(255, 255, 255, 0.5)' : '0 4px 15px rgba(0, 0, 0, 0.3)',
            }}
            onClick={() => handleTokenClick(token.id)}
          >
            {token.type === 'normal' || token.type === 'bonus' ? (
              <span className="text-lg font-bold">{token.value}</span>
            ) : (
              getTokenIcon(token.type)
            )}
          </div>
        ))}

        {/* Enhanced Particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute font-bold text-lg pointer-events-none"
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
        {gameActive && gameStarted && tokens.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Coins className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-3xl font-bold mb-2">Tokens incoming!</h2>
              <p className="text-xl text-gray-300 mb-4">Click the falling tokens to collect them!</p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 max-w-md">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <span>Basic tokens</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center text-sm font-bold">10</div>
                  <span>Bonus tokens</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span>Multiplier boost</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4" />
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
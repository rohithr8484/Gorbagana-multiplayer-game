import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../contexts/GameContext';
import { Coins, Users, Clock, Trophy, ArrowLeft } from 'lucide-react';

interface Token {
  id: string;
  x: number;
  y: number;
  value: number;
  speed: number;
  color: string;
}

interface Player {
  id: string;
  name: string;
  score: number;
  avatar: string;
}

const GameArena: React.FC = () => {
  const { setCurrentScreen, gameState, setGameState } = useGame();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(true);
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'You', score: 0, avatar: '🎮' },
    { id: '2', name: 'Player2', score: 0, avatar: '🚀' },
    { id: '3', name: 'Player3', score: 0, avatar: '⚡' },
    { id: '4', name: 'Player4', score: 0, avatar: '🔥' },
  ]);
  const [particles, setParticles] = useState<any[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Generate random tokens
  const generateToken = useCallback(() => {
    if (!gameAreaRef.current) return;
    
    const gameArea = gameAreaRef.current.getBoundingClientRect();
    const tokenTypes = [
      { value: 1, color: 'bg-yellow-400', weight: 50 },
      { value: 5, color: 'bg-blue-400', weight: 30 },
      { value: 10, color: 'bg-purple-400', weight: 15 },
      { value: 25, color: 'bg-red-400', weight: 5 },
    ];
    
    const randomType = tokenTypes[Math.floor(Math.random() * tokenTypes.length)];
    
    const newToken: Token = {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (gameArea.width - 40),
      y: -40,
      value: randomType.value,
      speed: Math.random() * 2 + 1,
      color: randomType.color,
    };
    
    setTokens(prev => [...prev, newToken]);
  }, []);

  // Update token positions
  const updateTokens = useCallback(() => {
    setTokens(prevTokens => {
      return prevTokens
        .map(token => ({ ...token, y: token.y + token.speed }))
        .filter(token => token.y < window.innerHeight);
    });

    // Update opponent scores (simulated)
    setPlayers(prev => prev.map(player => {
      if (player.id !== '1') {
        const increase = Math.random() < 0.1 ? Math.floor(Math.random() * 5) + 1 : 0;
        return { ...player, score: player.score + increase };
      }
      return { ...player, score };
    }));
  }, [score]);

  // Handle token click
  const handleTokenClick = (tokenId: string) => {
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;

    setScore(prev => prev + token.value);
    setTokens(prev => prev.filter(t => t.id !== tokenId));

    // Create particle effect
    const newParticles = Array.from({ length: 5 }, (_, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      x: token.x,
      y: token.y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life: 1,
      value: token.value,
    }));
    
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Update particles
  const updateParticles = useCallback(() => {
    setParticles(prev => 
      prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
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

  // Token generation
  useEffect(() => {
    if (!gameActive) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.7) {
        generateToken();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameActive, generateToken]);

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

  const GameOverModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
          <div className="space-y-2 mb-6">
            <p className="text-2xl text-yellow-400 font-bold">Final Score: {score}</p>
            <p className="text-gray-300">Tokens Collected: {score}</p>
            <p className="text-gray-300">Rank: #{players.sort((a, b) => b.score - a.score).findIndex(p => p.id === '1') + 1} of {players.length}</p>
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Game Header */}
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
            </div>
            <div className="flex items-center space-x-2 text-white">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-xl font-mono">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-white">
            <Users className="w-5 h-5 text-green-400" />
            <span>{players.length} Players</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Sidebar */}
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
                  <span className={`text-sm ${player.id === '1' ? 'text-white font-bold' : 'text-gray-300'}`}>
                    {player.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400 font-bold">{player.score}</span>
                  <span className="text-xs text-gray-400">#{index + 1}</span>
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
        {/* Falling Tokens */}
        {tokens.map(token => (
          <div
            key={token.id}
            className={`absolute w-10 h-10 ${token.color} rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer transform hover:scale-110 transition-transform shadow-lg animate-pulse`}
            style={{
              left: `${token.x}px`,
              top: `${token.y}px`,
            }}
            onClick={() => handleTokenClick(token.id)}
          >
            {token.value}
          </div>
        ))}

        {/* Particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute text-yellow-400 font-bold text-sm pointer-events-none"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              opacity: particle.life,
              transform: `scale(${particle.life})`,
            }}
          >
            +{particle.value}
          </div>
        ))}

        {/* Game Instructions */}
        {gameActive && tokens.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Coins className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-3xl font-bold mb-2">Get Ready!</h2>
              <p className="text-xl text-gray-300">Click the falling GOR tokens to collect them!</p>
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
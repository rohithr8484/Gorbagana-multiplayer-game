import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, TrendingUp, Users, Clock, Zap, Shield, Target, Gift } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  player: string;
  score: number;
  tokens: number;
  games: number;
  winRate: number;
  avatar: string;
  trending: 'up' | 'down' | 'same';
  streak: number;
  achievements: string[];
  gorEarned: number;
}

const Leaderboard: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'allTime'>('daily');
  const [category, setCategory] = useState<'score' | 'earnings' | 'games'>('score');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Enhanced mock leaderboard data
    const mockData: LeaderboardEntry[] = [
      { 
        rank: 1, 
        player: 'TokenMaster', 
        score: 2847, 
        tokens: 15420, 
        games: 48, 
        winRate: 89, 
        avatar: '👑', 
        trending: 'up',
        streak: 23,
        achievements: ['streak_master', 'high_scorer', 'multiplier_king'],
        gorEarned: 5240
      },
      { 
        rank: 2, 
        player: 'GORCollector', 
        score: 2563, 
        tokens: 13890, 
        games: 52, 
        winRate: 76, 
        avatar: '🚀', 
        trending: 'up',
        streak: 18,
        achievements: ['consistent_player', 'token_hunter'],
        gorEarned: 4890
      },
      { 
        rank: 3, 
        player: 'SpeedRunner', 
        score: 2341, 
        tokens: 12670, 
        games: 44, 
        winRate: 82, 
        avatar: '⚡', 
        trending: 'same',
        streak: 15,
        achievements: ['speed_demon', 'combo_master'],
        gorEarned: 4320
      },
      { 
        rank: 4, 
        player: 'CoinHunter', 
        score: 2198, 
        tokens: 11230, 
        games: 56, 
        winRate: 71, 
        avatar: '🎯', 
        trending: 'down',
        streak: 12,
        achievements: ['dedicated_player'],
        gorEarned: 3980
      },
      { 
        rank: 5, 
        player: 'You', 
        score: 1876, 
        tokens: 9840, 
        games: 23, 
        winRate: 65, 
        avatar: '🎮', 
        trending: 'up',
        streak: 8,
        achievements: ['rising_star'],
        gorEarned: 2340
      },
      { 
        rank: 6, 
        player: 'FastClicker', 
        score: 1654, 
        tokens: 8760, 
        games: 38, 
        winRate: 68, 
        avatar: '🔥', 
        trending: 'up',
        streak: 6,
        achievements: ['quick_fingers'],
        gorEarned: 2100
      },
      { 
        rank: 7, 
        player: 'TokenKing', 
        score: 1543, 
        tokens: 8120, 
        games: 41, 
        winRate: 63, 
        avatar: '💎', 
        trending: 'down',
        streak: 4,
        achievements: ['veteran_player'],
        gorEarned: 1890
      },
      { 
        rank: 8, 
        player: 'GORGrabber', 
        score: 1432, 
        tokens: 7580, 
        games: 35, 
        winRate: 69, 
        avatar: '🎪', 
        trending: 'same',
        streak: 7,
        achievements: ['consistent_earner'],
        gorEarned: 1750
      },
      { 
        rank: 9, 
        player: 'ClickMaster', 
        score: 1321, 
        tokens: 6940, 
        games: 29, 
        winRate: 72, 
        avatar: '🎨', 
        trending: 'up',
        streak: 5,
        achievements: ['precision_player'],
        gorEarned: 1620
      },
      { 
        rank: 10, 
        player: 'TokenNinja', 
        score: 1234, 
        tokens: 6450, 
        games: 33, 
        winRate: 58, 
        avatar: '🥷', 
        trending: 'down',
        streak: 3,
        achievements: ['stealth_collector'],
        gorEarned: 1450
      },
    ];

    // Sort based on category
    const sortedData = [...mockData].sort((a, b) => {
      switch (category) {
        case 'earnings':
          return b.gorEarned - a.gorEarned;
        case 'games':
          return b.games - a.games;
        default:
          return b.score - a.score;
      }
    });

    setLeaderboardData(sortedData.map((entry, index) => ({ ...entry, rank: index + 1 })));
  }, [timeFrame, category]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-gray-400 font-bold">#{rank}</span>;
    }
  };

  const getTrendingIcon = (trending: string) => {
    switch (trending) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>;
    }
  };

  const getRowBackground = (entry: LeaderboardEntry) => {
    if (entry.player === 'You') {
      return 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-400/30';
    }
    if (entry.rank <= 3) {
      return 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-400/20';
    }
    return 'bg-white/5 border-white/10';
  };

  const getAchievementIcon = (achievement: string) => {
    switch (achievement) {
      case 'streak_master': return <Zap className="w-3 h-3 text-yellow-400" />;
      case 'high_scorer': return <Trophy className="w-3 h-3 text-gold-400" />;
      case 'multiplier_king': return <Star className="w-3 h-3 text-purple-400" />;
      case 'speed_demon': return <Target className="w-3 h-3 text-red-400" />;
      case 'shield_master': return <Shield className="w-3 h-3 text-cyan-400" />;
      default: return <Star className="w-3 h-3 text-blue-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Leaderboard */}
        <div className="lg:col-span-3">
          {/* Header */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Global Leaderboard</h1>
                  <p className="text-gray-300">Compete with players worldwide for GOR rewards</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {(['daily', 'weekly', 'allTime'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeFrame(period)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      timeFrame === period
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {period === 'allTime' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Category Filters */}
            <div className="flex space-x-2">
              {([
                { key: 'score', label: 'High Score', icon: Trophy },
                { key: 'earnings', label: 'GOR Earned', icon: Gift },
                { key: 'games', label: 'Games Played', icon: Users }
              ] as const).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all ${
                    category === key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-7 gap-4 text-gray-400 text-sm font-medium mb-4">
                <div>Rank</div>
                <div>Player</div>
                <div>Score</div>
                <div>GOR Earned</div>
                <div>Win Rate</div>
                <div>Streak</div>
                <div>Trend</div>
              </div>
              
              <div className="space-y-3">
                {leaderboardData.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`grid grid-cols-7 gap-4 items-center p-4 rounded-lg border transition-all hover:bg-white/5 ${getRowBackground(entry)}`}
                  >
                    <div className="flex items-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{entry.avatar}</span>
                      <div>
                        <div className={`font-bold ${entry.player === 'You' ? 'text-purple-400' : 'text-white'}`}>
                          {entry.player}
                        </div>
                        <div className="flex space-x-1">
                          {entry.achievements.slice(0, 3).map((achievement, index) => (
                            <div key={index} title={achievement}>
                              {getAchievementIcon(achievement)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-white font-bold text-lg">
                      {entry.score.toLocaleString()}
                    </div>
                    
                    <div className="text-yellow-400 font-medium">
                      {entry.gorEarned.toLocaleString()}
                    </div>
                    
                    <div className="text-green-400 font-medium">
                      {entry.winRate}%
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-400 font-bold">{entry.streak}</span>
                    </div>
                    
                    <div className="flex items-center">
                      {getTrendingIcon(entry.trending)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-6">
          {/* Top Players Podium */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              Champions Podium
            </h3>
            <div className="space-y-4">
              {leaderboardData.slice(0, 3).map((entry) => (
                <div key={entry.rank} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                  <div className="flex-shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold">{entry.player}</div>
                    <div className="text-yellow-400 text-sm">{entry.gorEarned.toLocaleString()} GOR earned</div>
                    <div className="flex space-x-1 mt-1">
                      {entry.achievements.slice(0, 2).map((achievement, index) => (
                        <div key={index} title={achievement}>
                          {getAchievementIcon(achievement)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-2xl">{entry.avatar}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tournament Schedule */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-400" />
              Upcoming Tournaments
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <div className="text-purple-400 font-bold">Mega Tournament</div>
                <div className="text-white text-sm">Prize Pool: 10,000 GOR</div>
                <div className="text-gray-400 text-xs">Starts in 2 hours</div>
              </div>
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <div className="text-blue-400 font-bold">Speed Challenge</div>
                <div className="text-white text-sm">Prize Pool: 5,000 GOR</div>
                <div className="text-gray-400 text-xs">Starts in 6 hours</div>
              </div>
              <div className="p-3 bg-green-600/20 rounded-lg">
                <div className="text-green-400 font-bold">Daily Championship</div>
                <div className="text-white text-sm">Prize Pool: 2,500 GOR</div>
                <div className="text-gray-400 text-xs">Starts in 12 hours</div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Network Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Total Players
                </span>
                <span className="text-blue-400 font-bold">12,847</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Games Today</span>
                <span className="text-green-400 font-bold">8,921</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">GOR Distributed</span>
                <span className="text-yellow-400 font-bold">487K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Average Score</span>
                <span className="text-purple-400 font-bold">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Record Streak</span>
                <span className="text-orange-400 font-bold">47x</span>
              </div>
            </div>
          </div>

          {/* Rewards Structure */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Gift className="w-5 h-5 mr-2 text-yellow-400" />
              Reward Tiers
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-2 bg-yellow-500/10 rounded">
                <span className="text-gray-300 flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                  Champion (Top 1%)
                </span>
                <span className="text-yellow-400 font-bold">1000+ GOR</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-500/10 rounded">
                <span className="text-gray-300 flex items-center">
                  <Medal className="w-4 h-4 mr-2 text-gray-400" />
                  Elite (Top 5%)
                </span>
                <span className="text-gray-400 font-bold">500+ GOR</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-amber-600/10 rounded">
                <span className="text-gray-300 flex items-center">
                  <Medal className="w-4 h-4 mr-2 text-amber-600" />
                  Pro (Top 10%)
                </span>
                <span className="text-amber-600 font-bold">250+ GOR</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-500/10 rounded">
                <span className="text-gray-300 flex items-center">
                  <Star className="w-4 h-4 mr-2 text-blue-400" />
                  Rising (Top 25%)
                </span>
                <span className="text-blue-400 font-bold">100+ GOR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
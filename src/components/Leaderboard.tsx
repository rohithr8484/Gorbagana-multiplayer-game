import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, TrendingUp, Users, Clock } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  player: string;
  score: number;
  tokens: number;
  games: number;
  winRate: number;
  avatar: string;
  trending: 'up' | 'down' | 'same';
}

const Leaderboard: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'allTime'>('daily');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Mock leaderboard data
    const mockData: LeaderboardEntry[] = [
      { rank: 1, player: 'TokenMaster', score: 2847, tokens: 15420, games: 48, winRate: 89, avatar: '👑', trending: 'up' },
      { rank: 2, player: 'GORCollector', score: 2563, tokens: 13890, games: 52, winRate: 76, avatar: '🚀', trending: 'up' },
      { rank: 3, player: 'SpeedRunner', score: 2341, tokens: 12670, games: 44, winRate: 82, avatar: '⚡', trending: 'same' },
      { rank: 4, player: 'CoinHunter', score: 2198, tokens: 11230, games: 56, winRate: 71, avatar: '🎯', trending: 'down' },
      { rank: 5, player: 'You', score: 1876, tokens: 9840, games: 23, winRate: 65, avatar: '🎮', trending: 'up' },
      { rank: 6, player: 'FastClicker', score: 1654, tokens: 8760, games: 38, winRate: 68, avatar: '🔥', trending: 'up' },
      { rank: 7, player: 'TokenKing', score: 1543, tokens: 8120, games: 41, winRate: 63, avatar: '💎', trending: 'down' },
      { rank: 8, player: 'GORGrabber', score: 1432, tokens: 7580, games: 35, winRate: 69, avatar: '🎪', trending: 'same' },
      { rank: 9, player: 'ClickMaster', score: 1321, tokens: 6940, games: 29, winRate: 72, avatar: '🎨', trending: 'up' },
      { rank: 10, player: 'TokenNinja', score: 1234, tokens: 6450, games: 33, winRate: 58, avatar: '🥷', trending: 'down' },
    ];

    setLeaderboardData(mockData);
  }, [timeFrame]);

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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Leaderboard */}
        <div className="lg:col-span-3">
          {/* Header */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Global Leaderboard</h1>
                  <p className="text-gray-300">Compete with players worldwide</p>
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
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-6 gap-4 text-gray-400 text-sm font-medium mb-4">
                <div>Rank</div>
                <div>Player</div>
                <div>High Score</div>
                <div>Total Tokens</div>
                <div>Win Rate</div>
                <div>Trend</div>
              </div>
              
              <div className="space-y-3">
                {leaderboardData.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`grid grid-cols-6 gap-4 items-center p-4 rounded-lg border transition-all hover:bg-white/5 ${getRowBackground(entry)}`}
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
                        <div className="text-xs text-gray-400">{entry.games} games</div>
                      </div>
                    </div>
                    
                    <div className="text-white font-bold text-lg">
                      {entry.score.toLocaleString()}
                    </div>
                    
                    <div className="text-yellow-400 font-medium">
                      {entry.tokens.toLocaleString()}
                    </div>
                    
                    <div className="text-green-400 font-medium">
                      {entry.winRate}%
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Players */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              Top 3 Players
            </h3>
            <div className="space-y-4">
              {leaderboardData.slice(0, 3).map((entry) => (
                <div key={entry.rank} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold">{entry.player}</div>
                    <div className="text-yellow-400 text-sm">{entry.score.toLocaleString()} points</div>
                  </div>
                  <div className="text-2xl">{entry.avatar}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Active Players
                </span>
                <span className="text-blue-400 font-bold">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Games Today</span>
                <span className="text-green-400 font-bold">3,891</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Tokens Collected</span>
                <span className="text-yellow-400 font-bold">156K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Average Score</span>
                <span className="text-purple-400 font-bold">847</span>
              </div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">New Record!</div>
                  <div className="text-gray-400 text-xs">TokenMaster scored 2,847</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">Milestone</div>
                  <div className="text-gray-400 text-xs">100K tokens collected today</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">Community</div>
                  <div className="text-gray-400 text-xs">1000+ players online</div>
                </div>
              </div>
            </div>
          </div>

          {/* Rewards */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Weekly Rewards</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">🥇 1st Place</span>
                <span className="text-yellow-400 font-bold">1000 GOR</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">🥈 2nd Place</span>
                <span className="text-gray-400 font-bold">500 GOR</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">🥉 3rd Place</span>
                <span className="text-amber-600 font-bold">250 GOR</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Top 10</span>
                <span className="text-blue-400 font-bold">50 GOR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
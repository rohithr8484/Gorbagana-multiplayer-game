import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { GorbaganaRPC, formatGOR, PlayerGORBalance, GorbaganaTransaction } from '../utils/gorbaganaRPC';
import { Zap, Coins, Activity, CheckCircle, XCircle, Clock, Trophy, Gift, ExternalLink } from 'lucide-react';

interface GorbaganaIntegrationProps {
  onClose: () => void;
}

const GorbaganaIntegration: React.FC<GorbaganaIntegrationProps> = ({ onClose }) => {
  const wallet = useWallet();
  const [gorbaganaRPC, setGorbaganaRPC] = useState<GorbaganaRPC | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [gorBalance, setGorBalance] = useState<PlayerGORBalance | null>(null);
  const [transactions, setTransactions] = useState<GorbaganaTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      const rpc = new GorbaganaRPC(wallet);
      setGorbaganaRPC(rpc);
    }
  }, [wallet.connected, wallet.publicKey]);

  const connectToGorbagana = async () => {
    if (!gorbaganaRPC) return;

    setLoading(true);
    setConnectionStatus('connecting');

    try {
      const result = await gorbaganaRPC.connectToGorbaganaTestnet();
      
      if (result.success) {
        setConnectionStatus('connected');
        setNetworkInfo(result.networkInfo);
        
        // Load balance and transaction history
        await loadGORBalance();
        await loadTransactionHistory();
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const loadGORBalance = async () => {
    if (!gorbaganaRPC) return;

    try {
      const balance = await gorbaganaRPC.getGORBalance();
      setGorBalance(balance);
    } catch (error) {
      console.error('Failed to load GOR balance:', error);
    }
  };

  const loadTransactionHistory = async () => {
    if (!gorbaganaRPC) return;

    try {
      const history = await gorbaganaRPC.getTransactionHistory();
      setTransactions(history);
    } catch (error) {
      console.error('Failed to load transaction history:', error);
    }
  };

  const claimDailyBonus = async () => {
    if (!gorbaganaRPC) return;

    setLoading(true);
    try {
      const transaction = await gorbaganaRPC.claimDailyBonus();
      
      if (transaction.status === 'confirmed') {
        // Update balance and transaction history
        await loadGORBalance();
        await loadTransactionHistory();
      }
    } catch (error) {
      console.error('Failed to claim daily bonus:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'connecting':
        return <Clock className="w-5 h-5 text-yellow-400 animate-spin" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected to Gorbagana Testnet';
      case 'connecting':
        return 'Connecting to Gorbagana Testnet...';
      case 'error':
        return 'Connection Failed';
      default:
        return 'Not Connected';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'reward':
        return <Trophy className="w-4 h-4 text-green-400" />;
      case 'entry_fee':
        return <Coins className="w-4 h-4 text-red-400" />;
      case 'daily_bonus':
        return <Gift className="w-4 h-4 text-yellow-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Gorbagana Testnet Integration</h2>
              <p className="text-gray-300">Connect to Gorbagana's native testnet for GOR token functionality</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Connection Status */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <span className="text-white font-medium">{getStatusText()}</span>
            </div>
            {connectionStatus !== 'connected' && (
              <button
                onClick={connectToGorbagana}
                disabled={loading || connectionStatus === 'connecting'}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
              >
                {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect to Gorbagana'}
              </button>
            )}
          </div>

          {networkInfo && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">RPC Endpoint:</span>
                <p className="text-white font-mono text-xs break-all">{networkInfo.rpcEndpoint}</p>
              </div>
              <div>
                <span className="text-gray-400">Network:</span>
                <p className="text-white capitalize">{networkInfo.network}</p>
              </div>
              <div>
                <span className="text-gray-400">Solana Version:</span>
                <p className="text-white">{networkInfo.solanaVersion}</p>
              </div>
              <div>
                <span className="text-gray-400">Current Slot:</span>
                <p className="text-white">{networkInfo.currentSlot?.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {connectionStatus === 'connected' && (
          <>
            {/* GOR Balance */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Coins className="w-5 h-5 mr-2 text-yellow-400" />
                  GOR Balance
                </h3>
                <button
                  onClick={loadGORBalance}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Refresh
                </button>
              </div>
              
              {gorBalance && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-yellow-400">{formatGOR(gorBalance.balance)}</p>
                    <p className="text-gray-400 text-sm">Last updated: {gorBalance.lastUpdated.toLocaleTimeString()}</p>
                  </div>
                  <button
                    onClick={claimDailyBonus}
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50"
                  >
                    <Gift className="w-4 h-4 inline mr-2" />
                    Claim Daily +50 GOR
                  </button>
                </div>
              )}
            </div>

            {/* Game Entry Fees */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-purple-400" />
                Game Entry Fees & Rewards
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-600/20 border border-blue-400/30 rounded-lg p-3">
                  <h4 className="font-bold text-blue-400">Blitz Rush</h4>
                  <p className="text-white">Entry: 10 GOR</p>
                  <p className="text-green-400 text-sm">Rewards: 5-50 GOR</p>
                </div>
                <div className="bg-purple-600/20 border border-purple-400/30 rounded-lg p-3">
                  <h4 className="font-bold text-purple-400">Endurance Race</h4>
                  <p className="text-white">Entry: 25 GOR</p>
                  <p className="text-green-400 text-sm">Rewards: 15-150 GOR</p>
                </div>
                <div className="bg-orange-600/20 border border-orange-400/30 rounded-lg p-3">
                  <h4 className="font-bold text-orange-400">Tournament</h4>
                  <p className="text-white">Entry: 50 GOR</p>
                  <p className="text-green-400 text-sm">Rewards: 25-500 GOR</p>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-400" />
                  Recent Transactions
                </h3>
                <button
                  onClick={loadTransactionHistory}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Refresh
                </button>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {transactions.length > 0 ? (
                  transactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(tx.type)}
                        <div>
                          <p className="text-white font-medium capitalize">
                            {tx.type.replace('_', ' ')}
                            {tx.gameMode && ` (${tx.gameMode})`}
                          </p>
                          <p className="text-gray-400 text-sm">{tx.timestamp.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          tx.type === 'entry_fee' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {tx.type === 'entry_fee' ? '-' : '+'}{formatGOR(tx.amount)}
                        </p>
                        <div className="flex items-center space-x-1">
                          {tx.status === 'confirmed' ? (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          ) : tx.status === 'failed' ? (
                            <XCircle className="w-3 h-3 text-red-400" />
                          ) : (
                            <Clock className="w-3 h-3 text-yellow-400" />
                          )}
                          <span className="text-xs text-gray-400 capitalize">{tx.status}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">No transactions found</p>
                )}
              </div>
            </div>

            {/* External Links */}
            <div className="mt-6 flex justify-center space-x-4">
              <a
                href="https://faucet.gorbagana.wtf/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Gorbagana Faucet</span>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GorbaganaIntegration;
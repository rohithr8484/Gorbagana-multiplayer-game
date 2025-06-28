import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

// Gorbagana Testnet Configuration
export const GORBAGANA_CONFIG = {
  RPC_ENDPOINT: 'https://api.testnet.solana.com', // Updated to use valid Solana testnet RPC
  NETWORK: 'testnet',
  GOR_TOKEN_MINT: 'GORTokenMintAddressHere', // Replace with actual GOR token mint address
  GAME_TREASURY: '11111111111111111111111111111112', // Valid Solana system program address for testnet
};

// Game Entry Fees in GOR tokens
export const ENTRY_FEES = {
  blitz: 10,      // 10 GOR for Blitz Rush
  endurance: 25,  // 25 GOR for Endurance Race
  tournament: 50, // 50 GOR for Tournament Mode
};

// Reward multipliers based on performance
export const REWARD_MULTIPLIERS = {
  blitz: { min: 5, max: 50 },      // 5-50 GOR rewards
  endurance: { min: 15, max: 150 }, // 15-150 GOR rewards
  tournament: { min: 25, max: 500 }, // 25-500 GOR rewards
};

export interface GorbaganaTransaction {
  signature: string;
  type: 'entry_fee' | 'reward' | 'daily_bonus';
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  gameMode?: string;
}

export interface PlayerGORBalance {
  balance: number;
  lastUpdated: Date;
  isBackpackWallet: boolean;
}

export class GorbaganaRPC {
  private connection: Connection;
  private wallet: WalletContextState;

  constructor(wallet: WalletContextState) {
    this.connection = new Connection(GORBAGANA_CONFIG.RPC_ENDPOINT, 'confirmed');
    this.wallet = wallet;
  }

  // Verify Backpack wallet is connected
  private verifyBackpackWallet(): boolean {
    if (!this.wallet.connected || !this.wallet.publicKey) {
      throw new Error('Backpack wallet not connected');
    }
    
    // Check if the connected wallet is Backpack
    const isBackpack = this.wallet.wallet?.adapter?.name === 'Backpack';
    if (!isBackpack) {
      throw new Error('Please connect using Backpack wallet only');
    }
    
    return true;
  }

  // Connect to Gorbagana Testnet and verify connection
  async connectToGorbaganaTestnet(): Promise<{ success: boolean; message: string; networkInfo?: any }> {
    try {
      // Verify Backpack wallet first
      this.verifyBackpackWallet();
      
      // Test connection to Gorbagana RPC
      const version = await this.connection.getVersion();
      const slot = await this.connection.getSlot();
      
      // Get network information
      const networkInfo = {
        rpcEndpoint: GORBAGANA_CONFIG.RPC_ENDPOINT,
        solanaVersion: version['solana-core'],
        currentSlot: slot,
        network: GORBAGANA_CONFIG.NETWORK,
        walletType: 'Backpack',
      };

      return {
        success: true,
        message: 'Successfully connected to Gorbagana Testnet with Backpack wallet!',
        networkInfo
      };
    } catch (error) {
      console.error('Failed to connect to Gorbagana testnet:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to connect to Gorbagana testnet. Please try again.',
      };
    }
  }

  // Get player's GOR token balance (simulated for testnet)
  async getGORBalance(): Promise<PlayerGORBalance> {
    try {
      this.verifyBackpackWallet();

      // In a real implementation, this would query the actual GOR SPL token balance
      // For testnet simulation, we'll create a realistic mock balance
      const walletAddress = this.wallet.publicKey!.toString();
      
      // Generate a consistent balance based on wallet address (for demo purposes)
      const addressHash = walletAddress.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      // Create a realistic GOR balance between 500-2000 GOR
      const baseBalance = 500 + Math.abs(addressHash % 1500);
      
      // Add some randomness for dynamic feel
      const variance = Math.floor(Math.random() * 200) - 100; // ±100 GOR variance
      const finalBalance = Math.max(0, baseBalance + variance);

      return {
        balance: finalBalance,
        lastUpdated: new Date(),
        isBackpackWallet: true,
      };
    } catch (error) {
      console.error('Failed to get GOR balance:', error);
      return {
        balance: 0,
        lastUpdated: new Date(),
        isBackpackWallet: false,
      };
    }
  }

  // Check if player has sufficient GOR tokens for entry fee
  async checkGORBalance(requiredAmount: number): Promise<{ hasEnough: boolean; currentBalance: number; message: string }> {
    try {
      this.verifyBackpackWallet();
      
      const balanceInfo = await this.getGORBalance();
      const hasEnough = balanceInfo.balance >= requiredAmount;
      
      return {
        hasEnough,
        currentBalance: balanceInfo.balance,
        message: hasEnough 
          ? `Sufficient GOR balance: ${formatGOR(balanceInfo.balance)}` 
          : `Insufficient GOR balance. You have ${formatGOR(balanceInfo.balance)} but need ${formatGOR(requiredAmount)}`
      };
    } catch (error) {
      console.error('Failed to check GOR balance:', error);
      return {
        hasEnough: false,
        currentBalance: 0,
        message: error instanceof Error ? error.message : 'Failed to check GOR balance'
      };
    }
  }

  // Pay entry fee in GOR tokens (simulated for testnet)
  async payEntryFee(gameMode: 'blitz' | 'endurance' | 'tournament'): Promise<GorbaganaTransaction> {
    try {
      this.verifyBackpackWallet();

      const entryFee = ENTRY_FEES[gameMode];
      
      // Check GOR balance first
      const balanceCheck = await this.checkGORBalance(entryFee);
      if (!balanceCheck.hasEnough) {
        throw new Error(balanceCheck.message);
      }
      
      // Simulate GOR token transfer for testnet environment
      // This prevents actual Solana transactions that would fail with invalid treasury address
      console.log(`Processing GOR payment: ${entryFee} GOR for ${gameMode} mode`);
      console.log(`Current GOR balance: ${balanceCheck.currentBalance} GOR`);
      
      // Add a realistic delay to simulate blockchain transaction processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate occasional transaction failures (5% chance) for realism
      if (Math.random() < 0.05) {
        throw new Error('Transaction failed due to network congestion. Please try again.');
      }
      
      // Generate a realistic transaction signature
      const mockSignature = `gor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        signature: mockSignature,
        type: 'entry_fee',
        amount: entryFee,
        status: 'confirmed',
        timestamp: new Date(),
        gameMode,
      };
    } catch (error) {
      console.error('Failed to pay entry fee:', error);
      return {
        signature: '',
        type: 'entry_fee',
        amount: ENTRY_FEES[gameMode],
        status: 'failed',
        timestamp: new Date(),
        gameMode,
      };
    }
  }

  // Distribute GOR rewards based on game performance
  async distributeRewards(gameResult: {
    score: number;
    gameMode: 'blitz' | 'endurance' | 'tournament';
    rank: number;
    totalPlayers: number;
  }): Promise<GorbaganaTransaction> {
    try {
      this.verifyBackpackWallet();

      // Calculate reward based on performance
      const reward = this.calculateGORReward(gameResult);

      // Simulate GOR reward distribution
      console.log(`Distributing GOR reward: ${reward} GOR for ${gameResult.gameMode} performance`);
      
      // Add delay to simulate blockchain processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockSignature = `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        signature: mockSignature,
        type: 'reward',
        amount: reward,
        status: 'confirmed',
        timestamp: new Date(),
        gameMode: gameResult.gameMode,
      };
    } catch (error) {
      console.error('Failed to distribute rewards:', error);
      return {
        signature: '',
        type: 'reward',
        amount: 0,
        status: 'failed',
        timestamp: new Date(),
        gameMode: gameResult.gameMode,
      };
    }
  }

  // Calculate GOR reward based on game performance
  private calculateGORReward(gameResult: {
    score: number;
    gameMode: 'blitz' | 'endurance' | 'tournament';
    rank: number;
    totalPlayers: number;
  }): number {
    const { score, gameMode, rank, totalPlayers } = gameResult;
    const multipliers = REWARD_MULTIPLIERS[gameMode];
    
    // Base reward calculation
    let baseReward = multipliers.min;
    
    // Performance-based multiplier (score factor)
    const scoreMultiplier = Math.min(score / 500, 3); // Up to 3x for high scores
    
    // Rank-based bonus (better rank = higher reward)
    const rankBonus = Math.max(0, (totalPlayers - rank + 1) / totalPlayers);
    
    // Calculate final reward
    const finalReward = Math.floor(baseReward * (1 + scoreMultiplier + rankBonus));
    
    // Cap at maximum reward for game mode
    return Math.min(finalReward, multipliers.max);
  }

  // Claim daily GOR bonus
  async claimDailyBonus(): Promise<GorbaganaTransaction> {
    try {
      this.verifyBackpackWallet();

      const bonusAmount = 50; // 50 GOR daily bonus
      
      // Simulate daily bonus claim with GOR tokens
      console.log(`Claiming daily GOR bonus: ${bonusAmount} GOR`);
      
      // Add delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockSignature = `daily_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        signature: mockSignature,
        type: 'daily_bonus',
        amount: bonusAmount,
        status: 'confirmed',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Failed to claim daily bonus:', error);
      return {
        signature: '',
        type: 'daily_bonus',
        amount: 0,
        status: 'failed',
        timestamp: new Date(),
      };
    }
  }

  // Get transaction history for the connected wallet
  async getTransactionHistory(): Promise<GorbaganaTransaction[]> {
    try {
      this.verifyBackpackWallet();

      // Generate realistic mock transaction history for the connected wallet
      const walletAddress = this.wallet.publicKey!.toString();
      
      // Create deterministic but varied transaction history based on wallet address
      const addressSeed = walletAddress.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      
      const mockTransactions: GorbaganaTransaction[] = [];
      
      // Generate 5-10 recent transactions
      const transactionCount = 5 + (addressSeed % 6);
      
      for (let i = 0; i < transactionCount; i++) {
        const isReward = (addressSeed + i) % 3 !== 0; // 2/3 chance of reward, 1/3 chance of entry fee
        const gameMode = ['blitz', 'endurance', 'tournament'][(addressSeed + i) % 3] as 'blitz' | 'endurance' | 'tournament';
        
        mockTransactions.push({
          signature: `tx_${addressSeed}_${i}_${Date.now()}`,
          type: isReward ? 'reward' : 'entry_fee',
          amount: isReward ? 25 + (addressSeed + i) % 100 : ENTRY_FEES[gameMode],
          status: 'confirmed',
          timestamp: new Date(Date.now() - (i + 1) * 3600000), // Hours ago
          gameMode,
        });
      }
      
      // Add a daily bonus transaction
      mockTransactions.unshift({
        signature: `daily_${addressSeed}_${Date.now()}`,
        type: 'daily_bonus',
        amount: 50,
        status: 'confirmed',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
      });

      return mockTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return [];
    }
  }

  // Validate game result to prevent cheating
  async validateGameResult(gameResult: {
    score: number;
    coinsCollected: number;
    gameMode: string;
    duration: number;
    streakAchieved: number;
  }): Promise<boolean> {
    try {
      this.verifyBackpackWallet();
      
      // Enhanced anti-cheat validation for GOR token games
      const maxPossibleScore = gameResult.duration * 15; // Max 15 points per second
      const isScoreRealistic = gameResult.score <= maxPossibleScore;
      const isStreakRealistic = gameResult.streakAchieved <= gameResult.coinsCollected;
      const isDurationValid = gameResult.duration > 0 && gameResult.duration <= 600; // Max 10 minutes
      const isCollectionRealistic = gameResult.coinsCollected <= gameResult.duration / 2; // Max 1 coin per 2 seconds

      const isValid = isScoreRealistic && isStreakRealistic && isDurationValid && isCollectionRealistic;
      
      if (!isValid) {
        console.warn('Game result validation failed:', {
          isScoreRealistic,
          isStreakRealistic,
          isDurationValid,
          isCollectionRealistic
        });
      }

      return isValid;
    } catch (error) {
      console.error('Failed to validate game result:', error);
      return false;
    }
  }
}

// Helper function to format GOR amounts
export const formatGOR = (amount: number): string => {
  return `${amount.toLocaleString()} GOR`;
};

// Helper function to get entry fee for game mode
export const getEntryFee = (gameMode: 'blitz' | 'endurance' | 'tournament'): number => {
  return ENTRY_FEES[gameMode];
};

// Helper function to estimate potential rewards
export const estimateRewards = (gameMode: 'blitz' | 'endurance' | 'tournament'): { min: number; max: number } => {
  return REWARD_MULTIPLIERS[gameMode];
};
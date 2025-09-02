import { PublicKey, Connection } from '@solana/web3.js';
import { Market } from '../models/Market';
import { Bet } from '../models/Bet';
import { User } from '../models/User';
import { PROGRAM_ID } from '../utils/transactions';

/**
 * API service for interacting with the Solana blockchain
 */
export class ApiService {
  /**
   * Constructor
   * @param {Connection} connection - Solana connection
   */
  constructor(connection) {
    this.connection = connection;
  }

  /**
   * Get all markets
   * @returns {Promise<Array<Market>>} List of markets
   */
  async getMarkets() {
    try {
      // In a real implementation, we would fetch markets from the blockchain
      // For now, we'll return mock data
      
      // Find all market accounts for the program
      const accounts = await this.connection.getProgramAccounts(new PublicKey(PROGRAM_ID), {
        filters: [
          {
            memcmp: {
              offset: 0, // Offset for is_initialized field
              bytes: '1', // Filter for initialized accounts
            },
          },
          {
            dataSize: 1000, // Approximate size of market account data
          },
        ],
      });
      
      // Parse market data
      const markets = [];
      for (const account of accounts) {
        try {
          // In a real implementation, we would deserialize the account data
          // For now, we'll just return mock data
          const mockMarket = {
            marketId: account.pubkey.toString(),
            name: 'Mock Market',
            description: 'This is a mock market',
            category: 'crypto',
            outcomes: ['Outcome A', 'Outcome B'],
            odds: [15000, 25000], // 1.5x and 2.5x in basis points
            status: 'active',
            totalStaked: 50 * 1e9, // 50 SOL in lamports
            stakedPerOutcome: [30 * 1e9, 20 * 1e9], // 30 SOL and 20 SOL in lamports
            endTime: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
            settledAt: null,
            winningOutcome: null,
            authority: account.pubkey.toString(),
            oracle: null,
            feePercentage: 300, // 3% in basis points
          };
          
          markets.push(Market.fromBlockchain(mockMarket));
        } catch (error) {
          console.error('Error parsing market data:', error);
        }
      }
      
      return markets;
    } catch (error) {
      console.error('Error fetching markets:', error);
      throw error;
    }
  }

  /**
   * Get market by ID
   * @param {string} marketId - Market ID
   * @returns {Promise<Market>} Market
   */
  async getMarketById(marketId) {
    try {
      // In a real implementation, we would fetch the market from the blockchain
      // For now, we'll return mock data
      
      // Find the market account
      const marketPubkey = new PublicKey(marketId);
      const accountInfo = await this.connection.getAccountInfo(marketPubkey);
      
      if (!accountInfo) {
        throw new Error('Market not found');
      }
      
      // In a real implementation, we would deserialize the account data
      // For now, we'll just return mock data
      const mockMarket = {
        marketId: marketPubkey.toString(),
        name: 'Mock Market',
        description: 'This is a mock market',
        category: 'crypto',
        outcomes: ['Outcome A', 'Outcome B'],
        odds: [15000, 25000], // 1.5x and 2.5x in basis points
        status: 'active',
        totalStaked: 50 * 1e9, // 50 SOL in lamports
        stakedPerOutcome: [30 * 1e9, 20 * 1e9], // 30 SOL and 20 SOL in lamports
        endTime: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
        settledAt: null,
        winningOutcome: null,
        authority: marketPubkey.toString(),
        oracle: null,
        feePercentage: 300, // 3% in basis points
      };
      
      return Market.fromBlockchain(mockMarket);
    } catch (error) {
      console.error('Error fetching market:', error);
      throw error;
    }
  }

  /**
   * Get user bets
   * @param {string} userId - User ID (public key)
   * @returns {Promise<Array<Bet>>} List of user bets
   */
  async getUserBets(userId) {
    try {
      // In a real implementation, we would fetch user bets from the blockchain
      // For now, we'll return mock data
      
      // Find all bet accounts for the user
      const userPubkey = new PublicKey(userId);
      const accounts = await this.connection.getProgramAccounts(new PublicKey(PROGRAM_ID), {
        filters: [
          {
            memcmp: {
              offset: 33, // Offset for user field
              bytes: userPubkey.toBase58(),
            },
          },
          {
            dataSize: 500, // Approximate size of bet account data
          },
        ],
      });
      
      // Parse bet data
      const bets = [];
      for (const account of accounts) {
        try {
          // In a real implementation, we would deserialize the account data
          // For now, we'll just return mock data
          const mockBet = {
            betId: account.pubkey.toString(),
            user: userPubkey,
            marketId: 'mock_market_id',
            selectedOutcome: 0,
            stakedAmount: 5 * 1e9, // 5 SOL in lamports
            oddsAtPlacement: 15000, // 1.5x in basis points
            potentialPayout: 7.5 * 1e9, // 7.5 SOL in lamports
            timestamp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
            isSettled: false,
            isWinner: null,
            actualPayout: null,
            transactionHash: 'mock_tx_hash',
          };
          
          // Get market data for outcome text
          const market = await this.getMarketById(mockBet.marketId);
          
          bets.push(Bet.fromBlockchain(mockBet, market));
        } catch (error) {
          console.error('Error parsing bet data:', error);
        }
      }
      
      return bets;
    } catch (error) {
      console.error('Error fetching user bets:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   * @param {string} userId - User ID (public key)
   * @returns {Promise<User>} User profile
   */
  async getUserProfile(userId) {
    try {
      // In a real implementation, we would fetch the user profile from the blockchain
      // For now, we'll return mock data
      
      // Find the user profile account
      const userPubkey = new PublicKey(userId);
      const [userProfilePda] = await PublicKey.findProgramAddress(
        [Buffer.from('user'), userPubkey.toBuffer()],
        new PublicKey(PROGRAM_ID)
      );
      
      const accountInfo = await this.connection.getAccountInfo(userProfilePda);
      
      if (!accountInfo) {
        // User profile not found, return default profile
        return new User({
          userId: userPubkey.toString(),
          totalStaked: 0,
          totalWon: 0,
          totalBets: 0,
          winningBets: 0,
          firstBetTimestamp: null,
          lastBetTimestamp: null,
        });
      }
      
      // In a real implementation, we would deserialize the account data
      // For now, we'll just return mock data
      const mockUserProfile = {
        user: userPubkey,
        totalStaked: 20 * 1e9, // 20 SOL in lamports
        totalWon: 25 * 1e9, // 25 SOL in lamports
        totalBets: 10,
        winningBets: 6,
        firstBetTimestamp: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
        lastBetTimestamp: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
      };
      
      return User.fromBlockchain(mockUserProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Get platform stats
   * @returns {Promise<Object>} Platform stats
   */
  async getPlatformStats() {
    try {
      // In a real implementation, we would fetch platform stats from the blockchain
      // For now, we'll return mock data
      
      // Find the platform account
      const [platformPda] = await PublicKey.findProgramAddress(
        [Buffer.from('platform')],
        new PublicKey(PROGRAM_ID)
      );
      
      const accountInfo = await this.connection.getAccountInfo(platformPda);
      
      if (!accountInfo) {
        throw new Error('Platform account not found');
      }
      
      // In a real implementation, we would deserialize the account data
      // For now, we'll just return mock data
      return {
        totalVolume: 1000, // 1000 SOL
        totalFeesCollected: 30, // 30 SOL
        totalMarkets: 50,
        totalBets: 500,
        totalUsers: 200,
        defaultFeePercentage: 3, // 3%
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      throw error;
    }
  }
}

export default ApiService;


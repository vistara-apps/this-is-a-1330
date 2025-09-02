import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { PROGRAM_ID } from '../utils/transactions';
import toast from 'react-hot-toast';

/**
 * Service for handling market settlement and bet payouts
 */
export class SettlementService {
  /**
   * Constructor
   * @param {Object} connection - Solana connection object
   * @param {Object} wallet - Wallet adapter
   */
  constructor(connection, wallet) {
    this.connection = connection;
    this.wallet = wallet;
  }

  /**
   * Settle a market with the winning outcome
   * @param {string} marketId - ID of the market to settle
   * @param {number} winningOutcome - Index of the winning outcome
   * @returns {Promise<string>} Transaction signature
   */
  async settleMarket(marketId, winningOutcome) {
    try {
      if (!this.wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      // Find the PDA for the market account
      const [marketAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('market'), Buffer.from(marketId)],
        PROGRAM_ID
      );

      // Find the PDA for the platform account
      const [platformAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('platform')],
        PROGRAM_ID
      );

      // Find the PDA for the treasury account
      const [treasuryAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('treasury')],
        PROGRAM_ID
      );

      // Create instruction data
      const instructionData = Buffer.from([
        2, // Instruction index for SettleMarket
        winningOutcome, // Winning outcome index
      ]);

      // Create the transaction instruction
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: this.wallet.publicKey, isSigner: true, isWritable: false },
          { pubkey: marketAccount, isSigner: false, isWritable: true },
          { pubkey: platformAccount, isSigner: false, isWritable: true },
          { pubkey: treasuryAccount, isSigner: false, isWritable: true },
          { pubkey: PublicKey.default, isSigner: false, isWritable: false }, // System program
        ],
        programId: PROGRAM_ID,
        data: instructionData,
      });

      // Create a new transaction and add the instruction
      const transaction = new Transaction().add(instruction);

      // Set recent blockhash and fee payer
      transaction.recentBlockhash = (await this.connection.getRecentBlockhash()).blockhash;
      transaction.feePayer = this.wallet.publicKey;

      // Sign the transaction
      const signedTransaction = await this.wallet.signTransaction(transaction);

      // Send the transaction
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize());

      // Confirm the transaction
      await this.connection.confirmTransaction(signature);

      return signature;
    } catch (error) {
      console.error('Error settling market:', error);
      toast.error(`Settlement failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Monitor markets for settlement
   * @param {Array} markets - List of markets to monitor
   * @returns {Array} Markets ready for settlement
   */
  getMarketsReadyForSettlement(markets) {
    const currentTime = new Date().getTime();
    return markets.filter(market => {
      // Check if market is active and end time has passed
      const endTime = new Date(market.eventDate).getTime();
      return market.status === 'active' && currentTime >= endTime;
    });
  }

  /**
   * Process automatic settlement for markets that are ready
   * @param {Array} markets - List of markets to check
   * @param {Function} onSettled - Callback function when a market is settled
   */
  async processAutomaticSettlements(markets, onSettled) {
    const marketsToSettle = this.getMarketsReadyForSettlement(markets);
    
    for (const market of marketsToSettle) {
      try {
        // In a real implementation, we would use an oracle to determine the winning outcome
        // For demo purposes, we'll use a mock implementation
        
        // Simulate oracle delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock winning outcome determination (in a real app, this would come from an oracle)
        const winningOutcome = this.mockDetermineWinningOutcome(market);
        
        // Settle the market
        const signature = await this.settleMarket(market.marketId, winningOutcome);
        
        // Call the callback function
        if (onSettled) {
          onSettled(market.marketId, winningOutcome, signature);
        }
        
        toast.success(`Market "${market.eventName}" has been settled!`);
      } catch (error) {
        console.error(`Error settling market ${market.marketId}:`, error);
        toast.error(`Failed to settle market "${market.eventName}"`);
      }
    }
  }

  /**
   * Mock implementation to determine winning outcome
   * In a real app, this would be replaced with oracle data
   * @param {Object} market - Market object
   * @returns {number} Winning outcome index
   */
  mockDetermineWinningOutcome(market) {
    // For demo purposes, we'll just pick a random outcome
    return Math.floor(Math.random() * market.outcomeOptions.length);
  }
}

export default SettlementService;


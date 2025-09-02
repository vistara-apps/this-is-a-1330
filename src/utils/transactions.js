import { 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  TransactionInstruction
} from '@solana/web3.js';
import { toast } from 'react-hot-toast';

// Program ID for the SOLBet Chain program
export const PROGRAM_ID = new PublicKey('SoLBeTChainiiiiiiiiiiiiiiiiiiiiiiiiiiiiii'); // Replace with actual program ID

/**
 * Create and send a transaction to place a bet
 * @param {Object} connection - Solana connection object
 * @param {Object} wallet - Wallet adapter
 * @param {string} marketId - ID of the market to bet on
 * @param {number} outcomeIndex - Index of the selected outcome
 * @param {number} amount - Amount to stake in SOL
 * @returns {Promise<string>} Transaction signature
 */
export const placeBet = async (connection, wallet, marketId, outcomeIndex, amount) => {
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Convert market ID to PublicKey
    const marketPubkey = new PublicKey(marketId);
    
    // Convert amount from SOL to lamports
    const lamports = amount * LAMPORTS_PER_SOL;
    
    // Generate a unique bet ID using the current timestamp
    const betId = `bet_${Date.now()}_${wallet.publicKey.toString().substring(0, 8)}`;
    
    // Find the PDA for the bet account
    const [betAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('bet'), Buffer.from(betId)],
      PROGRAM_ID
    );
    
    // Find the PDA for the user profile account
    const [userProfileAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('user'), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );
    
    // Find the PDA for the market account
    const [marketAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('market'), Buffer.from(marketId)],
      PROGRAM_ID
    );
    
    // Find the PDA for the escrow account
    const [escrowAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('escrow'), Buffer.from(marketId)],
      PROGRAM_ID
    );
    
    // Find the PDA for the platform account
    const [platformAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('platform')],
      PROGRAM_ID
    );
    
    // Create instruction data
    const instructionData = Buffer.from([
      0, // Instruction index for PlaceBet
      outcomeIndex, // Selected outcome
      ...new Uint8Array(new BigUint64Array([BigInt(lamports)]).buffer) // Stake amount
    ]);
    
    // Create the transaction instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: betAccount, isSigner: false, isWritable: true },
        { pubkey: userProfileAccount, isSigner: false, isWritable: true },
        { pubkey: marketAccount, isSigner: false, isWritable: true },
        { pubkey: escrowAccount, isSigner: false, isWritable: true },
        { pubkey: platformAccount, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: PROGRAM_ID,
      data: instructionData,
    });
    
    // Create a new transaction and add the instruction
    const transaction = new Transaction().add(instruction);
    
    // Set recent blockhash and fee payer
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign the transaction
    const signedTransaction = await wallet.signTransaction(transaction);
    
    // Send the transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    // Confirm the transaction
    await connection.confirmTransaction(signature);
    
    return signature;
  } catch (error) {
    console.error('Error placing bet:', error);
    toast.error(`Transaction failed: ${error.message}`);
    throw error;
  }
};

/**
 * Create and send a transaction to claim winnings
 * @param {Object} connection - Solana connection object
 * @param {Object} wallet - Wallet adapter
 * @param {string} betId - ID of the bet to claim
 * @param {string} marketId - ID of the market the bet was placed on
 * @returns {Promise<string>} Transaction signature
 */
export const claimWinnings = async (connection, wallet, betId, marketId) => {
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    // Find the PDA for the bet account
    const [betAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('bet'), Buffer.from(betId)],
      PROGRAM_ID
    );
    
    // Find the PDA for the user profile account
    const [userProfileAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('user'), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );
    
    // Find the PDA for the market account
    const [marketAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('market'), Buffer.from(marketId)],
      PROGRAM_ID
    );
    
    // Find the PDA for the escrow account
    const [escrowAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('escrow'), Buffer.from(marketId)],
      PROGRAM_ID
    );
    
    // Create instruction data
    const instructionData = Buffer.from([
      3, // Instruction index for ClaimWinnings
    ]);
    
    // Create the transaction instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: betAccount, isSigner: false, isWritable: true },
        { pubkey: userProfileAccount, isSigner: false, isWritable: true },
        { pubkey: marketAccount, isSigner: false, isWritable: true },
        { pubkey: escrowAccount, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: PROGRAM_ID,
      data: instructionData,
    });
    
    // Create a new transaction and add the instruction
    const transaction = new Transaction().add(instruction);
    
    // Set recent blockhash and fee payer
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign the transaction
    const signedTransaction = await wallet.signTransaction(transaction);
    
    // Send the transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    // Confirm the transaction
    await connection.confirmTransaction(signature);
    
    return signature;
  } catch (error) {
    console.error('Error claiming winnings:', error);
    toast.error(`Transaction failed: ${error.message}`);
    throw error;
  }
};

/**
 * Helper function to handle transaction errors
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const getTransactionErrorMessage = (error) => {
  // Extract the error message from the error object
  let message = error.message || 'Transaction failed';
  
  // Check for common error patterns
  if (message.includes('insufficient funds')) {
    return 'Insufficient funds for transaction. Please add more SOL to your wallet.';
  }
  
  if (message.includes('blockhash')) {
    return 'Transaction timed out. Please try again.';
  }
  
  if (message.includes('User rejected')) {
    return 'Transaction was rejected by the wallet.';
  }
  
  // Return a generic error message if no specific pattern is matched
  return `Transaction failed: ${message}`;
};


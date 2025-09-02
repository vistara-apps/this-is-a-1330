/**
 * Common error messages used throughout the application
 */
export const ErrorMessages = {
  // Wallet errors
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  WALLET_CONNECTION_REJECTED: 'Wallet connection was rejected',
  WALLET_DISCONNECTED: 'Wallet disconnected',
  WALLET_ADAPTER_ERROR: 'Wallet adapter error',
  WALLET_TIMEOUT: 'Wallet connection timed out',
  
  // Transaction errors
  TRANSACTION_FAILED: 'Transaction failed. Please try again',
  TRANSACTION_REJECTED: 'Transaction was rejected by the wallet',
  TRANSACTION_TIMEOUT: 'Transaction timed out. Please try again',
  TRANSACTION_SIMULATION_FAILED: 'Transaction simulation failed',
  
  // Balance errors
  INSUFFICIENT_FUNDS: 'Insufficient funds in your wallet',
  INSUFFICIENT_SOL_FOR_FEES: 'Insufficient SOL for transaction fees',
  
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your connection',
  RPC_ERROR: 'RPC connection error. Please try again',
  BLOCKCHAIN_CONGESTION: 'Blockchain congestion. Please try again later',
  
  // Market errors
  MARKET_NOT_FOUND: 'Market not found',
  MARKET_NOT_ACTIVE: 'This market is not active',
  MARKET_ALREADY_SETTLED: 'This market has already been settled',
  MARKET_NOT_READY_FOR_SETTLEMENT: 'This market is not ready for settlement',
  MARKET_CLOSED: 'Betting period for this market has ended',
  MARKET_CANCELLED: 'This market has been cancelled',
  
  // Bet errors
  BET_NOT_FOUND: 'Bet not found',
  BET_ALREADY_SETTLED: 'This bet has already been settled',
  BET_ALREADY_CLAIMED: 'Winnings for this bet have already been claimed',
  BET_NOT_ELIGIBLE_FOR_CLAIM: 'This bet is not eligible for claiming',
  INVALID_BET_AMOUNT: 'Invalid bet amount',
  MINIMUM_BET_AMOUNT: 'Bet amount must be at least 0.01 SOL',
  
  // Input validation errors
  INVALID_INPUT: 'Invalid input. Please check your entries',
  INVALID_OUTCOME: 'Invalid outcome selection',
  INVALID_MARKET_ID: 'Invalid market ID',
  INVALID_BET_ID: 'Invalid bet ID',
  
  // Authorization errors
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access forbidden',
  
  // General errors
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again',
  OPERATION_CANCELLED: 'Operation cancelled',
  TIMEOUT: 'Operation timed out. Please try again',
  SERVER_ERROR: 'Server error. Please try again later',
  
  // Form validation errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  INVALID_DATE: 'Invalid date',
  INVALID_AMOUNT: 'Invalid amount',
  INVALID_PERCENTAGE: 'Invalid percentage',
  INVALID_PUBLIC_KEY: 'Invalid public key format',
  
  // Smart contract errors
  CONTRACT_ERROR: 'Smart contract error',
  INSTRUCTION_ERROR: 'Invalid instruction data',
  CALCULATION_OVERFLOW: 'Calculation overflow',
  
  // Feature availability errors
  FEATURE_NOT_AVAILABLE: 'This feature is not available yet',
  MAINTENANCE_MODE: 'System is currently in maintenance mode',
  
  // Custom error formatter
  format: (message, ...args) => {
    if (!args.length) return message;
    
    return message.replace(/{(\d+)}/g, (match, index) => {
      const argIndex = parseInt(index, 10);
      return argIndex < args.length ? args[argIndex] : match;
    });
  }
};

export default ErrorMessages;


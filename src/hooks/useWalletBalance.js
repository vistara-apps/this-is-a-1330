import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

/**
 * Custom hook to fetch and track a wallet's SOL balance
 * @returns {Object} Balance information and utility functions
 */
export const useWalletBalance = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalance = async () => {
    if (!publicKey) {
      setBalance(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch wallet balance');
    } finally {
      setLoading(false);
    }
  };

  // Fetch balance when wallet or connection changes
  useEffect(() => {
    fetchBalance();

    // Set up subscription to account changes
    if (publicKey) {
      const subscriptionId = connection.onAccountChange(
        publicKey,
        (updatedAccountInfo) => {
          setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL);
        }
      );

      // Clean up subscription
      return () => {
        connection.removeAccountChangeListener(subscriptionId);
      };
    }
  }, [publicKey, connection]);

  // Check if balance is sufficient for a transaction
  const hasSufficientBalance = (amount, additionalFees = 0.001) => {
    if (!publicKey) return false;
    // Add some buffer for transaction fees
    return balance >= amount + additionalFees;
  };

  // Format balance with appropriate precision
  const formattedBalance = balance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

  return {
    balance,
    formattedBalance,
    loading,
    error,
    fetchBalance,
    hasSufficientBalance,
  };
};

export default useWalletBalance;


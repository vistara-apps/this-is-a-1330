import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet as useSolanaWallet,
} from '@solana/wallet-adapter-react'
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BraveWalletAdapter,
  CoinbaseWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js'
import toast from 'react-hot-toast'

// Import default styles for wallet modal
import '@solana/wallet-adapter-react-ui/styles.css'

const WalletContext = createContext()

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within WalletContextProvider')
  }
  return context
}

// Inner component to access Solana wallet hooks
const WalletContextContent = ({ children }) => {
  const { connection } = useConnection()
  const { 
    publicKey, 
    connected, 
    connecting, 
    disconnect, 
    select, 
    wallet, 
    wallets, 
    signTransaction, 
    signAllTransactions,
    sendTransaction,
  } = useSolanaWallet()
  
  const [balance, setBalance] = useState(0)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [transactionPending, setTransactionPending] = useState(false)

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(0)
      return
    }

    try {
      setBalanceLoading(true)
      const lamports = await connection.getBalance(publicKey)
      setBalance(lamports / LAMPORTS_PER_SOL)
    } catch (error) {
      console.error('Error fetching balance:', error)
      toast.error('Failed to fetch wallet balance')
    } finally {
      setBalanceLoading(false)
    }
  }, [publicKey, connection])

  // Fetch balance when wallet or connection changes
  useEffect(() => {
    fetchBalance()

    // Set up subscription to account changes
    if (publicKey) {
      const subscriptionId = connection.onAccountChange(
        publicKey,
        (updatedAccountInfo) => {
          setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL)
        }
      )

      // Clean up subscription
      return () => {
        connection.removeAccountChangeListener(subscriptionId)
      }
    }
  }, [publicKey, connection, fetchBalance])

  // Format balance with appropriate precision
  const formattedBalance = balance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })

  // Check if balance is sufficient for a transaction
  const hasSufficientBalance = useCallback((amount, additionalFees = 0.001) => {
    if (!publicKey) return false
    // Add some buffer for transaction fees
    return balance >= amount + additionalFees
  }, [balance, publicKey])

  // Handle wallet connection errors
  const handleConnectionError = useCallback((error) => {
    console.error('Wallet connection error:', error)
    let errorMessage = 'Failed to connect wallet'
    
    if (error.message) {
      errorMessage = error.message
    }
    
    toast.error(errorMessage)
  }, [])

  // Disconnect wallet with error handling
  const disconnectWallet = useCallback(() => {
    try {
      disconnect()
      toast.success('Wallet disconnected')
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
      toast.error('Failed to disconnect wallet')
    }
  }, [disconnect])

  // Get wallet display name
  const getWalletName = useCallback(() => {
    if (!wallet) return 'Wallet'
    return wallet.adapter.name
  }, [wallet])

  // Get shortened wallet address
  const getShortAddress = useCallback(() => {
    if (!publicKey) return ''
    const address = publicKey.toString()
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }, [publicKey])

  // Context value
  const value = {
    publicKey,
    connected,
    connecting,
    wallet,
    wallets,
    balance,
    formattedBalance,
    balanceLoading,
    transactionPending,
    setTransactionPending,
    fetchBalance,
    hasSufficientBalance,
    disconnect: disconnectWallet,
    getWalletName,
    getShortAddress,
    signTransaction,
    signAllTransactions,
    sendTransaction,
    WalletButton: WalletMultiButton,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export const WalletContextProvider = ({ children }) => {
  // Use devnet for demo purposes
  const endpoint = useMemo(() => clusterApiUrl('devnet'), [])
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BraveWalletAdapter(),
      new CoinbaseWalletAdapter(),
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContextContent>
            {children}
          </WalletContextContent>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

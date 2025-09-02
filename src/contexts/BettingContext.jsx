import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import toast from 'react-hot-toast'
import { useWallet } from './WalletContext'
import { placeBet as placeBetTransaction, claimWinnings, getTransactionErrorMessage } from '../utils/transactions'

const BettingContext = createContext()

export const useBetting = () => {
  const context = useContext(BettingContext)
  if (!context) {
    throw new Error('useBetting must be used within BettingProvider')
  }
  return context
}

// Market status enum
export const MarketStatus = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  SETTLED: 'settled',
  CANCELLED: 'cancelled'
}

// Bet status enum
export const BetStatus = {
  ACTIVE: 'active',
  WON: 'won',
  LOST: 'lost',
  CANCELLED: 'cancelled',
  PENDING_CLAIM: 'pending_claim'
}

// Mock markets data
const initialMarkets = [
  {
    marketId: '1',
    eventName: 'SOL Price Prediction',
    eventDate: '2024-12-31T23:59:59Z',
    outcomeOptions: ['Above $150', 'Below $150'],
    currentOdds: [1.8, 2.2],
    status: MarketStatus.ACTIVE,
    category: 'crypto',
    totalStaked: 45.67,
    description: 'Will SOL price be above or below $150 by year end?',
    createdAt: '2024-09-01T10:00:00Z',
    settledAt: null,
    winningOutcome: null,
    stakedPerOutcome: [25.45, 20.22]
  },
  {
    marketId: '2',
    eventName: 'Next Solana Validator Count',
    eventDate: '2024-12-15T00:00:00Z',
    outcomeOptions: ['Above 2000', 'Below 2000'],
    currentOdds: [1.5, 2.8],
    status: MarketStatus.ACTIVE,
    category: 'crypto',
    totalStaked: 28.34,
    description: 'Will Solana have more than 2000 validators next month?',
    createdAt: '2024-09-05T14:30:00Z',
    settledAt: null,
    winningOutcome: null,
    stakedPerOutcome: [18.22, 10.12]
  },
  {
    marketId: '3',
    eventName: 'Esports Championship',
    eventDate: '2024-12-20T18:00:00Z',
    outcomeOptions: ['Team Alpha', 'Team Beta', 'Team Gamma'],
    currentOdds: [2.1, 3.2, 4.5],
    status: MarketStatus.ACTIVE,
    category: 'esports',
    totalStaked: 67.89,
    description: 'Who will win the upcoming championship?',
    createdAt: '2024-09-10T09:15:00Z',
    settledAt: null,
    winningOutcome: null,
    stakedPerOutcome: [30.45, 22.33, 15.11]
  },
  {
    marketId: '4',
    eventName: 'Solana DeFi TVL',
    eventDate: '2024-11-30T23:59:59Z',
    outcomeOptions: ['Above $5B', 'Below $5B'],
    currentOdds: [2.5, 1.6],
    status: MarketStatus.SETTLED,
    category: 'crypto',
    totalStaked: 120.45,
    description: 'Will Solana DeFi TVL exceed $5 billion by end of November?',
    createdAt: '2024-08-15T11:20:00Z',
    settledAt: '2024-11-30T23:59:59Z',
    winningOutcome: 0, // Above $5B
    stakedPerOutcome: [75.30, 45.15]
  }
]

// Mock user bets
const initialUserBets = [
  {
    betId: 'bet_1662546000000',
    userId: 'demo_user',
    marketId: '4',
    selectedOutcome: 0, // Above $5B
    selectedOutcomeText: 'Above $5B',
    stakedAmount: 5.0,
    potentialPayout: 12.5,
    status: BetStatus.WON,
    transactionHash: 'mock_tx_1662546000000',
    timestamp: '2024-08-20T14:30:00Z',
    settledAt: '2024-11-30T23:59:59Z',
    actualPayout: 12.5
  }
]

export const BettingProvider = ({ children }) => {
  const { connection } = useConnection()
  const { publicKey, connected, signTransaction, sendTransaction } = useWallet()
  
  const [markets, setMarkets] = useState(initialMarkets)
  const [userBets, setUserBets] = useState([])
  const [isPlacingBet, setIsPlacingBet] = useState(false)
  const [isClaimingWinnings, setIsClaimingWinnings] = useState(false)
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false)
  const [isLoadingBets, setIsLoadingBets] = useState(false)
  const [selectedMarket, setSelectedMarket] = useState(null)

  // Load user bets when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      loadUserBets()
    } else {
      // Clear user bets when wallet disconnects
      setUserBets([])
    }
  }, [connected, publicKey])

  // Load markets
  const loadMarkets = useCallback(async () => {
    setIsLoadingMarkets(true)
    try {
      // In a real implementation, we would fetch markets from the blockchain
      // For now, we'll use the mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo purposes, we'll just use the initial markets
      setMarkets(initialMarkets)
    } catch (error) {
      console.error('Error loading markets:', error)
      toast.error('Failed to load markets')
    } finally {
      setIsLoadingMarkets(false)
    }
  }, [])

  // Load user bets
  const loadUserBets = useCallback(async () => {
    if (!publicKey) return
    
    setIsLoadingBets(true)
    try {
      // In a real implementation, we would fetch user bets from the blockchain
      // For now, we'll use mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo purposes, we'll just use the initial user bets
      // In a real implementation, we would filter bets by the user's public key
      setUserBets(initialUserBets)
    } catch (error) {
      console.error('Error loading user bets:', error)
      toast.error('Failed to load your bets')
    } finally {
      setIsLoadingBets(false)
    }
  }, [publicKey])

  // Get market by ID
  const getMarketById = useCallback((marketId) => {
    return markets.find(m => m.marketId === marketId)
  }, [markets])

  // Place a bet
  const placeBet = useCallback(async (marketId, selectedOutcome, stakedAmount) => {
    if (!publicKey) {
      toast.error('Please connect your wallet first')
      return false
    }

    setIsPlacingBet(true)
    
    try {
      const market = markets.find(m => m.marketId === marketId)
      if (!market) {
        throw new Error('Market not found')
      }
      
      if (market.status !== MarketStatus.ACTIVE) {
        throw new Error('Market is not active')
      }
      
      const outcomeIndex = market.outcomeOptions.indexOf(selectedOutcome)
      if (outcomeIndex === -1) {
        throw new Error('Invalid outcome')
      }
      
      const odds = market.currentOdds[outcomeIndex]
      const potentialPayout = stakedAmount * odds
      
      // In a real implementation, we would call the smart contract to place the bet
      // For now, we'll simulate a transaction
      
      // Call the transaction utility
      const txSignature = await placeBetTransaction(
        connection,
        { publicKey, signTransaction },
        marketId,
        outcomeIndex,
        stakedAmount
      )
      
      // Create new bet object
      const newBet = {
        betId: `bet_${Date.now()}`,
        userId: publicKey.toString(),
        marketId,
        selectedOutcome: outcomeIndex,
        selectedOutcomeText: selectedOutcome,
        stakedAmount: parseFloat(stakedAmount),
        potentialPayout,
        status: BetStatus.ACTIVE,
        transactionHash: txSignature || `mock_tx_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
      
      // Update user bets
      setUserBets(prev => [...prev, newBet])
      
      // Update market total staked
      setMarkets(prev => prev.map(market => 
        market.marketId === marketId 
          ? { 
              ...market, 
              totalStaked: market.totalStaked + parseFloat(stakedAmount),
              stakedPerOutcome: market.stakedPerOutcome.map((amount, idx) => 
                idx === outcomeIndex ? amount + parseFloat(stakedAmount) : amount
              )
            }
          : market
      ))
      
      toast.success(`Bet placed successfully! ${stakedAmount} SOL staked.`)
      return true
    } catch (error) {
      console.error('Error placing bet:', error)
      toast.error(getTransactionErrorMessage(error))
      return false
    } finally {
      setIsPlacingBet(false)
    }
  }, [markets, publicKey, connection])

  // Claim winnings
  const claimBetWinnings = useCallback(async (betId) => {
    if (!publicKey) {
      toast.error('Please connect your wallet first')
      return false
    }

    setIsClaimingWinnings(true)
    
    try {
      const bet = userBets.find(b => b.betId === betId)
      if (!bet) {
        throw new Error('Bet not found')
      }
      
      if (bet.status !== BetStatus.PENDING_CLAIM) {
        throw new Error('Bet is not eligible for claiming')
      }
      
      const market = markets.find(m => m.marketId === bet.marketId)
      if (!market) {
        throw new Error('Market not found')
      }
      
      // In a real implementation, we would call the smart contract to claim winnings
      // For now, we'll simulate a transaction
      
      // Call the transaction utility
      const txSignature = await claimWinnings(
        connection,
        { publicKey, signTransaction },
        betId,
        bet.marketId
      )
      
      // Update bet status
      setUserBets(prev => prev.map(b => 
        b.betId === betId 
          ? { 
              ...b, 
              status: BetStatus.WON,
              settledAt: new Date().toISOString(),
              actualPayout: b.potentialPayout
            }
          : b
      ))
      
      toast.success(`Winnings claimed successfully! ${bet.potentialPayout.toFixed(2)} SOL received.`)
      return true
    } catch (error) {
      console.error('Error claiming winnings:', error)
      toast.error(getTransactionErrorMessage(error))
      return false
    } finally {
      setIsClaimingWinnings(false)
    }
  }, [userBets, markets, publicKey, connection])

  // Get user stats
  const getUserStats = useCallback(() => {
    const totalStaked = userBets.reduce((sum, bet) => sum + bet.stakedAmount, 0)
    const activeBets = userBets.filter(bet => bet.status === BetStatus.ACTIVE).length
    const totalWinnings = userBets
      .filter(bet => bet.status === BetStatus.WON)
      .reduce((sum, bet) => sum + (bet.actualPayout || 0), 0)
    
    return {
      totalStaked,
      activeBets,
      totalWinnings,
      totalBets: userBets.length,
      pendingClaims: userBets.filter(bet => bet.status === BetStatus.PENDING_CLAIM).length
    }
  }, [userBets])

  // Get market categories
  const getMarketCategories = useCallback(() => {
    const categories = [...new Set(markets.map(market => market.category))]
    return categories
  }, [markets])

  // Filter markets by category
  const filterMarketsByCategory = useCallback((category) => {
    if (category === 'all') {
      return markets
    }
    return markets.filter(market => market.category === category)
  }, [markets])

  // Filter markets by status
  const filterMarketsByStatus = useCallback((status) => {
    if (status === 'all') {
      return markets
    }
    return markets.filter(market => market.status === status)
  }, [markets])

  // Search markets by name or description
  const searchMarkets = useCallback((searchTerm) => {
    if (!searchTerm) {
      return markets
    }
    const term = searchTerm.toLowerCase()
    return markets.filter(market => 
      market.eventName.toLowerCase().includes(term) || 
      market.description.toLowerCase().includes(term)
    )
  }, [markets])

  // Get user bets for a specific market
  const getUserBetsForMarket = useCallback((marketId) => {
    return userBets.filter(bet => bet.marketId === marketId)
  }, [userBets])

  // Check if user has an active bet on a market
  const hasActiveBetOnMarket = useCallback((marketId) => {
    return userBets.some(bet => bet.marketId === marketId && bet.status === BetStatus.ACTIVE)
  }, [userBets])

  // Select a market for detailed view
  const selectMarket = useCallback((marketId) => {
    const market = markets.find(m => m.marketId === marketId)
    setSelectedMarket(market || null)
  }, [markets])

  // Context value
  const value = {
    markets,
    userBets,
    isPlacingBet,
    isClaimingWinnings,
    isLoadingMarkets,
    isLoadingBets,
    selectedMarket,
    placeBet,
    claimBetWinnings,
    getUserStats,
    getMarketById,
    getMarketCategories,
    filterMarketsByCategory,
    filterMarketsByStatus,
    searchMarkets,
    getUserBetsForMarket,
    hasActiveBetOnMarket,
    selectMarket,
    loadMarkets,
    loadUserBets,
    MarketStatus,
    BetStatus
  }

  return (
    <BettingContext.Provider value={value}>
      {children}
    </BettingContext.Provider>
  )
}

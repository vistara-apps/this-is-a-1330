import React, { createContext, useContext, useState, useCallback } from 'react'
import toast from 'react-hot-toast'

const BettingContext = createContext()

export const useBetting = () => {
  const context = useContext(BettingContext)
  if (!context) {
    throw new Error('useBetting must be used within BettingProvider')
  }
  return context
}

// Mock markets data
const initialMarkets = [
  {
    marketId: '1',
    eventName: 'SOL Price Prediction',
    eventDate: '2024-12-31T23:59:59Z',
    outcomeOptions: ['Above $150', 'Below $150'],
    currentOdds: [1.8, 2.2],
    status: 'active',
    category: 'crypto',
    totalStaked: 45.67,
    description: 'Will SOL price be above or below $150 by year end?'
  },
  {
    marketId: '2',
    eventName: 'Next Solana Validator Count',
    eventDate: '2024-12-15T00:00:00Z',
    outcomeOptions: ['Above 2000', 'Below 2000'],
    currentOdds: [1.5, 2.8],
    status: 'active',
    category: 'crypto',
    totalStaked: 28.34,
    description: 'Will Solana have more than 2000 validators next month?'
  },
  {
    marketId: '3',
    eventName: 'Esports Championship',
    eventDate: '2024-12-20T18:00:00Z',
    outcomeOptions: ['Team Alpha', 'Team Beta', 'Team Gamma'],
    currentOdds: [2.1, 3.2, 4.5],
    status: 'active',
    category: 'esports',
    totalStaked: 67.89,
    description: 'Who will win the upcoming championship?'
  }
]

export const BettingProvider = ({ children }) => {
  const [markets, setMarkets] = useState(initialMarkets)
  const [userBets, setUserBets] = useState([])
  const [isPlacingBet, setIsPlacingBet] = useState(false)

  const placeBet = useCallback(async (marketId, selectedOutcome, stakedAmount, walletAddress) => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first')
      return false
    }

    setIsPlacingBet(true)
    
    try {
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const market = markets.find(m => m.marketId === marketId)
      const outcomeIndex = market.outcomeOptions.indexOf(selectedOutcome)
      const odds = market.currentOdds[outcomeIndex]
      const potentialPayout = stakedAmount * odds
      
      const newBet = {
        betId: `bet_${Date.now()}`,
        userId: walletAddress,
        marketId,
        selectedOutcome,
        stakedAmount: parseFloat(stakedAmount),
        potentialPayout,
        status: 'active',
        transactionHash: `mock_tx_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
      
      setUserBets(prev => [...prev, newBet])
      
      // Update market total staked
      setMarkets(prev => prev.map(market => 
        market.marketId === marketId 
          ? { ...market, totalStaked: market.totalStaked + parseFloat(stakedAmount) }
          : market
      ))
      
      toast.success(`Bet placed successfully! ${stakedAmount} SOL staked.`)
      return true
    } catch (error) {
      toast.error('Failed to place bet. Please try again.')
      return false
    } finally {
      setIsPlacingBet(false)
    }
  }, [markets])

  const getUserStats = useCallback(() => {
    const totalStaked = userBets.reduce((sum, bet) => sum + bet.stakedAmount, 0)
    const activeBets = userBets.filter(bet => bet.status === 'active').length
    const totalWinnings = userBets
      .filter(bet => bet.status === 'won')
      .reduce((sum, bet) => sum + bet.potentialPayout, 0)
    
    return {
      totalStaked,
      activeBets,
      totalWinnings,
      totalBets: userBets.length
    }
  }, [userBets])

  const value = {
    markets,
    userBets,
    isPlacingBet,
    placeBet,
    getUserStats
  }

  return (
    <BettingContext.Provider value={value}>
      {children}
    </BettingContext.Provider>
  )
}
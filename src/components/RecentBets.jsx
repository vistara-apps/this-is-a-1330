import React from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useBetting } from '../contexts/BettingContext'
import { Clock, ExternalLink, Target } from 'lucide-react'

export const RecentBets = () => {
  const { publicKey } = useWallet()
  const { userBets } = useBetting()
  
  if (!publicKey || userBets.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-textMuted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-textPrimary mb-2">No Bets Yet</h3>
          <p className="text-textSecondary">
            {!publicKey ? 'Connect your wallet to start betting' : 'Place your first bet to see it here'}
          </p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-accent/20 text-accent'
      case 'won': return 'bg-success/20 text-success'
      case 'lost': return 'bg-error/20 text-error'
      default: return 'bg-surfaceLight text-textMuted'
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-textPrimary">Recent Bets</h2>
        <span className="text-sm text-textMuted">{userBets.length} total</span>
      </div>
      
      <div className="space-y-4">
        {userBets.slice(-5).reverse().map((bet) => (
          <div key={bet.betId} className="bg-surfaceLight rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-1">
                <p className="font-medium text-textPrimary">{bet.selectedOutcome}</p>
                <div className="flex items-center space-x-2 text-sm text-textMuted">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(bet.timestamp)}</span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(bet.status)}`}>
                {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-textMuted">Staked:</span>
                  <span className="text-textPrimary font-medium">{bet.stakedAmount} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textMuted">Potential:</span>
                  <span className="text-success font-medium">{bet.potentialPayout.toFixed(4)} SOL</span>
                </div>
              </div>
              
              <button className="text-accent hover:text-accent/80 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
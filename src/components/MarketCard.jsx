import React, { useState } from 'react'
import { Clock, TrendingUp, Users } from 'lucide-react'
import { BettingModal } from './BettingModal'

export const MarketCard = ({ market }) => {
  const [showBettingModal, setShowBettingModal] = useState(false)
  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'crypto': return 'bg-accent/20 text-accent'
      case 'esports': return 'bg-success/20 text-success'
      default: return 'bg-primary/20 text-primary'
    }
  }

  return (
    <>
      <div className="card hover:bg-surfaceLight transition-colors duration-150 cursor-pointer group">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(market.category)}`}>
                  {market.category.toUpperCase()}
                </span>
                <div className="flex items-center space-x-1 text-textMuted">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">{formatDate(market.eventDate)}</span>
                </div>
              </div>
              <h3 className="font-semibold text-textPrimary group-hover:text-accent transition-colors">
                {market.eventName}
              </h3>
              <p className="text-sm text-textSecondary">{market.description}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1 text-textMuted">
              <Users className="w-4 h-4" />
              <span>{market.totalStaked.toFixed(2)} SOL staked</span>
            </div>
            <div className="flex items-center space-x-1 text-success">
              <TrendingUp className="w-4 h-4" />
              <span>Live</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {market.outcomeOptions.map((outcome, index) => (
              <button
                key={outcome}
                onClick={() => setShowBettingModal(true)}
                className="bg-surfaceLight hover:bg-surface border border-surfaceLight rounded-lg p-3 text-left transition-colors group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-textPrimary">{outcome}</span>
                  <span className="text-accent font-bold">{market.currentOdds[index]}x</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showBettingModal && (
        <BettingModal 
          market={market}
          onClose={() => setShowBettingModal(false)}
        />
      )}
    </>
  )
}
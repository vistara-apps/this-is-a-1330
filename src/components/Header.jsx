import React from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Dice6, TrendingUp } from 'lucide-react'

export const Header = () => {
  return (
    <header className="border-b border-surfaceLight bg-surface/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-lg">
              <Dice6 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">SOLBet Chain</h1>
              <p className="text-xs text-textMuted">Bet directly with SOL</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-textSecondary">
              <TrendingUp className="w-4 h-4" />
              <span>Live Markets</span>
            </div>
            <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !rounded-lg !h-10" />
          </div>
        </div>
      </div>
    </header>
  )
}
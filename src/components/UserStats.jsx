import React from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useBetting } from '../contexts/BettingContext'
import { TrendingUp, Target, Trophy, Wallet } from 'lucide-react'

export const UserStats = () => {
  const { publicKey } = useWallet()
  const { getUserStats } = useBetting()
  
  if (!publicKey) return null
  
  const stats = getUserStats()

  const statItems = [
    {
      label: 'Total Staked',
      value: `${stats.totalStaked.toFixed(4)} SOL`,
      icon: Wallet,
      color: 'text-primary'
    },
    {
      label: 'Active Bets',
      value: stats.activeBets,
      icon: Target,
      color: 'text-accent'
    },
    {
      label: 'Total Winnings',
      value: `${stats.totalWinnings.toFixed(4)} SOL`,
      icon: Trophy,
      color: 'text-success'
    },
    {
      label: 'Total Bets',
      value: stats.totalBets,
      icon: TrendingUp,
      color: 'text-warning'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <div key={index} className="card">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-surfaceLight ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-textMuted">{item.label}</p>
              <p className="font-semibold text-textPrimary">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
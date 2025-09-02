import React, { useState, useMemo } from 'react'
import { Toaster } from 'react-hot-toast'
import { Header } from './components/Header'
import { UserStats } from './components/UserStats'
import { MarketCard } from './components/MarketCard'
import { RecentBets } from './components/RecentBets'
import { MarketFilters } from './components/MarketFilters'
import { BettingProvider } from './contexts/BettingContext'
import { useBetting } from './contexts/BettingContext'
import { TrendingUp, Activity } from 'lucide-react'

const AppContent = () => {
  const { markets } = useBetting()
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMarkets = useMemo(() => {
    return markets.filter(market => {
      const matchesCategory = categoryFilter === 'all' || market.category === categoryFilter
      const matchesSearch = market.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           market.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [markets, categoryFilter, searchTerm])

  const totalStaked = markets.reduce((sum, market) => sum + market.totalStaked, 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-textPrimary">
            <span className="gradient-text">SOLBet Chain</span>
          </h1>
          <p className="text-lg text-textSecondary max-w-2xl mx-auto">
            Bet directly with SOL, transparently on Solana. 
            Curated markets with automated smart contract settlements.
          </p>
          <div className="flex items-center justify-center space-x-8 pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{markets.length}</p>
              <p className="text-sm text-textMuted">Active Markets</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{totalStaked.toFixed(2)} SOL</p>
              <p className="text-sm text-textMuted">Total Staked</p>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <UserStats />

        {/* Market Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-textPrimary">Live Markets</h2>
              <p className="text-sm text-textSecondary">Place your bets on curated events</p>
            </div>
          </div>

          <MarketFilters 
            onFilterChange={setCategoryFilter}
            onSearchChange={setSearchTerm}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMarkets.map((market) => (
              <MarketCard key={market.marketId} market={market} />
            ))}
          </div>

          {filteredMarkets.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-textMuted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-textPrimary mb-2">No Markets Found</h3>
              <p className="text-textSecondary">
                {searchTerm ? 'Try adjusting your search terms' : 'No markets match the selected filter'}
              </p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="bg-accent/20 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-textPrimary">Your Activity</h2>
              <p className="text-sm text-textSecondary">Track your recent bets and performance</p>
            </div>
          </div>

          <RecentBets />
        </div>
      </main>

      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(220, 15%, 12%)',
            color: 'hsl(0, 0%, 95%)',
            border: '1px solid hsl(220, 15%, 16%)',
          },
        }}
      />
    </div>
  )
}

export default function App() {
  return (
    <BettingProvider>
      <AppContent />
    </BettingProvider>
  )
}
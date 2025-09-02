import React, { useState } from 'react'
import { Filter, Search } from 'lucide-react'

export const MarketFilters = ({ onFilterChange, onSearchChange }) => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filters = [
    { id: 'all', label: 'All Markets', count: null },
    { id: 'crypto', label: 'Crypto', count: 2 },
    { id: 'esports', label: 'Esports', count: 1 },
  ]

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId)
    onFilterChange(filterId)
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearchChange(value)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textMuted w-4 h-4" />
          <input
            type="text"
            placeholder="Search markets..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="bg-surface border border-surfaceLight rounded-lg pl-10 pr-4 py-2 text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-textMuted" />
          <span className="text-sm text-textMuted">Filter:</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => handleFilterClick(filter.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === filter.id
                ? 'bg-primary text-white'
                : 'bg-surface border border-surfaceLight text-textSecondary hover:text-textPrimary hover:bg-surfaceLight'
            }`}
          >
            {filter.label}
            {filter.count && (
              <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                activeFilter === filter.id ? 'bg-white/20' : 'bg-surfaceLight'
              }`}>
                {filter.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
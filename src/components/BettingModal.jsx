import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { X, AlertCircle, TrendingUp } from 'lucide-react'
import { useBetting } from '../contexts/BettingContext'

export const BettingModal = ({ market, onClose }) => {
  const { publicKey } = useWallet()
  const { placeBet, isPlacingBet } = useBetting()
  const [selectedOutcome, setSelectedOutcome] = useState('')
  const [betAmount, setBetAmount] = useState('')
  const [step, setStep] = useState('select') // 'select', 'confirm'

  const selectedIndex = market.outcomeOptions.indexOf(selectedOutcome)
  const odds = selectedIndex >= 0 ? market.currentOdds[selectedIndex] : 0
  const potentialPayout = betAmount ? (parseFloat(betAmount) * odds).toFixed(4) : '0'

  const handleOutcomeSelect = (outcome) => {
    setSelectedOutcome(outcome)
    setStep('confirm')
  }

  const handlePlaceBet = async () => {
    if (!publicKey || !selectedOutcome || !betAmount) return

    const success = await placeBet(
      market.marketId,
      selectedOutcome,
      betAmount,
      publicKey.toString()
    )

    if (success) {
      onClose()
    }
  }

  const isValidBet = selectedOutcome && betAmount && parseFloat(betAmount) > 0

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-surfaceLight rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-surface border-b border-surfaceLight p-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-textPrimary">Place Bet</h2>
          <button
            onClick={onClose}
            className="text-textMuted hover:text-textPrimary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium text-textPrimary">{market.eventName}</h3>
            <p className="text-sm text-textSecondary">{market.description}</p>
          </div>

          {step === 'select' && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-textPrimary">Select Outcome</h4>
              <div className="grid gap-2">
                {market.outcomeOptions.map((outcome, index) => (
                  <button
                    key={outcome}
                    onClick={() => handleOutcomeSelect(outcome)}
                    className="bg-surfaceLight hover:bg-surface border border-surfaceLight rounded-lg p-4 text-left transition-colors group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-textPrimary">{outcome}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-accent font-bold">{market.currentOdds[index]}x</span>
                        <TrendingUp className="w-4 h-4 text-accent" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="bg-surfaceLight rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-textMuted">Selected Outcome</span>
                  <button
                    onClick={() => setStep('select')}
                    className="text-xs text-accent hover:underline"
                  >
                    Change
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-textPrimary">{selectedOutcome}</span>
                  <span className="text-accent font-bold">{odds}x</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-textPrimary">Bet Amount (SOL)</label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.001"
                  min="0"
                  className="w-full bg-surfaceLight border border-surfaceLight rounded-lg px-4 py-3 text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {betAmount && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-textMuted">Potential Payout</span>
                    <span className="font-bold text-textPrimary">{potentialPayout} SOL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-textMuted">Potential Profit</span>
                    <span className="font-bold text-success">
                      {(parseFloat(potentialPayout) - parseFloat(betAmount || 0)).toFixed(4)} SOL
                    </span>
                  </div>
                </div>
              )}

              {!publicKey && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-warning">Wallet Not Connected</p>
                    <p className="text-xs text-textSecondary mt-1">
                      Please connect your Solana wallet to place bets.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {step === 'confirm' && (
          <div className="sticky bottom-0 bg-surface border-t border-surfaceLight p-6">
            <button
              onClick={handlePlaceBet}
              disabled={!isValidBet || !publicKey || isPlacingBet}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlacingBet ? 'Placing Bet...' : `Place Bet ${betAmount ? `(${betAmount} SOL)` : ''}`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
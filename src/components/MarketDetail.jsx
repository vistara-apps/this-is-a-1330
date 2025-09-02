import React, { useState, useEffect } from 'react';
import { useBetting } from '../contexts/BettingContext';
import { useWallet } from '../contexts/WalletContext';
import { BettingModal } from './BettingModal';
import { Calendar, Clock, Users, TrendingUp, Award, AlertCircle } from 'lucide-react';

export const MarketDetail = ({ marketId, onClose }) => {
  const { 
    getMarketById, 
    getUserBetsForMarket, 
    hasActiveBetOnMarket,
    MarketStatus,
    BetStatus,
    claimBetWinnings
  } = useBetting();
  const { connected } = useWallet();
  
  const [market, setMarket] = useState(null);
  const [userBets, setUserBets] = useState([]);
  const [showBettingModal, setShowBettingModal] = useState(false);
  const [isClaimingWinnings, setIsClaimingWinnings] = useState(false);

  // Load market and user bets
  useEffect(() => {
    const marketData = getMarketById(marketId);
    if (marketData) {
      setMarket(marketData);
      setUserBets(getUserBetsForMarket(marketId));
    }
  }, [marketId, getMarketById, getUserBetsForMarket]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate time remaining
  const getTimeRemaining = (dateString) => {
    const endTime = new Date(dateString).getTime();
    const now = new Date().getTime();
    const timeRemaining = endTime - now;
    
    if (timeRemaining <= 0) {
      return 'Ended';
    }
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    }
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    
    return `${minutes}m remaining`;
  };

  // Handle claiming winnings
  const handleClaimWinnings = async (betId) => {
    setIsClaimingWinnings(true);
    try {
      await claimBetWinnings(betId);
      // Refresh user bets
      setUserBets(getUserBetsForMarket(marketId));
    } finally {
      setIsClaimingWinnings(false);
    }
  };

  if (!market) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-surface border border-surfaceLight rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
          <div className="p-6 text-center">
            <p className="text-textSecondary">Loading market details...</p>
          </div>
        </div>
      </div>
    );
  }

  const isActive = market.status === MarketStatus.ACTIVE;
  const isSettled = market.status === MarketStatus.SETTLED;
  const isClosed = market.status === MarketStatus.CLOSED;
  const isCancelled = market.status === MarketStatus.CANCELLED;
  const hasActiveBet = hasActiveBetOnMarket(marketId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-surfaceLight rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-surface border-b border-surfaceLight p-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-textPrimary">Market Details</h2>
          <button
            onClick={onClose}
            className="text-textMuted hover:text-textPrimary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Market Header */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                isActive ? 'bg-primary/20 text-primary' : 
                isSettled ? 'bg-success/20 text-success' : 
                isClosed ? 'bg-warning/20 text-warning' : 
                'bg-error/20 text-error'
              }`}>
                {isActive ? 'Active' : 
                 isSettled ? 'Settled' : 
                 isClosed ? 'Closed' : 
                 'Cancelled'}
              </span>
              <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-medium rounded-full">
                {market.category}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-textPrimary">{market.eventName}</h1>
            <p className="text-textSecondary">{market.description}</p>
          </div>

          {/* Market Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surfaceLight rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2 text-textSecondary">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Event Date</span>
              </div>
              <p className="text-textPrimary font-medium">{formatDate(market.eventDate)}</p>
              {isActive && (
                <p className="text-sm text-primary">{getTimeRemaining(market.eventDate)}</p>
              )}
            </div>

            <div className="bg-surfaceLight rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2 text-textSecondary">
                <Users className="w-4 h-4" />
                <span className="text-sm">Total Staked</span>
              </div>
              <p className="text-textPrimary font-medium">{market.totalStaked.toFixed(2)} SOL</p>
              <div className="h-1 bg-surface rounded-full overflow-hidden">
                {market.stakedPerOutcome.map((amount, index) => (
                  <div 
                    key={index}
                    className={`h-full ${
                      index === 0 ? 'bg-primary' : 
                      index === 1 ? 'bg-accent' : 
                      index === 2 ? 'bg-success' : 
                      'bg-warning'
                    }`}
                    style={{ 
                      width: `${(amount / market.totalStaked) * 100}%`,
                      float: 'left'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Outcomes */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-textPrimary">Outcomes</h3>
            <div className="grid gap-3">
              {market.outcomeOptions.map((outcome, index) => (
                <div 
                  key={index}
                  className={`bg-surfaceLight rounded-lg p-4 ${
                    isSettled && market.winningOutcome === index ? 'border-2 border-success' : 'border border-surfaceLight'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {isSettled && market.winningOutcome === index && (
                        <Award className="w-5 h-5 text-success" />
                      )}
                      <span className="font-medium text-textPrimary">{outcome}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-textSecondary">
                        {((market.stakedPerOutcome[index] / market.totalStaked) * 100).toFixed(1)}%
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-accent font-bold">{market.currentOdds[index]}x</span>
                        <TrendingUp className="w-4 h-4 text-accent" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-textSecondary">
                    {market.stakedPerOutcome[index].toFixed(2)} SOL staked
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Bets */}
          {userBets.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-textPrimary">Your Bets</h3>
              <div className="grid gap-3">
                {userBets.map((bet) => (
                  <div 
                    key={bet.betId}
                    className={`bg-surfaceLight rounded-lg p-4 ${
                      bet.status === BetStatus.WON ? 'border-2 border-success' : 
                      bet.status === BetStatus.LOST ? 'border-2 border-error' : 
                      bet.status === BetStatus.PENDING_CLAIM ? 'border-2 border-warning' : 
                      'border border-surfaceLight'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            bet.status === BetStatus.ACTIVE ? 'bg-primary/20 text-primary' : 
                            bet.status === BetStatus.WON ? 'bg-success/20 text-success' : 
                            bet.status === BetStatus.LOST ? 'bg-error/20 text-error' : 
                            bet.status === BetStatus.PENDING_CLAIM ? 'bg-warning/20 text-warning' : 
                            'bg-textMuted/20 text-textMuted'
                          }`}>
                            {bet.status === BetStatus.ACTIVE ? 'Active' : 
                             bet.status === BetStatus.WON ? 'Won' : 
                             bet.status === BetStatus.LOST ? 'Lost' : 
                             bet.status === BetStatus.PENDING_CLAIM ? 'Claim Available' : 
                             'Cancelled'}
                          </span>
                          <span className="font-medium text-textPrimary">{bet.selectedOutcomeText}</span>
                        </div>
                        <div className="mt-1 text-sm text-textSecondary">
                          {bet.stakedAmount.toFixed(2)} SOL staked at {bet.odds_at_placement || market.currentOdds[bet.selectedOutcome]}x
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-textPrimary">
                          {bet.potentialPayout.toFixed(2)} SOL
                        </div>
                        <div className="text-xs text-textSecondary">
                          Potential Payout
                        </div>
                      </div>
                    </div>

                    {bet.status === BetStatus.PENDING_CLAIM && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleClaimWinnings(bet.betId)}
                          disabled={isClaimingWinnings}
                          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isClaimingWinnings ? 'Claiming...' : 'Claim Winnings'}
                        </button>
                      </div>
                    )}

                    {bet.status === BetStatus.WON && bet.actualPayout && (
                      <div className="mt-2 flex items-center space-x-2 text-success">
                        <Award className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          You won {bet.actualPayout.toFixed(2)} SOL!
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning for closed markets */}
          {!isActive && !hasActiveBet && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning">
                  {isSettled ? 'Market has been settled' : 
                   isClosed ? 'Betting period has ended' : 
                   'Market has been cancelled'}
                </p>
                <p className="text-xs text-textSecondary mt-1">
                  {isSettled ? 'The winning outcome has been determined.' : 
                   isClosed ? 'This market is no longer accepting bets.' : 
                   'This market has been cancelled and all stakes have been returned.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isActive && (
          <div className="sticky bottom-0 bg-surface border-t border-surfaceLight p-6">
            <button
              onClick={() => setShowBettingModal(true)}
              disabled={!connected}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connected ? 'Place Bet' : 'Connect Wallet to Bet'}
            </button>
          </div>
        )}
      </div>

      {/* Betting Modal */}
      {showBettingModal && (
        <BettingModal 
          market={market} 
          onClose={() => setShowBettingModal(false)} 
        />
      )}
    </div>
  );
};

export default MarketDetail;


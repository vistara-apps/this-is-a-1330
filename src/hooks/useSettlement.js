import { useState, useCallback, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useWallet } from '../contexts/WalletContext';
import { useBetting } from '../contexts/BettingContext';
import { SettlementService } from '../services/SettlementService';

/**
 * Custom hook for market settlement functionality
 * @returns {Object} Settlement functions and state
 */
export const useSettlement = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { 
    markets, 
    setMarkets, 
    userBets, 
    setUserBets, 
    MarketStatus, 
    BetStatus 
  } = useBetting();
  
  const [isSettling, setIsSettling] = useState(false);
  const [settlementService, setSettlementService] = useState(null);

  // Initialize settlement service when connection and wallet are available
  useEffect(() => {
    if (connection && wallet.publicKey) {
      setSettlementService(new SettlementService(connection, wallet));
    } else {
      setSettlementService(null);
    }
  }, [connection, wallet]);

  /**
   * Settle a market with the specified winning outcome
   * @param {string} marketId - ID of the market to settle
   * @param {number} winningOutcome - Index of the winning outcome
   * @returns {Promise<boolean>} Success status
   */
  const settleMarket = useCallback(async (marketId, winningOutcome) => {
    if (!settlementService || !wallet.publicKey) {
      return false;
    }

    setIsSettling(true);
    try {
      // Call the settlement service to settle the market
      const signature = await settlementService.settleMarket(marketId, winningOutcome);
      
      // Update market status
      const updatedMarkets = markets.map(market => {
        if (market.marketId === marketId) {
          return {
            ...market,
            status: MarketStatus.SETTLED,
            winningOutcome,
            settledAt: new Date().toISOString()
          };
        }
        return market;
      });
      
      // Update user bets for this market
      const updatedBets = userBets.map(bet => {
        if (bet.marketId === marketId) {
          const isWinner = bet.selectedOutcome === winningOutcome;
          return {
            ...bet,
            status: isWinner ? BetStatus.PENDING_CLAIM : BetStatus.LOST,
            settledAt: new Date().toISOString()
          };
        }
        return bet;
      });
      
      // Update state
      setMarkets(updatedMarkets);
      setUserBets(updatedBets);
      
      return true;
    } catch (error) {
      console.error('Error settling market:', error);
      return false;
    } finally {
      setIsSettling(false);
    }
  }, [settlementService, wallet.publicKey, markets, userBets, MarketStatus, BetStatus, setMarkets, setUserBets]);

  /**
   * Check for markets that are ready for settlement
   * @returns {Array} Markets ready for settlement
   */
  const getMarketsReadyForSettlement = useCallback(() => {
    if (!settlementService) return [];
    return settlementService.getMarketsReadyForSettlement(markets);
  }, [settlementService, markets]);

  /**
   * Process automatic settlements for markets that are ready
   * @returns {Promise<void>}
   */
  const processAutomaticSettlements = useCallback(async () => {
    if (!settlementService || !wallet.publicKey) return;
    
    setIsSettling(true);
    try {
      await settlementService.processAutomaticSettlements(
        markets,
        (marketId, winningOutcome) => {
          // Update market status
          const updatedMarkets = markets.map(market => {
            if (market.marketId === marketId) {
              return {
                ...market,
                status: MarketStatus.SETTLED,
                winningOutcome,
                settledAt: new Date().toISOString()
              };
            }
            return market;
          });
          
          // Update user bets for this market
          const updatedBets = userBets.map(bet => {
            if (bet.marketId === marketId) {
              const isWinner = bet.selectedOutcome === winningOutcome;
              return {
                ...bet,
                status: isWinner ? BetStatus.PENDING_CLAIM : BetStatus.LOST,
                settledAt: new Date().toISOString()
              };
            }
            return bet;
          });
          
          // Update state
          setMarkets(updatedMarkets);
          setUserBets(updatedBets);
        }
      );
    } catch (error) {
      console.error('Error processing automatic settlements:', error);
    } finally {
      setIsSettling(false);
    }
  }, [settlementService, wallet.publicKey, markets, userBets, MarketStatus, BetStatus, setMarkets, setUserBets]);

  return {
    isSettling,
    settleMarket,
    getMarketsReadyForSettlement,
    processAutomaticSettlements
  };
};

export default useSettlement;


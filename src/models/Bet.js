/**
 * Bet model representing a user's bet
 */
export class Bet {
  /**
   * Constructor
   * @param {Object} data - Bet data
   */
  constructor(data) {
    this.betId = data.betId;
    this.userId = data.userId;
    this.marketId = data.marketId;
    this.selectedOutcome = data.selectedOutcome;
    this.selectedOutcomeText = data.selectedOutcomeText;
    this.stakedAmount = data.stakedAmount;
    this.oddsAtPlacement = data.oddsAtPlacement;
    this.potentialPayout = data.potentialPayout;
    this.status = data.status;
    this.transactionHash = data.transactionHash;
    this.timestamp = data.timestamp;
    this.settledAt = data.settledAt;
    this.actualPayout = data.actualPayout;
  }

  /**
   * Check if the bet is active
   * @returns {boolean} Whether the bet is active
   */
  isActive() {
    return this.status === 'active';
  }

  /**
   * Check if the bet is won
   * @returns {boolean} Whether the bet is won
   */
  isWon() {
    return this.status === 'won';
  }

  /**
   * Check if the bet is lost
   * @returns {boolean} Whether the bet is lost
   */
  isLost() {
    return this.status === 'lost';
  }

  /**
   * Check if the bet is cancelled
   * @returns {boolean} Whether the bet is cancelled
   */
  isCancelled() {
    return this.status === 'cancelled';
  }

  /**
   * Check if the bet is pending claim
   * @returns {boolean} Whether the bet is pending claim
   */
  isPendingClaim() {
    return this.status === 'pending_claim';
  }

  /**
   * Check if the bet is settled
   * @returns {boolean} Whether the bet is settled
   */
  isSettled() {
    return this.isWon() || this.isLost() || this.isPendingClaim();
  }

  /**
   * Calculate profit (actual payout - staked amount)
   * @returns {number} Profit amount
   */
  calculateProfit() {
    if (!this.isWon() || !this.actualPayout) {
      return 0;
    }
    return this.actualPayout - this.stakedAmount;
  }

  /**
   * Get formatted timestamp
   * @returns {string} Formatted timestamp
   */
  getFormattedTimestamp() {
    return new Date(this.timestamp).toLocaleString();
  }

  /**
   * Get formatted settled timestamp
   * @returns {string} Formatted settled timestamp
   */
  getFormattedSettledAt() {
    if (!this.settledAt) {
      return 'Not settled';
    }
    return new Date(this.settledAt).toLocaleString();
  }

  /**
   * Create a Bet instance from blockchain data
   * @param {Object} data - Blockchain bet data
   * @param {Object} market - Market data for outcome text
   * @returns {Bet} Bet instance
   */
  static fromBlockchain(data, market) {
    // Get outcome text from market if available
    const outcomeText = market && market.outcomeOptions && market.outcomeOptions[data.selectedOutcome]
      ? market.outcomeOptions[data.selectedOutcome]
      : `Outcome ${data.selectedOutcome}`;

    // Transform blockchain data to model format
    return new Bet({
      betId: data.betId.toString(),
      userId: data.user.toString(),
      marketId: data.marketId.toString(),
      selectedOutcome: data.selectedOutcome,
      selectedOutcomeText: outcomeText,
      stakedAmount: data.stakedAmount / 1e9, // Convert from lamports to SOL
      oddsAtPlacement: data.oddsAtPlacement / 10000, // Convert from basis points
      potentialPayout: data.potentialPayout / 1e9, // Convert from lamports to SOL
      status: data.isSettled 
        ? (data.isWinner === true ? 'won' : data.isWinner === false ? 'lost' : 'pending_claim')
        : 'active',
      transactionHash: data.transactionHash,
      timestamp: new Date(data.timestamp * 1000).toISOString(), // Convert from Unix timestamp
      settledAt: data.settledAt ? new Date(data.settledAt * 1000).toISOString() : null,
      actualPayout: data.actualPayout ? data.actualPayout / 1e9 : null, // Convert from lamports to SOL
    });
  }
}

export default Bet;


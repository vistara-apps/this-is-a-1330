/**
 * Market model representing a betting market
 */
export class Market {
  /**
   * Constructor
   * @param {Object} data - Market data
   */
  constructor(data) {
    this.marketId = data.marketId;
    this.eventName = data.eventName;
    this.description = data.description;
    this.category = data.category;
    this.outcomeOptions = data.outcomeOptions || [];
    this.currentOdds = data.currentOdds || [];
    this.status = data.status;
    this.totalStaked = data.totalStaked || 0;
    this.stakedPerOutcome = data.stakedPerOutcome || [];
    this.eventDate = data.eventDate;
    this.createdAt = data.createdAt;
    this.settledAt = data.settledAt;
    this.winningOutcome = data.winningOutcome;
    this.authority = data.authority;
    this.oracle = data.oracle;
    this.feePercentage = data.feePercentage;
  }

  /**
   * Check if the market is active
   * @returns {boolean} Whether the market is active
   */
  isActive() {
    return this.status === 'active';
  }

  /**
   * Check if the market is settled
   * @returns {boolean} Whether the market is settled
   */
  isSettled() {
    return this.status === 'settled';
  }

  /**
   * Check if the market is closed
   * @returns {boolean} Whether the market is closed
   */
  isClosed() {
    return this.status === 'closed';
  }

  /**
   * Check if the market is cancelled
   * @returns {boolean} Whether the market is cancelled
   */
  isCancelled() {
    return this.status === 'cancelled';
  }

  /**
   * Check if betting is allowed
   * @returns {boolean} Whether betting is allowed
   */
  isBettingAllowed() {
    if (!this.isActive()) {
      return false;
    }

    const now = new Date().getTime();
    const eventTime = new Date(this.eventDate).getTime();
    return now < eventTime;
  }

  /**
   * Get time remaining until event date
   * @returns {Object} Time remaining in days, hours, minutes
   */
  getTimeRemaining() {
    const now = new Date().getTime();
    const eventTime = new Date(this.eventDate).getTime();
    const timeRemaining = eventTime - now;

    if (timeRemaining <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
    }

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isEnded: false };
  }

  /**
   * Get formatted time remaining string
   * @returns {string} Formatted time remaining
   */
  getFormattedTimeRemaining() {
    const { days, hours, minutes, isEnded } = this.getTimeRemaining();

    if (isEnded) {
      return 'Ended';
    }

    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }

    return `${minutes}m remaining`;
  }

  /**
   * Calculate potential payout for a bet
   * @param {number} amount - Bet amount
   * @param {number} outcomeIndex - Selected outcome index
   * @returns {number} Potential payout
   */
  calculatePotentialPayout(amount, outcomeIndex) {
    if (outcomeIndex < 0 || outcomeIndex >= this.currentOdds.length) {
      throw new Error('Invalid outcome index');
    }

    const odds = this.currentOdds[outcomeIndex];
    return amount * odds;
  }

  /**
   * Get distribution percentages for each outcome
   * @returns {Array<number>} Distribution percentages
   */
  getDistributionPercentages() {
    if (this.totalStaked === 0) {
      return this.outcomeOptions.map(() => 0);
    }

    return this.stakedPerOutcome.map(amount => (amount / this.totalStaked) * 100);
  }

  /**
   * Create a Market instance from blockchain data
   * @param {Object} data - Blockchain market data
   * @returns {Market} Market instance
   */
  static fromBlockchain(data) {
    // Transform blockchain data to model format
    return new Market({
      marketId: data.marketId.toString(),
      eventName: data.name,
      description: data.description,
      category: data.category,
      outcomeOptions: data.outcomes,
      currentOdds: data.odds.map(odd => odd / 10000), // Convert from basis points
      status: data.status,
      totalStaked: data.totalStaked / 1e9, // Convert from lamports to SOL
      stakedPerOutcome: data.stakedPerOutcome.map(amount => amount / 1e9), // Convert from lamports to SOL
      eventDate: new Date(data.endTime * 1000).toISOString(), // Convert from Unix timestamp
      createdAt: new Date().toISOString(),
      settledAt: data.settledAt ? new Date(data.settledAt * 1000).toISOString() : null,
      winningOutcome: data.winningOutcome,
      authority: data.authority.toString(),
      oracle: data.oracle ? data.oracle.toString() : null,
      feePercentage: data.feePercentage / 100, // Convert from basis points to percentage
    });
  }
}

export default Market;


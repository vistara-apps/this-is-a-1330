/**
 * User model representing a user profile
 */
export class User {
  /**
   * Constructor
   * @param {Object} data - User data
   */
  constructor(data) {
    this.userId = data.userId;
    this.totalStaked = data.totalStaked || 0;
    this.totalWon = data.totalWon || 0;
    this.totalBets = data.totalBets || 0;
    this.winningBets = data.winningBets || 0;
    this.firstBetTimestamp = data.firstBetTimestamp;
    this.lastBetTimestamp = data.lastBetTimestamp;
  }

  /**
   * Calculate win rate
   * @returns {number} Win rate percentage
   */
  getWinRate() {
    if (this.totalBets === 0) {
      return 0;
    }
    return (this.winningBets / this.totalBets) * 100;
  }

  /**
   * Calculate profit (total won - total staked)
   * @returns {number} Profit amount
   */
  getProfit() {
    return this.totalWon - this.totalStaked;
  }

  /**
   * Calculate ROI (return on investment)
   * @returns {number} ROI percentage
   */
  getROI() {
    if (this.totalStaked === 0) {
      return 0;
    }
    return (this.getProfit() / this.totalStaked) * 100;
  }

  /**
   * Get formatted first bet timestamp
   * @returns {string} Formatted first bet timestamp
   */
  getFormattedFirstBetTimestamp() {
    if (!this.firstBetTimestamp) {
      return 'No bets yet';
    }
    return new Date(this.firstBetTimestamp).toLocaleDateString();
  }

  /**
   * Get formatted last bet timestamp
   * @returns {string} Formatted last bet timestamp
   */
  getFormattedLastBetTimestamp() {
    if (!this.lastBetTimestamp) {
      return 'No bets yet';
    }
    return new Date(this.lastBetTimestamp).toLocaleDateString();
  }

  /**
   * Get user activity duration in days
   * @returns {number} Activity duration in days
   */
  getActivityDuration() {
    if (!this.firstBetTimestamp || !this.lastBetTimestamp) {
      return 0;
    }
    
    const first = new Date(this.firstBetTimestamp).getTime();
    const last = new Date(this.lastBetTimestamp).getTime();
    const diffTime = Math.abs(last - first);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  /**
   * Create a User instance from blockchain data
   * @param {Object} data - Blockchain user data
   * @returns {User} User instance
   */
  static fromBlockchain(data) {
    // Transform blockchain data to model format
    return new User({
      userId: data.user.toString(),
      totalStaked: data.totalStaked / 1e9, // Convert from lamports to SOL
      totalWon: data.totalWon / 1e9, // Convert from lamports to SOL
      totalBets: data.totalBets,
      winningBets: data.winningBets,
      firstBetTimestamp: data.firstBetTimestamp 
        ? new Date(data.firstBetTimestamp * 1000).toISOString() 
        : null,
      lastBetTimestamp: data.lastBetTimestamp 
        ? new Date(data.lastBetTimestamp * 1000).toISOString() 
        : null,
    });
  }
}

export default User;


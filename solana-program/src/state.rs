use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    program_pack::{IsInitialized, Sealed},
    pubkey::Pubkey,
};

/// Market status enum
#[derive(BorshSerialize, BorshDeserialize, Clone, Copy, PartialEq, Debug)]
pub enum MarketStatus {
    /// Market is active and accepting bets
    Active,
    
    /// Market is closed for betting but not yet settled
    Closed,
    
    /// Market has been settled and payouts distributed
    Settled,
    
    /// Market has been cancelled and stakes returned
    Cancelled,
}

/// Market data structure
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Market {
    /// Is the account initialized
    pub is_initialized: bool,
    
    /// Market ID (unique identifier)
    pub market_id: [u8; 32],
    
    /// Authority that can update and settle the market
    pub authority: Pubkey,
    
    /// Market name/title
    pub name: String,
    
    /// Market description
    pub description: String,
    
    /// Category of the market (e.g., crypto, sports, esports)
    pub category: String,
    
    /// Possible outcomes for this market
    pub outcomes: Vec<String>,
    
    /// Current odds for each outcome (stored as basis points, e.g., 15000 = 1.5x)
    pub odds: Vec<u32>,
    
    /// Start time when betting is allowed (Unix timestamp)
    pub start_time: i64,
    
    /// End time when betting closes (Unix timestamp)
    pub end_time: i64,
    
    /// Settlement time when results are expected (Unix timestamp)
    pub settlement_time: i64,
    
    /// Current status of the market
    pub status: MarketStatus,
    
    /// Total amount staked on this market
    pub total_staked: u64,
    
    /// Amount staked per outcome
    pub staked_per_outcome: Vec<u64>,
    
    /// Winning outcome index (set during settlement)
    pub winning_outcome: Option<u8>,
    
    /// Platform fee percentage (basis points, e.g., 300 = 3%)
    pub fee_percentage: u16,
    
    /// Oracle public key for result verification (if applicable)
    pub oracle: Option<Pubkey>,
}

impl Sealed for Market {}

impl IsInitialized for Market {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

/// Bet data structure
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Bet {
    /// Is the account initialized
    pub is_initialized: bool,
    
    /// Bet ID (unique identifier)
    pub bet_id: [u8; 32],
    
    /// User who placed the bet
    pub user: Pubkey,
    
    /// Market ID this bet belongs to
    pub market_id: [u8; 32],
    
    /// Selected outcome index
    pub selected_outcome: u8,
    
    /// Amount staked in lamports
    pub staked_amount: u64,
    
    /// Odds at the time of bet placement (basis points)
    pub odds_at_placement: u32,
    
    /// Potential payout if the bet wins
    pub potential_payout: u64,
    
    /// Timestamp when the bet was placed
    pub timestamp: i64,
    
    /// Has the bet been settled
    pub is_settled: bool,
    
    /// Has the bet won (set during settlement)
    pub is_winner: Option<bool>,
    
    /// Actual payout received (set during settlement)
    pub actual_payout: Option<u64>,
}

impl Sealed for Bet {}

impl IsInitialized for Bet {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

/// User profile data structure
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct UserProfile {
    /// Is the account initialized
    pub is_initialized: bool,
    
    /// User public key
    pub user: Pubkey,
    
    /// Total amount staked across all bets
    pub total_staked: u64,
    
    /// Total amount won across all bets
    pub total_won: u64,
    
    /// Total number of bets placed
    pub total_bets: u32,
    
    /// Number of winning bets
    pub winning_bets: u32,
    
    /// Timestamp of first bet
    pub first_bet_timestamp: Option<i64>,
    
    /// Timestamp of most recent bet
    pub last_bet_timestamp: Option<i64>,
}

impl Sealed for UserProfile {}

impl IsInitialized for UserProfile {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

/// Platform data structure for global settings and stats
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Platform {
    /// Is the account initialized
    pub is_initialized: bool,
    
    /// Platform authority that can update settings
    pub authority: Pubkey,
    
    /// Default fee percentage for markets (basis points)
    pub default_fee_percentage: u16,
    
    /// Treasury account where fees are collected
    pub treasury: Pubkey,
    
    /// Total volume processed by the platform
    pub total_volume: u64,
    
    /// Total fees collected
    pub total_fees_collected: u64,
    
    /// Total number of markets created
    pub total_markets: u32,
    
    /// Total number of bets placed
    pub total_bets: u32,
    
    /// Total number of unique users
    pub total_users: u32,
}

impl Sealed for Platform {}

impl IsInitialized for Platform {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}


use solana_program::{program_error::ProgramError, decode_error::DecodeError};
use thiserror::Error;

/// Custom errors for the SOLBet Chain program
#[derive(Error, Debug, Copy, Clone)]
pub enum BettingError {
    /// Invalid instruction data passed
    #[error("Invalid instruction data")]
    InvalidInstructionData,

    /// Market already exists
    #[error("Market already exists")]
    MarketAlreadyExists,

    /// Market not found
    #[error("Market not found")]
    MarketNotFound,

    /// Market already settled
    #[error("Market already settled")]
    MarketAlreadySettled,

    /// Market not active
    #[error("Market not active")]
    MarketNotActive,

    /// Market not ready for settlement
    #[error("Market not ready for settlement")]
    MarketNotReadyForSettlement,

    /// Invalid market outcome
    #[error("Invalid market outcome")]
    InvalidMarketOutcome,

    /// Invalid bet amount
    #[error("Invalid bet amount")]
    InvalidBetAmount,

    /// Insufficient funds
    #[error("Insufficient funds")]
    InsufficientFunds,

    /// Unauthorized operation
    #[error("Unauthorized operation")]
    Unauthorized,

    /// Invalid timestamp
    #[error("Invalid timestamp")]
    InvalidTimestamp,

    /// Bet already exists
    #[error("Bet already exists")]
    BetAlreadyExists,

    /// Bet not found
    #[error("Bet not found")]
    BetNotFound,

    /// Invalid odds
    #[error("Invalid odds")]
    InvalidOdds,

    /// Invalid fee percentage
    #[error("Invalid fee percentage")]
    InvalidFeePercentage,

    /// Calculation overflow
    #[error("Calculation overflow")]
    CalculationOverflow,
}

impl From<BettingError> for ProgramError {
    fn from(e: BettingError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

impl<T> DecodeError<T> for BettingError {
    fn type_of() -> &'static str {
        "BettingError"
    }
}


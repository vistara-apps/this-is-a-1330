use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
    system_program,
};

/// Instructions supported by the SOLBet Chain program
#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, PartialEq)]
pub enum BettingInstruction {
    /// Initialize the platform with default settings
    ///
    /// Accounts expected:
    /// 0. `[signer]` Platform authority
    /// 1. `[writable]` Platform account (PDA)
    /// 2. `[]` Treasury account
    /// 3. `[]` System program
    InitializePlatform {
        /// Default fee percentage (basis points)
        default_fee_percentage: u16,
    },

    /// Create a new betting market
    ///
    /// Accounts expected:
    /// 0. `[signer]` Market creator/authority
    /// 1. `[writable]` Market account (PDA)
    /// 2. `[]` Platform account
    /// 3. `[]` System program
    CreateMarket {
        /// Market name/title
        name: String,
        
        /// Market description
        description: String,
        
        /// Category of the market
        category: String,
        
        /// Possible outcomes for this market
        outcomes: Vec<String>,
        
        /// Initial odds for each outcome (basis points)
        odds: Vec<u32>,
        
        /// Start time when betting is allowed (Unix timestamp)
        start_time: i64,
        
        /// End time when betting closes (Unix timestamp)
        end_time: i64,
        
        /// Settlement time when results are expected (Unix timestamp)
        settlement_time: i64,
        
        /// Optional fee percentage override (basis points)
        fee_percentage: Option<u16>,
        
        /// Optional oracle public key for result verification
        oracle: Option<Pubkey>,
    },

    /// Place a bet on a market outcome
    ///
    /// Accounts expected:
    /// 0. `[signer]` User placing the bet
    /// 1. `[writable]` Bet account (PDA)
    /// 2. `[writable]` User profile account (PDA)
    /// 3. `[writable]` Market account
    /// 4. `[writable]` Escrow account to hold staked SOL
    /// 5. `[]` Platform account
    /// 6. `[]` System program
    PlaceBet {
        /// Selected outcome index
        selected_outcome: u8,
        
        /// Amount to stake in lamports
        stake_amount: u64,
    },

    /// Settle a market and distribute payouts
    ///
    /// Accounts expected:
    /// 0. `[signer]` Market authority or oracle
    /// 1. `[writable]` Market account
    /// 2. `[writable]` Platform account
    /// 3. `[writable]` Treasury account
    /// 4. `[]` System program
    /// 5+ `[writable]` Variable number of bet accounts to settle
    SettleMarket {
        /// Winning outcome index
        winning_outcome: u8,
    },

    /// Claim winnings from a settled bet
    ///
    /// Accounts expected:
    /// 0. `[signer]` Bet owner
    /// 1. `[writable]` Bet account
    /// 2. `[writable]` User profile account
    /// 3. `[writable]` Market account
    /// 4. `[writable]` Escrow account
    /// 5. `[]` System program
    ClaimWinnings {},

    /// Cancel a market and return stakes
    ///
    /// Accounts expected:
    /// 0. `[signer]` Market authority
    /// 1. `[writable]` Market account
    /// 2. `[]` System program
    /// 3+ `[writable]` Variable number of bet accounts to refund
    CancelMarket {
        /// Reason for cancellation
        reason: String,
    },

    /// Update market odds
    ///
    /// Accounts expected:
    /// 0. `[signer]` Market authority
    /// 1. `[writable]` Market account
    UpdateOdds {
        /// New odds for each outcome (basis points)
        new_odds: Vec<u32>,
    },

    /// Update platform settings
    ///
    /// Accounts expected:
    /// 0. `[signer]` Platform authority
    /// 1. `[writable]` Platform account
    /// 2. `[]` New treasury account (if being updated)
    UpdatePlatformSettings {
        /// New default fee percentage (basis points)
        new_default_fee_percentage: Option<u16>,
        
        /// New treasury account
        new_treasury: Option<Pubkey>,
    },
}

/// Creates an InitializePlatform instruction
pub fn initialize_platform(
    program_id: &Pubkey,
    authority: &Pubkey,
    platform_account: &Pubkey,
    treasury_account: &Pubkey,
    default_fee_percentage: u16,
) -> Instruction {
    let data = BettingInstruction::InitializePlatform {
        default_fee_percentage,
    }
    .try_to_vec()
    .unwrap();

    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new_readonly(*authority, true),
            AccountMeta::new(*platform_account, false),
            AccountMeta::new_readonly(*treasury_account, false),
            AccountMeta::new_readonly(system_program::id(), false),
        ],
        data,
    }
}

/// Creates a CreateMarket instruction
pub fn create_market(
    program_id: &Pubkey,
    authority: &Pubkey,
    market_account: &Pubkey,
    platform_account: &Pubkey,
    name: String,
    description: String,
    category: String,
    outcomes: Vec<String>,
    odds: Vec<u32>,
    start_time: i64,
    end_time: i64,
    settlement_time: i64,
    fee_percentage: Option<u16>,
    oracle: Option<Pubkey>,
) -> Instruction {
    let data = BettingInstruction::CreateMarket {
        name,
        description,
        category,
        outcomes,
        odds,
        start_time,
        end_time,
        settlement_time,
        fee_percentage,
        oracle,
    }
    .try_to_vec()
    .unwrap();

    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new_readonly(*authority, true),
            AccountMeta::new(*market_account, false),
            AccountMeta::new_readonly(*platform_account, false),
            AccountMeta::new_readonly(system_program::id(), false),
        ],
        data,
    }
}

/// Creates a PlaceBet instruction
pub fn place_bet(
    program_id: &Pubkey,
    user: &Pubkey,
    bet_account: &Pubkey,
    user_profile_account: &Pubkey,
    market_account: &Pubkey,
    escrow_account: &Pubkey,
    platform_account: &Pubkey,
    selected_outcome: u8,
    stake_amount: u64,
) -> Instruction {
    let data = BettingInstruction::PlaceBet {
        selected_outcome,
        stake_amount,
    }
    .try_to_vec()
    .unwrap();

    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new(*user, true),
            AccountMeta::new(*bet_account, false),
            AccountMeta::new(*user_profile_account, false),
            AccountMeta::new(*market_account, false),
            AccountMeta::new(*escrow_account, false),
            AccountMeta::new_readonly(*platform_account, false),
            AccountMeta::new_readonly(system_program::id(), false),
        ],
        data,
    }
}

/// Creates a SettleMarket instruction
pub fn settle_market(
    program_id: &Pubkey,
    authority: &Pubkey,
    market_account: &Pubkey,
    platform_account: &Pubkey,
    treasury_account: &Pubkey,
    bet_accounts: &[Pubkey],
    winning_outcome: u8,
) -> Instruction {
    let data = BettingInstruction::SettleMarket { winning_outcome }
        .try_to_vec()
        .unwrap();

    let mut accounts = vec![
        AccountMeta::new_readonly(*authority, true),
        AccountMeta::new(*market_account, false),
        AccountMeta::new(*platform_account, false),
        AccountMeta::new(*treasury_account, false),
        AccountMeta::new_readonly(system_program::id(), false),
    ];

    for bet_account in bet_accounts {
        accounts.push(AccountMeta::new(*bet_account, false));
    }

    Instruction {
        program_id: *program_id,
        accounts,
        data,
    }
}

/// Creates a ClaimWinnings instruction
pub fn claim_winnings(
    program_id: &Pubkey,
    user: &Pubkey,
    bet_account: &Pubkey,
    user_profile_account: &Pubkey,
    market_account: &Pubkey,
    escrow_account: &Pubkey,
) -> Instruction {
    let data = BettingInstruction::ClaimWinnings {}.try_to_vec().unwrap();

    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new(*user, true),
            AccountMeta::new(*bet_account, false),
            AccountMeta::new(*user_profile_account, false),
            AccountMeta::new(*market_account, false),
            AccountMeta::new(*escrow_account, false),
            AccountMeta::new_readonly(system_program::id(), false),
        ],
        data,
    }
}

/// Creates a CancelMarket instruction
pub fn cancel_market(
    program_id: &Pubkey,
    authority: &Pubkey,
    market_account: &Pubkey,
    bet_accounts: &[Pubkey],
    reason: String,
) -> Instruction {
    let data = BettingInstruction::CancelMarket { reason }
        .try_to_vec()
        .unwrap();

    let mut accounts = vec![
        AccountMeta::new_readonly(*authority, true),
        AccountMeta::new(*market_account, false),
        AccountMeta::new_readonly(system_program::id(), false),
    ];

    for bet_account in bet_accounts {
        accounts.push(AccountMeta::new(*bet_account, false));
    }

    Instruction {
        program_id: *program_id,
        accounts,
        data,
    }
}

/// Creates an UpdateOdds instruction
pub fn update_odds(
    program_id: &Pubkey,
    authority: &Pubkey,
    market_account: &Pubkey,
    new_odds: Vec<u32>,
) -> Instruction {
    let data = BettingInstruction::UpdateOdds { new_odds }
        .try_to_vec()
        .unwrap();

    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new_readonly(*authority, true),
            AccountMeta::new(*market_account, false),
        ],
        data,
    }
}

/// Creates an UpdatePlatformSettings instruction
pub fn update_platform_settings(
    program_id: &Pubkey,
    authority: &Pubkey,
    platform_account: &Pubkey,
    treasury_account: Option<&Pubkey>,
    new_default_fee_percentage: Option<u16>,
    new_treasury: Option<Pubkey>,
) -> Instruction {
    let data = BettingInstruction::UpdatePlatformSettings {
        new_default_fee_percentage,
        new_treasury,
    }
    .try_to_vec()
    .unwrap();

    let mut accounts = vec![
        AccountMeta::new_readonly(*authority, true),
        AccountMeta::new(*platform_account, false),
    ];

    if let Some(treasury) = treasury_account {
        accounts.push(AccountMeta::new_readonly(*treasury, false));
    }

    Instruction {
        program_id: *program_id,
        accounts,
        data,
    }
}


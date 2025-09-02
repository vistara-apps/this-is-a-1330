use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    program_pack::Pack,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};
use std::convert::TryFrom;

use crate::{
    error::BettingError,
    instruction::BettingInstruction,
    state::{Bet, Market, MarketStatus, Platform, UserProfile},
};

/// Program state handler
pub struct Processor;

impl Processor {
    /// Process a SOLBet Chain instruction
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = BettingInstruction::try_from_slice(instruction_data)
            .map_err(|_| ProgramError::InvalidInstructionData)?;

        match instruction {
            BettingInstruction::InitializePlatform {
                default_fee_percentage,
            } => Self::process_initialize_platform(program_id, accounts, default_fee_percentage),
            
            BettingInstruction::CreateMarket {
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
            } => Self::process_create_market(
                program_id,
                accounts,
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
            ),
            
            BettingInstruction::PlaceBet {
                selected_outcome,
                stake_amount,
            } => Self::process_place_bet(program_id, accounts, selected_outcome, stake_amount),
            
            BettingInstruction::SettleMarket { winning_outcome } => {
                Self::process_settle_market(program_id, accounts, winning_outcome)
            }
            
            BettingInstruction::ClaimWinnings {} => Self::process_claim_winnings(program_id, accounts),
            
            BettingInstruction::CancelMarket { reason } => {
                Self::process_cancel_market(program_id, accounts, reason)
            }
            
            BettingInstruction::UpdateOdds { new_odds } => {
                Self::process_update_odds(program_id, accounts, new_odds)
            }
            
            BettingInstruction::UpdatePlatformSettings {
                new_default_fee_percentage,
                new_treasury,
            } => Self::process_update_platform_settings(
                program_id,
                accounts,
                new_default_fee_percentage,
                new_treasury,
            ),
        }
    }

    /// Process InitializePlatform instruction
    fn process_initialize_platform(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        default_fee_percentage: u16,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        
        // Get accounts
        let authority_info = next_account_info(account_info_iter)?;
        let platform_account_info = next_account_info(account_info_iter)?;
        let treasury_account_info = next_account_info(account_info_iter)?;
        let system_program_info = next_account_info(account_info_iter)?;

        // Verify authority is signer
        if !authority_info.is_signer {
            return Err(BettingError::Unauthorized.into());
        }

        // Verify fee percentage is valid (max 10%)
        if default_fee_percentage > 1000 {
            return Err(BettingError::InvalidFeePercentage.into());
        }

        // Create platform account with PDA
        let (platform_pda, bump_seed) = Pubkey::find_program_address(
            &[b"platform"],
            program_id,
        );

        // Verify platform account
        if platform_pda != *platform_account_info.key {
            return Err(ProgramError::InvalidAccountData);
        }

        // Calculate rent
        let rent = Rent::get()?;
        let platform_size = std::mem::size_of::<Platform>();
        let rent_lamports = rent.minimum_balance(platform_size);

        // Create platform account
        invoke_signed(
            &system_instruction::create_account(
                authority_info.key,
                &platform_pda,
                rent_lamports,
                platform_size as u64,
                program_id,
            ),
            &[
                authority_info.clone(),
                platform_account_info.clone(),
                system_program_info.clone(),
            ],
            &[&[b"platform", &[bump_seed]]],
        )?;

        // Initialize platform data
        let platform = Platform {
            is_initialized: true,
            authority: *authority_info.key,
            default_fee_percentage,
            treasury: *treasury_account_info.key,
            total_volume: 0,
            total_fees_collected: 0,
            total_markets: 0,
            total_bets: 0,
            total_users: 0,
        };

        // Serialize and store platform data
        platform.serialize(&mut *platform_account_info.data.borrow_mut())?;

        msg!("Platform initialized with default fee: {}bps", default_fee_percentage);
        Ok(())
    }

    /// Process CreateMarket instruction
    fn process_create_market(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
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
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        
        // Get accounts
        let authority_info = next_account_info(account_info_iter)?;
        let market_account_info = next_account_info(account_info_iter)?;
        let platform_account_info = next_account_info(account_info_iter)?;
        let system_program_info = next_account_info(account_info_iter)?;

        // Verify authority is signer
        if !authority_info.is_signer {
            return Err(BettingError::Unauthorized.into());
        }

        // Validate inputs
        if outcomes.is_empty() || outcomes.len() > 10 {
            return Err(BettingError::InvalidMarketOutcome.into());
        }

        if odds.len() != outcomes.len() {
            return Err(BettingError::InvalidOdds.into());
        }

        for &odd in odds.iter() {
            if odd < 10000 {  // Minimum odds of 1.0
                return Err(BettingError::InvalidOdds.into());
            }
        }

        let current_time = solana_program::clock::Clock::get()?.unix_timestamp;
        if start_time >= end_time || end_time >= settlement_time || start_time < current_time {
            return Err(BettingError::InvalidTimestamp.into());
        }

        // Load platform data
        let platform_data = Platform::try_from_slice(&platform_account_info.data.borrow())?;
        
        // Get fee percentage (use platform default if not specified)
        let market_fee_percentage = fee_percentage.unwrap_or(platform_data.default_fee_percentage);
        
        // Validate fee percentage
        if market_fee_percentage > 1000 {  // Max 10%
            return Err(BettingError::InvalidFeePercentage.into());
        }

        // Generate market ID (using authority and timestamp)
        let market_id = solana_program::hash::hash(
            &[
                authority_info.key.to_bytes().as_ref(),
                &current_time.to_le_bytes(),
                name.as_bytes(),
            ]
            .concat(),
        )
        .to_bytes();

        // Create market account with PDA
        let (market_pda, bump_seed) = Pubkey::find_program_address(
            &[b"market", &market_id],
            program_id,
        );

        // Verify market account
        if market_pda != *market_account_info.key {
            return Err(ProgramError::InvalidAccountData);
        }

        // Calculate rent
        let rent = Rent::get()?;
        let market_size = std::mem::size_of::<Market>() + 
                          name.len() + 
                          description.len() + 
                          category.len() + 
                          outcomes.iter().map(|o| o.len()).sum::<usize>() +
                          (outcomes.len() * std::mem::size_of::<u64>());
        
        let rent_lamports = rent.minimum_balance(market_size);

        // Create market account
        invoke_signed(
            &system_instruction::create_account(
                authority_info.key,
                &market_pda,
                rent_lamports,
                market_size as u64,
                program_id,
            ),
            &[
                authority_info.clone(),
                market_account_info.clone(),
                system_program_info.clone(),
            ],
            &[&[b"market", &market_id, &[bump_seed]]],
        )?;

        // Initialize staked_per_outcome with zeros
        let mut staked_per_outcome = Vec::with_capacity(outcomes.len());
        for _ in 0..outcomes.len() {
            staked_per_outcome.push(0);
        }

        // Initialize market data
        let market = Market {
            is_initialized: true,
            market_id,
            authority: *authority_info.key,
            name,
            description,
            category,
            outcomes,
            odds,
            start_time,
            end_time,
            settlement_time,
            status: MarketStatus::Active,
            total_staked: 0,
            staked_per_outcome,
            winning_outcome: None,
            fee_percentage: market_fee_percentage,
            oracle,
        };

        // Serialize and store market data
        market.serialize(&mut *market_account_info.data.borrow_mut())?;

        // Update platform stats
        // Note: In a real implementation, we would update the platform account
        // to increment total_markets, but we'll skip that for this example

        msg!("Market created: {}", market.name);
        Ok(())
    }

    /// Process PlaceBet instruction
    fn process_place_bet(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        selected_outcome: u8,
        stake_amount: u64,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        
        // Get accounts
        let user_info = next_account_info(account_info_iter)?;
        let bet_account_info = next_account_info(account_info_iter)?;
        let user_profile_info = next_account_info(account_info_iter)?;
        let market_account_info = next_account_info(account_info_iter)?;
        let escrow_account_info = next_account_info(account_info_iter)?;
        let platform_account_info = next_account_info(account_info_iter)?;
        let system_program_info = next_account_info(account_info_iter)?;

        // Verify user is signer
        if !user_info.is_signer {
            return Err(BettingError::Unauthorized.into());
        }

        // Validate stake amount
        if stake_amount == 0 {
            return Err(BettingError::InvalidBetAmount.into());
        }

        // Check user has enough SOL
        if user_info.lamports() < stake_amount {
            return Err(BettingError::InsufficientFunds.into());
        }

        // Load market data
        let mut market = Market::try_from_slice(&market_account_info.data.borrow())?;
        
        // Validate market is active
        if market.status != MarketStatus::Active {
            return Err(BettingError::MarketNotActive.into());
        }

        // Check current time is within betting window
        let current_time = solana_program::clock::Clock::get()?.unix_timestamp;
        if current_time < market.start_time || current_time >= market.end_time {
            return Err(BettingError::MarketNotActive.into());
        }

        // Validate selected outcome
        if selected_outcome as usize >= market.outcomes.len() {
            return Err(BettingError::InvalidMarketOutcome.into());
        }

        // Get odds for selected outcome
        let odds = market.odds[selected_outcome as usize];
        
        // Calculate potential payout
        let potential_payout = (stake_amount as u128 * odds as u128 / 10000) as u64;
        
        // Generate bet ID (using user, market, and timestamp)
        let bet_id = solana_program::hash::hash(
            &[
                user_info.key.to_bytes().as_ref(),
                &market.market_id,
                &current_time.to_le_bytes(),
            ]
            .concat(),
        )
        .to_bytes();

        // Create bet account with PDA
        let (bet_pda, bump_seed) = Pubkey::find_program_address(
            &[b"bet", &bet_id],
            program_id,
        );

        // Verify bet account
        if bet_pda != *bet_account_info.key {
            return Err(ProgramError::InvalidAccountData);
        }

        // Calculate rent
        let rent = Rent::get()?;
        let bet_size = std::mem::size_of::<Bet>();
        let rent_lamports = rent.minimum_balance(bet_size);

        // Create bet account
        invoke_signed(
            &system_instruction::create_account(
                user_info.key,
                &bet_pda,
                rent_lamports,
                bet_size as u64,
                program_id,
            ),
            &[
                user_info.clone(),
                bet_account_info.clone(),
                system_program_info.clone(),
            ],
            &[&[b"bet", &bet_id, &[bump_seed]]],
        )?;

        // Initialize bet data
        let bet = Bet {
            is_initialized: true,
            bet_id,
            user: *user_info.key,
            market_id: market.market_id,
            selected_outcome,
            staked_amount: stake_amount,
            odds_at_placement: odds,
            potential_payout,
            timestamp: current_time,
            is_settled: false,
            is_winner: None,
            actual_payout: None,
        };

        // Serialize and store bet data
        bet.serialize(&mut *bet_account_info.data.borrow_mut())?;

        // Transfer stake to escrow
        invoke(
            &system_instruction::transfer(user_info.key, escrow_account_info.key, stake_amount),
            &[
                user_info.clone(),
                escrow_account_info.clone(),
                system_program_info.clone(),
            ],
        )?;

        // Update market data
        market.total_staked += stake_amount;
        market.staked_per_outcome[selected_outcome as usize] += stake_amount;
        
        // Save updated market data
        market.serialize(&mut *market_account_info.data.borrow_mut())?;

        // Create or update user profile
        // Note: In a real implementation, we would check if the user profile exists
        // and create it if not, then update the stats. We'll skip that for this example.

        msg!("Bet placed: {} SOL on outcome {}", stake_amount as f64 / 1_000_000_000.0, selected_outcome);
        Ok(())
    }

    /// Process SettleMarket instruction
    fn process_settle_market(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        winning_outcome: u8,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        
        // Get accounts
        let authority_info = next_account_info(account_info_iter)?;
        let market_account_info = next_account_info(account_info_iter)?;
        let platform_account_info = next_account_info(account_info_iter)?;
        let treasury_account_info = next_account_info(account_info_iter)?;
        let system_program_info = next_account_info(account_info_iter)?;

        // Load market data
        let mut market = Market::try_from_slice(&market_account_info.data.borrow())?;
        
        // Verify authority is signer and is market authority or oracle
        if !authority_info.is_signer {
            return Err(BettingError::Unauthorized.into());
        }

        if *authority_info.key != market.authority && 
           Some(*authority_info.key) != market.oracle {
            return Err(BettingError::Unauthorized.into());
        }

        // Validate market can be settled
        if market.status != MarketStatus::Active && market.status != MarketStatus::Closed {
            return Err(BettingError::MarketAlreadySettled.into());
        }

        // Check current time is after end time
        let current_time = solana_program::clock::Clock::get()?.unix_timestamp;
        if current_time < market.end_time {
            return Err(BettingError::MarketNotReadyForSettlement.into());
        }

        // Validate winning outcome
        if winning_outcome as usize >= market.outcomes.len() {
            return Err(BettingError::InvalidMarketOutcome.into());
        }

        // Update market status and winning outcome
        market.status = MarketStatus::Settled;
        market.winning_outcome = Some(winning_outcome);
        
        // Save updated market data
        market.serialize(&mut *market_account_info.data.borrow_mut())?;

        // Note: In a real implementation, we would process all bets here
        // and distribute winnings, but we'll skip that for this example
        // as it would require iterating through all bet accounts.

        msg!("Market settled with winning outcome: {}", winning_outcome);
        Ok(())
    }

    /// Process ClaimWinnings instruction
    fn process_claim_winnings(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        
        // Get accounts
        let user_info = next_account_info(account_info_iter)?;
        let bet_account_info = next_account_info(account_info_iter)?;
        let user_profile_info = next_account_info(account_info_iter)?;
        let market_account_info = next_account_info(account_info_iter)?;
        let escrow_account_info = next_account_info(account_info_iter)?;
        let system_program_info = next_account_info(account_info_iter)?;

        // Verify user is signer
        if !user_info.is_signer {
            return Err(BettingError::Unauthorized.into());
        }

        // Load bet data
        let mut bet = Bet::try_from_slice(&bet_account_info.data.borrow())?;
        
        // Verify bet belongs to user
        if bet.user != *user_info.key {
            return Err(BettingError::Unauthorized.into());
        }

        // Check bet is not already settled
        if bet.is_settled {
            return Err(ProgramError::InvalidAccountData);
        }

        // Load market data
        let market = Market::try_from_slice(&market_account_info.data.borrow())?;
        
        // Verify market is settled
        if market.status != MarketStatus::Settled {
            return Err(BettingError::MarketNotReadyForSettlement.into());
        }

        // Verify bet is for this market
        if bet.market_id != market.market_id {
            return Err(ProgramError::InvalidAccountData);
        }

        // Get winning outcome
        let winning_outcome = market.winning_outcome.ok_or(BettingError::MarketNotReadyForSettlement)?;
        
        // Determine if bet is a winner
        let is_winner = bet.selected_outcome == winning_outcome;
        
        // Update bet data
        bet.is_settled = true;
        bet.is_winner = Some(is_winner);
        
        // If bet is a winner, calculate payout and transfer funds
        if is_winner {
            // Calculate payout (potential payout minus platform fee)
            let fee_amount = (bet.potential_payout as u128 * market.fee_percentage as u128 / 10000) as u64;
            let actual_payout = bet.potential_payout.saturating_sub(fee_amount);
            
            bet.actual_payout = Some(actual_payout);
            
            // Transfer winnings from escrow to user
            // Note: In a real implementation, we would use a proper escrow mechanism
            // and handle the transfer of funds correctly. This is simplified.
            
            msg!("Bet won! Payout: {} SOL", actual_payout as f64 / 1_000_000_000.0);
        } else {
            bet.actual_payout = Some(0);
            msg!("Bet lost!");
        }
        
        // Save updated bet data
        bet.serialize(&mut *bet_account_info.data.borrow_mut())?;

        // Update user profile
        // Note: In a real implementation, we would update the user profile stats
        // but we'll skip that for this example.

        Ok(())
    }

    /// Process CancelMarket instruction
    fn process_cancel_market(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        reason: String,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        
        // Get accounts
        let authority_info = next_account_info(account_info_iter)?;
        let market_account_info = next_account_info(account_info_iter)?;
        let system_program_info = next_account_info(account_info_iter)?;

        // Load market data
        let mut market = Market::try_from_slice(&market_account_info.data.borrow())?;
        
        // Verify authority is signer and is market authority
        if !authority_info.is_signer || *authority_info.key != market.authority {
            return Err(BettingError::Unauthorized.into());
        }

        // Validate market can be cancelled
        if market.status != MarketStatus::Active && market.status != MarketStatus::Closed {
            return Err(BettingError::MarketAlreadySettled.into());
        }

        // Update market status
        market.status = MarketStatus::Cancelled;
        
        // Save updated market data
        market.serialize(&mut *market_account_info.data.borrow_mut())?;

        // Note: In a real implementation, we would process all bets here
        // and refund stakes, but we'll skip that for this example
        // as it would require iterating through all bet accounts.

        msg!("Market cancelled: {}", reason);
        Ok(())
    }

    /// Process UpdateOdds instruction
    fn process_update_odds(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        new_odds: Vec<u32>,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        
        // Get accounts
        let authority_info = next_account_info(account_info_iter)?;
        let market_account_info = next_account_info(account_info_iter)?;

        // Load market data
        let mut market = Market::try_from_slice(&market_account_info.data.borrow())?;
        
        // Verify authority is signer and is market authority
        if !authority_info.is_signer || *authority_info.key != market.authority {
            return Err(BettingError::Unauthorized.into());
        }

        // Validate market is active
        if market.status != MarketStatus::Active {
            return Err(BettingError::MarketNotActive.into());
        }

        // Validate new odds
        if new_odds.len() != market.outcomes.len() {
            return Err(BettingError::InvalidOdds.into());
        }

        for &odd in new_odds.iter() {
            if odd < 10000 {  // Minimum odds of 1.0
                return Err(BettingError::InvalidOdds.into());
            }
        }

        // Update odds
        market.odds = new_odds;
        
        // Save updated market data
        market.serialize(&mut *market_account_info.data.borrow_mut())?;

        msg!("Market odds updated");
        Ok(())
    }

    /// Process UpdatePlatformSettings instruction
    fn process_update_platform_settings(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        new_default_fee_percentage: Option<u16>,
        new_treasury: Option<Pubkey>,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        
        // Get accounts
        let authority_info = next_account_info(account_info_iter)?;
        let platform_account_info = next_account_info(account_info_iter)?;

        // Load platform data
        let mut platform = Platform::try_from_slice(&platform_account_info.data.borrow())?;
        
        // Verify authority is signer and is platform authority
        if !authority_info.is_signer || *authority_info.key != platform.authority {
            return Err(BettingError::Unauthorized.into());
        }

        // Update fee percentage if provided
        if let Some(fee_percentage) = new_default_fee_percentage {
            // Validate fee percentage
            if fee_percentage > 1000 {  // Max 10%
                return Err(BettingError::InvalidFeePercentage.into());
            }
            
            platform.default_fee_percentage = fee_percentage;
        }

        // Update treasury if provided
        if let Some(treasury) = new_treasury {
            platform.treasury = treasury;
        }
        
        // Save updated platform data
        platform.serialize(&mut *platform_account_info.data.borrow_mut())?;

        msg!("Platform settings updated");
        Ok(())
    }
}


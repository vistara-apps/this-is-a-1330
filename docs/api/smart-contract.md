# Smart Contract Integration

This document provides detailed information about the SOLBet Chain smart contract and how to interact with it directly.

## Contract Overview

The SOLBet Chain smart contract is a Solana program that handles all betting functionality, including market creation, bet placement, and settlement. The program is deployed on both the Solana mainnet and devnet.

### Program ID

- **Mainnet:** `SoLBeTChainiiiiiiiiiiiiiiiiiiiiiiiiiiiiii` (placeholder, will be updated with actual program ID)
- **Devnet:** `SoLBeTChainiiiiiiiiiiiiiiiiiiiiiiiiiiiiii` (placeholder, will be updated with actual program ID)

## Account Structure

The SOLBet Chain program uses several account types to store data:

### Platform Account

Stores global platform settings and statistics.

- PDA Seed: `["platform"]`
- Data Structure:
  - `is_initialized`: bool
  - `authority`: Pubkey
  - `default_fee_percentage`: u16 (basis points)
  - `treasury`: Pubkey
  - `total_volume`: u64 (lamports)
  - `total_fees_collected`: u64 (lamports)
  - `total_markets`: u32
  - `total_bets`: u32
  - `total_users`: u32

### Market Account

Stores information about a betting market.

- PDA Seed: `["market", market_id]`
- Data Structure:
  - `is_initialized`: bool
  - `market_id`: [u8; 32]
  - `authority`: Pubkey
  - `name`: String
  - `description`: String
  - `category`: String
  - `outcomes`: Vec<String>
  - `odds`: Vec<u32> (basis points)
  - `start_time`: i64 (Unix timestamp)
  - `end_time`: i64 (Unix timestamp)
  - `settlement_time`: i64 (Unix timestamp)
  - `status`: MarketStatus (enum)
  - `total_staked`: u64 (lamports)
  - `staked_per_outcome`: Vec<u64> (lamports)
  - `winning_outcome`: Option<u8>
  - `fee_percentage`: u16 (basis points)
  - `oracle`: Option<Pubkey>

### Bet Account

Stores information about a user's bet.

- PDA Seed: `["bet", bet_id]`
- Data Structure:
  - `is_initialized`: bool
  - `bet_id`: [u8; 32]
  - `user`: Pubkey
  - `market_id`: [u8; 32]
  - `selected_outcome`: u8
  - `staked_amount`: u64 (lamports)
  - `odds_at_placement`: u32 (basis points)
  - `potential_payout`: u64 (lamports)
  - `timestamp`: i64 (Unix timestamp)
  - `is_settled`: bool
  - `is_winner`: Option<bool>
  - `actual_payout`: Option<u64> (lamports)

### User Profile Account

Stores information about a user's betting history.

- PDA Seed: `["user", user_pubkey]`
- Data Structure:
  - `is_initialized`: bool
  - `user`: Pubkey
  - `total_staked`: u64 (lamports)
  - `total_won`: u64 (lamports)
  - `total_bets`: u32
  - `winning_bets`: u32
  - `first_bet_timestamp`: Option<i64> (Unix timestamp)
  - `last_bet_timestamp`: Option<i64> (Unix timestamp)

## Instructions

The SOLBet Chain program supports the following instructions:

### Initialize Platform

Initializes the platform with default settings.

```rust
pub fn initialize_platform(
    program_id: &Pubkey,
    authority: &Pubkey,
    platform_account: &Pubkey,
    treasury_account: &Pubkey,
    default_fee_percentage: u16,
) -> Instruction
```

### Create Market

Creates a new betting market.

```rust
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
) -> Instruction
```

### Place Bet

Places a bet on a market outcome.

```rust
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
) -> Instruction
```

### Settle Market

Settles a market with the winning outcome.

```rust
pub fn settle_market(
    program_id: &Pubkey,
    authority: &Pubkey,
    market_account: &Pubkey,
    platform_account: &Pubkey,
    treasury_account: &Pubkey,
    bet_accounts: &[Pubkey],
    winning_outcome: u8,
) -> Instruction
```

### Claim Winnings

Claims winnings from a settled bet.

```rust
pub fn claim_winnings(
    program_id: &Pubkey,
    user: &Pubkey,
    bet_account: &Pubkey,
    user_profile_account: &Pubkey,
    market_account: &Pubkey,
    escrow_account: &Pubkey,
) -> Instruction
```

### Cancel Market

Cancels a market and returns stakes.

```rust
pub fn cancel_market(
    program_id: &Pubkey,
    authority: &Pubkey,
    market_account: &Pubkey,
    bet_accounts: &[Pubkey],
    reason: String,
) -> Instruction
```

### Update Odds

Updates the odds for a market.

```rust
pub fn update_odds(
    program_id: &Pubkey,
    authority: &Pubkey,
    market_account: &Pubkey,
    new_odds: Vec<u32>,
) -> Instruction
```

### Update Platform Settings

Updates platform settings.

```rust
pub fn update_platform_settings(
    program_id: &Pubkey,
    authority: &Pubkey,
    platform_account: &Pubkey,
    treasury_account: Option<&Pubkey>,
    new_default_fee_percentage: Option<u16>,
    new_treasury: Option<Pubkey>,
) -> Instruction
```

## Integration Examples

### JavaScript (using @solana/web3.js)

```javascript
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

// Program ID
const PROGRAM_ID = new PublicKey('SoLBeTChainiiiiiiiiiiiiiiiiiiiiiiiiiiiiii');

// Place a bet
async function placeBet(
  connection,
  wallet,
  marketId,
  selectedOutcome,
  stakeAmount
) {
  // Convert market ID to buffer
  const marketIdBuffer = Buffer.from(marketId);
  
  // Find PDA for bet account
  const betId = Buffer.from(`bet_${Date.now()}_${wallet.publicKey.toString().substring(0, 8)}`);
  const [betAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('bet'), betId],
    PROGRAM_ID
  );
  
  // Find PDA for user profile account
  const [userProfileAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('user'), wallet.publicKey.toBuffer()],
    PROGRAM_ID
  );
  
  // Find PDA for market account
  const [marketAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('market'), marketIdBuffer],
    PROGRAM_ID
  );
  
  // Find PDA for escrow account
  const [escrowAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('escrow'), marketIdBuffer],
    PROGRAM_ID
  );
  
  // Find PDA for platform account
  const [platformAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('platform')],
    PROGRAM_ID
  );
  
  // Convert stake amount to lamports
  const stakeLamports = stakeAmount * LAMPORTS_PER_SOL;
  
  // Create instruction data
  const instructionData = Buffer.from([
    0, // Instruction index for PlaceBet
    selectedOutcome, // Selected outcome
    ...new Uint8Array(new BigUint64Array([BigInt(stakeLamports)]).buffer) // Stake amount
  ]);
  
  // Create the transaction instruction
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: betAccount, isSigner: false, isWritable: true },
      { pubkey: userProfileAccount, isSigner: false, isWritable: true },
      { pubkey: marketAccount, isSigner: false, isWritable: true },
      { pubkey: escrowAccount, isSigner: false, isWritable: true },
      { pubkey: platformAccount, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  });
  
  // Create a new transaction and add the instruction
  const transaction = new Transaction().add(instruction);
  
  // Set recent blockhash and fee payer
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  transaction.feePayer = wallet.publicKey;
  
  // Sign the transaction
  const signedTransaction = await wallet.signTransaction(transaction);
  
  // Send the transaction
  const signature = await connection.sendRawTransaction(signedTransaction.serialize());
  
  // Confirm the transaction
  await connection.confirmTransaction(signature);
  
  return signature;
}
```

### Rust (using solana-sdk)

```rust
use solana_sdk::{
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
    signature::Signer,
    system_program,
    transaction::Transaction,
};
use solana_client::rpc_client::RpcClient;

// Program ID
const PROGRAM_ID: &str = "SoLBeTChainiiiiiiiiiiiiiiiiiiiiiiiiiiiiii";

// Place a bet
pub fn place_bet(
    rpc_client: &RpcClient,
    payer: &dyn Signer,
    market_id: &[u8; 32],
    selected_outcome: u8,
    stake_amount: u64,
) -> Result<String, Box<dyn std::error::Error>> {
    // Convert program ID to Pubkey
    let program_id = Pubkey::from_str(PROGRAM_ID)?;
    
    // Generate bet ID
    let bet_id = format!("bet_{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH)?.as_secs());
    let bet_id_bytes = bet_id.as_bytes();
    
    // Find PDA for bet account
    let (bet_account, _) = Pubkey::find_program_address(
        &[b"bet", bet_id_bytes],
        &program_id,
    );
    
    // Find PDA for user profile account
    let (user_profile_account, _) = Pubkey::find_program_address(
        &[b"user", payer.pubkey().as_ref()],
        &program_id,
    );
    
    // Find PDA for market account
    let (market_account, _) = Pubkey::find_program_address(
        &[b"market", market_id],
        &program_id,
    );
    
    // Find PDA for escrow account
    let (escrow_account, _) = Pubkey::find_program_address(
        &[b"escrow", market_id],
        &program_id,
    );
    
    // Find PDA for platform account
    let (platform_account, _) = Pubkey::find_program_address(
        &[b"platform"],
        &program_id,
    );
    
    // Create instruction data
    let mut instruction_data = vec![0]; // Instruction index for PlaceBet
    instruction_data.push(selected_outcome);
    instruction_data.extend_from_slice(&stake_amount.to_le_bytes());
    
    // Create the transaction instruction
    let instruction = Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(payer.pubkey(), true),
            AccountMeta::new(bet_account, false),
            AccountMeta::new(user_profile_account, false),
            AccountMeta::new(market_account, false),
            AccountMeta::new(escrow_account, false),
            AccountMeta::new_readonly(platform_account, false),
            AccountMeta::new_readonly(system_program::id(), false),
        ],
        data: instruction_data,
    };
    
    // Create a new transaction and add the instruction
    let mut transaction = Transaction::new_with_payer(&[instruction], Some(&payer.pubkey()));
    
    // Set recent blockhash
    let recent_blockhash = rpc_client.get_latest_blockhash()?;
    transaction.sign(&[payer], recent_blockhash);
    
    // Send the transaction
    let signature = rpc_client.send_and_confirm_transaction(&transaction)?;
    
    Ok(signature.to_string())
}
```

## Error Handling

The SOLBet Chain program defines the following error codes:

| Error Code | Description |
|------------|-------------|
| 0 | InvalidInstructionData |
| 1 | MarketAlreadyExists |
| 2 | MarketNotFound |
| 3 | MarketAlreadySettled |
| 4 | MarketNotActive |
| 5 | MarketNotReadyForSettlement |
| 6 | InvalidMarketOutcome |
| 7 | InvalidBetAmount |
| 8 | InsufficientFunds |
| 9 | Unauthorized |
| 10 | InvalidTimestamp |
| 11 | BetAlreadyExists |
| 12 | BetNotFound |
| 13 | InvalidOdds |
| 14 | InvalidFeePercentage |
| 15 | CalculationOverflow |

When an error occurs, the program will return a `ProgramError::Custom(code)` with the appropriate error code.

## Security Considerations

When integrating with the SOLBet Chain smart contract, consider the following security best practices:

1. **Always verify accounts** before sending transactions.
2. **Check market status** before placing bets.
3. **Validate user input** to prevent unexpected behavior.
4. **Handle transaction errors** gracefully.
5. **Implement proper error handling** to provide clear feedback to users.
6. **Use secure RPC endpoints** for blockchain interactions.
7. **Follow security best practices** for Solana development.

## Additional Resources

- [Solana Program Library](https://github.com/solana-labs/solana-program-library)
- [Solana Cookbook](https://solanacookbook.com/)
- [Solana Documentation](https://docs.solana.com/)


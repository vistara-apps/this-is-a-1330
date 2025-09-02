# Wallet Integration Guide

This guide provides detailed information on integrating Solana wallets with the SOLBet Chain platform.

## Supported Wallets

SOLBet Chain supports all major Solana wallets, including:

- [Phantom](https://phantom.app/)
- [Solflare](https://solflare.com/)
- [Backpack](https://www.backpack.app/)
- [Brave Wallet](https://brave.com/wallet/)
- [Coinbase Wallet](https://www.coinbase.com/wallet)

## Integration Methods

There are two main methods for integrating wallets with SOLBet Chain:

1. **Using the SOLBet Chain JavaScript SDK** (recommended)
2. **Direct integration with Solana wallet adapters**

## Using the SOLBet Chain JavaScript SDK

The SOLBet Chain SDK provides a simple way to integrate wallets with your application.

### Installation

```bash
# Using npm
npm install solbet-chain-js @solana/web3.js

# Using yarn
yarn add solbet-chain-js @solana/web3.js
```

### Basic Usage

```javascript
import { SolBetChain } from 'solbet-chain-js';
import { Connection } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

// In your React component
function BettingComponent() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const solbetChain = new SolBetChain(connection);

  const placeBet = async (marketId, outcomeIndex, amount) => {
    if (!wallet.connected) {
      alert('Please connect your wallet');
      return;
    }

    try {
      const signature = await solbetChain.placeBet({
        marketId,
        outcomeIndex,
        amount,
        wallet
      });
      
      console.log('Bet placed successfully:', signature);
    } catch (error) {
      console.error('Error placing bet:', error);
    }
  };

  return (
    <div>
      {/* Your betting UI */}
      <button onClick={() => placeBet('market123', 0, 1.5)}>
        Place Bet
      </button>
    </div>
  );
}
```

## Direct Integration with Solana Wallet Adapters

For more control over the wallet integration, you can use the Solana wallet adapters directly.

### Installation

```bash
# Using npm
npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-base @solana/wallet-adapter-wallets @solana/web3.js

# Using yarn
yarn add @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-base @solana/wallet-adapter-wallets @solana/web3.js
```

### Setting Up Wallet Provider

```jsx
import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
  BraveWalletAdapter,
  CoinbaseWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import default styles for wallet modal
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  // Use devnet for testing
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
  
  // Initialize wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
      new BraveWalletAdapter(),
      new CoinbaseWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="app">
            <header>
              <WalletMultiButton />
            </header>
            <main>
              {/* Your app content */}
            </main>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
```

### Creating and Sending Transactions

```jsx
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

function BettingComponent() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const placeBet = async (marketId, outcomeIndex, amount) => {
    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    try {
      // Create a transaction
      const transaction = new Transaction();
      
      // Add instructions to the transaction
      // (This is a simplified example, you would need to create the actual betting instruction)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('EscrowAccountPublicKey'),
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );
      
      // Send the transaction
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature);
      
      console.log('Transaction confirmed:', signature);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {/* Your betting UI */}
      <button onClick={() => placeBet('market123', 0, 1.5)}>
        Place Bet
      </button>
    </div>
  );
}
```

## Handling Wallet Events

You can listen for wallet events to update your UI accordingly:

```jsx
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';

function WalletStatus() {
  const { publicKey, connected, connecting, disconnecting } = useWallet();

  useEffect(() => {
    if (connected) {
      console.log('Wallet connected:', publicKey.toString());
      // Fetch user data, bets, etc.
    }
  }, [connected, publicKey]);

  return (
    <div>
      {connecting && <p>Connecting wallet...</p>}
      {disconnecting && <p>Disconnecting wallet...</p>}
      {connected ? (
        <p>Connected: {publicKey.toString()}</p>
      ) : (
        <p>Wallet not connected</p>
      )}
    </div>
  );
}
```

## Checking Wallet Balance

Before placing a bet, you should check if the user has sufficient balance:

```jsx
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useState, useEffect } from 'react';

function WalletBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!publicKey) {
      setBalance(0);
      return;
    }

    const fetchBalance = async () => {
      try {
        const lamports = await connection.getBalance(publicKey);
        setBalance(lamports / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();

    // Set up subscription to account changes
    const subscriptionId = connection.onAccountChange(
      publicKey,
      (updatedAccountInfo) => {
        setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL);
      }
    );

    // Clean up subscription
    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [publicKey, connection]);

  return (
    <div>
      <p>Balance: {balance.toFixed(4)} SOL</p>
    </div>
  );
}
```

## Best Practices

1. **Always check wallet connection** before attempting to send transactions.
2. **Handle transaction errors** gracefully and provide clear feedback to users.
3. **Implement proper loading states** during transaction processing.
4. **Verify transaction success** by confirming the transaction on the blockchain.
5. **Provide clear instructions** to users on how to use their wallet.
6. **Test on multiple wallets** to ensure compatibility.
7. **Implement proper error handling** for wallet connection and transaction errors.

## Common Issues and Solutions

### Wallet Not Connecting

- Ensure the wallet extension is installed and unlocked.
- Check if the wallet supports the network you're using (mainnet, devnet, etc.).
- Verify that you're using the correct wallet adapter.

### Transaction Failing

- Check if the user has sufficient SOL for the transaction and fees.
- Verify that the transaction is properly constructed.
- Ensure the user has approved the transaction in their wallet.
- Check for any blockchain congestion or network issues.

### Wallet Disconnecting Unexpectedly

- Implement reconnection logic to handle wallet disconnections.
- Store the user's wallet preference in local storage to facilitate reconnection.
- Provide clear UI feedback when the wallet disconnects.

## Security Considerations

1. **Never request private keys** from users.
2. **Use HTTPS** for all API requests.
3. **Implement proper input validation** to prevent injection attacks.
4. **Use secure RPC endpoints** for blockchain interactions.
5. **Clearly communicate transaction details** to users before they sign.
6. **Implement proper error handling** to prevent sensitive information leakage.
7. **Follow security best practices** for web applications.

## Additional Resources

- [Solana Wallet Adapter Documentation](https://github.com/solana-labs/wallet-adapter)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [Phantom Wallet Documentation](https://docs.phantom.app/)
- [Solflare Wallet Documentation](https://docs.solflare.com/)


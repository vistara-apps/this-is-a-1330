# SOLBet Chain Integration Examples

This document provides practical examples of integrating with the SOLBet Chain platform using various programming languages and frameworks.

## JavaScript/React Examples

### Basic React Integration

This example shows how to integrate SOLBet Chain with a React application using the SOLBet Chain JavaScript SDK.

```jsx
import React, { useState, useEffect } from 'react';
import { SolBetChain } from 'solbet-chain-js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

function BettingApp() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [markets, setMarkets] = useState([]);
  const [userBets, setUserBets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize SOLBet Chain client
  const solbetChain = new SolBetChain(connection);
  
  // Load markets on component mount
  useEffect(() => {
    const loadMarkets = async () => {
      try {
        const marketList = await solbetChain.getMarkets();
        setMarkets(marketList);
      } catch (error) {
        console.error('Error loading markets:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMarkets();
  }, []);
  
  // Load user bets when wallet connects
  useEffect(() => {
    if (!wallet.connected) {
      setUserBets([]);
      return;
    }
    
    const loadUserBets = async () => {
      try {
        const bets = await solbetChain.getUserBets(wallet.publicKey.toString());
        setUserBets(bets);
      } catch (error) {
        console.error('Error loading user bets:', error);
      }
    };
    
    loadUserBets();
  }, [wallet.connected, wallet.publicKey]);
  
  // Place a bet
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
      
      alert(`Bet placed successfully! Transaction: ${signature}`);
      
      // Reload user bets
      const bets = await solbetChain.getUserBets(wallet.publicKey.toString());
      setUserBets(bets);
    } catch (error) {
      console.error('Error placing bet:', error);
      alert(`Error placing bet: ${error.message}`);
    }
  };
  
  // Claim winnings
  const claimWinnings = async (betId) => {
    if (!wallet.connected) {
      alert('Please connect your wallet');
      return;
    }
    
    try {
      const signature = await solbetChain.claimWinnings({
        betId,
        wallet
      });
      
      alert(`Winnings claimed successfully! Transaction: ${signature}`);
      
      // Reload user bets
      const bets = await solbetChain.getUserBets(wallet.publicKey.toString());
      setUserBets(bets);
    } catch (error) {
      console.error('Error claiming winnings:', error);
      alert(`Error claiming winnings: ${error.message}`);
    }
  };
  
  return (
    <div className="app">
      <header>
        <h1>SOLBet Chain</h1>
        <WalletMultiButton />
      </header>
      
      <main>
        {loading ? (
          <p>Loading markets...</p>
        ) : (
          <div className="markets">
            <h2>Available Markets</h2>
            {markets.map(market => (
              <div key={market.marketId} className="market-card">
                <h3>{market.name}</h3>
                <p>{market.description}</p>
                <div className="outcomes">
                  {market.outcomes.map((outcome, index) => (
                    <div key={index} className="outcome">
                      <span>{outcome}</span>
                      <span>{market.odds[index]}x</span>
                      <button onClick={() => placeBet(market.marketId, index, 1)}>
                        Bet 1 SOL
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {wallet.connected && (
          <div className="user-bets">
            <h2>Your Bets</h2>
            {userBets.length === 0 ? (
              <p>No bets yet</p>
            ) : (
              userBets.map(bet => (
                <div key={bet.betId} className="bet-card">
                  <h3>{bet.marketName}</h3>
                  <p>Outcome: {bet.outcomeText}</p>
                  <p>Amount: {bet.amount} SOL</p>
                  <p>Potential Payout: {bet.potentialPayout} SOL</p>
                  <p>Status: {bet.status}</p>
                  {bet.status === 'pending_claim' && (
                    <button onClick={() => claimWinnings(bet.betId)}>
                      Claim Winnings
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default BettingApp;
```

### Next.js Integration

This example shows how to integrate SOLBet Chain with a Next.js application.

```jsx
// pages/_app.js
import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';

// Import styles
import '@solana/wallet-adapter-react-ui/styles.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  // Set up wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );
  
  // Use devnet for testing
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
  
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MyApp;
```

```jsx
// pages/index.js
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { SolBetChain } from 'solbet-chain-js';
import { useEffect, useState } from 'react';

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [markets, setMarkets] = useState([]);
  
  useEffect(() => {
    const loadMarkets = async () => {
      try {
        const solbetChain = new SolBetChain(connection);
        const marketList = await solbetChain.getMarkets();
        setMarkets(marketList);
      } catch (error) {
        console.error('Error loading markets:', error);
      }
    };
    
    loadMarkets();
  }, [connection]);
  
  return (
    <div className="container">
      <header>
        <h1>SOLBet Chain</h1>
        <WalletMultiButton />
      </header>
      
      <main>
        <h2>Available Markets</h2>
        <div className="markets-grid">
          {markets.map(market => (
            <div key={market.marketId} className="market-card">
              <h3>{market.name}</h3>
              <p>{market.description}</p>
              <a href={`/market/${market.marketId}`}>View Market</a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
```

```jsx
// pages/market/[id].js
import { useRouter } from 'next/router';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { SolBetChain } from 'solbet-chain-js';
import { useEffect, useState } from 'react';

export default function MarketDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { connection } = useConnection();
  const wallet = useWallet();
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [betAmount, setBetAmount] = useState(1);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  
  useEffect(() => {
    if (!id) return;
    
    const loadMarket = async () => {
      try {
        const solbetChain = new SolBetChain(connection);
        const marketData = await solbetChain.getMarketById(id);
        setMarket(marketData);
      } catch (error) {
        console.error('Error loading market:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMarket();
  }, [id, connection]);
  
  const placeBet = async () => {
    if (!wallet.connected) {
      alert('Please connect your wallet');
      return;
    }
    
    if (selectedOutcome === null) {
      alert('Please select an outcome');
      return;
    }
    
    try {
      const solbetChain = new SolBetChain(connection);
      const signature = await solbetChain.placeBet({
        marketId: id,
        outcomeIndex: selectedOutcome,
        amount: betAmount,
        wallet
      });
      
      alert(`Bet placed successfully! Transaction: ${signature}`);
    } catch (error) {
      console.error('Error placing bet:', error);
      alert(`Error placing bet: ${error.message}`);
    }
  };
  
  if (loading) {
    return <div>Loading market...</div>;
  }
  
  if (!market) {
    return <div>Market not found</div>;
  }
  
  return (
    <div className="container">
      <header>
        <h1>{market.name}</h1>
        <WalletMultiButton />
      </header>
      
      <main>
        <div className="market-details">
          <p>{market.description}</p>
          <p>Event Date: {new Date(market.eventDate).toLocaleString()}</p>
          <p>Total Staked: {market.totalStaked} SOL</p>
        </div>
        
        <div className="betting-form">
          <h2>Place a Bet</h2>
          
          <div className="outcomes">
            {market.outcomes.map((outcome, index) => (
              <div 
                key={index} 
                className={`outcome ${selectedOutcome === index ? 'selected' : ''}`}
                onClick={() => setSelectedOutcome(index)}
              >
                <span>{outcome}</span>
                <span>{market.odds[index]}x</span>
              </div>
            ))}
          </div>
          
          <div className="amount-input">
            <label>Bet Amount (SOL)</label>
            <input 
              type="number" 
              min="0.1" 
              step="0.1" 
              value={betAmount} 
              onChange={e => setBetAmount(parseFloat(e.target.value))} 
            />
          </div>
          
          {selectedOutcome !== null && (
            <div className="potential-payout">
              <p>Potential Payout: {(betAmount * market.odds[selectedOutcome]).toFixed(2)} SOL</p>
            </div>
          )}
          
          <button onClick={placeBet} disabled={!wallet.connected || selectedOutcome === null}>
            Place Bet
          </button>
        </div>
      </main>
    </div>
  );
}
```

## Vue.js Integration

This example shows how to integrate SOLBet Chain with a Vue.js application.

```vue
<!-- App.vue -->
<template>
  <div class="app">
    <header>
      <h1>SOLBet Chain</h1>
      <wallet-multi-button />
    </header>
    
    <main>
      <div v-if="loading" class="loading">
        Loading markets...
      </div>
      
      <div v-else class="markets">
        <h2>Available Markets</h2>
        <div class="markets-grid">
          <div v-for="market in markets" :key="market.marketId" class="market-card">
            <h3>{{ market.name }}</h3>
            <p>{{ market.description }}</p>
            <router-link :to="`/market/${market.marketId}`">View Market</router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useWallet, useConnection } from 'solana-wallets-vue';
import { WalletMultiButton } from 'solana-wallets-vue';
import { SolBetChain } from 'solbet-chain-js';

export default {
  components: {
    WalletMultiButton
  },
  setup() {
    const { connection } = useConnection();
    const { wallet } = useWallet();
    
    const markets = ref([]);
    const loading = ref(true);
    
    onMounted(async () => {
      try {
        const solbetChain = new SolBetChain(connection.value);
        const marketList = await solbetChain.getMarkets();
        markets.value = marketList;
      } catch (error) {
        console.error('Error loading markets:', error);
      } finally {
        loading.value = false;
      }
    });
    
    return {
      markets,
      loading
    };
  }
};
</script>
```

## Node.js Backend Integration

This example shows how to integrate SOLBet Chain with a Node.js backend.

```javascript
const express = require('express');
const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const { SolBetChain } = require('solbet-chain-js');

const app = express();
app.use(express.json());

// Initialize Solana connection
const connection = new Connection(clusterApiUrl('devnet'));
const solbetChain = new SolBetChain(connection);

// Get all markets
app.get('/api/markets', async (req, res) => {
  try {
    const markets = await solbetChain.getMarkets();
    res.json({ success: true, data: { markets } });
  } catch (error) {
    console.error('Error fetching markets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get market by ID
app.get('/api/markets/:id', async (req, res) => {
  try {
    const market = await solbetChain.getMarketById(req.params.id);
    
    if (!market) {
      return res.status(404).json({ success: false, error: 'Market not found' });
    }
    
    res.json({ success: true, data: market });
  } catch (error) {
    console.error('Error fetching market:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user bets
app.get('/api/users/:publicKey/bets', async (req, res) => {
  try {
    const publicKey = new PublicKey(req.params.publicKey);
    const bets = await solbetChain.getUserBets(publicKey.toString());
    
    res.json({ success: true, data: { bets } });
  } catch (error) {
    console.error('Error fetching user bets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get platform stats
app.get('/api/platform/stats', async (req, res) => {
  try {
    const stats = await solbetChain.getPlatformStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Python Integration

This example shows how to integrate SOLBet Chain with Python using the Solana Python SDK.

```python
import json
import base58
from solana.rpc.api import Client
from solana.publickey import PublicKey
from solana.transaction import Transaction
from solana.system_program import SYS_PROGRAM_ID
from solana.rpc.types import TxOpts

# SOLBet Chain program ID
PROGRAM_ID = PublicKey("SoLBeTChainiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")

# Connect to Solana devnet
client = Client("https://api.devnet.solana.com")

def get_markets():
    """
    Get all markets from SOLBet Chain
    """
    try:
        # Find all market accounts for the program
        response = client.get_program_accounts(
            PROGRAM_ID,
            encoding="base64",
            filters=[
                {
                    "memcmp": {
                        "offset": 0,
                        "bytes": base58.b58encode(bytes([1])).decode("ascii")
                    }
                },
                {
                    "dataSize": 1000  # Approximate size of market account data
                }
            ]
        )
        
        markets = []
        for account in response["result"]:
            # In a real implementation, you would deserialize the account data
            # For this example, we'll just return the account pubkey
            markets.append({
                "marketId": account["pubkey"],
                "name": "Mock Market",
                "description": "This is a mock market",
                "category": "crypto",
                "outcomes": ["Outcome A", "Outcome B"],
                "odds": [1.5, 2.5],
                "status": "active",
                "totalStaked": 50,
                "eventDate": "2024-12-31T23:59:59Z"
            })
        
        return markets
    except Exception as e:
        print(f"Error fetching markets: {e}")
        raise

def get_market_by_id(market_id):
    """
    Get market by ID
    """
    try:
        # Convert market ID to PublicKey
        market_pubkey = PublicKey(market_id)
        
        # Get account info
        response = client.get_account_info(market_pubkey)
        
        if not response["result"]["value"]:
            return None
        
        # In a real implementation, you would deserialize the account data
        # For this example, we'll just return mock data
        return {
            "marketId": market_id,
            "name": "Mock Market",
            "description": "This is a mock market",
            "category": "crypto",
            "outcomes": ["Outcome A", "Outcome B"],
            "odds": [1.5, 2.5],
            "status": "active",
            "totalStaked": 50,
            "eventDate": "2024-12-31T23:59:59Z"
        }
    except Exception as e:
        print(f"Error fetching market: {e}")
        raise

def get_user_bets(public_key):
    """
    Get user bets
    """
    try:
        # Convert public key to PublicKey
        user_pubkey = PublicKey(public_key)
        
        # Find all bet accounts for the user
        response = client.get_program_accounts(
            PROGRAM_ID,
            encoding="base64",
            filters=[
                {
                    "memcmp": {
                        "offset": 33,  # Offset for user field
                        "bytes": user_pubkey.to_base58().decode("ascii")
                    }
                },
                {
                    "dataSize": 500  # Approximate size of bet account data
                }
            ]
        )
        
        bets = []
        for account in response["result"]:
            # In a real implementation, you would deserialize the account data
            # For this example, we'll just return mock data
            bets.append({
                "betId": account["pubkey"],
                "marketId": "mock_market_id",
                "outcomeIndex": 0,
                "outcomeText": "Outcome A",
                "amount": 5,
                "potentialPayout": 7.5,
                "status": "active",
                "timestamp": "2024-09-15T14:30:00Z"
            })
        
        return bets
    except Exception as e:
        print(f"Error fetching user bets: {e}")
        raise

# Example usage
if __name__ == "__main__":
    # Get all markets
    markets = get_markets()
    print(f"Found {len(markets)} markets")
    
    # Get market by ID
    if markets:
        market_id = markets[0]["marketId"]
        market = get_market_by_id(market_id)
        print(f"Market details: {json.dumps(market, indent=2)}")
    
    # Get user bets
    user_pubkey = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
    bets = get_user_bets(user_pubkey)
    print(f"Found {len(bets)} bets for user {user_pubkey}")
```

## Mobile Integration (React Native)

This example shows how to integrate SOLBet Chain with a React Native application.

```jsx
// App.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SolBetChain } from 'solbet-chain-js';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { useWallet } from './hooks/useWallet';

export default function App() {
  const { connected, publicKey, connectWallet } = useWallet();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize Solana connection
  const connection = new Connection(clusterApiUrl('devnet'));
  const solbetChain = new SolBetChain(connection);
  
  // Load markets on component mount
  useEffect(() => {
    const loadMarkets = async () => {
      try {
        const marketList = await solbetChain.getMarkets();
        setMarkets(marketList);
      } catch (error) {
        console.error('Error loading markets:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMarkets();
  }, []);
  
  // Render market item
  const renderMarketItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.marketCard}
      onPress={() => navigation.navigate('MarketDetail', { marketId: item.marketId })}
    >
      <Text style={styles.marketTitle}>{item.name}</Text>
      <Text style={styles.marketDescription}>{item.description}</Text>
      <Text style={styles.marketDate}>
        Event Date: {new Date(item.eventDate).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SOLBet Chain</Text>
        <TouchableOpacity 
          style={styles.connectButton}
          onPress={connectWallet}
        >
          <Text style={styles.connectButtonText}>
            {connected ? `Connected: ${publicKey.toString().slice(0, 4)}...` : 'Connect Wallet'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading markets...</Text>
        </View>
      ) : (
        <FlatList
          data={markets}
          renderItem={renderMarketItem}
          keyExtractor={item => item.marketId}
          contentContainerStyle={styles.marketsList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#4a46eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  connectButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  connectButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marketsList: {
    padding: 16,
  },
  marketCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  marketTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  marketDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  marketDate: {
    fontSize: 12,
    color: '#999',
  },
});
```

## Additional Resources

For more examples and integration guides, visit the [SOLBet Chain GitHub repository](https://github.com/solbetchain/solbet-chain-js) or check out the [official documentation](https://docs.solbetchain.io).


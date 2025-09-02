# SOLBet Chain API Documentation

Welcome to the SOLBet Chain API documentation. This guide provides comprehensive information about the SOLBet Chain platform's API endpoints, smart contract interactions, and integration guides.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Smart Contract Integration](#smart-contract-integration)
6. [Wallet Integration](#wallet-integration)
7. [Error Handling](#error-handling)
8. [Rate Limits](#rate-limits)
9. [Webhooks](#webhooks)
10. [Examples](#examples)

## Introduction

SOLBet Chain is a decentralized betting platform built on the Solana blockchain. It allows users to place bets using SOL tokens directly, with all bet settlements and payouts handled transparently on-chain through smart contracts.

The platform provides both a JavaScript client library for frontend applications and direct smart contract interactions for advanced integrations.

## Getting Started

To get started with the SOLBet Chain API, you'll need:

1. A Solana wallet (e.g., Phantom, Solflare)
2. SOL tokens for betting and transaction fees
3. Basic understanding of blockchain transactions

### Installation

```bash
# Using npm
npm install solbet-chain-js

# Using yarn
yarn add solbet-chain-js
```

### Basic Usage

```javascript
import { SolBetChain } from 'solbet-chain-js';
import { Connection, PublicKey } from '@solana/web3.js';

// Initialize the client
const connection = new Connection('https://api.devnet.solana.com');
const solbetChain = new SolBetChain(connection);

// Get all active markets
const markets = await solbetChain.getMarkets();

// Place a bet
const betSignature = await solbetChain.placeBet({
  marketId: 'market123',
  outcomeIndex: 0,
  amount: 1.5, // SOL
  wallet: yourWalletAdapter
});
```

## Authentication

SOLBet Chain uses Solana wallet signatures for authentication. All transactions require a connected wallet that can sign transactions.

No API keys are required for basic interactions, as authentication is handled through the Solana blockchain's native signature verification.

## API Endpoints

For detailed information about available API endpoints, see [API Endpoints](./endpoints.md).

## Smart Contract Integration

For information about direct smart contract interactions, see [Smart Contract Integration](./smart-contract.md).

## Wallet Integration

For details on integrating with Solana wallets, see [Wallet Integration](./wallet-integration.md).

## Error Handling

The API uses standard HTTP status codes and returns detailed error messages in JSON format. For more information, see [Error Handling](./error-handling.md).

## Rate Limits

The SOLBet Chain API has rate limits to prevent abuse. For more information, see [Rate Limits](./rate-limits.md).

## Webhooks

SOLBet Chain provides webhooks for real-time notifications about market settlements and bet outcomes. For more information, see [Webhooks](./webhooks.md).

## Examples

For code examples and integration samples, see [Examples](./examples.md).

## Support

If you have any questions or need assistance, please contact our support team at support@solbetchain.io or join our Discord community at https://discord.gg/solbetchain.


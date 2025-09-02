# SOLBet Chain API Endpoints

This document provides detailed information about the available API endpoints in the SOLBet Chain platform.

## Base URL

The base URL for all API endpoints is:

```
https://api.solbetchain.io/v1
```

For development and testing, use the devnet endpoint:

```
https://api-devnet.solbetchain.io/v1
```

## Authentication

All API requests require authentication using a Solana wallet signature. Include the following headers with your requests:

- `X-Solana-Public-Key`: Your Solana wallet public key
- `X-Solana-Signature`: Signature of the request payload using your Solana wallet

## Markets

### Get All Markets

Retrieves a list of all available betting markets.

**Endpoint:** `GET /markets`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter markets by status (active, closed, settled, cancelled) |
| category | string | No | Filter markets by category |
| limit | integer | No | Maximum number of markets to return (default: 20, max: 100) |
| offset | integer | No | Offset for pagination (default: 0) |

**Response:**

```json
{
  "success": true,
  "data": {
    "markets": [
      {
        "marketId": "market123",
        "name": "SOL Price Prediction",
        "description": "Will SOL price be above or below $150 by year end?",
        "category": "crypto",
        "outcomes": ["Above $150", "Below $150"],
        "odds": [1.8, 2.2],
        "status": "active",
        "totalStaked": 45.67,
        "stakedPerOutcome": [25.45, 20.22],
        "eventDate": "2024-12-31T23:59:59Z",
        "createdAt": "2024-09-01T10:00:00Z",
        "settledAt": null,
        "winningOutcome": null
      }
    ],
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

### Get Market by ID

Retrieves detailed information about a specific market.

**Endpoint:** `GET /markets/{marketId}`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| marketId | string | Yes | ID of the market to retrieve |

**Response:**

```json
{
  "success": true,
  "data": {
    "marketId": "market123",
    "name": "SOL Price Prediction",
    "description": "Will SOL price be above or below $150 by year end?",
    "category": "crypto",
    "outcomes": ["Above $150", "Below $150"],
    "odds": [1.8, 2.2],
    "status": "active",
    "totalStaked": 45.67,
    "stakedPerOutcome": [25.45, 20.22],
    "eventDate": "2024-12-31T23:59:59Z",
    "createdAt": "2024-09-01T10:00:00Z",
    "settledAt": null,
    "winningOutcome": null,
    "authority": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "oracle": null,
    "feePercentage": 3
  }
}
```

### Create Market

Creates a new betting market.

**Endpoint:** `POST /markets`

**Request Body:**

```json
{
  "name": "SOL Price Prediction",
  "description": "Will SOL price be above or below $150 by year end?",
  "category": "crypto",
  "outcomes": ["Above $150", "Below $150"],
  "odds": [1.8, 2.2],
  "startTime": "2024-09-01T10:00:00Z",
  "endTime": "2024-12-31T23:59:59Z",
  "settlementTime": "2025-01-01T12:00:00Z",
  "feePercentage": 3,
  "oracle": null
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "marketId": "market123",
    "transactionSignature": "5UfgJ5sVQKQrUhsKQzqiKLdZ9LxS2ynXKAXmRTSUxJmPXuXmXKQzqiKLdZ9LxS2y"
  }
}
```

### Settle Market

Settles a market with the winning outcome.

**Endpoint:** `POST /markets/{marketId}/settle`

**Request Body:**

```json
{
  "winningOutcome": 0
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "marketId": "market123",
    "winningOutcome": 0,
    "transactionSignature": "5UfgJ5sVQKQrUhsKQzqiKLdZ9LxS2ynXKAXmRTSUxJmPXuXmXKQzqiKLdZ9LxS2y"
  }
}
```

### Cancel Market

Cancels a market and returns all stakes.

**Endpoint:** `POST /markets/{marketId}/cancel`

**Request Body:**

```json
{
  "reason": "Event cancelled"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "marketId": "market123",
    "transactionSignature": "5UfgJ5sVQKQrUhsKQzqiKLdZ9LxS2ynXKAXmRTSUxJmPXuXmXKQzqiKLdZ9LxS2y"
  }
}
```

## Bets

### Place Bet

Places a bet on a market outcome.

**Endpoint:** `POST /bets`

**Request Body:**

```json
{
  "marketId": "market123",
  "outcomeIndex": 0,
  "amount": 1.5
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "betId": "bet123",
    "marketId": "market123",
    "outcomeIndex": 0,
    "amount": 1.5,
    "potentialPayout": 2.7,
    "transactionSignature": "5UfgJ5sVQKQrUhsKQzqiKLdZ9LxS2ynXKAXmRTSUxJmPXuXmXKQzqiKLdZ9LxS2y"
  }
}
```

### Get User Bets

Retrieves a list of bets placed by the authenticated user.

**Endpoint:** `GET /bets`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter bets by status (active, won, lost, cancelled, pending_claim) |
| marketId | string | No | Filter bets by market ID |
| limit | integer | No | Maximum number of bets to return (default: 20, max: 100) |
| offset | integer | No | Offset for pagination (default: 0) |

**Response:**

```json
{
  "success": true,
  "data": {
    "bets": [
      {
        "betId": "bet123",
        "marketId": "market123",
        "marketName": "SOL Price Prediction",
        "outcomeIndex": 0,
        "outcomeText": "Above $150",
        "amount": 1.5,
        "potentialPayout": 2.7,
        "status": "active",
        "transactionHash": "5UfgJ5sVQKQrUhsKQzqiKLdZ9LxS2ynXKAXmRTSUxJmPXuXmXKQzqiKLdZ9LxS2y",
        "timestamp": "2024-09-15T14:30:00Z",
        "settledAt": null,
        "actualPayout": null
      }
    ],
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

### Get Bet by ID

Retrieves detailed information about a specific bet.

**Endpoint:** `GET /bets/{betId}`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| betId | string | Yes | ID of the bet to retrieve |

**Response:**

```json
{
  "success": true,
  "data": {
    "betId": "bet123",
    "marketId": "market123",
    "marketName": "SOL Price Prediction",
    "outcomeIndex": 0,
    "outcomeText": "Above $150",
    "amount": 1.5,
    "potentialPayout": 2.7,
    "status": "active",
    "transactionHash": "5UfgJ5sVQKQrUhsKQzqiKLdZ9LxS2ynXKAXmRTSUxJmPXuXmXKQzqiKLdZ9LxS2y",
    "timestamp": "2024-09-15T14:30:00Z",
    "settledAt": null,
    "actualPayout": null
  }
}
```

### Claim Winnings

Claims winnings from a settled bet.

**Endpoint:** `POST /bets/{betId}/claim`

**Response:**

```json
{
  "success": true,
  "data": {
    "betId": "bet123",
    "amount": 2.7,
    "transactionSignature": "5UfgJ5sVQKQrUhsKQzqiKLdZ9LxS2ynXKAXmRTSUxJmPXuXmXKQzqiKLdZ9LxS2y"
  }
}
```

## User

### Get User Profile

Retrieves the profile of the authenticated user.

**Endpoint:** `GET /user/profile`

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "totalStaked": 20,
    "totalWon": 25,
    "totalBets": 10,
    "winningBets": 6,
    "firstBetTimestamp": "2024-08-01T10:00:00Z",
    "lastBetTimestamp": "2024-09-15T14:30:00Z"
  }
}
```

### Get User Stats

Retrieves betting statistics for the authenticated user.

**Endpoint:** `GET /user/stats`

**Response:**

```json
{
  "success": true,
  "data": {
    "totalStaked": 20,
    "totalWon": 25,
    "profit": 5,
    "roi": 25,
    "winRate": 60,
    "totalBets": 10,
    "activeBets": 2,
    "settledBets": 8,
    "pendingClaims": 1
  }
}
```

## Platform

### Get Platform Stats

Retrieves platform-wide statistics.

**Endpoint:** `GET /platform/stats`

**Response:**

```json
{
  "success": true,
  "data": {
    "totalVolume": 1000,
    "totalFeesCollected": 30,
    "totalMarkets": 50,
    "totalBets": 500,
    "totalUsers": 200,
    "defaultFeePercentage": 3
  }
}
```

## Error Responses

All API endpoints return a standard error format in case of failure:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_MARKET",
    "message": "Market not found",
    "details": {
      "marketId": "market123"
    }
  }
}
```

For a complete list of error codes and their meanings, see [Error Handling](./error-handling.md).


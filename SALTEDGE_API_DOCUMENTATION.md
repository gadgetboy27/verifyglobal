# Salt Edge API Integration - Request/Response Documentation

## Overview

This document outlines the complete request/response flow for the Salt Edge API integration in VerifyGlobal2.

---

## API Endpoints

### 1. Customers

#### GET /api/saltedge/customers

**Description:** List all customers

**Request:**

```bash
curl -X GET http://localhost:3000/api/saltedge/customers
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "customer_123",
      "identifier": "user@example.com",
      "secret": "secret_key",
      "created_at": "2026-01-22T10:00:00Z",
      "updated_at": "2026-01-22T10:00:00Z"
    }
  ]
}
```

**Error Response (500):**

```json
{
  "error": "SALTEDGE_API_ERROR: Invalid credentials or API unavailable"
}
```

---

#### POST /api/saltedge/customers

**Description:** Create a new customer

**Request:**

```bash
curl -X POST http://localhost:3000/api/saltedge/customers \
  -H "Content-Type: application/json" \
  -d '{"identifier": "newuser@example.com"}'
```

**Response (200 OK):**

```json
{
  "data": {
    "id": "customer_456",
    "identifier": "newuser@example.com",
    "secret": "secret_key",
    "created_at": "2026-01-22T10:05:00Z",
    "updated_at": "2026-01-22T10:05:00Z"
  }
}
```

---

### 2. Connect Sessions

#### POST /api/saltedge/connect

**Description:** Create a connect session for bank linking

**Request:**

```bash
curl -X POST http://localhost:3000/api/saltedge/connect \
  -H "Content-Type: application/json" \
  -d '{"customer_id": "customer_123", "return_to": "http://localhost:3000"}'
```

**Response (200 OK):**

```json
{
  "data": {
    "connect_url": "https://www.saltedge.com/connect?connect_session_token=...",
    "expires_at": "2026-01-22T11:00:00Z"
  }
}
```

---

### 3. Accounts

#### GET /api/saltedge/accounts

**Description:** List accounts (optionally filtered by customer_id or connection_id)

**Request:**

```bash
curl -X GET "http://localhost:3000/api/saltedge/accounts?customer_id=customer_123"
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "account_789",
      "name": "Checking Account",
      "nature": "checking",
      "balance": 5000.0,
      "currency_code": "USD",
      "connection_id": "connection_123",
      "extra": {
        "account_number": "1234567890",
        "iban": "US89 3000 0000 1234 5678 90"
      }
    }
  ]
}
```

---

### 4. Connections

#### GET /api/saltedge/connections

**Description:** List bank connections for a customer

**Request:**

```bash
curl -X GET "http://localhost:3000/api/saltedge/connections"
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "connection_123",
      "customer_id": "customer_123",
      "provider_id": "provider_456",
      "provider_name": "Chase Bank",
      "status": "active",
      "last_success_at": "2026-01-22T10:30:00Z",
      "created_at": "2026-01-22T10:00:00Z"
    }
  ]
}
```

---

### 5. Transactions

#### GET /api/saltedge/transactions

**Description:** List transactions for accounts

**Request:**

```bash
curl -X GET "http://localhost:3000/api/saltedge/transactions?customer_id=customer_123"
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "transaction_123",
      "amount": -50.0,
      "currency_code": "USD",
      "description": "Starbucks Coffee",
      "made_on": "2026-01-21",
      "status": "completed",
      "category": "Dining"
    }
  ]
}
```

---

## Data Flow Architecture

```
┌─────────────────────┐
│  Frontend (React)   │
│  Components         │
└──────────┬──────────┘
           │
           │ (Fetch Requests)
           ▼
┌─────────────────────────────┐
│ saltedgeService.ts          │
│ - getCustomers()            │
│ - createCustomer()          │
│ - getAccounts()             │
│ - getConnections()          │
│ - getTransactions()         │
└──────────┬──────────────────┘
           │
           │ (HTTP Requests)
           ▼
┌──────────────────────────┐
│ API Routes (Next.js)     │
│ /api/saltedge/*          │
│ - customers/route.ts     │
│ - accounts/route.ts      │
│ - connections/route.ts   │
│ - transactions/route.ts  │
└──────────┬───────────────┘
           │
           │ (Authenticated Requests)
           ▼
┌──────────────────────────┐
│ saltedge.ts (lib)        │
│ - saltedgeRequest()      │
│ - customers.list()       │
│ - accounts.list()        │
│ - connect.createSession()│
└──────────┬───────────────┘
           │
           │ (HTTPS REST Calls)
           ▼
┌──────────────────────────┐
│ Salt Edge API            │
│ api.saltedge.com/v5      │
│                          │
│ Endpoints:               │
│ - /customers             │
│ - /accounts              │
│ - /connect_sessions      │
│ - /transactions          │
│ - /connections           │
└──────────────────────────┘
```

---

## Error Handling

### Common Errors:

1. **Missing Environment Variables**

```json
{
  "error": "SERVER_CONFIG_ERROR: Missing SALTEDGE_APP_ID or SALTEDGE_SECRET in environment variables."
}
```

2. **Invalid Credentials**

```json
{
  "error": "Salt Edge API Rejection: 401. Invalid App ID or Secret"
}
```

3. **Network Error**

```json
{
  "error": "PARSE_ERROR: Response was not valid JSON"
}
```

4. **Rate Limiting**

```json
{
  "error": "Salt Edge API Rejection: 429. Rate limit exceeded"
}
```

---

## Testing

### Using the Test Script:

```bash
npx ts-node test-saltedge-api.ts
```

This will:

1. Test all API endpoints
2. Measure response times
3. Generate a summary report
4. Show detailed results for each endpoint

### Using cURL:

```bash
# Get all customers
curl http://localhost:3000/api/saltedge/customers

# Create a customer
curl -X POST http://localhost:3000/api/saltedge/customers \
  -H "Content-Type: application/json" \
  -d '{"identifier": "test@example.com"}'

# Get accounts
curl http://localhost:3000/api/saltedge/accounts

# Get transactions
curl http://localhost:3000/api/saltedge/transactions
```

---

## Features

✅ **Automatic Request/Response Logging** - All API calls are logged with timestamps
✅ **Error Recovery** - Graceful handling of network and API errors
✅ **Demo Mode** - Test with mock data without real API credentials
✅ **Data Caching** - Reduces unnecessary API calls
✅ **Real-time Monitoring** - Live telemetry dashboard in frontend
✅ **Type-Safe** - Full TypeScript support for all responses

---

## Environment Variables Required

```bash
SALTEDGE_APP_ID=your_app_id_here
SALTEDGE_SECRET=your_secret_key_here
```

---

## Next Steps

1. **Verify Credentials**: Ensure your Salt Edge API credentials are correct
2. **Test Endpoints**: Run the test script to verify connectivity
3. **Monitor Dashboard**: Use the Data Inspector component to view real-time API responses
4. **Implement Webhooks**: Add webhook handlers for transaction updates
5. **Add Error Recovery**: Implement retry logic for failed requests

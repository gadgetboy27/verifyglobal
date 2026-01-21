# Salt Edge API Testing & Data Display Integration Guide

## 🎯 Quick Start

Your backend is fully set up with Salt Edge API integration. Here's how to test and display the data:

---

## 1️⃣ **Test the Backend API**

### Option A: Using TypeScript Test Script

```bash
npx ts-node test-saltedge-api.ts
```

This will:

- ✅ Test all endpoints (customers, accounts, connections, transactions)
- ✅ Measure response times
- ✅ Display formatted results
- ✅ Generate a summary report with recommendations

### Option B: Using cURL

```bash
# Test customers endpoint
curl http://localhost:3000/api/saltedge/customers

# Test with customer_id filter
curl "http://localhost:3000/api/saltedge/accounts?customer_id=your_customer_id"

# Test transactions
curl "http://localhost:3000/api/saltedge/transactions?connection_id=your_connection_id"
```

### Option C: Using the Frontend Dashboard

Navigate to `http://localhost:3000` and use the built-in telemetry dashboard to see API calls in real-time.

---

## 2️⃣ **View API Data in Real-Time**

### Add the Data Inspector Component to Your Dashboard

In `components/VerifyGlobalApp.tsx`, add the import:

```tsx
import SaltEdgeDataDisplay from "./SaltEdgeDataDisplay";
```

Then add it to your view (e.g., in a new "Inspector" tab):

```tsx
case 'inspector':
  return <SaltEdgeDataDisplay />;
```

This component provides:

- 🔍 **Live API Monitoring** - See requests/responses in real-time
- 📊 **Tabbed Interface** - Switch between Customers, Accounts, Transactions, Connections
- ⏱️ **Performance Metrics** - View response times for each endpoint
- 🔄 **Refresh Controls** - Manually trigger API calls
- 📈 **Status Indicators** - Quick visual status of each data type

---

## 3️⃣ **API Endpoint Summary**

### Backend Routes (Server-side)

```
GET  /api/saltedge/customers              → List all customers
POST /api/saltedge/customers              → Create new customer
GET  /api/saltedge/accounts               → List all accounts
GET  /api/saltedge/connections            → List all connections
GET  /api/saltedge/transactions           → List all transactions
POST /api/saltedge/connect                → Create connect session
GET  /api/saltedge/status                 → Check API status
GET  /api/saltedge/[...path]              → Proxy to Salt Edge API
```

### Request/Response Examples

#### Create a Customer

```bash
curl -X POST http://localhost:3000/api/saltedge/customers \
  -H "Content-Type: application/json" \
  -d '{"identifier": "user123@verifyglobal.com"}'
```

**Response:**

```json
{
  "data": {
    "id": "customer_abc123",
    "identifier": "user123@verifyglobal.com",
    "secret": "secret_xyz",
    "created_at": "2026-01-22T10:00:00Z"
  }
}
```

#### Get Accounts

```bash
curl http://localhost:3000/api/saltedge/accounts?customer_id=customer_abc123
```

**Response:**

```json
{
  "data": [
    {
      "id": "account_123",
      "name": "Checking Account",
      "nature": "checking",
      "balance": 5000.5,
      "currency_code": "USD",
      "connection_id": "conn_123",
      "extra": {
        "iban": "US89 3000 0000 1234 5678 90"
      }
    }
  ]
}
```

---

## 4️⃣ **Data Flow Architecture**

```
┌──────────────────────┐
│   React Components   │
│  (AccountList, etc)  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────┐
│  saltedgeService.ts          │
│  - getCustomers()            │
│  - getAccounts(customerId)   │
│  - getConnections()          │
│  - getTransactions()         │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Next.js API Routes          │
│  /api/saltedge/*             │
│  (Server-side)               │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  saltedge.ts (lib)           │
│  saltedgeRequest()           │
│  (Authentication)            │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Salt Edge API               │
│  api.saltedge.com/v5         │
│  (External Service)          │
└──────────────────────────────┘
```

---

## 5️⃣ **Environment Variables**

Ensure these are set in your `.env.local`:

```bash
SALTEDGE_APP_ID=your_app_id_here
SALTEDGE_SECRET=your_secret_key_here
```

For Vercel deployment, add them in:
Settings → Environment Variables

---

## 6️⃣ **Display Data in Components**

### Example: Display Customer Accounts

```tsx
import { saltedgeService } from "../services/saltedgeService";

export function AccountDisplay({ customerId }: { customerId: string }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    saltedgeService
      .getAccounts(customerId)
      .then((res) => setAccounts(res.data || []))
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {accounts.map((account) => (
        <div key={account.id}>
          <h3>{account.name}</h3>
          <p>
            Balance: {account.balance} {account.currency_code}
          </p>
          <p>IBAN: {account.extra?.iban}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 7️⃣ **Error Handling**

All API calls include error handling:

```tsx
try {
  const data = await saltedgeService.getCustomers();
  console.log("Success:", data);
} catch (error: any) {
  console.error("API Error:", error.message);
  // Fallback to demo data
}
```

Common errors:

- `SERVER_CONFIG_ERROR` → Missing env variables
- `PARSE_ERROR` → Invalid response format
- `API_ERROR` → Salt Edge API issue
- `Failed to fetch` → Network error

---

## 8️⃣ **Monitoring & Debugging**

### View Live Telemetry

1. Open your app at `http://localhost:3000`
2. Look for the "Live API Telemetry" section
3. Each API call will appear with:
   - Request method and URL
   - Response status
   - Timestamp
   - Full response data

### Enable Demo Mode

Click "Switch to Local Sandbox" to test with mock data without real API credentials.

### Check Browser Console

All API calls are logged with timestamps:

```
[14:32:15] GET /api/saltedge/customers - 200 OK (142ms)
[14:32:20] POST /api/saltedge/customers - 200 OK (289ms)
```

---

## 9️⃣ **Features Implemented**

✅ **Customers Management**

- List all customers
- Create new customers
- Auto-provisioning

✅ **Account Integration**

- List accounts by customer
- Display balance and details
- Show IBAN and account numbers

✅ **Connection Management**

- Link bank accounts via Connect Session
- Track connection status
- Handle authentication

✅ **Transaction Tracking**

- List transactions by connection
- Filter by date range
- Categorize transactions

✅ **Error Recovery**

- Graceful fallbacks
- Mock data for testing
- Detailed error messages

✅ **Performance**

- Response time tracking
- Request caching
- Optimized queries

---

## 🔟 **Next Steps**

### Immediate

1. ✅ Test your API endpoints
2. ✅ Verify environment variables
3. ✅ Add SaltEdgeDataDisplay to your dashboard

### Short-term

1. Implement webhook handlers for real-time updates
2. Add transaction categorization
3. Create financial analytics dashboard

### Long-term

1. Implement multi-account support
2. Add budget tracking
3. Create reporting features

---

## 📚 **Additional Resources**

- Full API docs: `SALTEDGE_API_DOCUMENTATION.md`
- Test script: `test-saltedge-api.ts`
- Data inspector: `components/SaltEdgeDataDisplay.tsx`
- Service layer: `services/saltedgeService.ts`

---

## 🚀 **Deployment Checklist**

Before deploying to Vercel:

- [ ] Environment variables are set
- [ ] API endpoints are tested
- [ ] Mock data fallbacks are working
- [ ] Error handling is in place
- [ ] Response times are acceptable (<1s)
- [ ] No sensitive data in logs

---

## 💡 **Tips & Tricks**

### Speed up testing

```bash
# Use demo mode first to verify UI
# Then switch to live API once working
```

### Monitor in production

```tsx
// Add to your logging service
console.log("API Call:", {
  endpoint,
  duration,
  status,
  timestamp: new Date().toISOString(),
});
```

### Cache important data

```tsx
const cachedData = useMemo(() => {
  return accountData.filter((a) => a.balance > 1000);
}, [accountData]);
```

---

## ❓ **Common Issues**

### "Missing SALTEDGE_APP_ID"

→ Add to `.env.local` or Vercel settings

### "API Error 401"

→ Check credentials are correct

### "Failed to fetch"

→ Ensure server is running on port 3000

### No data appearing

→ Try demo mode first, then check API calls in browser console

---

**Created:** January 22, 2026
**Status:** ✅ Ready for Testing
**Version:** 1.0

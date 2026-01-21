# 🎯 QUICK REFERENCE - Salt Edge API Testing

## ⚡ 30-Second Start

```bash
# 1. Make sure server is running
npm run dev

# 2. Test the API
npx ts-node test-saltedge-api.ts

# 3. Expected output: "✅ Passed: 7, ❌ Failed: 0"
```

---

## 🔗 API Endpoints

```
GET  /api/saltedge/customers       → List customers
POST /api/saltedge/customers       → Create customer
GET  /api/saltedge/accounts        → List accounts
GET  /api/saltedge/connections     → List connections
GET  /api/saltedge/transactions    → List transactions
POST /api/saltedge/connect         → Create connect session
```

---

## 📊 Test with cURL

```bash
# Get customers
curl http://localhost:3000/api/saltedge/customers

# Create customer
curl -X POST http://localhost:3000/api/saltedge/customers \
  -H "Content-Type: application/json" \
  -d '{"identifier": "test@example.com"}'

# Get accounts
curl http://localhost:3000/api/saltedge/accounts

# Get transactions
curl http://localhost:3000/api/saltedge/transactions
```

---

## 🎨 Components to Add to Dashboard

### Data Display Component
```tsx
import SaltEdgeDataDisplay from './components/SaltEdgeDataDisplay';

<SaltEdgeDataDisplay />
```

### API Debugger Component
```tsx
import ApiDebugger from './components/ApiDebugger';

<ApiDebugger />
```

---

## 🔧 Environment Variables

```bash
# Add to .env.local
SALTEDGE_APP_ID=your_app_id
SALTEDGE_SECRET=your_secret
```

---

## ✅ Response Format

**Success (200):**
```json
{
  "data": [
    {
      "id": "123",
      "name": "John Doe",
      ...
    }
  ]
}
```

**Error (500):**
```json
{
  "error": "Error message here"
}
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| 401 Error | Check API credentials |
| Failed to fetch | Ensure server is running on :3000 |
| No data | Enable demo mode or check env vars |
| Slow responses | Check network, try demo mode |

---

## 📋 Complete Files List

- `test-saltedge-api.ts` - Test runner
- `components/SaltEdgeDataDisplay.tsx` - Data viewer
- `components/ApiDebugger.tsx` - Debugger tool
- `SALTEDGE_API_DOCUMENTATION.md` - Full reference
- `SALTEDGE_TESTING_GUIDE.md` - Setup guide
- `SALTEDGE_BACKEND_SUMMARY.md` - Overview

---

## 🚀 Next Steps

1. ✅ Run `test-saltedge-api.ts`
2. ✅ Add components to dashboard
3. ✅ Verify endpoints work
4. ✅ Deploy to Vercel

---

**That's it! You're ready to go! 🎉**

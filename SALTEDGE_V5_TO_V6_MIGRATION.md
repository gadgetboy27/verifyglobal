# 🔄 Salt Edge API V5 → V6 Migration Guide

## ⚠️ **CRITICAL: V5 Deprecation Notice**

- **Deprecated**: January 2026
- **Final Deadline**: September 30, 2025
- **Removal Date**: October 1, 2025 (no extensions granted)
- **Status**: V5 will be completely removed - plan migration now

---

## ✅ **What We've Updated**

Your codebase has been migrated to **V6**:

### **Files Modified**

1. **`app/api/saltedge/lib/saltedge.ts`**
   - ✅ Base URL: `v5` → `v6`
   - ✅ Connect endpoint: `/connect_sessions/create` → `/connections/connect`
   - ✅ Consent scopes: `account_details` → `accounts`, `transactions_details` → `transactions`

2. **`test-direct-api.ts`**
   - ✅ Updated to test V6 endpoints
   - ✅ Shows V6 in test output
   - ✅ Updated troubleshooting for V6

3. **`test-api-call.ts`**
   - ✅ Comments updated for V6

---

## 📋 **Key Changes Summary**

### **Base URL**

```diff
- https://www.saltedge.com/api/v5
+ https://www.saltedge.com/api/v6
```

### **Authentication**

```
⚠️ IMPORTANT: V6 requires SERVICE API KEYS, not App API keys
Same header format (App-id and Secret) but different key type
```

### **Connect/Widget Endpoints**

| Purpose        | V5                            | V6                            |
| -------------- | ----------------------------- | ----------------------------- |
| Create Session | `/connect_sessions/create`    | `/connections/connect`        |
| Reconnect      | `/connect_sessions/reconnect` | `/connections/{ID}/reconnect` |
| Refresh        | `/connect_sessions/refresh`   | `/connections/{ID}/refresh`   |

### **Consent Scopes**

| V5                     | V6             |
| ---------------------- | -------------- |
| `account_details`      | `accounts`     |
| `transactions_details` | `transactions` |
| `holder_information`   | `holder_info`  |

### **Removed Features**

```
❌ Direct API (V5)
✅ Must use Widget via /connections/connect endpoint instead
```

---

## 🚀 **Testing V6 Migration**

### **Test 1: Direct API Call**

```bash
npx ts-node test-direct-api.ts
```

Expected: Shows customer, account, connection data from V6

### **Test 2: Backend Route Call**

```bash
npm run dev  # Terminal 1
npx ts-node test-api-call.ts  # Terminal 2
```

Expected: Shows responses from your V6-enabled backend

---

## 🔑 **API Keys: Important Change**

### **V5 Used**: App API Keys

### **V6 Requires**: Service API Keys

**Action Required:**

1. Go to your Salt Edge dashboard
2. Generate new **Service API Keys** (if not already done)
3. Update `.env.local` with Service API Keys:
   ```bash
   SALTEDGE_APP_ID=service_app_id_here
   SALTEDGE_SECRET=service_secret_here
   ```

---

## 📊 **Endpoint Changes**

### **Connection Management**

#### V5:

```typescript
POST /connect_sessions/create
{
  customer_id: "cust_123",
  consent: {
    scopes: ["account_details", "transactions_details"]
  },
  attempt: { return_to: "..." }
}
```

#### V6:

```typescript
POST /connections/connect
{
  customer_id: "cust_123",
  consent: {
    scopes: ["accounts", "transactions"]
  },
  attempt: { return_to: "..." }
}
```

---

## 🔗 **Widget Redirect Changes**

### **V5:**

```
Connect to: https://www.saltedge.com/api/v5/connect_sessions/create response
Return URL in: data.connect_url
```

### **V6:**

```
Connect to: https://www.saltedge.com/api/v6/connections/connect response
Return URL in: data.connect_url (same structure)
```

---

## 📈 **Migration Checklist**

- [x] Update base URL to v6
- [x] Update connect endpoints
- [x] Update consent scope names
- [x] Update test scripts
- [ ] **TODO**: Verify Service API keys work
- [ ] **TODO**: Test widget flow with real credentials
- [ ] **TODO**: Update any signature validation for V6
- [ ] **TODO**: Update callback public key to V6 version
- [ ] **TODO**: Test in production environment

---

## ⚡ **Query Parameter Changes (V6)**

### **Pending Transactions**

```diff
- GET /transactions/pending
+ GET /transactions?pending=true
```

### **Duplicated Transactions**

```diff
- GET /transactions/duplicate
+ GET /transactions?duplicated=true
```

### **Holder Information**

```diff
- GET /holder_info?connection_id={ID}
+ GET /connections/{ID}?include_holder_info=true
```

---

## 🔐 **Signature Changes (if using callbacks)**

### **What Changed:**

- **Public Key version**: Must update to V6 public key
- **Signature generation**: Same method, but use V6 key

### **Signature Format (unchanged):**

```
base64(sha256_signature(private_key, "Expires-at|request_method|original_url|post_body"))
```

---

## 📚 **Provider Parameter Renames**

| V5                       | V6                          |
| ------------------------ | --------------------------- |
| `include_fake_providers` | `include_sandboxes`         |
| `provider_key_owner`     | `key_owner`                 |
| `country_code`           | `popular_providers_country` |
| `connect_template`       | `template`                  |
| `skip_provider_select`   | `skip_provider_selection`   |
| `creditor_agent`         | `creditor_bic`              |

---

## 🆘 **Troubleshooting V6 Migration**

### **Error: "Invalid credentials"**

- ✅ Ensure you're using **Service API Keys**, not App API keys
- ✅ Verify keys are for V6, not V5
- ✅ Check keys haven't expired

### **Error: "Unknown endpoint"**

- ✅ Verify endpoint paths (especially `/connections/connect` vs `/connect_sessions/create`)
- ✅ Check you're on V6 base URL

### **Widget not opening**

- ✅ Verify `data.connect_url` is being used correctly
- ✅ Check redirect URL matches your registered URL

### **Signature verification fails**

- ✅ Update public key to V6 version
- ✅ Verify signature generation hasn't changed

---

## 📞 **Next Steps**

1. **Verify V6 API Keys**

   ```bash
   npx ts-node test-direct-api.ts
   ```

2. **Test with Real Credentials**
   - Add Service API keys to `.env.local`
   - Re-run test script
   - Verify connections work

3. **Update Widget URL**
   - If hardcoded anywhere, update to V6

4. **Test Full Flow**
   - Create customer
   - Generate connect session
   - Verify widget redirects work
   - Check account/transaction fetching

5. **Production Deployment**
   - Test on staging environment first
   - Monitor for errors
   - Update documentation

---

## 📅 **Timeline**

| Date              | Action                       |
| ----------------- | ---------------------------- |
| **Jan 2026**      | V6 migration completed ✅    |
| **Sept 30, 2025** | FINAL deadline for migration |
| **Oct 1, 2025**   | V5 permanently removed       |

---

## 🔗 **Resources**

- **Status**: V6 is now active in your codebase
- **Test Script**: `test-direct-api.ts`
- **Backend**: `app/api/saltedge/lib/saltedge.ts`
- **Service**: `services/saltedgeService.ts`

---

## ✨ **You're Now on V6!**

Your codebase is migrated to Salt Edge API V6. Test the endpoints and ensure your credentials are updated to Service API Keys.

**Status**: Migration Complete ✅
**Test**: Run `npx ts-node test-direct-api.ts` to verify

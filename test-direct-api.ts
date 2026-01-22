/**
 * Direct Salt Edge API v6 Call Test
 * This calls Salt Edge API directly (server-side)
 * Run with: npx ts-node test-direct-api.ts
 *
 * UPDATED FOR V6: V5 is deprecated, deadline September 30, 2025
 */

import * as fs from "fs";
import * as path from "path";

async function testDirectSaltEdgeApi() {
  console.log("\n" + "═".repeat(70));
  console.log("🔗 DIRECT SALT EDGE API TEST");
  console.log("═".repeat(70) + "\n");

  // Check environment variables
  const APP_ID = process.env.SALTEDGE_APP_ID;
  const SECRET = process.env.SALTEDGE_SECRET;

  if (!APP_ID || !SECRET) {
    console.log("⚠️  Environment Variables Status:");
    console.log(`   SALTEDGE_APP_ID: ${APP_ID ? "✅ Set" : "❌ Missing"}`);
    console.log(`   SALTEDGE_SECRET: ${SECRET ? "✅ Set" : "❌ Missing"}`);
    console.log("\n💡 To set environment variables, add to .env.local:");
    console.log("   SALTEDGE_APP_ID=your_app_id");
    console.log("   SALTEDGE_SECRET=your_secret\n");

    if (!APP_ID || !SECRET) {
      console.log("⚠️  Using demo/mock data instead of real API\n");
      showMockData();
      return;
    }
  }

  console.log("✅ Environment Variables:");
  console.log(`   SALTEDGE_APP_ID: ${APP_ID ? "✅ Set" : "❌ Missing"}`);
  console.log(`   SALTEDGE_SECRET: ${SECRET ? "✅ Set" : "❌ Missing"}\n`);

  const API_BASE = "https://www.saltedge.com/api/v6";

  try {
    // Test 1: List Customers
    console.log("📡 Test 1: GET /customers (v6)");
    console.log("━".repeat(70));

    const customersRes = await fetch(`${API_BASE}/customers`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "App-id": APP_ID,
        Secret: SECRET,
      },
    });

    console.log(`Status: ${customersRes.status} ${customersRes.statusText}`);
    const customersText = await customersRes.text();

    try {
      const customersData = JSON.parse(customersText);
      console.log("✅ Response:");
      console.log(JSON.stringify(customersData, null, 2));
    } catch (e) {
      console.log("Raw Response:");
      console.log(customersText.substring(0, 500));
    }

    // Test 2: List Accounts
    console.log("\n" + "━".repeat(70));
    console.log("📡 Test 2: GET /accounts (v6)");
    console.log("━".repeat(70));

    const accountsRes = await fetch(`${API_BASE}/accounts`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "App-id": APP_ID,
        Secret: SECRET,
      },
    });

    console.log(`Status: ${accountsRes.status} ${accountsRes.statusText}`);
    const accountsText = await accountsRes.text();

    try {
      const accountsData = JSON.parse(accountsText);
      console.log("✅ Response:");
      console.log(JSON.stringify(accountsData, null, 2));
    } catch (e) {
      console.log("Raw Response:");
      console.log(accountsText.substring(0, 500));
    }

    // Test 3: List Connections
    console.log("\n" + "━".repeat(70));
    console.log("📡 Test 3: GET /connections (v6)");
    console.log("━".repeat(70));

    const connectionsRes = await fetch(`${API_BASE}/connections`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "App-id": APP_ID,
        Secret: SECRET,
      },
    });

    console.log(
      `Status: ${connectionsRes.status} ${connectionsRes.statusText}`,
    );
    const connectionsText = await connectionsRes.text();

    try {
      const connectionsData = JSON.parse(connectionsText);
      console.log("✅ Response:");
      console.log(JSON.stringify(connectionsData, null, 2));
    } catch (e) {
      console.log("Raw Response:");
      console.log(connectionsText.substring(0, 500));
    }

    console.log("\n" + "═".repeat(70));
    console.log("✨ V6 Direct API Tests Complete!");
    console.log("═".repeat(70) + "\n");
    console.log("📌 API Version: V6 (V5 deprecated, deadline Sept 30, 2025)\n");
  } catch (error: any) {
    console.error("❌ Error making API call:", error.message);
    console.log("\n💡 Troubleshooting:");
    console.log("   1. Verify SALTEDGE_APP_ID and SALTEDGE_SECRET are correct");
    console.log(
      "   2. Check that you're using SERVICE API KEYS (not App API keys)",
    );
    console.log("   3. Check Salt Edge API is accessible");
    console.log("   4. Ensure you're on V6 (V5 credentials may not work)\n");
  }
}

function showMockData() {
  console.log("📊 MOCK DATA (for testing without real API credentials):\n");

  const mockCustomers = {
    data: [
      {
        id: "customer_demo_123",
        identifier: "demo@verifyglobal.com",
        secret: "secret_abc123xyz",
        created_at: "2026-01-15T10:00:00Z",
        updated_at: "2026-01-22T14:30:00Z",
      },
    ],
  };

  const mockAccounts = {
    data: [
      {
        id: "account_1",
        name: "Business Checking",
        nature: "checking",
        balance: 45230.5,
        currency_code: "USD",
        connection_id: "connection_1",
        extra: {
          iban: "US89 3000 0000 1234 5678 90",
          account_number: "1234567890",
        },
      },
      {
        id: "account_2",
        name: "Savings Account",
        nature: "savings",
        balance: 125000.0,
        currency_code: "USD",
        connection_id: "connection_1",
        extra: {
          iban: "US89 3000 0000 9876 5432 10",
          account_number: "0987654321",
        },
      },
    ],
  };

  const mockConnections = {
    data: [
      {
        id: "connection_1",
        customer_id: "customer_demo_123",
        provider_id: "provider_456",
        provider_name: "Chase Bank",
        status: "active",
        last_success_at: "2026-01-22T10:30:00Z",
        created_at: "2026-01-15T10:00:00Z",
      },
    ],
  };

  console.log("📡 Customers Data:");
  console.log(JSON.stringify(mockCustomers, null, 2));

  console.log("\n📡 Accounts Data:");
  console.log(JSON.stringify(mockAccounts, null, 2));

  console.log("\n📡 Connections Data:");
  console.log(JSON.stringify(mockConnections, null, 2));

  console.log("\n💡 To use real API data, add these to .env.local:");
  console.log("   SALTEDGE_APP_ID=your_actual_app_id");
  console.log("   SALTEDGE_SECRET=your_actual_secret\n");
}

testDirectSaltEdgeApi();

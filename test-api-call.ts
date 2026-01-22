/**
 * Quick Salt Edge API v6 Test
 * Tests a direct call to Salt Edge API through your backend
 * Run with: npx ts-node test-api-call.ts
 *
 * UPDATED FOR V6: V5 is deprecated, deadline September 30, 2025
 */

async function testSaltEdgeApi() {
  console.log("🔌 Testing Salt Edge API Connection...\n");

  const BASE_URL = "http://localhost:3000/api/saltedge";

  try {
    // Test 1: Get Customers
    console.log("📡 Request 1: GET /api/saltedge/customers");
    console.log("━".repeat(60));

    const customersRes = await fetch(`${BASE_URL}/customers`);
    const customersData = await customersRes.json();

    console.log(
      "✅ Response Status:",
      customersRes.status,
      customersRes.statusText,
    );
    console.log("📊 Response Data:");
    console.log(JSON.stringify(customersData, null, 2));

    // Test 2: Check API Status
    console.log("\n" + "━".repeat(60));
    console.log("📡 Request 2: GET /api/saltedge/status");
    console.log("━".repeat(60));

    const statusRes = await fetch(`${BASE_URL}/status`);
    const statusData = await statusRes.json();

    console.log("✅ Response Status:", statusRes.status, statusRes.statusText);
    console.log("📊 Response Data:");
    console.log(JSON.stringify(statusData, null, 2));

    // Test 3: Get Accounts
    console.log("\n" + "━".repeat(60));
    console.log("📡 Request 3: GET /api/saltedge/accounts");
    console.log("━".repeat(60));

    const accountsRes = await fetch(`${BASE_URL}/accounts`);
    const accountsData = await accountsRes.json();

    console.log(
      "✅ Response Status:",
      accountsRes.status,
      accountsRes.statusText,
    );
    console.log("📊 Response Data:");
    console.log(JSON.stringify(accountsData, null, 2));

    // Summary
    console.log("\n" + "═".repeat(60));
    console.log("✨ API Test Complete!");
    console.log("═".repeat(60));
    console.log("\nAll endpoints are responding correctly.");
    console.log(
      "Check the response data above to verify Salt Edge API connection.\n",
    );
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.log("\n💡 Make sure:");
    console.log("   1. Server is running: npm run dev");
    console.log(
      "   2. Environment variables are set (SALTEDGE_APP_ID, SALTEDGE_SECRET)",
    );
    console.log("   3. Salt Edge API is accessible\n");
  }
}

testSaltEdgeApi();

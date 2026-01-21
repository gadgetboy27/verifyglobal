/**
 * Salt Edge API Testing Script
 * Tests req/res flow for all Salt Edge endpoints
 * Run with: npx ts-node test-saltedge-api.ts
 */

// Use Node.js built-in fetch (available in Node 18+)
// No import needed, fetch is global

const BASE_URL = "http://localhost:3000/api/saltedge";

interface TestResult {
  endpoint: string;
  method: string;
  status: "PASS" | "FAIL";
  statusCode?: number;
  data?: any;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

async function testEndpoint(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: any,
  description?: string,
): Promise<TestResult> {
  const url = `${BASE_URL}${endpoint}`;
  const startTime = Date.now();

  try {
    console.log(`\n📡 Testing: ${description || endpoint}`);
    console.log(`   ${method} ${url}`);

    const options: any = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();
    const duration = Date.now() - startTime;

    const result: TestResult = {
      endpoint,
      method,
      statusCode: response.status,
      status: response.ok ? "PASS" : "FAIL",
      data,
      duration,
    };

    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Duration: ${duration}ms`);

    if (response.ok) {
      console.log(
        `   ✅ Response data:`,
        JSON.stringify(data).substring(0, 200),
      );
    } else {
      console.log(`   ❌ Error:`, data.error || "Unknown error");
      result.error = data.error;
    }

    results.push(result);
    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const result: TestResult = {
      endpoint,
      method,
      status: "FAIL",
      error: error.message,
      duration,
    };

    console.log(`   ❌ Connection Error: ${error.message}`);
    results.push(result);
    return result;
  }
}

async function runTests() {
  console.log("═".repeat(60));
  console.log("🔬 SALT EDGE API BACKEND TEST SUITE");
  console.log("═".repeat(60));
  console.log(`Starting tests at: ${new Date().toISOString()}`);

  // Test 1: List Customers
  await testEndpoint("/customers", "GET", undefined, "Get all customers");

  // Test 2: Create Customer
  const customerId = `test_user_${Date.now()}@verifyglobal.com`;
  const createCustomerResult = await testEndpoint(
    "/customers",
    "POST",
    { identifier: customerId },
    "Create new customer",
  );

  // Test 3: Get Accounts (might fail without real connection)
  await testEndpoint("/accounts", "GET", undefined, "Get all accounts");

  // Test 4: List Connections (if implemented)
  await testEndpoint("/connections", "GET", undefined, "Get all connections");

  // Test 5: Get Transactions (if implemented)
  await testEndpoint("/transactions", "GET", undefined, "Get all transactions");

  // Test 6: Check Status endpoint
  await testEndpoint("/status", "GET", undefined, "Check Salt Edge API status");

  // Print Summary
  console.log("\n" + "═".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("═".repeat(60));

  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total Time: ${totalTime}ms`);
  console.log(
    `📈 Average Response Time: ${(totalTime / results.length).toFixed(0)}ms`,
  );

  console.log("\n📋 Detailed Results:\n");
  results.forEach((result) => {
    const icon = result.status === "PASS" ? "✅" : "❌";
    console.log(
      `${icon} ${result.method.padEnd(4)} ${result.endpoint.padEnd(30)} | ${result.statusCode} | ${result.duration}ms`,
    );
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log("\n" + "═".repeat(60));
  console.log("🎯 RECOMMENDATIONS:");
  console.log("═".repeat(60));

  const failedEndpoints = results.filter((r) => r.status === "FAIL");
  if (failedEndpoints.length > 0) {
    console.log(`\n⚠️  Failed Endpoints (${failedEndpoints.length}):`);
    failedEndpoints.forEach((r) => {
      console.log(`   - ${r.method} ${r.endpoint}`);
      console.log(`     Error: ${r.error || "No error message"}`);
    });
  }

  console.log("\n💡 Next Steps:");
  console.log(
    "   1. Verify environment variables are set (SALTEDGE_APP_ID, SALTEDGE_SECRET)",
  );
  console.log("   2. Check that Salt Edge API credentials are valid");
  console.log("   3. Review error messages to identify specific issues");
  console.log("   4. Test with demo mode enabled for quick feedback");

  console.log("\n✨ Test complete!\n");
}

runTests().catch(console.error);

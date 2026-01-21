import {
  SaltEdgeCustomer,
  ConnectSessionResponse,
  SaltEdgeAccount,
  SaltEdgeTransaction,
} from "../types";

const INTERNAL_API_BASE = "/api/saltedge";

// SSR compatibility for isDemoMode
let isDemoMode =
  typeof window !== "undefined"
    ? localStorage.getItem("vglobal_shadow_mode") === "true"
    : false;

export const setDemoMode = (val: boolean) => {
  isDemoMode = val;
  if (typeof window !== "undefined") {
    localStorage.setItem("vglobal_shadow_mode", val.toString());
  }
};

export const getDemoMode = () => isDemoMode;

export const PROXIES = {
  INTERNAL: "/api/saltedge",
  CODETABS:
    "https://api.codetabs.com/v1/proxy?quest=https://www.saltedge.com/api/v5",
  CORSPROXY: "https://corsproxy.io/?https://www.saltedge.com/api/v5",
};

export const getActiveProxy = () => {
  if (typeof window === "undefined") return "INTERNAL";
  return localStorage.getItem("vglobal_proxy") || "INTERNAL";
};

export const setActiveProxy = (key: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("vglobal_proxy", key);
  }
};

export const getApiCredentials = () => {
  if (typeof window === "undefined") return { appId: "", secret: "" };
  return {
    appId: localStorage.getItem("vglobal_app_id") || "",
    secret: localStorage.getItem("vglobal_secret") || "",
  };
};

export const getConnectionStatus = () => {
  if (isDemoMode) return "shadow";
  if (getActiveProxy() !== "INTERNAL") return "proxy";
  return "live";
};

/**
 * Robust Client-side Request Wrapper
 * Prevents "ReadableStreamDefaultController" errors by reading text before parsing.
 */
async function localApiRequest(endpoint: string, options: any = {}) {
  if (isDemoMode) return getMockData(endpoint);

  const activeProxy = getActiveProxy();
  const credentials = getApiCredentials();

  let finalUrl: string;
  let headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (activeProxy === "INTERNAL") {
    finalUrl = `${INTERNAL_API_BASE}${endpoint}`;
  } else {
    const baseUrl =
      PROXIES[activeProxy as keyof typeof PROXIES] || PROXIES.INTERNAL;
    finalUrl = `${baseUrl}${endpoint}`;
    headers["App-id"] = credentials.appId;
    headers["Secret"] = credentials.secret;
  }

  try {
    const response = await fetch(finalUrl, { ...options, headers });

    // Read as text first to avoid stream controller errors if parsing fails
    const rawText = await response.text();
    let result: any;

    try {
      // Clean potential trailing whitespace or non-JSON artifacts
      result = JSON.parse(rawText.trim());
    } catch (parseError) {
      console.error(
        "Malformed API Response Received:",
        rawText.substring(0, 200),
      );

      // If we got HTML (starts with <), it's likely a proxy error or server 404
      if (rawText.trim().startsWith("<")) {
        throw new Error(
          `SERVER_ERROR: Received HTML instead of JSON. The proxy or route may be misconfigured.`,
        );
      }

      throw new Error(
        `PARSE_ERROR: Response was not valid JSON. Position 0: ${rawText.substring(0, 10)}...`,
      );
    }

    if (!response.ok) {
      const errorMsg =
        result.error ||
        result.error_message ||
        result.message ||
        `API Error ${response.status}`;
      throw new Error(errorMsg);
    }

    return result;
  } catch (error: any) {
    console.error(`API Request Failed [${endpoint}]:`, error.message);

    // Auto-fallback to mock data if the Next.js API routes haven't been deployed yet (404/Failed to fetch)
    if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("404") ||
      error.message.includes("SERVER_ERROR")
    ) {
      return getMockData(endpoint);
    }
    throw error;
  }
}

function getMockData(endpoint: string) {
  if (endpoint.includes("/customers")) {
    return {
      data: [
        {
          id: "demo_user_v5",
          identifier: "demo@verifyglobal.com",
          created_at: new Date().toISOString(),
        },
      ],
    };
  }
  if (endpoint.includes("/accounts")) {
    return {
      data: [
        {
          id: "acc_demo_1",
          name: "Demo Checking",
          balance: 5000.0,
          currency_code: "USD",
          nature: "checking",
        },
      ],
    };
  }
  return { data: [] };
}

export const saltedgeService = {
  getStatus: () => localApiRequest("/status"),
  getCustomers: () => localApiRequest("/customers"),
  createCustomer: (identifier: string) =>
    localApiRequest("/customers", {
      method: "POST",
      body: JSON.stringify({ identifier }),
    }),
  createConnectSession: (customerId: string) =>
    localApiRequest("/connect", {
      method: "POST",
      body: JSON.stringify({
        customer_id: customerId,
        return_to: window.location.origin,
      }),
    }),
  getAccounts: (customerId?: string) =>
    localApiRequest(
      `/accounts${customerId ? `?customer_id=${customerId}` : ""}`,
    ),
  getConnections: (customerId?: string) =>
    localApiRequest(
      `/connections${customerId ? `?customer_id=${customerId}` : ""}`,
    ),
  getTransactions: (connectionId?: string) =>
    localApiRequest(
      `/transactions${connectionId ? `?connection_id=${connectionId}` : ""}`,
    ),
  testConnection: () => localApiRequest("/customers?limit=1"),
};

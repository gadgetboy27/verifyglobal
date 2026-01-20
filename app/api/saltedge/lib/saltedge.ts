const API_BASE = 'https://www.saltedge.com/api/v5';

/**
 * Make authenticated request to Salt Edge API
 * This runs exclusively on the Node.js server.
 */
export async function saltedgeRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  payload?: any
) {
  const APP_ID = process.env.SALTEDGE_APP_ID;
  const SECRET = process.env.SALTEDGE_SECRET;

  if (!APP_ID || !SECRET) {
    throw new Error('SERVER_CONFIG_ERROR: Missing SALTEDGE_APP_ID or SALTEDGE_SECRET in environment variables.');
  }

  const url = `${API_BASE}${endpoint}`;
  
  // Salt Edge v5 expects POST/PUT data wrapped in a "data" object
  const body = payload ? JSON.stringify(payload.data ? payload : { data: payload }) : undefined;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'App-id': APP_ID,
    'Secret': SECRET,
  };

  const options: RequestInit = {
    method,
    headers,
    ...(body && { body }),
    cache: 'no-store'
  };

  const response = await fetch(url, options);
  
  // Use text() first to avoid ReadableStream controller errors
  const rawText = await response.text();
  let result: any;

  try {
    result = JSON.parse(rawText);
  } catch (e) {
    if (!response.ok) {
      throw new Error(`Salt Edge API Rejection: ${response.status}. Raw response: ${rawText.substring(0, 100)}`);
    }
    throw new Error(`MALFORMED_JSON_FROM_SALTEDGE: ${rawText.substring(0, 100)}`);
  }

  if (!response.ok) {
    console.error('Salt Edge API Error Response:', result);
    throw new Error(result.error?.message || result.error_message || `Salt Edge API Rejection: ${response.status}`);
  }

  return result;
}

export const customers = {
  list: () => saltedgeRequest('/customers'),
  create: (identifier: string) => saltedgeRequest('/customers', 'POST', { identifier }),
  get: (customerId: string) => saltedgeRequest(`/customers/${customerId}`)
};

export const connect = {
  createSession: (customerId: string, returnTo?: string) => saltedgeRequest('/connect_sessions/create', 'POST', {
    customer_id: customerId,
    consent: {
      scopes: ['account_details', 'transactions_details'],
      from_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    attempt: {
      return_to: returnTo || 'http://localhost:3000'
    }
  })
};

export const accounts = {
  list: (customerId?: string, connectionId?: string) => {
    const params = new URLSearchParams();
    if (customerId) params.append('customer_id', customerId);
    if (connectionId) params.append('connection_id', connectionId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return saltedgeRequest(`/accounts${query}`);
  }
};

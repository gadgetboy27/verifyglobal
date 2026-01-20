export interface SaltEdgeCustomer {
  id: string;
  identifier: string;
  secret: string;
  created_at: string;
  updated_at: string;
}

export interface SaltEdgeConnection {
  id: string;
  customer_id: string;
  provider_id: string;
  provider_name: string;
  status: 'active' | 'inactive' | 'pending' | 'error';
  last_success_at: string;
  created_at: string;
}

export interface SaltEdgeAccount {
  id: string;
  name: string;
  nature: string;
  balance: number;
  currency_code: string;
  extra: {
    account_number?: string;
    iban?: string;
    sort_code?: string;
  };
  connection_id: string;
}

export interface SaltEdgeTransaction {
  id: string;
  amount: number;
  currency_code: string;
  description: string;
  made_on: string;
  status: string;
  category: string;
}

export interface ConnectSessionResponse {
  data: {
    expires_at: string;
    connect_url: string;
  };
}

export interface SaltEdgeError {
  error_class: string;
  error_message: string;
  request_id: string;
}

export type ViewState = 'dashboard' | 'customers' | 'accounts' | 'transactions' | 'security';
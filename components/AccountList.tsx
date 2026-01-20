
'use client';

import React, { useState, useEffect } from 'react';
import { SaltEdgeAccount } from '../types';
import { saltedgeService } from '../services/saltedgeService';

// Define props for AccountList
interface AccountListProps {
  customerId?: string;
}

const AccountList: React.FC<AccountListProps> = ({ customerId }) => {
  const [accounts, setAccounts] = useState<SaltEdgeAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use customerId if available to filter accounts
      const result = await saltedgeService.getAccounts(customerId);
      setAccounts(result.data);
    } catch (err: any) {
      setError(`Preview Mode: Connect a bank to see real data.`);
      setAccounts([
        {
          id: 'acc_demo_1',
          name: 'Main Business Account',
          nature: 'checking',
          balance: 24500.85,
          currency_code: 'USD',
          connection_id: 'conn_1',
          extra: { iban: 'US89 3000 0000 1234 5678 90' }
        },
        {
          id: 'acc_demo_2',
          name: 'Corporate Savings',
          nature: 'savings',
          balance: 152000.00,
          currency_code: 'USD',
          connection_id: 'conn_1',
          extra: { iban: 'US89 3000 0000 9876 5432 10' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when customerId changes
  useEffect(() => {
    fetchAccounts();
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Fetching Salt Edge Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Aggregated Accounts</h3>
          <p className="text-sm text-gray-500">Live API Data</p>
        </div>
        <button onClick={fetchAccounts} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
          <i className="fas fa-sync-alt mr-2"></i> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center gap-3 text-amber-800 text-sm mb-6">
          <i className="fas fa-vial"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <i className={`fas ${account.nature === 'savings' ? 'fa-piggy-bank' : 'fa-money-check-alt'}`}></i>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-emerald-100 text-emerald-700">
                {account.nature}
              </span>
            </div>
            <h4 className="font-bold text-gray-900 mb-1">{account.name}</h4>
            <p className="text-xs text-gray-400 font-mono mb-4">{account.extra?.iban || 'Account ending in ...' + account.id.slice(-4)}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold tracking-tight">${account.balance.toLocaleString()}</span>
              <span className="text-xs text-gray-400 font-medium">{account.currency_code}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountList;


'use client';

import React, { useState, useEffect } from 'react';
import { SaltEdgeTransaction } from '../types';
import { saltedgeService } from '../services/saltedgeService';

// Define props for TransactionList
interface TransactionListProps {
  customerId?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ customerId }) => {
  const [transactions, setTransactions] = useState<SaltEdgeTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      // NOTE: Salt Edge transactions API usually requires a connection_id or account_id.
      // If customerId is provided, one would typically fetch connections first then transactions.
      // For this UI, we fetch the available transactions for the current context.
      const result = await saltedgeService.getTransactions();
      setTransactions(result.data);
    } catch (err: any) {
      setError(`Notice: Displaying simulated data ledger.`);
      setTransactions([
        {
          id: 'tx_1',
          amount: -1250.00,
          currency_code: 'USD',
          description: 'Office Rent - Manhattan Properties',
          made_on: new Date().toISOString().split('T')[0],
          status: 'posted',
          category: 'rent'
        },
        {
          id: 'tx_2',
          amount: 4500.20,
          currency_code: 'USD',
          description: 'Invoice #8892 - Client Payment',
          made_on: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          status: 'posted',
          category: 'income'
        },
        {
          id: 'tx_3',
          amount: -45.50,
          currency_code: 'USD',
          description: 'Starbucks Coffee - Downtown',
          made_on: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          status: 'pending',
          category: 'food'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when customerId changes
  useEffect(() => {
    fetchTransactions();
  }, [customerId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Transaction Ledger</h3>
          <p className="text-sm text-gray-500">Global Financial History</p>
        </div>
        <button onClick={fetchTransactions} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
          <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`}></i> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center gap-3 text-indigo-800 text-sm">
          <i className="fas fa-info-circle"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="text-sm font-medium text-gray-500">{tx.made_on}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {tx.description}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 uppercase mt-0.5">{tx.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200">
                      {tx.category}
                    </span>
                  </td>
                  <td className={`px-8 py-5 text-right font-bold tabular-nums ${tx.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;

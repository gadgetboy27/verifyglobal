'use client';

import React, { useState, useEffect } from 'react';
import { SaltEdgeCustomer } from '../types';
import { saltedgeService } from '../services/saltedgeService';

interface CustomerManagerProps {
  activeCustomer: SaltEdgeCustomer | null;
  onSelectCustomer: (customer: SaltEdgeCustomer | null) => void;
  onViewChange?: (view: any) => void;
}

const CustomerManager: React.FC<CustomerManagerProps> = ({ activeCustomer, onSelectCustomer, onViewChange }) => {
  const [customers, setCustomers] = useState<SaltEdgeCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [newIdentifier, setNewIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await saltedgeService.getCustomers();
      setCustomers(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdentifier || loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await saltedgeService.createCustomer(newIdentifier);
      setNewIdentifier('');
      onSelectCustomer(response.data);
      await fetchCustomers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      {/* Contextual Action Banner */}
      {activeCustomer && (
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-500">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <i className="fas fa-arrow-right text-2xl"></i>
            </div>
            <div>
              <h4 className="text-lg font-black tracking-tight">Step 1 Complete: User Provisioned</h4>
              <p className="text-indigo-100 text-sm opacity-90">Ready to link a financial institution to <strong>{activeCustomer.identifier}</strong></p>
            </div>
          </div>
          <button 
            onClick={() => onViewChange?.('dashboard')}
            className="px-8 py-3 bg-white text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-lg whitespace-nowrap"
          >
            Go to Dashboard to Link Bank
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 sticky top-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                <i className="fas fa-plus"></i>
              </div>
              <h3 className="text-xl font-black text-slate-900">Provision Entity</h3>
            </div>
            <p className="text-xs font-medium text-slate-400 mb-8 leading-relaxed uppercase tracking-wider">
              Salt Edge requires a unique identifier for every customer. We recommend using a unique email or system UUID.
            </p>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Customer Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. client_9901@verifyglobal.com"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900"
                  value={newIdentifier}
                  onChange={(e) => setNewIdentifier(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !newIdentifier}
                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                {loading ? <i className="fas fa-circle-notch animate-spin"></i> : <><i className="fas fa-bolt"></i> Register New Customer</>}
              </button>
            </form>

            {error && (
              <div className="mt-8 p-6 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-3 text-rose-600 font-black text-xs uppercase tracking-widest">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>Diagnostic Error</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-rose-100 text-[11px] font-mono text-rose-800 break-all whitespace-pre-wrap leading-relaxed">
                  {error}
                </div>
                {error.includes('non-JSON') && (
                   <p className="text-[10px] text-rose-500 font-bold italic">
                     Note: The API is returning HTML instead of JSON. This usually means a 404 on the API route or your environment is blocking the request. Check your .env.local keys.
                   </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="text-xl font-black text-slate-900">Entity Registry</h3>
                <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">Last 50 Provisioned Users</p>
              </div>
              <button onClick={fetchCustomers} className="w-12 h-12 rounded-2xl hover:bg-white hover:shadow-md border border-slate-200 transition-all text-slate-400 hover:text-indigo-600">
                <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`}></i>
              </button>
            </div>
            
            <div className="divide-y divide-slate-50">
              {customers.length === 0 && !loading ? (
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-users-slash text-2xl text-slate-200"></i>
                  </div>
                  <p className="text-sm font-bold text-slate-400">No Customers Found on Salt Edge</p>
                </div>
              ) : (
                customers.map((customer) => (
                  <div key={customer.id} className={`p-6 flex items-center justify-between transition-all ${activeCustomer?.id === customer.id ? 'bg-indigo-50/40' : 'hover:bg-slate-50/50'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${activeCustomer?.id === customer.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                        {customer.identifier.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-black text-slate-900">{customer.identifier}</span>
                           {activeCustomer?.id === customer.id && <span className="px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black uppercase rounded tracking-widest">Active</span>}
                        </div>
                        <code className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{customer.id}</code>
                      </div>
                    </div>
                    <button 
                      onClick={() => onSelectCustomer(customer)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                        activeCustomer?.id === customer.id 
                        ? 'bg-emerald-500 text-white shadow-lg' 
                        : 'border border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600'
                      }`}
                    >
                      {activeCustomer?.id === customer.id ? 'Context Selected' : 'Use This Identity'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerManager;
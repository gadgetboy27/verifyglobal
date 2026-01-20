
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { saltedgeService, setDemoMode, getDemoMode } from '../services/saltedgeService';
import { SaltEdgeCustomer } from '../types';

interface DashboardProps {
  activeCustomer: SaltEdgeCustomer | null;
  onCustomerChange: (customer: SaltEdgeCustomer | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ activeCustomer, onCustomerChange }) => {
  const [step, setStep] = useState(activeCustomer ? 2 : 1);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [demo, setDemo] = useState(getDemoMode());
  const [stats, setStats] = useState({ customers: 0, accounts: 0 });
  const logEndRef = useRef<HTMLDivElement>(null);

  const loadStats = async () => {
    try {
      const customersRes = await saltedgeService.getCustomers();
      const accountsRes = await saltedgeService.getAccounts();
      setStats({
        customers: customersRes.data?.length || 0,
        accounts: accountsRes.data?.length || 0
      });
    } catch (err) {
      console.warn("Stats background fetch failed, likely waiting for proxy rotation.");
    }
  };

  useEffect(() => {
    loadStats();
    if (activeCustomer && step < 2) setStep(2);
    if (!activeCustomer && step > 1) setStep(1);
  }, [activeCustomer]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const toggleDemo = () => {
    const newVal = !demo;
    setDemo(newVal);
    setDemoMode(newVal);
  };

  const addLog = (type: string, data: any, method?: string, url?: string, explanation?: string) => {
    setLogs(prev => [{
      type,
      timestamp: new Date().toLocaleTimeString(),
      method,
      url,
      data,
      explanation
    }, ...prev]);
  };

  const handleCreateCustomer = async () => {
    setLoading(true);
    setStatusMsg('PROVISIONING');
    const identifier = `user_${Math.floor(Math.random() * 9999)}@verifyglobal.com`;
    
    try {
      const response = await saltedgeService.createCustomer(identifier);
      onCustomerChange(response.data);
      addLog('response', response, 'POST', '/customers', 'Customer provisioned successfully.');
      setStep(2);
      loadStats();
    } catch (err: any) {
      addLog('error', { error: err.message });
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  const handleConnectBank = async () => {
    if (!activeCustomer?.id) return;
    setLoading(true);
    setStatusMsg('HANDSHAKE');
    try {
      const response = await saltedgeService.createConnectSession(activeCustomer.id);
      addLog('response', response, 'POST', '/connect_sessions/create', 'Connection URL generated.');
      if (response.data.connect_url) {
        window.open(response.data.connect_url, '_blank');
      }
    } catch (err: any) {
      addLog('error', { error: err.message });
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
            <i className="fas fa-users"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customers</p>
            <p className="text-2xl font-black text-slate-900">{stats.customers}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
            <i className="fas fa-university"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accounts</p>
            <p className="text-2xl font-black text-slate-900">{stats.accounts}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${demo ? 'bg-amber-500' : 'bg-slate-900'}`}>
            <i className={`fas ${demo ? 'fa-ghost' : 'fa-bolt'}`}></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
            <p className="text-sm font-black text-slate-900 uppercase">{demo ? 'Demo Mode' : 'Live Pipeline'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Integration Flow</h3>
             <div className="space-y-4">
               <button 
                 onClick={handleCreateCustomer} 
                 disabled={loading || !!activeCustomer} 
                 className={`w-full p-6 rounded-3xl text-left border-2 transition-all flex items-center gap-5 ${
                   !activeCustomer ? 'border-indigo-600 bg-indigo-50/50' : 'border-emerald-100 bg-emerald-50/10'
                 }`}
               >
                 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-lg ${
                   activeCustomer ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'
                 }`}>
                   {activeCustomer ? <i className="fas fa-check"></i> : '01'}
                 </div>
                 <div>
                   <span className={`block font-black ${activeCustomer ? 'text-emerald-700' : 'text-slate-900'}`}>Provision User</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phase 1</span>
                 </div>
               </button>

               <button 
                 onClick={handleConnectBank} 
                 disabled={loading || step !== 2} 
                 className={`w-full p-6 rounded-3xl text-left border-2 transition-all flex items-center gap-5 ${
                   step === 2 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-50 bg-slate-50/50 opacity-40'
                 }`}
               >
                 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-lg ${
                   step === 2 ? 'bg-white text-indigo-600' : 'bg-slate-200 text-slate-400'
                 }`}>
                   02
                 </div>
                 <div>
                   <span className="block font-black">Link Bank</span>
                   <span className={`text-[10px] font-bold uppercase tracking-widest ${step === 2 ? 'text-indigo-100' : 'text-slate-400'}`}>Phase 2</span>
                 </div>
               </button>
             </div>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Environment Control</h4>
             <button onClick={toggleDemo} className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                Switch to {demo ? 'API Pipeline' : 'Local Sandbox'}
             </button>
          </div>
        </div>

        <div className="lg:col-span-8 bg-slate-950 rounded-[2.5rem] border border-slate-800 h-[500px] flex flex-col shadow-2xl overflow-hidden">
          <div className="px-8 py-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live API Telemetry</span>
            {loading && <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>}
          </div>
          <div className="flex-1 overflow-y-auto p-8 font-mono text-[11px] text-indigo-300">
            {logs.length === 0 ? (
              <p className="text-slate-700 text-center mt-20 italic">Awaiting API traffic...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-6 border-l-2 border-slate-800 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-black uppercase ${log.type === 'error' ? 'text-rose-500' : 'text-emerald-500'}`}>{log.type}</span>
                    <span className="text-slate-600 text-[9px]">{log.timestamp}</span>
                    {log.method && <span className="text-white font-bold">{log.method} {log.url}</span>}
                  </div>
                  {log.explanation && <p className="text-slate-400 mb-2 italic">{log.explanation}</p>}
                  <pre className="whitespace-pre-wrap opacity-80 bg-black/20 p-3 rounded-lg border border-white/5">{JSON.stringify(log.data, null, 2)}</pre>
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

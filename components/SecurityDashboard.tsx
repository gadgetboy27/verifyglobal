'use client';

import React, { useState, useEffect } from 'react';
import { saltedgeService, getApiCredentials, PROXIES, getActiveProxy, setActiveProxy, getConnectionStatus } from '../services/saltedgeService';

const SecurityDashboard: React.FC = () => {
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; trace?: string; errorClass?: string } | null>(null);
  const [currentProxy, setCurrentProxy] = useState(getActiveProxy());
  const [status, setStatus] = useState(getConnectionStatus());
  
  const [appId, setAppId] = useState('');
  const [secret, setSecret] = useState('');

  useEffect(() => {
    const creds = getApiCredentials();
    setAppId(creds.appId);
    setSecret(creds.secret);
    refreshStatus();
    const int = setInterval(() => setStatus(getConnectionStatus()), 1000);
    return () => clearInterval(int);
  }, []);

  const refreshStatus = async () => {
    const status = await saltedgeService.getStatus();
    setConfigStatus(status);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('vglobal_app_id', appId.trim());
    localStorage.setItem('vglobal_secret', secret.trim());
    setTestResult({ success: true, message: 'VAULT_SYNC_OK', trace: 'API credentials cached in local browser storage.' });
    refreshStatus();
  };

  const handleProxyChange = (key: string) => {
    setCurrentProxy(key);
    setActiveProxy(key);
    setTestResult({ success: true, message: 'PIPELINE_ROUTED', trace: `Global traffic forced through ${key}.` });
  };

  const handleDeepTest = async () => {
    setTestResult(null);
    setLoading(true);
    try {
      await saltedgeService.testConnection();
      const updatedStatus = getConnectionStatus();
      setTestResult({ 
        success: updatedStatus !== 'shadow', 
        message: updatedStatus === 'shadow' ? 'PIPELINE_OBSTRUCTED' : 'HANDSHAKE_VERIFIED',
        trace: updatedStatus === 'shadow' 
          ? "The automatic rotation failed. All available tunnels are blocked by CORS policies or proxy provider restrictions." 
          : `Secure link established via ${getActiveProxy()}. Data integrity verified.`
      });
      refreshStatus();
    } catch (err: any) {
      const isAuthError = err.message.includes('[') && err.message.includes(']');
      const isPaywall = err.message.includes('PROXY_PAYWALL') || err.message.toLowerCase().includes('plan');
      
      setTestResult({ 
        success: false, 
        message: isAuthError ? 'API_REJECTION' : isPaywall ? 'RELAY_BLOCKED' : 'NETWORK_ERROR', 
        trace: err.message,
        errorClass: isAuthError ? 'AUTH' : isPaywall ? 'PAYWALL' : 'CORS'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl border border-slate-700 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
          <div className="flex items-center gap-8">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all ${
              status === 'shadow' ? 'bg-amber-600 animate-pulse' : 
              status === 'error' ? 'bg-rose-600' : 'bg-indigo-600'
            }`}>
              <i className={`fas ${status === 'shadow' ? 'fa-user-secret' : status === 'error' ? 'fa-ban' : 'fa-wave-square'} text-3xl`}></i>
            </div>
            <div>
              <h3 className="text-4xl font-black tracking-tight mb-2">Diagnostic Console</h3>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest flex items-center gap-3">
                Current Health: 
                <span className={status === 'shadow' ? "text-amber-400" : status === 'error' ? "text-rose-400" : "text-emerald-400"}>
                  {status === 'shadow' ? 'Shadow Mode Engaged (Simulated Data)' : status === 'error' ? 'Critical API Error' : 'Pipeline Connection Active'}
                </span>
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleDeepTest}
            disabled={loading}
            className="px-8 py-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-all flex items-center gap-3 shadow-xl"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-satellite-dish"></i>}
            {loading ? 'Testing Handshake...' : 'Verify Global Link'}
          </button>
        </div>
        
        {testResult && (
          <div className={`mt-10 p-8 rounded-3xl border-2 font-mono text-[11px] leading-relaxed animate-in fade-in slide-in-from-top-4 ${
            testResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
             <div className="flex items-center gap-3 mb-4 font-black uppercase tracking-widest text-[10px]">
               <div className={`w-2 h-2 rounded-full ${testResult.success ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
               <span>DIAGNOSTIC_TRACE: {testResult.message}</span>
             </div>
             <div className="bg-black/30 p-4 rounded-xl mb-4 border border-white/5 break-all">
               {testResult.trace}
             </div>
             
             {testResult.errorClass === 'PAYWALL' && (
               <div className="p-4 bg-amber-500/20 rounded-xl text-amber-200 border border-amber-500/30 text-[10px]">
                 <strong className="block mb-1">RELAY ACCESS DENIED</strong>
                 A proxy in the rotation is requesting a paid subscription. The app has automatically removed <code>CORSPROXY_IO</code>. Ensure you select <strong>CODETABS</strong> or use the <strong>INTERNAL</strong> node.
               </div>
             )}
             
             {testResult.errorClass === 'AUTH' && (
               <div className="p-4 bg-rose-500/20 rounded-xl text-rose-100 border border-rose-500/30 text-[10px]">
                 <strong className="block mb-1">SALT EDGE REJECTION</strong>
                 The API keys provided in the vault were rejected by Salt Edge v6. Check for typos or expired trial periods.
               </div>
             )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
            <h4 className="text-2xl font-black text-slate-900 mb-2">Relay Selection</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Manual override for CORS-restricted environments</p>
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(PROXIES).map(([key, url]) => (
                <button
                  key={key}
                  onClick={() => handleProxyChange(key)}
                  className={`p-6 rounded-[1.5rem] text-left border-2 transition-all flex items-center justify-between group ${
                    currentProxy === key ? 'border-indigo-600 bg-indigo-50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${currentProxy === key ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'}`}>
                       <i className={`fas ${key === 'INTERNAL' ? 'fa-server' : key === 'CODETABS' ? 'fa-bridge' : 'fa-network-wired'}`}></i>
                    </div>
                    <div>
                      <span className="block font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{key}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {key === 'INTERNAL' ? 'Next.js API Routes (Recommended)' : 'Public CORS Relay'}
                      </span>
                    </div>
                  </div>
                  {currentProxy === key && <i className="fas fa-check-circle text-indigo-600 text-xl"></i>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
            <h4 className="text-2xl font-black text-slate-900 mb-2">Sync Vault</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Secure browser-only storage</p>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">App-ID</label>
                <input 
                  type="text" 
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none font-mono text-xs"
                  placeholder="X-SaltEdge-App-Id"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Secret</label>
                <input 
                  type="password" 
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none font-mono text-xs"
                  placeholder="X-SaltEdge-Secret"
                />
              </div>
              <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-3">
                <i className="fas fa-sync"></i>
                Synchronize Keys
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;

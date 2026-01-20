
import React, { useState, useEffect } from 'react';
import { ViewState, SaltEdgeCustomer } from '../types';
import { getConnectionStatus } from '../services/saltedgeService';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  onViewChange: (view: ViewState) => void;
  activeCustomer: SaltEdgeCustomer | null;
}

/**
 * Layout component for the Salt Edge Financial Hub.
 * Provides a persistent sidebar for navigation and context management.
 */
const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, activeCustomer }) => {
  const [status, setStatus] = useState(getConnectionStatus());

  // Periodically refresh the connection status from the service to update UI indicators
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getConnectionStatus());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const menuItems: { id: ViewState; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'customers', label: 'Customers', icon: 'fa-users-gear' },
    { id: 'accounts', label: 'Accounts', icon: 'fa-university' },
    { id: 'transactions', label: 'Transactions', icon: 'fa-exchange-alt' },
    { id: 'security', label: 'Security Vault', icon: 'fa-fingerprint' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-slate-900">
      {/* Mobile Header - Visible only on small screens */}
      <div className="md:hidden flex items-center justify-between p-6 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
            <i className="fas fa-bolt text-xs"></i>
          </div>
          <span className="font-black tracking-tight">VerifyGlobal</span>
        </div>
      </div>

      {/* Main Navigation Sidebar - Desktop Persistent */}
      <aside className="hidden md:flex flex-col w-80 bg-white border-r border-slate-200 shrink-0 h-screen sticky top-0">
        <div className="p-10 flex-1 overflow-y-auto">
          <div className="flex items-center gap-4 mb-14">
            <div className="w-12 h-12 bg-slate-950 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-slate-200">
              <i className="fas fa-bolt-lightning text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none">VerifyGlobal</h1>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Enterprise Hub</span>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full group flex items-center gap-4 px-6 py-4 rounded-2xl text-[13px] font-black transition-all duration-300 ${
                  activeView === item.id
                    ? 'bg-slate-950 text-white shadow-xl shadow-slate-200'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  activeView === item.id ? 'bg-indigo-500' : 'bg-slate-100 group-hover:bg-slate-200'
                }`}>
                  <i className={`fas ${item.icon} text-[10px]`}></i>
                </div>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer: Displays the current active context and system health status */}
        <div className="p-8 border-t border-slate-100 space-y-4">
          <div className={`p-6 rounded-[2rem] transition-all duration-500 ${
            activeCustomer ? 'bg-indigo-50/50 border border-indigo-100' : 'bg-slate-50 border border-slate-100'
          }`}>
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Active Session</h4>
            {activeCustomer ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
                  <i className="fas fa-user-check text-xs"></i>
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black text-slate-900 truncate">{activeCustomer.identifier}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Provisioned</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-slate-400 grayscale">
                <div className="w-10 h-10 bg-slate-200 rounded-2xl flex items-center justify-center shrink-0">
                  <i className="fas fa-user-slash text-xs"></i>
                </div>
                <p className="text-[11px] font-bold italic leading-tight">No entity selected</p>
              </div>
            )}
          </div>

          <div className="px-6 flex items-center justify-between">
             <div className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${
                 status === 'live' ? 'bg-emerald-500' : 
                 status === 'proxy' ? 'bg-indigo-500' : 
                 status === 'shadow' ? 'bg-amber-500' : 'bg-rose-500'
               }`}></div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pipeline: {status}</span>
             </div>
             <i className="fas fa-signal text-[10px] text-slate-200"></i>
          </div>
        </div>
      </aside>

      {/* Main scrollable content area */}
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="p-6 md:p-14 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

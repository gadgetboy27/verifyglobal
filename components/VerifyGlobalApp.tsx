
'use client';

import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import Dashboard from './Dashboard';
import CustomerManager from './CustomerManager';
import AccountList from './AccountList';
import TransactionList from './TransactionList';
import SecurityDashboard from './SecurityDashboard';
import { ViewState, SaltEdgeCustomer } from '../types';

/**
 * VerifyGlobalApp - Main Application Controller
 */
export default function VerifyGlobalApp() {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [activeCustomer, setActiveCustomer] = useState<SaltEdgeCustomer | null>(null);

  // Persistence: Restore last active customer from local storage
  useEffect(() => {
    const saved = localStorage.getItem('vglobal_active_customer');
    if (saved) {
      try {
        setActiveCustomer(JSON.parse(saved));
      } catch (e) {
        console.warn("Failed to parse saved customer context", e);
      }
    }
  }, []);

  const handleCustomerChange = (customer: SaltEdgeCustomer | null) => {
    setActiveCustomer(customer);
    if (customer) {
      localStorage.setItem('vglobal_active_customer', JSON.stringify(customer));
    } else {
      localStorage.removeItem('vglobal_active_customer');
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            activeCustomer={activeCustomer} 
            onCustomerChange={handleCustomerChange} 
          />
        );
      case 'customers':
        return (
          <CustomerManager 
            activeCustomer={activeCustomer} 
            onSelectCustomer={handleCustomerChange}
            onViewChange={setActiveView}
          />
        );
      case 'accounts':
        return (
          <AccountList 
            customerId={activeCustomer?.id} 
          />
        );
      case 'transactions':
        return (
          <TransactionList 
            customerId={activeCustomer?.id} 
          />
        );
      case 'security':
        return <SecurityDashboard />;
      default:
        return (
          <Dashboard 
            activeCustomer={activeCustomer} 
            onCustomerChange={handleCustomerChange} 
          />
        );
    }
  };

  return (
    <Layout 
      activeView={activeView} 
      onViewChange={setActiveView} 
      activeCustomer={activeCustomer}
    >
      <div className="animate-in fade-in duration-500">
        {renderContent()}
      </div>
    </Layout>
  );
}

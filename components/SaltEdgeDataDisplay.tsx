"use client";

import React, { useState, useEffect } from "react";
import { saltedgeService } from "../services/saltedgeService";

interface ApiResponse {
  status: "success" | "loading" | "error";
  data: any;
  timestamp: string;
  duration: number;
}

const SaltEdgeDataDisplay: React.FC = () => {
  const [customersData, setCustomersData] = useState<ApiResponse | null>(null);
  const [accountsData, setAccountsData] = useState<ApiResponse | null>(null);
  const [transactionsData, setTransactionsData] = useState<ApiResponse | null>(
    null,
  );
  const [connectionsData, setConnectionsData] = useState<ApiResponse | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<
    "customers" | "accounts" | "transactions" | "connections"
  >("customers");
  const [loading, setLoading] = useState(false);

  const fetchData = async (
    type: "customers" | "accounts" | "transactions" | "connections",
  ) => {
    const startTime = Date.now();
    const setterMap = {
      customers: setCustomersData,
      accounts: setAccountsData,
      transactions: setTransactionsData,
      connections: setConnectionsData,
    };

    const setter = setterMap[type];
    setter({
      status: "loading",
      data: null,
      timestamp: new Date().toISOString(),
      duration: 0,
    });

    try {
      let result;
      switch (type) {
        case "customers":
          result = await saltedgeService.getCustomers();
          break;
        case "accounts":
          result = await saltedgeService.getAccounts();
          break;
        case "transactions":
          result = await saltedgeService.getTransactions();
          break;
        case "connections":
          result = await saltedgeService.getConnections?.();
          break;
        default:
          result = null;
      }

      const duration = Date.now() - startTime;
      setter({
        status: "success",
        data: result,
        timestamp: new Date().toISOString(),
        duration,
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      setter({
        status: "error",
        data: { error: error.message },
        timestamp: new Date().toISOString(),
        duration,
      });
    }
  };

  useEffect(() => {
    // Load all data on mount
    fetchData("customers");
    fetchData("accounts");
    fetchData("connections");
  }, []);

  const renderData = (data: ApiResponse | null) => {
    if (!data) return null;

    if (data.status === "loading") {
      return (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin">⏳</div>
          <span className="ml-3 text-slate-500">Loading...</span>
        </div>
      );
    }

    if (data.status === "error") {
      return (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
          <p className="text-rose-800 font-semibold">Error</p>
          <pre className="text-rose-600 text-sm mt-2 overflow-auto max-h-96">
            {JSON.stringify(data.data, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-slate-600">Response Time</p>
            <p className="font-bold text-slate-900">{data.duration}ms</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-slate-600">Timestamp</p>
            <p className="font-bold text-slate-900 text-xs">
              {new Date(data.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="bg-slate-900 rounded-lg p-4 overflow-auto max-h-96">
          <pre className="text-indigo-300 text-xs font-mono whitespace-pre-wrap break-words">
            {JSON.stringify(data.data, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          Salt Edge API Data Inspector
        </h2>
        <p className="text-slate-600">
          Real-time request/response monitoring and data visualization
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto">
        {(
          ["customers", "accounts", "transactions", "connections"] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-all capitalize ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Data Display */}
      <div className="mb-6">
        {activeTab === "customers" && renderData(customersData)}
        {activeTab === "accounts" && renderData(accountsData)}
        {activeTab === "transactions" && renderData(transactionsData)}
        {activeTab === "connections" && renderData(connectionsData)}
      </div>

      {/* Refresh Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => fetchData(activeTab)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all"
        >
          Refresh {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </button>
        <button
          onClick={() => {
            fetchData("customers");
            fetchData("accounts");
            fetchData("connections");
          }}
          className="px-6 py-2 bg-slate-200 text-slate-900 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-slate-300 transition-all"
        >
          Refresh All
        </button>
      </div>

      {/* Status Indicators */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        {["customers", "accounts", "transactions", "connections"].map(
          (type) => {
            const dataMap = {
              customers: customersData,
              accounts: accountsData,
              transactions: transactionsData,
              connections: connectionsData,
            };
            const data = dataMap[type as keyof typeof dataMap];
            const statusColor = !data
              ? "bg-slate-100 text-slate-600"
              : data.status === "success"
                ? "bg-emerald-100 text-emerald-700"
                : data.status === "error"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-amber-100 text-amber-700";

            return (
              <div key={type} className={`p-4 rounded-lg ${statusColor}`}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 capitalize">
                  {type}
                </p>
                <p className="text-sm font-bold">
                  {data?.status === "success"
                    ? "✓ Ready"
                    : data?.status === "error"
                      ? "✗ Error"
                      : "⏳ Loading"}
                </p>
                {data?.duration && (
                  <p className="text-xs mt-1">{data.duration}ms</p>
                )}
              </div>
            );
          },
        )}
      </div>
    </div>
  );
};

export default SaltEdgeDataDisplay;

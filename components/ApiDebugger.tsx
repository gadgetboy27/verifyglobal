"use client";

import React, { useState, useEffect } from "react";
import { saltedgeService } from "../services/saltedgeService";

interface ApiCall {
  id: string;
  timestamp: Date;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  status: "pending" | "success" | "error";
  duration: number;
  request?: any;
  response?: any;
  error?: string;
}

const ApiDebugger: React.FC = () => {
  const [calls, setCalls] = useState<ApiCall[]>([]);
  const [selectedCall, setSelectedCall] = useState<ApiCall | null>(null);
  const [autoCapture, setAutoCapture] = useState(true);
  const [filter, setFilter] = useState<"all" | "success" | "error">("all");

  // Intercept API calls (this is a simplified version)
  const captureApiCall = (
    endpoint: string,
    method: "GET" | "POST" = "GET",
    request?: any,
  ) => {
    const call: ApiCall = {
      id: `call_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      endpoint,
      method,
      status: "pending",
      duration: 0,
      request,
    };

    setCalls((prev) => [call, ...prev].slice(0, 50)); // Keep last 50 calls
    return call.id;
  };

  const updateApiCall = (
    callId: string,
    response: any,
    duration: number,
    status: "success" | "error",
    error?: string,
  ) => {
    setCalls((prev) =>
      prev.map((call) =>
        call.id === callId
          ? { ...call, response, duration, status, error }
          : call,
      ),
    );
  };

  // Test endpoints
  const testEndpoint = async (
    endpoint: string,
    method: "GET" | "POST" = "GET",
    data?: any,
  ) => {
    if (!autoCapture) return;

    const callId = captureApiCall(endpoint, method, data);
    const startTime = Date.now();

    try {
      let response;
      if (endpoint === "/customers" && method === "POST") {
        response = await saltedgeService.createCustomer(
          data?.identifier || `user_${Date.now()}@test.com`,
        );
      } else if (endpoint === "/customers") {
        response = await saltedgeService.getCustomers();
      } else if (endpoint === "/accounts") {
        response = await saltedgeService.getAccounts(data?.customer_id);
      } else if (endpoint === "/connections") {
        response = await saltedgeService.getConnections(data?.customer_id);
      } else if (endpoint === "/transactions") {
        response = await saltedgeService.getTransactions(data?.connection_id);
      }

      const duration = Date.now() - startTime;
      updateApiCall(callId, response, duration, "success");
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateApiCall(callId, null, duration, "error", error.message);
    }
  };

  const filteredCalls = calls.filter((call) => {
    if (filter === "success") return call.status === "success";
    if (filter === "error") return call.status === "error";
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          API Call Debugger
        </h2>
        <p className="text-slate-600">
          Monitor all API requests and responses in real-time
        </p>
      </div>

      {/* Controls */}
      <div className="bg-slate-50 rounded-lg p-6 mb-8 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoCapture"
              checked={autoCapture}
              onChange={(e) => setAutoCapture(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <label
              htmlFor="autoCapture"
              className="text-sm font-semibold text-slate-700"
            >
              Auto-capture API calls
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCalls([])}
              className="px-4 py-2 bg-slate-300 text-slate-900 rounded-lg text-xs font-bold uppercase hover:bg-slate-400 transition-all"
            >
              Clear Log
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-t border-slate-200 pt-4">
          {["all", "success", "error"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                filter === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} (
              {
                calls.filter((c) => (tab === "all" ? true : c.status === tab))
                  .length
              }
              )
            </button>
          ))}
        </div>
      </div>

      {/* Quick Test Buttons */}
      <div className="mb-8">
        <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest mb-4">
          Quick Tests
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <button
            onClick={() => testEndpoint("/customers")}
            className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-200 transition-all"
          >
            Get Customers
          </button>
          <button
            onClick={() => testEndpoint("/customers", "POST")}
            className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-all"
          >
            Create Customer
          </button>
          <button
            onClick={() => testEndpoint("/accounts")}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition-all"
          >
            Get Accounts
          </button>
          <button
            onClick={() => testEndpoint("/connections")}
            className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200 transition-all"
          >
            Get Connections
          </button>
          <button
            onClick={() => testEndpoint("/transactions")}
            className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200 transition-all"
          >
            Get Transactions
          </button>
        </div>
      </div>

      {/* Call List */}
      <div className="space-y-2 mb-8">
        <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">
          API Calls ({filteredCalls.length})
        </h3>
        <div className="max-h-96 overflow-y-auto space-y-2 bg-slate-50 rounded-lg p-4">
          {filteredCalls.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              No API calls yet. Click a quick test button or make an API call.
            </p>
          ) : (
            filteredCalls.map((call) => (
              <button
                key={call.id}
                onClick={() => setSelectedCall(call)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedCall?.id === call.id
                    ? "border-indigo-600 bg-indigo-50"
                    : call.status === "success"
                      ? "border-emerald-200 bg-emerald-50 hover:border-emerald-400"
                      : call.status === "error"
                        ? "border-rose-200 bg-rose-50 hover:border-rose-400"
                        : "border-amber-200 bg-amber-50 hover:border-amber-400"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        call.status === "success"
                          ? "bg-emerald-500"
                          : call.status === "error"
                            ? "bg-rose-500"
                            : "bg-amber-500"
                      }`}
                    />
                    <span className="text-xs font-bold bg-slate-900 text-white px-2 py-1 rounded text-slate-100">
                      {call.method}
                    </span>
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {call.endpoint}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-slate-600">
                      {call.duration}ms
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {call.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Selected Call Details */}
      {selectedCall && (
        <div className="border-t-2 border-slate-200 pt-8">
          <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest mb-4">
            Call Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Endpoint
              </p>
              <p className="font-mono text-sm text-slate-900">
                {selectedCall.method} {selectedCall.endpoint}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Status
              </p>
              <p
                className={`font-bold text-sm capitalize ${
                  selectedCall.status === "success"
                    ? "text-emerald-600"
                    : selectedCall.status === "error"
                      ? "text-rose-600"
                      : "text-amber-600"
                }`}
              >
                {selectedCall.status}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Duration
              </p>
              <p className="font-mono text-sm text-slate-900">
                {selectedCall.duration}ms
              </p>
            </div>
          </div>

          {/* Request/Response */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {selectedCall.request && (
              <div>
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
                  Request
                </h4>
                <pre className="bg-slate-900 text-indigo-300 p-4 rounded-lg overflow-auto max-h-96 text-[11px] font-mono whitespace-pre-wrap break-words">
                  {JSON.stringify(selectedCall.request, null, 2)}
                </pre>
              </div>
            )}
            {selectedCall.response && (
              <div>
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
                  Response
                </h4>
                <pre className="bg-slate-900 text-emerald-300 p-4 rounded-lg overflow-auto max-h-96 text-[11px] font-mono whitespace-pre-wrap break-words">
                  {JSON.stringify(selectedCall.response, null, 2)}
                </pre>
              </div>
            )}
            {selectedCall.error && (
              <div className="lg:col-span-2">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">
                  Error
                </h4>
                <pre className="bg-rose-900 text-rose-300 p-4 rounded-lg text-[11px] font-mono whitespace-pre-wrap break-words">
                  {selectedCall.error}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiDebugger;

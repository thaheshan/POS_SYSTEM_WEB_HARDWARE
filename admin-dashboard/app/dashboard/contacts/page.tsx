"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Loader2, Mail, Phone, Building2, CheckCircle2, Circle } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  status: "NEW" | "READ" | "REPLIED";
  createdAt: string;
}

export default function ContactsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchMessages = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/contacts", { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch contact messages");
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load contact messages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: "READ" | "REPLIED" | "NEW") => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/contacts/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      setMessages(messages.map(m => m.id === id ? { ...m, status: newStatus } : m));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
        <p className="text-gray-500 font-medium">Loading contact messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
        <MessageSquare className="w-5 h-5" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-500 text-sm mt-1">Review and manage incoming inquiries from the marketing page.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No contact messages found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
                  <th className="px-6 py-4">Contact Details</th>
                  <th className="px-6 py-4">Message</th>
                  <th className="px-6 py-4">Received On</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{msg.name}</span>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                          <Mail className="w-3.5 h-3.5" /> {msg.email}
                        </div>
                        {msg.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                            <Phone className="w-3.5 h-3.5" /> {msg.phone}
                          </div>
                        )}
                        {msg.company && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                            <Building2 className="w-3.5 h-3.5" /> {msg.company}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap max-w-md">
                        {msg.message}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-widest ${
                        msg.status === 'NEW' ? 'bg-blue-50 text-blue-700' :
                        msg.status === 'READ' ? 'bg-gray-100 text-gray-700' :
                        'bg-emerald-50 text-emerald-700'
                      }`}>
                        {msg.status === 'NEW' && <Circle className="w-3 h-3 fill-blue-500 text-blue-500" />}
                        {msg.status === 'READ' && <Circle className="w-3 h-3" />}
                        {msg.status === 'REPLIED' && <CheckCircle2 className="w-3 h-3" />}
                        {msg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        {msg.status === 'NEW' && (
                          <button
                            onClick={() => handleUpdateStatus(msg.id, 'READ')}
                            disabled={actionLoading === msg.id}
                            className="text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading === msg.id ? 'Updating...' : 'Mark Read'}
                          </button>
                        )}
                        {msg.status !== 'REPLIED' && (
                          <button
                            onClick={() => handleUpdateStatus(msg.id, 'REPLIED')}
                            disabled={actionLoading === msg.id}
                            className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            Mark Replied
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

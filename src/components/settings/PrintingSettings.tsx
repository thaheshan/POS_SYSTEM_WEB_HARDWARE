'use client';

import { Printer, Edit2, Terminal, Loader2, Save, X, Wifi, WifiOff, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { shopApi } from '@/api/shop';
import toast from 'react-hot-toast';
import { getConfiguredAgentUrl, setConfiguredAgentUrl } from '@/utils/hardwareIntegration';

interface Props {
  setHasUnsavedChanges: (val: boolean) => void;
}

export default function PrintingSettings({ setHasUnsavedChanges }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Print Agent (Hardware) State ──
  const [agentUrl, setAgentUrl] = useState('');
  const [agentUrlInput, setAgentUrlInput] = useState('');
  const [agentStatus, setAgentStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle');
  const [agentInfo, setAgentInfo] = useState<any>(null);

  const [settings, setSettings] = useState<Record<string, any>>({});
  const [form, setForm] = useState({
    setting_print_logo: true,
    setting_print_auto: true,
    setting_print_footer: 'Thank you for shopping with us! Goods sold are not returnable.',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await shopApi.getSettings();
        setSettings(data);
        setForm({
          setting_print_logo: data.setting_print_logo ?? true,
          setting_print_auto: data.setting_print_auto ?? true,
          setting_print_footer: data.setting_print_footer ?? 'Thank you for shopping with us! Goods sold are not returnable.',
        });
      } catch (err) {
        toast.error('Failed to load printing settings');
      } finally {
        setIsLoading(false);
      }
    };
    load();

    // Load saved agent URL from localStorage
    const saved = getConfiguredAgentUrl();
    setAgentUrl(saved);
    setAgentUrlInput(saved);
  }, []);

  // ── Agent connection test ──
  const testAgentConnection = async (url?: string) => {
    const target = (url ?? agentUrlInput).replace(/\/$/, '');
    setAgentStatus('checking');
    setAgentInfo(null);
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(`${target}/status`, { signal: ctrl.signal });
      if (res.ok) {
        const info = await res.json();
        setAgentStatus('online');
        setAgentInfo(info);
        toast.success(`✅ Agent online! Printer: ${info.printer || 'Unknown'}`);
      } else {
        setAgentStatus('offline');
        toast.error(`Agent responded with ${res.status}`);
      }
    } catch {
      setAgentStatus('offline');
      toast.error('Could not reach print agent. Check IP and that agent is running.');
    }
  };

  const saveAgentUrl = () => {
    const trimmed = agentUrlInput.trim().replace(/\/$/, '');
    if (!trimmed.startsWith('http')) {
      toast.error('URL must start with http:// or https://');
      return;
    }
    setConfiguredAgentUrl(trimmed);
    setAgentUrl(trimmed);
    toast.success('Print agent URL saved!');
    testAgentConnection(trimmed);
  };

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await shopApi.updateSettings(form);
      setSettings(prev => ({ ...prev, ...form }));
      toast.success('Printing configuration saved!');
      setIsEditing(false);
      setHasUnsavedChanges(false);
    } catch (err) {
      toast.error('Failed to save printing configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      setting_print_logo: settings.setting_print_logo ?? true,
      setting_print_auto: settings.setting_print_auto ?? true,
      setting_print_footer: settings.setting_print_footer ?? 'Thank you for shopping with us! Goods sold are not returnable.',
    });
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-16 flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── HARDWARE: Print Agent URL ── */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gradient-to-r from-slate-50 to-blue-50/40">
          <div className="w-12 h-12 bg-blue-100 rounded-[12px] flex items-center justify-center border border-blue-200">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-[18px] font-black tracking-tight text-gray-900">Hardware — Print Agent</h2>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">
              Connect to the local print agent running on the till PC for cash drawer & thermal printing
            </p>
          </div>
        </div>

        <div className="p-8 space-y-6">

          {/* Agent URL Input */}
          <div>
            <label className="block text-[13px] font-black text-gray-900 mb-1">
              Print Agent URL
            </label>
            <p className="text-[11px] font-bold text-gray-400 mb-3">
              Set to <code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-700 font-mono">http://localhost:9100</code> if the POS is opened <strong>on the till PC</strong>.
              If using a tablet / phone on the same WiFi, enter the till PC&apos;s LAN IP instead — e.g.{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-700 font-mono">http://192.168.1.105:9100</code>
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={agentUrlInput}
                onChange={(e) => setAgentUrlInput(e.target.value)}
                placeholder="http://localhost:9100"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-mono font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
              <button
                onClick={saveAgentUrl}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[12px] font-black transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" /> Save & Test
              </button>
            </div>

            {/* How to find LAN IP */}
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] font-bold text-amber-800">
              <strong>💡 How to find the till PC&apos;s IP:</strong> On the till PC, open Command Prompt and run{' '}
              <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">ipconfig</code>. Look for{' '}
              <em>IPv4 Address</em> (usually starts with 192.168.x.x). Use that IP in the URL above.
            </div>
          </div>

          {/* Agent Status */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-black text-gray-900">Agent Status</span>
              <button
                onClick={() => testAgentConnection()}
                disabled={agentStatus === 'checking'}
                className="text-[11px] font-bold text-blue-600 hover:underline disabled:opacity-50 flex items-center gap-1"
              >
                {agentStatus === 'checking' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wifi className="w-3 h-3" />}
                Test Connection
              </button>
            </div>

            <div className={`rounded-xl p-4 border flex items-start gap-3 ${
              agentStatus === 'online'  ? 'bg-emerald-50 border-emerald-200' :
              agentStatus === 'offline' ? 'bg-red-50 border-red-200' :
              agentStatus === 'checking' ? 'bg-blue-50 border-blue-200' :
              'bg-gray-50 border-gray-200'
            }`}>
              {agentStatus === 'online'  && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
              {agentStatus === 'offline' && <WifiOff className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
              {agentStatus === 'checking' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0 mt-0.5" />}
              {agentStatus === 'idle'    && <AlertCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />}

              <div className="flex-1 min-w-0">
                {agentStatus === 'idle' && (
                  <>
                    <p className="text-[13px] font-black text-gray-600">Not tested yet</p>
                    <p className="text-[11px] font-bold text-gray-400 mt-0.5">Click &ldquo;Test Connection&rdquo; or &ldquo;Save &amp; Test&rdquo; to check if the agent is reachable.</p>
                  </>
                )}
                {agentStatus === 'checking' && (
                  <p className="text-[13px] font-black text-blue-700">Connecting to {agentUrlInput}…</p>
                )}
                {agentStatus === 'online' && agentInfo && (
                  <>
                    <p className="text-[13px] font-black text-emerald-700">Agent Online ✓</p>
                    <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] font-bold text-emerald-800">
                      <span>Printer: <span className="font-mono">{agentInfo.printer}</span></span>
                      <span>Host: <span className="font-mono">{agentInfo.hostname}</span></span>
                      <span>Platform: <span className="font-mono">{agentInfo.platform}</span></span>
                    </div>
                  </>
                )}
                {agentStatus === 'offline' && (
                  <>
                    <p className="text-[13px] font-black text-red-700">Agent Unreachable</p>
                    <p className="text-[11px] font-bold text-red-500 mt-0.5">
                      Make sure <strong>START_AGENT.bat</strong> is running on the till PC and the IP/port is correct.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick setup instructions */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-[12px] font-black text-slate-700 mb-2">📋 Quick Setup — Till PC</p>
            <ol className="text-[11px] font-bold text-slate-600 space-y-1 list-decimal list-inside">
              <li>Copy the <strong>POS_PRINT_AGENT</strong> folder to the till PC</li>
              <li>Run <code className="bg-slate-200 px-1 rounded font-mono">wmic printer get name</code> to find your printer name</li>
              <li>Edit <code className="bg-slate-200 px-1 rounded font-mono">agent.js</code> line 36 — set <code className="font-mono">PRINTER_NAME</code></li>
              <li>Double-click <strong>START_AGENT.bat</strong> — keep it open all day</li>
              <li>Set the agent URL above and click <strong>Save &amp; Test</strong></li>
            </ol>
          </div>
        </div>
      </div>

      {/* ── RECEIPT SETTINGS ── */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fffbeb]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-[12px] flex items-center justify-center border border-amber-200">
              <Printer className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-[18px] font-black tracking-tight text-gray-900">Printing & Receipts</h2>
              <p className="text-[12px] font-bold text-gray-400 mt-0.5">
                Setup POS thermal printers, receipt formats, and printing rules
              </p>
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 border border-amber-200 px-4 py-2 rounded-[10px] text-[12px] font-bold text-amber-700 hover:bg-amber-50 transition-colors bg-white"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Settings
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-[10px] text-[12px] font-bold text-gray-500 hover:bg-gray-50 transition-colors bg-white"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#d97706] text-white px-4 py-2 rounded-[10px] text-[12px] font-bold hover:bg-amber-700 transition-colors disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="p-8">
          <h3 className="text-[16px] font-black text-gray-900 mb-4">Receipt Formatting</h3>
          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 bg-gray-50 border rounded-xl ${isEditing ? 'border-amber-200' : 'border-gray-100'}`}>
              <div>
                <h4 className="text-[13px] font-black text-gray-900">Print Logo on Receipt</h4>
                <p className="text-[11px] font-bold text-gray-500">Prints the shop logo at the top of the thermal receipt</p>
              </div>
              <label className={`relative inline-flex items-center ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}>
                <input
                  type="checkbox"
                  checked={!!form.setting_print_logo}
                  disabled={!isEditing}
                  onChange={(e) => handleChange('setting_print_logo', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            <div className={`flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 border rounded-xl gap-4 ${isEditing ? 'border-amber-200' : 'border-gray-100'}`}>
              <div>
                <h4 className="text-[13px] font-black text-gray-900">Custom Footer Text</h4>
                <p className="text-[11px] font-bold text-gray-500">Add a thank you note or return policy at the bottom</p>
              </div>
              <input
                type="text"
                value={form.setting_print_footer}
                disabled={!isEditing}
                onChange={(e) => handleChange('setting_print_footer', e.target.value)}
                className="w-full md:w-[350px] px-3 py-2 border border-gray-200 bg-white rounded-lg text-[12px] font-medium focus:border-amber-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            <div className={`flex items-center justify-between p-4 bg-gray-50 border rounded-xl ${isEditing ? 'border-amber-200' : 'border-gray-100'}`}>
              <div>
                <h4 className="text-[13px] font-black text-gray-900">Auto-print on Checkout</h4>
                <p className="text-[11px] font-bold text-gray-500">Automatically print receipt when a sale is completed</p>
              </div>
              <label className={`relative inline-flex items-center ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}>
                <input
                  type="checkbox"
                  checked={!!form.setting_print_auto}
                  disabled={!isEditing}
                  onChange={(e) => handleChange('setting_print_auto', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

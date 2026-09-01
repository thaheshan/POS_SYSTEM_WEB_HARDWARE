'use client';

import { Printer, Edit2, Terminal, Loader2, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { shopApi } from '@/api/shop';
import toast from 'react-hot-toast';

interface Props {
  setHasUnsavedChanges: (val: boolean) => void;
}

export default function PrintingSettings({ setHasUnsavedChanges }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
  }, []);

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
        <h3 className="text-[16px] font-black text-gray-900 mb-4">Connected Printers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="border-2 border-blue-500 bg-blue-50/30 rounded-[16px] p-5 relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-black uppercase">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
              </span>
            </div>
            <Printer className="w-8 h-8 text-blue-600 mb-3" />
            <h4 className="text-[15px] font-black text-gray-900">Epson TM-T82III</h4>
            <p className="text-[12px] font-bold text-gray-500 font-mono mt-1">192.168.1.100:9100</p>
            <p className="text-[11px] font-black text-blue-600 mt-3 uppercase tracking-wider">Default POS Printer (80mm)</p>
          </div>

          <div className="border border-gray-200 bg-gray-50 rounded-[16px] p-5 relative">
            <div className="absolute top-4 right-4">
              <span className="flex items-center gap-1.5 bg-gray-200 text-gray-600 px-2 py-1 rounded text-[10px] font-black uppercase">
                Offline
              </span>
            </div>
            <Terminal className="w-8 h-8 text-gray-400 mb-3" />
            <h4 className="text-[15px] font-black text-gray-900">Zebra ZD421</h4>
            <p className="text-[12px] font-bold text-gray-500 font-mono mt-1">USB Connection</p>
            <p className="text-[11px] font-black text-gray-500 mt-3 uppercase tracking-wider">Barcode Printer</p>
          </div>
        </div>

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
  );
}

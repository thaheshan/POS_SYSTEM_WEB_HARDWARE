'use client';

import { Receipt, ShieldCheck, Edit2, Info, Loader2, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { shopApi } from '@/api/shop';
import toast from 'react-hot-toast';

interface Props {
  setHasUnsavedChanges: (val: boolean) => void;
}

export default function TaxSettings({ setHasUnsavedChanges }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState<Record<string, any>>({});
  const [form, setForm] = useState({
    tax_vat_rate: '18',
    tax_threshold: '200000',
    tax_tin_number: 'TAX-ABC-123456',
    tax_vat_number: 'VAT-LK-987654',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await shopApi.getSettings();
        setSettings(data);
        setForm({
          tax_vat_rate: data.tax_vat_rate || '18',
          tax_threshold: data.tax_threshold || '200000',
          tax_tin_number: data.tax_tin_number || 'TAX-ABC-123456',
          tax_vat_number: data.tax_vat_number || 'VAT-LK-987654',
        });
      } catch (err) {
        toast.error('Failed to load tax settings');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await shopApi.updateSettings(form);
      setSettings(prev => ({ ...prev, ...form }));
      toast.success('Tax configuration saved!');
      setIsEditing(false);
      setHasUnsavedChanges(false);
    } catch (err) {
      toast.error('Failed to save tax configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      tax_vat_rate: settings.tax_vat_rate || '18',
      tax_threshold: settings.tax_threshold || '200000',
      tax_tin_number: settings.tax_tin_number || 'TAX-ABC-123456',
      tax_vat_number: settings.tax_vat_number || 'VAT-LK-987654',
    });
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-16 flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div id="tax-config" className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fafafa]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-[12px] flex items-center justify-center border border-purple-200">
            <Receipt className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-[18px] font-black tracking-tight text-gray-900">Tax Configuration (Sri Lanka)</h2>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">
              Configure IRD tax settings, VAT rate, and daily threshold amounts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-[#ecfdf5] text-[#059669] border border-green-200 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" /> IRD Compliant
          </span>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-[10px] text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition-colors bg-white"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Tax
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
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-[10px] text-[12px] font-bold hover:bg-purple-700 transition-colors disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* VAT Rate Block */}
        <div className="bg-gray-50 rounded-[20px] p-6 border border-gray-100 relative">
          <p className="text-[12px] font-black text-gray-600 mb-1">VAT Rate</p>
          <h3 className="text-[42px] font-black tracking-tighter text-[#1e40af] leading-none mb-2">{form.tax_vat_rate}%</h3>
          <p className="text-[11px] font-bold text-gray-400 mb-6">Standard Sri Lanka VAT rate per IRD guidelines</p>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-600">Update VAT Rate (%)</label>
            <input
              type="text"
              value={form.tax_vat_rate}
              disabled={!isEditing}
              onChange={(e) => handleChange('tax_vat_rate', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[14px] font-black outline-none focus:border-purple-500 transition-colors font-mono disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
        </div>

        {/* Tax Threshold Block */}
        <div className="bg-[#eff6ff] rounded-[20px] p-6 border border-blue-100 relative">
          <p className="text-[12px] font-black text-blue-800 mb-1">Daily Tax Threshold</p>
          <h3 className="text-[36px] font-black tracking-tighter text-[#2563eb] leading-none mb-2 mt-2">Rs. {Number(form.tax_threshold).toLocaleString()}</h3>
          <p className="text-[11px] font-bold text-blue-600 mb-6">Sales above this amount per day move to Category B</p>

          <div className="space-y-2 mb-4">
            <label className="text-[11px] font-black text-blue-800">Update Threshold (Rs.)</label>
            <input
              type="number"
              value={form.tax_threshold}
              disabled={!isEditing}
              onChange={(e) => handleChange('tax_threshold', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-blue-200 rounded-[12px] text-[14px] font-black outline-none focus:border-blue-500 transition-colors font-mono disabled:bg-blue-50/50 disabled:text-blue-400"
            />
          </div>

          <div className="bg-blue-100/50 rounded-xl p-3 flex items-start gap-3 border border-blue-200">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-blue-800 leading-tight">
              Regulated by IRD Sri Lanka. Change requires IRD authorization.
            </p>
          </div>
        </div>

        {/* TIN Input */}
        <div className="bg-gray-50 rounded-[20px] p-6 border border-gray-100">
          <p className="text-[12px] font-black text-gray-600 mb-1">Tax Identification Number (TIN)</p>
          <h4 className="text-[18px] font-black text-gray-900 tracking-wider mb-6">{form.tax_tin_number}</h4>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-600">Update TIN Number</label>
            <input
              type="text"
              value={form.tax_tin_number}
              disabled={!isEditing}
              onChange={(e) => handleChange('tax_tin_number', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-purple-500 transition-colors uppercase font-mono disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
        </div>

        {/* VAT Reg Input */}
        <div className="bg-gray-50 rounded-[20px] p-6 border border-gray-100">
          <p className="text-[12px] font-black text-gray-600 mb-1">VAT Registration Number</p>
          <h4 className="text-[18px] font-black text-gray-900 tracking-wider mb-6">{form.tax_vat_number}</h4>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-600">Update VAT Number</label>
            <input
              type="text"
              value={form.tax_vat_number}
              disabled={!isEditing}
              onChange={(e) => handleChange('tax_vat_number', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-purple-500 transition-colors uppercase font-mono disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

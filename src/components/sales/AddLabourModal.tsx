'use client';

import { X, User, Phone, Briefcase, Wrench, Settings, ChevronDown, CheckCircle, Save, Loader2 } from 'lucide-react';
import { useState } from 'react';
import api from '@/api/axiosInstance';

type ModalProps = {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
};

export default function AddLabourModal({ isOpen, onClose }: ModalProps) {
  const [entryType, setEntryType] = useState<'LABOUR' | 'INSTALLATION' | 'MISC'>('LABOUR');
  const [labourType, setLabourType] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [labourerName, setLabourerName] = useState('');
  const [labourerPhone, setLabourerPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!description.trim()) {
      setError('Please enter a description.');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await api.post('/expenses', {
        entryType,
        category: 'Category C',
        description: `${labourType ? labourType + ' - ' : ''}${description.trim()}`,
        amount: Number(amount),
        labourerName: labourerName || undefined,
        labourerPhone: labourerPhone || undefined,
      });
      // Reset fields
      setEntryType('LABOUR');
      setLabourType('');
      setDescription('');
      setAmount('');
      setLabourerName('');
      setLabourerPhone('');
      onClose(true); // trigger refresh
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[24px] w-full max-w-[500px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        
        {/* MODAL HEADER (AMBER) */}
        <div className="bg-[#a16207] p-6 text-white relative">
           <button 
             onClick={() => onClose(false)}
             className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
           >
             <X className="w-5 h-5" />
           </button>
           
           <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                 <Briefcase className="w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-[20px] font-black tracking-tight">Add Labour / Miscellaneous Entry</h2>
                 <p className="text-[13px] font-medium opacity-80">Record labour charges, installation fees, or other expenses</p>
              </div>
           </div>
        </div>

        {/* MODAL CONTENT */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
           
           {/* Entry Type */}
           <div>
              <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] block mb-3">Entry Type</label>
              <div className="grid grid-cols-3 gap-3">
                 <button 
                    onClick={() => setEntryType('LABOUR')}
                    className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                       entryType === 'LABOUR' ? 'bg-red-50 border-red-500 shadow-sm' : 'bg-white border-gray-100 opacity-60'
                    }`}
                 >
                    <div className={`p-2 rounded-lg ${entryType === 'LABOUR' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                       <Wrench className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col mt-1">
                       <span className={`text-[12px] font-black uppercase tracking-tight ${entryType === 'LABOUR' ? 'text-red-900' : 'text-gray-400'}`}>Labour</span>
                       <span className="text-[10px] font-bold text-gray-400">Plumbing, electrical</span>
                    </div>
                 </button>
                 <button 
                    onClick={() => setEntryType('INSTALLATION')}
                    className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                       entryType === 'INSTALLATION' ? 'bg-amber-50 border-amber-500 shadow-sm' : 'bg-white border-gray-100 opacity-60'
                    }`}
                 >
                    <div className={`p-2 rounded-lg ${entryType === 'INSTALLATION' ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                       <Settings className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col mt-1">
                       <span className={`text-[12px] font-black uppercase tracking-tight ${entryType === 'INSTALLATION' ? 'text-amber-900' : 'text-gray-400'}`}>Installation</span>
                       <span className="text-[10px] font-bold text-gray-400">Setup & install</span>
                    </div>
                 </button>
                 <button 
                    onClick={() => setEntryType('MISC')}
                    className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                       entryType === 'MISC' ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white border-gray-100 opacity-60'
                    }`}
                 >
                    <div className={`p-2 rounded-lg ${entryType === 'MISC' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                       <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col mt-1">
                       <span className={`text-[12px] font-black uppercase tracking-tight ${entryType === 'MISC' ? 'text-blue-900' : 'text-gray-400'}`}>Misc</span>
                       <span className="text-[10px] font-bold text-gray-400">Other expenses</span>
                    </div>
                 </button>
              </div>
           </div>

           {/* Labour Type Selector */}
           <div>
              <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] block mb-2">Labour Type</label>
              <div className="relative group">
                 <select 
                   value={labourType}
                   onChange={e => setLabourType(e.target.value)}
                   className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 text-[13.5px] font-bold text-gray-600 appearance-none cursor-pointer focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 transition-all outline-none"
                 >
                    <option value="">Select labour type</option>
                    <option>Plumbing</option>
                    <option>Electrical</option>
                    <option>Carpentry</option>
                    <option>Masonry</option>
                    <option>Painting</option>
                    <option>Welding</option>
                    <option>General Labour</option>
                 </select>
                 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
           </div>

           {/* Description */}
           <div>
              <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] block mb-2">Description *</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="E.g., PVC pipe installation for Mr. Perera's bathroom renovation"
                className="w-full bg-white border border-gray-100 rounded-xl p-4 text-[13.5px] font-bold text-gray-600 h-28 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 transition-all outline-none resize-none placeholder:opacity-50"
              />
           </div>

           {/* Charge Amount */}
           <div>
              <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] block mb-2">Charge Amount (LKR) *</label>
              <input 
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="0"
                placeholder="0.00"
                className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 text-[15px] font-black text-gray-800 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 transition-all outline-none"
              />
           </div>

           {/* Labour Details (Optional) */}
           <div>
              <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] block mb-3">Labour Details (Optional)</label>
              <div className="flex gap-4">
                 <div className="flex-1 relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      value={labourerName}
                      onChange={e => setLabourerName(e.target.value)}
                      placeholder="Labourer name" 
                      className="w-full bg-white border border-gray-100 rounded-xl py-3.5 pl-12 pr-4 text-[13px] font-bold outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 transition-all"
                    />
                 </div>
                 <div className="flex-1 relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      value={labourerPhone}
                      onChange={e => setLabourerPhone(e.target.value)}
                      placeholder="+94 77 123 4567" 
                      className="w-full bg-white border border-gray-100 rounded-xl py-3.5 pl-12 pr-4 text-[13px] font-bold outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 transition-all"
                    />
                 </div>
              </div>
           </div>

           {/* Error message */}
           {error && (
             <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
               <p className="text-[13px] font-bold text-red-600">{error}</p>
             </div>
           )}

           {/* Total Amount Footer */}
           <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[15px] font-black text-gray-900 uppercase tracking-tight opacity-80">Total Amount:</span>
              <span className="text-[32px] font-black text-amber-700 tracking-tighter">
                Rs. {amount && !isNaN(Number(amount)) ? Number(amount).toLocaleString() : '0.00'}
              </span>
           </div>
        </div>

        {/* ACTIONS */}
        <div className="p-8 pt-0 flex gap-4">
           <button 
              onClick={() => onClose(false)}
              disabled={saving}
              className="flex-1 py-4 px-6 border border-gray-200 text-gray-500 font-black text-[13px] rounded-2xl hover:bg-gray-50 transition-all uppercase tracking-[0.2em] disabled:opacity-50"
           >
              Cancel
           </button>
           <button 
              onClick={handleSave}
              disabled={saving}
              className="flex-[1.5] py-4 px-6 bg-[#a16207] hover:bg-amber-800 text-white font-black text-[14px] rounded-2xl shadow-xl shadow-amber-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.2em] disabled:opacity-70"
           >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? 'Saving...' : 'Save Entry'}
           </button>
        </div>

      </div>
    </div>
  );
}


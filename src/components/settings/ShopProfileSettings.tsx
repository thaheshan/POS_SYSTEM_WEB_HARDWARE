import { Store, Edit2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { shopApi } from '@/api/shop';
import { useDispatch } from 'react-redux';
import { setUser } from '../../../lib/store/authSlice';

interface Props {
  setHasUnsavedChanges: (val: boolean) => void;
}

export default function ShopProfileSettings({ setHasUnsavedChanges }: Props) {
  const { user, token } = useAuth();
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }

    setIsUploading(true);
    try {
      const response = await shopApi.uploadLogo(file, token);
      
      // Update local storage and Redux user state
      const updatedUser = { ...user, logoUrl: response.logo_url };
      dispatch(setUser(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      alert("Shop logo uploaded successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to upload logo");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      {/* Card Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-[12px] flex items-center justify-center border border-blue-100">
            <Store className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-[18px] font-black tracking-tight text-gray-900">Shop Profile</h2>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">
              Update your shop information, branding, and business details
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-[10px] text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
          <Edit2 className="w-3.5 h-3.5" /> Edit Profile
        </button>
      </div>

      <div className="p-8">
        {/* Logo Section */}
        <div className="bg-gray-50 rounded-[20px] p-6 mb-8 border border-gray-100 flex items-center gap-6">
          <div className="w-24 h-24 bg-white border border-gray-200 rounded-[16px] overflow-hidden flex items-center justify-center shadow-sm shrink-0">
            {user?.logoUrl ? (
              <img src={user.logoUrl} alt="Shop Logo" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-300" />
            )}
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-gray-900">Shop Logo</h4>
            <p className="text-[11px] font-medium text-gray-400 mt-1 mb-4">
              Recommended: 200x200px PNG or JPG, max 2MB
            </p>
            <div className="flex gap-3">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg" 
                onChange={handleFileChange}
              />
              <button 
                onClick={handleUploadClick}
                disabled={isUploading}
                className="bg-[#1e40af] text-white px-4 py-2 rounded-lg text-[12px] font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isUploading ? 'Uploading...' : 'Upload New Logo'}
              </button>
            </div>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">
              Shop Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              defaultValue="ABC Hardware Store"
              onChange={() => setHasUnsavedChanges(true)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">
              Business Registration No. <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              defaultValue="BR-2024-001234"
              onChange={() => setHasUnsavedChanges(true)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">
              Business Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              defaultValue="+94 11 234 5678"
              onChange={() => setHasUnsavedChanges(true)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">
              Business Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              defaultValue="info@abchardware.lk"
              onChange={() => setHasUnsavedChanges(true)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <label className="text-[12px] font-black text-gray-700">
            Shop Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            defaultValue="123 Galle Road, Dehiwala"
            onChange={() => setHasUnsavedChanges(true)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">City</label>
            <select
              onChange={() => setHasUnsavedChanges(true)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors"
            >
              <option>Dehiwala</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">District</label>
            <select
              onChange={() => setHasUnsavedChanges(true)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors"
            >
              <option>Colombo</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">Province</label>
            <select
              onChange={() => setHasUnsavedChanges(true)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors"
            >
              <option>Western</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Store, Edit2, Image as ImageIcon, Loader2, Save, X, Phone } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { shopApi } from '@/api/shop';
import { useDispatch } from 'react-redux';
import { setUser } from '../../../lib/store/authSlice';
import toast from 'react-hot-toast';

interface Props {
  setHasUnsavedChanges: (val: boolean) => void;
}

interface ShopProfile {
  id: string;
  name: string;
  businessRegistration: string | null;
  email: string | null;
  phone: string | null;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  province: string | null;
}

// Sri Lanka provinces & districts
const SL_PROVINCES: Record<string, string[]> = {
  'Western': ['Colombo', 'Gampaha', 'Kalutara'],
  'Central': ['Kandy', 'Matale', 'Nuwara Eliya'],
  'Southern': ['Galle', 'Matara', 'Hambantota'],
  'Northern': ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
  'Eastern': ['Batticaloa', 'Ampara', 'Trincomalee'],
  'North Western': ['Kurunegala', 'Puttalam'],
  'North Central': ['Anuradhapura', 'Polonnaruwa'],
  'Uva': ['Badulla', 'Monaragala'],
  'Sabaragamuwa': ['Ratnapura', 'Kegalle'],
};

export default function ShopProfileSettings({ setHasUnsavedChanges }: Props) {
  const { user, token } = useAuth();
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [profile, setProfile] = useState<ShopProfile | null>(null);
  const [form, setForm] = useState({
    name: '',
    businessRegistration: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    province: '',
  });

  // Load real data from API on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await shopApi.getProfile();
        setProfile(data);
        setForm({
          name: data.name || '',
          businessRegistration: data.businessRegistration || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          district: data.district || '',
          province: data.province || '',
        });
      } catch (err) {
        toast.error('Failed to load shop profile');
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

  const handleProvinceChange = (province: string) => {
    const districts = SL_PROVINCES[province] || [];
    setForm(prev => ({
      ...prev,
      province,
      district: districts[0] || '',
      city: '',
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Shop name is required');
      return;
    }
    setIsSaving(true);
    try {
      const updated = await shopApi.updateProfile({
        name: form.name.trim(),
        businessRegistration: form.businessRegistration.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        district: form.district.trim() || undefined,
        province: form.province.trim() || undefined,
      });
      setProfile(prev => ({ ...prev!, ...updated }));

      // Update Redux so header/navbar show updated name
      if (user) {
        const updatedUser = { ...user, shopName: updated.name };
        dispatch(setUser(updatedUser));
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      toast.success('Shop profile saved successfully!');
      setIsEditing(false);
      setHasUnsavedChanges(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        name: profile.name || '',
        businessRegistration: profile.businessRegistration || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        district: profile.district || '',
        province: profile.province || '',
      });
    }
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }
    setIsUploading(true);
    try {
      const response = await shopApi.uploadLogo(file, token);
      const logoUrl = response.logo_url || response.logoUrl;
      const updatedUser = { ...user, logoUrl };
      dispatch(setUser(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfile(prev => prev ? { ...prev, logo_url: logoUrl } : prev);
      toast.success('Logo uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const currentDistricts = SL_PROVINCES[form.province] || [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-16 flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
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
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-[10px] text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-[10px] text-[12px] font-bold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-[10px] text-[12px] font-bold hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="p-8">
        {/* Logo Section */}
        <div className="bg-gray-50 rounded-[20px] p-6 mb-8 border border-gray-100 flex items-center gap-6">
          <div className="w-24 h-24 bg-white border border-gray-200 rounded-[16px] overflow-hidden flex items-center justify-center shadow-sm shrink-0">
            {profile?.logo_url || user?.logoUrl ? (
              <img src={(profile?.logo_url || user?.logoUrl) ?? undefined} alt="Shop Logo" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-300" />
            )}
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-gray-900">Shop Logo</h4>
            <p className="text-[11px] font-medium text-gray-400 mt-1 mb-4">
              Recommended: 200x200px PNG or JPG, max 2MB
            </p>
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

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">
              Shop Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              disabled={!isEditing}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">
              Business Registration No. <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.businessRegistration}
              disabled={!isEditing}
              onChange={e => handleChange('businessRegistration', e.target.value)}
              placeholder="e.g. BR-2024-001234"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">
              Business Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.phone}
              disabled={!isEditing}
              onChange={e => handleChange('phone', e.target.value)}
              placeholder="e.g. +94 11 234 5678"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">
              Business Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              disabled={!isEditing}
              onChange={e => handleChange('email', e.target.value)}
              placeholder="e.g. info@yourshop.lk"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <label className="text-[12px] font-black text-gray-700">
            Shop Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.address}
            disabled={!isEditing}
            onChange={e => handleChange('address', e.target.value)}
            placeholder="e.g. 123 Galle Road, Dehiwala"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Province */}
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">Province</label>
            {isEditing ? (
              <select
                value={form.province}
                onChange={e => handleProvinceChange(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">Select Province</option>
                {Object.keys(SL_PROVINCES).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.province || '—'}
                disabled
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-[12px] text-[13px] font-bold text-gray-500"
              />
            )}
          </div>

          {/* District */}
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">District</label>
            {isEditing ? (
              <select
                value={form.district}
                onChange={e => handleChange('district', e.target.value)}
                disabled={!form.province}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors disabled:bg-gray-50"
              >
                <option value="">Select District</option>
                {currentDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.district || '—'}
                disabled
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-[12px] text-[13px] font-bold text-gray-500"
              />
            )}
          </div>

          {/* City */}
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">City</label>
            <input
              type="text"
              value={form.city}
              disabled={!isEditing}
              onChange={e => handleChange('city', e.target.value)}
              placeholder="e.g. Dehiwala"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>

        {/* Empty state hint */}
        {!profile?.address && !isEditing && (
          <div className="mt-6 bg-amber-50 border border-amber-100 rounded-[12px] p-4 text-[12px] font-medium text-amber-700">
            ⚠️ Your shop profile is incomplete. Click <span className="font-bold">Edit Profile</span> to fill in your business details.
          </div>
        )}
      </div>
    </div>
  );
}

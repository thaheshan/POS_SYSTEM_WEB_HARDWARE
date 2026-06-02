'use client';

import { Upload, Camera, X } from 'lucide-react';
import React from 'react';


interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectUpload: () => void;
  onSelectCamera: () => void;
}

export default function ImageOptionsModal({ isOpen, onClose, onSelectUpload, onSelectCamera }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[18px] font-black text-gray-900">Product Image Options</h3>
            <p className="text-[12px] font-medium text-gray-500 mt-0.5">How would you like to add an image?</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onSelectUpload}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-[13px] font-bold text-gray-800">Upload Image</span>
          </button>

          <button 
            onClick={onSelectCamera}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-[13px] font-bold text-gray-800">Take Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
}

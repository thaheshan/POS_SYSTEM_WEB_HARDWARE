"use client";

import { X, Tags, CheckCircle2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "@/lib/services/settingsApi";
import { Category } from "../../../types";
import { settingsToast } from '../settings/ui/customToast';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryToEdit: Category | null;
}

export default function AddCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  categoryToEdit,
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const [createCategory, { isLoading }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  useEffect(() => {
    if (categoryToEdit && isOpen) {
      setName(categoryToEdit.categoryName || categoryToEdit.categoryName || "");
      setDescription(categoryToEdit.description || "");
    } else if (!isOpen) {
      setName("");
      setDescription("");
    }
  }, [categoryToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      settingsToast.error("Validation Error", "Category name is required.");
      return;
    }

    setLoading(true);
    try {
      if (categoryToEdit) {
         await updateCategory({ id: categoryToEdit.id, name, description }).unwrap();
      } else {
         await createCategory({ name, description }).unwrap();
      }

      settingsToast.success(
        categoryToEdit ? "Category Updated" : "Category Created",
        "Your category has been saved successfully."
      );
      
      setName("");
      setDescription("");
      onSuccess();
      
    } catch (err: any) {
      settingsToast.error(
        "Failed to save", 
        err?.data?.message || "An error occurred while saving the category."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isCurrentlyLoading = loading || isLoading || isUpdating;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {categoryToEdit ? "Edit Category" : "Add Category"}
              </h2>
              <p className="text-xs text-gray-500">
                {categoryToEdit 
                  ? "Update the details of this product category" 
                  : "Create a new product category"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
              Category Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Electrical, Tools, Paints..."
              className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this category..."
              className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-6 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCurrentlyLoading}
              className="py-2 px-6 rounded-xl text-sm font-bold bg-[#059669] text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isCurrentlyLoading 
                ? "Saving..." 
                : (categoryToEdit ? "Save Changes" : "Save Category")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Tags,
  Plus,
  Edit2,
  Trash2,
  Check,
  Search,
  FolderTree,
  CornerDownRight,
} from "lucide-react";
import api from "@/api/axiosInstance";
import { toastSuccess, toastError } from "@/lib/toast";

interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  subcategories?: CategoryItem[];
}

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function ManageCategoriesModal({
  isOpen,
  onClose,
  onRefresh,
}: ManageCategoriesModalProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  // New category state
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  // New subcategory state
  const [addingSubForParentId, setAddingSubForParentId] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState("");
  const [creatingSub, setCreatingSub] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/categories");
      const data = res.data?.data || res.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toastError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMainCategory = async () => {
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    try {
      await api.post("/products/categories", { name: newCatName.trim() });
      setNewCatName("");
      setShowNewCatInput(false);
      toastSuccess("Category created successfully!");
      fetchCategories();
      onRefresh?.();
    } catch (err: any) {
      toastError(err?.response?.data?.message || "Failed to create category");
    } finally {
      setCreatingCat(false);
    }
  };

  const handleCreateSubcategory = async (parentId: string) => {
    if (!newSubName.trim()) return;
    setCreatingSub(true);
    try {
      await api.post(`/products/categories/${parentId}/subcategories`, {
        name: newSubName.trim(),
      });
      setNewSubName("");
      setAddingSubForParentId(null);
      toastSuccess("Subcategory created successfully!");
      fetchCategories();
      onRefresh?.();
    } catch (err: any) {
      toastError(err?.response?.data?.message || "Failed to create subcategory");
    } finally {
      setCreatingSub(false);
    }
  };

  const handleStartEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleSaveEdit = async (catId: string) => {
    if (!editName.trim()) return;
    setSavingId(catId);
    try {
      await api.patch(`/products/categories/${catId}`, {
        name: editName.trim(),
      });
      setEditingId(null);
      setEditName("");
      toastSuccess("Updated successfully!");
      fetchCategories();
      onRefresh?.();
    } catch (err: any) {
      toastError(err?.response?.data?.message || "Failed to update category");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (catId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/products/categories/${catId}`);
      toastSuccess(`"${name}" deleted successfully!`);
      fetchCategories();
      onRefresh?.();
    } catch (err: any) {
      toastError(err?.response?.data?.message || "Failed to delete category");
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter((cat) => {
    const matchesParent = cat.name.toLowerCase().includes(search.toLowerCase());
    const matchesSub = cat.subcategories?.some((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    return matchesParent || matchesSub;
  });

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Manage Categories & Tags</h2>
              <p className="text-xs text-gray-500">
                View, edit, create, or delete product categories and subcategories
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories or subcategories..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <button
            onClick={() => setShowNewCatInput(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Main Category
          </button>
        </div>

        {/* Create Main Category Bar */}
        {showNewCatInput && (
          <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center gap-2">
            <input
              autoFocus
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateMainCategory();
                if (e.key === "Escape") setShowNewCatInput(false);
              }}
              placeholder="Enter main category name..."
              className="flex-1 px-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              onClick={handleCreateMainCategory}
              disabled={creatingCat || !newCatName.trim()}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1"
            >
              {creatingCat ? "Saving..." : <><Check className="w-3.5 h-3.5" /> Save</>}
            </button>
            <button
              onClick={() => setShowNewCatInput(false)}
              className="px-3 py-2 text-xs text-gray-500 hover:bg-gray-200 rounded-xl"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Tags className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm font-bold">No categories found</p>
              <p className="text-xs mt-1">Click "Add Main Category" above to create your first category.</p>
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="border border-gray-200 rounded-2xl p-4 bg-white hover:border-gray-300 transition-all shadow-sm"
              >
                {/* Parent Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    {editingId === cat.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          autoFocus
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(cat.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="px-3 py-1.5 text-xs font-bold border border-emerald-400 rounded-lg outline-none flex-1"
                        />
                        <button
                          onClick={() => handleSaveEdit(cat.id)}
                          disabled={savingId === cat.id}
                          className="p-1.5 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900">{cat.name}</h4>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {(cat.subcategories || []).length} subcategories
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {editingId !== cat.id && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setAddingSubForParentId(cat.id)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg flex items-center gap-1 transition-all"
                        title="Add Subcategory"
                      >
                        <Plus className="w-3.5 h-3.5" /> Subcategory
                      </button>
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Edit Category Name"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Subcategory Input */}
                {addingSubForParentId === cat.id && (
                  <div className="mt-3 ml-6 p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center gap-2">
                    <CornerDownRight className="w-4 h-4 text-blue-500 shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateSubcategory(cat.id);
                        if (e.key === "Escape") setAddingSubForParentId(null);
                      }}
                      placeholder={`Subcategory name under ${cat.name}...`}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <button
                      onClick={() => handleCreateSubcategory(cat.id)}
                      disabled={creatingSub || !newSubName.trim()}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      {creatingSub ? "..." : <><Check className="w-3 h-3" /> Save</>}
                    </button>
                    <button
                      onClick={() => setAddingSubForParentId(null)}
                      className="p-1.5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Nested Subcategories List */}
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 pl-4 space-y-2">
                    {cat.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between gap-2 text-xs p-2 rounded-xl hover:bg-gray-50 transition-all"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <CornerDownRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                          {editingId === sub.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                autoFocus
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveEdit(sub.id);
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                className="px-2.5 py-1 text-xs font-bold border border-blue-400 rounded-lg outline-none flex-1"
                              />
                              <button
                                onClick={() => handleSaveEdit(sub.id)}
                                disabled={savingId === sub.id}
                                className="p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="font-semibold text-gray-700">{sub.name}</span>
                          )}
                        </div>

                        {editingId !== sub.id && (
                          <div className="flex items-center gap-1 opacity-80 hover:opacity-100">
                            <button
                              onClick={() => handleStartEdit(sub)}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                              title="Edit Subcategory Name"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(sub.id, sub.name)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                              title="Delete Subcategory"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Bookmark,
} from "lucide-react";
import api from "@/api/axiosInstance";
import { toastSuccess, toastError } from "@/lib/toast";

interface BrandItem {
  id: string;
  name: string;
  description?: string;
}

interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  brands?: BrandItem[];
  subcategories?: (CategoryItem & { brands?: BrandItem[] })[];
}

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  initialSubcategoryId?: string;
  openBrandInputDirectly?: boolean;
}

export default function ManageCategoriesModal({
  isOpen,
  onClose,
  onRefresh,
  initialSubcategoryId,
  openBrandInputDirectly = false,
}: ManageCategoriesModalProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Editing state (shared for cat/sub/brand)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<"category" | "brand">("category");

  // New category state
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  // New subcategory state
  const [addingSubForParentId, setAddingSubForParentId] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState("");
  const [creatingSub, setCreatingSub] = useState(false);

  // New brand state — inline under a subcategory
  const [addingBrandForSubId, setAddingBrandForSubId] = useState<string | null>(null);
  const [newBrandName, setNewBrandName] = useState("");
  const [creatingBrand, setCreatingBrand] = useState(false);

  // Global Brand creation bar (with subcategory dropdown)
  const [showGlobalBrandInput, setShowGlobalBrandInput] = useState(false);
  const [selectedSubcatForBrand, setSelectedSubcatForBrand] = useState<string>("");
  const [globalBrandName, setGlobalBrandName] = useState("");
  const [creatingGlobalBrand, setCreatingGlobalBrand] = useState(false);

  // Flat list of all subcategories across all main categories
  const allSubcategoriesList = useMemo(() => {
    const list: { id: string; name: string; parentName: string }[] = [];
    categories.forEach((cat) => {
      if (cat.subcategories && cat.subcategories.length > 0) {
        cat.subcategories.forEach((sub) => {
          list.push({ id: sub.id, name: sub.name, parentName: cat.name });
        });
      }
    });
    return list;
  }, [categories]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialSubcategoryId) {
      setSelectedSubcatForBrand(initialSubcategoryId);
      if (openBrandInputDirectly) {
        setShowGlobalBrandInput(true);
      }
    }
  }, [isOpen, initialSubcategoryId, openBrandInputDirectly]);

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

  /* ─── Category CRUD ─── */
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

  const handleStartEdit = (item: { id: string; name: string }, type: "category" | "brand") => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditingType(type);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setSavingId(id);
    try {
      if (editingType === "brand") {
        await api.patch(`/products/brands/${id}`, { name: editName.trim() });
      } else {
        await api.patch(`/products/categories/${id}`, { name: editName.trim() });
      }
      setEditingId(null);
      setEditName("");
      toastSuccess("Updated successfully!");
      fetchCategories();
      onRefresh?.();
    } catch (err: any) {
      toastError(err?.response?.data?.message || "Failed to update");
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteCategory = async (catId: string, name: string) => {
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

  /* ─── Brand CRUD ─── */
  const handleCreateBrandInline = async (subcategoryId: string) => {
    if (!newBrandName.trim()) return;
    setCreatingBrand(true);
    try {
      await api.post("/products/brands", {
        name: newBrandName.trim(),
        categoryId: subcategoryId,
      });
      setNewBrandName("");
      setAddingBrandForSubId(null);
      toastSuccess("Brand created successfully!");
      fetchCategories();
      onRefresh?.();
    } catch (err: any) {
      toastError(err?.response?.data?.message || "Failed to create brand");
    } finally {
      setCreatingBrand(false);
    }
  };

  const handleCreateGlobalBrand = async () => {
    if (!globalBrandName.trim() || !selectedSubcatForBrand) return;
    setCreatingGlobalBrand(true);
    try {
      await api.post("/products/brands", {
        name: globalBrandName.trim(),
        categoryId: selectedSubcatForBrand,
      });
      setGlobalBrandName("");
      setShowGlobalBrandInput(false);
      toastSuccess("Brand created successfully!");
      fetchCategories();
      onRefresh?.();
    } catch (err: any) {
      toastError(err?.response?.data?.message || "Failed to create brand");
    } finally {
      setCreatingGlobalBrand(false);
    }
  };

  const handleDeleteBrand = async (brandId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete brand "${name}"?`)) return;
    try {
      await api.delete(`/products/brands/${brandId}`);
      toastSuccess(`Brand "${name}" deleted!`);
      fetchCategories();
      onRefresh?.();
    } catch (err: any) {
      toastError(err?.response?.data?.message || "Failed to delete brand");
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter((cat) => {
    const matchesParent = cat.name.toLowerCase().includes(search.toLowerCase());
    const matchesSub = cat.subcategories?.some(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.brands?.some((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    );
    return matchesParent || matchesSub;
  });

  const renderEditRow = (id: string) => (
    <div className="flex items-center gap-2 flex-1">
      <input
        autoFocus
        type="text"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSaveEdit(id);
          if (e.key === "Escape") setEditingId(null);
        }}
        className="px-2.5 py-1 text-xs font-bold border border-blue-400 rounded-lg outline-none flex-1"
      />
      <button
        onClick={() => handleSaveEdit(id)}
        disabled={savingId === id}
        className="p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        <Check className="w-3 h-3" />
      </button>
      <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:text-gray-600">
        <X className="w-3 h-3" />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Manage Categories & Tags</h2>
              <p className="text-xs text-gray-500">
                View, edit, create, or delete categories, subcategories and brands
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories, subcategories or brands..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { setShowNewCatInput(true); setShowGlobalBrandInput(false); }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Main Category
            </button>
            <button
              onClick={() => { setShowGlobalBrandInput(true); setShowNewCatInput(false); }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Add Brand
            </button>
          </div>
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

        {/* Global Brand Creation Bar (with Subcategory Dropdown) */}
        {showGlobalBrandInput && (
          <div className="p-4 bg-purple-50/80 border-b border-purple-100 flex flex-col md:flex-row items-stretch md:items-center gap-2">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-bold text-purple-700 mb-1 uppercase tracking-wider">
                Select Parent Subcategory *
              </label>
              <select
                value={selectedSubcatForBrand}
                onChange={(e) => setSelectedSubcatForBrand(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-purple-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 font-medium"
              >
                <option value="">-- Choose Subcategory --</option>
                {allSubcategoriesList.length === 0 && (
                  <option disabled>No subcategories found. Create a category/subcategory first.</option>
                )}
                {allSubcategoriesList.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.parentName} → {sub.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] font-bold text-purple-700 mb-1 uppercase tracking-wider">
                Brand Name *
              </label>
              <input
                autoFocus
                type="text"
                value={globalBrandName}
                onChange={(e) => setGlobalBrandName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateGlobalBrand();
                  if (e.key === "Escape") setShowGlobalBrandInput(false);
                }}
                placeholder="e.g. Orange, ACL, Havells, S-Lon..."
                className="w-full px-3 py-2 text-xs bg-white border border-purple-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div className="flex items-center gap-2 pt-2 md:pt-5">
              <button
                onClick={handleCreateGlobalBrand}
                disabled={creatingGlobalBrand || !globalBrandName.trim() || !selectedSubcatForBrand}
                className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1 shrink-0"
              >
                {creatingGlobalBrand ? "Saving..." : <><Check className="w-3.5 h-3.5" /> Save Brand</>}
              </button>
              <button
                onClick={() => setShowGlobalBrandInput(false)}
                className="px-3 py-2 text-xs text-gray-500 hover:bg-gray-200 rounded-xl shrink-0"
              >
                Cancel
              </button>
            </div>
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
                {/* Parent Category Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    {editingId === cat.id ? (
                      renderEditRow(cat.id)
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900">{cat.name}</h4>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {(cat.subcategories || []).length} subcategories
                        </span>
                      </div>
                    )}
                  </div>
                  {editingId !== cat.id && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setAddingSubForParentId(cat.id); setAddingBrandForSubId(null); }}
                        className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Subcategory
                      </button>
                      <button
                        onClick={() => handleStartEdit(cat, "category")}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* New Subcategory Input */}
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
                    <button onClick={() => setAddingSubForParentId(null)} className="p-1.5 text-gray-400 hover:text-gray-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Nested Subcategories */}
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 pl-4 space-y-3">
                    {cat.subcategories.map((sub) => (
                      <div key={sub.id} className="space-y-2">
                        {/* Subcategory row */}
                        <div className="flex items-center justify-between gap-2 text-xs p-2 rounded-xl hover:bg-gray-50 transition-all">
                          <div className="flex items-center gap-2 flex-1">
                            <CornerDownRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                            {editingId === sub.id ? (
                              renderEditRow(sub.id)
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">{sub.name}</span>
                                <span className="text-[10px] font-bold text-purple-400 bg-purple-50 px-1.5 py-0.5 rounded-full">
                                  {(sub.brands || []).length} brands
                                </span>
                              </div>
                            )}
                          </div>
                          {editingId !== sub.id && (
                            <div className="flex items-center gap-1 opacity-80 hover:opacity-100">
                              <button
                                onClick={() => { setAddingBrandForSubId(sub.id); setAddingSubForParentId(null); }}
                                className="px-2 py-1 text-[10px] font-bold bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-md flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" /> Brand
                              </button>
                              <button
                                onClick={() => handleStartEdit(sub, "category")}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(sub.id, sub.name)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* New Brand Input under this subcategory */}
                        {addingBrandForSubId === sub.id && (
                          <div className="ml-8 p-2.5 bg-purple-50/60 border border-purple-100 rounded-xl flex items-center gap-2">
                            <Bookmark className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <input
                              autoFocus
                              type="text"
                              value={newBrandName}
                              onChange={(e) => setNewBrandName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleCreateBrandInline(sub.id);
                                if (e.key === "Escape") setAddingBrandForSubId(null);
                              }}
                              placeholder={`Brand name under ${sub.name}...`}
                              className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-purple-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-300"
                            />
                            <button
                              onClick={() => handleCreateBrandInline(sub.id)}
                              disabled={creatingBrand || !newBrandName.trim()}
                              className="px-2.5 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"
                            >
                              {creatingBrand ? "..." : <><Check className="w-3 h-3" /> Save</>}
                            </button>
                            <button onClick={() => setAddingBrandForSubId(null)} className="p-1.5 text-gray-400 hover:text-gray-600">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Brands list under this subcategory */}
                        {sub.brands && sub.brands.length > 0 && (
                          <div className="ml-8 space-y-1">
                            {sub.brands.map((brand) => (
                              <div
                                key={brand.id}
                                className="flex items-center justify-between gap-2 text-xs p-1.5 rounded-lg hover:bg-purple-50/50 transition-all"
                              >
                                <div className="flex items-center gap-1.5 flex-1">
                                  <Bookmark className="w-3 h-3 text-purple-400 shrink-0" />
                                  {editingId === brand.id ? (
                                    renderEditRow(brand.id)
                                  ) : (
                                    <span className="font-medium text-gray-600">{brand.name}</span>
                                  )}
                                </div>
                                {editingId !== brand.id && (
                                  <div className="flex items-center gap-1 opacity-70 hover:opacity-100">
                                    <button
                                      onClick={() => handleStartEdit(brand, "brand")}
                                      className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md"
                                    >
                                      <Edit2 className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBrand(brand.id, brand.name)}
                                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
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

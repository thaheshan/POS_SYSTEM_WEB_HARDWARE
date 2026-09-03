"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Edit2,
  ChevronDown,
  AlertCircle,
  Package,
  DollarSign,
  Layers,
  Tag,
  Upload,
  Plus,
  Percent,
  Warehouse as WarehouseIcon,
  Truck,
  Sparkles,
  Camera,
  CheckCircle2,
} from "lucide-react";
import api from "@/api/axiosInstance";
import { toast } from "sonner";

export const ALL_MEASUREMENT_UNITS = [
  {
    category: "Count / Packaging",
    units: [
      "Pieces (pcs)",
      "Boxes (box)",
      "Packs (pk)",
      "Cartons (ctn)",
      "Bags (bag)",
      "Bundles (bdl)",
      "Sets (set)",
      "Pairs (pr)",
      "Rolls (rl)",
      "Dozens (doz)",
    ],
  },
  {
    category: "Length / Distance",
    units: [
      "Meters (m)",
      "Centimeters (cm)",
      "Millimeters (mm)",
      "Feet (ft)",
      "Inches (in)",
      "Yards (yd)",
    ],
  },
  {
    category: "Weight / Mass",
    units: [
      "Kilograms (kg)",
      "Grams (g)",
      "Milligrams (mg)",
      "Metric Tons (t)",
      "Pounds (lb)",
    ],
  },
  {
    category: "Volume / Liquid",
    units: [
      "Liters (L)",
      "Milliliters (mL)",
      "Gallons (gal)",
      "Cubic Meters (m³)",
      "Cubic Feet (cu ft)",
    ],
  },
  {
    category: "Area",
    units: [
      "Square Meters (sqm / m²)",
      "Square Feet (sqft / ft²)",
      "Square Inches (sqin)",
    ],
  },
];

const TAX_RATES = [
  { label: "No Tax (0%)", value: "0" },
  { label: "VAT (18%)", value: "18" },
];

interface EditInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: any) => Promise<void>;
  item: any;
}

export default function EditInventoryModal({
  isOpen,
  onClose,
  onSave,
  item,
}: EditInventoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdown options lists
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // Inline Category / Subcategory / Brand creation states
  const [newCatName, setNewCatName] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);
  const [savingCat, setSavingCat] = useState(false);
  const [newSubCatName, setNewSubCatName] = useState("");
  const [showNewSubCat, setShowNewSubCat] = useState(false);
  const [savingSubCat, setSavingSubCat] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [productType, setProductType] = useState<"FIX" | "LOOSE">("FIX");
  const [unit, setUnit] = useState("Pieces (pcs)");

  // Pricing State
  const [unitCost, setUnitCost] = useState<number | "">(""); // Selling Price
  const [costPrice, setCostPrice] = useState<number | "">(""); // Cost Price
  const [comparePrice, setComparePrice] = useState<number | "">("");
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [taxRate, setTaxRate] = useState("18");

  // Stock & Inventory State
  const [qty, setQty] = useState<number>(0);
  const [minLevel, setMinLevel] = useState<number>(10);
  const [maxLevel, setMaxLevel] = useState<number>(200);
  const [trackInventory, setTrackInventory] = useState(true);
  const [continueOOS, setContinueOOS] = useState(false);
  const [status, setStatus] = useState("In Stock");
  const [autoReorder, setAutoReorder] = useState(false);

  // Organization State
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [supplierId, setSupplierId] = useState("");

  // Media State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Discount Configuration
  const [isDiscountEnabled, setIsDiscountEnabled] = useState(false);
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [maxAllowedDiscount, setMaxAllowedDiscount] = useState<number | "">("");
  const [defaultDiscountValue, setDefaultDiscountValue] = useState<number | "">("");

  // Double / Secondary Discount State
  const [hasSecondaryDiscount, setHasSecondaryDiscount] = useState(false);
  const [secondaryDiscountType, setSecondaryDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [maxSecondaryDiscount, setMaxSecondaryDiscount] = useState<number | "">("");
  const [defaultSecondaryDiscount, setDefaultSecondaryDiscount] = useState<number | "">("");

  // Populate item data on open
  useEffect(() => {
    if (!isOpen || !item) return;

    setName(item.name || "");
    setDescription(item.description || "");
    setShortDescription(item.shortDescription || "");
    setSku(item.sku || "");
    setBarcode(item.barcode || "");
    setProductType(item.productType || item.product_type || "FIX");
    setUnit(item.unit || item.measurementUnit || item.measurement_unit || "Pieces (pcs)");

    setUnitCost(item.sellingPrice || item.price || item.unitCost || 0);
    setCostPrice(item.purchasePrice || item.costPrice || item.cost || 0);
    setComparePrice(item.comparePrice || item.compare_price || "");
    setTaxInclusive(item.taxInclusive || false);
    setTaxRate(String(item.taxRate || "18"));

    setQty(Number(item.qty ?? item.quantity ?? item.initialStock ?? 0));
    setMinLevel(Number(item.minStock ?? item.minLevel ?? item.minimumStockLevel ?? 10));
    setMaxLevel(Number(item.maxLevel ?? item.maximumStockLevel ?? 200));
    setTrackInventory(item.trackInventory !== false);
    setContinueOOS(item.continueOOS || false);
    setStatus(item.status || "In Stock");
    setAutoReorder(item.autoReorder || false);

    setCategoryId(item.categoryId || "");
    setSubCategoryId(item.subCategoryId || "");
    setBrandId(item.brandId || "");
    setWarehouseId(item.warehouseId || "");
    setSupplierId(item.supplierId || "");

    setPreviewUrl(item.image || item.imageUrl || item.image_url || null);
    setImageFile(null);

    setIsDiscountEnabled(item.isDiscountEnabled || false);
    setDiscountType(item.discountType || "PERCENTAGE");
    setMaxAllowedDiscount(
      item.maxAllowedDiscount !== undefined && item.maxAllowedDiscount !== null
        ? Number(item.maxAllowedDiscount)
        : ""
    );
    setDefaultDiscountValue(
      item.defaultDiscountValue !== undefined && item.defaultDiscountValue !== null
        ? Number(item.defaultDiscountValue)
        : ""
    );

    setHasSecondaryDiscount(item.hasSecondaryDiscount || false);
    setSecondaryDiscountType(item.secondaryDiscountType || "PERCENTAGE");
    setMaxSecondaryDiscount(
      item.maxSecondaryDiscount !== undefined && item.maxSecondaryDiscount !== null
        ? Number(item.maxSecondaryDiscount)
        : ""
    );
    setDefaultSecondaryDiscount(
      item.defaultSecondaryDiscount !== undefined && item.defaultSecondaryDiscount !== null
        ? Number(item.defaultSecondaryDiscount)
        : ""
    );
    setError(null);

    fetchData();
  }, [isOpen, item]);

  // Fetch Dropdown data on mount/open
  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, whRes, supRes] = await Promise.allSettled([
        api.get("/products/categories"),
        api.get("/warehouses"),
        api.get("/suppliers"),
      ]);

      let catArr: any[] = [];
      if (catRes.status === "fulfilled") {
        catArr = Array.isArray(catRes.value.data)
          ? catRes.value.data
          : catRes.value.data?.data || catRes.value.data?.categories || [];
        setCategories(catArr);
      }

      if (whRes.status === "fulfilled") {
        const whArr = Array.isArray(whRes.value.data)
          ? whRes.value.data
          : whRes.value.data?.data || whRes.value.data?.warehouses || [];
        setWarehouses(whArr);
      }

      if (supRes.status === "fulfilled") {
        const supArr = Array.isArray(supRes.value.data)
          ? supRes.value.data
          : supRes.value.data?.data || supRes.value.data?.suppliers || [];
        setSuppliers(supArr);
      }

      // Pre-select Category matching
      if (item?.categoryId) {
        setCategoryId(item.categoryId);
      } else if (item?.category) {
        const matchingCat = catArr.find(
          (c: any) => c.name?.toLowerCase() === item.category?.toLowerCase()
        );
        if (matchingCat) setCategoryId(matchingCat.id);
      }
    } catch (err) {
      console.error("Failed to load edit modal dropdowns:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load subcategories when categoryId changes
  useEffect(() => {
    if (!categoryId) {
      setSubCategories([]);
      setBrands([]);
      return;
    }
    const cat = categories.find((c) => c.id === categoryId);
    let subList: any[] = [];
    if (cat?.subcategories && cat.subcategories.length > 0) {
      subList = cat.subcategories;
      setSubCategories(subList);
    }
    api.get(`/products/categories/${categoryId}/subcategories`)
      .then((res) => {
        const data = res.data?.data || res.data || [];
        const arr = Array.isArray(data) ? data : [];
        if (arr.length > 0) {
          subList = arr;
          setSubCategories(arr);
        }
        // Auto-match subcategory by name if subCategoryId not set
        if (item?.subCategory && item.subCategory !== "—" && !subCategoryId) {
          const match = subList.find(
            (s: any) => s.name?.toLowerCase() === item.subCategory?.toLowerCase()
          );
          if (match) setSubCategoryId(match.id);
        }
      })
      .catch(() => {
        if (subList.length > 0) setSubCategories(subList);
      });
  }, [categoryId, categories]);

  // Auto-load brands when subCategoryId changes
  useEffect(() => {
    if (!subCategoryId) {
      setBrands([]);
      return;
    }
    const sub = subCategories.find((s) => s.id === subCategoryId);
    let brandList: any[] = [];
    if (sub?.brands && sub.brands.length > 0) {
      brandList = sub.brands;
      const sorted = [...brandList].sort((a: any, b: any) =>
        (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base", numeric: true })
      );
      setBrands(sorted);
    }
    api.get(`/products/brands`, { params: { subcategoryId: subCategoryId } })
      .then((res) => {
        const data = res.data?.data || res.data || [];
        const arr = Array.isArray(data) ? data : [];
        if (arr.length > 0 || brandList.length === 0) {
          brandList = arr;
          const sorted = [...arr].sort((a: any, b: any) =>
            (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base", numeric: true })
          );
          setBrands(sorted);
        }
        // Auto-match brand by name if brandId not set
        if (item?.brand && item.brand !== "—" && !brandId) {
          const match = brandList.find(
            (b: any) => b.name?.toLowerCase() === item.brand?.toLowerCase()
          );
          if (match) setBrandId(match.id);
        }
      })
      .catch(() => {/* fallback to cache */});
  }, [subCategoryId, subCategories]);

  // Inline Category / Subcategory / Brand Creation
  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setSavingCat(true);
    try {
      const res = await api.post("/products/categories", { name: newCatName.trim() });
      const cat = res.data?.data || res.data;
      setCategories((prev) => [...prev, { id: cat.id, name: cat.name }]);
      setCategoryId(cat.id);
      setNewCatName("");
      setShowNewCat(false);
      toast.success(`Category "${cat.name}" created!`);
    } catch {
      toast.error("Failed to create category");
    } finally {
      setSavingCat(false);
    }
  };

  const handleCreateSubCategory = async () => {
    if (!newSubCatName.trim() || !categoryId) return;
    setSavingSubCat(true);
    try {
      const res = await api.post(`/products/categories/${categoryId}/subcategories`, { name: newSubCatName.trim() });
      const subCat = res.data?.data || res.data;
      setSubCategories((prev) => [...prev, { id: subCat.id, name: subCat.name }]);
      setSubCategoryId(subCat.id);
      setNewSubCatName("");
      setShowNewSubCat(false);
      toast.success(`Subcategory "${subCat.name}" created!`);
    } catch {
      toast.error("Failed to create subcategory");
    } finally {
      setSavingSubCat(false);
    }
  };

  const handleCreateBrand = async () => {
    if (!newBrandName.trim() || !subCategoryId) return;
    setSavingBrand(true);
    try {
      const res = await api.post(`/products/brands`, { name: newBrandName.trim(), categoryId: subCategoryId });
      const brand = res.data?.data || res.data;
      setBrands((prev) => [...prev, { id: brand.id, name: brand.name }]);
      setBrandId(brand.id);
      setNewBrandName("");
      setShowNewBrand(false);
      toast.success(`Brand "${brand.name}" created!`);
    } catch {
      toast.error("Failed to create brand");
    } finally {
      setSavingBrand(false);
    }
  };

  // Image Upload handler
  const handleImageFile = (file: File) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  if (!isOpen || !item) return null;

  const handleSave = async () => {
    if (!name.trim()) return setError("Product name is required");
    if (!sku.trim()) return setError("SKU is required");
    if (!categoryId) return setError("Please select a category");
    if (unitCost === "" || Number(unitCost) < 0) return setError("Selling price is required");

    if (isDiscountEnabled) {
      const maxVal = parseFloat(String(maxAllowedDiscount));
      if (maxAllowedDiscount === "" || isNaN(maxVal) || maxVal < 0) {
        return setError("Maximum allowed discount is required");
      }
      if (discountType === "PERCENTAGE" && maxVal > 100) {
        return setError("Percentage discount cannot exceed 100%");
      }
      if (defaultDiscountValue !== "") {
        const defaultVal = parseFloat(String(defaultDiscountValue));
        if (isNaN(defaultVal) || defaultVal < 0) {
          return setError("Default discount value must be positive");
        }
        if (defaultVal > maxVal) {
          return setError("Default discount value cannot exceed maximum allowed limit");
        }
      }
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        shortDescription: shortDescription.trim(),
        productType,
        unit,
        measurementUnit: unit,
        sku: sku.trim(),
        barcode: barcode.trim(),
        purchasePrice: Number(costPrice) || 0,
        sellingPrice: Number(unitCost) || 0,
        comparePrice: Number(comparePrice) || 0,
        taxInclusive,
        taxRate: Number(taxRate) || 18,
        trackInventory,
        qty: Number(qty),
        initialStock: Number(qty),
        minimumStockLevel: Number(minLevel),
        maximumStockLevel: Number(maxLevel),
        continueOOS,
        categoryId,
        subCategoryId,
        subcategoryId: subCategoryId,
        brandId,
        warehouseId,
        supplierId,
        status,
        autoReorder,
        isDiscountEnabled,
        discountType,
        maxAllowedDiscount: isDiscountEnabled ? parseFloat(String(maxAllowedDiscount)) || 0 : 0,
        defaultDiscountValue: isDiscountEnabled && defaultDiscountValue !== "" ? parseFloat(String(defaultDiscountValue)) || 0 : 0,
        imageFile,
      };

      await onSave(payload);
    } catch (err: any) {
      console.error("Error saving product changes:", err);
      setError(err?.response?.data?.message || "Failed to update product details.");
    } finally {
      setSaving(false);
    }
  };

  const sellP = Number(unitCost) || 0;
  const costP = Number(costPrice) || 0;
  const profitMargin = sellP > 0 && costP > 0 ? Math.round(((sellP - costP) / costP) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Edit Inventory Item</h2>
              <p className="text-xs font-medium text-gray-500 mt-0.5">
                Update full product specifications, stock levels, pricing &amp; categories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-200/60 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs font-bold text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. BASIC INFORMATION */}
          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Basic Information</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. PVC Pipe 12mm High Pressure"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Short Summary / Listing Description</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Summary for receipts and POS catalog..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Detailed Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed technical specifications..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. PRODUCT MEDIA */}
          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Product Photo / Media</h3>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                {previewUrl ? (
                  <img src={previewUrl} alt="Product" className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileRef}
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageFile(f);
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" /> Upload New Photo
                </button>
                <p className="text-[11px] text-gray-400">PNG, JPG, WEBP up to 5MB</p>
              </div>
            </div>
          </div>

          {/* 3. PRODUCT TYPE & MEASUREMENT */}
          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Product Type &amp; Measurement Unit</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Product Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProductType("FIX")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                      productType === "FIX"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span>Fix Product</span>
                    <span className="text-[10px] opacity-80">Countable (Pieces/Items)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductType("LOOSE")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                      productType === "LOOSE"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span>Loose Product</span>
                    <span className="text-[10px] opacity-80">Measured (Kg/Meters/Liters)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Measurement Unit</label>
                <div className="relative">
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400 focus:outline-none cursor-pointer"
                  >
                    {ALL_MEASUREMENT_UNITS.map((group) => (
                      <optgroup key={group.category} label={`── ${group.category} ──`}>
                        {group.units.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* 4. PRICING & TAX */}
          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Pricing &amp; Cost Structure</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Cost Price (LKR) <span className="text-red-500">*</span>
                  <span className="ml-1 text-[10px] text-gray-400">What you pay</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-emerald-400">
                  <span className="px-3 py-2.5 text-xs font-bold text-gray-400 bg-gray-50 border-r border-gray-200">
                    Rs.
                  </span>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value !== "" ? Number(e.target.value) : "")}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Selling Price (LKR) <span className="text-red-500">*</span>
                  <span className="ml-1 text-[10px] text-gray-400">Customer pays</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-emerald-400">
                  <span className="px-3 py-2.5 text-xs font-bold text-gray-400 bg-gray-50 border-r border-gray-200">
                    Rs.
                  </span>
                  <input
                    type="number"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value !== "" ? Number(e.target.value) : "")}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Compare at Price (Optional)</label>
                <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden">
                  <span className="px-3 py-2.5 text-xs font-bold text-gray-400 bg-gray-50 border-r border-gray-200">
                    Rs.
                  </span>
                  <input
                    type="number"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value !== "" ? Number(e.target.value) : "")}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Profit Margin Banner */}
            {sellP > 0 && costP > 0 && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between border ${
                  sellP >= costP
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                <span>Estimated Profit: Rs. {(sellP - costP).toLocaleString()}</span>
                <span>Margin: {profitMargin}% profit</span>
              </div>
            )}

            {/* Tax Settings */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={taxInclusive}
                  onChange={(e) => setTaxInclusive(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-gray-700">Price includes tax (VAT)</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Tax Rate:</span>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800"
                >
                  {TAX_RATES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 5. INVENTORY & STOCK */}
          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Inventory &amp; Stock Levels</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">SKU <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Barcode Symbol</label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Barcode or EAN-13"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 text-center">Available Stock Quantity *</label>
                <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden">
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-center text-sm font-bold focus:outline-none"
                  />
                  <div className="flex flex-col border-l border-gray-200">
                    <button
                      type="button"
                      onClick={() => setQty((prev) => prev + 1)}
                      className="px-2 py-0.5 hover:bg-gray-100 border-b border-gray-200 text-xs font-bold"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => setQty((prev) => Math.max(0, prev - 1))}
                      className="px-2 py-0.5 hover:bg-gray-100 text-xs font-bold"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 text-center">Alert Stock Level</label>
                <input
                  type="number"
                  value={minLevel}
                  onChange={(e) => setMinLevel(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-center text-sm font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 text-center">Max Stock Level</label>
                <input
                  type="number"
                  value={maxLevel}
                  onChange={(e) => setMaxLevel(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-center text-sm font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* Level Bar Preview */}
            <div>
              <div className="flex justify-between text-[11px] font-bold text-gray-500 mb-1">
                <span>Stock Preview: {qty} units</span>
                <span>Min: {minLevel} | Max: {maxLevel}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    qty <= 0 ? "bg-red-500" : qty <= minLevel ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, (qty / Math.max(1, maxLevel)) * 100))}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trackInventory}
                  onChange={(e) => setTrackInventory(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-gray-700">Track stock quantity for this product</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={continueOOS}
                  onChange={(e) => setContinueOOS(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-gray-700">Continue selling when out of stock</span>
              </label>
            </div>
          </div>

          {/* 6. PRODUCT ORGANIZATION */}
          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Category, Brand &amp; Location</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700">Category *</label>
                  <button
                    type="button"
                    onClick={() => setShowNewCat(!showNewCat)}
                    className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> New
                  </button>
                </div>
                {showNewCat ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Category name"
                      className="flex-1 px-3 py-1.5 bg-white border rounded-lg text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={savingCat}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Subcategory */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700">Subcategory</label>
                  {categoryId && (
                    <button
                      type="button"
                      onClick={() => setShowNewSubCat(!showNewSubCat)}
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> New
                    </button>
                  )}
                </div>
                {showNewSubCat ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={newSubCatName}
                      onChange={(e) => setNewSubCatName(e.target.value)}
                      placeholder="Subcategory name"
                      className="flex-1 px-3 py-1.5 bg-white border rounded-lg text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleCreateSubCategory}
                      disabled={savingSubCat}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={subCategoryId}
                      onChange={(e) => setSubCategoryId(e.target.value)}
                      disabled={!categoryId}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Select Subcategory</option>
                      {subCategories.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Brand */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700">Brand</label>
                  {subCategoryId && (
                    <button
                      type="button"
                      onClick={() => setShowNewBrand(!showNewBrand)}
                      className="text-[11px] font-bold text-purple-600 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> New
                    </button>
                  )}
                </div>
                {showNewBrand ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      placeholder="Brand name"
                      className="flex-1 px-3 py-1.5 bg-white border rounded-lg text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleCreateBrand}
                      disabled={savingBrand}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={brandId}
                      onChange={(e) => setBrandId(e.target.value)}
                      disabled={!subCategoryId}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Select Brand</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Warehouse */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Warehouse Storage Location</label>
                <div className="relative">
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 cursor-pointer"
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} {w.code ? `(${w.code})` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Supplier</label>
                <div className="relative">
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 cursor-pointer"
                  >
                    <option value="">Select Supplier (Optional)</option>
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* 7. DISCOUNT SETTINGS */}
          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Product Discount Settings</h3>
                <p className="text-xs text-gray-400 font-medium">Configure primary and double (secondary) discount limits for POS cashiers</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDiscountEnabled(!isDiscountEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isDiscountEnabled ? "bg-emerald-500" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isDiscountEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {isDiscountEnabled && (
              <div className="space-y-4 pt-2 border-t border-gray-200">
                {/* Primary Discount */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Primary Discount Type</label>
                    <div className="relative">
                      <select
                        value={discountType}
                        onChange={(e: any) => setDiscountType(e.target.value)}
                        className="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 cursor-pointer"
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED_AMOUNT">Fixed Amount (LKR)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Max Primary Limit *</label>
                    <input
                      type="number"
                      value={maxAllowedDiscount}
                      onChange={(e) => setMaxAllowedDiscount(e.target.value !== "" ? Number(e.target.value) : "")}
                      placeholder={discountType === "PERCENTAGE" ? "e.g. 15%" : "e.g. 200 LKR"}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Default Primary Value</label>
                    <input
                      type="number"
                      value={defaultDiscountValue}
                      onChange={(e) => setDefaultDiscountValue(e.target.value !== "" ? Number(e.target.value) : "")}
                      placeholder={discountType === "PERCENTAGE" ? "e.g. 5%" : "e.g. 50 LKR"}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      min="0"
                    />
                  </div>
                </div>

                {/* Double / Secondary Discount Toggle & Inputs */}
                <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-purple-600" /> Enable Double (Secondary) Discount
                      </span>
                      <p className="text-[11px] text-purple-600 font-medium">Applied on the leftover balance after the 1st discount</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={hasSecondaryDiscount}
                      onChange={(e) => setHasSecondaryDiscount(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  </div>

                  {hasSecondaryDiscount && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-purple-200/60">
                      <div>
                        <label className="block text-xs font-bold text-purple-900 mb-1.5">Secondary Discount Type</label>
                        <div className="relative">
                          <select
                            value={secondaryDiscountType}
                            onChange={(e: any) => setSecondaryDiscountType(e.target.value)}
                            className="w-full appearance-none px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-gray-900 cursor-pointer"
                          >
                            <option value="PERCENTAGE">Percentage (%)</option>
                            <option value="FIXED_AMOUNT">Fixed Amount (LKR)</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-purple-400 absolute right-3 top-3 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-purple-900 mb-1.5">Max Secondary Limit</label>
                        <input
                          type="number"
                          value={maxSecondaryDiscount}
                          onChange={(e) => setMaxSecondaryDiscount(e.target.value !== "" ? Number(e.target.value) : "")}
                          placeholder={secondaryDiscountType === "PERCENTAGE" ? "e.g. 6%" : "e.g. 50 LKR"}
                          className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-purple-900 mb-1.5">Default Secondary Value</label>
                        <input
                          type="number"
                          value={defaultSecondaryDiscount}
                          onChange={(e) => setDefaultSecondaryDiscount(e.target.value !== "" ? Number(e.target.value) : "")}
                          placeholder="e.g. 2"
                          className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                          min="0"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 sm:p-6 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-full sm:w-auto py-3 px-6 rounded-xl text-xs font-black text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full sm:w-auto py-3 px-8 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md disabled:bg-emerald-400 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

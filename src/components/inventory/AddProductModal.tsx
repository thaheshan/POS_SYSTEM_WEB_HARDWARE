"use client";

import {
  X,
  Plus,
  ChevronDown,
  Upload,
  ImageIcon,
  Package,
  Tag,
  DollarSign,
  BarChart2,
  Layers,
  AlertCircle,
  Check,
  RefreshCw,
  Camera,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import api from "@/api/axiosInstance";
import { useAuth } from "@/hooks/useAuth";
import ImageOptionsModal from "./ImageOptionsModal";
import CameraCaptureModal from "./CameraCaptureModal";
import { toastError, toastSuccess } from "@/lib/toast";
import { printBarcodeLabels } from "@/utils/barcodePrintUtility";

interface Product {
  sku?: string;
  [key: string]: any;
}

const generateNextSku = (products: Product[]): string => {
  const skuPattern = /^SKU_(\d+)$/i;
  let maxNum = 0;

  products.forEach((p) => {
    if (p.sku && typeof p.sku === "string") {
      const match = p.sku.trim().match(skuPattern);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    }
  });

  const nextNum = maxNum + 1;
  const paddedNum = String(nextNum).padStart(3, "0");
  return `SKU_${paddedNum}`;
};

const generateNextBarcode = (products: Product[]): string => {
  const barcodePattern = /^200000(\d{6})$/;
  let maxNum = 0;

  products.forEach((p) => {
    if (p.barcode && typeof p.barcode === "string") {
      const match = p.barcode.trim().match(barcodePattern);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    }
  });

  const nextNum = maxNum + 1;
  return `200000${String(nextNum).padStart(6, "0")}`;
};

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TAX_RATES = [
  { label: "No Tax (0%)", value: "0" },
  { label: "VAT (18%)", value: "18" },
];

export const ALL_MEASUREMENT_UNITS = [
  {
    category: "Count / Packaging",
    units: [
      "Pieces (pcs)",
      "Boxes (box)",
      "Packs (pk)",
      "Sets (set)",
      "Pairs (pr)",
      "Rolls (roll)",
      "Bags (bag)",
      "Bundles (bdl)",
      "Cartons (ctn)",
      "Dozen (dz)",
      "Sheets (sht)",
      "Barrels (bbl)",
      "Coils (coil)",
      "Drums (drum)",
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
      "Pounds (lbs)",
    ],
  },
  {
    category: "Volume / Liquid",
    units: [
      "Liters (L)",
      "Milliliters (ml)",
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

function SectionHeader({
  icon: Icon,
  label,
  sub,
  color = "emerald",
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    purple: "bg-purple-500",
    rose: "bg-rose-500",
  };
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className={`w-8 h-8 ${colorMap[color] ?? "bg-emerald-500"} rounded-lg flex items-center justify-center flex-shrink-0`}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-[13px] font-black text-gray-900">{label}</p>
        <p className="text-[11px] font-medium text-gray-400">{sub}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all placeholder:text-gray-300";
const selectCls =
  "w-full appearance-none px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all cursor-pointer";

export default function AddProductModal({
  isOpen,
  onClose,
  onSuccess,
}: AddProductModalProps) {
  const { user } = useAuth();
  const isOwnerOrAdmin = user?.role === "owner" || user?.role === "admin";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [existingProducts, setExistingProducts] = useState<Product[]>([]);
  const existingProductsRef = useRef<Product[]>([]);

  const [categories, setCategories] = useState<{ id: string; name: string; subcategories?: { id: string; name: string; brands?: { id: string; name: string }[] }[]; brands?: { id: string; name: string }[] }[]>(
    [],
  );
  const [subCategories, setSubCategories] = useState<
    { id: string; name: string; brands?: { id: string; name: string }[] }[]
  >([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [warehouses, setWarehouses] = useState<
    { id: string; name: string; code?: string }[]
  >([]);
  const [newCatName, setNewCatName] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);
  const [savingCat, setSavingCat] = useState(false);
  const [newSubCatName, setNewSubCatName] = useState("");
  const [showNewSubCat, setShowNewSubCat] = useState(false);
  const [savingSubCat, setSavingSubCat] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);

  /* ─── Auto-load subcategories when category changes ─── */

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setSavingCat(true);
    try {
      const res = await api.post("/products/categories", { name: newCatName.trim() });
      const cat = res.data?.data || res.data;
      const newEntry = { id: cat.id, name: cat.name, subcategories: [] };
      setCategories(prev => [...prev, newEntry].sort((a, b) => a.name.localeCompare(b.name)));
      set("categoryId", cat.id);
      setNewCatName("");
      setShowNewCat(false);
      toastSuccess(`Category "${cat.name}" created!`);
    } catch {
      toastError("Failed to create category");
    } finally {
      setSavingCat(false);
    }
  };

  const handleCreateSubcategory = async () => {
    if (!newSubCatName.trim() || !form.categoryId) return;
    setSavingSubCat(true);
    try {
      const res = await api.post(`/products/categories/${form.categoryId}/subcategories`, { name: newSubCatName.trim() });
      const sub = res.data?.data || res.data;
      const newEntry = { id: sub.id, name: sub.name };
      setSubCategories(prev => [...prev, newEntry].sort((a, b) => a.name.localeCompare(b.name)));
      // Also update the parent in categories list
      setCategories(prev => prev.map(c => c.id === form.categoryId
        ? { ...c, subcategories: [...(c.subcategories || []), newEntry] }
        : c
      ));
      set("subCategoryId", sub.id);
      setNewSubCatName("");
      setShowNewSubCat(false);
      toastSuccess(`Subcategory "${sub.name}" created!`);
    } catch {
      toastError("Failed to create subcategory");
    } finally {
      setSavingSubCat(false);
    }
  };

  const handleCreateBrand = async () => {
    if (!newBrandName.trim() || !form.subCategoryId) return;
    setSavingBrand(true);
    try {
      const res = await api.post(`/products/brands`, { name: newBrandName.trim(), categoryId: form.subCategoryId });
      const brand = res.data?.data || res.data;
      const newEntry = { id: brand.id, name: brand.name };
      setBrands(prev => [...prev, newEntry].sort((a, b) => a.name.localeCompare(b.name)));
      set("brandId", brand.id);
      setNewBrandName("");
      setShowNewBrand(false);
      toastSuccess(`Brand "${brand.name}" created!`);
    } catch {
      toastError("Failed to create brand");
    } finally {
      setSavingBrand(false);
    }
  };

const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const [form, setForm] = useState({
    // Basic Info
    name: "",
    description: "",
    shortDescription: "",
    // Product Type
    productType: "FIX", // FIX | LOOSE
    unit: "Pieces",
    // Pricing
    costPrice: "",
    sellingPrice: "",
    comparePrice: "",
    taxInclusive: false,
    taxRate: "18",
    // Inventory
    sku: "",
    barcode: "",
    trackInventory: true,
    initialStock: "0",
    minimumStock: "10",
    continueOOS: false,
    // Organization
    categoryId: "",
    subCategoryId: "",
    brandId: "",
    supplierId: "",
    warehouseId: "",
    // Image
    imageFile: null as File | null,
    // Discount settings
    isDiscountEnabled: false,
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    maxAllowedDiscount: "" as number | "",
    defaultDiscountValue: "" as number | "",
    // Barcode Printing Configuration
    autoPrintBarcode: false,
    barcodePrintSize: "2.0x1.0" as '2.0x1.0' | '1.5x1.0' | '1.25x1.0' | '1.0x0.5',
    barcodePrintQty: "1",
  });

  /* ─── Derived ─── */
  const profitMargin = (() => {
    const cost = parseFloat(form.costPrice) || 0;
    const sell = parseFloat(form.sellingPrice) || 0;
    if (sell === 0) return 0;
    return (((sell - cost) / sell) * 100).toFixed(2);
  })();

  /* ─── Auto-load subcategories when category changes ─── */
  useEffect(() => {
    if (!form.categoryId) {
      setSubCategories([]);
      setBrands([]);
      setShowNewSubCat(false);
      return;
    }
    // Always fetch fresh from API to ensure latest data; seed with cache immediately if available
    const parent = categories.find(c => c.id === form.categoryId);
    if (parent?.subcategories && parent.subcategories.length > 0) {
      const sorted = [...parent.subcategories].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base", numeric: true })
      );
      setSubCategories(sorted);
    }
    // Always also fetch from API to get fresh data (catches newly created subcategories)
    api.get(`/products/categories/${form.categoryId}/subcategories`)
      .then(res => {
        const raw = res.data?.data || res.data || [];
        const arr = Array.isArray(raw) ? raw : [];
        if (arr.length > 0) {
          const sorted = [...arr].sort((a, b) =>
            (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base", numeric: true })
          );
          setSubCategories(sorted);
        }
      })
      .catch(() => {/* keep cache if API fails */});

    set("subCategoryId", "");
    set("brandId", "");
    setBrands([]);
    setShowNewSubCat(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.categoryId]);

  /* ─── Auto-load brands when subcategory changes ─── */
  useEffect(() => {
    if (!form.subCategoryId) {
      setBrands([]);
      set("brandId", "");
      setShowNewBrand(false);
      return;
    }
    // Seed from cache if available, then always fetch fresh from API
    const sub = subCategories.find(s => s.id === form.subCategoryId);
    if (sub?.brands && sub.brands.length > 0) {
      const sorted = [...sub.brands].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base", numeric: true })
      );
      setBrands(sorted);
    }
    // Always fetch from API for fresh / newly added brands
    api.get(`/products/brands`, { params: { subcategoryId: form.subCategoryId } })
      .then(res => {
        const raw = res.data?.data || res.data || [];
        const arr = Array.isArray(raw) ? raw : [];
        const sorted = [...arr].sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base", numeric: true })
        );
        setBrands(sorted); // API is authoritative
      })
      .catch(() => {/* keep cache if API fails */});

    set("brandId", "");
    setShowNewBrand(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.subCategoryId, subCategories]);

  /* ─── Fetch dropdown data on open ─── */
  useEffect(() => {
    if (!isOpen) return;
    resetForm();
    fetchDropdowns();
  }, [isOpen]);

  const fetchDropdowns = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes, whRes] = await Promise.allSettled([
        api.get("/products/categories"),
        api.get("/products"),
        api.get("/warehouses"),
      ]);

      if (catRes.status === "fulfilled") {
        const catData = catRes.value.data;
        const arr = Array.isArray(catData)
          ? catData
          : catData?.data || catData?.categories || [];
        if (Array.isArray(arr)) {
          const mappedCats = arr.map((c) =>
            typeof c === "string" ? { id: c, name: c } : c,
          );
          setCategories(mappedCats);
        } else {
          setCategories([]);
        }
      }

      let productsList: Product[] = [];
      if (prodRes.status === "fulfilled") {
        const prodData = prodRes.value.data;
        productsList = Array.isArray(prodData)
          ? prodData
          : prodData?.data || prodData?.products || [];
        if (!Array.isArray(productsList)) productsList = [];
        setExistingProducts(productsList);
        existingProductsRef.current = productsList;
      }

      if (whRes.status === "fulfilled") {
        const whData = whRes.value.data?.data || whRes.value.data || [];
        const mappedWh = Array.isArray(whData)
          ? whData.map((w: any) => ({ id: w.id, name: w.name, code: w.code }))
          : [];
        setWarehouses(mappedWh);
        // Auto-select the first active warehouse
        if (mappedWh.length > 0) {
          setForm((prev) => ({ ...prev, warehouseId: mappedWh[0].id }));
        }
      }

      // suppliers not fetched from a dedicated endpoint yet
      setSuppliers([]);

      // Auto-generate SKU & Barcode based on existing products
      const nextSku = generateNextSku(productsList);
      const nextBarcode = generateNextBarcode(productsList);
      setForm((prev) => ({ ...prev, sku: nextSku, barcode: nextBarcode }));
    } catch {
      // non-fatal — dropdowns will be empty
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      shortDescription: "",
      productType: "FIX",
      unit: "Pieces",
      costPrice: "",
      sellingPrice: "",
      comparePrice: "",
      taxInclusive: false,
      taxRate: "18",
      sku: "",
      barcode: "",
      trackInventory: true,
      initialStock: "0",
      minimumStock: "10",
      continueOOS: false,
      categoryId: "",
      subCategoryId: "",
      brandId: "",
      supplierId: "",
      warehouseId: warehouses.length > 0 ? warehouses[0].id : "",
      imageFile: null,
      isDiscountEnabled: false,
      discountType: "PERCENTAGE",
      maxAllowedDiscount: "",
      defaultDiscountValue: "",
      hasSecondaryDiscount: false,
      secondaryDiscountType: "PERCENTAGE",
      maxSecondaryDiscount: "",
      defaultSecondaryDiscount: "",
      autoPrintBarcode: false,
      barcodePrintSize: "2.0x1.0",
      barcodePrintQty: "1",
    });
    setPreviewUrl(null);
    setErrors({});
  };

  const set = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      set(name, checked);
    } else {
      set(name, value);
    }
  };

  /* ─── Image handling ─── */
  const handleImageFile = (file: File) => {
    set("imageFile", file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleImageFile(file);
  };

  /* ─── Validation ─── */
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Product name is required";
    if (!form.sku.trim()) errs.sku = "SKU is required";
    if (!form.sellingPrice || parseFloat(form.sellingPrice) <= 0) {
      errs.sellingPrice = "Valid selling price is required";
    }
    if (!form.categoryId) errs.categoryId = "Category is required";

    if (form.isDiscountEnabled) {
      const maxVal = parseFloat(String(form.maxAllowedDiscount));
      if (form.maxAllowedDiscount === "" || isNaN(maxVal) || maxVal < 0) {
        errs.maxAllowedDiscount =
          "Maximum allowed discount is required and must be positive";
      } else if (form.discountType === "PERCENTAGE" && maxVal > 100) {
        errs.maxAllowedDiscount = "Percentage discount cannot exceed 100%";
      }
      if (form.defaultDiscountValue !== "") {
        const defaultVal = parseFloat(String(form.defaultDiscountValue));
        if (isNaN(defaultVal) || defaultVal < 0) {
          errs.defaultDiscountValue =
            "Default discount value must be positive";
        } else if (!isNaN(maxVal) && defaultVal > maxVal) {
          errs.defaultDiscountValue =
            "Default discount value cannot exceed the maximum allowed discount";
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ─── Submit ─── */
  const handleSubmit = async (draft = false) => {
    if (!validate()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("sku", form.sku.trim());
      formData.append("categoryId", form.categoryId);
      if (form.subCategoryId) {
        formData.append("subcategoryId", form.subCategoryId);
        formData.append("subCategoryId", form.subCategoryId);
      }
      if (form.brandId) formData.append("brandId", form.brandId);
      formData.append(
        "sellingPrice",
        (parseFloat(form.sellingPrice) || 0).toString(),
      );
      formData.append(
        "purchasePrice",
        (parseFloat(form.costPrice) || 0).toString(),
      );
      formData.append(
        "minimumStockLevel",
        (parseInt(form.minimumStock) || 10).toString(),
      );
      formData.append(
        "initialStock",
        (parseInt(form.initialStock) || 0).toString(),
      );
      formData.append("taxCategory", "STANDARD_VAT");
      formData.append("taxRate", (parseFloat(form.taxRate) || 18).toString());

      if (form.description?.trim())
        formData.append("description", form.description.trim());
      if (form.imageFile) formData.append("imageFile", form.imageFile);
      if (form.barcode?.trim()) {
        formData.append("barcode", form.barcode.trim());
      }

      // Backend will create the initial stock entry in this warehouse
      if (form.warehouseId) {
        formData.append("warehouseId", form.warehouseId);
      }

      const res = await api.post("/products", formData);
      const newProduct = res.data?.data || res.data;

      if (newProduct?.id) {
        // Update discount configuration (always update this if provided)
        await api.patch(`/products/${newProduct.id}/discount-config`, {
          isDiscountEnabled: form.isDiscountEnabled,
          discountType: form.discountType,
          maxAllowedDiscount: form.isDiscountEnabled
            ? parseFloat(String(form.maxAllowedDiscount)) || 0
            : 0,
          defaultDiscountValue:
            form.isDiscountEnabled && form.defaultDiscountValue !== ""
              ? parseFloat(String(form.defaultDiscountValue)) || 0
              : 0,
          hasSecondaryDiscount: form.isDiscountEnabled ? form.hasSecondaryDiscount : false,
          secondaryDiscountType: form.secondaryDiscountType,
          maxSecondaryDiscount:
            form.isDiscountEnabled && form.hasSecondaryDiscount
              ? parseFloat(String(form.maxSecondaryDiscount)) || 0
              : 0,
          defaultSecondaryDiscount:
            form.isDiscountEnabled && form.hasSecondaryDiscount && form.defaultSecondaryDiscount !== ""
              ? parseFloat(String(form.defaultSecondaryDiscount)) || 0
              : 0,
        });

        // Handle Auto-Approval for Shop Owner role
        const isOwner = user?.role === "owner";
        if (form.isDiscountEnabled && isOwner) {
          await api.patch(`/products/${newProduct.id}/discount-approval`, {
            isDiscountApproved: true,
          });
        }
      }

      toastSuccess("Product saved successfully.");

      if (form.autoPrintBarcode) {
        printBarcodeLabels({
          productName: newProduct?.name || form.name,
          barcode: newProduct?.barcode || form.barcode,
          price: newProduct?.sellingPrice || form.sellingPrice,
          size: form.barcodePrintSize,
          quantity: parseInt(form.barcodePrintQty) || 1,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to create product", err);
      toastError(err, "We couldn't save the product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCameraCapture = (file: File) => {
    handleImageFile(file);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Container */}
        <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-5xl flex flex-col max-h-[96vh] sm:max-h-[94vh] overflow-hidden">
          {/* ── TOP BAR ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-7 sm:py-5 border-b border-gray-100 flex-shrink-0 bg-white gap-3">
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                Products &rsaquo; All Products &rsaquo; Add Product
              </p>
              <h2 className="text-[18px] sm:text-[20px] font-black text-gray-900 tracking-tight">
                Add New Product
              </h2>
              <p className="text-[11px] sm:text-[12px] text-gray-400 font-medium">
                Add a new product to your inventory
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
              <button
                onClick={onClose}
                className="py-2 px-3 sm:py-2.5 sm:px-5 rounded-xl text-xs sm:text-[13px] font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all flex-1 sm:flex-initial"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={saving}
                className="py-2 px-3 sm:py-2.5 sm:px-5 rounded-xl text-xs sm:text-[13px] font-bold text-gray-700 border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Save Draft
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={saving}
                className="py-2 px-4 sm:py-2.5 sm:px-6 rounded-xl text-xs sm:text-[13px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-1.5 flex-1 sm:flex-initial active:scale-95"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" /> Save &amp; Publish
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all ml-1 shrink-0"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* ── BODY ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-0">
              {/* ──── LEFT COLUMN ──── */}
              <div className="flex-1 p-4 sm:p-7 space-y-6 border-b lg:border-b-0 lg:border-r border-gray-100 min-w-0">
                {/* 1. Basic Information */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <SectionHeader
                    icon={Package}
                    label="Basic Information"
                    sub="Essential product details"
                  />

                  <div className="space-y-4">
                    <Field label="Product Name" required>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. iPhone 15 Pro Max - 256GB"
                        className={`${inputCls} ${errors.name ? "border-red-300 ring-2 ring-red-100" : ""}`}
                      />
                      {errors.name && (
                        <p className="text-[11px] text-red-500 mt-1 font-medium">
                          {errors.name}
                        </p>
                      )}
                    </Field>

                    <Field label="Description">
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Enter product description…"
                        className={`${inputCls} resize-none`}
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        Detailed product description customers will see
                      </p>
                    </Field>

                    <Field label="Short Description">
                      <input
                        name="shortDescription"
                        value={form.shortDescription}
                        onChange={handleChange}
                        placeholder="Start product summary for listings…"
                        className={inputCls}
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        Appears in product listings and receipts
                      </p>
                    </Field>
                  </div>
                </div>

                {/* 2. Product Media */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <SectionHeader
                    icon={ImageIcon}
                    label="Product Media"
                    sub="Photos and images"
                    color="blue"
                  />

                  <p className="text-[12px] font-bold text-gray-600 mb-3">
                    Product Images
                  </p>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => setShowImageOptions(true)}
                    className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${dragOver ? "border-emerald-400 bg-emerald-50" : "border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50/40"}`}
                  >
                    {previewUrl ? (
                      <div className="relative group">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-40 rounded-xl object-contain"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-[12px] font-bold">
                            Click to change
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                            <Upload className="w-5 h-5 text-blue-500" />
                          </div>
                          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                            <Camera className="w-5 h-5 text-emerald-500" />
                          </div>
                        </div>
                        <p className="text-[13px] font-bold text-gray-600">
                          Click to upload or take a photo
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          PNG, JPG, WEBP up to 5MB · Recommended: 1200×900px
                        </p>
                      </>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImageFile(f);
                      }}
                    />
                  </div>
                  {previewUrl && (
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[11px] text-gray-400">
                        Primary product image.
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewUrl(null);
                          set("imageFile", null);
                        }}
                        className="text-[11px] font-bold text-red-400 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Pricing */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <SectionHeader
                    icon={DollarSign}
                    label="Pricing"
                    sub="Product pricing and cost"
                    color="amber"
                  />

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Field label="Cost Price" required>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400">
                          Rs.
                        </span>
                        <input
                          name="costPrice"
                          type="number"
                          value={form.costPrice}
                          onChange={handleChange}
                          placeholder="0.00"
                          className={`${inputCls} pl-10`}
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        What you pay to source / make this product
                      </p>
                    </Field>
                    <Field label="Selling Price" required>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400">
                          Rs.
                        </span>
                        <input
                          name="sellingPrice"
                          type="number"
                          value={form.sellingPrice}
                          onChange={handleChange}
                          placeholder="0.00"
                          className={`${inputCls} pl-10 ${errors.sellingPrice ? "border-red-300 ring-2 ring-red-100" : ""}`}
                        />
                      </div>
                      {errors.sellingPrice && (
                        <p className="text-[11px] text-red-500 mt-1 font-medium">
                          {errors.sellingPrice}
                        </p>
                      )}
                      <p className="text-[11px] text-gray-400 mt-1">
                        Regular price customers pay
                      </p>
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Field label="Compare at Price (Optional)">
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400">
                          Rs.
                        </span>
                        <input
                          name="comparePrice"
                          type="number"
                          value={form.comparePrice}
                          onChange={handleChange}
                          placeholder="0.00"
                          className={`${inputCls} pl-10`}
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Original price shown as discounted
                      </p>
                    </Field>
                    <div>
                      <label className="block text-[12px] font-bold text-gray-600 mb-1.5">
                        Profit Margin
                      </label>
                      <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
                        <span
                          className={`text-[22px] font-black ${Number(profitMargin) < 0 ? "text-red-500" : "text-emerald-600"}`}
                        >
                          {profitMargin}%
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Auto-calculated profit percentage
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 mb-4">
                    <button
                      type="button"
                      onClick={() => set("taxInclusive", !form.taxInclusive)}
                      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${form.taxInclusive ? "bg-emerald-600 border-emerald-600" : "border-gray-300"}`}
                    >
                      {form.taxInclusive && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                    <div>
                      <p className="text-[12.5px] font-bold text-gray-700">
                        Price includes tax
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Tax is already included in the selling price
                      </p>
                    </div>
                  </div>

                  <Field label="Tax Rate">
                    <div className="relative">
                      <select
                        name="taxRate"
                        value={form.taxRate}
                        onChange={handleChange}
                        className={selectCls}
                      >
                        {TAX_RATES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </Field>
                </div>

                {/* 4. Inventory & Stock */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <SectionHeader
                    icon={BarChart2}
                    label="Inventory & Stock"
                    sub="Stock management settings"
                    color="purple"
                  />

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Field label="SKU (Stock Keeping Unit)" required>
                      <input
                        name="sku"
                        value={form.sku}
                        onChange={handleChange}
                        placeholder="Unique product identifier"
                        className={`${inputCls} ${errors.sku ? "border-red-300 ring-2 ring-red-100" : ""}`}
                      />
                      {errors.sku && (
                        <p className="text-[11px] text-red-500 mt-1 font-medium">
                          {errors.sku}
                        </p>
                      )}
                      <p className="text-[11px] text-gray-400 mt-1">
                        Auto-generated — edit if you need a custom SKU
                      </p>
                    </Field>
                    <Field label="Barcode">
                      <input
                        name="barcode"
                        value={form.barcode}
                        onChange={handleChange}
                        placeholder="UPC, EAN, ISBN or custom barcode"
                        className={inputCls}
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        Auto-generated — starts with '200' for local store use
                      </p>
                    </Field>
                  </div>

                  {/* Dynamic Barcode Thermal Label Generator UI */}
                  <div className="mb-5 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[13px] font-bold text-gray-800">
                          Print Barcode Label on Save
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Automatically spool barcode labels to thermal printer
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => set("autoPrintBarcode", !form.autoPrintBarcode)}
                        className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                          form.autoPrintBarcode ? "bg-emerald-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform duration-200 ${
                            form.autoPrintBarcode ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {form.autoPrintBarcode && (
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-emerald-100/50">
                        <Field label="Label Dimensions (Inches)">
                          <div className="relative">
                            <select
                              name="barcodePrintSize"
                              value={form.barcodePrintSize}
                              onChange={handleChange}
                              className={inputCls}
                            >
                              <option value="2.0x1.0">2.0" × 1.0" (Standard)</option>
                              <option value="1.5x1.0">1.5" × 1.0" (Compact)</option>
                              <option value="1.25x1.0">1.25" × 1.0" (Mini)</option>
                              <option value="1.0x0.5">1.0" × 0.5" (Micro)</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </Field>
                        <Field label="Print Quantity">
                          <input
                            type="number"
                            name="barcodePrintQty"
                            min="1"
                            value={form.barcodePrintQty}
                            onChange={handleChange}
                            placeholder="1"
                            className={inputCls}
                          />
                        </Field>
                      </div>
                    )}
                  </div>

                  {/* Track inventory toggle */}
                  <div className="flex items-center justify-between mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-[13px] font-bold text-gray-800">
                        Track inventory for this product
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Enable stock quantity tracking
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        set("trackInventory", !form.trackInventory)
                      }
                      className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${form.trackInventory ? "bg-emerald-500" : "bg-gray-300"}`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${form.trackInventory ? "left-6" : "left-0.5"}`}
                      />
                    </button>
                  </div>

                  {form.trackInventory && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Available Quantity">
                          <input
                            name="initialStock"
                            type="number"
                            value={form.initialStock}
                            onChange={handleChange}
                            className={inputCls}
                            min="0"
                          />
                        </Field>
                        <Field label="Alert when sold below">
                          <input
                            name="minimumStock"
                            type="number"
                            value={form.minimumStock}
                            onChange={handleChange}
                            className={inputCls}
                            min="0"
                          />
                        </Field>
                      </div>

                      <div className="flex items-center gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => set("continueOOS", !form.continueOOS)}
                          className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${form.continueOOS ? "bg-emerald-600 border-emerald-600" : "border-gray-300"}`}
                        >
                          {form.continueOOS && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </button>
                        <div>
                          <p className="text-[12.5px] font-bold text-gray-700">
                            Continue selling when out of stock
                          </p>
                          <p className="text-[11px] text-gray-400">
                            Allows customers to purchase when stock hits 0
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Product Variants (expandable hint) */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                        <Layers className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-gray-900">
                          Product Variants
                        </p>
                        <p className="text-[11px] font-medium text-gray-400">
                          Add variants like size, color, etc.
                        </p>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Product Discount Settings — Owner/Admin only */}
                {isOwnerOrAdmin && (
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <SectionHeader
                      icon={Tag}
                      label="Product Discount Settings"
                      sub="Configure maximum allowed discounts for POS"
                      color="rose"
                    />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-[12.5px] font-bold text-gray-700">
                            Enable Product Discount
                          </label>
                          <p className="text-[11px] text-gray-400">
                            Allow cashiers to apply discounts on this item
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            set("isDiscountEnabled", !form.isDiscountEnabled)
                          }
                          className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${form.isDiscountEnabled ? "bg-emerald-500" : "bg-gray-300"}`}
                        >
                          <div
                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${form.isDiscountEnabled ? "left-6" : "left-0.5"}`}
                          />
                        </button>
                      </div>

                      {form.isDiscountEnabled && (
                        <div className="space-y-4 animate-in fade-in duration-150">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Field label="Primary Discount Type">
                              <div className="relative">
                                <select
                                  name="discountType"
                                  value={form.discountType}
                                  onChange={handleChange}
                                  className={selectCls}
                                >
                                  <option value="PERCENTAGE">
                                    Percentage (%)
                                  </option>
                                  <option value="FIXED_AMOUNT">
                                    Fixed Amount (LKR)
                                  </option>
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </Field>

                            <Field label="Max Allowed Limit">
                              <input
                                name="maxAllowedDiscount"
                                type="number"
                                value={form.maxAllowedDiscount}
                                onChange={handleChange}
                                placeholder={
                                  form.discountType === "PERCENTAGE"
                                    ? "e.g. 15"
                                    : "e.g. 200"
                                }
                                className={`${inputCls} ${errors.maxAllowedDiscount ? "border-red-300 ring-2 ring-red-100" : ""}`}
                                min="0"
                              />
                              {errors.maxAllowedDiscount && (
                                <p className="text-[11px] text-red-500 mt-1 font-medium">
                                  {errors.maxAllowedDiscount}
                                </p>
                              )}
                            </Field>

                            <Field label="Default Value (Opt)">
                              <input
                                name="defaultDiscountValue"
                                type="number"
                                value={form.defaultDiscountValue}
                                onChange={handleChange}
                                placeholder={
                                  form.discountType === "PERCENTAGE"
                                    ? "e.g. 5"
                                    : "e.g. 50"
                                }
                                className={`${inputCls} ${errors.defaultDiscountValue ? "border-red-300 ring-2 ring-red-100" : ""}`}
                                min="0"
                              />
                              {errors.defaultDiscountValue && (
                                <p className="text-[11px] text-red-500 mt-1 font-medium">
                                  {errors.defaultDiscountValue}
                                </p>
                              )}
                            </Field>
                          </div>

                          {/* Double / Secondary Discount Toggle & Inputs */}
                          <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[12px] font-black text-purple-900 flex items-center gap-1.5">
                                  <Tag className="w-3.5 h-3.5 text-purple-600" /> Enable Double (Secondary) Discount
                                </span>
                                <p className="text-[11px] text-purple-600 font-medium">Applied on the leftover balance after 1st discount</p>
                              </div>
                              <input
                                type="checkbox"
                                checked={form.hasSecondaryDiscount}
                                onChange={(e) => set("hasSecondaryDiscount", e.target.checked)}
                                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                              />
                            </div>

                            {form.hasSecondaryDiscount && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-purple-200/60 animate-in fade-in duration-150">
                                <Field label="Secondary Type">
                                  <div className="relative">
                                    <select
                                      name="secondaryDiscountType"
                                      value={form.secondaryDiscountType}
                                      onChange={handleChange}
                                      className={selectCls}
                                    >
                                      <option value="PERCENTAGE">Percentage (%)</option>
                                      <option value="FIXED_AMOUNT">Fixed Amount (LKR)</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-purple-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                  </div>
                                </Field>

                                <Field label="Max Secondary Limit">
                                  <input
                                    name="maxSecondaryDiscount"
                                    type="number"
                                    value={form.maxSecondaryDiscount}
                                    onChange={handleChange}
                                    placeholder={form.secondaryDiscountType === "PERCENTAGE" ? "e.g. 6%" : "e.g. 50"}
                                    className={inputCls}
                                    min="0"
                                  />
                                </Field>

                                <Field label="Default Secondary Val">
                                  <input
                                    name="defaultSecondaryDiscount"
                                    type="number"
                                    value={form.defaultSecondaryDiscount}
                                    onChange={handleChange}
                                    placeholder="e.g. 2"
                                    className={inputCls}
                                    min="0"
                                  />
                                </Field>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ──── RIGHT COLUMN ──── */}
              <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0 p-4 sm:p-6 space-y-5 bg-gray-50/50">
                {/* Product Type */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-[12px] font-black text-gray-500 uppercase tracking-widest mb-4">
                    Product Type
                  </p>

                  {/* Fix Product */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all mb-3 ${form.productType === "FIX" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <input
                      type="radio"
                      name="productType"
                      value="FIX"
                      checked={form.productType === "FIX"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${form.productType === "FIX" ? "border-emerald-500" : "border-gray-300"}`}
                    >
                      {form.productType === "FIX" && (
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="text-[12.5px] font-black text-gray-800">
                        Fix Product
                      </p>
                      <p className="text-[10.5px] text-gray-500 font-medium">
                        Countable by Number
                      </p>
                    </div>
                  </label>

                  {/* Loose Product */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${form.productType === "LOOSE" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <input
                      type="radio"
                      name="productType"
                      value="LOOSE"
                      checked={form.productType === "LOOSE"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${form.productType === "LOOSE" ? "border-emerald-500" : "border-gray-300"}`}
                    >
                      {form.productType === "LOOSE" && (
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="text-[12.5px] font-black text-gray-800">
                        Loose Product
                      </p>
                      <p className="text-[10.5px] text-gray-500 font-medium">
                        Countable by Measurement
                      </p>
                    </div>
                  </label>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                      Measurement Unit <span className="text-gray-400 font-normal">(e.g. Pieces, Meters, Kg, Boxes, Liters)</span>
                    </label>
                    <div className="relative">
                      <select
                        name="unit"
                        value={form.unit || "Pieces (pcs)"}
                        onChange={handleChange}
                        className={selectCls}
                      >
                        {ALL_MEASUREMENT_UNITS.map((group) => (
                          <optgroup key={group.category} label={group.category}>
                            {group.units.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Product Organization */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-[12px] font-black text-gray-500 uppercase tracking-widest mb-4">
                    Product Organization
                  </p>

                  <div className="space-y-3">
                    {/* Category */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold text-gray-500">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => { setShowNewCat(v => !v); setShowNewSubCat(false); }}
                          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> New
                        </button>
                      </div>
                      {showNewCat && (
                        <div className="flex gap-1 mb-2">
                          <input
                            autoFocus
                            value={newCatName}
                            onChange={e => setNewCatName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleCreateCategory(); if (e.key === 'Escape') setShowNewCat(false); }}
                            placeholder="Category name…"
                            className="flex-1 px-2.5 py-1.5 text-[12px] bg-white border border-emerald-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-300"
                          />
                          <button
                            type="button"
                            disabled={savingCat || !newCatName.trim()}
                            onClick={handleCreateCategory}
                            className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] font-bold disabled:opacity-50"
                          >
                            {savingCat ? '…' : <Check className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                      <div className="relative">
                        <select
                          name="categoryId"
                          value={form.categoryId}
                          onChange={handleChange}
                          className={`${selectCls} text-[12px] ${errors.categoryId ? "border-red-300 ring-2 ring-red-100" : ""}`}
                        >
                          <option value="">Select Category</option>
                          {loading && <option disabled>Loading…</option>}
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}{c.subcategories && c.subcategories.length > 0 ? ` (${c.subcategories.length} subs)` : ''}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      {errors.categoryId && (
                        <p className="text-[10.5px] text-red-500 mt-1 font-medium">
                          {errors.categoryId}
                        </p>
                      )}
                    </div>

                    {/* Subcategory — only shows when a category is selected */}
                    {form.categoryId && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-[11px] font-bold text-gray-500">
                            Subcategory <span className="text-gray-400 font-normal">(optional)</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => { setShowNewSubCat(v => !v); setShowNewCat(false); }}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> New
                          </button>
                        </div>
                        {showNewSubCat && (
                          <div className="flex gap-1 mb-2">
                            <input
                              autoFocus
                              value={newSubCatName}
                              onChange={e => setNewSubCatName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleCreateSubcategory(); if (e.key === 'Escape') setShowNewSubCat(false); }}
                              placeholder="Subcategory name…"
                              className="flex-1 px-2.5 py-1.5 text-[12px] bg-white border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <button
                              type="button"
                              disabled={savingSubCat || !newSubCatName.trim()}
                              onClick={handleCreateSubcategory}
                              className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-bold disabled:opacity-50"
                            >
                              {savingSubCat ? '…' : <Check className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                        <div className="relative">
                          <select
                            name="subCategoryId"
                            value={form.subCategoryId}
                            onChange={handleChange}
                            className={`${selectCls} text-[12px]`}
                          >
                            <option value="">Select subcategory</option>
                            {subCategories.length === 0 && (
                              <option disabled>No subcategories yet — create one above</option>
                            )}
                            {subCategories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    )}

                    {/* Brand — only shows when a subcategory is selected */}
                    {form.subCategoryId && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-[11px] font-bold text-gray-500">
                            Brand <span className="text-gray-400 font-normal">(optional)</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => { setShowNewBrand(v => !v); setShowNewSubCat(false); }}
                            className="text-[10px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> New
                          </button>
                        </div>
                        {showNewBrand && (
                          <div className="flex gap-1 mb-2">
                            <input
                              autoFocus
                              value={newBrandName}
                              onChange={e => setNewBrandName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleCreateBrand(); if (e.key === 'Escape') setShowNewBrand(false); }}
                              placeholder="Brand name…"
                              className="flex-1 px-2.5 py-1.5 text-[12px] bg-white border border-purple-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-300"
                            />
                            <button
                              type="button"
                              disabled={savingBrand || !newBrandName.trim()}
                              onClick={handleCreateBrand}
                              className="px-2.5 py-1.5 bg-purple-600 text-white rounded-lg text-[11px] font-bold disabled:opacity-50"
                            >
                              {savingBrand ? '…' : <Check className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                        <div className="relative">
                          <select
                            name="brandId"
                            value={form.brandId}
                            onChange={handleChange}
                            className={`${selectCls} text-[12px]`}
                          >
                            <option value="">Select brand</option>
                            {brands.length === 0 && (
                              <option disabled>No brands yet — create one above</option>
                            )}
                            {brands.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Warehouse Location */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-[12px] font-black text-gray-500 uppercase tracking-widest mb-1">
                    Warehouse Location
                  </p>
                  <p className="text-[10.5px] text-gray-400 font-medium mb-3">
                    Initial stock will be stored here
                  </p>
                  <div className="relative">
                    <select
                      name="warehouseId"
                      value={form.warehouseId}
                      onChange={handleChange}
                      className={`${selectCls} text-[12px] ${!form.warehouseId ? "border-amber-300" : ""}`}
                    >
                      <option value="">Select Warehouse</option>
                      {loading && <option disabled>Loading…</option>}
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                          {w.code ? ` (${w.code})` : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {warehouses.length === 0 && !loading && (
                    <p className="text-[10.5px] text-amber-600 mt-1.5 font-medium">
                      ⚠ No warehouses found.{" "}
                      <span className="font-bold">Add a warehouse first</span>{" "}
                      to assign stock location.
                    </p>
                  )}
                  {form.warehouseId && (
                    <p className="text-[10.5px] text-emerald-600 mt-1.5 font-medium">
                      ✓ Stock will be stored in:{" "}
                      <span className="font-bold">
                        {
                          warehouses.find((w) => w.id === form.warehouseId)
                            ?.name
                        }
                      </span>
                    </p>
                  )}
                </div>

                {/* Supplier Information */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-[12px] font-black text-gray-500 uppercase tracking-widest mb-4">
                    Supplier Information
                  </p>
                  <div className="relative">
                    <select
                      name="supplierId"
                      value={form.supplierId}
                      onChange={handleChange}
                      className={`${selectCls} text-[12px]`}
                    >
                      <option value="">Select Supplier (optional)</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Live Validation Summary */}
                {Object.keys(errors).length > 0 && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-[12px] font-black text-red-600">
                        Please fix the following:
                      </p>
                    </div>
                    <ul className="space-y-1">
                      {Object.values(errors)
                        .filter(Boolean)
                        .map((e, i) => (
                          <li
                            key={i}
                            className="text-[11px] text-red-500 font-medium"
                          >
                            • {e}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── BOTTOM ACTION BAR ── */}
          <div className="border-t border-gray-100 p-4 sm:px-7 sm:py-4 flex flex-col sm:flex-row items-center justify-between bg-white flex-shrink-0 gap-3">
            <div className="flex items-center gap-2 text-[11px] sm:text-[12px] font-bold text-gray-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Last saved: just now
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              <button
                onClick={onClose}
                className="py-2 px-3 sm:py-2.5 sm:px-5 rounded-xl text-xs sm:text-[13px] font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all flex-1 sm:flex-initial text-center"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={saving}
                className="py-2 px-3 sm:py-2.5 sm:px-5 rounded-xl text-xs sm:text-[13px] font-bold text-gray-700 border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Save Draft
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={saving}
                className="py-2 px-4 sm:py-2.5 sm:px-6 rounded-xl text-xs sm:text-[13px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-1.5 flex-1 sm:flex-initial active:scale-95"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" /> Save &amp; Publish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image source picker */}
      <ImageOptionsModal
        isOpen={showImageOptions}
        onClose={() => setShowImageOptions(false)}
        onSelectUpload={() => {
          setShowImageOptions(false);
          setTimeout(() => fileRef.current?.click(), 100);
        }}
        onSelectCamera={() => {
          setShowImageOptions(false);
          setTimeout(() => setShowCamera(true), 150);
        }}
      />

      {/* Camera capture */}
      <CameraCaptureModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
      />
    </>
  );
}
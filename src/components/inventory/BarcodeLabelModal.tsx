"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Printer,
  Download,
  Barcode,
  Plus,
  Minus,
  Image as ImageIcon,
  FileText,
  Zap,
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  Maximize2,
  MoveHorizontal,
  MoveVertical,
  Layers,
  Settings2,
} from "lucide-react";

interface BarcodeLabelModalProps {
  product: {
    id: string;
    name: string;
    sku: string;
    unitCost?: string | number;
    category?: string;
  } | null;
  storeName?: string;
  onClose: () => void;
}

// ─── JsBarcode dynamic script loader ─────────────────────────────────────────
let jsBarcodeLoaded = false;
function loadJsBarcode(): Promise<void> {
  return new Promise((resolve) => {
    if (jsBarcodeLoaded || (window as any).JsBarcode) {
      jsBarcodeLoaded = true;
      return resolve();
    }
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js";
    script.onload = () => {
      jsBarcodeLoaded = true;
      resolve();
    };
    document.head.appendChild(script);
  });
}

// ─── Default Alignment & Printer Settings Interface ─────────────────────────
export interface LabelAlignmentSettings {
  preset: "zd230_2up" | "thermal_1up" | "custom";
  unit: "mm";
  labelWidth: number; // e.g. 50mm
  labelHeight: number; // e.g. 25mm
  labelsAcross: number; // 1 or 2 (horizontal count)
  horizontalGap: number; // gap between side-by-side labels in mm (e.g. 0mm or 2mm)
  topOffset: number; // top margin offset in mm (-10 to +10)
  leftOffset: number; // left margin offset in mm (-10 to +10)
  speed: number; // 2, 3, 4, 5, 6 inch/s
  darkness: number; // 0 to 30
  fontSizeScale: number; // 80% to 140%
  barcodeHeight: number; // height in mm
  barWidth: "1mm" | "2mm" | "3mm";
  showPrice: boolean;
  showStoreName: boolean;
  showCategory: boolean;
}

const DEFAULT_SETTINGS: LabelAlignmentSettings = {
  preset: "zd230_2up",
  unit: "mm",
  labelWidth: 50,
  labelHeight: 25,
  labelsAcross: 2,
  horizontalGap: 0,
  topOffset: 0,
  leftOffset: 0,
  speed: 6,
  darkness: 15,
  fontSizeScale: 100,
  barcodeHeight: 10,
  barWidth: "2mm",
  showPrice: false,
  showStoreName: false,
  showCategory: false,
};

// ─── Advanced ZPL Generator for Zebra ZD230 203dpi ───────────────────────────
// ZD230 @ 203dpi: 1mm ≈ 8.0 dots (203 / 25.4)
function generateZPLCode(
  productName: string,
  skuCode: string,
  price: string | undefined,
  settings: LabelAlignmentSettings,
  copies: number
): string {
  const MM_TO_DOTS = 203 / 25.4; // ≈ 8.0 dots/mm at 203dpi

  const labelW = Math.round(settings.labelWidth * MM_TO_DOTS);
  const labelH = Math.round(settings.labelHeight * MM_TO_DOTS);
  const gapDots = Math.round(settings.horizontalGap * MM_TO_DOTS);
  const totalPaperW = (labelW + gapDots) * settings.labelsAcross - gapDots;

  const topOffsetDots = Math.round(settings.topOffset * MM_TO_DOTS);
  const leftOffsetDots = Math.round(settings.leftOffset * MM_TO_DOTS);

  const barcodeHDots = Math.round(settings.barcodeHeight * MM_TO_DOTS);
  const fontScale = settings.fontSizeScale / 100;

  const fontNameSize = Math.round(18 * fontScale);
  const fontSkuSize = Math.round(15 * fontScale);
  const fontPriceSize = Math.round(22 * fontScale);

  const nameY = Math.max(2, 10 + topOffsetDots);
  const barcodeY = Math.max(15, nameY + fontNameSize + 8);
  const skuY = barcodeY + barcodeHDots + 12;
  const priceY = skuY + fontSkuSize + 8;

  const truncName =
    productName.length > 24 ? productName.slice(0, 23) + "~" : productName;
  const truncSku = skuCode.length > 18 ? skuCode.slice(0, 18) : skuCode;

  const buildSingleLabelZPL = (labelIndex: number) => {
    const xBase =
      leftOffsetDots + labelIndex * (labelW + gapDots) + Math.round(2 * MM_TO_DOTS);

    const lines = [
      `^FO${xBase},${nameY}^A0N,${fontNameSize},${fontNameSize}^FD${truncName}^FS`,
      `^FO${xBase},${barcodeY}^BY2,2,${barcodeHDots}^BCN,${barcodeHDots},N,N,N^FD${truncSku}^FS`,
      `^FO${xBase},${skuY}^A0N,${fontSkuSize},${fontSkuSize}^FD${truncSku}^FS`,
    ];

    if (settings.showPrice && price) {
      lines.push(
        `^FO${xBase},${priceY}^A0N,${fontPriceSize},${fontPriceSize}^FDRs.${parseFloat(
          price
        ).toLocaleString()}^FS`
      );
    }
    return lines.join("\n");
  };

  const labelsZPL: string[] = [];
  for (let a = 0; a < settings.labelsAcross; a++) {
    labelsZPL.push(buildSingleLabelZPL(a));
  }

  // Calculate actual ZPL print quantity per row
  const rowCopies = Math.ceil(copies / settings.labelsAcross);

  return `^XA
~TA000
~JSN
^PR${settings.speed},${settings.speed}
~MD${settings.darkness}
^PW${totalPaperW}
^LL${labelH}
^LH0,0
${labelsZPL.join("\n")}
^PQ${rowCopies},0,1,Y
^XZ`;
}

export default function BarcodeLabelModal({
  product,
  storeName,
  onClose,
}: BarcodeLabelModalProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [qty, setQty] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [showAdvancedSetup, setShowAdvancedSetup] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "settings">("preview");

  // Load alignment settings from localStorage if saved
  const [settings, setSettings] = useState<LabelAlignmentSettings>(() => {
    try {
      const saved = localStorage.getItem("pos_barcode_label_settings");
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const skuCode = product?.sku || product?.id?.slice(0, 12) || "NOSKU";

  const price =
    typeof product?.unitCost === "string"
      ? product.unitCost.replace(/[^\d.]/g, "")
      : product?.unitCost?.toString() || "";

  // Save settings automatically to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("pos_barcode_label_settings", JSON.stringify(settings));
    } catch (e) {
      console.warn("Could not save barcode label settings to localStorage", e);
    }
  }, [settings]);

  useEffect(() => {
    loadJsBarcode().then(() => setLoaded(true));
  }, []);

  const barWidthScale = { "1mm": 1.1, "2mm": 1.8, "3mm": 2.6 }[settings.barWidth];

  useEffect(() => {
    if (!loaded || !product) return;

    // Render primary SVG used for printing & exports
    if (svgRef.current) {
      try {
        (window as any).JsBarcode(svgRef.current, skuCode, {
          format: "CODE128",
          width: barWidthScale,
          height: settings.barcodeHeight * 3.5,
          displayValue: false,
          margin: 0,
          background: "transparent",
        });
      } catch (e) {}
    }

    // Render all preview SVGs in the modal (both Label 1 and Label 2 in 2-Up)
    setTimeout(() => {
      const previewSvgs = document.querySelectorAll<SVGSVGElement>(".barcode-svg-preview");
      previewSvgs.forEach((svg) => {
        try {
          (window as any).JsBarcode(svg, skuCode, {
            format: "CODE128",
            width: 1.2, // optimal scaling so bars never overflow preview card
            height: 28,
            displayValue: false,
            margin: 0,
            background: "transparent",
          });
          svg.style.maxWidth = "100%";
          svg.style.height = "28px";
          svg.style.overflow = "hidden";
        } catch (e) {}
      });
    }, 10);
  }, [loaded, skuCode, settings.barWidth, settings.barcodeHeight, barWidthScale, activeTab, settings.labelsAcross, settings.preset]);

  if (!product) return null;

  // ─── Preset Switcher ────────────────────────────────────────────────────────
  const applyPreset = (preset: "zd230_2up" | "thermal_1up" | "custom") => {
    if (preset === "zd230_2up") {
      setSettings((prev) => ({
        ...prev,
        preset: "zd230_2up",
        labelWidth: 50,
        labelHeight: 25,
        labelsAcross: 2,
        horizontalGap: 0,
        topOffset: 0,
        leftOffset: 0,
        speed: 6,
        darkness: 15,
      }));
    } else if (preset === "thermal_1up") {
      setSettings((prev) => ({
        ...prev,
        preset: "thermal_1up",
        labelWidth: 50,
        labelHeight: 25,
        labelsAcross: 1,
        horizontalGap: 0,
        topOffset: 0,
        leftOffset: 0,
        speed: 6,
        darkness: 15,
      }));
    } else {
      setSettings((prev) => ({ ...prev, preset: "custom" }));
    }
  };

  // ─── HTML Printable Document Generator (Browser Thermal Print) ──────────────
  const getThermalHTML = (svgContent: string, copiesCount: number) => {
    const labelW_px = Math.round(settings.labelWidth * 3.78); // 1mm ≈ 3.78px at 96dpi
    const labelH_px = Math.round(settings.labelHeight * 3.78);
    const paperW_mm =
      (settings.labelWidth + settings.horizontalGap) * settings.labelsAcross -
      settings.horizontalGap;

    const oneLabelHTML = `
      <div style="
        width: ${settings.labelWidth}mm;
        height: ${settings.labelHeight}mm;
        box-sizing: border-box;
        padding: 1.5mm 2mm;
        margin-top: ${settings.topOffset}mm;
        margin-left: ${settings.leftOffset}mm;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        font-family: 'Segoe UI', Arial, sans-serif;
        background: #ffffff;
        border: 0.2mm solid #e5e7eb;
        overflow: hidden;
        flex-shrink: 0;
      ">
        ${
          settings.showStoreName && storeName
            ? `<div style="font-size:${Math.round(
                7 * (settings.fontSizeScale / 100)
              )}pt;font-weight:900;color:#059669;text-transform:uppercase;letter-spacing:0.3px;width:100%;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${storeName}</div>`
            : ""
        }
        <div style="
          font-size: ${Math.round(8.5 * (settings.fontSizeScale / 100))}pt;
          font-weight: 900;
          color: #000000;
          width: 100%;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.1;
        ">${product.name}</div>
        
        <div style="width:100%;display:flex;justify-content:center;align-items:center;height:${settings.barcodeHeight}mm;margin:0.5mm 0;">
          ${svgContent}
        </div>

        <div style="
          font-size: ${Math.round(7.5 * (settings.fontSizeScale / 100))}pt;
          font-weight: 800;
          color: #111827;
          letter-spacing: 0.5px;
        ">${skuCode}</div>

        ${
          settings.showPrice && price
            ? `<div style="font-size:${Math.round(
                9 * (settings.fontSizeScale / 100)
              )}pt;font-weight:900;color:#059669;">Rs. ${parseFloat(
                price
              ).toLocaleString()}</div>`
            : ""
        }
        ${
          settings.showCategory && product.category
            ? `<div style="font-size:6pt;color:#6b7280;font-weight:600;">${product.category}</div>`
            : ""
        }
      </div>
    `;

    const labelRows: string[] = [];
    for (let i = 0; i < copiesCount; i += settings.labelsAcross) {
      const rowLabels: string[] = [];
      for (let a = 0; a < settings.labelsAcross; a++) {
        if (i + a < copiesCount) {
          rowLabels.push(oneLabelHTML);
        } else {
          rowLabels.push(`<div style="width:${settings.labelWidth}mm;"></div>`);
        }
      }
      labelRows.push(
        `<div style="display:flex;gap:${settings.horizontalGap}mm;width:${paperW_mm}mm;page-break-inside:avoid;margin:0;padding:0;">${rowLabels.join(
          ""
        )}</div>`
      );
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Barcode_${skuCode}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { margin:0; padding:0; background:#ffffff; -webkit-print-color-adjust:exact; }
    @media print {
      @page {
        size: ${paperW_mm}mm ${settings.labelHeight}mm;
        margin: 0;
      }
      html, body {
        width: ${paperW_mm}mm;
        height: ${settings.labelHeight}mm;
        margin: 0;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  ${labelRows.join("")}
  <script>
    window.onload = () => {
      window.print();
    };
  </script>
</body>
</html>`;
  };

  // ─── Direct Browser Print Trigger ──────────────────────────────────────────
  const handleThermalPrint = () => {
    if (!svgRef.current) return;
    const svgEl = svgRef.current.cloneNode(true) as SVGSVGElement;
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgEl.style.width = "100%";
    svgEl.style.height = `${settings.barcodeHeight * 3.78}px`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(getThermalHTML(svgEl.outerHTML, qty));
      win.document.close();
    }
  };

  // ─── Download ZPL Command file for Zebra ZD230 ─────────────────────────────
  const handleDownloadZPL = () => {
    const zpl = generateZPLCode(product.name, skuCode, price, settings, qty);
    const blob = new Blob([zpl], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ZD230_${skuCode}_${settings.labelsAcross}up.zpl`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // ─── Export Image (PNG / JPEG) ─────────────────────────────────────────────
  const handleDownloadImage = (format: "png" | "jpeg") => {
    if (!svgRef.current || !product) return;
    const canvas = document.createElement("canvas");
    const scale = 4;
    const wPx = Math.round(settings.labelWidth * 3.78);
    const hPx = Math.round(settings.labelHeight * 3.78);

    canvas.width = wPx * scale;
    canvas.height = hPx * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, wPx, hPx);

    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, wPx - 2, hPx - 2);

    const svgEl = svgRef.current.cloneNode(true) as SVGSVGElement;
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const svgBlob =
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(new XMLSerializer().serializeToString(svgEl));

    const img = new Image();
    img.onload = () => {
      let y = 10;
      const fontScale = settings.fontSizeScale / 100;

      if (settings.showStoreName && storeName) {
        ctx.font = `800 ${Math.round(8 * fontScale)}px "Segoe UI", sans-serif`;
        ctx.fillStyle = "#059669";
        ctx.textAlign = "center";
        ctx.fillText(storeName.toUpperCase(), wPx / 2, y);
        y += 10;
      }

      ctx.font = `900 ${Math.round(10 * fontScale)}px "Segoe UI", sans-serif`;
      ctx.fillStyle = "#111827";
      ctx.textAlign = "center";
      ctx.fillText(product.name, wPx / 2, y, wPx - 10);
      y += 6;

      const barcodeH = settings.barcodeHeight * 3.78;
      ctx.drawImage(img, 10, y, wPx - 20, barcodeH);
      y += barcodeH + 12;

      ctx.font = `800 ${Math.round(9 * fontScale)}px "Segoe UI", sans-serif`;
      ctx.fillStyle = "#374151";
      ctx.textAlign = "center";
      ctx.fillText(skuCode, wPx / 2, y);
      y += 12;

      if (settings.showPrice && price) {
        ctx.font = `900 ${Math.round(11 * fontScale)}px "Segoe UI", sans-serif`;
        ctx.fillStyle = "#059669";
        ctx.textAlign = "center";
        ctx.fillText(`Rs. ${parseFloat(price).toLocaleString()}`, wPx / 2, y);
      }

      const a = document.createElement("a");
      a.href = canvas.toDataURL(
        format === "png" ? "image/png" : "image/jpeg",
        0.95
      );
      const safeProductName = product.name.replace(/[^a-zA-Z0-9\u00C0-\u024F\s-]/g, "").replace(/\s+/g, "_").slice(0, 60);
      a.download = `${safeProductName}_barcode_${skuCode}.${format}`;
      a.click();
    };
    img.src = svgBlob;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 overscroll-contain animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[16px] font-black text-gray-900 leading-snug">
                Barcode Label Printer & Setup
              </h2>
              <p className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ZDesigner ZD230 203dpi & Thermal Transfer Ready
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200/70 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-100/50 p-1 px-6 gap-2">
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "preview"
                ? "bg-white text-emerald-700 shadow-sm border border-gray-200/80"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Printer className="w-3.5 h-3.5" /> Label Preview & Print
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "settings"
                ? "bg-white text-emerald-700 shadow-sm border border-gray-200/80"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" /> Printer Alignment & Offsets
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 show-scrollbar">
          {activeTab === "preview" ? (
            <>
              {/* Preset Selector Badges */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                  Select Printer Layout Preset
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => applyPreset("zd230_2up")}
                    className={`p-2.5 rounded-2xl border text-left transition-all relative ${
                      settings.preset === "zd230_2up"
                        ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20"
                        : "bg-white border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-gray-900">
                        Zebra ZD230 (2-Up)
                      </span>
                      {settings.preset === "zd230_2up" && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-[9.5px] font-bold text-gray-500 mt-0.5">
                      50×25mm (100mm Roll)
                    </p>
                  </button>

                  <button
                    onClick={() => applyPreset("thermal_1up")}
                    className={`p-2.5 rounded-2xl border text-left transition-all relative ${
                      settings.preset === "thermal_1up"
                        ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20"
                        : "bg-white border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-gray-900">
                        Single Roll (1-Up)
                      </span>
                      {settings.preset === "thermal_1up" && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-[9.5px] font-bold text-gray-500 mt-0.5">
                      50×25mm Single Strip
                    </p>
                  </button>

                  <button
                    onClick={() => applyPreset("custom")}
                    className={`p-2.5 rounded-2xl border text-left transition-all relative ${
                      settings.preset === "custom"
                        ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20"
                        : "bg-white border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-gray-900">
                        Custom Offsets
                      </span>
                      {settings.preset === "custom" && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-[9.5px] font-bold text-gray-500 mt-0.5">
                      User Defined Specs
                    </p>
                  </button>
                </div>
              </div>

              {/* Real-time Label Strip Visualizer Preview */}
              <div className="bg-gray-100/90 border border-gray-200 rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="flex items-center justify-between w-full mb-2 px-1">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Paper Strip Preview ({settings.labelsAcross}-Up Side by Side)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
                    {settings.labelWidth * settings.labelsAcross}mm ×{" "}
                    {settings.labelHeight}mm
                  </span>
                </div>

                {/* Container representing thermal sticker roll */}
                <div className="flex items-center gap-2 p-2 bg-white rounded-2xl border-2 border-dashed border-emerald-300 shadow-sm max-w-full overflow-x-auto">
                  {Array.from({ length: settings.labelsAcross }).map((_, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-300 rounded-xl bg-white shadow-sm flex flex-col items-center justify-between p-2 shrink-0 transition-all overflow-hidden"
                      style={{
                        width: 170, // proportional preview
                        height: 98,
                        marginTop: `${settings.topOffset}px`,
                        marginLeft: `${settings.leftOffset}px`,
                      }}
                    >
                      {settings.showStoreName && storeName && (
                        <p className="font-black text-emerald-600 text-[8px] tracking-widest uppercase text-center w-full truncate">
                          {storeName}
                        </p>
                      )}
                      <p className="font-black text-gray-900 text-[9.5px] text-center w-full leading-tight truncate px-1">
                        {product.name}
                      </p>
                      <div className="w-full flex items-center justify-center overflow-hidden my-0.5">
                        <svg
                          className="barcode-svg-preview w-full max-w-full h-[28px] overflow-hidden"
                          style={{ maxWidth: "100%", height: 28, overflow: "hidden" }}
                        />
                      </div>
                      <p className="font-bold text-gray-600 text-[9px] tracking-wider font-mono">
                        {skuCode}
                      </p>
                      {settings.showPrice && price && (
                        <p className="font-black text-emerald-600 text-[10px]">
                          Rs. {parseFloat(price).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Hidden Master SVG for Print & Export Cloning */}
                <svg ref={svgRef} className="hidden" style={{ display: "none" }} />
              </div>

              {/* Fast Toggles & Print Copies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Print Quantity */}
                <div className="space-y-1 bg-gray-50 border border-gray-200/80 p-3 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                      Number of Labels
                    </label>
                    <span className="text-[10px] font-bold text-gray-400">
                      ({Math.ceil(qty / settings.labelsAcross)} Row Prints)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-xl bg-white hover:bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-700 transition-all active:scale-90"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={qty}
                      onChange={(e) =>
                        setQty(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="flex-1 h-9 text-center font-mono font-black text-[16px] text-gray-900 border border-gray-300 rounded-xl outline-none focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(500, q + 1))}
                      className="w-9 h-9 rounded-xl bg-white hover:bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-700 transition-all active:scale-90"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Display Toggles */}
                <div className="bg-gray-50 border border-gray-200/80 p-3 rounded-2xl space-y-2">
                  <span className="block text-[10px] font-black text-gray-600 uppercase tracking-widest">
                    Include On Label
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showPrice}
                        onChange={(e) =>
                          setSettings({ ...settings, showPrice: e.target.checked })
                        }
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-[11px] font-bold text-gray-700">
                        Show Price
                      </span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showStoreName}
                        onChange={(e) =>
                          setSettings({ ...settings, showStoreName: e.target.checked })
                        }
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-[11px] font-bold text-gray-700">
                        Store Name
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {/* Main Direct Thermal Print */}
                <button
                  type="button"
                  onClick={handleThermalPrint}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[14px] shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <Printer className="w-4 h-4" />
                  Print Barcode Labels ({qty} Labels / {settings.labelsAcross}-Up)
                </button>

                {/* Secondary Action Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadZPL}
                    className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95"
                    title="Download ZPL II file for Zebra ZD230 / BarTender"
                  >
                    <Zap className="w-3.5 h-3.5" /> Download ZPL
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadImage("png")}
                    className="py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-black transition-all border border-blue-200 flex items-center justify-center gap-1 active:scale-95"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> PNG Image
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadImage("jpeg")}
                    className="py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-black transition-all border border-purple-200 flex items-center justify-center gap-1 active:scale-95"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> JPEG Image
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Settings & Alignment Tab */
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  Label Dimensions & Printer Offsets
                </h3>
                <button
                  type="button"
                  onClick={() => setSettings(DEFAULT_SETTINGS)}
                  className="text-[10px] font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1 underline"
                >
                  <RotateCcw className="w-3 h-3" /> Reset to Defaults
                </button>
              </div>

              {/* Dimension Settings */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80">
                <div>
                  <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">
                    Label Width (mm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="20"
                    max="120"
                    value={settings.labelWidth}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        labelWidth: parseFloat(e.target.value) || 50,
                      })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl font-mono font-bold text-xs text-gray-900 outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">
                    Label Height (mm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="15"
                    max="100"
                    value={settings.labelHeight}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        labelHeight: parseFloat(e.target.value) || 25,
                      })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl font-mono font-bold text-xs text-gray-900 outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">
                    Labels Across (Horizontal)
                  </label>
                  <select
                    value={settings.labelsAcross}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        labelsAcross: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl font-bold text-xs text-gray-900 outline-none focus:border-emerald-600"
                  >
                    <option value={1}>1-Up (Single Label Strip)</option>
                    <option value={2}>2-Up (Side-by-Side Strip)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">
                    Horizontal Gap (mm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    value={settings.horizontalGap}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        horizontalGap: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl font-mono font-bold text-xs text-gray-900 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Offset Fine-Tuning */}
              <div className="space-y-3 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80">
                <span className="block text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-1">
                  <MoveHorizontal className="w-3.5 h-3.5 text-amber-600" />
                  Printer Offsets & Alignment Tuning
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-1">
                      Left Offset (mm): {settings.leftOffset}mm
                    </label>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="0.5"
                      value={settings.leftOffset}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          leftOffset: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-1">
                      Top Offset (mm): {settings.topOffset}mm
                    </label>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="0.5"
                      value={settings.topOffset}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          topOffset: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Hardware Density & Speed Settings */}
              <div className="grid grid-cols-2 gap-3 bg-blue-50/60 p-3.5 rounded-2xl border border-blue-200/80">
                <div>
                  <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">
                    Print Speed (inch/s)
                  </label>
                  <select
                    value={settings.speed}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        speed: parseInt(e.target.value) || 6,
                      })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-blue-300 rounded-xl font-bold text-xs text-gray-900 outline-none focus:border-blue-600"
                  >
                    <option value={2}>2.0 in/s (High Quality)</option>
                    <option value={4}>4.0 in/s (Balanced)</option>
                    <option value={6}>6.0 in/s (Fast - ZD230 Standard)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">
                    Darkness / Density (0 - 30)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={settings.darkness}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        darkness: parseInt(e.target.value) || 15,
                      })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-blue-300 rounded-xl font-mono font-bold text-xs text-gray-900 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Save & Apply Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Printer, Download, Barcode, Plus, Minus, Image as ImageIcon, FileText, Zap } from "lucide-react";

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

// ─── JsBarcode dynamic loader ───────────────────────────────────────────────
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

// ─── ZPL Generator for ZDesigner ZD230 203dpi ────────────────────────────────
// ZD230 @ 203dpi: 1mm ≈ 8 dots
// Label: 50mm × 25mm  →  400 × 200 dots per label
// 2-up: two labels side-by-side on 100mm × 25mm print width
// -3mm X offset correction = -24 dots
function generateZPL(
  productName: string,
  skuCode: string,
  price: string | undefined,
  showPrice: boolean,
  copies: number,
): string {
  const MM_TO_DOTS = 203 / 25.4; // ≈ 8.0 dots/mm at 203dpi

  const labelW   = Math.round(50 * MM_TO_DOTS);  // 400 dots
  const labelH   = Math.round(25 * MM_TO_DOTS);  // 200 dots
  const offsetX  = -Math.round(3 * MM_TO_DOTS);  // -24 dots (-3mm correction)

  const truncName = productName.length > 22 ? productName.slice(0, 21) + "~" : productName;
  const truncSku  = skuCode.length > 18 ? skuCode.slice(0, 18) : skuCode;

  // Dot positions within each label
  const nameY    = 10;
  const barcodeX = 10;
  const barcodeY = 40;
  const barcodeH = 80;   // ~10mm tall barcode
  const barcodeNW = 2;   // narrow bar width: 2 dots ≈ 0.25mm (readable @ 203dpi)
  const skuY     = 135;
  const priceY   = 162;

  const buildLabel = (xShift: number) => {
    const lines = [
      `^FO${xShift + barcodeX},${nameY}^A0N,18,18^FD${truncName}^FS`,
      `^FO${xShift + barcodeX},${barcodeY}^BY${barcodeNW}^BCN,${barcodeH},N,N,N^FD${truncSku}^FS`,
      `^FO${xShift + barcodeX},${skuY}^A0N,16,16^FD${truncSku}^FS`,
    ];
    if (showPrice && price) {
      lines.push(`^FO${xShift + barcodeX},${priceY}^A0N,22,22^FDRs.${parseFloat(price).toLocaleString()}^FS`);
    }
    return lines.join("\n");
  };

  // Label A at offset X, Label B at offset X + labelW (side-by-side 2-up)
  return `^XA
^PW${labelW * 2}
^LL${labelH}
^LH0,0
${buildLabel(offsetX)}
${buildLabel(offsetX + labelW)}
^PQ${copies},0,1,Y
^XZ`;
}

export default function BarcodeLabelModal({
  product,
  storeName,
  onClose,
}: BarcodeLabelModalProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [qty, setQty] = useState(1);
  const [labelSize, setLabelSize] = useState<"small" | "medium" | "large">("medium");
  const [barWidth, setBarWidth] = useState<"1mm" | "2mm" | "3mm">("2mm");
  const [showPrice, setShowPrice] = useState(false);
  const [showStoreName, setShowStoreName] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const skuCode = product?.sku || product?.id?.slice(0, 12) || "NOSKU";

  const sizeConfig = {
    small:  { w: 220, h: 90,  barcodeH: 40, font: 10 },
    medium: { w: 300, h: 120, barcodeH: 55, font: 12 },
    large:  { w: 390, h: 150, barcodeH: 70, font: 14 },
  };
  const cfg = sizeConfig[labelSize];

  const barWidthScale = { "1mm": 1.0, "2mm": 1.8, "3mm": 2.6 }[barWidth];

  useEffect(() => {
    loadJsBarcode().then(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded || !svgRef.current || !product) return;
    try {
      (window as any).JsBarcode(svgRef.current, skuCode, {
        format: "CODE128",
        width: barWidthScale,
        height: cfg.barcodeH,
        displayValue: false,
        margin: 0,
        background: "transparent",
      });
    } catch (e) { /* invalid barcode fallback */ }
  }, [loaded, skuCode, labelSize, barWidthScale, cfg.barcodeH]);

  if (!product) return null;

  const price =
    typeof product.unitCost === "string"
      ? product.unitCost.replace(/[^\d.]/g, "")
      : product.unitCost?.toString() || "";

  // ─── Thermal 50mm×25mm 2-up HTML (for browser print to ZD230) ─────────────
  // At 96dpi screen: 50mm≈189px, 25mm≈94px — we use @page size:100mm 25mm
  const getThermalHTML = (svgContent: string, copies: number) => {
    const lw = 189; // 50mm at 96dpi
    const lh = 94;  // 25mm at 96dpi
    const oneLabel = `<div style="width:${lw}px;height:${lh}px;border:0.5px solid #000;background:#fff;padding:3px 5px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;font-family:'Courier New',monospace;box-sizing:border-box;flex-shrink:0;">
  <div style="font-size:8.5px;font-weight:900;color:#000;width:100%;text-align:center;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${product.name}</div>
  <div style="width:100%;display:flex;justify-content:center;">${svgContent}</div>
  <div style="font-size:7.5px;font-weight:700;color:#000;letter-spacing:1px;">${skuCode}</div>
  ${showPrice && price ? `<div style="font-size:10px;font-weight:900;color:#000;">Rs.${parseFloat(price).toLocaleString()}</div>` : ""}
</div>`;

    // Pair labels 2-up per row
    const rows: string[] = [];
    for (let i = 0; i < copies; i += 2) {
      rows.push(`<div style="display:flex;width:${lw * 2}px;margin:0;padding:0;">${oneLabel}${i + 1 < copies ? oneLabel : `<div style="width:${lw}px;"></div>`}</div>`);
    }

    return `<!DOCTYPE html><html><head><title>Thermal ${product.name}</title>
<style>
  * { margin:0;padding:0;box-sizing:border-box; }
  body { margin:0;padding:0; }
  @media print {
    @page { size: 100mm 25mm; margin: 0; }
    body { margin:0;padding:0; }
  }
</style></head><body>${rows.join("")}<script>window.onload=()=>window.print();</script></body></html>`;
  };

  const getStandardLabelHTML = (svgContent: string, count: number) => {
    const label = `<div style="width:${cfg.w}px;height:${cfg.h}px;border:1.5px solid #d1d5db;border-radius:8px;background:#fff;padding:8px 12px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;font-family:'Segoe UI',sans-serif;page-break-inside:avoid;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      ${showStoreName && storeName ? `<div style="font-size:${cfg.font - 1}px;font-weight:800;color:#059669;text-transform:uppercase;letter-spacing:0.5px;width:100%;text-align:center;">${storeName}</div>` : ""}
      <div style="font-size:${cfg.font + 1}px;font-weight:900;color:#111827;text-align:center;max-width:${cfg.w - 24}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${product.name}</div>
      <div style="width:100%;display:flex;justify-content:center;">${svgContent}</div>
      <div style="font-size:${cfg.font}px;font-weight:800;color:#374151;letter-spacing:1px;">${skuCode}</div>
      ${showPrice && price ? `<div style="font-size:${cfg.font + 3}px;font-weight:900;color:#059669;">Rs. ${parseFloat(price).toLocaleString()}</div>` : ""}
      ${product.category ? `<div style="font-size:${cfg.font - 1}px;color:#9ca3af;font-weight:600;">${product.category}</div>` : ""}
    </div>`;
    const repeated = Array(count).fill(label).join("\n");
    return `<!DOCTYPE html><html><head><title>Barcode Labels</title>
<style>* { margin:0;padding:0;box-sizing:border-box; } body { background:#f9fafb;padding:24px; } .grid { display:flex;flex-wrap:wrap;gap:12px; } @media print { body { background:#fff;padding:8mm; } .grid { gap:6mm; } @page { margin:8mm; } }</style>
</head><body><div class="grid">${repeated}</div><script>window.onload=()=>window.print();</script></body></html>`;
  };

  // ─── Thermal print: opens browser print with @page 100mm×25mm ─────────────
  const handleThermalPrint = () => {
    if (!svgRef.current) return;
    const svgEl = svgRef.current.cloneNode(true) as SVGSVGElement;
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgEl.style.width  = "170px";
    svgEl.style.height = "36px";
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(getThermalHTML(svgEl.outerHTML, qty));
      win.document.close();
    }
  };

  // ─── Standard browser print ───────────────────────────────────────────────
  const handlePrint = () => {
    if (!svgRef.current) return;
    const svgEl = svgRef.current.cloneNode(true) as SVGSVGElement;
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgEl.style.width  = `${cfg.w - 24}px`;
    svgEl.style.height = `${cfg.barcodeH}px`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(getStandardLabelHTML(svgEl.outerHTML, qty));
      win.document.close();
    }
  };

  // ─── Download ZPL for ZD230 ───────────────────────────────────────────────
  const handleDownloadZPL = () => {
    const zpl = generateZPL(product!.name, skuCode, price, showPrice, qty);
    const blob = new Blob([zpl], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `label-${skuCode}.zpl`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // ─── Download Image ───────────────────────────────────────────────────────
  const handleDownloadImage = (format: "png" | "jpeg") => {
    if (!svgRef.current || !product) return;
    const canvas = document.createElement("canvas");
    const scale = 3;
    canvas.width  = cfg.w * scale;
    canvas.height = cfg.h * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cfg.w, cfg.h);
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if ((ctx as any).roundRect) (ctx as any).roundRect(2, 2, cfg.w - 4, cfg.h - 4, 8);
    else ctx.rect(2, 2, cfg.w - 4, cfg.h - 4);
    ctx.stroke();
    const svgEl = svgRef.current.cloneNode(true) as SVGSVGElement;
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const svgBlob = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svgEl));
    const img = new Image();
    img.onload = () => {
      let y = 16;
      if (showStoreName && storeName) {
        ctx.font = `800 ${cfg.font - 1}px "Segoe UI", sans-serif`;
        ctx.fillStyle = "#059669";
        ctx.textAlign = "center";
        ctx.fillText(storeName.toUpperCase(), cfg.w / 2, y);
        y += cfg.font + 4;
      }
      ctx.font = `900 ${cfg.font + 1}px "Segoe UI", sans-serif`;
      ctx.fillStyle = "#111827";
      ctx.textAlign = "center";
      ctx.fillText(product.name, cfg.w / 2, y, cfg.w - 24);
      y += 8;
      const barcodeW = cfg.w - 32;
      ctx.drawImage(img, (cfg.w - barcodeW) / 2, y, barcodeW, cfg.barcodeH);
      y += cfg.barcodeH + 14;
      ctx.font = `800 ${cfg.font}px "Segoe UI", sans-serif`;
      ctx.fillStyle = "#374151";
      ctx.textAlign = "center";
      ctx.fillText(skuCode, cfg.w / 2, y);
      y += cfg.font + 4;
      if (showPrice && price) {
        ctx.font = `900 ${cfg.font + 3}px "Segoe UI", sans-serif`;
        ctx.fillStyle = "#059669";
        ctx.textAlign = "center";
        ctx.fillText(`Rs. ${parseFloat(price).toLocaleString()}`, cfg.w / 2, y);
      }
      const a = document.createElement("a");
      a.href = canvas.toDataURL(format === "png" ? "image/png" : "image/jpeg", 0.95);
      a.download = `barcode-${skuCode}.${format === "png" ? "png" : "jpg"}`;
      a.click();
    };
    img.src = svgBlob;
  };

  // ─── Download HTML ────────────────────────────────────────────────────────
  const handleDownloadHTML = () => {
    if (!svgRef.current) return;
    const svgEl = svgRef.current.cloneNode(true) as SVGSVGElement;
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgEl.style.width  = `${cfg.w - 24}px`;
    svgEl.style.height = `${cfg.barcodeH}px`;
    const blob = new Blob([getStandardLabelHTML(svgEl.outerHTML, qty)], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `barcode-label-${skuCode}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Barcode className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-black text-gray-900">Barcode Label Generator</h2>
              <p className="text-[11px] text-gray-400 font-medium">{product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Label Preview */}
          <div className="flex justify-center">
            <div
              className="border-2 border-dashed border-emerald-200 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center gap-2 p-4"
              style={{ width: cfg.w, minHeight: cfg.h }}
            >
              {showStoreName && storeName && (
                <p className="font-black text-emerald-600 tracking-widest uppercase text-center w-full" style={{ fontSize: cfg.font - 1 }}>
                  {storeName}
                </p>
              )}
              <p className="font-black text-gray-900 text-center truncate w-full" style={{ fontSize: cfg.font + 1, maxWidth: cfg.w - 24 }}>
                {product.name}
              </p>
              <svg ref={svgRef} style={{ width: cfg.w - 24, height: cfg.barcodeH }} />
              <p className="font-bold text-gray-600 tracking-widest" style={{ fontSize: cfg.font }}>{skuCode}</p>
              {showPrice && price && (
                <p className="font-black text-emerald-600" style={{ fontSize: cfg.font + 3 }}>
                  Rs. {parseFloat(price).toLocaleString()}
                </p>
              )}
              {product.category && (
                <p className="text-gray-400 font-semibold" style={{ fontSize: cfg.font - 1 }}>{product.category}</p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Label Size</label>
              <div className="flex gap-1">
                {(["small", "medium", "large"] as const).map((s) => (
                  <button key={s} onClick={() => setLabelSize(s)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-colors capitalize ${labelSize === s ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Bar Width</label>
              <div className="flex gap-1">
                {(["1mm", "2mm", "3mm"] as const).map((w) => (
                  <button key={w} onClick={() => setBarWidth(w)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-colors ${barWidth === w ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Copies</label>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <Minus className="w-3 h-3 text-gray-600" />
                </button>
                <span className="flex-1 text-center font-black text-gray-900 text-[14px]">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(100, q + 1))} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <Plus className="w-3 h-3 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showPrice} onChange={(e) => setShowPrice(e.target.checked)} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
              <span className="text-[12px] font-bold text-gray-600">Show Price</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showStoreName} onChange={(e) => setShowStoreName(e.target.checked)} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
              <span className="text-[12px] font-bold text-gray-600">Show Store Name</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {/* PRIMARY: Thermal print for ZD230 */}
            <button onClick={handleThermalPrint}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-black transition-colors shadow-md active:scale-95">
              <Printer className="w-4 h-4" />
              Print Thermal 50×25mm 2-up {qty > 1 ? `(${qty} labels)` : "(1 label)"}
            </button>

            {/* ZPL download for ZD230 */}
            <button onClick={handleDownloadZPL}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[12px] font-black transition-colors border border-amber-200">
              <Zap className="w-3.5 h-3.5" />
              Download ZPL &nbsp;·&nbsp; ZD230 203dpi · 50×25mm · -3mm offset
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => handleDownloadImage("png")}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[12px] font-black transition-colors border border-blue-200">
                <ImageIcon className="w-3.5 h-3.5" /> PNG Image
              </button>
              <button onClick={() => handleDownloadImage("jpeg")}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-[12px] font-black transition-colors border border-purple-200">
                <ImageIcon className="w-3.5 h-3.5" /> JPEG Image
              </button>
              <button onClick={handleDownloadHTML}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-black transition-colors border border-gray-200">
                <FileText className="w-3.5 h-3.5" /> HTML File
              </button>
            </div>

            {/* Standard print fallback */}
            <button onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-black transition-colors">
              <Printer className="w-3.5 h-3.5" />
              Print Standard (desktop/browser print)
            </button>
          </div>

          <p className="text-[10px] text-gray-400 text-center font-medium leading-tight">
            🖨️ ZDesigner ZD230 · 203dpi · 50mm×25mm stock · 2 labels side-by-side · -3mm X offset applied
          </p>
        </div>
      </div>
    </div>
  );
}


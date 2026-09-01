"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Printer, Download, Barcode, Plus, Minus } from "lucide-react";

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

export default function BarcodeLabelModal({
  product,
  storeName,
  onClose,
}: BarcodeLabelModalProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [qty, setQty] = useState(1);
  const [labelSize, setLabelSize] = useState<"small" | "medium" | "large">(
    "medium"
  );
  const [showPrice, setShowPrice] = useState(true);
  const [showStoreName, setShowStoreName] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const skuCode = product?.sku || product?.id?.slice(0, 12) || "NOSKU";

  // Label size configs (mm dimensions for reference, px for preview)
  const sizeConfig = {
    small:  { w: 200, h: 80,  barcodeH: 35, font: 9 },
    medium: { w: 280, h: 110, barcodeH: 50, font: 11 },
    large:  { w: 380, h: 140, barcodeH: 65, font: 13 },
  };
  const cfg = sizeConfig[labelSize];

  const [barWidth, setBarWidth] = useState<"1mm" | "2mm" | "3mm">("2mm");

  const barWidthScale = {
    "1mm": 1.0,
    "2mm": 1.8,
    "3mm": 2.6,
  }[barWidth];

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
    } catch (e) {
      // invalid barcode value fallback
    }
  }, [loaded, skuCode, labelSize, barWidthScale, cfg.barcodeH]);

  if (!product) return null;

  const price =
    typeof product.unitCost === "string"
      ? product.unitCost.replace(/[^\d.]/g, "")
      : product.unitCost?.toString() || "";

  // ─── Generate label HTML for print/download ────────────────────────────
  const getLabelHTML = (svgContent: string, count: number) => {
    const label = `
      <div style="
        width:${cfg.w}px;height:${cfg.h}px;
        border:1.5px solid #d1d5db;border-radius:8px;
        background:#fff;padding:8px 12px;
        display:flex;flex-direction:column;align-items:center;
        justify-style:space-between;
        font-family:'Segoe UI',sans-serif;
        page-break-inside:avoid;
        box-shadow:0 1px 3px rgba(0,0,0,0.08);
      ">
        ${showStoreName && storeName ? `<div style="font-size:${cfg.font - 1}px;font-weight:800;color:#059669;text-transform:uppercase;letter-spacing:0.5px;width:100%;text-align:center;">${storeName}</div>` : ""}
        <div style="font-size:${cfg.font + 1}px;font-weight:900;color:#111827;text-align:center;max-width:${cfg.w - 24}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${product.name}</div>
        <div style="width:100%;display:flex;justify-content:center;">${svgContent}</div>
        <div style="font-size:${cfg.font}px;font-weight:800;color:#374151;letter-spacing:1px;">${skuCode}</div>
        ${showPrice && price ? `<div style="font-size:${cfg.font + 3}px;font-weight:900;color:#059669;">Rs. ${parseFloat(price).toLocaleString()}</div>` : ""}
        ${product.category ? `<div style="font-size:${cfg.font - 1}px;color:#9ca3af;font-weight:600;">${product.category}</div>` : ""}
      </div>`;

    const repeated = Array(count).fill(label).join("\n");
    return `<!DOCTYPE html><html><head><title>Barcode Labels – ${product.name}</title>
<style>
  * { margin:0;padding:0;box-sizing:border-box; }
  body { background:#f9fafb;padding:24px; }
  .grid { display:flex;flex-wrap:wrap;gap:12px; }
  @media print {
    body { background:#fff;padding:8mm; }
    .grid { gap:6mm; }
    @page { margin:8mm; }
  }
</style>
</head><body>
<div class="grid">${repeated}</div>
<script>window.onload=()=>window.print();</script>
</body></html>`;
  };

  const handlePrint = () => {
    if (!svgRef.current) return;
    const svgEl = svgRef.current.cloneNode(true) as SVGSVGElement;
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgEl.style.width = `${cfg.w - 24}px`;
    svgEl.style.height = `${cfg.barcodeH}px`;
    const svgHTML = svgEl.outerHTML;
    const html = getLabelHTML(svgHTML, qty);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  const handleDownload = () => {
    if (!svgRef.current) return;
    const svgEl = svgRef.current.cloneNode(true) as SVGSVGElement;
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgEl.style.width = `${cfg.w - 24}px`;
    svgEl.style.height = `${cfg.barcodeH}px`;
    const svgHTML = svgEl.outerHTML;
    const html = getLabelHTML(svgHTML, qty);
    const blob = new Blob([html], { type: "text/html" });
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
              <h2 className="text-[15px] font-black text-gray-900">Barcode Label</h2>
              <p className="text-[11px] text-gray-400 font-medium">{product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
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
                <p
                  className="font-black text-emerald-600 tracking-widest uppercase text-center w-full"
                  style={{ fontSize: cfg.font - 1 }}
                >
                  {storeName}
                </p>
              )}
              <p
                className="font-black text-gray-900 text-center truncate w-full"
                style={{ fontSize: cfg.font + 1, maxWidth: cfg.w - 24 }}
              >
                {product.name}
              </p>
              {/* SVG barcode */}
              <svg ref={svgRef} style={{ width: cfg.w - 24, height: cfg.barcodeH }} />
              <p
                className="font-bold text-gray-600 tracking-widest"
                style={{ fontSize: cfg.font }}
              >
                {skuCode}
              </p>
              {showPrice && price && (
                <p
                  className="font-black text-emerald-600"
                  style={{ fontSize: cfg.font + 3 }}
                >
                  Rs. {parseFloat(price).toLocaleString()}
                </p>
              )}
              {product.category && (
                <p
                  className="text-gray-400 font-semibold"
                  style={{ fontSize: cfg.font - 1 }}
                >
                  {product.category}
                </p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Label Size */}
            <div>
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">
                Label Size
              </label>
              <div className="flex gap-1">
                {(["small", "medium", "large"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setLabelSize(s)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-colors capitalize ${
                      labelSize === s
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Bar Width / Thickness */}
            <div>
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">
                Bar Width
              </label>
              <div className="flex gap-1">
                {(["1mm", "2mm", "3mm"] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => setBarWidth(w)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-colors ${
                      barWidth === w
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">
                Copies
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-3 h-3 text-gray-600" />
                </button>
                <span className="flex-1 text-center font-black text-gray-900 text-[14px]">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(100, q + 1))}
                  className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-3 h-3 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={(e) => setShowPrice(e.target.checked)}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-[12px] font-bold text-gray-600">Show Price</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showStoreName}
                onChange={(e) => setShowStoreName(e.target.checked)}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-[12px] font-bold text-gray-600">Show Store Name</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-black transition-colors"
            >
              <Download className="w-4 h-4" />
              Save / Download
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-black transition-colors shadow-md"
            >
              <Printer className="w-4 h-4" />
              Print {qty > 1 ? `(${qty} labels)` : "Label"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

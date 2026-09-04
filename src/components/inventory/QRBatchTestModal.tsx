"use client";

import React, { useState } from "react";
import { X, Printer, Barcode as BarcodeIcon } from "lucide-react";
import { generateCode39SVG } from "@/utils/barcodePrintUtility";

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  unitCost?: string | number;
  sellingPrice?: string | number;
  price?: string | number;
  category?: string;
}

interface QRBatchTestModalProps {
  products: ProductItem[];
  isOpen: boolean;
  onClose: () => void;
}

export default function QRBatchTestModal({
  products,
  isOpen,
  onClose,
}: QRBatchTestModalProps) {
  const testItems = products.slice(0, 2);
  const [labelsPerProduct, setLabelsPerProduct] = useState(2);

  if (!isOpen) return null;

  const handlePrintTest = () => {
    const labelPairs: string[] = [];

    testItems.forEach((item, itemIdx) => {
      const barcodeValue = item.sku || (item as any).barcode || `SKU_${itemIdx + 1}`;
      const barcodeSVG = generateCode39SVG(barcodeValue);
      const productName = item.name || "Hardware Product";
      const nameLen = productName.length;
      const fontSize =
        nameLen > 55 ? '4pt' :
        nameLen > 45 ? '4.5pt' :
        nameLen > 38 ? '5pt' :
        nameLen > 30 ? '5.5pt' :
        nameLen > 24 ? '6pt' :
        nameLen > 18 ? '7pt' : '8pt';

      for (let i = 0; i < labelsPerProduct; i += 2) {
        const makeCard = () => `
          <div class="label-card">
            <div class="prod-name" style="font-size: ${fontSize};">${productName}</div>
            <div class="barcode-wrapper">${barcodeSVG}</div>
            <div class="sku-text">${barcodeValue}</div>
          </div>`;

        labelPairs.push(`
          <div class="label-row">
            ${makeCard()}
            ${makeCard()}
          </div>`);
      }
    });

    const printHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title></title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  @page {
    size: 100mm 25mm;
    margin: 0;
  }

  html, body {
    width: 100mm;
    height: 25mm;
    margin: 0;
    padding: 0;
    background: white;
    -webkit-print-color-adjust: exact;
  }

  .label-row {
    width: 100mm;
    height: 25mm;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-around;
    page-break-after: always;
    break-after: page;
    box-sizing: border-box;
  }

  .label-row:last-child {
    page-break-after: avoid;
    break-after: avoid;
  }

  .label-card {
    width: 48mm;
    height: 20mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 4.5mm 1mm 0.5mm 1mm;
    background: white;
    text-align: center;
    overflow: hidden;
  }

  .prod-name {
    font-family: Arial, sans-serif;
    font-weight: 900;
    color: #000;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: break-word;
    width: 100%;
    max-height: 7mm;
    overflow: hidden;
    line-height: 1.1;
    margin-bottom: 1mm;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-align: center;
  }

  .barcode-wrapper {
    width: 96%;
    height: 10mm;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1mm;
  }

  .sku-text {
    font-family: Arial, sans-serif;
    font-size: 8.5pt;
    font-weight: 900;
    color: #000;
    letter-spacing: 0.04em;
    line-height: 1;
  }

  .category-text {
    font-family: Arial, sans-serif;
    font-size: 6.5pt;
    font-weight: 600;
    color: #6b7280;
    line-height: 1;
  }
</style>
</head>
<body>
${labelPairs.join("")}
<script>
  window.onload = function() {
    setTimeout(function() { window.print(); }, 300);
  };
</script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(printHTML);
      win.document.close();
    } else {
      alert("Pop-up blocked! Please allow pop-ups for this site.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl border border-gray-100 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <BarcodeIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-[14px] font-black tracking-tight">
                Zebra ZD230 Barcode Batch Print Test
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {labelsPerProduct} labels × {testItems.length} products = {labelsPerProduct * testItems.length} total labels
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">

          {/* Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
            <div>
              <span className="text-[11px] font-black text-emerald-900 block">Labels per Product:</span>
              <span className="text-[10px] text-emerald-700 font-medium">
                {labelsPerProduct === 2 ? "Test Run: 1 row (2 labels)" : "Full Run: 3 rows (6 labels)"}
              </span>
            </div>
            <div className="flex gap-1 bg-white p-1 rounded-lg border border-emerald-200">
              {[2, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setLabelsPerProduct(n)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-black transition-all ${labelsPerProduct === n ? "bg-emerald-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {n === 2 ? "2 Labels" : "6 Labels"}
                </button>
              ))}
            </div>
          </div>

          {/* Product List with Barcode Previews */}
          <div className="space-y-2">
            {testItems.map((item, index) => {
              const barcodeValue = item.sku || (item as any).barcode || `SKU_${index + 1}`;
              const barcodeSVG = generateCode39SVG(barcodeValue);
              return (
                <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 bg-gray-50/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-[12px] flex items-center justify-center shrink-0">
                      0{index + 1}
                    </div>
                    <div>
                      <h4 className="text-[12px] font-black text-gray-900">{item.name}</h4>
                      <span className="text-[10px] font-mono font-bold text-slate-600">{barcodeValue}</span>
                    </div>
                  </div>
                  {/* Barcode preview exactly like sample image */}
                  <div className="bg-white border border-gray-300 rounded-lg p-1.5 flex flex-col items-center gap-0.5 shrink-0 shadow-sm" style={{ width: 150 }}>
                    <span
                      className="font-black text-gray-900 w-full text-center leading-tight"
                      style={{
                        fontSize: item.name.length > 40 ? '7px' : item.name.length > 28 ? '8px' : item.name.length > 20 ? '9px' : '9px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                      }}
                    >{item.name}</span>
                    <div className="w-full" style={{ height: 32 }} dangerouslySetInnerHTML={{ __html: barcodeSVG }} />
                    <span className="text-[8px] font-black text-gray-900 tracking-wider">{barcodeValue}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info bar */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              ⚡ 100mm × 25mm · Zebra ZD230 · No Margins
            </span>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-3.5 py-2 rounded-xl text-[12px] font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button
                onClick={handlePrintTest}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[12px] font-black shadow-md transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                Print {labelsPerProduct * testItems.length} Labels
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

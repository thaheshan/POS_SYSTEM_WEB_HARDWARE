/**
 * ─────────────────────────────────────────────────────────────────────────────
 * FUTURA HARDWARE POS — OFFLINE BARCODE LABEL PRINT UTILITY
 * Pure Client-Side Code 39 Barcode Generator & Spooler for Thermal Label Printers
 * ─────────────────────────────────────────────────────────────────────────────
 */

const CODE39_ENCODINGS: Record<string, string> = {
  '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
  '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
  '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
  'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
  'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
  'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
  'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
  'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
  'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
  '-': '010000101', '.': '110000100', ' ': '011000100', '*': '010010100',
  '$': '010101000', '/': '010100010', '+': '010001010', '%': '000101010'
};

/**
 * Encodes a string to Code 39 SVG representation
 */
export function generateCode39SVG(text: string): string {
  // Code 39 requires start/stop character '*'
  const cleanText = text.toUpperCase();
  const fullText = `*${cleanText}*`;
  
  let x = 0;
  const narrowWidth = 1.5;
  const wideWidth = 4.0;
  const intercharacterGap = 1.5;
  const height = 45;

  const rects: string[] = [];

  for (let i = 0; i < fullText.length; i++) {
    const char = fullText[i];
    const pattern = CODE39_ENCODINGS[char];
    if (!pattern) continue;

    // Pattern has 9 elements: alternating bars and spaces
    for (let j = 0; j < 9; j++) {
      const isBar = j % 2 === 0;
      const isWide = pattern[j] === '1';
      const width = isWide ? wideWidth : narrowWidth;

      if (isBar) {
        rects.push(`<rect x="${x}" y="0" width="${width}" height="${height}" fill="black" />`);
      }
      x += width;
    }
    // Intercharacter gap
    x += intercharacterGap;
  }

  return `
    <svg width="100%" height="100%" viewBox="0 0 ${x} ${height}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      ${rects.join('')}
    </svg>
  `;
}

export interface BarcodePrintOptions {
  productName: string;
  barcode: string;
  price: number | string;
  size: '2.0x1.0' | '1.5x1.0' | '1.25x1.0' | '1.0x0.5';
  quantity: number;
  storeName?: string;
}

/**
 * Spools barcode labels directly to the browser print dialog optimized for thermal label sheets/rolls
 */
export function printBarcodeLabels(options: BarcodePrintOptions) {
  const { productName, barcode, price, size, quantity, storeName = 'FUTURA HARDWARE' } = options;
  const barcodeSVG = generateCode39SVG(barcode);

  // Map label dimension names to CSS values
  const sizeMap = {
    '2.0x1.0': { width: '2.0in', height: '1.0in', fontTitle: '10px', fontText: '8px', barcodeHeight: '35px' },
    '1.5x1.0': { width: '1.5in', height: '1.0in', fontTitle: '9px', fontText: '7px', barcodeHeight: '30px' },
    '1.25x1.0': { width: '1.25in', height: '1.0in', fontTitle: '8px', fontText: '6.5px', barcodeHeight: '28px' },
    '1.0x0.5': { width: '1.0in', height: '0.5in', fontTitle: '6.5px', fontText: '5px', barcodeHeight: '16px' },
  };

  const dim = sizeMap[size] || sizeMap['2.0x1.0'];
  const formattedPrice = typeof price === 'number' ? `Rs. ${price.toLocaleString()}` : price;

  const labelCards = Array.from({ length: quantity })
    .map((_, i) => `
      <div class="label-card">
        <div class="store-name">${storeName}</div>
        <div class="product-name">${productName}</div>
        <div class="barcode-wrapper">${barcodeSVG}</div>
        <div class="barcode-text">${barcode}</div>
        <div class="price-tag">${formattedPrice}</div>
      </div>
    `)
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Print Labels - ${productName}</title>
  <style>
    @media print {
      @page {
        size: ${dim.width} ${dim.height};
        margin: 0;
      }
      body {
        margin: 0;
        background: #fff;
      }
      .label-card {
        page-break-after: always;
      }
      .label-card:last-child {
        page-break-after: avoid;
      }
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      background: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    }
    .label-card {
      width: ${dim.width};
      height: ${dim.height};
      background: white;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 3px 5px;
      text-align: center;
      border: 1px solid #e5e7eb;
      margin: 10px auto; /* Visible margin in preview, ignored in direct media print */
    }
    @media print {
      .label-card {
        margin: 0 !important;
        border: none !important;
      }
    }
    .store-name {
      font-size: ${dim.fontText};
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #000;
      text-transform: uppercase;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
    }
    .product-name {
      font-size: ${dim.fontTitle};
      font-weight: 700;
      color: #000;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      margin-top: 1px;
    }
    .barcode-wrapper {
      width: 90%;
      height: ${dim.barcodeHeight};
      margin: 2px 0 1px;
    }
    .barcode-text {
      font-family: monospace;
      font-size: ${dim.fontText};
      font-weight: 600;
      color: #000;
      letter-spacing: 0.15em;
    }
    .price-tag {
      font-size: ${dim.fontTitle};
      font-weight: 900;
      color: #000;
      margin-top: 1px;
    }
  </style>
</head>
<body>
  ${labelCards}
  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() { window.close(); }, 1000);
    };
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    alert('Pop-up blocked. Please allow pop-ups for Futura Hardware POS to print barcode labels.');
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/**
 * Inventory Export Utility
 * Generates structured, crash-proof Microsoft Excel (.xls XML Spreadsheet)
 * and CSV reports with complete valuation, stock status, category summary,
 * and reorder alerts.
 */

export function escapeXml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    // Strip XML 1.0 illegal control characters: \u0000-\u0008, \u000B, \u000C, \u000E-\u001F, \u007F
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function exportInventoryToExcel(
  inventoryData: any[],
  shopName: string = 'TRINCO HARDWARE & ELECTRICALS',
  reportingPeriod?: string
) {
  if (!inventoryData || inventoryData.length === 0) {
    alert('No inventory products available to export.');
    return;
  }

  // Calculate high-level inventory metrics
  const totalSKUs = inventoryData.length;
  let totalUnits = 0;
  let totalValuation = 0;
  let inStockCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  // Category Aggregator
  const categorySummaryMap = new Map<
    string,
    { count: number; units: number; value: number; alertCount: number }
  >();

  // Alerts List (Low Stock & Out of Stock)
  const alertsList: any[] = [];

  inventoryData.forEach((item) => {
    const qty = Number(item.qty ?? item.quantity ?? 0);
    const rawCost = Number(item.cost ?? item.purchasePrice ?? item.price ?? 0);
    const rawSelling = Number(item.sellingPrice ?? 0);
    const cost = rawCost > 0 ? rawCost : rawSelling;
    const totalVal = qty * cost;
    const minStock = Number(item.minStock ?? item.minimumStockLevel ?? 10);

    totalUnits += qty;
    totalValuation += totalVal;

    const isOut = qty <= 0;
    const isLow = !isOut && (qty <= minStock || item.status === 'Low Stock' || item.reorder === 'warning' || item.reorder === 'critical');

    if (isOut) {
      outOfStockCount++;
      alertsList.push({ ...item, computedQty: qty, computedCost: cost, computedVal: totalVal, minStock, alertType: 'OUT OF STOCK' });
    } else if (isLow) {
      lowStockCount++;
      alertsList.push({ ...item, computedQty: qty, computedCost: cost, computedVal: totalVal, minStock, alertType: 'LOW STOCK' });
    } else {
      inStockCount++;
    }

    // Category aggregation
    const catName = (item.category || 'Uncategorized').trim();
    const existing = categorySummaryMap.get(catName) || { count: 0, units: 0, value: 0, alertCount: 0 };
    existing.count += 1;
    existing.units += qty;
    existing.value += totalVal;
    if (isOut || isLow) existing.alertCount += 1;
    categorySummaryMap.set(catName, existing);
  });

  const nowFormatted = new Date().toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const periodText = reportingPeriod || `Full Catalog Snapshot as of ${nowFormatted}`;

  // Build Excel XML 2003 Spreadsheet string
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>${escapeXml(shopName)} - Inventory Valuation Report</Title>
  <Subject>Real-time Inventory Valuation and Stock Status</Subject>
  <Author>${escapeXml(shopName)}</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <OfficeDocumentSettings xmlns="urn:schemas-microsoft-com:office:office">
  <AllowPNG/>
 </OfficeDocumentSettings>
 <ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">
  <WindowHeight>12500</WindowHeight>
  <WindowWidth>26000</WindowWidth>
  <WindowTopX>0</WindowTopX>
  <WindowTopY>0</WindowTopY>
  <ProtectStructure>False</ProtectStructure>
  <ProtectWindows>False</ProtectWindows>
 </ExcelWorkbook>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>

  <!-- Titles & Headers -->
  <Style ss:ID="CompanyTitle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#1E3A8A"/>
  </Style>
  <Style ss:ID="ReportTitle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="Subtitle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Italic="1" ss:Color="#64748B"/>
  </Style>

  <!-- KPI Cards -->
  <Style ss:ID="KpiLabel">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9" ss:Bold="1" ss:Color="#475569"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="KpiValue">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
  </Style>

  <!-- Main Table Header -->
  <Style ss:ID="MainHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#047857"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#047857"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#047857"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10.5" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#047857" ss:Pattern="Solid"/>
  </Style>

  <!-- Category Table Header -->
  <Style ss:ID="CatHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1D4ED8"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1D4ED8"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1D4ED8"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1D4ED8"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10.5" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1D4ED8" ss:Pattern="Solid"/>
  </Style>

  <!-- Alert Table Header -->
  <Style ss:ID="AlertHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B91C1C"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#B91C1C"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B91C1C"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B91C1C"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10.5" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#B91C1C" ss:Pattern="Solid"/>
  </Style>

  <!-- Data Rows Styles -->
  <Style ss:ID="CellLeft">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="CellLeftBold">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="CellCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#334155"/>
  </Style>
  <Style ss:ID="CellCode">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Consolas" ss:Size="9.5" ss:Bold="1" ss:Color="#2563EB"/>
  </Style>
  <Style ss:ID="CellNumber">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0F172A"/>
   <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="CellCurrency">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0F172A"/>
   <NumberFormat ss:Format="&#34;Rs.&#34;\ #,##0.00"/>
  </Style>
  <Style ss:ID="CellCurrencyBold">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#047857"/>
   <NumberFormat ss:Format="&#34;Rs.&#34;\ #,##0.00"/>
  </Style>
  <Style ss:ID="CellPercent">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0F172A"/>
   <NumberFormat ss:Format="0.0%"/>
  </Style>

  <!-- Status Badges -->
  <Style ss:ID="StatusInStock">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9" ss:Bold="1" ss:Color="#065F46"/>
   <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="StatusLowStock">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9" ss:Bold="1" ss:Color="#92400E"/>
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="StatusOutOfStock">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9" ss:Bold="1" ss:Color="#991B1B"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
  </Style>

  <!-- Summary Total Rows -->
  <Style ss:ID="TotalLabel">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0F172A"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TotalNumber">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0F172A"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="TotalCurrency">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0F172A"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#047857"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="&#34;Rs.&#34;\ #,##0.00"/>
  </Style>
 </Styles>`;

  // ─────────────────────────────────────────────────────────────────────────────
  // SHEET 1: Master Inventory List
  // ─────────────────────────────────────────────────────────────────────────────
  xml += `\n <Worksheet ss:Name="Master Inventory">`;
  xml += `\n  <Table>`;
  // 16 columns configuration
  xml += `\n   <Column ss:Width="38"/>`;   // 1. #
  xml += `\n   <Column ss:Width="240"/>`;  // 2. Product Name
  xml += `\n   <Column ss:Width="95"/>`;   // 3. SKU
  xml += `\n   <Column ss:Width="110"/>`;  // 4. Barcode
  xml += `\n   <Column ss:Width="130"/>`;  // 5. Category
  xml += `\n   <Column ss:Width="115"/>`;  // 6. Subcategory
  xml += `\n   <Column ss:Width="105"/>`;  // 7. Brand
  xml += `\n   <Column ss:Width="120"/>`;  // 8. Warehouse
  xml += `\n   <Column ss:Width="75"/>`;   // 9. Qty
  xml += `\n   <Column ss:Width="70"/>`;   // 10. Unit
  xml += `\n   <Column ss:Width="105"/>`;  // 11. Unit Cost
  xml += `\n   <Column ss:Width="105"/>`;  // 12. Selling Price
  xml += `\n   <Column ss:Width="125"/>`;  // 13. Total Valuation
  xml += `\n   <Column ss:Width="75"/>`;   // 14. Min Stock
  xml += `\n   <Column ss:Width="95"/>`;   // 15. Status
  xml += `\n   <Column ss:Width="115"/>`;  // 16. Reorder Alert

  // Title Row
  xml += `\n   <Row ss:Height="26">`;
  xml += `\n    <Cell ss:MergeAcross="15" ss:StyleID="CompanyTitle"><Data ss:Type="String">${escapeXml(shopName.toUpperCase())}</Data></Cell>`;
  xml += `\n   </Row>`;

  // Report Name Row
  xml += `\n   <Row ss:Height="20">`;
  xml += `\n    <Cell ss:MergeAcross="15" ss:StyleID="ReportTitle"><Data ss:Type="String">INVENTORY VALUATION &amp; STOCK STATUS REPORT</Data></Cell>`;
  xml += `\n   </Row>`;

  // Subtitle / Period Row
  xml += `\n   <Row ss:Height="18">`;
  xml += `\n    <Cell ss:MergeAcross="15" ss:StyleID="Subtitle"><Data ss:Type="String">Period: ${escapeXml(periodText)} | Export Generated: ${escapeXml(nowFormatted)}</Data></Cell>`;
  xml += `\n   </Row>`;
  xml += `\n   <Row ss:Height="8"/>`;

  // KPI Summary Strip (Row 1: Labels)
  xml += `\n   <Row ss:Height="18">`;
  xml += `\n    <Cell ss:MergeAcross="1" ss:StyleID="KpiLabel"><Data ss:Type="String">TOTAL SKUs</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiLabel"><Data ss:Type="String">TOTAL STOCK VALUE</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiLabel"><Data ss:Type="String">TOTAL UNITS IN STOCK</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiLabel"><Data ss:Type="String">IN STOCK</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiLabel"><Data ss:Type="String">LOW STOCK ALERTS</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiLabel"><Data ss:Type="String">OUT OF STOCK</Data></Cell>`;
  xml += `\n   </Row>`;

  // KPI Summary Strip (Row 2: Values)
  xml += `\n   <Row ss:Height="24">`;
  xml += `\n    <Cell ss:MergeAcross="1" ss:StyleID="KpiValue"><Data ss:Type="String">${totalSKUs.toLocaleString()}</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiValue"><Data ss:Type="String">Rs. ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiValue"><Data ss:Type="String">${totalUnits.toLocaleString()}</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiValue"><Data ss:Type="String">${inStockCount.toLocaleString()}</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiValue"><Data ss:Type="String">${lowStockCount.toLocaleString()}</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiValue"><Data ss:Type="String">${outOfStockCount.toLocaleString()}</Data></Cell>`;
  xml += `\n   </Row>`;
  xml += `\n   <Row ss:Height="12"/>`;

  // Master Table Headers (16 columns)
  const masterHeaders = [
    '#',
    'Product Name',
    'SKU',
    'Barcode',
    'Category',
    'Subcategory',
    'Brand',
    'Warehouse',
    'Qty',
    'Unit',
    'Unit Cost (Rs.)',
    'Selling Price (Rs.)',
    'Total Valuation (Rs.)',
    'Min Stock',
    'Status',
    'Reorder Action',
  ];

  xml += `\n   <Row ss:Height="28">`;
  masterHeaders.forEach((h) => {
    xml += `\n    <Cell ss:StyleID="MainHeader"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`;
  });
  xml += `\n   </Row>`;

  // Data Rows
  inventoryData.forEach((item, idx) => {
    const qty = Number(item.qty ?? item.quantity ?? 0);
    const rawCost = Number(item.cost ?? item.purchasePrice ?? item.price ?? 0);
    const rawSelling = Number(item.sellingPrice ?? 0);
    const cost = rawCost > 0 ? rawCost : rawSelling;
    const selling = rawSelling;
    const totalVal = qty * cost;
    const minStock = Number(item.minStock ?? item.minimumStockLevel ?? 10);

    const isOut = qty <= 0;
    const isLow = !isOut && (qty <= minStock || item.status === 'Low Stock' || item.reorder === 'warning' || item.reorder === 'critical');
    const statusText = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock';
    const statusStyle = isOut ? 'StatusOutOfStock' : isLow ? 'StatusLowStock' : 'StatusInStock';
    const reorderAction = isOut ? 'CRITICAL (0 Qty)' : isLow ? `REORDER (Deficit: ${minStock - qty})` : 'Normal';

    const skuVal = item.sku || item.skuInfo || 'N/A';
    const barcodeVal = item.barcode || skuVal;
    const unitText = item.unit || item.measurementUnit || 'pcs';

    xml += `\n   <Row ss:Height="21">`;
    xml += `\n    <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${idx + 1}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeftBold"><Data ss:Type="String">${escapeXml(item.name || item.product_name || 'Unknown')}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellCode"><Data ss:Type="String">${escapeXml(skuVal)}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(barcodeVal)}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(item.category || 'Uncategorized')}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(item.subCategory || item.subcategory || '—')}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(item.brand || '—')}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(item.warehouse || 'Main Warehouse')}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${qty}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(unitText)}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellCurrency"><Data ss:Type="Number">${cost}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellCurrency"><Data ss:Type="Number">${selling}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellCurrencyBold"><Data ss:Type="Number">${totalVal}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${minStock}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${escapeXml(statusText)}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(reorderAction)}</Data></Cell>`;
    xml += `\n   </Row>`;
  });

  // Grand Total Summary Row (columns 1 to 8 merged, then Qty, Unit, Cost, Selling, TotalVal, Min, Status, Action)
  xml += `\n   <Row ss:Height="26">`;
  xml += `\n    <Cell ss:MergeAcross="7" ss:StyleID="TotalLabel"><Data ss:Type="String">GRAND TOTAL (${totalSKUs} SKUs)</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalNumber"><Data ss:Type="Number">${totalUnits}</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">units</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">—</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">—</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalCurrency"><Data ss:Type="Number">${totalValuation}</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">—</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">—</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">—</Data></Cell>`;
  xml += `\n   </Row>`;

  xml += `\n  </Table>`;
  xml += `\n </Worksheet>`;

  // ─────────────────────────────────────────────────────────────────────────────
  // SHEET 2: Category Valuation Summary
  // ─────────────────────────────────────────────────────────────────────────────
  xml += `\n <Worksheet ss:Name="Category Summary">`;
  xml += `\n  <Table>`;
  xml += `\n   <Column ss:Width="40"/>`;   // #
  xml += `\n   <Column ss:Width="200"/>`;  // Category Name
  xml += `\n   <Column ss:Width="100"/>`;  // SKU Count
  xml += `\n   <Column ss:Width="110"/>`;  // Total Units
  xml += `\n   <Column ss:Width="150"/>`;  // Total Valuation
  xml += `\n   <Column ss:Width="110"/>`;  // % Share of Total
  xml += `\n   <Column ss:Width="140"/>`;  // Low / Out of Stock

  // Category Header Row
  xml += `\n   <Row ss:Height="24">`;
  xml += `\n    <Cell ss:MergeAcross="6" ss:StyleID="CompanyTitle"><Data ss:Type="String">CATEGORY VALUATION &amp; DISTRIBUTION BREAKDOWN</Data></Cell>`;
  xml += `\n   </Row>`;
  xml += `\n   <Row ss:Height="18">`;
  xml += `\n    <Cell ss:MergeAcross="6" ss:StyleID="Subtitle"><Data ss:Type="String">Summary of inventory investment, SKU volume, and stock risk by category.</Data></Cell>`;
  xml += `\n   </Row>`;
  xml += `\n   <Row ss:Height="10"/>`;

  // Headers
  const catHeaders = [
    '#',
    'Category Name',
    'Total SKUs',
    'Units in Stock',
    'Stock Value (Rs.)',
    '% Share of Value',
    'Alert Items (Low/Out)',
  ];

  xml += `\n   <Row ss:Height="26">`;
  catHeaders.forEach((h) => {
    xml += `\n    <Cell ss:StyleID="CatHeader"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`;
  });
  xml += `\n   </Row>`;

  // Sorted Categories by valuation descending
  const sortedCategories = Array.from(categorySummaryMap.entries()).sort(
    (a, b) => b[1].value - a[1].value
  );

  sortedCategories.forEach(([name, stats], idx) => {
    const percentShare = totalValuation > 0 ? stats.value / totalValuation : 0;
    xml += `\n   <Row ss:Height="20">`;
    xml += `\n    <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${idx + 1}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeftBold"><Data ss:Type="String">${escapeXml(name)}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${stats.count}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${stats.units}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellCurrencyBold"><Data ss:Type="Number">${stats.value}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellPercent"><Data ss:Type="Number">${percentShare}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="${stats.alertCount > 0 ? 'StatusLowStock' : 'CellCenter'}"><Data ss:Type="Number">${stats.alertCount}</Data></Cell>`;
    xml += `\n   </Row>`;
  });

  // Category Total Row
  xml += `\n   <Row ss:Height="24">`;
  xml += `\n    <Cell ss:MergeAcross="1" ss:StyleID="TotalLabel"><Data ss:Type="String">TOTAL</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalNumber"><Data ss:Type="Number">${totalSKUs}</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalNumber"><Data ss:Type="Number">${totalUnits}</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalCurrency"><Data ss:Type="Number">${totalValuation}</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">100.0%</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalNumber"><Data ss:Type="Number">${lowStockCount + outOfStockCount}</Data></Cell>`;
  xml += `\n   </Row>`;

  xml += `\n  </Table>`;
  xml += `\n </Worksheet>`;

  // ─────────────────────────────────────────────────────────────────────────────
  // SHEET 3: Stock Alerts & Restock Queue
  // ─────────────────────────────────────────────────────────────────────────────
  xml += `\n <Worksheet ss:Name="Stock Alerts">`;
  xml += `\n  <Table>`;
  xml += `\n   <Column ss:Width="38"/>`;   // #
  xml += `\n   <Column ss:Width="230"/>`;  // Product Name
  xml += `\n   <Column ss:Width="95"/>`;   // SKU
  xml += `\n   <Column ss:Width="130"/>`;  // Category
  xml += `\n   <Column ss:Width="120"/>`;  // Warehouse
  xml += `\n   <Column ss:Width="75"/>`;   // Current Qty
  xml += `\n   <Column ss:Width="80"/>`;   // Min Stock
  xml += `\n   <Column ss:Width="85"/>`;   // Shortage Qty
  xml += `\n   <Column ss:Width="105"/>`;  // Unit Cost
  xml += `\n   <Column ss:Width="130"/>`;  // Est. Reorder Cost
  xml += `\n   <Column ss:Width="110"/>`;  // Status
  xml += `\n   <Column ss:Width="140"/>`;  // Supplier

  // Alert Header Row
  xml += `\n   <Row ss:Height="24">`;
  xml += `\n    <Cell ss:MergeAcross="11" ss:StyleID="CompanyTitle"><Data ss:Type="String">CRITICAL STOCK ALERTS &amp; REORDER RECOMMENDATIONS</Data></Cell>`;
  xml += `\n   </Row>`;
  xml += `\n   <Row ss:Height="18">`;
  xml += `\n    <Cell ss:MergeAcross="11" ss:StyleID="Subtitle"><Data ss:Type="String">Requires immediate purchasing. Total items needing attention: ${alertsList.length} (Out of Stock: ${outOfStockCount}, Low Stock: ${lowStockCount})</Data></Cell>`;
  xml += `\n   </Row>`;
  xml += `\n   <Row ss:Height="10"/>`;

  // Headers
  const alertHeaders = [
    '#',
    'Product Name',
    'SKU',
    'Category',
    'Warehouse',
    'Current Qty',
    'Min Stock',
    'Deficit Qty',
    'Unit Cost (Rs.)',
    'Est. Restock Cost (Rs.)',
    'Alert Status',
    'Primary Supplier',
  ];

  xml += `\n   <Row ss:Height="26">`;
  alertHeaders.forEach((h) => {
    xml += `\n    <Cell ss:StyleID="AlertHeader"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`;
  });
  xml += `\n   </Row>`;

  let totalRestockDeficitUnits = 0;
  let totalRestockEstCost = 0;

  if (alertsList.length === 0) {
    xml += `\n   <Row ss:Height="24">`;
    xml += `\n    <Cell ss:MergeAcross="11" ss:StyleID="CellCenter"><Data ss:Type="String">No stock alerts! All products are currently adequately stocked.</Data></Cell>`;
    xml += `\n   </Row>`;
  } else {
    alertsList.forEach((item, idx) => {
      const qty = item.computedQty;
      const min = item.minStock;
      const deficit = Math.max(0, min - qty);
      const cost = item.computedCost;
      const reorderCost = deficit * cost;

      totalRestockDeficitUnits += deficit;
      totalRestockEstCost += reorderCost;

      const isOut = item.alertType === 'OUT OF STOCK';

      xml += `\n   <Row ss:Height="20">`;
      xml += `\n    <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${idx + 1}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="CellLeftBold"><Data ss:Type="String">${escapeXml(item.name || item.product_name || 'Unknown')}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="CellCode"><Data ss:Type="String">${escapeXml(item.sku || item.skuInfo || 'N/A')}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(item.category || 'Uncategorized')}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(item.warehouse || 'Main Warehouse')}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${qty}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${min}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${deficit}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="CellCurrency"><Data ss:Type="Number">${cost}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="CellCurrencyBold"><Data ss:Type="Number">${reorderCost}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="${isOut ? 'StatusOutOfStock' : 'StatusLowStock'}"><Data ss:Type="String">${escapeXml(item.alertType)}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(item.supplier || '—')}</Data></Cell>`;
      xml += `\n   </Row>`;
    });

    // Total Row for Alerts
    xml += `\n   <Row ss:Height="24">`;
    xml += `\n    <Cell ss:MergeAcross="6" ss:StyleID="TotalLabel"><Data ss:Type="String">TOTAL RESTOCK INVESTMENT NEEDED</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="TotalNumber"><Data ss:Type="Number">${totalRestockDeficitUnits}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">—</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="TotalCurrency"><Data ss:Type="Number">${totalRestockEstCost}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">—</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">—</Data></Cell>`;
    xml += `\n   </Row>`;
  }

  xml += `\n  </Table>`;
  xml += `\n </Worksheet>`;

  xml += `\n</Workbook>`;

  // Create downloadable Blob
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  // Clean filename: Replace non-alphanumeric with underscores
  const cleanShopName = shopName.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 30);
  const dateStamp = new Date().toISOString().split('T')[0];
  link.download = `${cleanShopName}_Inventory_Report_${dateStamp}.xls`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Universal CSV Export with UTF-8 BOM
 * Guaranteed to open cleanly in Excel, Numbers, and Google Sheets
 */
export function exportInventoryToCSV(
  inventoryData: any[],
  shopName: string = 'TRINCO HARDWARE & ELECTRICALS'
) {
  if (!inventoryData || inventoryData.length === 0) {
    alert('No inventory products available to export.');
    return;
  }

  const headers = [
    'No',
    'Product Name',
    'SKU',
    'Barcode',
    'Category',
    'Subcategory',
    'Brand',
    'Warehouse',
    'Available Qty',
    'Unit',
    'Unit Cost (Rs.)',
    'Selling Price (Rs.)',
    'Total Value (Rs.)',
    'Min Stock Level',
    'Status',
    'Reorder Action',
    'Supplier',
  ];

  const rows = inventoryData.map((item: any, idx: number) => {
    const qty = Number(item.qty ?? item.quantity ?? 0);
    const rawCost = Number(item.cost ?? item.purchasePrice ?? item.price ?? 0);
    const rawSelling = Number(item.sellingPrice ?? 0);
    const cost = rawCost > 0 ? rawCost : rawSelling;
    const totalVal = qty * cost;
    const minStock = Number(item.minStock ?? item.minimumStockLevel ?? 10);

    const isOut = qty <= 0;
    const isLow = !isOut && (qty <= minStock || item.status === 'Low Stock' || item.reorder === 'warning');
    const statusText = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock';
    const reorderAction = isOut ? 'CRITICAL (0 Qty)' : isLow ? `REORDER (Deficit: ${minStock - qty})` : 'Normal';

    return [
      idx + 1,
      item.name || item.product_name || '',
      item.sku || item.skuInfo || '',
      item.barcode || item.sku || '',
      item.category || '',
      item.subCategory || item.subcategory || '—',
      item.brand || '—',
      item.warehouse || 'Main Warehouse',
      qty,
      item.unit || item.measurementUnit || 'pcs',
      cost.toFixed(2),
      rawSelling.toFixed(2),
      totalVal.toFixed(2),
      minStock,
      statusText,
      reorderAction,
      item.supplier || '',
    ];
  });

  // UTF-8 BOM (\uFEFF) ensures Excel opens foreign characters and accents without mangling
  const csvContent =
    '\uFEFF' +
    [headers, ...rows]
      .map((row) =>
        row
          .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const cleanShopName = shopName.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 30);
  const dateStamp = new Date().toISOString().split('T')[0];
  link.download = `${cleanShopName}_Inventory_Export_${dateStamp}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

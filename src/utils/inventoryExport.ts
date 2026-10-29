/**
 * Inventory Export Utility
 * Generates structured, crash-proof Microsoft Excel (.xls XML Spreadsheet)
 * and CSV reports with complete valuation, stock status, category summary,
 * and reorder alerts.
 *
 * Fully sorted and split up by Category -> Subcategory -> Brand hierarchy.
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

/**
 * Sorts inventory products hierarchically by:
 * 1. Category (A-Z)
 * 2. Subcategory (A-Z)
 * 3. Brand (A-Z)
 * 4. Product Name (A-Z)
 */
export function sortInventoryHierarchy(items: any[]): any[] {
  return [...items].sort((a, b) => {
    const catA = String(a.category || 'Uncategorized').trim().toLowerCase();
    const catB = String(b.category || 'Uncategorized').trim().toLowerCase();
    if (catA !== catB) return catA.localeCompare(catB);

    const subA = String(a.subCategory || a.subcategory || 'General').trim().toLowerCase();
    const subB = String(b.subCategory || b.subcategory || 'General').trim().toLowerCase();
    if (subA !== subB) return subA.localeCompare(subB);

    const brandA = String(a.brand || 'Unbranded').trim().toLowerCase();
    const brandB = String(b.brand || 'Unbranded').trim().toLowerCase();
    if (brandA !== brandB) return brandA.localeCompare(brandB);

    const nameA = String(a.name || a.product_name || '').trim().toLowerCase();
    const nameB = String(b.name || b.product_name || '').trim().toLowerCase();
    return nameA.localeCompare(nameB);
  });
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

  // 1. Sort inventory by Category -> Subcategory -> Brand -> Product Name
  const sortedData = sortInventoryHierarchy(inventoryData);

  // 2. High-level totals & aggregation maps
  const totalSKUs = sortedData.length;
  let totalUnits = 0;
  let totalValuation = 0;
  let inStockCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  // Pre-calculate Category, Subcategory, and Brand totals for splitup headers & subtotals
  const catStatsMap = new Map<string, { displayName: string; count: number; units: number; val: number; alertCount: number }>();
  const subStatsMap = new Map<string, { displayName: string; count: number; units: number; val: number }>();
  const brandStatsMap = new Map<string, { displayName: string; count: number; units: number; val: number }>();

  // Full Hierarchy Breakdown for Sheet 2
  interface HierarchyRecord {
    category: string;
    subcategory: string;
    brand: string;
    skus: number;
    units: number;
    valuation: number;
    alertCount: number;
  }
  const hierarchyMap = new Map<string, HierarchyRecord>();

  // Alerts List (Low Stock & Out of Stock)
  const alertsList: any[] = [];

  sortedData.forEach((item) => {
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

    const catName = (item.category || 'Uncategorized').trim();
    const catKey = catName.toLowerCase();
    const subName = (item.subCategory || item.subcategory || 'General').trim();
    const subKey = `${catKey}:::${subName.toLowerCase()}`;
    const brandName = (item.brand || 'Unbranded').trim();
    const brandKey = `${subKey}:::${brandName.toLowerCase()}`;

    // Category stats
    const catStats = catStatsMap.get(catKey) || { displayName: catName, count: 0, units: 0, val: 0, alertCount: 0 };
    catStats.count += 1;
    catStats.units += qty;
    catStats.val += totalVal;
    if (isOut || isLow) catStats.alertCount += 1;
    catStatsMap.set(catKey, catStats);

    // Subcategory stats
    const subStats = subStatsMap.get(subKey) || { displayName: subName, count: 0, units: 0, val: 0 };
    subStats.count += 1;
    subStats.units += qty;
    subStats.val += totalVal;
    subStatsMap.set(subKey, subStats);

    // Brand stats
    const brandStats = brandStatsMap.get(brandKey) || { displayName: brandName, count: 0, units: 0, val: 0 };
    brandStats.count += 1;
    brandStats.units += qty;
    brandStats.val += totalVal;
    brandStatsMap.set(brandKey, brandStats);

    // Sheet 2 Hierarchy breakdown
    const hRecord = hierarchyMap.get(brandKey) || {
      category: catName,
      subcategory: subName,
      brand: brandName,
      skus: 0,
      units: 0,
      valuation: 0,
      alertCount: 0,
    };
    hRecord.skus += 1;
    hRecord.units += qty;
    hRecord.valuation += totalVal;
    if (isOut || isLow) hRecord.alertCount += 1;
    hierarchyMap.set(brandKey, hRecord);
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
  <Title>${escapeXml(shopName)} - Inventory Hierarchy &amp; Valuation Report</Title>
  <Subject>Real-time Inventory Grouped by Category, Subcategory and Brand</Subject>
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

  <!-- Table Headers -->
  <Style ss:ID="MainHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#047857"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#047857"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#047857"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#047857" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="CatHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1D4ED8"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1D4ED8"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1D4ED8"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1D4ED8"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1D4ED8" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="AlertHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B91C1C"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#B91C1C"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B91C1C"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#B91C1C"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#B91C1C" ss:Pattern="Solid"/>
  </Style>

  <!-- Hierarchy Splitup Banners -->
  <Style ss:ID="CategoryBanner">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1E3A8A"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1E3A8A"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="SubcategoryBanner">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#93C5FD"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#93C5FD"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#1E40AF"/>
   <Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="BrandBanner">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#334155"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>

  <!-- Category Subtotal Rows -->
  <Style ss:ID="CatSubtotalLabel">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#1E3A8A"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="CatSubtotalNumber">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#1E3A8A"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="CatSubtotalCurrency">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#1E3A8A"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="&#34;Rs.&#34;\ #,##0.00"/>
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
   <Font ss:FontName="Consolas" ss:Size="9.5" ss:Bold="1" ss:Color="#0369A1"/>
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
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#334155"/>
   <NumberFormat ss:Format="&#34;Rs.&#34;\ #,##0.00"/>
  </Style>
  <Style ss:ID="CellCurrencyBold">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#0F172A"/>
   <NumberFormat ss:Format="&#34;Rs.&#34;\ #,##0.00"/>
  </Style>
  <Style ss:ID="CellPercent">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#334155"/>
   <NumberFormat ss:Format="0.0%"/>
  </Style>

  <!-- Stock Status Badges -->
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
  // SHEET 1: Master Inventory List (Organized by Category -> Subcategory -> Brand)
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
  xml += `\n    <Cell ss:MergeAcross="15" ss:StyleID="ReportTitle"><Data ss:Type="String">INVENTORY LIST (BY CATEGORY &gt; SUBCATEGORY &gt; BRAND)</Data></Cell>`;
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
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiLabel"><Data ss:Type="String">TOTAL UNITS ON HAND</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiLabel"><Data ss:Type="String">IN STOCK</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiLabel"><Data ss:Type="String">LOW STOCK</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiLabel"><Data ss:Type="String">OUT OF STOCK</Data></Cell>`;
  xml += `\n   </Row>`;

  // KPI Summary Strip (Row 2: Values)
  xml += `\n   <Row ss:Height="22">`;
  xml += `\n    <Cell ss:MergeAcross="1" ss:StyleID="KpiValue"><Data ss:Type="Number">${totalSKUs}</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiValue"><Data ss:Type="String">Rs. ${totalValuation.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiValue"><Data ss:Type="Number">${totalUnits}</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiValue"><Data ss:Type="Number">${inStockCount}</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiValue"><Data ss:Type="Number">${lowStockCount}</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiValue"><Data ss:Type="Number">${outOfStockCount}</Data></Cell>`;
  xml += `\n   </Row>`;
  xml += `\n   <Row ss:Height="12"/>`;

  // Master Column Headers
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

  // Track state for hierarchy splitup
  let activeCatKey: string | null = null;
  let activeSubKey: string | null = null;
  let activeBrandKey: string | null = null;

  sortedData.forEach((item, idx) => {
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

    const catName = (item.category || 'Uncategorized').trim();
    const catKey = catName.toLowerCase();
    const subName = (item.subCategory || item.subcategory || 'General').trim();
    const subKey = `${catKey}:::${subName.toLowerCase()}`;
    const brandName = (item.brand || 'Unbranded').trim();
    const brandKey = `${subKey}:::${brandName.toLowerCase()}`;

    // 1. Category Transition: Output previous subtotal & new Category Banner
    if (catKey !== activeCatKey) {
      if (activeCatKey !== null) {
        // Output Category Subtotal for previous category
        const prevStats = catStatsMap.get(activeCatKey)!;
        xml += `\n   <Row ss:Height="22">`;
        xml += `\n    <Cell ss:MergeAcross="7" ss:StyleID="CatSubtotalLabel"><Data ss:Type="String">${escapeXml(prevStats.displayName)} Subtotal (${prevStats.count} SKUs)</Data></Cell>`;
        xml += `\n    <Cell ss:StyleID="CatSubtotalNumber"><Data ss:Type="Number">${prevStats.units}</Data></Cell>`;
        xml += `\n    <Cell ss:StyleID="CatSubtotalLabel"><Data ss:Type="String">units</Data></Cell>`;
        xml += `\n    <Cell ss:StyleID="CatSubtotalLabel"><Data ss:Type="String">—</Data></Cell>`;
        xml += `\n    <Cell ss:StyleID="CatSubtotalLabel"><Data ss:Type="String">—</Data></Cell>`;
        xml += `\n    <Cell ss:StyleID="CatSubtotalCurrency"><Data ss:Type="Number">${prevStats.val}</Data></Cell>`;
        xml += `\n    <Cell ss:StyleID="CatSubtotalLabel"><Data ss:Type="String">—</Data></Cell>`;
        xml += `\n    <Cell ss:StyleID="CatSubtotalLabel"><Data ss:Type="String">—</Data></Cell>`;
        xml += `\n    <Cell ss:StyleID="CatSubtotalLabel"><Data ss:Type="String">—</Data></Cell>`;
        xml += `\n   </Row>`;
        xml += `\n   <Row ss:Height="8"/>`;
      }

      const cStats = catStatsMap.get(catKey)!;
      xml += `\n   <Row ss:Height="24">`;
      xml += `\n    <Cell ss:MergeAcross="15" ss:StyleID="CategoryBanner"><Data ss:Type="String">📁 CATEGORY: ${escapeXml(catName.toUpperCase())}  (${cStats.count} Products | ${cStats.units} Units | Rs. ${Math.round(cStats.val).toLocaleString('en-LK')})</Data></Cell>`;
      xml += `\n   </Row>`;

      activeCatKey = catKey;
      activeSubKey = null;
      activeBrandKey = null;
    }

    // 2. Subcategory Transition: Output Subcategory Banner
    if (subKey !== activeSubKey) {
      const sStats = subStatsMap.get(subKey)!;
      xml += `\n   <Row ss:Height="20">`;
      xml += `\n    <Cell ss:MergeAcross="15" ss:StyleID="SubcategoryBanner"><Data ss:Type="String">   ↳ SUBCATEGORY: ${escapeXml(subName.toUpperCase())}  (${sStats.count} Products | ${sStats.units} Units | Rs. ${Math.round(sStats.val).toLocaleString('en-LK')})</Data></Cell>`;
      xml += `\n   </Row>`;

      activeSubKey = subKey;
      activeBrandKey = null;
    }

    // 3. Brand Transition: Output Brand Banner
    if (brandKey !== activeBrandKey) {
      const bStats = brandStatsMap.get(brandKey)!;
      xml += `\n   <Row ss:Height="18">`;
      xml += `\n    <Cell ss:MergeAcross="15" ss:StyleID="BrandBanner"><Data ss:Type="String">      🏷️ BRAND: ${escapeXml(brandName.toUpperCase())}  (${bStats.count} items | ${bStats.units} units)</Data></Cell>`;
      xml += `\n   </Row>`;

      activeBrandKey = brandKey;
    }

    // Product Data Row
    xml += `\n   <Row ss:Height="21">`;
    xml += `\n    <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${idx + 1}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeftBold"><Data ss:Type="String">${escapeXml(item.name || item.product_name || 'Unknown')}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellCode"><Data ss:Type="String">${escapeXml(skuVal)}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(barcodeVal)}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(catName)}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(subName)}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(brandName)}</Data></Cell>`;
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

  // Final Category Subtotal Row
  if (activeCatKey !== null) {
    const lastStats = catStatsMap.get(activeCatKey)!;
    xml += `\n   <Row ss:Height="22">`;
    xml += `\n    <Cell ss:MergeAcross="7" ss:StyleID="CatSubtotalLabel"><Data ss:Type="String">${escapeXml(lastStats.displayName)} Subtotal (${lastStats.count} SKUs)</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CatSubtotalNumber"><Data ss:Type="Number">${lastStats.units}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CatSubtotalLabel"><Data ss:Type="String">units</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CatSubtotalLabel"><Data ss:Type="String">—</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CatSubtotalLabel"><Data ss:Type="String">—</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CatSubtotalCurrency"><Data ss:Type="Number">${lastStats.val}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CatSubtotalLabel"><Data ss:Type="String">—</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CatSubtotalLabel"><Data ss:Type="String">—</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CatSubtotalLabel"><Data ss:Type="String">—</Data></Cell>`;
    xml += `\n   </Row>`;
  }

  // Grand Total Summary Row
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
  // SHEET 2: Hierarchy Breakdown (Category > Subcategory > Brand Executive Split)
  // ─────────────────────────────────────────────────────────────────────────────
  xml += `\n <Worksheet ss:Name="Hierarchy Splitup">`;
  xml += `\n  <Table>`;
  xml += `\n   <Column ss:Width="38"/>`;   // 1. #
  xml += `\n   <Column ss:Width="160"/>`;  // 2. Category
  xml += `\n   <Column ss:Width="140"/>`;  // 3. Subcategory
  xml += `\n   <Column ss:Width="130"/>`;  // 4. Brand
  xml += `\n   <Column ss:Width="80"/>`;   // 5. SKU Count
  xml += `\n   <Column ss:Width="95"/>`;   // 6. Units in Stock
  xml += `\n   <Column ss:Width="140"/>`;  // 7. Stock Valuation (Rs.)
  xml += `\n   <Column ss:Width="120"/>`;  // 8. Avg Cost / Unit (Rs.)
  xml += `\n   <Column ss:Width="105"/>`;  // 9. % of Total Value
  xml += `\n   <Column ss:Width="130"/>`;  // 10. Low / Out of Stock

  // Header Title
  xml += `\n   <Row ss:Height="24">`;
  xml += `\n    <Cell ss:MergeAcross="9" ss:StyleID="CompanyTitle"><Data ss:Type="String">INVENTORY SPLITUP BY CATEGORY, SUBCATEGORY &amp; BRAND</Data></Cell>`;
  xml += `\n   </Row>`;
  xml += `\n   <Row ss:Height="18">`;
  xml += `\n    <Cell ss:MergeAcross="9" ss:StyleID="Subtitle"><Data ss:Type="String">Executive hierarchical distribution breakdown showing SKU counts, units, and inventory value share.</Data></Cell>`;
  xml += `\n   </Row>`;
  xml += `\n   <Row ss:Height="10"/>`;

  // Headers
  const splitHeaders = [
    '#',
    'Category',
    'Subcategory',
    'Brand',
    'Total SKUs',
    'Units in Stock',
    'Stock Value (Rs.)',
    'Avg Unit Cost (Rs.)',
    '% Share of Value',
    'Alert Items (Low/Out)',
  ];

  xml += `\n   <Row ss:Height="26">`;
  splitHeaders.forEach((h) => {
    xml += `\n    <Cell ss:StyleID="CatHeader"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`;
  });
  xml += `\n   </Row>`;

  // Sorted list of hierarchy records by Valuation descending
  const sortedHierarchy = Array.from(hierarchyMap.values()).sort((a, b) => b.valuation - a.valuation);

  sortedHierarchy.forEach((rec, idx) => {
    const percentShare = totalValuation > 0 ? rec.valuation / totalValuation : 0;
    const avgCost = rec.units > 0 ? rec.valuation / rec.units : 0;

    xml += `\n   <Row ss:Height="20">`;
    xml += `\n    <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${idx + 1}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeftBold"><Data ss:Type="String">${escapeXml(rec.category)}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(rec.subcategory)}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(rec.brand)}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${rec.skus}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${rec.units}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellCurrencyBold"><Data ss:Type="Number">${rec.valuation}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellCurrency"><Data ss:Type="Number">${avgCost}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellPercent"><Data ss:Type="Number">${percentShare}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="${rec.alertCount > 0 ? 'StatusLowStock' : 'CellCenter'}"><Data ss:Type="Number">${rec.alertCount}</Data></Cell>`;
    xml += `\n   </Row>`;
  });

  // Hierarchy Total Row
  xml += `\n   <Row ss:Height="24">`;
  xml += `\n    <Cell ss:MergeAcross="3" ss:StyleID="TotalLabel"><Data ss:Type="String">TOTAL</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalNumber"><Data ss:Type="Number">${totalSKUs}</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalNumber"><Data ss:Type="Number">${totalUnits}</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalCurrency"><Data ss:Type="Number">${totalValuation}</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalCurrency"><Data ss:Type="Number">${totalUnits > 0 ? totalValuation / totalUnits : 0}</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">100.0%</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalNumber"><Data ss:Type="Number">${lowStockCount + outOfStockCount}</Data></Cell>`;
  xml += `\n   </Row>`;

  xml += `\n  </Table>`;
  xml += `\n </Worksheet>`;

  // ─────────────────────────────────────────────────────────────────────────────
  // SHEET 3: Stock Alerts & Restock Queue (Organized by Category Hierarchy)
  // ─────────────────────────────────────────────────────────────────────────────
  xml += `\n <Worksheet ss:Name="Stock Alerts">`;
  xml += `\n  <Table>`;
  xml += `\n   <Column ss:Width="38"/>`;   // #
  xml += `\n   <Column ss:Width="230"/>`;  // Product Name
  xml += `\n   <Column ss:Width="95"/>`;   // SKU
  xml += `\n   <Column ss:Width="130"/>`;  // Category
  xml += `\n   <Column ss:Width="120"/>`;  // Subcategory
  xml += `\n   <Column ss:Width="110"/>`;  // Brand
  xml += `\n   <Column ss:Width="110"/>`;  // Warehouse
  xml += `\n   <Column ss:Width="75"/>`;   // Current Qty
  xml += `\n   <Column ss:Width="75"/>`;   // Min Level
  xml += `\n   <Column ss:Width="75"/>`;   // Deficit
  xml += `\n   <Column ss:Width="105"/>`;  // Unit Cost
  xml += `\n   <Column ss:Width="125"/>`;  // Est. Restock Cost
  xml += `\n   <Column ss:Width="120"/>`;  // Alert Level

  xml += `\n   <Row ss:Height="24">`;
  xml += `\n    <Cell ss:MergeAcross="12" ss:StyleID="CompanyTitle"><Data ss:Type="String">CRITICAL STOCK ALERTS &amp; REORDER QUEUE</Data></Cell>`;
  xml += `\n   </Row>`;
  xml += `\n   <Row ss:Height="18">`;
  xml += `\n    <Cell ss:MergeAcross="12" ss:StyleID="Subtitle"><Data ss:Type="String">Products currently out of stock or below minimum stock threshold, ordered by category and brand.</Data></Cell>`;
  xml += `\n   </Row>`;
  xml += `\n   <Row ss:Height="10"/>`;

  const alertHeaders = [
    '#',
    'Product Name',
    'SKU',
    'Category',
    'Subcategory',
    'Brand',
    'Warehouse',
    'Current Qty',
    'Min Level',
    'Deficit Qty',
    'Unit Cost (Rs.)',
    'Est. Restock Cost (Rs.)',
    'Alert Status',
  ];

  xml += `\n   <Row ss:Height="26">`;
  alertHeaders.forEach((h) => {
    xml += `\n    <Cell ss:StyleID="AlertHeader"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`;
  });
  xml += `\n   </Row>`;

  let totalAlertRestockCost = 0;
  let totalDeficitUnits = 0;

  alertsList.forEach((alertItem, idx) => {
    const deficit = Math.max(0, alertItem.minStock - alertItem.computedQty);
    const restockCost = deficit * alertItem.computedCost;
    totalDeficitUnits += deficit;
    totalAlertRestockCost += restockCost;

    const isOut = alertItem.alertType === 'OUT OF STOCK';

    xml += `\n   <Row ss:Height="20">`;
    xml += `\n    <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${idx + 1}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeftBold"><Data ss:Type="String">${escapeXml(alertItem.name || alertItem.product_name || 'Unknown')}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellCode"><Data ss:Type="String">${escapeXml(alertItem.sku || alertItem.skuInfo || 'N/A')}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(alertItem.category || 'Uncategorized')}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(alertItem.subCategory || alertItem.subcategory || '—')}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(alertItem.brand || '—')}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(alertItem.warehouse || 'Main Warehouse')}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${alertItem.computedQty}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${alertItem.minStock}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${deficit}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellCurrency"><Data ss:Type="Number">${alertItem.computedCost}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellCurrencyBold"><Data ss:Type="Number">${restockCost}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="${isOut ? 'StatusOutOfStock' : 'StatusLowStock'}"><Data ss:Type="String">${escapeXml(alertItem.alertType)}</Data></Cell>`;
    xml += `\n   </Row>`;
  });

  // Alerts Total Row
  xml += `\n   <Row ss:Height="24">`;
  xml += `\n    <Cell ss:MergeAcross="6" ss:StyleID="TotalLabel"><Data ss:Type="String">TOTAL RESTOCK DEFICIT</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">—</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">—</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalNumber"><Data ss:Type="Number">${totalDeficitUnits}</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">—</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalCurrency"><Data ss:Type="Number">${totalAlertRestockCost}</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">${alertsList.length} items</Data></Cell>`;
  xml += `\n   </Row>`;

  xml += `\n  </Table>`;
  xml += `\n </Worksheet>`;

  xml += `\n</Workbook>`;

  // Create downloadable file blob
  const blob = new Blob([xml], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const cleanShopName = shopName.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 30);
  const dateStamp = new Date().toISOString().split('T')[0];
  link.download = `${cleanShopName}_Inventory_Report_${dateStamp}.xls`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Clean UTF-8 CSV Export (Fallback / Universal spreadsheet export)
 * Also sorted hierarchically by Category -> Subcategory -> Brand -> Product Name
 */
export function exportInventoryToCSV(
  inventoryData: any[],
  shopName: string = 'TRINCO HARDWARE & ELECTRICALS'
) {
  if (!inventoryData || inventoryData.length === 0) {
    alert('No inventory products available to export.');
    return;
  }

  // Sort inventory by Category -> Subcategory -> Brand -> Product Name
  const sortedData = sortInventoryHierarchy(inventoryData);

  const headers = [
    'No',
    'Category',
    'Subcategory',
    'Brand',
    'Product Name',
    'SKU',
    'Barcode',
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

  const rows = sortedData.map((item: any, idx: number) => {
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
      item.category || 'Uncategorized',
      item.subCategory || item.subcategory || 'General',
      item.brand || 'Unbranded',
      item.name || item.product_name || '',
      item.sku || item.skuInfo || '',
      item.barcode || item.sku || '',
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

export function escapeXml(str: any): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function exportInventoryToExcel(inventoryData: any[], shopName: string = 'FUTURA HARDWARE') {
  if (!inventoryData || inventoryData.length === 0) {
    alert('No inventory products available to export.');
    return;
  }

  // 1. Group data by Category
  const categoriesMap = new Map<string, any[]>();
  categoriesMap.set('All Products', inventoryData);

  inventoryData.forEach((item) => {
    const cat = item.category || 'Uncategorized';
    if (!categoriesMap.has(cat)) {
      categoriesMap.set(cat, []);
    }
    categoriesMap.get(cat)!.push(item);
  });

  // Build Excel XML string with multiple worksheets
  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1E3A8A"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1E3A8A"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Font ss:FontName="Segoe UI" ss:Size="14" ss:Bold="1" ss:Color="#1E3A8A"/>
  </Style>
  <Style ss:ID="SubTitleStyle">
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Italic="1" ss:Color="#64748B"/>
  </Style>
  <Style ss:ID="BoldText">
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1"/>
  </Style>
  <Style ss:ID="BarcodeStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Libre Barcode 128 Text" ss:Size="30" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="BarcodeStyleFallback">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Courier New" ss:Size="9" ss:Bold="1" ss:Color="#059669"/>
  </Style>
 </Styles>`;

  // Create a worksheet for each category
  categoriesMap.forEach((items, categoryName) => {
    const safeSheetName = categoryName
      .replace(/[:\\/?*\[\]]/g, '')
      .substring(0, 31);

    // 6 columns only: Product Name, SKU, Barcode, Category, Subcategory, Brand
    xml += `\n <Worksheet ss:Name="${escapeXml(safeSheetName)}">`;
    xml += `\n  <Table ss:ExpandedColumnCount="6">`;
    xml += `\n   <Column ss:Width="220"/>`;  // Product Name
    xml += `\n   <Column ss:Width="100"/>`;  // SKU
    xml += `\n   <Column ss:Width="220"/>`;  // Barcode
    xml += `\n   <Column ss:Width="130"/>`;  // Category
    xml += `\n   <Column ss:Width="130"/>`;  // Subcategory
    xml += `\n   <Column ss:Width="120"/>`;  // Brand

    // Report Header Row
    xml += `\n   <Row ss:Height="30">`;
    xml += `\n    <Cell ss:MergeAcross="5" ss:StyleID="TitleStyle"><Data ss:Type="String">${escapeXml(shopName.toUpperCase())} - INVENTORY PRODUCT LIST (${escapeXml(categoryName.toUpperCase())})</Data></Cell>`;
    xml += `\n   </Row>`;
    xml += `\n   <Row ss:Height="20">`;
    xml += `\n    <Cell ss:MergeAcross="5" ss:StyleID="SubTitleStyle"><Data ss:Type="String">Exported: ${new Date().toLocaleString()} | Category Items: ${items.length} | Barcode column uses "Libre Barcode 128 Text" font — install from fonts.google.com/specimen/Libre+Barcode+128+Text to see visual barcodes</Data></Cell>`;
    xml += `\n   </Row>`;
    xml += `\n   <Row ss:Height="10"/>`;

    // Table Header Row — 6 columns only
    xml += `\n   <Row ss:Height="30">`;
    const headers = [
      'Product Name',
      'SKU',
      'Barcode',
      'Category',
      'Subcategory',
      'Brand',
    ];
    headers.forEach((h) => {
      xml += `\n    <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`;
    });
    xml += `\n   </Row>`;

    items.forEach((item) => {
      const barcodeVal = item.barcode || item.sku || item.skuInfo || 'N/A';

      xml += `\n   <Row ss:Height="50">`;
      xml += `\n    <Cell ss:StyleID="BoldText"><Data ss:Type="String">${escapeXml(item.name || item.product_name || '')}</Data></Cell>`;
      xml += `\n    <Cell><Data ss:Type="String">${escapeXml(item.sku || item.skuInfo || '')}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="BarcodeStyle"><Data ss:Type="String">${escapeXml(barcodeVal)}</Data></Cell>`;
      xml += `\n    <Cell><Data ss:Type="String">${escapeXml(item.category || '')}</Data></Cell>`;
      xml += `\n    <Cell><Data ss:Type="String">${escapeXml(item.subCategory || item.subcategory || '—')}</Data></Cell>`;
      xml += `\n    <Cell><Data ss:Type="String">${escapeXml(item.brand || '—')}</Data></Cell>`;
      xml += `\n   </Row>`;
    });

    // Summary Row
    xml += `\n   <Row ss:Height="28">`;
    xml += `\n    <Cell ss:StyleID="BoldText"><Data ss:Type="String">Total (${escapeXml(categoryName)})</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="BoldText"><Data ss:Type="String">${items.length} Items</Data></Cell>`;
    xml += `\n    <Cell/>`;
    xml += `\n    <Cell/>`;
    xml += `\n    <Cell/>`;
    xml += `\n    <Cell/>`;
    xml += `\n   </Row>`;

    xml += `\n  </Table>`;
    xml += `\n </Worksheet>`;
  });

  xml += `\n</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `inventory-products-excel-${new Date().toISOString().split('T')[0]}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}


export function exportInventoryToExcel(inventoryData: any[], shopName: string = 'FUTURA HARDWARE') {
  if (!inventoryData || inventoryData.length === 0) {
    alert('No inventory products available to export.');
    return;
  }

  // 1. Group data by Category
  const categoriesMap = new Map<string, any[]>();
  categoriesMap.set('All Products', inventoryData);

  inventoryData.forEach((item) => {
    const cat = item.category || 'Uncategorized';
    if (!categoriesMap.has(cat)) {
      categoriesMap.set(cat, []);
    }
    categoriesMap.get(cat)!.push(item);
  });

  // Build Excel XML string with multiple worksheets
  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1E3A8A"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1E3A8A"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TitleStyle">
   <Font ss:FontName="Segoe UI" ss:Size="14" ss:Bold="1" ss:Color="#1E3A8A"/>
  </Style>
  <Style ss:ID="SubTitleStyle">
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Italic="1" ss:Color="#64748B"/>
  </Style>
  <Style ss:ID="BoldText">
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1"/>
  </Style>
  <Style ss:ID="Currency">
   <NumberFormat ss:Format="&#34;Rs.&#34;\ #,##0.00"/>
  </Style>
  <Style ss:ID="Number">
   <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="BarcodeStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Libre Barcode 128 Text" ss:Size="30" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="BarcodeStyleFallback">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Courier New" ss:Size="9" ss:Bold="1" ss:Color="#059669"/>
  </Style>
  <Style ss:ID="InStock">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#047857"/>
   <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="LowStock">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#B45309"/>
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="OutOfStock">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#B91C1C"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
  </Style>
 </Styles>`;

  // Create a worksheet for each category
  categoriesMap.forEach((items, categoryName) => {
    const safeSheetName = categoryName
      .replace(/[:\\/?*\[\]]/g, '')
      .substring(0, 31);

    xml += `\n <Worksheet ss:Name="${escapeXml(safeSheetName)}">`;
    xml += `\n  <Table ss:ExpandedColumnCount="12">`;
    xml += `\n   <Column ss:Width="210"/>`; // Product Name
    xml += `\n   <Column ss:Width="100"/>`; // SKU
    xml += `\n   <Column ss:Width="220"/>`; // Barcode (wider for font rendering)
    xml += `\n   <Column ss:Width="120"/>`; // Category
    xml += `\n   <Column ss:Width="120"/>`; // Subcategory
    xml += `\n   <Column ss:Width="110"/>`; // Brand
    xml += `\n   <Column ss:Width="70"/>`;  // Qty
    xml += `\n   <Column ss:Width="110"/>`; // Unit Cost
    xml += `\n   <Column ss:Width="120"/>`; // Total Value
    xml += `\n   <Column ss:Width="90"/>`;  // Status
    xml += `\n   <Column ss:Width="80"/>`;  // Reorder
    xml += `\n   <Column ss:Width="120"/>`; // Warehouse

    // Report Header Row
    xml += `\n   <Row ss:Height="30">`;
    xml += `\n    <Cell ss:MergeAcross="11" ss:StyleID="TitleStyle"><Data ss:Type="String">${escapeXml(shopName.toUpperCase())} - INVENTORY PRODUCT LIST (${escapeXml(categoryName.toUpperCase())})</Data></Cell>`;
    xml += `\n   </Row>`;
    xml += `\n   <Row ss:Height="20">`;
    xml += `\n    <Cell ss:MergeAcross="11" ss:StyleID="SubTitleStyle"><Data ss:Type="String">Exported: ${new Date().toLocaleString()} | Category Items: ${items.length} | Barcode column uses "Libre Barcode 128 Text" font — install from fonts.google.com/specimen/Libre+Barcode+128+Text to see visual barcodes</Data></Cell>`;
    xml += `\n   </Row>`;
    xml += `\n   <Row ss:Height="10"/>`;

    // Table Header Row
    xml += `\n   <Row ss:Height="30">`;
    const headers = [
      'Product Name',
      'SKU',
      'Barcode',
      'Category',
      'Subcategory',
      'Brand',
      'Qty',
      'Unit Cost (Rs.)',
      'Total Value (Rs.)',
      'Status',
      'Reorder',
      'Warehouse',
    ];
    headers.forEach((h) => {
      xml += `\n    <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`;
    });
    xml += `\n   </Row>`;

    let totalCatQty = 0;
    let totalCatVal = 0;

    items.forEach((item) => {
      const qty = Number(item.qty ?? item.quantity ?? item.available_quantity ?? 0);

      // Use the raw numeric cost field first; fall back to parsing the formatted string
      let cost: number;
      if (item.cost !== undefined && item.cost !== null && !isNaN(Number(item.cost))) {
        cost = Number(item.cost);
      } else if (item.price !== undefined && item.price !== null && !isNaN(Number(item.price))) {
        cost = Number(item.price);
      } else {
        // Strip "Rs. " prefix and commas from formatted string like "Rs. 30"
        const costStr = String(item.unitCost ?? item.purchasePrice ?? 0)
          .replace(/Rs\.?\s*/g, '').replace(/,/g, '').trim();
        cost = parseFloat(costStr) || 0;
      }

      // Compute total directly from numbers; don't rely on the pre-formatted totalValue string
      const totalVal = qty * cost;

      totalCatQty += qty;
      totalCatVal += totalVal;

      const barcodeVal = item.barcode || item.sku || item.skuInfo || 'N/A';
      const statusStyle =
        item.status === 'In Stock'
          ? 'InStock'
          : item.status === 'Low Stock'
          ? 'LowStock'
          : 'OutOfStock';

      // Row height 50 = enough for barcode font at size 30
      xml += `\n   <Row ss:Height="50">`;
      xml += `\n    <Cell ss:StyleID="BoldText"><Data ss:Type="String">${escapeXml(item.name || item.product_name || '')}</Data></Cell>`;
      xml += `\n    <Cell><Data ss:Type="String">${escapeXml(item.sku || item.skuInfo || '')}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="BarcodeStyle"><Data ss:Type="String">${escapeXml(barcodeVal)}</Data></Cell>`;
      xml += `\n    <Cell><Data ss:Type="String">${escapeXml(item.category || '')}</Data></Cell>`;
      xml += `\n    <Cell><Data ss:Type="String">${escapeXml(item.subCategory || item.subcategory || '—')}</Data></Cell>`;
      xml += `\n    <Cell><Data ss:Type="String">${escapeXml(item.brand || '—')}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="Number"><Data ss:Type="Number">${qty}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${cost}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${totalVal}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${escapeXml(item.status || '')}</Data></Cell>`;
      xml += `\n    <Cell><Data ss:Type="String">${escapeXml(item.reorder || 'good')}</Data></Cell>`;
      xml += `\n    <Cell><Data ss:Type="String">${escapeXml(item.warehouse || item.warehouseName || 'Main Warehouse')}</Data></Cell>`;
      xml += `\n   </Row>`;
    });

    // Summary Row for Category
    xml += `\n   <Row ss:Height="28">`;
    xml += `\n    <Cell ss:StyleID="BoldText"><Data ss:Type="String">Total (${escapeXml(categoryName)})</Data></Cell>`;
    xml += `\n    <Cell/>`;
    xml += `\n    <Cell/>`;
    xml += `\n    <Cell/>`;
    xml += `\n    <Cell/>`;
    xml += `\n    <Cell ss:StyleID="BoldText"><Data ss:Type="String">${items.length} Items</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="Number"><Data ss:Type="Number">${totalCatQty}</Data></Cell>`;
    xml += `\n    <Cell/>`;
    xml += `\n    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${totalCatVal}</Data></Cell>`;
    xml += `\n    <Cell/>`;
    xml += `\n    <Cell/>`;
    xml += `\n    <Cell/>`;
    xml += `\n   </Row>`;

    xml += `\n  </Table>`;
    xml += `\n </Worksheet>`;
  });

  xml += `\n</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `inventory-products-excel-${new Date().toISOString().split('T')[0]}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}

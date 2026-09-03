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
    xml += `\n   <Column ss:Width="220"/>`;
    xml += `\n   <Column ss:Width="100"/>`;
    xml += `\n   <Column ss:Width="220"/>`;
    xml += `\n   <Column ss:Width="130"/>`;
    xml += `\n   <Column ss:Width="130"/>`;
    xml += `\n   <Column ss:Width="120"/>`;

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
    const headers = ['Product Name', 'SKU', 'Barcode', 'Category', 'Subcategory', 'Brand'];
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

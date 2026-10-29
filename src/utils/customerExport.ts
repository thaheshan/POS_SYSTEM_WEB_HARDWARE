/**
 * Customer Accounts & Credit Export Utility
 * Generates structured, crash-proof Microsoft Excel (.xls XML Spreadsheet)
 * and CSV reports with complete balances, credit risk status, and purchase history.
 */

export function escapeXml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function exportCustomersToExcel(
  customers: any[],
  shopName: string = 'TRINCO HARDWARE & ELECTRICALS',
  reportingPeriod?: string
) {
  if (!customers || customers.length === 0) {
    alert('No customers available to export.');
    return;
  }

  const totalCustomers = customers.length;
  const creditCustomersList = customers.filter((c) => (c.outstanding || 0) > 0);
  const creditCount = creditCustomersList.length;
  const totalOutstanding = customers.reduce((sum, c) => sum + (c.outstanding || 0), 0);
  const totalPurchases = customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);
  const totalTransactions = customers.reduce((sum, c) => sum + (c.transactions || 0), 0);

  const nowFormatted = new Date().toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const periodText = reportingPeriod || `Full Ledger Snapshot as of ${nowFormatted}`;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>${escapeXml(shopName)} - Customer Credit &amp; Accounts Ledger</Title>
  <Subject>Customer Balances, Credit Status &amp; Purchase History</Subject>
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
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1E40AF"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1E40AF"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1E40AF"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1E40AF"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E40AF" ss:Pattern="Solid"/>
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
  <Style ss:ID="CellCurrencyRed">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#B91C1C"/>
   <NumberFormat ss:Format="&#34;Rs.&#34;\ #,##0.00"/>
  </Style>

  <!-- Status Badges -->
  <Style ss:ID="StatusSettled">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9" ss:Bold="1" ss:Color="#065F46"/>
   <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="StatusOverdue">
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
  <Style ss:ID="TotalCurrencyRed">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0F172A"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#B91C1C"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="&#34;Rs.&#34;\ #,##0.00"/>
  </Style>
 </Styles>`;

  // ─────────────────────────────────────────────────────────────────────────────
  // SHEET 1: Customer Accounts & Ledger Directory
  // ─────────────────────────────────────────────────────────────────────────────
  xml += `\n <Worksheet ss:Name="Customer Directory">`;
  xml += `\n  <Table>`;
  xml += `\n   <Column ss:Width="38"/>`;   // 1. #
  xml += `\n   <Column ss:Width="180"/>`;  // 2. Customer Name
  xml += `\n   <Column ss:Width="95"/>`;   // 3. Customer ID
  xml += `\n   <Column ss:Width="110"/>`;  // 4. Phone
  xml += `\n   <Column ss:Width="160"/>`;  // 5. Email
  xml += `\n   <Column ss:Width="140"/>`;  // 6. Address
  xml += `\n   <Column ss:Width="110"/>`;  // 7. Type
  xml += `\n   <Column ss:Width="130"/>`;  // 8. Total Purchases
  xml += `\n   <Column ss:Width="75"/>`;   // 9. Orders
  xml += `\n   <Column ss:Width="130"/>`;  // 10. Outstanding Balance
  xml += `\n   <Column ss:Width="95"/>`;   // 11. Status
  xml += `\n   <Column ss:Width="105"/>`;  // 12. Registered Date

  // Title Row
  xml += `\n   <Row ss:Height="26">`;
  xml += `\n    <Cell ss:MergeAcross="11" ss:StyleID="CompanyTitle"><Data ss:Type="String">${escapeXml(shopName.toUpperCase())}</Data></Cell>`;
  xml += `\n   </Row>`;

  // Report Name Row
  xml += `\n   <Row ss:Height="20">`;
  xml += `\n    <Cell ss:MergeAcross="11" ss:StyleID="ReportTitle"><Data ss:Type="String">CUSTOMER CREDIT &amp; ACCOUNTS LEDGER REPORT</Data></Cell>`;
  xml += `\n   </Row>`;

  // Subtitle / Period Row
  xml += `\n   <Row ss:Height="18">`;
  xml += `\n    <Cell ss:MergeAcross="11" ss:StyleID="Subtitle"><Data ss:Type="String">Period: ${escapeXml(periodText)} | Export Generated: ${escapeXml(nowFormatted)}</Data></Cell>`;
  xml += `\n   </Row>`;
  xml += `\n   <Row ss:Height="8"/>`;

  // KPI Strip
  xml += `\n   <Row ss:Height="18">`;
  xml += `\n    <Cell ss:MergeAcross="1" ss:StyleID="KpiLabel"><Data ss:Type="String">TOTAL CUSTOMERS</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiLabel"><Data ss:Type="String">OUTSTANDING RECEIVABLES</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiLabel"><Data ss:Type="String">CREDIT ACCOUNTS</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiLabel"><Data ss:Type="String">TOTAL PURCHASES</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiLabel"><Data ss:Type="String">AVG LIFETIME VALUE</Data></Cell>`;
  xml += `\n   </Row>`;

  const avgLtv = totalCustomers > 0 ? totalPurchases / totalCustomers : 0;

  xml += `\n   <Row ss:Height="22">`;
  xml += `\n    <Cell ss:MergeAcross="1" ss:StyleID="KpiValue"><Data ss:Type="Number">${totalCustomers}</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiValue"><Data ss:Type="String">Rs. ${totalOutstanding.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiValue"><Data ss:Type="String">${creditCount} (${totalCustomers > 0 ? Math.round((creditCount / totalCustomers) * 100) : 0}%)</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiValue"><Data ss:Type="String">Rs. ${totalPurchases.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Data></Cell>`;
  xml += `\n    <Cell ss:MergeAcross="2" ss:StyleID="KpiValue"><Data ss:Type="String">Rs. ${Math.round(avgLtv).toLocaleString('en-LK')}</Data></Cell>`;
  xml += `\n   </Row>`;
  xml += `\n   <Row ss:Height="12"/>`;

  // Headers
  const custHeaders = [
    '#',
    'Customer Name',
    'Customer Code',
    'Phone',
    'Email',
    'Address',
    'Account Type',
    'Total Purchases (Rs.)',
    'Orders',
    'Outstanding Balance (Rs.)',
    'Credit Status',
    'Registered / Last Active',
  ];

  xml += `\n   <Row ss:Height="28">`;
  custHeaders.forEach((h) => {
    xml += `\n    <Cell ss:StyleID="MainHeader"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`;
  });
  xml += `\n   </Row>`;

  // Sort customers: Credit accounts first (highest balance descending), then settled customers
  const sortedCustomers = [...customers].sort((a, b) => {
    if ((b.outstanding || 0) !== (a.outstanding || 0)) {
      return (b.outstanding || 0) - (a.outstanding || 0);
    }
    return (b.totalPurchases || 0) - (a.totalPurchases || 0);
  });

  sortedCustomers.forEach((c, idx) => {
    const out = Number(c.outstanding || 0);
    const purchases = Number(c.totalPurchases || 0);
    const txCount = Number(c.transactions || 0);
    const isOverdue = out > 0;
    const statusText = isOverdue ? 'Overdue' : 'Settled';
    const statusStyle = isOverdue ? 'StatusOverdue' : 'StatusSettled';
    const code = c.id ? c.id.slice(0, 8).toUpperCase() : 'N/A';

    xml += `\n   <Row ss:Height="21">`;
    xml += `\n    <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${idx + 1}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeftBold"><Data ss:Type="String">${escapeXml(c.name || 'Unknown')}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellCode"><Data ss:Type="String">${escapeXml(code)}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(c.phone || 'N/A')}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(c.email || 'N/A')}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellLeft"><Data ss:Type="String">${escapeXml(c.address || 'N/A')}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(c.customerType || 'Individual')}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellCurrency"><Data ss:Type="Number">${purchases}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${txCount}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="${isOverdue ? 'CellCurrencyRed' : 'CellCurrencyBold'}"><Data ss:Type="Number">${out}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${escapeXml(statusText)}</Data></Cell>`;
    xml += `\n    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(c.lastActive || '—')}</Data></Cell>`;
    xml += `\n   </Row>`;
  });

  // Grand Total Summary Row (Cols 1 to 7 merged, then purchases, txns, outstanding, status, date)
  xml += `\n   <Row ss:Height="26">`;
  xml += `\n    <Cell ss:MergeAcross="6" ss:StyleID="TotalLabel"><Data ss:Type="String">GRAND TOTAL (${totalCustomers} CUSTOMERS)</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalCurrency"><Data ss:Type="Number">${totalPurchases}</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalNumber"><Data ss:Type="Number">${totalTransactions}</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalCurrencyRed"><Data ss:Type="Number">${totalOutstanding}</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">${creditCount} Overdue</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">—</Data></Cell>`;
  xml += `\n   </Row>`;

  xml += `\n  </Table>`;
  xml += `\n </Worksheet>`;

  // ─────────────────────────────────────────────────────────────────────────────
  // SHEET 2: Credit Risk & Overdue Accounts Only
  // ─────────────────────────────────────────────────────────────────────────────
  xml += `\n <Worksheet ss:Name="Credit Risk Accounts">`;
  xml += `\n  <Table>`;
  xml += `\n   <Column ss:Width="38"/>`;   // 1. #
  xml += `\n   <Column ss:Width="200"/>`;  // 2. Customer Name
  xml += `\n   <Column ss:Width="95"/>`;   // 3. ID
  xml += `\n   <Column ss:Width="110"/>`;  // 4. Phone
  xml += `\n   <Column ss:Width="150"/>`;  // 5. Total Purchases
  xml += `\n   <Column ss:Width="80"/>`;   // 6. Orders
  xml += `\n   <Column ss:Width="150"/>`;  // 7. Outstanding Due
  xml += `\n   <Column ss:Width="105"/>`;  // 8. Account Age

  xml += `\n   <Row ss:Height="24">`;
  xml += `\n    <Cell ss:MergeAcross="7" ss:StyleID="CompanyTitle"><Data ss:Type="String">OVERDUE CREDIT ACCOUNTS &amp; SETTLEMENT QUEUE</Data></Cell>`;
  xml += `\n   </Row>`;
  xml += `\n   <Row ss:Height="18">`;
  xml += `\n    <Cell ss:MergeAcross="7" ss:StyleID="Subtitle"><Data ss:Type="String">High-priority accounts with pending credit balances requiring collection or SMS reminder.</Data></Cell>`;
  xml += `\n   </Row>`;
  xml += `\n   <Row ss:Height="10"/>`;

  const riskHeaders = [
    '#',
    'Customer Name',
    'Customer Code',
    'Phone',
    'Total Purchases (Rs.)',
    'Orders',
    'Outstanding Balance Due (Rs.)',
    'Account Registered',
  ];

  xml += `\n   <Row ss:Height="26">`;
  riskHeaders.forEach((h) => {
    xml += `\n    <Cell ss:StyleID="AlertHeader"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`;
  });
  xml += `\n   </Row>`;

  creditCustomersList
    .sort((a, b) => (b.outstanding || 0) - (a.outstanding || 0))
    .forEach((c, idx) => {
      const code = c.id ? c.id.slice(0, 8).toUpperCase() : 'N/A';
      xml += `\n   <Row ss:Height="21">`;
      xml += `\n    <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${idx + 1}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="CellLeftBold"><Data ss:Type="String">${escapeXml(c.name || 'Unknown')}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="CellCode"><Data ss:Type="String">${escapeXml(code)}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(c.phone || 'N/A')}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="CellCurrency"><Data ss:Type="Number">${Number(c.totalPurchases || 0)}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="CellNumber"><Data ss:Type="Number">${Number(c.transactions || 0)}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="CellCurrencyRed"><Data ss:Type="Number">${Number(c.outstanding || 0)}</Data></Cell>`;
      xml += `\n    <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(c.lastActive || '—')}</Data></Cell>`;
      xml += `\n   </Row>`;
    });

  // Credit Total Row
  xml += `\n   <Row ss:Height="24">`;
  xml += `\n    <Cell ss:MergeAcross="3" ss:StyleID="TotalLabel"><Data ss:Type="String">TOTAL CREDIT RECEIVABLES</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalCurrency"><Data ss:Type="Number">${creditCustomersList.reduce((s, c) => s + (c.totalPurchases || 0), 0)}</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalNumber"><Data ss:Type="Number">${creditCustomersList.reduce((s, c) => s + (c.transactions || 0), 0)}</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalCurrencyRed"><Data ss:Type="Number">${totalOutstanding}</Data></Cell>`;
  xml += `\n    <Cell ss:StyleID="TotalLabel"><Data ss:Type="String">${creditCount} accounts</Data></Cell>`;
  xml += `\n   </Row>`;

  xml += `\n  </Table>`;
  xml += `\n </Worksheet>`;

  xml += `\n</Workbook>`;

  const blob = new Blob([xml], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const cleanShopName = shopName.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 30);
  const dateStamp = new Date().toISOString().split('T')[0];
  link.download = `${cleanShopName}_Customer_Credit_Report_${dateStamp}.xls`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportCustomersToCSV(
  customers: any[],
  shopName: string = 'TRINCO HARDWARE & ELECTRICALS'
) {
  if (!customers || customers.length === 0) {
    alert('No customers available to export.');
    return;
  }

  const headers = [
    'No',
    'Customer Name',
    'Customer Code',
    'Phone',
    'Email',
    'Address',
    'Account Type',
    'Total Purchases (Rs.)',
    'Transactions',
    'Outstanding Balance (Rs.)',
    'Status',
    'Registered Date',
  ];

  const rows = customers.map((c: any, idx: number) => {
    const out = Number(c.outstanding || 0);
    const code = c.id ? c.id.slice(0, 8).toUpperCase() : 'N/A';
    return [
      idx + 1,
      c.name || '',
      code,
      c.phone || '',
      c.email || '',
      c.address || '',
      c.customerType || 'Individual',
      Number(c.totalPurchases || 0).toFixed(2),
      Number(c.transactions || 0),
      out.toFixed(2),
      out > 0 ? 'Overdue' : 'Settled',
      c.lastActive || '',
    ];
  });

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
  link.download = `${cleanShopName}_Customer_Export_${dateStamp}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

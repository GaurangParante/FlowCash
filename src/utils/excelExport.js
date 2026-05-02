const EXCEL_XML_HEADER = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#D9EAF7" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Currency">
      <NumberFormat ss:Format="0.00"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Expenses">
    <Table>`;

const EXCEL_XML_FOOTER = `    </Table>
  </Worksheet>
</Workbook>`;

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const cell = (value, type = "String", styleId = null) => {
  const style = styleId ? ` ss:StyleID="${styleId}"` : "";
  return `<Cell${style}><Data ss:Type="${type}">${escapeXml(
    value
  )}</Data></Cell>`;
};

const row = (cells) => `      <Row>${cells.join("")}</Row>`;

export const buildExpensesExcelXml = (expenses) => {
  const header = row(
    ["Amount", "Date", "Note", "Category"].map((label) =>
      cell(label, "String", "Header")
    )
  );

  const sortedExpenses = [...expenses].sort(
    (first, second) => new Date(first.date) - new Date(second.date)
  );

  const body = sortedExpenses.map((expense) =>
    row([
      cell(Number(expense.amount || 0).toFixed(2), "Number", "Currency"),
      cell(expense.date ? new Date(expense.date).toLocaleString() : ""),
      cell(expense.note || ""),
      cell(expense.category_name || expense.category || "Others"),
    ])
  );

  return [EXCEL_XML_HEADER, header, ...body, EXCEL_XML_FOOTER].join("\n");
};

export const buildExcelFileName = () => {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `flowcash-expenses-${stamp}.xls`;
};

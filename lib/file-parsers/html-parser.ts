export interface ParsedMenuRow {
  Category?: string;
  SubCategory?: string;
  ItemName?: string;
  Description?: string;
  Price?: string;
  ImageURL?: string;
  Tags?: string;
  Allergens?: string;
}

export function parseHTML(content: string): ParsedMenuRow[] {
  // Simple HTML table parser
  const items: ParsedMenuRow[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");
  const tables = doc.querySelectorAll("table");
  
  tables.forEach((table) => {
    const rows = table.querySelectorAll("tr");
    const headers: string[] = [];
    
    rows.forEach((row, index) => {
      const cells = row.querySelectorAll("td, th");
      const rowData: any = {};
      
      cells.forEach((cell, cellIndex) => {
        if (index === 0) {
          headers.push(cell.textContent?.trim() || "");
        } else {
          const header = headers[cellIndex];
          if (header) {
            rowData[header] = cell.textContent?.trim();
          }
        }
      });
      
      if (index > 0 && Object.keys(rowData).length > 0) {
        items.push(rowData as ParsedMenuRow);
      }
    });
  });
  
  return items;
}


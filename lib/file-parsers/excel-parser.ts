import * as XLSX from "xlsx";

export interface ParsedMenuRow {
  Category?: string;
  SubCategory?: string;
  ItemName?: string;
  Description?: string;
  Price?: string;
  ImageURL?: string;
  Tags?: string;
  Allergens?: string;
  AvailabilityStatus?: string;
  PreparationTime?: string;
}

export function parseExcel(file: File): Promise<ParsedMenuRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as ParsedMenuRow[];
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read Excel file"));
    };

    reader.readAsBinaryString(file);
  });
}


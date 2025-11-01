import Papa from "papaparse";

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

export function parseCSV(file: File): Promise<ParsedMenuRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as ParsedMenuRow[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}


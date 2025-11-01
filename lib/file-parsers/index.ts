import { parseCSV, ParsedMenuRow } from "./csv-parser";
import { parseJSON, MenuJSON } from "./json-parser";
import { parseExcel } from "./excel-parser";
import { parseMarkdown } from "./markdown-parser";
import { parseHTML } from "./html-parser";

export interface ImportResult {
  categories: Array<{
    name: string;
    icon?: string;
    subCategories: Array<{
      name: string;
      description?: string;
      items: Array<{
        name: string;
        description?: string;
        price: number;
        currency?: string;
        imageUrl?: string;
        tags?: string[];
        allergens?: string[];
        availabilityStatus?: string;
        preparationTime?: number;
      }>;
    }>;
  }>;
}

export async function parseMenuFile(
  file: File
): Promise<ImportResult | null> {
  const fileName = file.name.toLowerCase();
  const fileType = fileName.split(".").pop()?.toLowerCase();

  try {
    if (fileType === "csv") {
      const rows = await parseCSV(file);
      return convertRowsToMenu(rows);
    } else if (fileType === "json") {
      const content = await file.text();
      const jsonData = parseJSON(content);
      return convertJSONToMenu(jsonData);
    } else if (fileType === "xlsx" || fileType === "xls") {
      const rows = await parseExcel(file);
      return convertRowsToMenu(rows);
    } else if (fileType === "md") {
      const content = await file.text();
      const items = parseMarkdown(content);
      return convertItemsToMenu(items);
    } else if (fileType === "html" || fileType === "htm") {
      const content = await file.text();
      const rows = parseHTML(content);
      return convertRowsToMenu(rows);
    } else if (fileType === "txt") {
      // Treat as simple text format
      const content = await file.text();
      return parseTextFormat(content);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error: any) {
    throw new Error(`Failed to parse file: ${error.message}`);
  }
}

function convertRowsToMenu(rows: ParsedMenuRow[]): ImportResult {
  const categoriesMap = new Map<string, Map<string, any[]>>();

  rows.forEach((row) => {
    if (!row.Category || !row.ItemName || !row.Price) return;

    const categoryName = row.Category.trim();
    const subCategoryName = (row.SubCategory || "Default").trim();
    const price = parseFloat(row.Price?.replace(/[^0-9.]/g, "") || "0");

    if (!categoriesMap.has(categoryName)) {
      categoriesMap.set(categoryName, new Map());
    }

    const subCategoriesMap = categoriesMap.get(categoryName)!;
    if (!subCategoriesMap.has(subCategoryName)) {
      subCategoriesMap.set(subCategoryName, []);
    }

    const items = subCategoriesMap.get(subCategoryName)!;
    items.push({
      name: row.ItemName.trim(),
      description: row.Description?.trim() || "",
      price,
      currency: "USD",
      imageUrl: row.ImageURL?.trim(),
      tags: row.Tags?.split(/[,|]/).map((t) => t.trim()).filter(Boolean) || [],
      allergens: row.Allergens?.split(/[,|]/).map((a) => a.trim()).filter(Boolean) || [],
      availabilityStatus: (row.AvailabilityStatus?.trim() || "AVAILABLE").toUpperCase(),
      preparationTime: row.PreparationTime ? parseInt(row.PreparationTime) : null,
    });
  });

  const categories = Array.from(categoriesMap.entries()).map(([catName, subCatsMap]) => ({
    name: catName,
    subCategories: Array.from(subCatsMap.entries()).map(([subCatName, items]) => ({
      name: subCatName,
      items,
    })),
  }));

  return { categories };
}

function convertJSONToMenu(jsonData: MenuJSON): ImportResult {
  return {
    categories: jsonData.categories.map((cat) => ({
      name: cat.name,
      icon: cat.icon,
      subCategories: cat.subCategories.map((subCat) => ({
        name: subCat.name,
        description: subCat.description,
        items: subCat.items.map((item) => ({
          name: item.name,
          description: item.description || "",
          price: item.price,
          currency: item.currency || "USD",
          imageUrl: item.imageUrl,
          tags: item.tags || [],
          allergens: item.allergens || [],
          availabilityStatus: (item.availabilityStatus || "AVAILABLE").toUpperCase(),
          preparationTime: item.preparationTime || null,
        })),
      })),
    })),
  };
}

function convertItemsToMenu(items: any[]): ImportResult {
  // Similar to convertRowsToMenu but with different structure
  return convertRowsToMenu(items as ParsedMenuRow[]);
}

function parseTextFormat(content: string): ImportResult {
  const categoriesMap = new Map<string, Map<string, any[]>>();
  let currentCategory = "";
  let currentSubCategory = "";
  let currentItem: any = {};

  const lines = content.split("\n");
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith("CATEGORY:")) {
      currentCategory = trimmed.replace("CATEGORY:", "").trim();
      if (!categoriesMap.has(currentCategory)) {
        categoriesMap.set(currentCategory, new Map());
      }
    } else if (trimmed.startsWith("SUBCATEGORY:")) {
      currentSubCategory = trimmed.replace("SUBCATEGORY:", "").trim();
      const subCatsMap = categoriesMap.get(currentCategory);
      if (subCatsMap && !subCatsMap.has(currentSubCategory)) {
        subCatsMap.set(currentSubCategory, []);
      }
    } else if (trimmed.startsWith("ITEM:")) {
      if (currentItem.name) {
        // Save previous item
        const subCatsMap = categoriesMap.get(currentCategory);
        subCatsMap?.get(currentSubCategory)?.push(currentItem);
      }
      currentItem = { name: trimmed.replace("ITEM:", "").trim() };
    } else if (trimmed.startsWith("PRICE:")) {
      const priceMatch = trimmed.match(/PRICE:\s*([\d.]+)/);
      if (priceMatch) currentItem.price = parseFloat(priceMatch[1]);
    } else if (trimmed.startsWith("DESCRIPTION:")) {
      currentItem.description = trimmed.replace("DESCRIPTION:", "").trim();
    } else if (trimmed.startsWith("TAGS:")) {
      currentItem.tags = trimmed
        .replace("TAGS:", "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (trimmed.startsWith("ALLERGENS:")) {
      currentItem.allergens = trimmed
        .replace("ALLERGENS:", "")
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
    }
  });

  // Save last item
  if (currentItem.name) {
    const subCatsMap = categoriesMap.get(currentCategory);
    subCatsMap?.get(currentSubCategory)?.push(currentItem);
  }

  const categories = Array.from(categoriesMap.entries()).map(([catName, subCatsMap]) => ({
    name: catName,
    subCategories: Array.from(subCatsMap.entries()).map(([subCatName, items]) => ({
      name: subCatName,
      items: items.map((item) => ({
        ...item,
        price: item.price || 0,
        currency: "USD",
        availabilityStatus: "AVAILABLE",
      })),
    })),
  }));

  return { categories };
}


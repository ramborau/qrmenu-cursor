import { marked } from "marked";

export interface ParsedMenuItem {
  category?: string;
  subCategory?: string;
  name?: string;
  description?: string;
  price?: string;
  imageUrl?: string;
  tags?: string[];
  allergens?: string[];
}

export function parseMarkdown(content: string): ParsedMenuItem[] {
  // Simple markdown parser for menu structure
  // Looks for ## Category, ### SubCategory, #### Item patterns
  const items: ParsedMenuItem[] = [];
  const lines = content.split("\n");
  
  let currentCategory = "";
  let currentSubCategory = "";
  let currentItem: Partial<ParsedMenuItem> = {};
  
  for (const line of lines) {
    if (line.startsWith("## ")) {
      currentCategory = line.replace("## ", "").trim();
    } else if (line.startsWith("### ")) {
      currentSubCategory = line.replace("### ", "").trim();
    } else if (line.startsWith("#### ")) {
      if (currentItem.name) {
        items.push({ ...currentItem } as ParsedMenuItem);
      }
      currentItem = {
        category: currentCategory,
        subCategory: currentSubCategory,
        name: line.replace("#### ", "").trim(),
      };
    } else if (line.includes("**Price:**")) {
      const priceMatch = line.match(/\$?([\d.]+)/);
      if (priceMatch) currentItem.price = priceMatch[1];
    } else if (line.includes("**Tags:**")) {
      const tagsMatch = line.match(/Tags:\s*(.+)/);
      if (tagsMatch) {
        currentItem.tags = tagsMatch[1].split(",").map((t) => t.trim());
      }
    } else if (line.includes("**Allergens:**")) {
      const allergensMatch = line.match(/Allergens:\s*(.+)/);
      if (allergensMatch) {
        currentItem.allergens = allergensMatch[1].split(",").map((a) => a.trim());
      }
    } else if (line.trim() && !line.startsWith("#") && !line.startsWith("**")) {
      if (!currentItem.description) {
        currentItem.description = line.trim();
      }
    }
  }
  
  if (currentItem.name) {
    items.push({ ...currentItem } as ParsedMenuItem);
  }
  
  return items;
}


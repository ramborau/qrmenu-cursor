// GEMINI API integration for nutritional values and menu processing

const GEMINI_API_KEY = "AIzaSyBZKaIkDD5E-2rxluU7xVUb3IQCalVz-Yw";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export interface NutritionalValues {
  calories?: number;
  protein?: number; // grams
  carbohydrates?: number; // grams
  fat?: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // mg
  cholesterol?: number; // mg
  saturatedFat?: number; // grams
  transFat?: number; // grams
  vitamins?: Record<string, number>; // e.g., { "Vitamin A": 500, "Vitamin C": 60 }
  minerals?: Record<string, number>; // e.g., { "Calcium": 100, "Iron": 2.5 }
}

export interface MenuItemData {
  name: string;
  description?: string;
}

/**
 * Calculate nutritional values for a menu item using GEMINI AI
 */
export async function calculateNutritionalValues(
  item: MenuItemData
): Promise<NutritionalValues | null> {
  try {
    const prompt = `Analyze the following menu item and provide estimated nutritional values in JSON format.
Menu Item: ${item.name}
Description: ${item.description || "No description provided"}

Please provide nutritional values in this exact JSON format:
{
  "calories": number,
  "protein": number (in grams),
  "carbohydrates": number (in grams),
  "fat": number (in grams),
  "fiber": number (in grams, optional),
  "sugar": number (in grams, optional),
  "sodium": number (in mg, optional),
  "cholesterol": number (in mg, optional),
  "saturatedFat": number (in grams, optional),
  "transFat": number (in grams, optional),
  "vitamins": { "Vitamin A": number, "Vitamin C": number, etc. } (optional),
  "minerals": { "Calcium": number, "Iron": number, etc. } (optional)
}

Return ONLY valid JSON, no additional text. If a value cannot be estimated, use null for that field.`;

    const response = await fetch(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("GEMINI API error:", response.statusText);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("No response from GEMINI API");
      return null;
    }

    // Extract JSON from the response (may have markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "").replace(/```$/g, "");
    }

    const nutritionalValues = JSON.parse(jsonText) as NutritionalValues;
    return nutritionalValues;
  } catch (error) {
    console.error("Error calculating nutritional values:", error);
    return null;
  }
}

/**
 * Process and parse menu data from various sources using GEMINI
 */
export async function processMenuWithGemini(
  rawMenuData: string,
  dataType: "csv" | "json" | "txt" | "url" | "pdf" | "docx" | "doc" | "xls" | "copy-paste"
): Promise<{
  categories: Array<{
    name: string;
    description?: string;
    icon?: string;
    subCategories: Array<{
      name: string;
      description?: string;
      icon?: string;
      items: Array<{
        name: string;
        description?: string;
        price: number;
        currency: string;
        tags?: string[];
        allergens?: string[];
      }>;
    }>;
  }>;
} | null> {
  try {
    const prompt = `Parse the following menu data (format: ${dataType}) and convert it to a structured JSON format.

Raw Menu Data:
${rawMenuData.substring(0, 5000)}${rawMenuData.length > 5000 ? "..." : ""}

Please extract menu items and organize them into categories and sub-categories. Return ONLY valid JSON in this exact format:
{
  "categories": [
    {
      "name": "Category Name",
      "description": "Optional description",
      "icon": "Optional icon name (e.g., FaUtensils)",
      "subCategories": [
        {
          "name": "Sub-Category Name",
          "description": "Optional description",
          "icon": "Optional icon name",
          "items": [
            {
              "name": "Item Name",
              "description": "Optional description",
              "price": number,
              "currency": "USD" or "BHD" or "EUR" or "GBP",
              "tags": ["Vegetarian", "Gluten-Free", etc.] (optional),
              "allergens": ["Dairy", "Nuts", etc.] (optional)
            }
          ]
        }
      ]
    }
  ]
}

Return ONLY valid JSON, no additional text or markdown.`;

    const response = await fetch(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("GEMINI API error:", response.statusText);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("No response from GEMINI API");
      return null;
    }

    // Extract JSON from the response
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "").replace(/```$/g, "");
    }

    const parsedMenu = JSON.parse(jsonText);
    return parsedMenu;
  } catch (error) {
    console.error("Error processing menu with GEMINI:", error);
    return null;
  }
}


export interface MenuJSON {
  restaurant: string;
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

export function parseJSON(content: string): MenuJSON {
  return JSON.parse(content);
}


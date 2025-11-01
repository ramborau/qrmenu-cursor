const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "";

export interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    thumb: string;
  };
  alt_description?: string;
  user: {
    name: string;
    username: string;
  };
}

export async function searchUnsplashImages(query: string, page = 1, perPage = 10): Promise<UnsplashImage[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&client_id=${UNSPLASH_ACCESS_KEY}`
    );

    if (!response.ok) {
      throw new Error("Unsplash API error");
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Failed to search Unsplash:", error);
    return [];
  }
}

export async function getUnsplashSuggestions(menuItemName: string): Promise<string | null> {
  const images = await searchUnsplashImages(menuItemName, 1, 1);
  return images.length > 0 ? images[0].urls.regular : null;
}


// Pexels API Service for fetching eco-friendly product images
// Get your free API key at: https://www.pexels.com/api/

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || "";

// Search for images on Pexels
export const searchPexelsImage = async (query) => {
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch from Pexels");
    }

    const data = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.medium; // Returns medium size image URL
    }
    
    return null;
  } catch (error) {
    console.error("Pexels API error:", error);
    return null;
  }
};

// Fallback images - Direct Pexels URLs (no API key needed)
export const FALLBACK_IMAGES = {
  "Bamboo Toothbrush": "https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg",
  "Shampoo Bar": "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg",
  "Steel Water Bottle": "https://images.pexels.com/photos/3625517/pexels-photo-3625517.jpeg",
  "Cloth Grocery Bag": "https://images.pexels.com/photos/5632651/pexels-photo-5632651.jpeg",
  "Steel Cutlery Set": "https://images.pexels.com/photos/7974370/pexels-photo-7974370.jpeg",
  "Face Wash Bar": "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg",
  "Reusable Coffee Cup": "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg",
  "Beeswax Food Wrap": "https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg",
  "Bamboo Cutting Board": "https://images.pexels.com/photos/3878472/pexels-photo-3878472.jpeg",
  "Glass Food Container": "https://images.pexels.com/photos/3962632/pexels-photo-3962632.jpeg",
  "Eco-Friendly Soap": "https://images.pexels.com/photos/3808747/pexels-photo-3808747.jpeg",
  "Natural Deodorant": "https://images.pexels.com/photos/3945672/pexels-photo-3945672.jpeg",
  "Bamboo Toothpicks": "https://images.pexels.com/photos/3907857/pexels-photo-3907857.jpeg",
  "Reusable Straws": "https://images.pexels.com/photos/3970330/pexels-photo-3970330.jpeg",
  "Eco Trash Bags": "https://images.pexels.com/photos/3962673/pexels-photo-3962673.jpeg",
  "Sustainable Journal": "https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg",
  "Eco Phone Case": "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg",
  "Bamboo Utensils Set": "https://images.pexels.com/photos/5632651/pexels-photo-5632651.jpeg",
  "Natural Lip Balm": "https://images.pexels.com/photos/3945672/pexels-photo-3945672.jpeg",
  "Eco Yoga Mat": "https://images.pexels.com/photos/317157/pexels-photo-317157.jpeg",
  "Sustainable Backpack": "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg",
};

# Pexels API Setup Guide

## Getting Your Free Pexels API Key

1. **Visit Pexels API**: https://www.pexels.com/api/
2. **Sign Up** or **Log In** (free account)
3. **Create API Key** - Click on your profile → API
4. **Copy your API key**
5. **Paste it in `.env.local`**:
   ```
   REACT_APP_PEXELS_API_KEY=your_actual_api_key_here
   ```

## Current Setup

✅ **Images are already set up!** 

The app now uses **real Pexels images** (directly linked, no API key needed for display).

These are the fallback images that load instantly and look great:
- Bamboo Toothbrush
- Shampoo Bar  
- Steel Water Bottle
- Cloth Grocery Bag
- Steel Cutlery Set
- And more...

## Optional: Use API for Dynamic Searches

If you want to dynamically fetch images from Pexels for new products:

```javascript
import { searchPexelsImage } from '../services/imageService';

// Fetch image
const imageUrl = await searchPexelsImage("bamboo toothbrush");
```

## File Structure

- `src/services/imageService.js` - Pexels API service + fallback images
- `src/data.js` - Updated with Pexels image URLs
- `.env.local` - Pexels API key placeholder

## Testing

Just reload the browser to see the new Pexels images! 🎨

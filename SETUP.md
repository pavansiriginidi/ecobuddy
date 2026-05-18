# 🚀 Quick Start Guide - Eco Buddy

Get Eco Buddy running locally in 5 minutes.
# 🚀 Quick Start Guide - Eco Buddy

Get Eco Buddy running locally in 5 minutes.

## Step 1: Get Your API Keys

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or use existing one
3. Enable Google+ API
4. Create OAuth 2.0 Client ID (type: Web application)
5. Add authorized redirect URIs:
   - `http://localhost:5174`
   - `http://localhost:5173`
   - Your production domain
6. Copy the **Client ID** (long string starting with numbers)

### Groq AI
1. Go to [Groq Console](https://console.groq.com)
2. Sign up for a free account
3. Create an API key in the dashboard
4. Copy your **API Key**

## Step 2: Setup Environment Files

### Frontend Configuration
```bash
# Create .env.local in project root
cd ecobuddy-fullstack
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Backend API proxy
VITE_API_BASE_URL=http://localhost:3001/api

# Your Google OAuth Client ID from Step 1
# Get your own: https://console.cloud.google.com/
VITE_GOOGLE_CLIENT_ID=your_google_client_id_from_step_1
```

### Backend Configuration
```bash
# Create .env in api folder
cd api
cp .env.example .env
```

Edit `api/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_groq_client_id_from_step_1
MONGO_URI=mongodb://localhost:27017/ecobuddy
PORT=3001
NODE_ENV=development
```

## Step 3: Install Dependencies

```bash
# From project root
npm install
cd api && npm install && cd ..
```

## Step 4: Start MongoDB

### Option A: Local MongoDB
```bash
# Windows
# Download from: https://www.mongodb.com/try/download/community
# Run MongoDB Service
mongod
```

### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account and cluster
3. Get connection string
4. Update `api/.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecobuddy
   ```

## Step 5: Run the App

### Terminal 1 - Start Backend API
```bash
cd api
npm start

# You should see:
# ✅ MongoDB Connected
# ✅ EcoBuddy server running on http://localhost:3001
```

### Terminal 2 - Start Frontend
```bash
# From project root
npm run dev

# You should see:
# ➜ Local: http://localhost:5174/
```

## Step 6: Open Your Browser

1. Visit **http://localhost:5173**
2. Click "Login with Google"
3. Use your Google account to login
4. Browse products and add to cart
5. Watch the 🤖 chatbot suggest eco-friendly alternatives!

---

## 🎯 Test the Features

### Test Google Login
- ✅ Click "Login" button
- ✅ Should open Google login
2. **Enter your name** on the login screen
- ✅ Your profile should appear in top right

### Test AI Recommendations
- ✅ Go to shop
- ✅ Click "+ Add" on any product
- ✅ Chatbot should open (bottom right)
- ✅ Should show loading message
- ✅ AI suggestion should appear in 2-3 seconds
- ✅ Enter a name and click "Continue"
- ✅ Should redirect to shop after submit
- ✅ Your profile should appear in top right
- ✅ Click cart button (bottom left)
- ✅ See all items with quantities
- ✅ Click "Checkout" button

### Test Checkout
- ✅ Choose UPI or Card tab
- ✅ For UPI: Enter format like `yourname@bank`
- ✅ For Card: Enter test card number `4111 1111 1111 1111`
- ✅ Click "Pay" button
- ✅ Should show success after 2 seconds
- ✅ Order should be saved to MongoDB

### Test Recent Orders
- ✅ Complete an order (see checkout test above)
- ✅ Click your profile picture
- ✅ Click "Recent Orders" dropdown
- ✅ Should show your past orders with date and total

---

## 🐛 Troubleshooting

### "Cannot GET /api/..."
**Problem:** Frontend can't reach backend
**Solution:** 
- Make sure backend is running on port 3001
- Check that `VITE_API_BASE_URL=http://localhost:3001/api` in .env.local
- Restart frontend dev server

### "Google Login Not Working"
**Problem:** "Invalid Client ID" error
**Solution:**
- Verify `VITE_GOOGLE_CLIENT_ID` in .env.local
- Make sure it's the correct Client ID (not Secret)
- Add `http://localhost:5173` to authorized origins in Google Cloud Console
- Clear browser cookies and try again

### "MongoDB Connection Failed"
**Problem:** "MongoNetworkError" or "ECONNREFUSED"
**Solution:**
- If using local: Make sure `mongod` is running
- If using Atlas: Check connection string is correct in api/.env
- Test connection: `mongosh "your_connection_string"`

### "Groq API Error"
**Problem:** "Invalid API key" or "Rate limited"
**Solution:**
- Verify `GROQ_API_KEY` in api/.env is correct
- Check your Groq account has API key enabled
- Wait 60 seconds if rate limited

### "Port 3001 Already in Use"
**Problem:** "EADDRINUSE" error
**Solution:**
```bash
# Find and kill process on port 3001
# Windows
netstat -ano | findstr :3001
taskkill /PID [PID_NUMBER] /F

# Mac/Linux
lsof -i :3001
kill -9 [PID]
```

### "Module not found" errors
**Problem:** Dependencies not installed
**Solution:**
```bash
# Clear and reinstall
rm -rf node_modules api/node_modules
npm install
cd api && npm install
```

---

## 📚 Next Steps

After getting it running:

1. **Explore the Code**
   - Check `src/components/ShopPage.jsx` for main UI
   - Check `api/server.js` for backend logic
   - Check `src/style.css` for styling

2. **Customize Products**
   - Edit `src/data.js` to add your products
   - Change colors in `src/style.css` root variables
   - Update categories and images

3. **Deploy to Production**
   - Read [DEPLOYMENT.md](./DEPLOYMENT.md) for cloud setup
   - Use Vercel for frontend
   - Use AWS/Azure for backend

4. **Read Security Guide**
   - Check [SECURITY.md](./SECURITY.md) for production recommendations

---

## 💡 Useful Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Check code quality (if configured)

# Backend
npm start            # Start API server
npm run test         # Run tests (if configured)

# Database
mongod              # Start local MongoDB
mongosh             # MongoDB shell
```

---

## 📞 Need Help?

- Check [README.md](./README.md) for full documentation
- Check logs for error messages
- Restart both terminals if something hangs
- Clear browser cache (Ctrl+Shift+Del)
- Check `.env` files don't have trailing spaces

**Happy coding! 🌱**

# 🌱 Eco Buddy - AI-Powered Sustainable Shopping Assistant

An intelligent e-commerce application that helps users choose eco-friendly products and understand the environmental impact of their purchases through AI-powered recommendations.

## 🚀 Features

- **Age-aware Login** - Start the app by entering your name and age
- **Smart Product Catalog** - Browse and filter eco-friendly products by category
- **AI-Powered Recommendations** - Get instant suggestions for sustainable alternatives using Groq AI
- **Shopping Cart** - Add, remove, and manage items with real-time updates
- **Mock Payment Gateway** - UPI and Card payment support (demo mode)
- **Order History** - Track your purchases and eco-impact
- **Admin Dashboard** - View analytics, user stats, and order history

## 🛠️ Tech Stack

### Frontend
- **Name and age login** for customer identity
- **Fetch API** for HTTP requests

### Deployment
- **Vercel** - Frontend hosting
- **MongoDB Atlas** - Cloud database
- **AWS/Azure** - API server (optional)

## 📋 Prerequisites

- **Node.js 16+** and npm
- **MongoDB** (local or Atlas cloud) for persistent app data
- **Groq API Key** (free from https://console.groq.com)
 **Login is name-only and stored in localStorage**
 Add real authentication if you need user accounts
### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd ecobuddy-fullstack

# Install frontend dependencies
npm install

# Install backend dependencies
cd api && npm install && cd ..
```

### 2. Configure Environment Variables

#### Frontend (.env)
```bash
# Copy the example
cp .env.example .env

# Edit .env with your values
VITE_API_BASE_URL=/api
VITE_PEXELS_API_KEY=your_pexels_api_key_here
```

#### Backend (api/.env)
```bash
# Copy the example
cp api/.env.example api/.env

# Edit api/.env with your values
GROQ_API_KEY=your_groq_api_key_here
MONGO_URI=mongodb+srv://<db_username>:<db_password>@cluster0.example.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGO_DB_NAME=ecobuddy
JWT_SECRET=replace_with_a_long_random_secret
PORT=3001
```

### 3. Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Just set MONGO_URI to your Atlas connection string in api/.env, ending with /test-ecobuddy
```

### 4. Run the Application

#### Option A: Start Both Frontend and Backend

**Terminal 1 - Start the API server:**
```bash
cd api
npm start
# Server runs on http://localhost:3001
```

**Terminal 2 - Start the frontend dev server:**
```bash
npm run dev
# App runs on http://localhost:5173
```

#### Option B: Production Build
```bash
# Build frontend
npm run build

# Serve the production frontend build locally
npm start

# Run API in production
cd api && NODE_ENV=production npm start
```

## 📱 How to Use

1. **Visit** `http://localhost:5173`
2. **Enter your name** on the login screen
3. **Browse products** by category (Personal Care, Kitchen, Bottles, etc.)
4. **Add items to cart** - The AI chatbot will suggest eco-friendly alternatives
5. **View recommendations** - Click the 🤖 button to see AI-generated suggestions
6. **Checkout** - Use the cart button and complete payment (demo mode)
7. **Track orders** - View your order history and eco-impact

## 🤖 AI Recommendation Workflow

When you add a product to your cart:
1. The product name is sent to the backend
2. **Groq AI** analyzes the product and suggests eco-friendly alternatives
3. The AI provides:
   - 🌱 **Eco Alternative** - A sustainable product
   - ✅ **Why it's better** - Environmental benefits
   - ♻️ **Extra Tip** - Additional sustainability advice
4. The suggestion appears in the chatbot window

## 📁 Project Structure

```
ecobuddy-fullstack/
├── src/                          # Frontend source
│   ├── components/
│   │   ├── AdminDashboard.jsx   # Admin analytics
│   │   ├── CartSummary.jsx      # Shopping cart
│   │   ├── Chatbot.jsx          # AI recommendation display
│   │   ├── LoginPage.jsx        # Name-only login
│   │   ├── PaymentModal.jsx     # Checkout flow
│   │   ├── ProductCard.jsx      # Product display
│   │   ├── ShopPage.jsx         # Main shopping interface
│   ├── App.jsx                  # Router setup
│   ├── config.js                # Environment config
│   ├── data.js                  # Product catalog
│   ├── main.jsx                 # Entry point
│   └── style.css                # Global styles
├── api/                          # Backend source
│   ├── server.js                # Express API server
│   ├── [...]all].js             # Vercel serverless handler
│   ├── .env                     # Backend config (git-ignored)
│   └── .env.example             # Template for .env
├── index.html                   # HTML entry point
├── package.json                 # Frontend dependencies
├── vite.config.js               # Vite configuration
├── vercel.json                  # Vercel deployment config
├── .env                         # Frontend config (git-ignored)
├── .env.local                   # Local overrides (git-ignored)
├── .env.example                 # Template for .env
└── .gitignore                   # Git ignore rules
```

## 🔐 Security Notes

**⚠️ Current Implementation (Demo Mode):**
- Login is name-only and stored in localStorage
- Payment is simulated (no real transactions)
- Admin endpoints are public

**Production Requirements:**
- Implement server-side Google token verification
- Add JWT or session-based authentication
- Use real payment gateways (Razorpay, Stripe)
- Add role-based access control (RBAC)
- Implement rate limiting and API authentication
- Add HTTPS and secure cookies

## 🚀 Deployment

### Vercel (Frontend)
```bash
# Connect your GitHub repo to Vercel
# Set environment variables in Vercel dashboard:
# - VITE_API_BASE_URL
# - MONGO_URI
# - GROQ_API_KEY

# Auto-deploys on git push
```

### Express API (AWS/Azure)
```bash
# Containerize with Docker
docker build -t ecobuddy-api .
docker run -p 3001:3001 ecobuddy-api

# Or deploy to AWS ECS, Lambda, or Azure App Service
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/register` | Register/update user from submitted name |
| GET | `/users/:identifier` | Get user profile by username |
| POST | `/suggest` | Get AI eco-recommendation for a product |
| POST | `/orders` | Save order to database |
| GET | `/orders/:identifier` | Get user's order history by username |
| GET | `/orders` | Get all orders (admin) |
| GET | `/stats` | Get dashboard statistics |

## 🎯 Future Enhancements

- [ ] Carbon footprint tracking per order
- [ ] Sustainability scoring system
- [ ] Reward points for eco-friendly purchases
- [ ] Personalized product recommendations
- [ ] Community impact dashboard
- [ ] Real payment gateway integration
- [ ] Mobile app (React Native)
- [ ] Product reviews and ratings
- [ ] Wishlist and price tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add your feature'`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙋 Support

For issues, questions, or feature requests:
- Open a GitHub issue
- Check existing documentation
- Contact the maintainers

## 🌍 Environmental Impact

Every purchase through Eco Buddy contributes to a more sustainable future. Together, we can reduce plastic waste and promote eco-friendly consumption patterns.

---

**Happy sustainable shopping! 🌱♻️**

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
]
  .filter(Boolean)
  .flatMap((origin) => origin.split(","))
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin ${origin}`));
  },
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(bodyParser.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ecobuddy";

mongoose.connect(MONGO_URI)
.then(async () => {
  console.log("✅ MongoDB Connected");
  // Drop old indexes if they exist
  try {
    const userCollection = mongoose.connection.collection("users");
    const indexes = await userCollection.getIndexes();
    
    // Check for problematic indexes and drop them
    for (const [indexName, indexKey] of Object.entries(indexes)) {
      if (indexName.includes("username") || (indexKey.key && indexKey.key.username)) {
        await userCollection.dropIndex(indexName);
        console.log(`Dropped problematic index: ${indexName}`);
      }
    }
  } catch (err) {
    console.log("No problematic indexes found or already cleaned");
  }
})
.catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, sparse: true },
  picture: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  user: { type: String, required: true },
  email: { type: String },
  cart: { type: Object, required: true },
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

// Eco Suggestion Schema
const suggestionSchema = new mongoose.Schema({
  product: { type: String, required: true },
  suggestion: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Suggestion = mongoose.model("Suggestion", suggestionSchema);

// ===== USER ROUTES =====
// Register/Update User
app.post("/users/register", async (req, res) => {
  try {
    const { name, email, picture } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // Check if user exists, if yes update, if no create
    let user = await User.findOne({ email });
    
    if (user) {
      // Update existing user
      user.name = name;
      user.picture = picture;
      user.updatedAt = Date.now();
      await user.save();
      console.log(`✅ User updated: ${email}`);
      return res.json({ success: true, user, message: "User updated" });
    } else {
      // Create new user
      user = await User.create({ name, email, picture });
      console.log(`✅ User registered: ${email}`);
      return res.json({ success: true, user, message: "User registered" });
    }
  } catch (err) {
    // Handle duplicate key errors specifically
    if (err.code === 11000) {
      console.error("❌ Duplicate email error:", err.keyValue);
      return res.status(409).json({ success: false, error: "Email already registered" });
    }
    console.error("❌ User registration error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get User by Email
app.get("/users/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("❌ Get user error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get All Users (Admin)
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, users });
  } catch (err) {
    console.error("❌ Get users error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Routes
app.post("/suggest", async (req, res) => {
  const { product } = req.body;

  if (product.toLowerCase().includes("daily eco tip")) {
    const tips = [
      "🌿 Use a cloth bag instead of plastic.",
      "💧 Carry a reusable water bottle.",
      "🪥 Try a bamboo toothbrush.",
      "♻️ Separate your wet and dry waste.",
    ];
    const tip = tips[Math.floor(Math.random() * tips.length)];
    return res.json({ message: tip });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are EcoBuddy AI. Suggest eco-friendly alternatives to plastic items.
Respond in simple HTML format using:
💬 Product: <b>[Product Name]</b><br>
🌱 Eco Alternative: <b>[Alternative]</b><br>
✅ Why it's better: [1 or 2 short reasons using bold key terms]<br>
♻️ Extra Tip: [1 simple suggestion]`
          },
          {
            role: "user",
            content: `Suggest an eco-friendly alternative to: ${product}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API error:", errorData);
      return res.status(response.status).json({ message: `API Error: ${errorData.error?.message || 'Unknown error'}` });
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "🌱 Try using eco-friendly alternatives!";
    
    // Save suggestion to database
    await Suggestion.create({ product, suggestion: message });
    
    res.json({ message });
  } catch (error) {
    console.error("Groq API error:", error.message);
    res.status(500).json({ message: `Groq AI error: ${error.message}` });
  }
});

// Save Order to Database
app.post("/orders", async (req, res) => {
  try {
    const newOrder = req.body;
    const order = await Order.create(newOrder);
    console.log("✅ Order saved:", order._id);
    res.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error("❌ Save error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get All Orders (Admin)
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json({ success: true, orders });
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Orders by User
app.get("/orders/:email", async (req, res) => {
  try {
    const orders = await Order.find({ email: req.params.email });
    res.json({ success: true, orders });
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get User Statistics
app.get("/stats", async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]);
    
    res.json({
      success: true,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (err) {
    console.error("❌ Stats error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ EcoBuddy server running on http://localhost:${PORT}`);
    console.log(`📦 Database: ${MONGO_URI}`);
  });
}

module.exports = app;

module.exports = app;

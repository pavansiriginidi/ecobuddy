const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { randomUUID } = require("crypto");
const fetch = require("node-fetch");
const path = require("path");
const dotenv = require("dotenv");
const { getCollections } = require("./db");

// Load api/.env first (works when starting server from repo root), then fallback to default lookup.
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

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
    const isLocalhostOrigin = /^http:\/\/localhost:\d+$/.test(origin || "") || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin || "");

    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin) || isLocalhostOrigin) {
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

// Persistent MongoDB-backed data store.

// No fallback responses: the API only returns validated Groq output.
const clampEcoRating = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0.0";
  const clipped = Math.min(5, Math.max(0, Math.round(num * 10) / 10));
  return clipped.toFixed(1);
};

const formatSuggestionMessage = ({ product, ecoAlternative, ecoRating, whyBetter }) => {
  const rating = String(clampEcoRating(ecoRating));
  const first = Array.isArray(whyBetter) ? whyBetter[0] || "" : "";
  const second = Array.isArray(whyBetter) ? whyBetter[1] || "" : "";

  return [
    `Selected Product:\n${product}\n`,
    `♻️ Better Eco Alternative:\n${ecoAlternative}\n`,
    `Why It’s Better:\n✔ ${first}\n✔ ${second}\n`,
    `Eco Rating:\n⭐⭐⭐⭐⭐ ${rating}/5`,
  ].join("\n");
};

const isGenericEcoAlternative = (value) => {
  const text = String(value || "").trim();
  return /reusable alternative|eco-friendly version|sustainable option|generic alternative|better eco alternative|environmentally friendly/i.test(text);
};

// ===== USER ROUTES =====
const normalizeText = (value) => String(value || "").trim();
const nowIso = () => new Date().toISOString();

const syncPaidCustomer = async (usersCollection, order) => {
  const username = normalizeText(order?.username || order?.customerName || order?.user);
  if (!username) return null;

  const existingUser = await usersCollection.findOne({ username });

  // Only set `name` if the order/payment provided a specific user or customerName.
  // We avoid falling back to `username` for `name` to prevent overwriting a user's
  // existing full name with their username when the request didn't include a real name.
  const providedName = order?.user || order?.customerName;

  const customerRecord = {
    username,
    updatedAt: nowIso(),
  };

  if (providedName) {
    customerRecord.name = normalizeText(providedName);
  }

  const normalizedAge = normalizeText(order?.age);
  const normalizedAddress = normalizeText(order?.address);
  const normalizedPaymentMethod = normalizeText(order?.paymentMethod);
  const normalizedTransactionId = normalizeText(order?.transactionId);
  const normalizedPaymentLabel = normalizeText(order?.paymentLabel);

  if (normalizedAge) {
    customerRecord.age = normalizedAge;
  }

  if (normalizedAddress) {
    customerRecord.address = normalizedAddress;
  }

  if (normalizedPaymentMethod) {
    customerRecord.paymentMethod = normalizedPaymentMethod;
  }

  if (normalizedTransactionId) {
    customerRecord.transactionId = normalizedTransactionId;
  }

  if (normalizedPaymentLabel) {
    customerRecord.paymentLabel = normalizedPaymentLabel;
  }

  if (existingUser) {
    await usersCollection.updateOne({ _id: existingUser._id }, { $set: customerRecord });
    return { ...existingUser, ...customerRecord };
  }

  const user = {
    _id: randomUUID(),
    createdAt: nowIso(),
    ...customerRecord,
  };

  await usersCollection.insertOne(user);
  return user;
};

// Register/Update User
app.post("/users/register", async (req, res) => {
  try {
    const { users } = await getCollections();
    const { name, username, picture, age } = req.body;
    const normalizedName = normalizeText(name);
    const normalizedUsername = normalizeText(username);
    const normalizedAge = normalizeText(age);
    
    if (!normalizedName) {
      return res.status(400).json({ success: false, message: "Name required" });
    }

    if (!normalizedUsername) {
      return res.status(400).json({ success: false, message: "Username required" });
    }

    // Check if user exists, if yes update, if no create
    const existingUser = await users.findOne({ username: normalizedUsername });
    
    if (existingUser) {
      // Update existing user
      const updatedUser = {
        name: normalizedName,
        username: normalizedUsername,
        picture: picture || existingUser.picture || "",
        age: normalizedAge || existingUser.age || "",
        updatedAt: nowIso(),
      };
      await users.updateOne({ _id: existingUser._id }, { $set: updatedUser });
      console.log(`✅ User updated: ${normalizedUsername}`);
      return res.json({ success: true, user: { ...existingUser, ...updatedUser }, message: "User updated" });
    } else {
      // Create new user
      const user = {
        _id: randomUUID(),
        name: normalizedName,
        username: normalizedUsername,
        age: normalizedAge,
        picture: picture || "",
        createdAt: nowIso(),
      };
      await users.insertOne(user);
      console.log(`✅ User registered: ${normalizedUsername}`);
      return res.json({ success: true, user, message: "User registered" });
    }
  } catch (err) {
    console.error("❌ User registration error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get User by Username
app.get("/users/:identifier", async (req, res) => {
  try {
    const { users } = await getCollections();
    const username = normalizeText(req.params.identifier);
    const user = await users.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("❌ Get user error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update user by username
app.put("/users/:identifier", async (req, res) => {
  try {
    const { users } = await getCollections();
    const username = normalizeText(req.params.identifier);
    const existing = await users.findOne({ username });
    if (!existing) return res.status(404).json({ success: false, message: 'User not found' });

    const allowed = ['name', 'age', 'address', 'picture', 'paymentMethod', 'paymentLabel'];
    const update = { updatedAt: nowIso() };
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = normalizeText(req.body[key]);
    }

    await users.updateOne({ _id: existing._id }, { $set: update });
    const user = await users.findOne({ _id: existing._id });
    res.json({ success: true, user });
  } catch (err) {
    console.error('❌ Update user error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get All Users (Admin)
app.get("/users", async (req, res) => {
  try {
    const { users } = await getCollections();
    const allUsers = await users.find({}).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, users: allUsers });
  } catch (err) {
    console.error("❌ Get users error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Routes
app.post("/suggest", async (req, res) => {
  const product = typeof req.body?.product === "string" ? req.body.product.trim() : "";

  if (!product) {
    return res.status(400).json({ message: "Please provide a product name." });
  }

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

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ message: "Groq API key is missing." });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are EcoBuddy AI. Return ONLY valid JSON (no markdown, no HTML, no extra text) with this exact structure:\n{\n  "product": "string",\n  "ecoAlternative": "string",\n  "ecoRating": "X.X",\n  "whyBetter": ["point1", "point2"]\n}\nRules:\n- "ecoAlternative" must be a REAL specific eco-friendly product name. Never use generic phrases like "reusable alternative", "eco-friendly version", "sustainable option", or "better eco alternative".\n- Use a concrete product name that sounds like a real item people can buy, such as "Bamboo Toothbrush", "Steel Water Bottle", or "Cloth Grocery Bag".\n- "whyBetter" must contain EXACTLY 2 short points (no bullets).\n- "ecoRating" must be formatted as X.X (one decimal) and represent rating out of 5.\n- Keep values short and factual.\n- Do NOT include extra fields, HTML, markdown or commentary.`
          },
          {
            role: "user",
            content: `Suggest an eco-friendly alternative to: ${product}`
          }
        ]
      })
    });

    if (!response.ok) {
      let errBody = {};
      try { errBody = await response.json(); } catch { /* ignore */ }
      console.error("Groq API error:", errBody);
      return res.status(response.status).json({ message: "Groq API error" });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = typeof content === 'string' ? JSON.parse(content) : content;
    } catch (e) {
      console.error('Invalid JSON from Groq:', e.message);
      return res.status(500).json({ message: 'Invalid AI response format' });
    }

    if (
      !parsed ||
      typeof parsed.product !== 'string' ||
      typeof parsed.ecoAlternative !== 'string' ||
      typeof parsed.ecoRating !== 'string' ||
      !Array.isArray(parsed.whyBetter) ||
      parsed.whyBetter.length !== 2 ||
      typeof parsed.whyBetter[0] !== 'string' ||
      typeof parsed.whyBetter[1] !== 'string'
    ) {
      console.error('AI response missing required fields or invalid format', parsed);
      return res.status(500).json({ message: 'AI response missing required fields or invalid format' });
    }

    if (isGenericEcoAlternative(parsed.ecoAlternative)) {
      return res.status(500).json({ message: 'AI returned a generic ecoAlternative.' });
    }

    const ratingNum = Number(parsed.ecoRating);
    if (!Number.isFinite(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      console.error('AI returned invalid ecoRating value', parsed.ecoRating);
      return res.status(500).json({ message: 'AI returned invalid ecoRating value' });
    }

    const normalized = {
      product: parsed.product,
      ecoAlternative: parsed.ecoAlternative,
      ecoRating: Number(ratingNum).toFixed(1),
      whyBetter: [parsed.whyBetter[0].trim(), parsed.whyBetter[1].trim()],
    };

    const message = formatSuggestionMessage(normalized);

    const { suggestions } = await getCollections();

    await suggestions.insertOne({
      _id: randomUUID(),
      product: normalized.product,
      suggestion: message,
      timestamp: nowIso(),
    });

    res.json({ message });
  } catch (error) {
    console.error("Groq API error:", error.message);
    res.status(500).json({ message: 'Groq API request failed' });
  }
});

// Save Order
app.post("/orders", async (req, res) => {
  try {
    const { orders, users } = await getCollections();
    const newOrder = {
      _id: randomUUID(),
      ...req.body,
      user: normalizeText(req.body?.user),
      username: normalizeText(req.body?.username || req.body?.customerName),
      customerName: normalizeText(req.body?.customerName || req.body?.username),
      date: req.body?.date || nowIso(),
    };

    await orders.insertOne(newOrder);
    await syncPaidCustomer(users, newOrder);
    console.log("✅ Order saved:", newOrder._id);
    res.json({ success: true, orderId: newOrder._id });
  } catch (err) {
    console.error("❌ Save error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save Payment
app.post("/payments", async (req, res) => {
  try {
    const { payments, users, orders } = await getCollections();

    const paymentDoc = {
      _id: randomUUID(),
      ...req.body,
      username: normalizeText(req.body?.username || req.body?.user || req.body?.customerName),
      customerName: normalizeText(req.body?.customerName || req.body?.username || req.body?.user),
      transactionId: normalizeText(req.body?.transactionId || req.body?.tx || req.body?.transaction),
      amount: req.body?.amount || req.body?.total || 0,
      method: normalizeText(req.body?.method || req.body?.paymentMethod || ""),
      status: normalizeText(req.body?.status || "completed"),
      createdAt: nowIso(),
    };

    // Insert payment record (unique transactionId enforced by index)
    await payments.insertOne(paymentDoc);

    // If payment references an order, attach payment info to the order
    const orderId = normalizeText(req.body?.orderId || req.body?.order_id || req.body?.order);
    if (orderId) {
      // Attach payment info to the order
      await orders.updateOne({ _id: orderId }, { $set: { payment: { id: paymentDoc._id, transactionId: paymentDoc.transactionId, amount: paymentDoc.amount, method: paymentDoc.method, status: paymentDoc.status, createdAt: paymentDoc.createdAt } } });

      // If payment didn't include a customerName, try to pull it from the referenced order
      const orderRecord = await orders.findOne({ _id: orderId });
      if (orderRecord && !paymentDoc.customerName) {
        const derivedCustomerName = normalizeText(orderRecord.customerName || orderRecord.username || "");
        if (derivedCustomerName) {
          paymentDoc.customerName = derivedCustomerName;
          // Update the payment record in the DB so the payments collection stores the customerName
          try {
            await payments.updateOne({ _id: paymentDoc._id }, { $set: { customerName: derivedCustomerName } });
          } catch (e) {
            console.warn('Could not update payment with derived customerName', e.message);
          }
        }
      }
    }

    // Sync paid customer info into users collection. This will only set the user's name
    // when a specific customerName or user was provided (syncPaidCustomer guards against
    // overwriting names with usernames when no name was supplied).
    await syncPaidCustomer(users, paymentDoc);

    console.log("✅ Payment saved:", paymentDoc._id);
    res.json({ success: true, paymentId: paymentDoc._id });
  } catch (err) {
    console.error("❌ Payment save error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get All Payments (Admin)
app.get("/payments", async (req, res) => {
  try {
    const { payments } = await getCollections();
    const allPayments = await payments.find({}).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, payments: allPayments });
  } catch (err) {
    console.error("❌ Fetch payments error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Payment by ID or transactionId
app.get("/payments/:identifier", async (req, res) => {
  try {
    const { payments } = await getCollections();
    const identifier = normalizeText(req.params.identifier);
    const payment = await payments.findOne({ $or: [{ _id: identifier }, { transactionId: identifier }] });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    res.json({ success: true, payment });
  } catch (err) {
    console.error("❌ Fetch payment error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset all in-memory data
app.delete("/admin/reset", async (req, res) => {
  try {
    const { users, orders, suggestions } = await getCollections();
    const previousCounts = {
      users: await users.countDocuments(),
      orders: await orders.countDocuments(),
      suggestions: await suggestions.countDocuments(),
    };

    await Promise.all([
      users.deleteMany({}),
      orders.deleteMany({}),
      suggestions.deleteMany({}),
    ]);

    res.json({ success: true, message: "All database data cleared.", previousCounts });
  } catch (err) {
    console.error("❌ Reset error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get All Orders (Admin)
app.get("/orders", async (req, res) => {
  try {
    const { orders } = await getCollections();
    const allOrders = await orders.find({}).sort({ date: -1 }).toArray();
    res.json({ success: true, orders: allOrders });
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Orders by User
app.get("/orders/:identifier", async (req, res) => {
  try {
    const { orders } = await getCollections();
    const identifier = normalizeText(req.params.identifier);
    const filteredOrders = await orders
      .find({
        $or: [{ username: identifier }, { customerName: identifier }],
      })
      .sort({ date: -1 })
      .toArray();
    res.json({ success: true, orders: filteredOrders });
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update order by id
app.put("/orders/:id", async (req, res) => {
  try {
    const { orders } = await getCollections();
    const id = normalizeText(req.params.id);
    const existing = await orders.findOne({ _id: id });
    if (!existing) return res.status(404).json({ success: false, message: 'Order not found' });

    const allowed = ['items', 'total', 'customerName', 'address', 'paymentStatus', 'payment'];
    const update = { date: existing.date, updatedAt: nowIso() };

    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    await orders.updateOne({ _id: id }, { $set: update });
    const order = await orders.findOne({ _id: id });
    res.json({ success: true, order });
  } catch (err) {
    console.error('❌ Update order error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get User Statistics
app.get("/stats", async (req, res) => {
  try {
    const { orders } = await getCollections();
    const orderList = await orders.find({}).toArray();
    const totalOrders = orderList.length;
    const totalRevenue = orderList.reduce((sum, entry) => sum + (Number(entry.total) || 0), 0);
    
    res.json({
      success: true,
      totalOrders,
      totalRevenue
    });
  } catch (err) {
    console.error("❌ Stats error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ EcoBuddy server running on http://localhost:${PORT}`);
    console.log("🧠 Storage: MongoDB-backed persistent database");
  });
}

module.exports = app;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { products } from "../data";
import ProductCard from "./ProductCard";
import CartSummary from "./CartSummary";
import Chatbot from "./Chatbot";
import { API_BASE_URL } from "../config";

const LEGACY_CART_KEY = "ecoCart";

const normalizeCustomerName = (value) => String(value || "").trim().toLowerCase();

const getCartKey = (customerName) => {
  const normalized = normalizeCustomerName(customerName);
  return normalized ? `ecoCart:${encodeURIComponent(normalized)}` : LEGACY_CART_KEY;
};

function ShopPage() {
  const [lastSuggestion, setLastSuggestion] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [showRecentOrders, setShowRecentOrders] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentOrdersLoading, setRecentOrdersLoading] = useState(false);
  const [recentOrdersError, setRecentOrdersError] = useState("");
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("ecoUser") || '{}');
  const customerName = (user.username || user.name || "Guest").trim();
  const username = customerName;
  const cartStorageKey = getCartKey(customerName);

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(cartStorageKey);

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error("Failed to parse saved cart", error);
      }
    }

    const legacySaved = localStorage.getItem(LEGACY_CART_KEY);
    if (legacySaved) {
      try {
        const parsed = JSON.parse(legacySaved);
        localStorage.setItem(cartStorageKey, JSON.stringify(parsed));
        localStorage.removeItem(LEGACY_CART_KEY);
        return parsed;
      } catch (error) {
        console.error("Failed to migrate legacy cart", error);
      }
    }

    return {};
  });

  const logout = () => {
    localStorage.removeItem("ecoUser");
    navigate("/");
  };

  const categories = ["All", "Personal Care", "Kitchen", "Bottles", "Bags", "Home", "Fitness", "Electronics", "Office"];

  useEffect(() => {
    localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  }, [cart, cartStorageKey]);

  useEffect(() => {
    if (!showRecentOrders || !username) {
      return;
    }

    const loadRecentOrders = async () => {
      setRecentOrdersLoading(true);
      setRecentOrdersError("");

      try {
        const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(username)}`);
        const data = await res.json();

        if (data.success) {
          const sortedOrders = [...(data.orders || [])].sort(
            (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
          );
          setRecentOrders(sortedOrders.slice(0, 5));
        } else {
          setRecentOrders([]);
          setRecentOrdersError(data.error || "Could not load recent orders.");
        }
      } catch (error) {
        setRecentOrders([]);
        setRecentOrdersError("Could not load recent orders.");
        console.error("Recent orders error:", error.message);
      } finally {
        setRecentOrdersLoading(false);
      }
    };

    loadRecentOrders();
  }, [showRecentOrders, username]);

  const filteredProducts = filter === "All" ? products : products.filter((p) => p.category === filter);

  const fetchGroqSuggestion = async (productName) => {
    setIsSuggestionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: productName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // No local fallback suggestions per request; surface the error to the UI.
        const err = data && data.message ? data.message : 'Unable to fetch eco suggestion right now.';
        setLastSuggestion(`⚠️ ${err}`);
        return;
      }

      setLastSuggestion(data.message || "");
    } catch (error) {
      console.error("Groq error:", error.message);
      setLastSuggestion(`⚠️ Could not retrieve suggestion for ${productName}.`);
    } finally {
      setIsSuggestionLoading(false);
    }
  };

  const updateQty = (product, change) => {
    setCart((prev) => {
      const currentQty = prev[product.name] || 0;
      const newQty = currentQty + change;
      const updatedCart = { ...prev };
      if (newQty <= 0) {
        delete updatedCart[product.name];
      } else {
        updatedCart[product.name] = newQty;
      }
      return updatedCart;
    });

    if (change > 0) {
      setChatOpen(true);
      setLastSuggestion(`💬 Looking up the best eco-friendly option for ${product.name}...`);
      fetchGroqSuggestion(product.name);
    }
  };

  const clearCart = () => {
    setCart({});
    localStorage.removeItem(cartStorageKey);
    setLastSuggestion("🧺 Your cart has been cleared.");
    setChatOpen(true);
  };

  const getPrice = (productName) => {
    const product = products.find((p) => p.name === productName);
    return product ? product.price : 0;
  };

  const total = Object.entries(cart).reduce((sum, [name, qty]) => sum + qty * getPrice(name), 0);

  const handlePayment = async (paymentDetails = {}) => {
    const order = {
      user: user.name || "Guest",
      username,
      customerName,
      age: user.age || "",
      address: paymentDetails.address || "",
      paymentMethod: paymentDetails.paymentMethod || "",
      transactionId: paymentDetails.transactionId || "",
      paymentLabel: paymentDetails.paymentLabel || "",
      cart,
      total,
      date: new Date().toISOString(),
      paymentStatus: "completed"
    };

    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });

      if (res.ok) {
        // Clear cart after successful order
        setCart({});
        localStorage.removeItem(cartStorageKey);
        console.log("✅ Order saved successfully!");
      } else {
        console.error("⚠️ Failed to save order.");
      }
    } catch (err) {
      console.error("Save error:", err.message);
    }
  };

  return (
    <>
      <div className="shop-header">
        <h1 className="shop-title">🌿 EcoBuddy — Smart Sustainable Shopping</h1>
        <div className="user-info">
          <button
            type="button"
            className="profile-chip"
            onClick={() => setShowRecentOrders((prev) => !prev)}
            aria-expanded={showRecentOrders}
            aria-label="View recent orders"
          >
            <span className="profile-avatar-wrap">
              {user.picture ? (
                <img src={user.picture} alt={username || user.name || "User"} className="user-avatar" />
              ) : (
                <div className="user-avatar user-avatar-fallback">
                  {(username || user.name || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </span>
          </button>

          <div className="profile-identity">
            <span className="profile-username">{username || user.name || "Guest"}</span>
            <span className="profile-name">{user.name || "EcoBuddy shopper"}</span>
          </div>

          {showRecentOrders && (
            <div className="recent-orders-panel">
              <div className="recent-orders-header">
                <h3>Recent Orders</h3>
                <div className="header-actions">
                  <button className="logout-btn" onClick={logout}>
                    Logout
                  </button>
                  <button
                    type="button"
                    className="recent-orders-close"
                    onClick={() => setShowRecentOrders(false)}
                    aria-label="Close recent orders"
                  >
                    ×
                  </button>
                </div>
              </div>

              {!username ? (
                <p className="recent-orders-empty">No username found for this profile.</p>
              ) : recentOrdersLoading ? (
                <p className="recent-orders-empty">Loading recent orders...</p>
              ) : recentOrdersError ? (
                <p className="recent-orders-empty">{recentOrdersError}</p>
              ) : recentOrders.length === 0 ? (
                <p className="recent-orders-empty">No orders yet.</p>
              ) : (
                <div className="recent-orders-list">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="recent-order-card">
                      <div className="recent-order-top">
                        <span className="recent-order-user">{order.username || order.user}</span>
                        <span className="recent-order-date">
                          {new Date(order.date).toLocaleDateString()}
                        </span>
                        <span className="recent-order-total">₹{order.total}</span>
                      </div>
                      <div className="recent-order-items">
                        {Object.entries(order.cart || {}).slice(0, 3).map(([name, qty]) => (
                          <span key={name} className="recent-order-item">
                            {name} × {qty}
                          </span>
                        ))}
                        {Object.keys(order.cart || {}).length > 3 && (
                          <span className="recent-order-item recent-order-more">
                            +{Object.keys(order.cart || {}).length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="shop-container">
        <div className="category-filter">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${filter === cat ? "active" : ""}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="products-grid">
          {filteredProducts.map((p, idx) => (
            <ProductCard 
              key={idx} 
              product={p} 
              cart={cart}
              updateQty={updateQty} 
              getPrice={getPrice}
            />
          ))}
        </div>
      </div>

      <CartSummary
        cart={cart}
        getPrice={getPrice}
        total={total}
        handlePayment={handlePayment}
        clearCart={clearCart}
        username={username}
      />
      <Chatbot message={lastSuggestion} forceOpen={chatOpen} loading={isSuggestionLoading} />
    </>
  );
}

export default ShopPage;

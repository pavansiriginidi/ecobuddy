import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config";

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, usersRes, statsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/orders`),
          fetch(`${API_BASE_URL}/users`),
          fetch(`${API_BASE_URL}/stats`),
        ]);

        const ordersData = await ordersRes.json();
        const usersData = await usersRes.json();
        const statsData = await statsRes.json();

        if (ordersData.success) setOrders(ordersData.orders || []);
        if (usersData.success) setUsers(usersData.users || []);
        if (statsData.success) setStats(statsData);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8),
    [orders]
  );

  const formatCurrency = (value) => {
    return "₹" + value.toLocaleString("en-IN");
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "30px 20px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "700", color: "#1f2937", marginBottom: "30px" }}>
          📊 Admin Dashboard
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "15px",
              padding: "25px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e5e7eb",
            }}
          >
            <p style={{ color: "#6b7280", fontSize: "0.95rem", marginBottom: "10px" }}>Total Orders</p>
            <p style={{ fontSize: "2rem", fontWeight: "700", color: "#10b981" }}>
              {loading ? "—" : stats.totalOrders}
            </p>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "15px",
              padding: "25px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e5e7eb",
            }}
          >
            <p style={{ color: "#6b7280", fontSize: "0.95rem", marginBottom: "10px" }}>Total Revenue</p>
            <p style={{ fontSize: "2rem", fontWeight: "700", color: "#10b981" }}>
              {loading ? "—" : formatCurrency(stats.totalRevenue || 0)}
            </p>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "15px",
              padding: "25px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e5e7eb",
            }}
          >
            <p style={{ color: "#6b7280", fontSize: "0.95rem", marginBottom: "10px" }}>Registered Users</p>
            <p style={{ fontSize: "2rem", fontWeight: "700", color: "#10b981" }}>{users.length}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div
            style={{
              background: "white",
              borderRadius: "15px",
              padding: "25px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e5e7eb",
            }}
          >
            <h2 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#1f2937", marginBottom: "20px" }}>
              Recent Orders
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  style={{
                    padding: "15px",
                    borderRadius: "10px",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <p style={{ fontWeight: "600", color: "#1f2937", marginBottom: "5px" }}>
                    {order.username || order.user}
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "8px" }}>
                    {order.user}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "4px" }}>
                    Age: {order.age || "—"}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "4px" }}>
                    Address: {order.address || "—"}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "4px" }}>
                    Transaction ID: {order.transactionId || "—"}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "8px" }}>
                    Payment: {order.paymentMethod || "—"}
                  </p>
                  <p style={{ fontSize: "1rem", fontWeight: "600", color: "#10b981" }}>
                    {formatCurrency(order.total)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "15px",
              padding: "25px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e5e7eb",
            }}
          >
            <h2 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#1f2937", marginBottom: "20px" }}>
              User Registry
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {users.slice(0, 8).map((user) => (
                <div
                  key={user._id}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: "#d1d5db",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "600",
                        color: "#ffffff",
                      }}
                    >
                      {(user.username || user.name || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p style={{ fontWeight: "600", color: "#1f2937", fontSize: "0.95rem" }}>
                      {user.username || user.name}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                      {user.name}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                      Age: {user.age || "—"}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                      Address: {user.address || "—"}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                      Transaction: {user.transactionId || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

import React, { useState } from "react";

function LoginPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const trimmed = (name || "").trim();
    if (!trimmed) {
      setError("Please enter your name to continue.");
      return;
    }

    const user = { name: trimmed };
    try {
      localStorage.setItem("ecoUser", JSON.stringify(user));
    } catch (err) {
      console.error("Failed to save user to localStorage", err);
    }

    window.location.replace("/shop");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">EcoBuddy</h1>
          <p className="login-subtitle">Your Eco-Friendly Shopping Companion</p>
        </div>

        <form className="login-content" onSubmit={handleSubmit}>
          <p className="login-description">
            Enter your name to start shopping — no account required.
          </p>

          {error && (
            <div className="login-error">{error}</div>
          )}

          <input
            aria-label="Name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "6px", border: "1px solid #ddd" }}
          />

          <button
            type="submit"
            style={{ width: "100%", padding: "12px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
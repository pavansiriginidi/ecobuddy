import React, { useState } from "react";

function LoginPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = (name || "").trim();
    const ageValue = Number(age);
    if (!trimmed) {
      setError("Please enter your name to continue.");
      return;
    }

    if (!Number.isInteger(ageValue) || ageValue <= 0) {
      setError("Please enter a valid age.");
      return;
    }

    const user = { name: trimmed, username: trimmed, age: String(ageValue) };

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

          <div className="age-slider-group">
            <div className="age-slider-header">
              <label htmlFor="age-slider">Age</label>
              <span className="age-slider-value">{age || 18}</span>
            </div>
            <input
              id="age-slider"
              aria-label="Age"
              type="range"
              min="1"
              max="100"
              value={age || 18}
              onChange={(e) => setAge(e.target.value)}
              className="age-slider"
            />
            <div className="age-slider-labels">
              <span>1</span>
              <span>100</span>
            </div>
          </div>

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
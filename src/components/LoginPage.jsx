import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { API_BASE_URL } from "../config";

function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError("");
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem("ecoUser", JSON.stringify(data.user));
        // Store Google ID token for authenticated requests
        if (credentialResponse && credentialResponse.credential) {
          localStorage.setItem("ecoToken", credentialResponse.credential);
        }
        console.log("✅ User authenticated:", data.message);
        navigate("/shop");
      } else {
        console.error("❌ Google auth failed:", data.error);
        setError(`Google Auth Error: ${data.error || "Failed to authenticate user"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Login error: " + error.message);
    }
  };

  const handleGoogleError = () => {
    setError("❌ Google Login failed. Make sure the client ID is valid and localhost is added in Google Cloud Console.");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">🌍 EcoBuddy</h1>
          <p className="login-subtitle">Your Eco-Friendly Shopping Companion</p>
        </div>
        
        <div className="login-content">
          <p className="login-description">
            Join the green revolution and discover sustainable alternatives to everyday plastic items.
          </p>
          
          {/* Error Message */}
          {error && (
            <div style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "15px",
              fontSize: "0.9rem",
              lineHeight: "1.4"
            }}>
              {error}
            </div>
          )}

          {/* Google OAuth Section */}
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "10px", fontWeight: "600" }}>
              🔐 Secure Login with Google
            </p>
            <div className="google-login-wrapper" style={{ minHeight: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                size="large"
                text="signin_with"
                theme="filled_blue"
              />
            </div>
          </div>

          {/* Features List */}
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">🛒</span>
              <span>Shop eco-friendly products</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🤖</span>
              <span>AI-powered suggestions</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">♻️</span>
              <span>Save the planet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

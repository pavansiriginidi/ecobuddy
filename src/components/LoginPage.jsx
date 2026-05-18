import React, { useState } from "react";
import { API_BASE_URL } from "../config";

function LoginPage() {
  const [error, setError] = useState("");

  const handleGoogleLogin = () => {
    setError("");
    window.location.href = `${API_BASE_URL}/auth/google`;
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
              <button
                type="button"
                onClick={handleGoogleLogin}
                style={{
                  border: "none",
                  borderRadius: "999px",
                  padding: "12px 20px",
                  background: "#1a73e8",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 10px 24px rgba(26, 115, 232, 0.25)",
                }}
              >
                Continue with Google
              </button>
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

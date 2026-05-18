import React, { useState } from "react";
import { API_BASE_URL } from "../config";

function LoginPage() {
  const [error, setError] = useState("");

  const handleGoogleLogin = () => {
    setError("");
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">EcoBuddy</h1>
          <p className="login-subtitle">Your Eco-Friendly Shopping Companion</p>
        </div>
        
        <div className="login-content">
          <p className="login-description">
            Join the green revolution and discover sustainable alternatives to everyday plastic items.
          </p>
          
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

          <div style={{ marginBottom: "20px" }}>
             <button 
               onClick={handleGoogleLogin}
               style={{
                 width: "100%",
                 padding: "12px",
                 backgroundColor: "#4285F4",
                 color: "white",
                 border: "none",
                 borderRadius: "4px",
                 cursor: "pointer",
                 fontWeight: "bold"
               }}
             >
               Sign in with Google
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
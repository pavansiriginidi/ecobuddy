const fetch = require("node-fetch");
const mongoose = require("mongoose");
require("dotenv").config();

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, sparse: true },
  picture: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function verifyGoogleIdToken(credential) {
  const tokenResponse = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  );

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Invalid Google credential: ${errorText}`);
  }

  const tokenData = await tokenResponse.json();
  const expectedClientId = process.env.GOOGLE_CLIENT_ID;

  if (expectedClientId && tokenData.aud !== expectedClientId) {
    throw new Error("Google client ID mismatch");
  }

  if (!tokenData.email) {
    throw new Error("Google account email is missing");
  }

  return tokenData;
}

async function upsertGoogleUser(tokenData) {
  return User.findOneAndUpdate(
    { email: tokenData.email },
    {
      name: tokenData.name || tokenData.email.split("@")[0] || "Google User",
      email: tokenData.email,
      picture: tokenData.picture,
      updatedAt: Date.now(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function handleGoogleLogin(req, res) {
  try {
    if (req.method === "GET") {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const redirectUri = process.env.CALLBACK_URL;

      if (!clientId || !redirectUri) {
        return res.status(500).json({
          success: false,
          error: "Missing GOOGLE_CLIENT_ID or CALLBACK_URL",
        });
      }

      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "openid email profile");
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("prompt", "consent");

      return res.redirect(authUrl.toString());
    }

    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, error: "Google credential is required" });
    }

    const tokenData = await verifyGoogleIdToken(credential);
    const user = await upsertGoogleUser(tokenData);

    return res.json({
      success: true,
      user,
      message: "Google authentication successful",
    });
  } catch (err) {
    console.error("❌ Google auth error:", err.message);
    return res.status(401).json({ success: false, error: err.message });
  }
}

async function handleGoogleCallback(req, res) {
  try {
    const code = req.method === "POST" ? req.body?.code : req.query?.code;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Authorization code is required",
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.CALLBACK_URL;

    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(500).json({
        success: false,
        error: "Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or CALLBACK_URL",
      });
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return res.status(401).json({ success: false, error: errorText });
    }

    const tokenData = await tokenResponse.json();
    const idTokenData = tokenData.id_token ? await verifyGoogleIdToken(tokenData.id_token) : null;

    if (!idTokenData) {
      return res.status(401).json({ success: false, error: "Google did not return an ID token" });
    }

    const user = await upsertGoogleUser(idTokenData);

    if (req.method !== "POST") {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const userJson = JSON.stringify(JSON.stringify(user)).replace(/</g, "\\u003c");
      const tokenJson = JSON.stringify(JSON.stringify(tokenData.access_token || "")).replace(/</g, "\\u003c");

      return res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Signing you in...</title>
  </head>
  <body>
    <p>Signing you in...</p>
    <script>
      try {
        localStorage.setItem("ecoUser", ${userJson});
        localStorage.setItem("ecoToken", ${tokenJson});
      } catch (error) {
        console.error("Failed to persist Google login state", error);
      }
      window.location.replace(${JSON.stringify(`${frontendUrl}/shop`)});
    </script>
  </body>
</html>`);
    }

    return res.json({
      success: true,
      user,
      accessToken: tokenData.access_token,
      message: "Google callback authentication successful",
    });
  } catch (err) {
    console.error("❌ Google callback error:", err.message);
    return res.status(401).json({ success: false, error: err.message });
  }
}

module.exports = {
  handleGoogleLogin,
  handleGoogleCallback,
};

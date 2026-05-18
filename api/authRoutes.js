const express = require("express");
const { handleGoogleLogin, handleGoogleCallback } = require("./authService");

const router = express.Router();

router.post("/google", handleGoogleLogin);
router.get("/google", handleGoogleLogin);
router.get("/google/callback", handleGoogleCallback);
router.post("/google/callback", handleGoogleCallback);

module.exports = router;

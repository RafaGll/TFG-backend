const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const router = express.Router();

// Inicializa el client de Google
const CLIENT_ID = process.env.CLIENT_ID;  
const client = new OAuth2Client(CLIENT_ID);

// POST /auth/google
router.post("/google", async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ msg: "Token de Google inválido" });
    }
    const googleId = payload.sub;
    const email = payload.email;
    // ... (resto igual)
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.create({ googleId, email });
    }
    const jwtPayload = { user: { id: user._id, role: user.role } };
    const tokenJWT = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token: tokenJWT });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(401).json({ msg: "Token de Google inválido" });
  }
});

module.exports = router;

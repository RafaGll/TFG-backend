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
  const { token } = req.body;  // recibe { token: "<id_token de Google>" }
  try {
    // Verifica token con Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ msg: "Token de Google inválido" });
    }
    const googleId = payload.sub;  // ID de usuario de Google
    const email = payload.email;  // Email del usuario

    // Busca o crea usuario
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.create({ googleId, email});
    }

    // Genera tu JWT de sesión
    // const payload = { user: { id: user.id, role: user.role } };
    const jwtPayload = { user: { id: user._id, role: user.role } };
    const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token: jwtToken });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ msg: "Token de Google inválido" });
  }
});

module.exports = router;

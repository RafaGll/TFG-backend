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
    const { sub: googleId, email, name } = ticket.getPayload();
    // Busca o crea usuario
    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ 
        googleId,
        email,
        username: email,    // o name, según tu esquema
        // rol por defecto
      });
      await user.save();
    }

    // Genera tu JWT de sesión
    const payload = { user: { id: user.id, role: user.role } };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token: jwtToken });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ msg: "Token de Google inválido" });
  }
});

module.exports = router;

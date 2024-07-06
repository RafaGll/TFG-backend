// isAdmin.js
const User = require('../models/User');

async function admin(req, res, next) {
  try {
    const user = await User.findById(req.user.id);

    // Logging para depuración
    if (!user) {
      console.error('Usuario no encontrado:', req.user.id);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    } else {
    }

    // Verificar si el usuario no es administrador o no existe
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. No eres administrador.' });
    }

    // Continuar con la siguiente función middleware
    next();
  } catch (err) {
    console.error('Error en isAdmin middleware:', err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = admin;
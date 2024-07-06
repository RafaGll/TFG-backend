// auth.js
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Asegúrate de asignar decoded.user
    next();
  } catch (err) {
    console.error('Error verificando el token:', err);
    res.status(401).json({ message: 'Token inválido o expirado.' }); // Mensaje de error específico
  }
}

module.exports = auth;
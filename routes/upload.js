const express = require('express');
const multer = require('multer');
const router = express.Router();

// Configuración de multer para almacenar imágenes en una carpeta llamada 'uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Ruta para subir imágenes
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No se subió ninguna imagen.');
  }
  
  // Devuelve la URL de la imagen subida
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

module.exports = router;
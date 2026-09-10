const express = require('express');
const multer = require('multer');
const path = require('path');
const { getVisits, getVisitById, createVisit, updateVisit, deleteVisit, uploadVisitPhoto } = require('../controllers/visitController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Multer storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to allow only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// All routes require authentication
router.use(authMiddleware);

// Get all visits for the user
router.get('/', getVisits);

// Create a new visit
router.post('/', createVisit);

// Get a specific visit
router.get('/:id', getVisitById);

// Update a visit
router.put('/:id', updateVisit);

// Delete a visit
router.delete('/:id', deleteVisit);

// Upload a photo for a visit
router.post('/:id/photo', upload.single('photo'), uploadVisitPhoto);

module.exports = router;

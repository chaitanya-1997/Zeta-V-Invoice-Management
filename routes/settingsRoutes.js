const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const path       = require('path');
const verifyToken        = require('../middleware/authMiddleware');
const settingsController = require('../controllers/settingsController');

// ── Logo upload config ────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/company/'),
  filename:    (req, file, cb) => {
    cb(null, `logo-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase())
      ? cb(null, true)
      : cb(new Error('Only image files allowed'));
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// ── Company Profile ───────────────────────────────────────────
router.get('/company',    verifyToken, settingsController.getCompanyProfile);
router.put('/company',    verifyToken, upload.single('logo'), settingsController.updateCompanyProfile);

// ── Tax Rates ─────────────────────────────────────────────────
router.get   ('/tax-rates',      verifyToken, settingsController.getTaxRates);
router.post  ('/tax-rates',      verifyToken, settingsController.createTaxRate);
router.put   ('/tax-rates/:id',  verifyToken, settingsController.updateTaxRate);
router.delete('/tax-rates/:id',  verifyToken, settingsController.deleteTaxRate);

// ── Tax Settings ──────────────────────────────────────────────
router.get('/tax-settings',  verifyToken, settingsController.getTaxSettings);
router.put('/tax-settings',  verifyToken, settingsController.updateTaxSettings);

// ── Preferences ───────────────────────────────────────────────
router.get('/preferences',  verifyToken, settingsController.getPreferences);
router.put('/preferences',  verifyToken, settingsController.updatePreferences);

module.exports = router;
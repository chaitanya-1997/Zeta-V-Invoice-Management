const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/publicControllers/contactController');

// Public route - No authentication required
router.post('/contact', contactController.submitContact);

module.exports = router;
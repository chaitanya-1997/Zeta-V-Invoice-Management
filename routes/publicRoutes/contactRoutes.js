const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/publicControllers/contactController');

// Public route - No authentication required
router.post('/contact', contactController.submitContact);
router.post('/enquiries', contactController.submitEnquiries);

module.exports = router;
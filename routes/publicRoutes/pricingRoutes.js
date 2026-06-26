const express = require('express');
const router = express.Router();
const pricingController = require('../../controllers/publicControllers/pricingCalculatorController');



// Public route - Submit pricing calculator form
router.post("/submit", pricingController.submitPricing);


module.exports = router;
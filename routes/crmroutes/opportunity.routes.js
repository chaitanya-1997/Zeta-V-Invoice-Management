const express = require("express");
const router = express.Router();
const opportunityController = require("../../controllers/crmControllers/opportunity/opportunity.controller");
const { verifyToken } = require("../../middleware/crmmiddleware/auth.middleware");

// All routes require authentication
router.use(verifyToken);

router.get("/", opportunityController.getAllOpportunities);
router.get("/:id", opportunityController.getOpportunityById);
router.post("/", opportunityController.createOpportunity);
router.put("/:id", opportunityController.updateOpportunity);
router.delete("/:id", opportunityController.deleteOpportunity);   

module.exports = router;
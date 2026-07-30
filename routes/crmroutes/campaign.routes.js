const express = require("express");
const router = express.Router();
const campaignController = require("../../controllers/crmControllers/campaign/campaign.controller");
const { verifyToken } = require("../../middleware/crmmiddleware/auth.middleware");
const { restrictTo } = require("../../middleware/crmmiddleware/role.middleware");

// All routes require authentication
router.use(verifyToken);

router.get("/", campaignController.getAllCampaigns);
router.get("/:id", campaignController.getCampaignById);
router.post("/", restrictTo("management"), campaignController.createCampaign);
router.put("/:id", restrictTo("management"), campaignController.updateCampaign);
router.delete("/:id", restrictTo("management"), campaignController.deleteCampaign);

module.exports = router;
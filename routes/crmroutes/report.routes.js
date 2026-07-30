const express = require("express");
const router = express.Router();
const reportController = require("../../controllers/crmControllers/report/report.controller");
const { verifyToken } = require("../../middleware/crmmiddleware/auth.middleware");

router.use(verifyToken);

router.get("/marketing", reportController.marketingReport);
router.get("/marketing-outreach", reportController.marketingOutreachReport);
router.get("/opportunities", reportController.opportunityReport);
router.get("/closed", reportController.closedReport);
router.get("/customers", reportController.customerReport);

module.exports = router;

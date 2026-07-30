const express = require("express");
const router = express.Router();

router.use("/authcrm", require("./crmauth.routes"));
router.use("/campaigns", require("./campaign.routes"));
router.use("/customers", require("./customer.routes"));
router.use("/opportunities", require("./opportunity.routes"));
router.use("/dashboard", require("./dashboard.routes"));
router.use("/reports", require("./report.routes"));
router.use("/settings", require("./settings.routes"));
module.exports = router;

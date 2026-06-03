const express = require("express");
const router = express.Router();

const hrJobController = require("../../controllers/hrcontrollers/hrJobController");
const hrAuthMiddleware = require("../../middleware/hrmiddleware/hrAuthMiddleware");

router.post("/jobs", hrAuthMiddleware, hrJobController.createJob);
router.get("/jobs", hrAuthMiddleware, hrJobController.getAllJobs);
router.get("/jobs/:id", hrAuthMiddleware, hrJobController.getJobById);
router.put("/jobs/:id", hrAuthMiddleware, hrJobController.updateJob);

router.delete("/jobs/:id", hrAuthMiddleware, hrJobController.deleteJob);

router.patch("/jobs/:id/pause", hrAuthMiddleware, hrJobController.pauseJob);

router.patch("/jobs/:id/resume", hrAuthMiddleware, hrJobController.resumeJob);

module.exports = router;
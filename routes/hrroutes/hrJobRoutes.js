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



// GET all candidates NOT yet linked to this job (for the picker modal)
router.get("/jobs/:id/picker-candidates", hrAuthMiddleware, hrJobController.getPickerCandidates);
 
// POST manually add one or more candidates to a job
// Body: { candidate_ids: [1, 2, 3], status: 'applied' }
router.post("/jobs/:id/candidates", hrAuthMiddleware, hrJobController.addCandidatesToJob);
 
// DELETE remove a manually added candidate from a job
router.delete("/jobs/:id/candidates/:candidateId", hrAuthMiddleware, hrJobController.removeCandidateFromJob);
 
// PATCH update a candidate's status on a specific job
// Body: { status: 'shortlisted' }
router.patch("/jobs/:id/candidates/:candidateId/status", hrAuthMiddleware, hrJobController.updateCandidateJobStatus);




router.get('/jobs/count/active',hrAuthMiddleware, hrJobController.getActiveJobsCount);
router.get('/jobs/count/total',hrAuthMiddleware, hrJobController.getTotalJobsCount);


module.exports = router;
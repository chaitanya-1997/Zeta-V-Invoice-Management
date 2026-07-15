// const express = require("express");
// const router = express.Router();
// const hrAuthMiddleware = require("../../middleware/hrmiddleware/hrAuthMiddleware");
// const uploadCandidateResume = require("../../middleware/hrmiddleware/uploadCandidateResume");
// const hrCandidateController = require("../../controllers/hrcontrollers/hrCandidateController");




// // ── CANDIDATE CRUD ──
// router.post(
//   "/",
//   hrAuthMiddleware,
//   uploadCandidateResume.single("resume"),
//   hrCandidateController.createCandidate
// );

// router.get("/", hrAuthMiddleware, hrCandidateController.getAllCandidates);
// router.get("/candidates-for-job", hrAuthMiddleware, hrCandidateController.getAllCandidatesForJob);
// router.get("/:id", hrAuthMiddleware, hrCandidateController.getCandidateById);

// router.put(
//   "/:id",
//   hrAuthMiddleware,
//   uploadCandidateResume.single("resume"),
//   hrCandidateController.updateCandidate
// );

// router.delete("/:id", hrAuthMiddleware, hrCandidateController.deleteCandidate);

// // ── CANDIDATE STATUS ──
// router.patch(
//   "/:id/status",
//   hrAuthMiddleware,
//   hrCandidateController.updateCandidateStatus
// );

// router.get(
//   "/:id/status-history",
//   hrAuthMiddleware,
//   hrCandidateController.getCandidateStatusHistory
// );

// // ── CANDIDATE SKILLS ──
// router.post(
//   "/:id/skills",
//   hrAuthMiddleware,
//   hrCandidateController.addCandidateSkill
// );

// router.get(
//   "/:id/skills",
//   hrAuthMiddleware,
//   hrCandidateController.getCandidateSkills
// );

// router.delete(
//   "/skills/:skillId",
//   hrAuthMiddleware,
//   hrCandidateController.removeCandidateSkill
// );

// // ── CANDIDATE NOTES ──
// router.post(
//   "/:id/notes",
//   hrAuthMiddleware,
//   hrCandidateController.addCandidateNote
// );

// router.get(
//   "/:id/notes",
//   hrAuthMiddleware,
//   hrCandidateController.getCandidateNotes
// );

// router.put(
//   "/notes/:noteId",
//   hrAuthMiddleware,
//   hrCandidateController.updateCandidateNote
// );

// router.delete(
//   "/notes/:noteId",
//   hrAuthMiddleware,
//   hrCandidateController.deleteCandidateNote
// );

// // ── SAVED CANDIDATES ──
// router.post(
//   "/:id/save",
//   hrAuthMiddleware,
//   hrCandidateController.saveCandidateByHR
// );

// router.delete(
//   "/:id/unsave",
//   hrAuthMiddleware,
//   hrCandidateController.unsaveCandidateByHR
// );

// router.get(
//   "/saved",
//   hrAuthMiddleware,
//   hrCandidateController.getSavedCandidatesByHR
// );


// router.get("/dashboard/stats", hrAuthMiddleware, hrCandidateController.getDashboardStats);







// module.exports = router;

















const express = require("express");
const router = express.Router();
const hrAuthMiddleware = require("../../middleware/hrmiddleware/hrAuthMiddleware");
const uploadCandidateResume = require("../../middleware/hrmiddleware/uploadCandidateResume");
const hrCandidateController = require("../../controllers/hrcontrollers/hrCandidateController");

// =============================================
// ✅ STEP 1: Debug/Test Routes (MUST BE FIRST)
// =============================================

// Debug route - Simple GET
router.get('/test', hrAuthMiddleware, (req, res) => {
  res.json({
    success: true,
    message: '✅ Candidate routes are working!',
    path: '/api/hr/candidates/test',
    timestamp: new Date().toISOString()
  });
});

// Debug route - Monthly test
router.get('/monthly-test', hrAuthMiddleware, (req, res) => {
  res.json({
    success: true,
    message: '✅ Monthly route is accessible',
    query: req.query,
    timestamp: new Date().toISOString()
  });
});

// Debug route - List all registered routes
router.get('/routes', hrAuthMiddleware, (req, res) => {
  const routes = [];
  router.stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(', ');
      routes.push({
        path: layer.route.path,
        methods: methods
      });
    }
  });
  res.json({
    success: true,
    routes: routes
  });
});

// =============================================
// ✅ STEP 2: Specific Routes (no :id parameter)
// =============================================

// ── DASHBOARD STATS ──
router.get("/dashboard/stats", hrAuthMiddleware, hrCandidateController.getDashboardStats);

// ── CANDIDATE MONTHLY DATA ──
router.get('/monthly', hrAuthMiddleware, hrCandidateController.getMonthlyCandidates);

// ── SAVED CANDIDATES ──
router.get("/saved", hrAuthMiddleware, hrCandidateController.getSavedCandidatesByHR);

// ── CANDIDATES FOR JOB ──
router.get("/candidates-for-job", hrAuthMiddleware, hrCandidateController.getAllCandidatesForJob);

// ── GET ALL CANDIDATES ──
router.get("/", hrAuthMiddleware, hrCandidateController.getAllCandidates);

// ── CREATE CANDIDATE ──
router.post(
  "/",
  hrAuthMiddleware,
  uploadCandidateResume.single("resume"),
  hrCandidateController.createCandidate
);

// =============================================
// ✅ STEP 3: Dynamic Routes (with :id parameter) - MUST BE LAST
// =============================================

// ── GET SINGLE CANDIDATE ──
router.get("/:id", hrAuthMiddleware, hrCandidateController.getCandidateById);

// ── UPDATE CANDIDATE ──
router.put(
  "/:id",
  hrAuthMiddleware,
  uploadCandidateResume.single("resume"),
  hrCandidateController.updateCandidate
);

// ── DELETE CANDIDATE ──
router.delete("/:id", hrAuthMiddleware, hrCandidateController.deleteCandidate);

// ── CANDIDATE STATUS ──
router.patch(
  "/:id/status",
  hrAuthMiddleware,
  hrCandidateController.updateCandidateStatus
);

router.get(
  "/:id/status-history",
  hrAuthMiddleware,
  hrCandidateController.getCandidateStatusHistory
);

// ── CANDIDATE SKILLS ──
router.post(
  "/:id/skills",
  hrAuthMiddleware,
  hrCandidateController.addCandidateSkill
);

router.get(
  "/:id/skills",
  hrAuthMiddleware,
  hrCandidateController.getCandidateSkills
);

router.delete(
  "/skills/:skillId",
  hrAuthMiddleware,
  hrCandidateController.removeCandidateSkill
);

// ── CANDIDATE NOTES ──
router.post(
  "/:id/notes",
  hrAuthMiddleware,
  hrCandidateController.addCandidateNote
);

router.get(
  "/:id/notes",
  hrAuthMiddleware,
  hrCandidateController.getCandidateNotes
);

router.put(
  "/notes/:noteId",
  hrAuthMiddleware,
  hrCandidateController.updateCandidateNote
);

router.delete(
  "/notes/:noteId",
  hrAuthMiddleware,
  hrCandidateController.deleteCandidateNote
);

// ── SAVED CANDIDATES (with :id) ──
router.post(
  "/:id/save",
  hrAuthMiddleware,
  hrCandidateController.saveCandidateByHR
);

router.delete(
  "/:id/unsave",
  hrAuthMiddleware,
  hrCandidateController.unsaveCandidateByHR
);

module.exports = router;
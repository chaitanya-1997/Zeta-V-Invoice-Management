const express = require("express");
const router = express.Router();
const hrAuthMiddleware = require("../../middleware/hrmiddleware/hrAuthMiddleware");
const uploadCandidateResume = require("../../middleware/hrmiddleware/uploadCandidateResume");
const hrCandidateController = require("../../controllers/hrcontrollers/hrCandidateController");

// ── CANDIDATE CRUD ──
router.post(
  "/",
  hrAuthMiddleware,
  uploadCandidateResume.single("resume"),
  hrCandidateController.createCandidate
);

router.get("/", hrAuthMiddleware, hrCandidateController.getAllCandidates);
router.get("/:id", hrAuthMiddleware, hrCandidateController.getCandidateById);

router.put(
  "/:id",
  hrAuthMiddleware,
  uploadCandidateResume.single("resume"),
  hrCandidateController.updateCandidate
);

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

// ── SAVED CANDIDATES ──
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

router.get(
  "/saved",
  hrAuthMiddleware,
  hrCandidateController.getSavedCandidatesByHR
);

module.exports = router;
const express = require('express');
const router = express.Router();
const publicCandidateController = require('../../controllers/publicControllers/publicCandidateController');
const publicUploadResume = require('../../middleware/publicMiddleware/publicUploadMiddleware');

// Public routes (No authentication required)
router.post('/apply', publicUploadResume.single('resume'), publicCandidateController.publicCreateCandidate);
router.get('/check-existing', publicCandidateController.checkExistingApplication);
router.get('/jobs', publicCandidateController.getPublicJobs);
router.get('/jobs/:id', publicCandidateController.getPublicJobById);

router.post('/submitresume',publicUploadResume.single('resumeFile'), publicCandidateController.submitResume)

module.exports = router;
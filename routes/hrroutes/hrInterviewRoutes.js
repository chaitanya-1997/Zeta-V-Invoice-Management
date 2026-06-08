const express = require('express');
const router = express.Router();
const interviewController = require('../../controllers/hrcontrollers/hrInterviewController');
const hrAuthMiddleware = require("../../middleware/hrmiddleware/hrAuthMiddleware");



// Interview CRUD operations
router.post('/interviews', hrAuthMiddleware, interviewController.createInterview);
router.get('/interviews', hrAuthMiddleware, interviewController.getAllInterviews);
router.get('/interviews/upcoming', hrAuthMiddleware, interviewController.getUpcomingInterviews);
router.get('/interviews/date/:date', hrAuthMiddleware, interviewController.getInterviewsByDate);
router.get('/interviews/:id', hrAuthMiddleware, interviewController.getInterviewById);
router.put('/interviews/:id', hrAuthMiddleware, interviewController.updateInterview);
router.patch('/interviews/:id/status', hrAuthMiddleware, interviewController.updateInterviewStatus);
router.delete('/interviews/:id', hrAuthMiddleware, interviewController.deleteInterview);

module.exports = router;
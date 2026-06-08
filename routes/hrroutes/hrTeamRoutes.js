const express = require('express');
const router = express.Router();
const teamController = require('../../controllers/hrcontrollers/hrTeamController');

const hrAuthMiddleware = require("../../middleware/hrmiddleware/hrAuthMiddleware");



// Team CRUD operations
router.post('/teams',hrAuthMiddleware,teamController.createTeamMember);
router.get('/teams', hrAuthMiddleware, teamController.getAllTeamMembers);
router.get('/teams/:id',hrAuthMiddleware, teamController.getTeamMemberById);
router.put('/teams/:id',hrAuthMiddleware, teamController.updateTeamMember);
router.delete('/teams/:id', hrAuthMiddleware, teamController.deleteTeamMember);

module.exports = router;
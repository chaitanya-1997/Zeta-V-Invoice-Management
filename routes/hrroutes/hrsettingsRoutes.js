const express = require('express');
const router = express.Router();
const departmentController = require('../../controllers/hrcontrollers/departmentController');
const benefitsController = require('../../controllers/hrcontrollers/benefitsController');
const hrAuthMiddleware = require("../../middleware/hrmiddleware/hrAuthMiddleware");

// Department routes
router.get('/departments', hrAuthMiddleware, departmentController.getAllDepartments);
router.post('/departments', hrAuthMiddleware, departmentController.createDepartment);
router.put('/departments/:id', hrAuthMiddleware, departmentController.updateDepartment);
router.delete('/departments/:id', hrAuthMiddleware, departmentController.deleteDepartment);

// Benefits routes
router.get('/benefits', hrAuthMiddleware, benefitsController.getAllBenefits);
router.post('/benefits', hrAuthMiddleware, benefitsController.createBenefit);
router.put('/benefits/:id', hrAuthMiddleware, benefitsController.updateBenefit);
router.delete('/benefits/:id', hrAuthMiddleware, benefitsController.deleteBenefit);

module.exports = router;
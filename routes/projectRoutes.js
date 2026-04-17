const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const projectController = require("../controllers/projectController");

router.post("/projects", verifyToken, projectController.createProject);

router.get("/projects/:id", verifyToken, projectController.getProjectById);
router.get("/projects", verifyToken, projectController.getProjects);

router.put("/projects/:id", verifyToken, projectController.updateProject);

router.delete("/projects/:id", verifyToken, projectController.deleteProject);

module.exports = router;

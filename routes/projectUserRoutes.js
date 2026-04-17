const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const projectUserController = require("../controllers/projectUserController");
const { route } = require("./customerRoutes");

router.post(
  "/project-users",
  verifyToken,
  projectUserController.createProjectUser,
);
router.get(
  "/project-users",
  verifyToken,
  projectUserController.getProjectUsers,
);
module.exports = router;

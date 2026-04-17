const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const itemController = require("../controllers/itemController");

// Create a new item
router.post("/create-item", verifyToken, itemController.createItem);

// Get all items
router.get("/items", verifyToken, itemController.getItems);

// Update an item
router.put("/update-item/:id", verifyToken, itemController.updateItem);

// Delete an item
router.delete("/delete-item/:id", verifyToken, itemController.deleteItem);

module.exports = router;

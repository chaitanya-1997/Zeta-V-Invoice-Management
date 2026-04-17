const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const quoteController = require("../controllers/quoteController");

router.post("/quotes", verifyToken, quoteController.createQuote);
router.get("/quotes", verifyToken, quoteController.getAllQuotes);
router.get("/quotes/:id", verifyToken, quoteController.getQuoteById);
router.delete("/quotes/:id", verifyToken, quoteController.deleteQuote);
router.put("/quotes/:id", verifyToken, quoteController.updateQuote);
module.exports = router;

const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const paymentController = require("../controllers/paymentController");

router.post("/payments", verifyToken, paymentController.createPayment);
router.get("/payments", verifyToken, paymentController.getAllPayments);
router.put('/payments/:id', verifyToken, paymentController.updatePayment);
router.get('/payments/:id', verifyToken, paymentController.getPaymentById);
module.exports = router;

const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const verifyToken = require("../middleware/authMiddleware");

// Create a new invoice
router.post("/invoices", verifyToken, invoiceController.createInvoice);

// Get all invoices
router.get("/invoices", verifyToken, invoiceController.getAllInvoices);

// Get a single invoice by ID
router.get("/invoices/:id", verifyToken, invoiceController.getInvoiceById);

// Delete an invoice by ID
router.delete("/invoices/:id", verifyToken, invoiceController.deleteInvoice);

// Update an invoice by ID
router.put("/invoices/:id", verifyToken, invoiceController.updateInvoice);

module.exports = router;



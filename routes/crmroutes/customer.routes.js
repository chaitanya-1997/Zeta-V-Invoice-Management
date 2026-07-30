const express = require("express");
const router = express.Router();
const customerController = require("../../controllers/crmControllers/customer/customer.controller");
const { verifyToken } = require("../../middleware/crmmiddleware/auth.middleware");

// All routes require authentication
router.use(verifyToken);

router.get("/", customerController.getAllCustomers);
router.get("/:id", customerController.getCustomerById);
router.post("/", customerController.createCustomer);
router.put("/:id", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);   // NEW

module.exports = router;
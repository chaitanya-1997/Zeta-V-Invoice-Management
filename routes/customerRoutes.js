const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const customerController = require("../controllers/customerController");

router.post(
  "/customers",
  verifyToken,
  upload.array("documents"),
  customerController.createCustomer,
);

router.get("/customers", verifyToken, customerController.getCustomers);

router.put(
  "/customers/:id",
  verifyToken,
  upload.array("documents"),
  customerController.updateCustomer,
);

router.delete("/customers/:id", verifyToken, customerController.deleteCustomer);

module.exports = router;

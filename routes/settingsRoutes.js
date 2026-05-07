const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadCompanyLogo");

const settingsController = require("../controllers/settingsController");
const taxController = require("../controllers/taxController");

router.get(
  "/settings/company",
  verifyToken,
  settingsController.getCompanyProfile,
);

router.put(
  "/settings/company",
  verifyToken,
  upload.single("logo"),
  settingsController.updateCompanyProfile,
);

router.get("/taxes", verifyToken, taxController.getAllTaxes);

router.post("/taxes", verifyToken, taxController.createTax);

router.put("/taxes/:id", verifyToken, taxController.updateTax);

router.delete("/taxes/:id", verifyToken, taxController.deleteTax);

router.get(
  "/settings/tax-settings",
  verifyToken,
  settingsController.getTaxSettings,
);

router.put(
  "/settings/tax-settings",
  verifyToken,
  settingsController.updateTaxSettings,
);

router.get(
  "/settings/preferences",
  verifyToken,
  settingsController.getPreferences,
);

router.put(
  "/settings/preferences",
  verifyToken,
  settingsController.updatePreferences,
);

router.delete(
  "/settings/invoice-sequences/:country_code",
  verifyToken,
  settingsController.deleteInvoiceSequence,
);

router.post(
  "/settings/invoice-sequences",
  verifyToken,
  settingsController.createInvoiceSequence,
);

router.get("/settings/addresses", verifyToken, settingsController.getAddresses);

router.post("/settings/addresses", verifyToken, settingsController.createAddress);

router.put("/settings/addresses/:id", verifyToken, settingsController.updateAddress);

router.delete("/settings/addresses/:id", verifyToken, settingsController.deleteAddress);

router.get("/settings/bank-details", verifyToken, settingsController.getBankDetails);

router.post("/settings/bank-details", verifyToken, settingsController.createBankDetail);

router.put(
  "/settings/bank-details/:id",
  verifyToken,
  settingsController.updateBankDetail,
);

router.delete(
  "/settings/bank-details/:id",
  verifyToken,
  settingsController.deleteBankDetail,
);

module.exports = router;

const bcrypt = require("bcrypt");
const userModel = require("../../../models/crmmodels/user.model");

// GET /api/settings/company
exports.getCompanyProfile = async (req, res, next) => {
  try {
    const profile = await userModel.getCompanyProfile(req.user.id);
    if (!profile) return res.status(404).json({ message: "Not found" });
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

// PUT /api/settings/company  (management only — affects the whole workspace)
exports.updateCompanyProfile = async (req, res, next) => {
  try {
    const fields = {};
    const map = {
      companyName: "company_name",
      companyWebsite: "company_website",
      companyPhone: "company_phone",
      companyTaxId: "company_tax_id",
      companyAddress: "company_address",
      companyCountry: "company_country",
      companyIndustry: "company_industry",
      defaultCurrency: "default_currency",
    };
    Object.keys(map).forEach((k) => {
      if (req.body[k] !== undefined) fields[map[k]] = req.body[k];
    });

    await userModel.updateCompanyProfile(req.user.id, fields);
    res.json({ message: "Company profile updated" });
  } catch (err) {
    next(err);
  }
};

// GET /api/settings/profile
exports.getUserProfile = async (req, res, next) => {
  try {
    const profile = await userModel.getUserProfile(req.user.id);
    if (!profile) return res.status(404).json({ message: "Not found" });
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

// PUT /api/settings/profile
// Accepts multipart/form-data: text fields (firstName, lastName, jobTitle,
// phone, department, timezone) come in req.body, and an OPTIONAL image
// file comes in req.file (multer put it there — see settings.routes.js).
// Both are saved together in one request.
exports.updateUserProfile = async (req, res, next) => {
  try {
    const fields = {};
    const map = {
      firstName: "first_name",
      lastName: "last_name",
      jobTitle: "job_title",
      phone: "phone",
      department: "department",
      timezone: "timezone",
    };
    Object.keys(map).forEach((k) => {
      if (req.body[k] !== undefined) fields[map[k]] = req.body[k];
    });

    if (Object.keys(fields).length > 0) {
      await userModel.updateUserProfile(req.user.id, fields);
    }

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/profile-images/${req.file.filename}`;
      await userModel.updateProfileImage(req.user.id, imagePath);
    }

    const updatedProfile = await userModel.getUserProfile(req.user.id);

    res.json({
      message: "Profile updated",
      profile: updatedProfile,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/settings/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "All password fields are required" });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }
    const strongEnough = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword);
    if (!strongEnough) {
      return res.status(400).json({
        message: "New password must be at least 8 characters and include uppercase, lowercase, and a number",
      });
    }

    const user = await userModel.findUserWithPasswordById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(user.id, hashed);

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};

// POST /api/settings/profile-image  (multipart/form-data, field name: "image")
// Kept as a standalone option for changing just the photo.
exports.uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }
    const imagePath = `/uploads/profile-images/${req.file.filename}`;
    await userModel.updateProfileImage(req.user.id, imagePath);
    res.json({ message: "Profile image updated", imagePath });
  } catch (err) {
    next(err);
  }
};
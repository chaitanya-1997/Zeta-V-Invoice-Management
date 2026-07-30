const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../../../models/crmmodels/user.model");

// POST /api/auth/register
// Matches "Create Your Enterprise Account" signup form:
// First Name, Last Name, Company Name, Job Title, Business Email,
// Password, Confirm Password, Terms agreement.
exports.register = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      companyName,
      jobTitle,
      email,
      password,
      confirmPassword,
      termsAccepted,
    } = req.body;

    if (!firstName || !lastName || !companyName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "First name, last name, company name, email, password and confirm password are required",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password and confirm password do not match" });
    }
    if (!termsAccepted) {
      return res.status(400).json({ message: "You must agree to the Terms of Service and Privacy Policy" });
    }

    const existing = await userModel.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await userModel.createUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "management",
      companyName,
      jobTitle,
      termsAccepted: true,
    });

    res.status(201).json({
      message: "Account created successfully. You can now log in.",
      userId,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Your account is pending admin approval. Please contact the administrator.",
      });
    }

    await userModel.updateLastLogin(user.id);

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        companyName: user.company_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        companyName: user.company_name,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.json({
        message: "If that email is registered, reset instructions have been sent.",
      });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedTemp = await bcrypt.hash(tempPassword, 10);
    await userModel.updatePassword(user.id, hashedTemp);

    // TODO: send tempPassword to user.email via an email service instead of returning it
    res.json({
      message: "If that email is registered, reset instructions have been sent.",
      devNote: "Email sending not wired up yet — temp password returned here for testing only.",
      tempPassword,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getProfile = async (req, res, next) => {
  try {
    const user = await userModel.findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

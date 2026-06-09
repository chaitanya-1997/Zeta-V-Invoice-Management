const bcrypt = require("bcrypt");
const hrModel = require("../../models/hrmodels/hrModel");
const jwt = require("jsonwebtoken");
const db = require("../../config/db");

exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      confirmPassword,
      termsAccepted
    } = req.body;

    if (
      !first_name ||
      !last_name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message: "Required fields missing"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    if (!termsAccepted) {
      return res.status(400).json({
        message: "Please accept Terms & Conditions"
      });
    }

    hrModel.findUserByEmail(email, async (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (results.length > 0) {
        return res.status(400).json({
          message: "Email already registered"
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      hrModel.createUser(
        first_name,
        last_name,
        email,
        hashedPassword,
        termsAccepted,
        (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }

          return res.status(201).json({
            success: true,
            message: "HR account created successfully"
          });
        }
      );
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


// exports.login = (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({
//       message: "Email and password required"
//     });
//   }

//   hrModel.findUserByEmail(email, async (err, results) => {
//     if (err) {
//       return res.status(500).json(err);
//     }

//     if (results.length === 0) {
//       return res.status(401).json({
//         message: "Invalid email or password"
//       });
//     }

//     const user = results[0];

//     const isMatch = await bcrypt.compare(
//       password,
//       user.password
//     );

//     if (!isMatch) {
//       return res.status(401).json({
//         message: "Invalid email or password"
//       });
//     }

//     // Update Last Login

//     await db.promise().query(
//       `UPDATE hr_profiles
//        SET last_login = NOW(),
//            login_count = login_count + 1
//        WHERE id = ?`,
//       [user.id]
//     );

//     // Generate JWT

//     const token = jwt.sign(
//       {
//         id: user.id,
//         email: user.email,
//         first_name: user.first_name,
//         last_name: user.last_name
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         first_name: user.first_name,
//         last_name: user.last_name,
//         full_name: `${user.first_name} ${user.last_name}`
//       }
//     });
//   });
// };


exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password required"
    });
  }

  hrModel.findUserByEmail(email, async (err, results) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = results[0];

    // Check if account is active
    if (user.is_active === 0 || user.is_active === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact administrator."
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Update Last Login and login count
    await db.promise().query(
      `UPDATE hr_profiles
       SET last_login = NOW(),
           login_count = login_count + 1
       WHERE id = ?`,
      [user.id]
    );

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        is_active: user.is_active
      }
    });
  });
};
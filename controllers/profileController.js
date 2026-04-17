const db = require("../config/db");
const bcrypt = require("bcrypt");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.promise().query(
      `SELECT 
        id,
        name,
        email,
        company_name,
        role,
        status,

        first_name,
        last_name,
        designation,
        department,
        bio,

        phone,
        alt_phone,

        street,
        city,
        state,
        zip,
        country,

        timezone,
        language,
        date_format,

        two_factor,
        avatar_path,
        last_login,
        created_at

      FROM zv_users
      WHERE id = ?`,
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// exports.updateProfile = async (req, res) => {

//   try {

//     const userId = req.user.id;

//     let avatarPath = null;

//     if (req.file) {
//       avatarPath = req.file.path;
//     }

//     const {
//       first_name,
//       last_name,
//       designation,
//       department,
//       bio,
//       phone,
//       alt_phone,
//       street,
//       city,
//       state,
//       zip,
//       country,
//       timezone,
//       language,
//       date_format
//     } = req.body;

//     await db.promise().query(
//       `UPDATE zv_users
//        SET
//         first_name=?,
//         last_name=?,
//         designation=?,
//         department=?,
//         bio=?,
//         phone=?,
//         alt_phone=?,
//         street=?,
//         city=?,
//         state=?,
//         zip=?,
//         country=?,
//         timezone=?,
//         language=?,
//         date_format=?,
//         avatar_path = IFNULL(?, avatar_path)
//        WHERE id=?`,
//       [
//         first_name,
//         last_name,
//         designation,
//         department,
//         bio,
//         phone,
//         alt_phone,
//         street,
//         city,
//         state,
//         zip,
//         country,
//         timezone,
//         language,
//         date_format,
//         avatarPath,
//         userId
//       ]
//     );

//     res.json({
//       success: true,
//       message: "Profile updated successfully",
//       avatar: avatarPath
//     });

//   } catch (error) {

//     res.status(500).json({
//       success: false,
//       message: error.message
//     });

//   }

// };

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    let avatarPath = null;

    if (req.file) {
      avatarPath = req.file.path;
    }

    const {
      first_name,
      last_name,
      email,
      designation,
      department,
      bio,
      phone,
      alt_phone,
      street,
      city,
      state,
      zip,
      country,
      timezone,
      language,
      date_format,
    } = req.body;

    await db.promise().query(
      `UPDATE zv_users
       SET
        first_name=?,
        last_name=?,
        email=?,
        designation=?,
        department=?,
        bio=?,
        phone=?,
        alt_phone=?,
        street=?,
        city=?,
        state=?,
        zip=?,
        country=?,
        timezone=?,
        language=?,
        date_format=?,
        avatar_path = IFNULL(?, avatar_path)
       WHERE id=?`,
      [
        first_name,
        last_name,
        email,
        designation,
        department,
        bio,
        phone,
        alt_phone,
        street,
        city,
        state,
        zip,
        country,
        timezone,
        language,
        date_format,
        avatarPath,
        userId,
      ],
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      avatar: avatarPath,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;

    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    /* GET CURRENT USER PASSWORD */

    const [rows] = await db
      .promise()
      .query("SELECT password FROM zv_users WHERE id=?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = rows[0];

    /* VERIFY CURRENT PASSWORD */

    const isMatch = await bcrypt.compare(current_password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    /* HASH NEW PASSWORD */

    const hashedPassword = await bcrypt.hash(new_password, 10);

    /* UPDATE PASSWORD */

    await db
      .promise()
      .query("UPDATE zv_users SET password=? WHERE id=?", [
        hashedPassword,
        userId,
      ]);

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

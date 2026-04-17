const db = require("../config/db");

exports.createProjectUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const [existing] = await db
      .promise()
      .query("SELECT id FROM zv_project_users WHERE email=?", [email]);

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const [result] = await db.promise().query(
      `INSERT INTO zv_project_users (name,email,role)
       VALUES (?,?,?)`,
      [name, email, role],
    );

    res.json({
      success: true,
      message: "Team member created",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getProjectUsers = async (req, res) => {
  try {
    const [users] = await db.promise().query(
      `SELECT 
        id,
        name,
        email,
        role,
        created_at
       FROM zv_project_users
       ORDER BY name ASC`,
    );

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const db = require("../../config/db");

// Get all departments
const getAllDepartments = (callback) => {
  const sql = `SELECT * FROM hr_departments WHERE is_active = 1 ORDER BY name ASC`;
  db.query(sql, callback);
};

// Create department
const createDepartment = (data, callback) => {
  const sql = `INSERT INTO hr_departments (name, description, created_by) VALUES (?, ?, ?)`;
  db.query(sql, [data.name, data.description, data.created_by], callback);
};

// Update department
const updateDepartment = (id, data, callback) => {
  const sql = `UPDATE hr_departments SET name = ?, description = ? WHERE id = ?`;
  db.query(sql, [data.name, data.description, id], callback);
};

// Delete department (soft delete)
const deleteDepartment = (id, callback) => {
  const sql = `UPDATE hr_departments SET is_active = 0 WHERE id = ?`;
  db.query(sql, [id], callback);
};

module.exports = {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
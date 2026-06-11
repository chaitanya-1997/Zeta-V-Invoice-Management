const db = require("../../config/db");

// Get all benefits
const getAllBenefits = (callback) => {
  const sql = `SELECT * FROM hr_benefits WHERE is_active = 1 ORDER BY name ASC`;
  db.query(sql, callback);
};

// Create benefit
const createBenefit = (data, callback) => {
  const sql = `INSERT INTO hr_benefits (name, description, created_by) VALUES (?, ?, ?)`;
  db.query(sql, [data.name, data.description, data.created_by], callback);
};

// Update benefit
const updateBenefit = (id, data, callback) => {
  const sql = `UPDATE hr_benefits SET name = ?, description = ? WHERE id = ?`;
  db.query(sql, [data.name, data.description, id], callback);
};

// Delete benefit (soft delete)
const deleteBenefit = (id, callback) => {
  const sql = `UPDATE hr_benefits SET is_active = 0 WHERE id = ?`;
  db.query(sql, [id], callback);
};

module.exports = {
  getAllBenefits,
  createBenefit,
  updateBenefit,
  deleteBenefit
};
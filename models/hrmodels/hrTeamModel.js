const db = require("../../config/db");

// Create team member
const createTeamMember = (data, callback) => {
  const sql = `
    INSERT INTO hr_team (
      name, email, role, avatar, created_by
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      data.name,
      data.email,
      data.role,
      data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=8B5CF6&color=fff`,
      data.created_by
    ],
    callback
  );
};

// Get all team members
const getAllTeamMembers = (callback) => {
  const sql = `
    SELECT id, name, email, role, avatar, status, created_at as joinedAt
    FROM hr_team
    WHERE status = 'active'
    ORDER BY 
      CASE role 
        WHEN 'Admin' THEN 1 
        WHEN 'HR Manager' THEN 2 
        ELSE 3 
      END,
      created_at DESC
  `;
  db.query(sql, callback);
};

// Get team member by ID
const getTeamMemberById = (id, callback) => {
  const sql = `
    SELECT id, name, email, role, avatar, status, created_at as joinedAt
    FROM hr_team
    WHERE id = ? AND status = 'active'
  `;
  db.query(sql, [id], callback);
};

// Update team member
const updateTeamMember = (id, data, callback) => {
  const sql = `
    UPDATE hr_team
    SET name = ?, email = ?, role = ?, avatar = ?
    WHERE id = ? AND status = 'active'
  `;
  db.query(
    sql,
    [
      data.name,
      data.email,
      data.role,
      data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=8B5CF6&color=fff`,
      id
    ],
    callback
  );
};

// Delete team member (soft delete)
const deleteTeamMember = (id, callback) => {
  const sql = `
    UPDATE hr_team
    SET status = 'inactive'
    WHERE id = ? AND role != 'Admin'
  `;
  db.query(sql, [id], callback);
};

// Check if email exists
const checkEmailExists = (email, excludeId, callback) => {
  let sql = `SELECT id FROM hr_team WHERE email = ? AND status = 'active'`;
  const params = [email];
  
  if (excludeId) {
    sql += ` AND id != ?`;
    params.push(excludeId);
  }
  
  db.query(sql, params, callback);
};

module.exports = {
  createTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
  checkEmailExists
};
const db = require("../../config/db");

// Get HR profile by ID
const getProfileById = (id, callback) => {
  const sql = `
    SELECT id, first_name, last_name, email, phone, job_title, department, 
           bio, profile_image, role, is_active, last_login, login_count, 
           created_at, updated_at, last_profile_update
    FROM hr_profiles 
    WHERE id = ? AND is_active = 1
  `;
  db.query(sql, [id], callback);
};

// Get HR profile by email
const getProfileByEmail = (email, callback) => {
  const sql = `
    SELECT id, first_name, last_name, email, password, phone, job_title, 
           department, bio, profile_image, role, is_active
    FROM hr_profiles 
    WHERE email = ? AND is_active = 1
  `;
  db.query(sql, [email], callback);
};

// Update HR profile
const updateProfile = (id, data, callback) => {
  const sql = `
    UPDATE hr_profiles 
    SET first_name = ?, last_name = ?, phone = ?, job_title = ?, 
        department = ?, bio = ?, profile_image = ?, last_profile_update = NOW()
    WHERE id = ?
  `;
  db.query(
    sql,
    [
      data.first_name,
      data.last_name,
      data.phone,
      data.job_title,
      data.department,
      data.bio,
      data.profile_image || null,
      id,
    ],
    callback
  );
};

// Update password
const updatePassword = (id, hashedPassword, callback) => {
  const sql = `UPDATE hr_profiles SET password = ? WHERE id = ?`;
  db.query(sql, [hashedPassword, id], callback);
};

// Get company settings (shared across all HR users)
const getCompanySettings = (callback) => {
  const sql = `SELECT * FROM company_settings ORDER BY id DESC LIMIT 1`;
  db.query(sql, (err, result) => {
    if (err) return callback(err);
    callback(null, result[0] || null);
  });
};

// Update company settings
const updateCompanySettings = (data, callback) => {
  // Check if settings exist
  const checkSql = `SELECT id FROM company_settings LIMIT 1`;
  db.query(checkSql, (err, result) => {
    if (err) return callback(err);
    
    if (result && result.length > 0) {
      // Update existing
      const sql = `
        UPDATE company_settings 
        SET company_name = ?, company_website = ?, company_industry = ?, 
            company_size = ?, company_about = ?, email_templates = ?, updated_by = ?
      `;
      db.query(
        sql,
        [
          data.company_name,
          data.company_website,
          data.company_industry,
          data.company_size,
          data.company_about,
          data.email_templates,
          data.updated_by,
        ],
        callback
      );
    } else {
      // Insert new
      const sql = `
        INSERT INTO company_settings 
        (company_name, company_website, company_industry, company_size, company_about, email_templates, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(
        sql,
        [
          data.company_name,
          data.company_website,
          data.company_industry,
          data.company_size,
          data.company_about,
          data.email_templates,
          data.updated_by,
        ],
        callback
      );
    }
  });
};

// Get email templates from company settings
const getEmailTemplates = (callback) => {
  const sql = `SELECT email_templates FROM company_settings ORDER BY id DESC LIMIT 1`;
  db.query(sql, (err, result) => {
    if (err) return callback(err);
    const templates = result[0]?.email_templates || null;
    callback(null, templates);
  });
};

// Update email templates
const updateEmailTemplates = (templates, updatedBy, callback) => {
  const sql = `UPDATE company_settings SET email_templates = ?, updated_by = ?`;
  db.query(sql, [templates, updatedBy], callback);
};

module.exports = {
  getProfileById,
  getProfileByEmail,
  updateProfile,
  updatePassword,
  getCompanySettings,
  updateCompanySettings,
  getEmailTemplates,
  updateEmailTemplates,
};
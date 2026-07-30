const db = require("../../config/db");

exports.findUserByEmail = async (email) => {
  const [rows] = await db.promise().query(
    "SELECT * FROM crm_users WHERE email = ?",
    [email]
  );
  return rows[0];
};

exports.findUserById = async (id) => {
  const [rows] = await db.promise().query(
    `SELECT id, first_name, last_name, email, job_title, company_name,
            role, status, last_login
     FROM crm_users
     WHERE id = ?`,
    [id]
  );
  return rows[0];
};

exports.createUser = async ({
  firstName,
  lastName,
  email,
  password,
  role,
  companyName,
  jobTitle,
  termsAccepted,
}) => {
  const [result] = await db.promise().query(
    `INSERT INTO crm_users
      (first_name, last_name, email, password, role, company_name, job_title, terms_accepted, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    [
      firstName,
      lastName,
      email,
      password,
      role || "management",
      companyName,
      jobTitle || null,
      termsAccepted ? 1 : 0,
    ]
  );

  return result.insertId;
};



exports.updateLastLogin = async (id) => {
  await db.promise().query(
    "UPDATE crm_users SET last_login = NOW() WHERE id = ?",
    [id]
  );
};

exports.updatePassword = async (id, hashedPassword) => {
  await db.promise().query(
    "UPDATE crm_users SET password = ? WHERE id = ?",
    [hashedPassword, id]
  );
};

// during a change-password request.
exports.findUserWithPasswordById = async (id) => {
  const [rows] = await db.promise().query(
    "SELECT * FROM crm_users WHERE id = ?",
    [id]
  );
  return rows[0];
};


// ---- Company Profile ----
exports.getCompanyProfile = async (id) => {
  const [rows] = await db.promise().query(
    `SELECT id, company_name, company_website, company_phone, company_tax_id,
            company_address, company_country, company_industry, default_currency
     FROM crm_users WHERE id = ?`,
    [id],
  );
  return rows[0];
};

exports.updateCompanyProfile = async (id, fields) => {
  const allowed = [
    "company_name",
    "company_website",
    "company_phone",
    "company_tax_id",
    "company_address",
    "company_country",
    "company_industry",
    "default_currency",
  ];

  const keys = Object.keys(fields).filter((k) => allowed.includes(k));
  if (keys.length === 0) return;

  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const values = keys.map((k) => fields[k]);

  await db.promise().query(
    `UPDATE crm_users SET ${setClause}, updated_at = NOW() WHERE id = ?`,
    [...values, id],
  );
};

// ---- User Profile ----
exports.getUserProfile = async (id) => {
  const [rows] = await db.promise().query(
    `SELECT id, first_name, last_name, email, job_title, phone, department,
            timezone, profile_image, role
     FROM crm_users WHERE id = ?`,
    [id],
  );
  return rows[0];
};


exports.updateUserProfile = async (id, fields) => {
  const allowed = [
    "first_name",
    "last_name",
    "job_title",
    "phone",
    "department",
    "timezone",
  ];

  const keys = Object.keys(fields).filter((k) => allowed.includes(k));
  if (keys.length === 0) return;

  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const values = keys.map((k) => fields[k]);

  await db.promise().query(
    `UPDATE crm_users SET ${setClause}, updated_at = NOW() WHERE id = ?`,
    [...values, id],
  );
};

exports.updateProfileImage = async (id, imagePath) => {
  await db.promise().query(
    "UPDATE crm_users SET profile_image = ? WHERE id = ?",
    [imagePath, id],
  );
};
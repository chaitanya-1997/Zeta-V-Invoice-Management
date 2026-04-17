const db = require("../config/db");

const createUser = (
  name,
  company_name,
  email,
  password,
  privacy_policy_accepted,
  callback,
) => {
  const sql = `
    INSERT INTO zv_users (name, company_name, email, password, privacy_policy_accepted)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, company_name, email, password, privacy_policy_accepted],
    callback,
  );
};

const findUserByEmail = (email, callback) => {
  const sql = "SELECT * FROM zv_users WHERE email = ?";
  db.query(sql, [email], callback);
};

module.exports = {
  createUser,
  findUserByEmail,
};

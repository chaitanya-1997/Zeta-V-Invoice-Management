const db = require("../../config/db");

const createUser = (
  first_name,
  last_name,
  email,
  password,
  terms_accepted,
  callback
) => {
  const sql = `
    INSERT INTO hr_profiles
    (
      first_name,
      last_name,
      email,
      password,
      terms_accepted
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      first_name,
      last_name,
      email,
      password,
      terms_accepted
    ],
    callback
  );
};

const findUserByEmail = (email, callback) => {
  const sql = "SELECT * FROM hr_profiles WHERE email = ?";
  db.query(sql, [email], callback);
};

module.exports = {
  createUser,
  findUserByEmail,
};
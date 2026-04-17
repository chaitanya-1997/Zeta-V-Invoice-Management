// const db = require("../config/db");

// exports.createCustomer = (data, callback) => {

//   const sql = `
//   INSERT INTO zv_customers
//   (customer_type,name,company_name,email,phone,currency,pan_number,payment_terms,remarks,created_by)
//   VALUES (?,?,?,?,?,?,?,?,?,?)
//   `;

//   db.query(sql, [
//     data.customer_type,
//     data.name,
//     data.company_name,
//     data.email,
//     data.phone,
//     data.currency,
//     data.pan_number,
//     data.payment_terms,
//     data.remarks,
//     data.created_by
//   ], callback);
// };

const db = require("../config/db");

// ── Create customer (basic row only) ─────────────────────────
// Note: addresses, contacts, documents are handled
// directly in the controller using a transaction.

exports.createCustomer = (data, callback) => {
  const sql = `
    INSERT INTO zv_customers
    (customer_type, name, company_name, email, phone, currency, pan_number, payment_terms, remarks, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      data.customerType?.trim() || "company",
      data.name?.trim() || null,
      data.companyName?.trim() || null,
      data.email?.trim() || null,
      data.phone?.trim() || null,
      data.currency || "USD",
      data.panNumber?.trim() || null,
      data.paymentTerms || 30,
      data.remarks?.trim() || null,
      data.createdBy,
    ],
    callback,
  );
};

// ── Get all customers ─────────────────────────────────────────
exports.getAllCustomers = (callback) => {
  db.query(`SELECT * FROM zv_customers ORDER BY created_at DESC`, callback);
};

// ── Get single customer by ID ─────────────────────────────────
exports.getCustomerById = (id, callback) => {
  db.query(`SELECT * FROM zv_customers WHERE id = ?`, [id], callback);
};

// ── Update customer ───────────────────────────────────────────
exports.updateCustomer = (id, data, callback) => {
  const sql = `
    UPDATE zv_customers SET
      customer_type = ?,
      name          = ?,
      company_name  = ?,
      email         = ?,
      phone         = ?,
      currency      = ?,
      pan_number    = ?,
      payment_terms = ?,
      remarks       = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      data.customerType?.trim() || "company",
      data.name?.trim() || null,
      data.companyName?.trim() || null,
      data.email?.trim() || null,
      data.phone?.trim() || null,
      data.currency || "USD",
      data.panNumber?.trim() || null,
      data.paymentTerms || 30,
      data.remarks?.trim() || null,
      id,
    ],
    callback,
  );
};

// ── Delete customer ───────────────────────────────────────────
exports.deleteCustomer = (id, callback) => {
  db.query(`DELETE FROM zv_customers WHERE id = ?`, [id], callback);
};

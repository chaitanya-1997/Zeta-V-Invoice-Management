const db = require("../../config/db");

exports.getAllCustomers = async () => {
  const [rows] = await db.promise().query(
    `SELECT c.*, camp.campaign_name
     FROM crm_customers c
     LEFT JOIN crm_campaigns camp ON c.campaign_id = camp.id
     ORDER BY c.created_at DESC`,
  );
  return rows;
};

exports.getCustomersBySalesPerson = async (createdBy) => {
  const [rows] = await db.promise().query(
    `SELECT c.*, camp.campaign_name
     FROM crm_customers c
     LEFT JOIN crm_campaigns camp ON c.campaign_id = camp.id
     WHERE c.created_by = ?
     ORDER BY c.created_at DESC`,
    [createdBy],
  );
  return rows;
};

exports.getCustomerById = async (id) => {
  const [rows] = await db.promise().query(
    `SELECT c.*, camp.campaign_name
     FROM crm_customers c
     LEFT JOIN crm_campaigns camp ON c.campaign_id = camp.id
     WHERE c.id = ?`,
    [id],
  );
  return rows[0];
};

exports.countCustomers = async (createdBy = null) => {
  const query = createdBy
    ? "SELECT COUNT(*) AS total FROM crm_customers WHERE created_by = ?"
    : "SELECT COUNT(*) AS total FROM crm_customers";
  const params = createdBy ? [createdBy] : [];
  const [rows] = await db.promise().query(query, params);
  return rows[0].total;
};

exports.createCustomer = async (data) => {
  const [result] = await db.promise().query(
    `INSERT INTO crm_customers
      (customer_name, campaign_id, customer_address, customer_country, customer_industry,
       contact_first_name, contact_last_name, contact_title, contact_email, contact_phone,
       customer_status, remarks, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Prospect', ?, ?)`,
    [
      data.customerName,
      data.campaignId || null, // now expects a number (1, 2, 3) or null
      data.customerAddress,
      data.customerCountry,
      data.customerIndustry,
      data.contactFirstName,
      data.contactLastName,
      data.contactTitle,
      data.contactEmail,
      data.contactPhone,
      data.remarks || null,
      data.createdBy,
    ],
  );
  return result.insertId;
};

exports.updateCustomer = async (id, fields) => {
  const allowed = [
    "customer_name",
    "campaign_id", // now stores numeric id
    "customer_address",
    "customer_country",
    "customer_industry",
    "contact_first_name",
    "contact_last_name",
    "contact_title",
    "contact_email",
    "contact_phone",
    "customer_status",
    "remarks",
  ];
  const keys = Object.keys(fields).filter((k) => allowed.includes(k));
  if (keys.length === 0) return;

  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const values = keys.map((k) => fields[k]);

  await db
    .promise()
    .query(
      `UPDATE crm_customers SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      [...values, id],
    );
};

// DELETE customer by numeric id
exports.deleteCustomer = async (id) => {
  cconst[result] = await db
    .promise()
    .query("DELETE FROM crm_customers WHERE id = ?", [id]);

  return result.affectedRows;
};

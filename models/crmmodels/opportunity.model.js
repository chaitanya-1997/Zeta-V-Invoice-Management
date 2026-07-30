const db = require("../../config/db");

// owner_name / stage_name joins removed — opportunity_owner and sales_stage
// are now plain text columns stored directly on crm_opportunities.
const BASE_SELECT = `
  SELECT o.*, cust.customer_name, camp.campaign_name
  FROM crm_opportunities o
  LEFT JOIN crm_customers cust ON o.customer_id = cust.id
  LEFT JOIN crm_campaigns camp ON o.campaign_id = camp.id
`;

exports.getAllOpportunities = async () => {
  const [rows] = await db.promise().query(
    `${BASE_SELECT} ORDER BY o.created_at DESC`
  );
  return rows;
};

exports.getOpportunitiesBySalesPerson = async (createdBy) => {
  const [rows] = await db.promise().query(
    `${BASE_SELECT} WHERE o.created_by = ? ORDER BY o.created_at DESC`,
    [createdBy]
  );
  return rows;
};

exports.getOpportunityById = async (id) => {
  const [rows] = await db.promise().query(
    `${BASE_SELECT} WHERE o.id = ?`,
    [id]
  );
  return rows[0];
};


// (still available if needed)
exports.getOpportunityByCode = async (opportunityCode) => {
  const [rows] = await db.promise().query(
    `${BASE_SELECT} WHERE o.opportunity_code = ?`,
    [opportunityCode],
  );
  return rows[0];
};

exports.getOpportunitiesByStage = async (stageName, createdBy = null) => {
  let query = `${BASE_SELECT} WHERE o.sales_stage = ?`;
  const params = [stageName];

  if (createdBy) {
    query += " AND o.created_by = ?";
    params.push(createdBy);
  }

  const [rows] = await db.promise().query(query, params);
  return rows;
};

exports.countOpportunities = async (createdBy = null) => {
  const query = createdBy
    ? "SELECT COUNT(*) AS total FROM crm_opportunities WHERE created_by = ?"
    : "SELECT COUNT(*) AS total FROM crm_opportunities";

  const params = createdBy ? [createdBy] : [];

  const [rows] = await db.promise().query(query, params);
  return rows[0].total;
};


// "Closed WON" is now identified by stage NAME, not id 9
exports.sumClosedWonThisYear = async (createdBy = null) => {
  let query = `
    SELECT COALESCE(SUM(oppty_value), 0) AS total
    FROM crm_opportunities
    WHERE sales_stage = 'Closed - WIN'
      AND YEAR(last_update_date) = YEAR(CURDATE())
  `;

  const params = [];

  if (createdBy) {
    query += " AND created_by = ?";
    params.push(createdBy);
  }

  const [rows] = await db.promise().query(query, params);
  return rows[0].total;
};

exports.getLastOpportunityCode = async (prefix) => {
  const [rows] = await db.promise().query(
    `SELECT opportunity_code FROM crm_opportunities
     WHERE opportunity_code LIKE ?
     ORDER BY opportunity_code DESC LIMIT 1`,
    [`${prefix}%`]
  );

  return rows[0]?.opportunity_code || null;
};



exports.createOpportunity = async (data) => {
  const [result] = await db.promise().query(
    `INSERT INTO crm_opportunities
      (opportunity_code, opportunity_name, opportunity_type, opportunity_owner, customer_id,
       campaign_id, sales_stage, start_date, exp_end_date, last_update_date, oppty_currency,
       oppty_value, description, remarks, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?)`,
    [
      data.opportunityCode,
      data.opportunityName,
      data.opportunityType || null,
      data.opportunityOwner || null,
      data.customerId,
      data.campaignId || null,
      data.salesStage || "Prospect",
      data.startDate,
      data.expEndDate,
      data.opptyCurrency,
      data.opptyValue,
      data.description || null,
      data.remarks || null,
      data.createdBy,
    ]
  );
  return result.insertId;
};

exports.updateOpportunity = async (id, fields) => {
  const allowed = [
    "opportunity_name",
    "opportunity_type",
    "opportunity_owner",
    "customer_id",
    "campaign_id",
    "sales_stage",
    "exp_end_date",
    "oppty_currency",
    "oppty_value",
    "description",
    "remarks",
  ];

  const keys = Object.keys(fields).filter((k) => allowed.includes(k));
  if (keys.length === 0) return;

  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const values = keys.map((k) => fields[k]);

  await db.promise().query(
    `UPDATE crm_opportunities SET ${setClause}, last_update_date = CURDATE(), updated_at = NOW() WHERE id = ?`,
    [...values, id]
  );
};

exports.deleteOpportunity = async (id) => {
  const [result] = await db.promise().query(
    "DELETE FROM crm_opportunities WHERE id = ?",
    [id]
  );

  return result.affectedRows;
};
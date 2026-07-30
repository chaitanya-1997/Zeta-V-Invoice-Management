const db = require("../../../config/db");

// GET /api/reports/marketing
exports.marketingReport = async (req, res, next) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM crm_campaigns ORDER BY campaign_start_date DESC",
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/marketing-outreach
exports.marketingOutreachReport = async (req, res, next) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT camp.campaign_id, cust.customer_name, cust.customer_industry, cust.customer_status
      FROM crm_customers cust
      JOIN crm_campaigns camp ON cust.campaign_id = camp.campaign_id
      ORDER BY camp.campaign_id
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/opportunities
exports.opportunityReport = async (req, res, next) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT o.*, cust.customer_name, s.stage_name
      FROM crm_opportunities o
      LEFT JOIN crm_customers cust ON o.customer_id = cust.id
      LEFT JOIN crm_sales_stages s ON o.sales_stage = s.stage_id
      WHERE o.sales_stage BETWEEN 0 AND 8
      ORDER BY o.sales_stage
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/closed
exports.closedReport = async (req, res, next) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT o.*, cust.customer_name, s.stage_name
      FROM crm_opportunities o
      LEFT JOIN crm_customers cust ON o.customer_id = cust.id
      LEFT JOIN crm_sales_stages s ON o.sales_stage = s.stage_id
      WHERE o.sales_stage > 8
      ORDER BY o.sales_stage
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/customers
exports.customerReport = async (req, res, next) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM crm_customers ORDER BY created_at DESC",
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
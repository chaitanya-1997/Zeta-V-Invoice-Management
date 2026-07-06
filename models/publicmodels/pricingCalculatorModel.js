// models/pricingCalculatorModel.js
const db = require("../../config/db");

const createSubmission = (data, callback) => {
  const sql = `
    INSERT INTO pricing_calculator_submissions (
      full_name, work_email, phone, company, notes,
      transaction_volume, catch_up_work, accounts, add_ons, 
      frequency, entity_type, sector, total_price, price_display,
      ip_address, user_agent, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      data.full_name,
      data.work_email,
      data.phone || null,
      data.company || null,
      data.notes || null,
      data.transaction_volume || null,
      data.catch_up_work || null,
      data.accounts || null,
      data.add_ons || null,
      data.frequency || null,
      data.entity_type || null,
      data.sector || null,
      data.total_price || null,
      data.price_display || null,
      data.ip_address || null,
      data.user_agent || null,
      'new'
    ],
    callback
  );
};



const createSubmissionDigital = (data, callback) => {
  const sql = `
    INSERT INTO quote_requests (
      full_name, email, phone,
      plan_id, plan_name, base_price,
      extra_pages_qty, extra_pages_cost,
      extra_emails_qty, extra_emails_cost,
      seo_requested, integration_requested, social_requested,
      total_amount, ip_address, user_agent, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      data.full_name,
      data.email,
      data.phone || null,
      data.plan_id,
      data.plan_name,
      data.base_price,
      data.extra_pages_qty || 0,
      data.extra_pages_cost || 0,
      data.extra_emails_qty || 0,
      data.extra_emails_cost || 0,
      data.seo_requested ? 1 : 0,
      data.integration_requested ? 1 : 0,
      data.social_requested ? 1 : 0,
      data.total_amount,
      data.ip_address || null,
      data.user_agent || null,
      "new",
    ],
    callback
  );
};






module.exports = { createSubmission ,createSubmissionDigital};
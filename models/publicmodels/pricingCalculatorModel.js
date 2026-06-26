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

module.exports = { createSubmission };
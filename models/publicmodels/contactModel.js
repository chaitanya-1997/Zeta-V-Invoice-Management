const db = require("../../config/db");

// Create contact inquiry
const createContact = (data, callback) => {
  const sql = `
    INSERT INTO contact_us (
      name, work_email, company, phone, service_interest, message, 
      ip_address, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      data.name,
      data.work_email,
      data.company || null,
      data.phone || null,
      data.service_interest || null,
      data.message,
      data.ip_address || null,
      data.user_agent || null,
    ],
    callback
  );
};


const createEnquiries = (data, callback) => {
  const sql = `
    INSERT INTO contact_enquiries (
      full_name, work_email, company, phone, subject, message, 
      ip_address, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      data.full_name,
      data.work_email,
      data.company || null,
      data.phone || null,
      data.subject || null,
      data.message,
      data.ip_address || null,
      data.user_agent || null,
    ],
    callback
  );
};

module.exports = {
  createContact,
  createEnquiries
};


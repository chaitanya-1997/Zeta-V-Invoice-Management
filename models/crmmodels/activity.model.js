const db = require("../../config/db");

// Call this whenever a campaign/customer/opportunity is created or its
// status changes, so the Dashboard "Recent Activity" table has data.
exports.logActivity = async ({ recordType, recordName, recordRef, status, createdBy }) => {
  await db.promise().query(
  `INSERT INTO crm_activity_log
   (record_type, record_name, record_ref, status, created_by)
   VALUES (?, ?, ?, ?, ?)`,
  [recordType, recordName, recordRef || null, status, createdBy || null]
);
};

// GET latest N activity rows for the dashboard feed
exports.getRecentActivity = async (limit = 10) => {
  const safeLimit = Number.isInteger(limit) ? limit : 10;
  const [rows] = await db.promise().query(
  `SELECT record_type, record_name, record_ref, status, activity_date
   FROM crm_activity_log
   ORDER BY activity_date DESC
   LIMIT ${safeLimit}`
);
  return rows;
};

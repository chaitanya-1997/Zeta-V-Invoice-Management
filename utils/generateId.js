const db = require("../config/db");
const opportunityModel = require("../models/crmmodels/opportunity.model");

// Generates campaign IDs like MKTG-2026-001, MKTG-2026-002 ...
exports.generateCampaignId = async () => {
  const year = new Date().getFullYear();
  const prefix = `MKTG-${year}-`;

 const [rows] = await db.promise().query(
  `SELECT campaign_id FROM crm_campaigns
   WHERE campaign_id LIKE ?
   ORDER BY campaign_id DESC LIMIT 1`,
  [`${prefix}%`],
);

  let nextNumber = 1;
  if (rows.length > 0) {
    const lastId = rows[0].campaign_id; // e.g. MKTG-2026-007
    const lastNumber = parseInt(lastId.split("-")[2], 10);
    nextNumber = lastNumber + 1;
  }

  const padded = String(nextNumber).padStart(3, "0");
  return `${prefix}${padded}`; // MKTG-2026-001
};

// Generates opportunity IDs like OPP-2026-001, OPP-2026-002 ...
// Kept in a separate namespace from campaign IDs to avoid collisions.
exports.generateOpportunityCode = async () => {
  const year = new Date().getFullYear();
  const prefix = `OPP-${year}-`;

  const lastCode = await opportunityModel.getLastOpportunityCode(prefix);

  let nextNumber = 1;
  if (lastCode) {
    const lastNumber = parseInt(lastCode.split("-")[2], 10);
    nextNumber = lastNumber + 1;
  }

  const padded = String(nextNumber).padStart(3, "0");
  return `${prefix}${padded}`; // OPP-2026-001
};

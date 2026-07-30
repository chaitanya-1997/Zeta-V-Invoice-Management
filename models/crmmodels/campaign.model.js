const db = require("../../config/db");

// GET all campaigns
exports.getAllCampaigns = async () => {
  const [rows] = await db.promise().query(
    "SELECT * FROM crm_campaigns ORDER BY campaign_start_date DESC"
  );
  return rows;
};

// GET campaign by numeric id
exports.getCampaignById = async (id) => {
  const [rows] = await db.promise().query(
    "SELECT * FROM crm_campaigns WHERE id = ?",
    [id]
  );
  return rows[0];
};

// COUNT active campaigns
exports.countActiveCampaigns = async () => {
  const [rows] = await db.promise().query(
    "SELECT COUNT(*) AS total FROM crm_campaigns WHERE campaign_status = 'Active'"
  );
  return rows[0].total;
};


// CREATE new campaign
exports.createCampaign = async ({
  campaignId,
  campaignName,
  campaignType,
  campaignStatus,
  budget,
  startDate,
  endDate,
  description,
  createdBy,
}) => {
  const [result] = await db.promise().query(
    `INSERT INTO crm_campaigns
      (campaign_id, campaign_name, campaign_status, campaign_start_date, campaign_end_date,
       campaign_type, budget, description, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      campaignId,
      campaignName,
      campaignStatus || "Active",
      startDate,
      endDate || null,
      campaignType,
      budget,
      description || null,
      createdBy,
    ]
  );
  return { campaignId, insertId: result.insertId };
};

// UPDATE campaign by numeric id
exports.updateCampaign = async (id, fields) => {
  const allowed = [
    "campaign_name",
    "campaign_status",
    "campaign_start_date",
    "campaign_end_date",
    "campaign_type",
    "budget",
    "description",
  ];

  const keys = Object.keys(fields).filter((k) => allowed.includes(k));
  if (keys.length === 0) return;

  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const values = keys.map((k) => fields[k]);

  await db.promise().query(
    `UPDATE crm_campaigns SET ${setClause}, updated_at = NOW() WHERE id = ?`,
    [...values, id]
  );
};

// DELETE campaign by numeric id
exports.deleteCampaign = async (id) => {
  const [result] = await db.promise().query(
    "DELETE FROM crm_campaigns WHERE id = ?",
    [id]
  );
  return result.affectedRows;
};
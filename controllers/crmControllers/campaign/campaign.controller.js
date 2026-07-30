const campaignModel = require("../../../models/crmmodels/campaign.model");
const activityModel = require("../../../models/crmmodels/activity.model");
const { generateCampaignId } = require("../../../utils/generateId");

// GET /api/campaigns
exports.getAllCampaigns = async (req, res, next) => {
  try {
    const campaigns = await campaignModel.getAllCampaigns();
    res.json(campaigns);
  } catch (err) {
    next(err);
  }
};

// GET /api/campaigns/:id (numeric: 1, 2, 3...)
exports.getCampaignById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }
    const campaign = await campaignModel.getCampaignById(id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.json(campaign);
  } catch (err) {
    next(err);
  }
};

// POST /api/campaigns
exports.createCampaign = async (req, res, next) => {
  try {
    const {
      campaignName,
      campaignType,
      campaignStatus,
      budget,
      startDate,
      endDate,
      description,
    } = req.body;

    // Validations
    if (!campaignName || campaignName.length > 25) {
      return res.status(400).json({ message: "Campaign name is required (max 25 chars)" });
    }
    if (!campaignType || !["Inbound", "Outbound"].includes(campaignType)) {
      return res.status(400).json({ message: "Campaign type must be 'Inbound' or 'Outbound'" });
    }
    if (campaignStatus && !["Active", "Draft", "Paused", "Completed"].includes(campaignStatus)) {
      return res.status(400).json({ message: "Invalid campaign status" });
    }
    if (budget === undefined || String(budget).replace(".", "").length > 6) {
      return res.status(400).json({ message: "Budget must be numeric, up to 6 digits" });
    }
    if (!startDate) {
      return res.status(400).json({ message: "Start date is required" });
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      return res.status(400).json({ message: "End date must be a valid date" });
    }

    const campaignId = await generateCampaignId();

    await campaignModel.createCampaign({
      campaignId,
      campaignName,
      campaignType,
      campaignStatus: campaignStatus || "Active",
      budget,
      startDate,
      endDate,
      description,
      createdBy: req.user.id,
    });

    // Log activity
    await activityModel.logActivity({
      recordType: "Campaign",
      recordName: campaignName,
      recordRef: campaignId,
      status: campaignStatus || "Active",
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Campaign created", campaignId });
  } catch (err) {
    next(err);
  }
};

// PUT /api/campaigns/:id (UPDATED: now logs activity)
exports.updateCampaign = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    // Build the fields object from request body
    const fields = {};
    const map = {
      campaignName: "campaign_name",
      campaignStatus: "campaign_status",
      campaignStartDate: "campaign_start_date",
      campaignEndDate: "campaign_end_date",
      campaignType: "campaign_type",
      budget: "budget",
      description: "description",
    };
    Object.keys(map).forEach((k) => {
      if (req.body[k] !== undefined) fields[map[k]] = req.body[k];
    });

    // Validate status if provided
    if (fields.campaign_status && !["Active", "Draft", "Paused", "Completed","Closed"].includes(fields.campaign_status)) {
      return res.status(400).json({ message: "Invalid campaign status" });
    }
    if (fields.campaign_type && !["Inbound", "Outbound"].includes(fields.campaign_type)) {
      return res.status(400).json({ message: "Invalid campaign type" });
    }

    // --- IMPORTANT: Fetch existing campaign BEFORE update (for logging) ---
    const existing = await campaignModel.getCampaignById(id);
    if (!existing) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Perform the update
    await campaignModel.updateCampaign(id, fields);

    // --- Log activity (NEW) ---
    // Use the new status if provided, otherwise log as "Updated"
    const logStatus = fields.campaign_status || "Updated";

    await activityModel.logActivity({
      recordType: "Campaign",
      recordName: existing.campaign_name,  // logs the name at the time of update
      recordRef: existing.campaign_id,
      status: logStatus,
      createdBy: req.user.id,
    });

    res.json({ message: "Campaign updated" });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/campaigns/:id
exports.deleteCampaign = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    // Fetch campaign details BEFORE deleting (for activity log)
    const campaign = await campaignModel.getCampaignById(id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Delete the campaign
    const affectedRows = await campaignModel.deleteCampaign(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Log activity
    await activityModel.logActivity({
      recordType: "Campaign",
      recordName: campaign.campaign_name,
      recordRef: campaign.campaign_id,
      status: "Deleted",
      createdBy: req.user.id,
    });

    res.json({ message: "Campaign deleted successfully" });
  } catch (err) {
    next(err);
  }
};
const opportunityModel = require("../../../models/crmmodels/opportunity.model");
const activityModel = require("../../../models/crmmodels/activity.model");
const { generateOpportunityCode } = require("../../../utils/generateId");

const VALID_TYPES = ["Development", "Support & Maintenance", "Research", "Prod Implementation", "Staff Augmentation"];
const VALID_STAGES = [
  "Suspect",
  "Prospect",
  "RFI In Progress",
  "RFI Submitted",
  "RFP In Progress",
  "RFP Submitted",
  "Shortlisted",
  "Selected",
  "Contract Negotiation",
  "Closed - WIN",
  "Closed - Lost",
  "Closed - Shelved/Scrapped",
];

// GET /api/opportunities
exports.getAllOpportunities = async (req, res, next) => {
  try {
    const opportunities =
      req.user.role === "sales"
        ? await opportunityModel.getOpportunitiesBySalesPerson(req.user.id)
        : await opportunityModel.getAllOpportunities();
    res.json(opportunities);
  } catch (err) {
    next(err);
  }
};

// GET /api/opportunities/:id (numeric)
exports.getOpportunityById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid opportunity ID" });
    }
    const opportunity = await opportunityModel.getOpportunityById(id);
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }
    res.json(opportunity);
  } catch (err) {
    next(err);
  }
};

// POST /api/opportunities
exports.createOpportunity = async (req, res, next) => {
  try {
    const {
      opportunityName,
      opportunityType,
      opportunityOwner,
      customerId,
      campaignId,  // Now receiving campaignId
      salesStage,
      startDate,
      expEndDate,
      opptyCurrency,
      opptyValue,
      description,
      remarks,
    } = req.body;

    // Validations
    if (!opportunityName || opportunityName.length > 50) {
      return res.status(400).json({ message: "Opportunity name required (max 50 chars)" });
    }
    if (!opptyCurrency || opptyValue === undefined) {
      return res.status(400).json({ message: "opptyCurrency and opptyValue are required" });
    }
    if (!customerId) {
      return res.status(400).json({ message: "customerId is required" });
    }
    if (opportunityType && !VALID_TYPES.includes(opportunityType)) {
      return res.status(400).json({
        message: `opportunityType must be one of: ${VALID_TYPES.join(", ")}`,
      });
    }
    if (salesStage && !VALID_STAGES.includes(salesStage)) {
      return res.status(400).json({
        message: `salesStage must be one of: ${VALID_STAGES.join(", ")}`,
      });
    }
    
    // Validate campaignId if provided
    if (campaignId !== undefined && campaignId !== null) {
      const campaignIdNum = parseInt(campaignId);
      if (isNaN(campaignIdNum)) {
        return res.status(400).json({ message: "campaignId must be a number or null" });
      }
    }

    const opportunityCode = await generateOpportunityCode();

    const id = await opportunityModel.createOpportunity({
      opportunityCode,
      opportunityName,
      opportunityType,
      opportunityOwner,
      customerId,
      campaignId: campaignId || null,  // Store campaign ID
      salesStage,
      startDate: startDate || new Date().toISOString().slice(0, 10),
      expEndDate,
      opptyCurrency,
      opptyValue,
      description,
      remarks,
      createdBy: req.user.id,
    });

    await activityModel.logActivity({
      recordType: "Opportunity",
      recordName: opportunityName,
      recordRef: opportunityCode,
      status: salesStage || "Prospect",
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Opportunity created", id, opportunityCode });
  } catch (err) {
    next(err);
  }
};

// PUT /api/opportunities/:id
exports.updateOpportunity = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid opportunity ID" });
    }

    const { opportunityType, salesStage, campaignId } = req.body;
    
    // Validate opportunity type
    if (opportunityType && !VALID_TYPES.includes(opportunityType)) {
      return res.status(400).json({
        message: `opportunityType must be one of: ${VALID_TYPES.join(", ")}`,
      });
    }
    
    // Validate sales stage
    if (salesStage && !VALID_STAGES.includes(salesStage)) {
      return res.status(400).json({
        message: `salesStage must be one of: ${VALID_STAGES.join(", ")}`,
      });
    }
    
    // Validate campaignId if provided
    if (campaignId !== undefined && campaignId !== null) {
      const campaignIdNum = parseInt(campaignId);
      if (isNaN(campaignIdNum)) {
        return res.status(400).json({ message: "campaignId must be a number or null" });
      }
    }

    const fields = {};
    const map = {
      opportunityName: "opportunity_name",
      opportunityType: "opportunity_type",
      opportunityOwner: "opportunity_owner",
      customerId: "customer_id",
      campaignId: "campaign_id",  // Added campaignId mapping
      salesStage: "sales_stage",
      expEndDate: "exp_end_date",
      opptyCurrency: "oppty_currency",
      opptyValue: "oppty_value",
      description: "description",
      remarks: "remarks",
    };
    Object.keys(map).forEach((k) => {
      if (req.body[k] !== undefined) fields[map[k]] = req.body[k];
    });

    const existing = await opportunityModel.getOpportunityById(id);
    if (!existing) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    await opportunityModel.updateOpportunity(id, fields);

    const status = fields.sales_stage || "Updated";

    await activityModel.logActivity({
      recordType: "Opportunity",
      recordName: existing.opportunity_name,
      recordRef: existing.opportunity_code,
      status,
      createdBy: req.user.id,
    });

    res.json({ message: "Opportunity updated" });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/opportunities/:id
exports.deleteOpportunity = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid opportunity ID" });
    }

    const opportunity = await opportunityModel.getOpportunityById(id);
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    const affectedRows = await opportunityModel.deleteOpportunity(id);
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    await activityModel.logActivity({
      recordType: "Opportunity",
      recordName: opportunity.opportunity_name,
      recordRef: opportunity.opportunity_code,
      status: "Deleted",
      createdBy: req.user.id,
    });

    res.json({ message: "Opportunity deleted successfully" });
  } catch (err) {
    next(err);
  }
};
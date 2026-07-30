const campaignModel = require("../../../models/crmmodels/campaign.model");
const customerModel = require("../../../models/crmmodels/customer.model");
const opportunityModel = require("../../../models/crmmodels/opportunity.model");
const activityModel = require("../../../models/crmmodels/activity.model");

// GET /api/dashboard
// Matches Home Page cards: Active Campaigns, Total Customers,
// Open Opportunities, Closed-Won Value + Recent Activity table.
// If the logged-in user is "sales", figures are scoped to that person only (per BRD).
exports.getDashboard = async (req, res, next) => {
  try {
    const isSales = req.user.role === "sales";
    const scopeId = isSales ? req.user.id : null;

    const [activeCampaigns, totalCustomers, openOpportunities, closedWonValue, recentActivity] =
      await Promise.all([
        campaignModel.countActiveCampaigns(), // campaigns aren't per-salesperson in BRD
        customerModel.countCustomers(scopeId),
        opportunityModel.countOpportunities(scopeId),
        opportunityModel.sumClosedWonThisYear(scopeId),
        activityModel.getRecentActivity(10),
      ]);

    res.json({
      activeCampaigns,
      totalCustomers,
      openOpportunities,
      closedWonValue,
      recentActivity,
    });
  } catch (err) {
    next(err);
  }
};

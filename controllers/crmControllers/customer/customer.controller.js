const customerModel = require("../../../models/crmmodels/customer.model");
const activityModel = require("../../../models/crmmodels/activity.model");

// GET /api/customers
exports.getAllCustomers = async (req, res, next) => {
  try {
    const customers =
      req.user.role === "sales"
        ? await customerModel.getCustomersBySalesPerson(req.user.id)
        : await customerModel.getAllCustomers();
    res.json(customers);
  } catch (err) {
    next(err);
  }
};

// GET /api/customers/:id
exports.getCustomerById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }
    const customer = await customerModel.getCustomerById(id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    next(err);
  }
};

// POST /api/customers
exports.createCustomer = async (req, res, next) => {
  try {
    const {
      customerName,
      campaignId,        // now expects a number (1, 2, 3) or null
      customerAddress,
      customerCountry,
      customerIndustry,
      contactFirstName,
      contactLastName,
      contactTitle,
      contactEmail,
      contactPhone,
      remarks,
    } = req.body;

    if (!customerName || !customerCountry || !customerIndustry) {
      return res.status(400).json({
        message: "customerName, customerCountry and customerIndustry are required",
      });
    }

    // Validate campaignId if provided (must be a number)
    if (campaignId !== undefined && campaignId !== null) {
      const campaignIdNum = parseInt(campaignId);
      if (isNaN(campaignIdNum)) {
        return res.status(400).json({ message: "campaignId must be a number or null" });
      }
    }

    const id = await customerModel.createCustomer({
      customerName,
      campaignId: campaignId || null,
      customerAddress,
      customerCountry,
      customerIndustry,
      contactFirstName,
      contactLastName,
      contactTitle,
      contactEmail,
      contactPhone,
      remarks,
      createdBy: req.user.id,
    });

    await activityModel.logActivity({
      recordType: "Customer",
      recordName: customerName,
      recordRef: String(id),
      status: "Prospect",
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Customer created", id });
  } catch (err) {
    next(err);
  }
};

// PUT /api/customers/:id
exports.updateCustomer = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    // Build fields from request body
    const fields = {};
    const map = {
      customerName: "customer_name",
      campaignId: "campaign_id",        // now stores numeric id
      customerAddress: "customer_address",
      customerCountry: "customer_country",
      customerIndustry: "customer_industry",
      contactFirstName: "contact_first_name",
      contactLastName: "contact_last_name",
      contactTitle: "contact_title",
      contactEmail: "contact_email",
      contactPhone: "contact_phone",
      customerStatus: "customer_status",
      remarks: "remarks",
    };
    Object.keys(map).forEach((k) => {
      if (req.body[k] !== undefined) fields[map[k]] = req.body[k];
    });

    // Validate campaignId if provided (must be a number or null)
    if (fields.campaign_id !== undefined && fields.campaign_id !== null) {
      const campaignIdNum = parseInt(fields.campaign_id);
      if (isNaN(campaignIdNum)) {
        return res.status(400).json({ message: "campaignId must be a number or null" });
      }
    }

    // Fetch existing customer BEFORE update (for logging)
    const existing = await customerModel.getCustomerById(id);
    if (!existing) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Perform update
    await customerModel.updateCustomer(id, fields);

    // Log activity
    const logStatus = fields.customer_status || "Updated";

    await activityModel.logActivity({
      recordType: "Customer",
      recordName: existing.customer_name,
      recordRef: String(existing.id),
      status: logStatus,
      createdBy: req.user.id,
    });

    res.json({ message: "Customer updated" });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/customers/:id
exports.deleteCustomer = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    // Fetch customer details BEFORE deleting (for activity log)
    const customer = await customerModel.getCustomerById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Delete the customer
    const affectedRows = await customerModel.deleteCustomer(id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Log activity
    await activityModel.logActivity({
      recordType: "Customer",
      recordName: customer.customer_name,
      recordRef: String(customer.id),
      status: "Deleted",
      createdBy: req.user.id,
    });

    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    next(err);
  }
};
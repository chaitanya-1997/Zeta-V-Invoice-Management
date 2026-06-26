// controllers/pricingCalculatorController.js
const pricingModel = require("../../models/publicmodels/pricingCalculatorModel");

exports.submitPricing = async (req, res) => {
  try {
    const {
      full_name,
      work_email,
      phone,
      company,
      notes,
      transaction_volume,
      catch_up_work,
      accounts,
      add_ons,
      frequency,
      entity_type,
      sector,
      total_price,
      price_display
    } = req.body;

    // ─── VALIDATION ───
    if (!full_name || !work_email) {
      return res.status(400).json({
        success: false,
        message: "Full name and email are required."
      });
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(work_email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format."
      });
    }

    // ─── GET IP AND USER AGENT ───
    const ipAddress = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const submissionData = {
      full_name: full_name.trim(),
      work_email: work_email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      company: company?.trim() || null,
      notes: notes?.trim() || null,
      transaction_volume: transaction_volume || null,
      catch_up_work: catch_up_work || null,
      accounts: accounts || null,
      add_ons: add_ons || null,
      frequency: frequency || null,
      entity_type: entity_type || null,
      sector: sector || null,
      total_price: total_price || null,
      price_display: price_display || null,
      ip_address: ipAddress,
      user_agent: userAgent
    };

    // ─── SAVE TO DATABASE ───
    pricingModel.createSubmission(submissionData, (err, result) => {
      if (err) {
        console.error("Pricing submission error:", err);
        return res.status(500).json({
          success: false,
          message: "Error submitting pricing request"
        });
      }

      return res.status(201).json({
        success: true,
        message: "Thank you! Your quote request has been submitted successfully.",
        submission_id: result.insertId
      });
    });
  } catch (error) {
    console.error("Pricing submission error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
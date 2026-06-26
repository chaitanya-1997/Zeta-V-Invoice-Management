const contactModel = require("../../models/publicmodels/contactModel");

// Submit contact form (Public - No authentication required)
exports.submitContact = async (req, res) => {
  try {
    const {
      name,
      work_email,
      company,
      phone,
      service_interest,
      message
    } = req.body;

    // Validation
    if (!name || !work_email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required."
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(work_email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format."
      });
    }

    // Validate message length
    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters."
      });
    }

    // Get IP address and user agent
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const contactData = {
      name: name.trim(),
      work_email: work_email.trim().toLowerCase(),
      company: company?.trim() || null,
      phone: phone?.trim() || null,
      service_interest: service_interest || null,
      message: message.trim(),
      ip_address: ipAddress,
      user_agent: userAgent
    };

    contactModel.createContact(contactData, (err, result) => {
      if (err) {
        console.error("Contact submission error:", err);
        return res.status(500).json({
          success: false,
          message: "Error submitting contact form",
          error: err.message
        });
      }

      return res.status(201).json({
        success: true,
        message: "Thank you for contacting us! Our team will get back to you soon.",
        contact_id: result.insertId
      });
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

exports.submitEnquiries = async (req, res) => {
  try {
    const {
      full_name,
      work_email,
      company,
      phone,
      subject,
      message
    } = req.body;

    // ─── VALIDATION ───
    if (!full_name || !work_email || !message) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and message are required."
      });
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(work_email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format."
      });
    }

    // Validate message length
    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters."
      });
    }

    // ─── GET IP AND USER AGENT ───
    const ipAddress = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const contactData = {
      full_name: full_name.trim(),
      work_email: work_email.trim().toLowerCase(),
      company: company?.trim() || null,
      phone: phone?.trim() || null,
      subject: subject?.trim() || null,
      message: message.trim(),
      ip_address: ipAddress,
      user_agent: userAgent
    };

    // ─── SAVE TO DATABASE ───
    contactModel.createEnquiries(contactData, (err, result) => {
      if (err) {
        console.error("Contact submission error:", err);
        return res.status(500).json({
          success: false,
          message: "Error submitting contact form"
        });
      }

      return res.status(201).json({
        success: true,
        message: "Thank you for contacting us! Our team will get back to you soon.",
        enquiry_id: result.insertId
      });
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
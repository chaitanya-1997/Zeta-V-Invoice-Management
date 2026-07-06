// controllers/pricingCalculatorController.js
const pricingModel = require("../../models/publicmodels/pricingCalculatorModel");

const transporter = require("../../config/mailConfig");



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
      price_display,
    } = req.body;

    // Validation
    if (!full_name || !work_email) {
      return res.status(400).json({
        success: false,
        message: "Full name and email are required.",
      });
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(work_email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    // Get IP & Browser
    const ipAddress =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;

    const userAgent = req.headers["user-agent"];

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
      user_agent: userAgent,
    };

    pricingModel.createSubmission(submissionData, async (err, result) => {
      if (err) {
        console.error("Pricing submission error:", err);

        return res.status(500).json({
          success: false,
          message: "Error submitting pricing request",
        });
      }

      try {
        // ===========================
        // Customer Email
        // ===========================
        await transporter.sendMail({
          from: `"Zeta-V Technology" <${process.env.SMTP_USER}>`,
          to: work_email,
          subject: "Thank you for your interest in our Bookkeeping Services",

          html: `
            <p>Dear <strong>${full_name}</strong>,</p>

            <p>
              Thank you for your interest in our <strong>Bookkeeping Services</strong>.
              We have received your request and are allocating an expert from our side for your account.
            </p>

            <p>
              You will hear from us shortly.
              If you have a preferred time and communication method,
              simply reply to this email and share your preferences.
            </p>

           

            <p>Have a great day!</p>

          

            <p>
              Regards,<br>
              <strong>Zeta-V Technology</strong><br>
              Shared Services Division
            </p>
          `,
        });

        // ===========================
        // Admin Email
        // ===========================
        await transporter.sendMail({
          from: `"Website Enquiry" <${process.env.SMTP_USER}>`,
          to: "info@zeta-v.com",
          subject: `New Bookkeeping Enquiry - ${full_name}`,

          html: `
            <h2>New Bookkeeping Enquiry Received</h2>

            <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;font-family:Arial;">
                <tr>
                    <th align="left">Field</th>
                    <th align="left">Value</th>
                </tr>

                <tr>
                    <td><strong>Name</strong></td>
                    <td>${full_name}</td>
                </tr>

                <tr>
                    <td><strong>Email</strong></td>
                    <td>${work_email}</td>
                </tr>

                <tr>
                    <td><strong>Phone</strong></td>
                    <td>${phone || "-"}</td>
                </tr>

                <tr>
                    <td><strong>Company</strong></td>
                    <td>${company || "-"}</td>
                </tr>

                <tr>
                    <td><strong>Entity Type</strong></td>
                    <td>${entity_type || "-"}</td>
                </tr>

                <tr>
                    <td><strong>Sector</strong></td>
                    <td>${sector || "-"}</td>
                </tr>

                <tr>
                    <td><strong>Transaction Volume</strong></td>
                    <td>${transaction_volume || "-"}</td>
                </tr>

                <tr>
                    <td><strong>Accounts</strong></td>
                    <td>${accounts || "-"}</td>
                </tr>

                <tr>
                    <td><strong>Catch-up Work</strong></td>
                    <td>${catch_up_work || "-"}</td>
                </tr>

                <tr>
                    <td><strong>Add-ons</strong></td>
                    <td>${add_ons || "-"}</td>
                </tr>

                <tr>
                    <td><strong>Frequency</strong></td>
                    <td>${frequency || "-"}</td>
                </tr>

                <tr>
                    <td><strong>Estimated Price</strong></td>
                    <td>${price_display || "-"}</td>
                </tr>

                <tr>
                    <td><strong>Total Price</strong></td>
                    <td>${total_price || "-"}</td>
                </tr>

                <tr>
                    <td><strong>Notes</strong></td>
                    <td>${notes || "-"}</td>
                </tr>

            </table>

            <br>

            <p>Please contact the customer as soon as possible.</p>
          `,
        });

        console.log("Emails sent successfully.");
      } catch (mailError) {
        console.error("Email sending failed:", mailError);
      }

      return res.status(201).json({
        success: true,
        message: "Thank you! Your quote request has been submitted successfully.",
        submission_id: result.insertId,
      });
    });
  } catch (error) {
    console.error("Pricing submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const planMeta = {
  lite:         { name: "Lite",         base: 499  },
  standard:     { name: "Standard",     base: 999  },
  business:     { name: "Business",     base: 1999 },
  professional: { name: "Professional", base: 2999 },
};

const ADDON_RATES = {
  pages: 200,
  emails: 10,
};

exports.submitQuote = async (req, res) => {
  try {
    const { full_name, email, phone, plan_id, addons } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({
        success: false,
        message: "Full name and email are required.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    const plan = planMeta[plan_id];
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan selected.",
      });
    }

    const pagesQty = Number(addons?.pages) || 0;
    const emailsQty = Number(addons?.emails) || 0;
    const extraPagesCost = pagesQty * ADDON_RATES.pages;
    const extraEmailsCost = emailsQty * ADDON_RATES.emails;

    const seoRequested = ["business", "professional"].includes(plan_id);
    const integrationRequested = plan_id === "professional";
    const socialRequested = plan_id === "professional";

    const totalAmount = plan.base + extraPagesCost + extraEmailsCost;

    const ipAddress =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const submissionData = {
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      plan_id,
      plan_name: plan.name,
      base_price: plan.base,
      extra_pages_qty: pagesQty,
      extra_pages_cost: extraPagesCost,
      extra_emails_qty: emailsQty,
      extra_emails_cost: extraEmailsCost,
      seo_requested: seoRequested,
      integration_requested: integrationRequested,
      social_requested: socialRequested,
      total_amount: totalAmount,
      ip_address: ipAddress,
      user_agent: userAgent,
    };

    pricingModel.createSubmissionDigital(submissionData, async (err, result) => {
      if (err) {
        console.error("Quote submission error:", err);
        return res.status(500).json({
          success: false,
          message: "Error submitting quote request",
        });
      }

      try {
        // ===========================
        // Customer Email
        // ===========================
        await transporter.sendMail({
          from: `"Zeta-V Technology Solutions" <${process.env.SMTP_USER}>`,
          to: submissionData.email,
          subject: "Thank you for your inquiry regarding our Digital Footprint Services",
          html: `
            <p>Dear <strong>${submissionData.full_name}</strong>,</p>

            <p>
              Thank you for reaching out through our website and requesting information
              about our <strong>Digital Footprint Services</strong>. We appreciate your
              interest in managing and securing your online presence.
            </p>

            <p>
              A member of our team is currently reviewing your request and any specific
              details you provided. We will follow up with you within 24 hours to provide
              a comprehensive breakdown of how we can help you analyze, clean up, and
              monitor your digital footprint.
            </p>

            <p>
              In the meantime, please find below a self-generated draft quote based on the
              <strong>${plan.name}</strong> plan. If you have any urgent questions or
              additional details to share, please feel free to reply directly to this email.
            </p>

            <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;font-family:Arial;max-width:500px;">
              <tr><th align="left">Item</th><th align="left">Detail</th></tr>
              <tr><td>Plan</td><td>${plan.name}</td></tr>
              <tr><td>Base Price</td><td>$${plan.base.toFixed(2)} / month</td></tr>
              ${pagesQty > 0 ? `<tr><td>Extra Pages</td><td>${pagesQty} (+$${extraPagesCost.toFixed(2)})</td></tr>` : ""}
              ${emailsQty > 0 ? `<tr><td>Extra Email IDs</td><td>${emailsQty} (+$${extraEmailsCost.toFixed(2)})</td></tr>` : ""}
              ${seoRequested ? `<tr><td>SEO</td><td>Included – scope on request</td></tr>` : ""}
              ${integrationRequested ? `<tr><td>Integration</td><td>Included – scope on request</td></tr>` : ""}
              ${socialRequested ? `<tr><td>Social Media</td><td>Included – scope on request</td></tr>` : ""}
              <tr><td><strong>Estimated Monthly Total</strong></td><td><strong>$${totalAmount.toFixed(2)}</strong></td></tr>
            </table>

            <p>Thank you again for connecting with us!</p>

            <p>
              Best regards,<br>
              <strong>Zeta-V Technology Solutions</strong><br>
              Digital Footprint Division<br>
              <a href="https://www.zeta-v.com">www.zeta-v.com</a>
            </p>
          `,
        });

        // ===========================
        // Admin Email
        // ===========================
        await transporter.sendMail({
          from: `"Website Enquiry" <${process.env.SMTP_USER}>`,
          to: "info@zeta-v.com",
          subject: `New Digital Footprint Enquiry - ${submissionData.full_name}`,
          html: `
            <h2>New Digital Footprint Quote Request</h2>
            <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;font-family:Arial;">
                <tr><th align="left">Field</th><th align="left">Value</th></tr>
                <tr><td><strong>Name</strong></td><td>${submissionData.full_name}</td></tr>
                <tr><td><strong>Email</strong></td><td>${submissionData.email}</td></tr>
                <tr><td><strong>Phone</strong></td><td>${submissionData.phone || "-"}</td></tr>
                <tr><td><strong>Plan</strong></td><td>${plan.name}</td></tr>
                <tr><td><strong>Base Price</strong></td><td>$${plan.base}</td></tr>
                <tr><td><strong>Extra Pages</strong></td><td>${pagesQty} (+$${extraPagesCost})</td></tr>
                <tr><td><strong>Extra Emails</strong></td><td>${emailsQty} (+$${extraEmailsCost})</td></tr>
                <tr><td><strong>SEO Requested</strong></td><td>${seoRequested ? "Yes" : "-"}</td></tr>
                <tr><td><strong>Integration Requested</strong></td><td>${integrationRequested ? "Yes" : "-"}</td></tr>
                <tr><td><strong>Social Media Requested</strong></td><td>${socialRequested ? "Yes" : "-"}</td></tr>
                <tr><td><strong>Total Estimated Price</strong></td><td>$${totalAmount.toFixed(2)}</td></tr>
            </table>
            <br>
            <p>Please contact the customer as soon as possible.</p>
          `,
        });

        console.log("Emails sent successfully.");
      } catch (mailError) {
        console.error("Email sending failed:", mailError);
      }

      return res.status(201).json({
        success: true,
        message: "Thank you! Your quote request has been submitted successfully.",
        submission_id: result.insertId,
        total_amount: totalAmount,
      });
    });
  } catch (error) {
    console.error("Quote submission error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// controllers/pricingCalculatorController.js
const pricingModel = require("../../models/publicmodels/pricingCalculatorModel");

const transporter = require("../../config/mailConfig");


// exports.submitPricing = async (req, res) => {

//   try {
//     const {
//       full_name,
//       work_email,
//       phone,
//       company,
//       notes,
//       transaction_volume,
//       catch_up_work,
//       accounts,
//       add_ons,
//       frequency,
//       entity_type,
//       sector,
//       total_price,
//       price_display
//     } = req.body;

//     // ─── VALIDATION ───
//     if (!full_name || !work_email) {
//       return res.status(400).json({
//         success: false,
//         message: "Full name and email are required."
//       });
//     }

//     // Validate email
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(work_email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email format."
//       });
//     }

//     // ─── GET IP AND USER AGENT ───
//     const ipAddress = req.headers['x-forwarded-for'] || 
//                      req.connection.remoteAddress || 
//                      req.socket.remoteAddress;
//     const userAgent = req.headers['user-agent'];

//     const submissionData = {
//       full_name: full_name.trim(),
//       work_email: work_email.trim().toLowerCase(),
//       phone: phone?.trim() || null,
//       company: company?.trim() || null,
//       notes: notes?.trim() || null,
//       transaction_volume: transaction_volume || null,
//       catch_up_work: catch_up_work || null,
//       accounts: accounts || null,
//       add_ons: add_ons || null,
//       frequency: frequency || null,
//       entity_type: entity_type || null,
//       sector: sector || null,
//       total_price: total_price || null,
//       price_display: price_display || null,
//       ip_address: ipAddress,
//       user_agent: userAgent
//     };

//     // ─── SAVE TO DATABASE ───
//     pricingModel.createSubmission(submissionData, (err, result) => {
//       if (err) {
//         console.error("Pricing submission error:", err);
//         return res.status(500).json({
//           success: false,
//           message: "Error submitting pricing request"
//         });
//       }

//       return res.status(201).json({
//         success: true,
//         message: "Thank you! Your quote request has been submitted successfully.",
//         submission_id: result.insertId
//       });
//     });
//   } catch (error) {
//     console.error("Pricing submission error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// };



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
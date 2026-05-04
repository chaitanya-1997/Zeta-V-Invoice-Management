const db = require("../config/db");



exports.getCompanyProfile = async (req, res) => {
  try {

    const [rows] = await db.promise().query(
      "SELECT * FROM zv_company_profile WHERE id = 1"
    );

    const c = rows[0] || {};

    res.json({
      success: true,
      data: {
        companyName: c.company_name,
        tax_id: c.tax_id,
        email: c.email,
        phone: c.phone,
        website: c.website,

        street: c.street,
        city: c.city,
        state: c.state,
        zip: c.zip,
        country: c.country,

        currency: c.currency,
        logo_path: c.logo_path,
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.updateCompanyProfile = async (req, res) => {

  try {

    let body = req.body;

    const {
      companyName,
      tax_id,
      email,
      phone,
      website,
      street,
      city,
      state,
      zip,
      country,
      currency
    } = body;

    let logoPath = null;

    if (req.file) {
      logoPath = req.file.path;
    }

    // build dynamic query (important)
    let query = `
      UPDATE zv_company_profile SET
        company_name = ?,
        tax_id = ?,
        email = ?,
        phone = ?,
        website = ?,
        street = ?,
        city = ?,
        state = ?,
        zip = ?,
        country = ?,
        currency = ?
    `;

    const values = [
      companyName,
      tax_id,
      email,
      phone,
      website,
      street,
      city,
      state,
      zip,
      country,
      currency
    ];

    if (logoPath) {
      query += `, logo_path = ?`;
      values.push(logoPath);
    }

    query += ` WHERE id = 1`;

    await db.promise().query(query, values);

    res.json({
      success: true,
      message: "Company profile updated successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};







exports.getTaxSettings = async (req, res) => {

  try {

    const [rows] = await db.promise().query(
      "SELECT * FROM zv_tax_settings WHERE id = 1"
    );

    const t = rows[0];

    res.json({
      success: true,
      data: {
        taxNumber: t.tax_number,
        taxInclusive: !!t.tax_inclusive,
        showTaxOnInvoice: !!t.show_tax_on_invoice,
        compoundTax: !!t.compound_tax
      }
    });

  } catch (err) {

    res.status(500).json({
      success:false,
      message: err.message
    });

  }

};


exports.updateTaxSettings = async (req, res) => {

  try {

    const {
      taxNumber,
      taxInclusive,
      showTaxOnInvoice,
      compoundTax
    } = req.body;

    await db.promise().query(
      `UPDATE zv_tax_settings SET
        tax_number = ?,
        tax_inclusive = ?,
        show_tax_on_invoice = ?,
        compound_tax = ?
      WHERE id = 1`,
      [
        taxNumber || null,
        taxInclusive ? 1 : 0,
        showTaxOnInvoice ? 1 : 0,
        compoundTax ? 1 : 0
      ]
    );

    res.json({
      success: true,
      message: "Tax settings updated successfully"
    });

  } catch (err) {

    res.status(500).json({
      success:false,
      message: err.message
    });

  }

};




// exports.getPreferences = async (req, res) => {

//   try {

//     let [rows] = await db.promise().query(
//       "SELECT * FROM zv_preferences WHERE id = 1"
//     );

//     // 🔥 If not exists → create
//     if (rows.length === 0) {

//       await db.promise().query(
//         "INSERT INTO zv_preferences (id) VALUES (1)"
//       );

//       [rows] = await db.promise().query(
//         "SELECT * FROM zv_preferences WHERE id = 1"
//       );
//     }

//     const p = rows[0];

//     res.json({
//       success: true,
//       data: {
//         invoicePrefix: p.invoice_prefix,
//         invoiceStartNumber: p.invoice_start_number,
//         invoiceDueDays: p.invoice_due_days,
//         invoiceNotes: p.invoice_notes,
//         invoiceFooter: p.invoice_footer,

//         estimatePrefix: p.estimate_prefix,
//         estimateStartNumber: p.estimate_start_number,
//         estimateExpiryDays: p.estimate_expiry_days,

//         dateFormat: p.date_format,
//         numberFormat: p.number_format,
//         timezone: p.timezone,
//         language: p.language,

//         emailOnPayment: !!p.email_on_payment,
//         emailOnOverdue: !!p.email_on_overdue,
//         emailOnQuoteAccepted: !!p.email_on_quote_accepted,
//         sendPaymentReminder: !!p.send_payment_reminder,
//         reminderDaysBefore: p.reminder_days_before
//       }
//     });

//   } catch (err) {

//     res.status(500).json({
//       success: false,
//       message: err.message
//     });

//   }

// };



exports.getPreferences = async (req, res) => {
  try {

    // =========================
    // 1. GET PREFERENCES
    // =========================
    let [rows] = await db.promise().query(
      "SELECT * FROM zv_preferences WHERE id = 1"
    );

    if (rows.length === 0) {
      await db.promise().query(
        "INSERT INTO zv_preferences (id) VALUES (1)"
      );

      [rows] = await db.promise().query(
        "SELECT * FROM zv_preferences WHERE id = 1"
      );
    }

    const p = rows[0];

    // =========================
    // 2. GET INVOICE SEQUENCES
    // =========================
    const [seqRows] = await db.promise().query(
      "SELECT country_code, prefix, current_number FROM zv_invoice_sequences ORDER BY country_code"
    );

    res.json({
      success: true,
      data: {
        preferences: {
          invoicePrefix: p.invoice_prefix,
          invoiceStartNumber: p.invoice_start_number,
          invoiceDueDays: p.invoice_due_days,
          invoiceNotes: p.invoice_notes,
          invoiceFooter: p.invoice_footer,

          estimatePrefix: p.estimate_prefix,
          estimateStartNumber: p.estimate_start_number,
          estimateExpiryDays: p.estimate_expiry_days,

          dateFormat: p.date_format,
          numberFormat: p.number_format,
          timezone: p.timezone,
          language: p.language,

          emailOnPayment: !!p.email_on_payment,
          emailOnOverdue: !!p.email_on_overdue,
          emailOnQuoteAccepted: !!p.email_on_quote_accepted,
          sendPaymentReminder: !!p.send_payment_reminder,
          reminderDaysBefore: p.reminder_days_before
        },

        // 🔥 NEW
        invoiceSequences: seqRows
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



// exports.updatePreferences = async (req, res) => {


//   try {

//     const {
//       invoicePrefix,
//       invoiceStartNumber,
//       invoiceDueDays,
//       invoiceNotes,
//       invoiceFooter,

//       estimatePrefix,
//       estimateStartNumber,
//       estimateExpiryDays,

//       dateFormat,
//       numberFormat,
//       timezone,
//       language,

//       emailOnPayment,
//       emailOnOverdue,
//       emailOnQuoteAccepted,
//       sendPaymentReminder,
//       reminderDaysBefore
//     } = req.body;

//     await db.promise().query(
//       `UPDATE zv_preferences SET

//         invoice_prefix = ?,
//         invoice_start_number = ?,
//         invoice_due_days = ?,
//         invoice_notes = ?,
//         invoice_footer = ?,

//         estimate_prefix = ?,
//         estimate_start_number = ?,
//         estimate_expiry_days = ?,

//         date_format = ?,
//         number_format = ?,
//         timezone = ?,
//         language = ?,

//         email_on_payment = ?,
//         email_on_overdue = ?,
//         email_on_quote_accepted = ?,
//         send_payment_reminder = ?,
//         reminder_days_before = ?

//       WHERE id = 1`,
//       [
//         invoicePrefix,
//         invoiceStartNumber,
//         invoiceDueDays,
//         invoiceNotes,
//         invoiceFooter,

//         estimatePrefix,
//         estimateStartNumber,
//         estimateExpiryDays,

//         dateFormat,
//         numberFormat,
//         timezone,
//         language,

//         emailOnPayment ? 1 : 0,
//         emailOnOverdue ? 1 : 0,
//         emailOnQuoteAccepted ? 1 : 0,
//         sendPaymentReminder ? 1 : 0,
//         reminderDaysBefore
//       ]
//     );

//     res.json({
//       success: true,
//       message: "Preferences updated successfully"
//     });

//   } catch (err) {

//     res.status(500).json({
//       success: false,
//       message: err.message
//     });

//   }

// };



exports.updatePreferences = async (req, res) => {

  const conn = await db.promise().getConnection();

  try {

    await conn.beginTransaction();

    const {
      // preferences
      invoicePrefix,
      invoiceStartNumber,
      invoiceDueDays,
      invoiceNotes,
      invoiceFooter,

      estimatePrefix,
      estimateStartNumber,
      estimateExpiryDays,

      dateFormat,
      numberFormat,
      timezone,
      language,

      emailOnPayment,
      emailOnOverdue,
      emailOnQuoteAccepted,
      sendPaymentReminder,
      reminderDaysBefore,

      // 🔥 NEW
      invoiceSequences
    } = req.body;

    // =========================
    // 1. UPDATE PREFERENCES
    // =========================
    await conn.query(
      `UPDATE zv_preferences SET
        invoice_prefix = ?,
        invoice_start_number = ?,
        invoice_due_days = ?,
        invoice_notes = ?,
        invoice_footer = ?,

        estimate_prefix = ?,
        estimate_start_number = ?,
        estimate_expiry_days = ?,

        date_format = ?,
        number_format = ?,
        timezone = ?,
        language = ?,

        email_on_payment = ?,
        email_on_overdue = ?,
        email_on_quote_accepted = ?,
        send_payment_reminder = ?,
        reminder_days_before = ?

      WHERE id = 1`,
      [
        invoicePrefix,
        invoiceStartNumber,
        invoiceDueDays,
        invoiceNotes,
        invoiceFooter,

        estimatePrefix,
        estimateStartNumber,
        estimateExpiryDays,

        dateFormat,
        numberFormat,
        timezone,
        language,

        emailOnPayment ? 1 : 0,
        emailOnOverdue ? 1 : 0,
        emailOnQuoteAccepted ? 1 : 0,
        sendPaymentReminder ? 1 : 0,
        reminderDaysBefore
      ]
    );

    // =========================
    // 2. UPDATE SEQUENCES
    // =========================
    if (invoiceSequences && invoiceSequences.length > 0) {

      for (const seq of invoiceSequences) {

        const { country_code, prefix, current_number } = seq;

        // 🔥 SAFETY CHECK
        const [maxRow] = await conn.query(
          `SELECT MAX(
            CAST(SUBSTRING_INDEX(invoice_number, '-', -1) AS UNSIGNED)
          ) AS max_no
          FROM zv_invoices
          WHERE country_code = ?`,
          [country_code]
        );

        const maxExisting = maxRow[0].max_no || 0;

        if (Number(current_number) <= maxExisting) {
          throw new Error(
            `${country_code}: must be greater than ${maxExisting}`
          );
        }

        // update
        await conn.query(
          `UPDATE zv_invoice_sequences
           SET prefix = ?, current_number = ?
           WHERE country_code = ?`,
          [prefix, current_number, country_code]
        );
      }
    }

    await conn.commit();

    res.json({
      success: true,
      message: "Preferences & invoice sequences updated successfully"
    });

  } catch (err) {

    await conn.rollback();

    res.status(500).json({
      success: false,
      message: err.message
    });

  } finally {
    conn.release();
  }
};


exports.deleteInvoiceSequence = async (req, res) => {

  const conn = await db.promise().getConnection();

  try {

    await conn.beginTransaction();

    const { country_code } = req.params;

    if (!country_code) {
      return res.status(400).json({
        success: false,
        message: "country_code is required"
      });
    }

    // 🔥 CHECK IF INVOICES EXIST
    const [rows] = await conn.query(
      "SELECT COUNT(*) as count FROM zv_invoices WHERE country_code = ?",
      [country_code]
    );

    if (rows[0].count > 0) {
      throw new Error(
        `Cannot delete. ${rows[0].count} invoices already exist for ${country_code}`
      );
    }

    // 🔥 DELETE SEQUENCE
    const [result] = await conn.query(
      "DELETE FROM zv_invoice_sequences WHERE country_code = ?",
      [country_code]
    );

    if (result.affectedRows === 0) {
      throw new Error("Sequence not found");
    }

    await conn.commit();

    res.json({
      success: true,
      message: `Sequence deleted for ${country_code}`
    });

  } catch (err) {

    await conn.rollback();

    res.status(500).json({
      success: false,
      message: err.message
    });

  } finally {
    conn.release();
  }
};

exports.createInvoiceSequence = async (req, res) => {

  try {

    const { country_code, prefix, current_number } = req.body;

    if (!country_code || !prefix || !current_number) {
      return res.status(400).json({
        success: false,
        message: "country_code, prefix, current_number required"
      });
    }

    // 🔥 CHECK IF ALREADY EXISTS
    const [existing] = await db.promise().query(
      "SELECT id FROM zv_invoice_sequences WHERE country_code = ?",
      [country_code]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Sequence already exists for this country"
      });
    }

    // 🔥 INSERT
    await db.promise().query(
      `INSERT INTO zv_invoice_sequences
      (country_code, prefix, current_number)
      VALUES (?,?,?)`,
      [country_code, prefix, current_number]
    );

    res.json({
      success: true,
      message: "Invoice sequence created successfully"
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};
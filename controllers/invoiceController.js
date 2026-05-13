const db = require("../config/db");

// exports.createInvoice = async (req, res) => {
//   const conn = await db.promise().getConnection();

//   try {
//     await conn.beginTransaction();

//     const userId = req.user.id;

//     const {
//       customer_id,
//       address_id,
//       project_id,
//       reference,
//       invoice_date,
//       due_date,
//       subject,
//       discount_pct = 0,
//       tds_pct = 0,
//       adjustment = 0,
//       notes,
//       terms,
//       items = [],
//       gst_lines = [],
//     } = req.body;

//     /* Generate Invoice Number */

//     const invoiceNumber = "INV-" + Date.now().toString().slice(-6);

//     /* Calculate Subtotal */

//     let subtotal = 0;

//     items.forEach((item) => {
//       subtotal += Number(item.quantity) * Number(item.rate);
//     });

//     const discount_amt = subtotal * (discount_pct / 100);
//     const after_discount = subtotal - discount_amt;

//     const tds_amt = after_discount * (tds_pct / 100);

//     let total_gst_amt = 0;

//     gst_lines.forEach((g) => {
//       total_gst_amt += after_discount * (g.rate / 100);
//     });

//     const total = after_discount - tds_amt + total_gst_amt + Number(adjustment);

//     /* Insert Invoice */

//     const [invoiceResult] = await conn.query(
//       `INSERT INTO zv_invoices
//       (
//         invoice_number,
//         customer_id,
//           address_id,
//         project_id,
//         reference,
//         invoice_date,
//         due_date,
//         subject,
//         subtotal,
//         discount_pct,
//         discount_amt,
//         after_discount,
//         tds_pct,
//         tds_amt,
//         total_gst_amt,
//         adjustment,
//         total,
//         notes,
//         terms,
//         created_by,
//         balance_due
//       )
//       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
//       [
//         invoiceNumber,
//         customer_id,
//         address_id || null,
//         project_id || null,
//         reference,
//         invoice_date,
//         due_date,
//         subject,
//         subtotal,
//         discount_pct,
//         discount_amt,
//         after_discount,
//         tds_pct,
//         tds_amt,
//         total_gst_amt,
//         adjustment,
//         total,
//         notes,
//         terms,
//         userId,
//         total,
//       ],
//     );

//     const invoiceId = invoiceResult.insertId;

//     /* Insert Invoice Items */

//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];
//       const amount = Number(item.quantity) * Number(item.rate);

//       await conn.query(
//         `INSERT INTO zv_invoice_items
//         (
//           invoice_id,
//           description,
//           quantity,
//           rate,
//           amount,
//           sort_order
//         )
//         VALUES (?,?,?,?,?,?)`,
//         [invoiceId, item.description, item.quantity, item.rate, amount, i + 1],
//       );
//     }

//     /* Insert GST Lines */

//     for (let i = 0; i < gst_lines.length; i++) {
//       const gst = gst_lines[i];
//       const gstAmount = after_discount * (gst.rate / 100);

//       await conn.query(
//         `INSERT INTO zv_invoice_gst_lines
//         (
//           invoice_id,
//           gst_type,
//           rate,
//           is_custom,
//           gst_amount,
//           sort_order
//         )
//         VALUES (?,?,?,?,?,?)`,
//         [
//           invoiceId,
//           gst.gst_type,
//           gst.rate,
//           gst.is_custom || 0,
//           gstAmount,
//           i + 1,
//         ],
//       );
//     }

//     await conn.commit();

//     res.json({
//       success: true,
//       message: "Invoice created successfully",
//       invoice_id: invoiceId,
//     });
//   } catch (error) {
//     await conn.rollback();

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   } finally {
//     conn.release();
//   }
// };


// exports.createInvoice = async (req, res) => {
//   const conn = await db.promise().getConnection();

//   try {
//     await conn.beginTransaction();

//     const userId = req.user.id;

//     const {
//       customer_id,
//       address_id,
//       project_id,
//       bank_detail_id, // ✅ added
//       reference,
//       invoice_date,
//       due_date,
//       subject,
//       discount_pct = 0,
//       tds_pct = 0,
//       adjustment = 0,
//       notes,
//       terms,
//       items = [],
//       gst_lines = [],
//     } = req.body;

//     /* Generate Invoice Number */

//     const invoiceNumber = "INV-" + Date.now().toString().slice(-6);

//     /* Calculate Subtotal */

//     let subtotal = 0;

//     items.forEach((item) => {
//       subtotal += Number(item.quantity) * Number(item.rate);
//     });

//     const discount_amt = subtotal * (discount_pct / 100);
//     const after_discount = subtotal - discount_amt;

//     const tds_amt = after_discount * (tds_pct / 100);

//     let total_gst_amt = 0;

//     gst_lines.forEach((g) => {
//       total_gst_amt += after_discount * (g.rate / 100);
//     });

//     const total = after_discount - tds_amt + total_gst_amt + Number(adjustment);

//     /* Insert Invoice */

//     const [invoiceResult] = await conn.query(
//       `INSERT INTO zv_invoices
//     (invoice_number, customer_id, address_id, bank_detail_id, project_id,
//      reference, invoice_date, due_date, subject,
//      subtotal, discount_pct, discount_amt, after_discount,
//      tds_pct, tds_amt, total_gst_amt, adjustment,
//      total, notes, terms, created_by, balance_due)
//    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
//       [
//         invoiceNumber,
//         customer_id,
//         address_id || null,
//         bank_detail_id || null, // ✅
//         project_id || null,
//         reference,
//         invoice_date,
//         due_date,
//         subject,
//         subtotal,
//         discount_pct,
//         discount_amt,
//         after_discount,
//         tds_pct,
//         tds_amt,
//         total_gst_amt,
//         adjustment,
//         total,
//         notes,
//         terms,
//         userId,
//         total,
//       ],
//     );

//     const invoiceId = invoiceResult.insertId;

//     /* Insert Invoice Items */

//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];
//       const amount = Number(item.quantity) * Number(item.rate);

//       await conn.query(
//         `INSERT INTO zv_invoice_items
//         (
//           invoice_id,
//           description,
//           quantity,
//           rate,
//           amount,
//           sort_order
//         )
//         VALUES (?,?,?,?,?,?)`,
//         [invoiceId, item.description, item.quantity, item.rate, amount, i + 1],
//       );
//     }

//     /* Insert GST Lines */

//     for (let i = 0; i < gst_lines.length; i++) {
//       const gst = gst_lines[i];
//       const gstAmount = after_discount * (gst.rate / 100);

//       await conn.query(
//         `INSERT INTO zv_invoice_gst_lines
//         (
//           invoice_id,
//           gst_type,
//           rate,
//           is_custom,
//           gst_amount,
//           sort_order
//         )
//         VALUES (?,?,?,?,?,?)`,
//         [
//           invoiceId,
//           gst.gst_type,
//           gst.rate,
//           gst.is_custom || 0,
//           gstAmount,
//           i + 1,
//         ],
//       );
//     }

//     await conn.commit();

//     res.json({
//       success: true,
//       message: "Invoice created successfully",
//       invoice_id: invoiceId,
//     });
//   } catch (error) {
//     await conn.rollback();

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   } finally {
//     conn.release();
//   }
// };


// exports.getAllInvoices = async (req, res) => {
//   try {
//     // 🔥 AUTO UPDATE OVERDUE STATUS
//     await db.promise().query(`
//       UPDATE zv_invoices
//       SET status = 'overdue'
//       WHERE due_date < CURDATE()
//       AND status NOT IN ('paid', 'cancelled', 'overdue')
//     `);

//     // 🔥 FETCH ALL INVOICES
//     const [rows] = await db.promise().query(`
//       SELECT
//         i.id,
//         i.invoice_number,
//         i.quote_number,

//         c.name AS customer_name,
//         c.company_name AS customer_company,
//         c.currency AS customer_currency,
//         c.id AS customer_id,

//         -- Company Address
//         sa.id AS address_id,
//         sa.label AS company_address_label,
//         sa.street AS company_street,
//         sa.city AS company_city,
//         sa.state AS company_state,
//         sa.zip AS company_zip,
//         sa.country AS company_country,
//         sa.phone AS company_phone,
//         sa.email AS company_email,

//         -- Customer Billing Address
//         addr.city AS billing_city,
//         addr.country AS billing_country,

//         i.reference,
//         i.invoice_date,
//         i.due_date,
//         i.subtotal,
//         i.total,
//         i.status,
//         i.created_at,
//         i.total_paid,
//         i.balance_due

//       FROM zv_invoices i

//       JOIN zv_customers c
//         ON c.id = i.customer_id

//       -- Selected Company Address
//       LEFT JOIN zv_company_addresses sa
//         ON sa.id = i.address_id

//       -- Customer Billing Address
//       LEFT JOIN zv_customer_addresses addr
//         ON addr.customer_id = c.id
//         AND addr.address_type = 'billing'

//       ORDER BY i.created_at DESC
//     `);

//     res.json({
//       success: true,
//       total: rows.length,
//       data: rows,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.getInvoiceById = async (req, res) => {
//   try {
//     const invoiceId = req.params.id;

//     /* GET INVOICE + PROJECT + COMPANY ADDRESS */
//     const [invoiceRows] = await db.promise().query(
//       `SELECT
//         i.*,

//         c.name         AS customer_name,
//         c.company_name AS customer_company,
//         c.currency     AS customer_currency,

//         p.id           AS project_id,
//         p.name         AS project_name,
//         p.code         AS project_code,
//         p.status       AS project_status,

//         -- Company Address
//         sa.id          AS address_id,
//         sa.label       AS company_address_label,
//         sa.street      AS company_street,
//         sa.city        AS company_city,
//         sa.state       AS company_state,
//         sa.zip         AS company_zip,
//         sa.country     AS company_country,
//         sa.phone       AS company_phone,
//         sa.email       AS company_email

//       FROM zv_invoices i

//       JOIN zv_customers c
//         ON c.id = i.customer_id

//       LEFT JOIN zv_projects p
//         ON p.id = i.project_id

//       LEFT JOIN zv_company_addresses sa
//         ON sa.id = i.address_id

//       WHERE i.id = ?`,
//       [invoiceId],
//     );

//     if (invoiceRows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found",
//       });
//     }

//     /* GET ITEMS */
//     const [items] = await db.promise().query(
//       `SELECT
//         id,
//         description,
//         quantity,
//         rate,
//         amount,
//         sort_order
//       FROM zv_invoice_items
//       WHERE invoice_id = ?
//       ORDER BY sort_order ASC`,
//       [invoiceId],
//     );

//     /* GET GST LINES */
//     const [gstLines] = await db.promise().query(
//       `SELECT
//         id,
//         gst_type,
//         rate,
//         is_custom,
//         gst_amount,
//         sort_order
//       FROM zv_invoice_gst_lines
//       WHERE invoice_id = ?
//       ORDER BY sort_order ASC`,
//       [invoiceId],
//     );

//     const invoice = invoiceRows[0];

//     res.json({
//       success: true,
//       data: {
//         invoice,

//         project: invoice.project_id
//           ? {
//               id: invoice.project_id,
//               name: invoice.project_name,
//               code: invoice.project_code,
//               status: invoice.project_status,
//             }
//           : null,

//         items,
//         gst_lines: gstLines,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


exports.createInvoice = async (req, res) => {
  const conn = await db.promise().getConnection();

  try {
    await conn.beginTransaction();

    const userId = req.user.id;

    const {
      customer_id,
        country_code,
      address_id,
      project_id,
      bank_detail_id,
      reference,
      invoice_date,
      due_date,
      subject,
      discount_pct = 0,
      tds_pct = 0,
      adjustment = 0,
      notes,
      terms,
      items = [],
      gst_lines = [],
    } = req.body;

    /* ── Generate Invoice Number based on address country ── */
    let invoiceNumber;

   if (country_code) {
  // Lock the row to prevent duplicate numbers under concurrent requests
  const [seqRows] = await conn.query(
    `SELECT id, prefix, current_number
     FROM zv_invoice_sequences
     WHERE country_code = ?
     LIMIT 1
     FOR UPDATE`,
    [country_code.toUpperCase()]
  );

  if (seqRows.length) {
    const seq = seqRows[0];
    const nextNum = seq.current_number + 1;
    invoiceNumber = `${seq.prefix}${nextNum}`;

    await conn.query(
      `UPDATE zv_invoice_sequences SET current_number = ? WHERE id = ?`,
      [nextNum, seq.id]
    );
  }
}

    // Fallback if no address / no sequence configured
    if (!invoiceNumber) {
      invoiceNumber = "INV-" + Date.now().toString().slice(-6);
    }

    /* ── Calculate Subtotal ── */
    let subtotal = 0;
    items.forEach((item) => {
      subtotal += Number(item.quantity) * Number(item.rate);
    });

    const discount_amt = subtotal * (discount_pct / 100);
    const after_discount = subtotal - discount_amt;
    const tds_amt = after_discount * (tds_pct / 100);

    let total_gst_amt = 0;
    gst_lines.forEach((g) => {
      total_gst_amt += after_discount * (g.rate / 100);
    });

    const total = after_discount - tds_amt + total_gst_amt + Number(adjustment);

    /* ── Insert Invoice ── */
    const [invoiceResult] = await conn.query(
      `INSERT INTO zv_invoices
       (invoice_number, customer_id, address_id, bank_detail_id, project_id,
        reference, invoice_date, due_date, subject,
        subtotal, discount_pct, discount_amt, after_discount,
        tds_pct, tds_amt, total_gst_amt, adjustment,
        total, notes, terms, created_by, balance_due)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        invoiceNumber, customer_id, address_id || null, bank_detail_id || null,
        project_id || null, reference, invoice_date, due_date, subject,
        subtotal, discount_pct, discount_amt, after_discount,
        tds_pct, tds_amt, total_gst_amt, adjustment,
        total, notes, terms, userId, total,
      ]
    );

    const invoiceId = invoiceResult.insertId;

    /* ── Insert Items ── */
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const amount = Number(item.quantity) * Number(item.rate);
      await conn.query(
        `INSERT INTO zv_invoice_items (invoice_id, description, quantity, rate, amount, sort_order)
         VALUES (?,?,?,?,?,?)`,
        [invoiceId, item.description, item.quantity, item.rate, amount, i + 1]
      );
    }

    /* ── Insert GST Lines ── */
    for (let i = 0; i < gst_lines.length; i++) {
      const gst = gst_lines[i];
      const gstAmount = after_discount * (gst.rate / 100);
      await conn.query(
        `INSERT INTO zv_invoice_gst_lines (invoice_id, gst_type, rate, is_custom, gst_amount, sort_order)
         VALUES (?,?,?,?,?,?)`,
        [invoiceId, gst.gst_type, gst.rate, gst.is_custom || 0, gstAmount, i + 1]
      );
    }

    await conn.commit();

    res.json({
      success: true,
      message: "Invoice created successfully",
      invoice_id: invoiceId,
      invoice_number: invoiceNumber, // ✅ return it so frontend can show it
    });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
};


exports.getAllInvoices = async (req, res) => {
  try {
    await db.promise().query(`
      UPDATE zv_invoices SET status = 'overdue'
      WHERE due_date < CURDATE() AND status NOT IN ('paid','cancelled','overdue')
    `);

    const [rows] = await db.promise().query(`
      SELECT
        i.id, i.invoice_number,
        c.name AS customer_name, c.company_name AS customer_company,
        c.currency AS customer_currency, c.id AS customer_id,
        sa.city  AS company_addr_city,
        sa.country AS company_addr_country,
        bd.bank_name, bd.account_number AS bank_account_number,
        i.reference, i.invoice_date, i.due_date,
        i.subtotal, i.total, i.status, i.created_at,
        i.total_paid, i.balance_due
      FROM zv_invoices i
      JOIN zv_customers c ON c.id = i.customer_id
      LEFT JOIN zv_company_addresses sa ON sa.id = i.address_id
      LEFT JOIN zv_bank_details bd ON bd.id = i.bank_detail_id
      ORDER BY i.created_at DESC
    `);

    res.json({ success: true, total: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    const [invoiceRows] = await db.promise().query(
      `SELECT
        i.*,
        c.name         AS customer_name,
        c.company_name AS customer_company,
        c.currency     AS customer_currency,
        p.id           AS project_id,
        p.name         AS project_name,
        p.code         AS project_code,
        p.status       AS project_status,
        -- Company Address
        sa.id          AS address_id,
        sa.label       AS company_address_label,
        sa.street      AS company_street,
        sa.city        AS company_city,
        sa.state       AS company_state,
        sa.zip         AS company_zip,
        sa.country     AS company_country,
        sa.phone       AS company_phone,
        sa.email       AS company_email,
        -- ✅ Bank Details
        bd.id           AS bank_detail_id,
        bd.bank_name    AS bank_name,
        bd.branch       AS bank_branch,
        bd.account_name AS bank_account_name,
        bd.account_number AS bank_account_number,
        bd.ifsc_code    AS bank_ifsc,
        bd.swift_code   AS bank_swift,
        bd.currency     AS bank_currency
      FROM zv_invoices i
      JOIN zv_customers c ON c.id = i.customer_id
      LEFT JOIN zv_projects p ON p.id = i.project_id
      LEFT JOIN zv_company_addresses sa ON sa.id = i.address_id
      LEFT JOIN zv_bank_details bd ON bd.id = i.bank_detail_id
      WHERE i.id = ?`,
      [invoiceId],
    );

    if (invoiceRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    const [items] = await db.promise().query(
      `SELECT id, description, quantity, rate, amount, sort_order
       FROM zv_invoice_items WHERE invoice_id = ? ORDER BY sort_order ASC`,
      [invoiceId],
    );

    const [gstLines] = await db.promise().query(
      `SELECT id, gst_type, rate, is_custom, gst_amount, sort_order
       FROM zv_invoice_gst_lines WHERE invoice_id = ? ORDER BY sort_order ASC`,
      [invoiceId],
    );

    const invoice = invoiceRows[0];

    res.json({
      success: true,
      data: {
        invoice,
        project: invoice.project_id
          ? {
              id: invoice.project_id,
              name: invoice.project_name,
              code: invoice.project_code,
              status: invoice.project_status,
            }
          : null,
        // ✅ Clean bank details object
        bankDetail: invoice.bank_detail_id
          ? {
              id: invoice.bank_detail_id,
              bankName: invoice.bank_name,
              branch: invoice.bank_branch,
              accountName: invoice.bank_account_name,
              accountNumber: invoice.bank_account_number,
              ifscCode: invoice.bank_ifsc,
              swiftCode: invoice.bank_swift,
              currency: invoice.bank_currency,
            }
          : null,
        items,
        gst_lines: gstLines,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// exports.updateInvoice = async (req, res) => {
//   const conn = await db.promise().getConnection();

//   try {
//     await conn.beginTransaction();

//     const invoiceId = req.params.id;

//     const {
//       customer_id,
//       address_id,
//       reference,
//       invoice_date,
//       due_date,
//       subject,
//       discount_pct = 0,
//       tds_pct = 0,
//       adjustment = 0,
//       notes,
//       terms,
//       items = [],
//       gst_lines = [],
//     } = req.body;

//     /* CHECK IF INVOICE EXISTS */

//     const [check] = await conn.query("SELECT id FROM zv_invoices WHERE id=?", [
//       invoiceId,
//     ]);

//     if (check.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found",
//       });
//     }

//     /* CALCULATE TOTALS */

//     let subtotal = 0;

//     items.forEach((item) => {
//       subtotal += Number(item.quantity) * Number(item.rate);
//     });

//     const discount_amt = subtotal * (discount_pct / 100);
//     const after_discount = subtotal - discount_amt;

//     const tds_amt = after_discount * (tds_pct / 100);

//     let total_gst_amt = 0;

//     gst_lines.forEach((g) => {
//       total_gst_amt += after_discount * (g.rate / 100);
//     });

//     const total = after_discount - tds_amt + total_gst_amt + Number(adjustment);

//     /* UPDATE INVOICE HEADER */

//     await conn.query(
//       `UPDATE zv_invoices SET
//         customer_id=?,
//         address_id = ?,
//         reference=?,
//         invoice_date=?,
//         due_date=?,
//         subject=?,
//         subtotal=?,
//         discount_pct=?,
//         discount_amt=?,
//         after_discount=?,
//         tds_pct=?,
//         tds_amt=?,
//         total_gst_amt=?,
//         adjustment=?,
//         total=?,
//         notes=?,
//         terms=?,
//         status = ?
//       WHERE id=?`,
//       [
//         customer_id,
//         address_id || null,
//         reference,
//         invoice_date,
//         due_date,
//         subject,
//         subtotal,
//         discount_pct,
//         discount_amt,
//         after_discount,
//         tds_pct,
//         tds_amt,
//         total_gst_amt,
//         adjustment,
//         total,
//         notes,
//         terms,
//         req.body.status || "sent",
//         invoiceId,
//       ],
//     );

//     /* =========================
//        ITEMS SYNC LOGIC
//        ========================= */

//     const [existingItems] = await conn.query(
//       "SELECT id FROM zv_invoice_items WHERE invoice_id=?",
//       [invoiceId],
//     );

//     const existingIds = existingItems.map((i) => i.id);
//     const requestIds = items.filter((i) => i.id).map((i) => i.id);

//     const itemsToDelete = existingIds.filter((id) => !requestIds.includes(id));

//     for (let id of itemsToDelete) {
//       await conn.query("DELETE FROM zv_invoice_items WHERE id=?", [id]);
//     }

//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];
//       const amount = Number(item.quantity) * Number(item.rate);

//       if (item.id) {
//         await conn.query(
//           `UPDATE zv_invoice_items
//            SET description=?,quantity=?,rate=?,amount=?,sort_order=?
//            WHERE id=?`,
//           [item.description, item.quantity, item.rate, amount, i + 1, item.id],
//         );
//       } else {
//         await conn.query(
//           `INSERT INTO zv_invoice_items
//            (invoice_id,description,quantity,rate,amount,sort_order)
//            VALUES (?,?,?,?,?,?)`,
//           [
//             invoiceId,
//             item.description,
//             item.quantity,
//             item.rate,
//             amount,
//             i + 1,
//           ],
//         );
//       }
//     }

//     /* =========================
//        GST SYNC LOGIC
//        ========================= */

//     const [existingGST] = await conn.query(
//       "SELECT id FROM zv_invoice_gst_lines WHERE invoice_id=?",
//       [invoiceId],
//     );

//     const existingGstIds = existingGST.map((g) => g.id);
//     const requestGstIds = gst_lines.filter((g) => g.id).map((g) => g.id);

//     const gstToDelete = existingGstIds.filter(
//       (id) => !requestGstIds.includes(id),
//     );

//     for (let id of gstToDelete) {
//       await conn.query("DELETE FROM zv_invoice_gst_lines WHERE id=?", [id]);
//     }

//     for (let i = 0; i < gst_lines.length; i++) {
//       const gst = gst_lines[i];
//       const gstAmount = after_discount * (gst.rate / 100);

//       if (gst.id) {
//         await conn.query(
//           `UPDATE zv_invoice_gst_lines
//            SET gst_type=?,rate=?,is_custom=?,gst_amount=?,sort_order=?
//            WHERE id=?`,
//           [
//             gst.gst_type,
//             gst.rate,
//             gst.is_custom || 0,
//             gstAmount,
//             i + 1,
//             gst.id,
//           ],
//         );
//       } else {
//         await conn.query(
//           `INSERT INTO zv_invoice_gst_lines
//            (invoice_id,gst_type,rate,is_custom,gst_amount,sort_order)
//            VALUES (?,?,?,?,?,?)`,
//           [
//             invoiceId,
//             gst.gst_type,
//             gst.rate,
//             gst.is_custom || 0,
//             gstAmount,
//             i + 1,
//           ],
//         );
//       }
//     }

//     await conn.commit();

//     res.json({
//       success: true,
//       message: "Invoice updated successfully",
//     });
//   } catch (error) {
//     await conn.rollback();

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   } finally {
//     conn.release();
//   }
// };

exports.updateInvoice = async (req, res) => {
  const conn = await db.promise().getConnection();

  try {
    await conn.beginTransaction();

    const invoiceId = req.params.id;

    const {
      customer_id,
      address_id,
      bank_detail_id,
      reference,
      invoice_date,
      due_date,
      subject,
      discount_pct = 0,
      tds_pct = 0,
      adjustment = 0,
      notes,
      terms,
      items = [],
      gst_lines = [],
    } = req.body;

    /* CHECK IF INVOICE EXISTS */

    const [check] = await conn.query("SELECT id FROM zv_invoices WHERE id=?", [
      invoiceId,
    ]);

    if (check.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    /* CALCULATE TOTALS */

    let subtotal = 0;

    items.forEach((item) => {
      subtotal += Number(item.quantity) * Number(item.rate);
    });

    const discount_amt = subtotal * (discount_pct / 100);
    const after_discount = subtotal - discount_amt;

    const tds_amt = after_discount * (tds_pct / 100);

    let total_gst_amt = 0;

    gst_lines.forEach((g) => {
      total_gst_amt += after_discount * (g.rate / 100);
    });

    const total = after_discount - tds_amt + total_gst_amt + Number(adjustment);

    /* UPDATE INVOICE HEADER */

    await conn.query(
      `UPDATE zv_invoices SET
    customer_id=?, address_id=?, bank_detail_id=?, project_id=?,
    reference=?, invoice_date=?, due_date=?, subject=?,
    subtotal=?, discount_pct=?, discount_amt=?, after_discount=?,
    tds_pct=?, tds_amt=?, total_gst_amt=?, adjustment=?,
    total=?, notes=?, terms=?, status=?
   WHERE id=?`,
      [
        customer_id,
        address_id || null,
        bank_detail_id || null, // ✅
        req.body.project_id || null,
        reference,
        invoice_date,
        due_date,
        subject,
        subtotal,
        discount_pct,
        discount_amt,
        after_discount,
        tds_pct,
        tds_amt,
        total_gst_amt,
        adjustment,
        total,
        notes,
        terms,
        req.body.status || "sent",
        invoiceId,
      ],
    );

    /* =========================
       ITEMS SYNC LOGIC
       ========================= */

    const [existingItems] = await conn.query(
      "SELECT id FROM zv_invoice_items WHERE invoice_id=?",
      [invoiceId],
    );

    const existingIds = existingItems.map((i) => i.id);
    const requestIds = items.filter((i) => i.id).map((i) => i.id);

    const itemsToDelete = existingIds.filter((id) => !requestIds.includes(id));

    for (let id of itemsToDelete) {
      await conn.query("DELETE FROM zv_invoice_items WHERE id=?", [id]);
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const amount = Number(item.quantity) * Number(item.rate);

      if (item.id) {
        await conn.query(
          `UPDATE zv_invoice_items
           SET description=?,quantity=?,rate=?,amount=?,sort_order=?
           WHERE id=?`,
          [item.description, item.quantity, item.rate, amount, i + 1, item.id],
        );
      } else {
        await conn.query(
          `INSERT INTO zv_invoice_items
           (invoice_id,description,quantity,rate,amount,sort_order)
           VALUES (?,?,?,?,?,?)`,
          [
            invoiceId,
            item.description,
            item.quantity,
            item.rate,
            amount,
            i + 1,
          ],
        );
      }
    }

    /* =========================
       GST SYNC LOGIC
       ========================= */

    const [existingGST] = await conn.query(
      "SELECT id FROM zv_invoice_gst_lines WHERE invoice_id=?",
      [invoiceId],
    );

    const existingGstIds = existingGST.map((g) => g.id);
    const requestGstIds = gst_lines.filter((g) => g.id).map((g) => g.id);

    const gstToDelete = existingGstIds.filter(
      (id) => !requestGstIds.includes(id),
    );

    for (let id of gstToDelete) {
      await conn.query("DELETE FROM zv_invoice_gst_lines WHERE id=?", [id]);
    }

    for (let i = 0; i < gst_lines.length; i++) {
      const gst = gst_lines[i];
      const gstAmount = after_discount * (gst.rate / 100);

      if (gst.id) {
        await conn.query(
          `UPDATE zv_invoice_gst_lines
           SET gst_type=?,rate=?,is_custom=?,gst_amount=?,sort_order=?
           WHERE id=?`,
          [
            gst.gst_type,
            gst.rate,
            gst.is_custom || 0,
            gstAmount,
            i + 1,
            gst.id,
          ],
        );
      } else {
        await conn.query(
          `INSERT INTO zv_invoice_gst_lines
           (invoice_id,gst_type,rate,is_custom,gst_amount,sort_order)
           VALUES (?,?,?,?,?,?)`,
          [
            invoiceId,
            gst.gst_type,
            gst.rate,
            gst.is_custom || 0,
            gstAmount,
            i + 1,
          ],
        );
      }
    }

    await conn.commit();

    res.json({
      success: true,
      message: "Invoice updated successfully",
    });
  } catch (error) {
    await conn.rollback();

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    conn.release();
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    const [rows] = await db
      .promise()
      .query(`SELECT id FROM zv_invoices WHERE id = ?`, [invoiceId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    await db
      .promise()
      .query(`DELETE FROM zv_invoices WHERE id = ?`, [invoiceId]);

    res.json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

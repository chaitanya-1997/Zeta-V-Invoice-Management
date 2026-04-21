// const db = require("../config/db");

// exports.createInvoice = async (req, res) => {
//   const conn = await db.promise().getConnection();

//   try {
//     await conn.beginTransaction();

//     const userId = req.user.id;

//     const {
//       customer_id,
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
//         created_by
//       )
//       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
//       [
//         invoiceNumber,
//         customer_id,
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
//     const [rows] = await db.promise().query(`
//       SELECT
//         i.id,
//         i.invoice_number,
//         c.name AS customer_name,
//          c.company_name AS customer_company,
//          c.currency AS customer_currency,
//          c.id AS customer_id,
//         i.reference,
//         i.invoice_date,
//         i.due_date,
//         i.subtotal,
//         i.total,
//         i.status,
//         i.created_at,i.total_paid,i.balance_due
//       FROM zv_invoices i
//       JOIN zv_customers c ON c.id = i.customer_id
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

//     /* GET INVOICE */

//     const [invoiceRows] = await db.promise().query(
//       `SELECT 
//         i.*,
//         c.name AS customer_name,
//         c.company_name AS customer_company,
//         c.currency AS customer_currency
//       FROM zv_invoices i
//       JOIN zv_customers c ON c.id = i.customer_id
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

//     res.json({
//       success: true,
//       data: {
//         invoice: invoiceRows[0],
//         items: items,
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

// exports.updateInvoice = async (req, res) => {
//   const conn = await db.promise().getConnection();

//   try {
//     await conn.beginTransaction();

//     const invoiceId = req.params.id;

//     const {
//       customer_id,
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

// exports.deleteInvoice = async (req, res) => {
//   try {
//     const invoiceId = req.params.id;

//     const [rows] = await db
//       .promise()
//       .query(`SELECT id FROM zv_invoices WHERE id = ?`, [invoiceId]);

//     if (rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found",
//       });
//     }

//     await db
//       .promise()
//       .query(`DELETE FROM zv_invoices WHERE id = ?`, [invoiceId]);

//     res.json({
//       success: true,
//       message: "Invoice deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };







const db = require("../config/db");

exports.createInvoice = async (req, res) => {
  const conn = await db.promise().getConnection();

  try {
    await conn.beginTransaction();

    const userId = req.user.id;

    const {
      customer_id,
       project_id,
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

    /* Generate Invoice Number */

    const invoiceNumber = "INV-" + Date.now().toString().slice(-6);

    /* Calculate Subtotal */

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

    /* Insert Invoice */

    const [invoiceResult] = await conn.query(
      `INSERT INTO zv_invoices
      (
        invoice_number,
        customer_id,
        project_id,
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
        created_by
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        invoiceNumber,
        customer_id,
        project_id || null,
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
        userId,
      ],
    );

    const invoiceId = invoiceResult.insertId;

    /* Insert Invoice Items */

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const amount = Number(item.quantity) * Number(item.rate);

      await conn.query(
        `INSERT INTO zv_invoice_items
        (
          invoice_id,
          description,
          quantity,
          rate,
          amount,
          sort_order
        )
        VALUES (?,?,?,?,?,?)`,
        [invoiceId, item.description, item.quantity, item.rate, amount, i + 1],
      );
    }

    /* Insert GST Lines */

    for (let i = 0; i < gst_lines.length; i++) {
      const gst = gst_lines[i];
      const gstAmount = after_discount * (gst.rate / 100);

      await conn.query(
        `INSERT INTO zv_invoice_gst_lines
        (
          invoice_id,
          gst_type,
          rate,
          is_custom,
          gst_amount,
          sort_order
        )
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

    await conn.commit();

    res.json({
      success: true,
      message: "Invoice created successfully",
      invoice_id: invoiceId,
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

exports.getAllInvoices = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        i.id,
        i.invoice_number,
        c.name AS customer_name,
         c.company_name AS customer_company,
         c.currency AS customer_currency,
         c.id AS customer_id,
        i.reference,
        i.invoice_date,
        i.due_date,
        i.subtotal,
        i.total,
        i.status,
        i.created_at,i.total_paid,i.balance_due
      FROM zv_invoices i
      JOIN zv_customers c ON c.id = i.customer_id
      ORDER BY i.created_at DESC
    `);

    res.json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// exports.getInvoiceById = async (req, res) => {
//   try {
//     const invoiceId = req.params.id;

//     /* GET INVOICE */

//     const [invoiceRows] = await db.promise().query(
//       `SELECT 
//         i.*,
//         c.name AS customer_name,
//         c.company_name AS customer_company,
//         c.currency AS customer_currency
//       FROM zv_invoices i
//       JOIN zv_customers c ON c.id = i.customer_id
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

//     res.json({
//       success: true,
//       data: {
//         invoice: invoiceRows[0],
//         items: items,
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

exports.getInvoiceById = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    /* GET INVOICE + PROJECT */
    const [invoiceRows] = await db.promise().query(
      `SELECT 
        i.*,
        c.name         AS customer_name,
        c.company_name AS customer_company,
        c.currency     AS customer_currency,
        p.id           AS project_id,
        p.name         AS project_name,
        p.code         AS project_code,
        p.status       AS project_status
      FROM zv_invoices i
      JOIN zv_customers c ON c.id = i.customer_id
      LEFT JOIN zv_projects p ON p.id = i.project_id
      WHERE i.id = ?`,
      [invoiceId]
    );

    if (invoiceRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    /* GET ITEMS */
    const [items] = await db.promise().query(
      `SELECT id, description, quantity, rate, amount, sort_order
       FROM zv_invoice_items
       WHERE invoice_id = ?
       ORDER BY sort_order ASC`,
      [invoiceId]
    );

    /* GET GST LINES */
    const [gstLines] = await db.promise().query(
      `SELECT id, gst_type, rate, is_custom, gst_amount, sort_order
       FROM zv_invoice_gst_lines
       WHERE invoice_id = ?
       ORDER BY sort_order ASC`,
      [invoiceId]
    );

    const invoice = invoiceRows[0];

    res.json({
      success: true,
      data: {
        invoice,
        // ✅ Project pulled out as a clean nested object — null if no project assigned
        project: invoice.project_id
          ? {
              id:     invoice.project_id,
              name:   invoice.project_name,
              code:   invoice.project_code,
              status: invoice.project_status,
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

exports.updateInvoice = async (req, res) => {
  const conn = await db.promise().getConnection();

  try {
    await conn.beginTransaction();

    const invoiceId = req.params.id;

    const {
      customer_id,
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
        customer_id=?,
        reference=?,
        invoice_date=?,
        due_date=?,
        subject=?,
        subtotal=?,
        discount_pct=?,
        discount_amt=?,
        after_discount=?,
        tds_pct=?,
        tds_amt=?,
        total_gst_amt=?,
        adjustment=?,
        total=?,
        notes=?,
        terms=?,
        status = ?
      WHERE id=?`,
      [
        customer_id,
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

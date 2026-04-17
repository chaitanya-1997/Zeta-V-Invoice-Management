const db = require("../config/db");
const quoteModel = require("../models/quoteModel");

exports.createQuote = async (req, res) => {
  const conn = await db.promise().getConnection();

  try {
    await conn.beginTransaction();

    const userId = req.user.id;

    const {
      customer_id,
      reference,
      quote_date,
      expiry_date,
      subject,
      discount_pct = 0,
      tds_pct = 0,
      adjustment = 0,
      notes,
      terms,
      items = [],
      gst_lines = [],
    } = req.body;

    if (!customer_id || !quote_date || !expiry_date) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    /* GENERATE QUOTE NUMBER */

    const quoteNumber = "QUO-" + Date.now().toString().slice(-5);

    /* CALCULATE TOTALS */

    let subtotal = 0;

    items.forEach((i) => {
      subtotal += Number(i.qty) * Number(i.rate);
    });

    const discount_amt = subtotal * (discount_pct / 100);
    const after_discount = subtotal - discount_amt;

    const tds_amt = after_discount * (tds_pct / 100);

    let total_gst_amt = 0;

    gst_lines.forEach((g) => {
      total_gst_amt += after_discount * (g.rate / 100);
    });

    const total = after_discount - tds_amt + total_gst_amt + Number(adjustment);

    /* SAVE QUOTE */

    const quoteId = await quoteModel.insertQuote(conn, {
      quoteNumber,
      customer_id,
      reference,
      quote_date,
      expiry_date,
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
    });

    /* SAVE ITEMS */

    await quoteModel.insertItems(conn, quoteId, items);

    /* SAVE GST */

    await quoteModel.insertGST(conn, quoteId, gst_lines, after_discount);

    await conn.commit();

    res.json({
      success: true,
      message: "Quote created successfully",
      quote_id: quoteId,
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

exports.getAllQuotes = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        q.id,
        q.quote_number,
        c.name AS customer_name,
        c.company_name AS customer_company,
        c.currency AS customer_currency,
        q.reference,
        q.quote_date,
        q.expiry_date,
        q.subtotal,
        q.discount_pct,
        q.discount_amt,
        q.after_discount,
        q.tds_pct,
        q.tds_amt,
        q.total_gst_amt,
        q.adjustment,
        q.total,
        q.status,
        q.created_at,
        q.created_by,
        u.name AS created_by_name
      FROM zv_quotes q
      JOIN zv_customers c ON c.id = q.customer_id
      LEFT JOIN zv_users u ON u.id = q.created_by
      ORDER BY q.created_at DESC
    `);

    res.json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching quotes",
      error: error.message,
    });
  }
};

exports.getQuoteById = async (req, res) => {
  try {
    const { id } = req.params;

    // Main Quote + Customer Details
    const [quoteRows] = await db.promise().query(
      `
      SELECT 
        q.*,
        c.name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,
        c.company_name AS customer_company,
        c.currency AS customer_currency,
      
        u.name AS created_by_name
      FROM zv_quotes q
      JOIN zv_customers c ON c.id = q.customer_id
      LEFT JOIN zv_users u ON u.id = q.created_by
      WHERE q.id = ?
    `,
      [id],
    );

    if (quoteRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Quote not found",
      });
    }

    const quote = quoteRows[0];

    // Get Line Items
    const [items] = await db.promise().query(
      `
      SELECT 
        id,
        sort_order,
        description,
        qty,
        rate,
        amount
      FROM zv_quote_items 
      WHERE quote_id = ?
      ORDER BY sort_order ASC, id ASC
    `,
      [id],
    );

    // Get GST Lines
    const [gstLines] = await db.promise().query(
      `
      SELECT 
        id,
        gst_type,
        rate,
        is_custom,
        amount
      FROM zv_quote_gst_lines 
      WHERE quote_id = ?
      ORDER BY id ASC
    `,
      [id],
    );

    res.json({
      success: true,
      data: {
        ...quote,
        items: items,
        gst_lines: gstLines,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching quote details",
      error: error.message,
    });
  }
};

// DELETE Quote by ID
exports.deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: Prevent deletion if quote is already accepted
    const [existing] = await db
      .promise()
      .query(`SELECT status FROM zv_quotes WHERE id = ?`, [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Quote not found",
      });
    }

    const quoteStatus = existing[0].status;

    // Optional Security: Don't allow delete if already accepted
    if (quoteStatus === "accepted") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete an accepted quote",
      });
    }

    // Delete the quote (Cascade will automatically delete items & gst lines)
    const [result] = await db
      .promise()
      .query(`DELETE FROM zv_quotes WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Quote not found or already deleted",
      });
    }

    res.json({
      success: true,
      message: `Quote #${id} deleted successfully`,
      deletedId: id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting quote",
      error: error.message,
    });
  }
};

// UPDATE / Edit Quote
// exports.updateQuote = async (req, res) => {
//   const conn = await db.promise().getConnection();

//   try {
//     await conn.beginTransaction();

//     const { id } = req.params;           // Quote ID from URL
//     const userId = req.user.id;

//     const {
//       customer_id,
//       reference,
//       quote_date,
//       expiry_date,
//       subject,
//       discount_pct = 0,
//       tds_pct = 0,
//       adjustment = 0,
//       notes,
//       terms,
//       items = [],
//       gst_lines = []
//     } = req.body;

//     if (!customer_id || !quote_date || !expiry_date) {
//       return res.status(400).json({
//         success: false,
//         message: "Required fields missing"
//       });
//     }

//     // 1. Check if quote exists
//     const [existing] = await conn.query(
//       `SELECT status FROM zv_quotes WHERE id = ?`,
//       [id]
//     );

//     if (existing.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Quote not found"
//       });
//     }

//     // Optional: Prevent editing if already accepted
//     if (existing[0].status === 'accepted') {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot edit an accepted quote"
//       });
//     }

//     /* ====================== CALCULATE TOTALS ====================== */
//     let subtotal = 0;
//     items.forEach(i => {
//       subtotal += Number(i.qty || 0) * Number(i.rate || 0);
//     });

//     const discount_amt   = subtotal * (discount_pct / 100);
//     const after_discount = subtotal - discount_amt;

//     const tds_amt = after_discount * (tds_pct / 100);

//     let total_gst_amt = 0;
//     gst_lines.forEach(g => {
//       total_gst_amt += after_discount * (Number(g.rate || 0) / 100);
//     });

//     const total = after_discount - tds_amt + total_gst_amt + Number(adjustment);

//     /* ====================== UPDATE MAIN QUOTE ====================== */
//     await conn.query(`
//       UPDATE zv_quotes
//       SET
//         customer_id = ?,
//         reference = ?,
//         quote_date = ?,
//         expiry_date = ?,
//         subject = ?,
//         subtotal = ?,
//         discount_pct = ?,
//         discount_amt = ?,
//         after_discount = ?,
//         tds_pct = ?,
//         tds_amt = ?,
//         total_gst_amt = ?,
//         adjustment = ?,
//         total = ?,
//         notes = ?,
//         terms = ?,
//         updated_at = CURRENT_TIMESTAMP
//       WHERE id = ?
//     `, [
//       customer_id,
//       reference,
//       quote_date,
//       expiry_date,
//       subject,
//       subtotal,
//       discount_pct,
//       discount_amt,
//       after_discount,
//       tds_pct,
//       tds_amt,
//       total_gst_amt,
//       adjustment,
//       total,
//       notes,
//       terms,
//       id
//     ]);

//     /* ====================== DELETE OLD DATA ====================== */
//     // Delete old items and GST lines
//     await conn.query(`DELETE FROM zv_quote_items WHERE quote_id = ?`, [id]);
//     await conn.query(`DELETE FROM zv_quote_gst_lines WHERE quote_id = ?`, [id]);

//     /* ====================== INSERT NEW DATA ====================== */
//     // Reuse your model functions (recommended)
//     if (items.length > 0) {
//       await quoteModel.insertItems(conn, id, items);
//     }

//     if (gst_lines.length > 0) {
//       await quoteModel.insertGST(conn, id, gst_lines, after_discount);
//     }

//     await conn.commit();

//     res.json({
//       success: true,
//       message: "Quote updated successfully",
//       quote_id: id
//     });

//   } catch (error) {
//     await conn.rollback();
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating quote",
//       error: error.message
//     });
//   } finally {
//     conn.release();
//   }
// };

exports.updateQuote = async (req, res) => {
  const conn = await db.promise().getConnection();

  try {
    await conn.beginTransaction();

    const { id } = req.params; // Quote ID from URL
    const userId = req.user.id;

    const {
      customer_id,
      reference,
      quote_date,
      expiry_date,
      subject,
      discount_pct = 0,
      tds_pct = 0,
      adjustment = 0,
      notes,
      terms,
      status = "draft", // ✅ Added status field with default value
      items = [],
      gst_lines = [],
    } = req.body;

    if (!customer_id || !quote_date || !expiry_date) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // ✅ Validate status field
    const validStatuses = ["draft", "sent", "accepted", "declined", "expired"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be one of: draft, sent, accepted, declined, expired",
      });
    }

    // 1. Check if quote exists
    const [existing] = await conn.query(
      `SELECT status FROM zv_quotes WHERE id = ?`,
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Quote not found",
      });
    }

    // Optional: Prevent editing if already accepted
    if (existing[0].status === "accepted") {
      return res.status(400).json({
        success: false,
        message: "Cannot edit an accepted quote",
      });
    }

    /* ====================== CALCULATE TOTALS ====================== */
    let subtotal = 0;
    items.forEach((i) => {
      subtotal += Number(i.qty || 0) * Number(i.rate || 0);
    });

    const discount_amt = subtotal * (discount_pct / 100);
    const after_discount = subtotal - discount_amt;

    const tds_amt = after_discount * (tds_pct / 100);

    let total_gst_amt = 0;
    gst_lines.forEach((g) => {
      total_gst_amt += after_discount * (Number(g.rate || 0) / 100);
    });

    const total = after_discount - tds_amt + total_gst_amt + Number(adjustment);

    /* ====================== UPDATE MAIN QUOTE ====================== */
    await conn.query(
      `
      UPDATE zv_quotes 
      SET 
        customer_id = ?,
        reference = ?,
        quote_date = ?,
        expiry_date = ?,
        subject = ?,
        subtotal = ?,
        discount_pct = ?,
        discount_amt = ?,
        after_discount = ?,
        tds_pct = ?,
        tds_amt = ?,
        total_gst_amt = ?,
        adjustment = ?,
        total = ?,
        notes = ?,
        terms = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        customer_id,
        reference,
        quote_date,
        expiry_date,
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
        status, // ✅ Added status to UPDATE query
        id,
      ],
    );

    /* ====================== DELETE OLD DATA ====================== */
    // Delete old items and GST lines
    await conn.query(`DELETE FROM zv_quote_items WHERE quote_id = ?`, [id]);
    await conn.query(`DELETE FROM zv_quote_gst_lines WHERE quote_id = ?`, [id]);

    /* ====================== INSERT NEW DATA ====================== */
    // Reuse your model functions (recommended)
    if (items.length > 0) {
      await quoteModel.insertItems(conn, id, items);
    }

    if (gst_lines.length > 0) {
      await quoteModel.insertGST(conn, id, gst_lines, after_discount);
    }

    await conn.commit();

    res.json({
      success: true,
      message: "Quote updated successfully",
      quote_id: id,
      status: status, // ✅ Return updated status in response
    });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating quote",
      error: error.message,
    });
  } finally {
    conn.release();
  }
};

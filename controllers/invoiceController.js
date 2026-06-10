const db = require("../config/db");
const { getRate } = require("../services/exchangeRateService");

// exports.createInvoice = async (req, res) => {
//   const conn = await db.promise().getConnection();

//   try {
//     await conn.beginTransaction();

//     const userId = req.user.id;

//     const {
//       customer_id,
//       country_code,
//       address_id,
//       project_id,
//       bank_detail_id,
//       reference,          // kept for backward compat but no longer used in form
//       // ★ NEW / RENAMED fields
//       job,                // replaces subject
//       contact_person,     // non-India only
//       invoice_date,
//       due_date,
//       discount_pct = 0,
//       tds_pct = 0,
//       adjustment = 0,
//       notes,
//       terms,
//       // ★ Tax fields
//       tax_pct = 0,        // USA only
//       tax_amt = 0,        // USA only (pre-calculated by frontend, but we recalc below)
//       vat_pct = 0,        // HK / China
//       vat_amt = 0,        // HK / China (pre-calculated by frontend, but we recalc below)
//       items = [],
//       gst_lines = [],
//     } = req.body;

//     /* ── Generate Invoice Number ── */
//     let invoiceNumber;

//     if (country_code) {
//       const [seqRows] = await conn.query(
//         `SELECT id, prefix, current_number
//          FROM zv_invoice_sequences
//          WHERE country_code = ?
//          LIMIT 1
//          FOR UPDATE`,
//         [country_code.toUpperCase()]
//       );

//       if (seqRows.length) {
//         const seq    = seqRows[0];
//         const nextNum = seq.current_number + 1;
//         invoiceNumber = `${seq.prefix}${nextNum}`;
//         await conn.query(
//           `UPDATE zv_invoice_sequences SET current_number = ? WHERE id = ?`,
//           [nextNum, seq.id]
//         );
//       }
//     }

//     if (!invoiceNumber) {
//       invoiceNumber = "INV-" + Date.now().toString().slice(-6);
//     }

//     /* ── Calculations ── */
//     let subtotal = 0;
//     items.forEach((item) => {
//       subtotal += Number(item.quantity) * Number(item.rate);
//     });

//     const discount_amt  = subtotal * (discount_pct / 100);
//     const after_discount = subtotal - discount_amt;
//     const tds_amt       = after_discount * (tds_pct / 100);

//     // India GST
//     let total_gst_amt = 0;
//     gst_lines.forEach((g) => {
//       total_gst_amt += after_discount * (g.rate / 100);
//     });

//     // ★ USA Tax — recalculate server-side for safety
//     const calc_tax_amt = after_discount * (Number(tax_pct) / 100);

//     // ★ HK/CN VAT — recalculate server-side for safety
//     const calc_vat_amt = after_discount * (Number(vat_pct) / 100);

//     const total = after_discount
//       - tds_amt
//       + total_gst_amt
//       + calc_tax_amt
//       + calc_vat_amt
//       + Number(adjustment);

//     /* ── Insert Invoice ── */
//     const [invoiceResult] = await conn.query(
//       `INSERT INTO zv_invoices
//        (invoice_number, customer_id, address_id, bank_detail_id, project_id,
//         reference, subject, job, contact_person,
//         invoice_date, due_date,
//         subtotal, discount_pct, discount_amt, after_discount,
//         tds_pct, tds_amt,
//         tax_pct, tax_amt,
//         vat_pct, vat_amt,
//         total_gst_amt, adjustment,
//         total, notes, terms, created_by, balance_due)
//        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
//       [
//         invoiceNumber,
//         customer_id,
//         address_id     || null,
//         bank_detail_id || null,
//         project_id     || null,
//         reference      || null,   // kept for backward compat
//         job            || null,   // also stored as subject for legacy
//         job            || null,   // job column (★ new)
//         contact_person || null,   // ★ new
//         invoice_date,
//         due_date,
//         subtotal,
//         discount_pct,
//         discount_amt,
//         after_discount,
//         tds_pct,
//         tds_amt,
//         Number(tax_pct) || 0,     // ★ new
//         calc_tax_amt,             // ★ new
//         Number(vat_pct) || 0,     // ★ new
//         calc_vat_amt,             // ★ new
//         total_gst_amt,
//         adjustment,
//         total,
//         notes,
//         terms,
//         userId,
//         total,                    // balance_due = total on create
//       ]
//     );

//     const invoiceId = invoiceResult.insertId;

//     /* ── Insert Items ── */
//     for (let i = 0; i < items.length; i++) {
//       const item   = items[i];
//       const amount = Number(item.quantity) * Number(item.rate);
//       await conn.query(
//         `INSERT INTO zv_invoice_items
//          (invoice_id, description, quantity, rate, amount, sort_order)
//          VALUES (?,?,?,?,?,?)`,
//         [invoiceId, item.description, item.quantity, item.rate, amount, i + 1]
//       );
//     }

//     /* ── Insert GST Lines (India only) ── */
//     for (let i = 0; i < gst_lines.length; i++) {
//       const gst       = gst_lines[i];
//       const gstAmount = after_discount * (gst.rate / 100);
//       await conn.query(
//         `INSERT INTO zv_invoice_gst_lines
//          (invoice_id, gst_type, rate, is_custom, gst_amount, sort_order)
//          VALUES (?,?,?,?,?,?)`,
//         [invoiceId, gst.gst_type, gst.rate, gst.is_custom || 0, gstAmount, i + 1]
//       );
//     }

//     await conn.commit();

//     res.json({
//       success:        true,
//       message:        "Invoice created successfully",
//       invoice_id:     invoiceId,
//       invoice_number: invoiceNumber,
//     });

//   } catch (error) {
//     await conn.rollback();
//     res.status(500).json({ success: false, message: error.message });
//   } finally {
//     conn.release();
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
      reference, // kept for backward compat but no longer used in form
      // ★ NEW / RENAMED fields
      job, // replaces subject
      contact_person, // non-India only
      invoice_date,
      due_date,
      discount_pct = 0,
      tds_pct = 0,
      adjustment = 0,
      notes,
      terms,
      // ★ Tax fields
      tax_pct = 0, // USA only
      tax_amt = 0, // USA only (pre-calculated by frontend, but we recalc below)
      vat_pct = 0, // HK / China
      vat_amt = 0, // HK / China (pre-calculated by frontend, but we recalc below)
      items = [],
      gst_lines = [],
    } = req.body;

    const [customerRows] = await conn.query(
      `
  SELECT currency
  FROM zv_customers
  WHERE id = ?
`,
      [customer_id],
    );

    const customerCurrency = customerRows[0]?.currency || "USD";

    /* ── Generate Invoice Number ── */
    let invoiceNumber;

    if (country_code) {
      const [seqRows] = await conn.query(
        `SELECT id, prefix, current_number
         FROM zv_invoice_sequences
         WHERE country_code = ?
         LIMIT 1
         FOR UPDATE`,
        [country_code.toUpperCase()],
      );

      if (seqRows.length) {
        const seq = seqRows[0];
        const nextNum = seq.current_number + 1;
        invoiceNumber = `${seq.prefix}${nextNum}`;
        await conn.query(
          `UPDATE zv_invoice_sequences SET current_number = ? WHERE id = ?`,
          [nextNum, seq.id],
        );
      }
    }

    if (!invoiceNumber) {
      invoiceNumber = "INV-" + Date.now().toString().slice(-6);
    }

    /* ── Calculations ── */
    let subtotal = 0;
    items.forEach((item) => {
      subtotal += Number(item.quantity) * Number(item.rate);
    });

    const discount_amt = subtotal * (discount_pct / 100);
    const after_discount = subtotal - discount_amt;
    const tds_amt = after_discount * (tds_pct / 100);

    // India GST
    let total_gst_amt = 0;
    gst_lines.forEach((g) => {
      total_gst_amt += after_discount * (g.rate / 100);
    });

    // ★ USA Tax — recalculate server-side for safety
    const calc_tax_amt = after_discount * (Number(tax_pct) / 100);

    // ★ HK/CN VAT — recalculate server-side for safety
    const calc_vat_amt = after_discount * (Number(vat_pct) / 100);

    const total =
      after_discount -
      tds_amt +
      total_gst_amt +
      calc_tax_amt +
      calc_vat_amt +
      Number(adjustment);

    const exchangeRate = await getRate(customerCurrency);

    const subtotalUSD = Number((subtotal / exchangeRate).toFixed(2));

    const totalUSD = Number((total / exchangeRate).toFixed(2));

    const [invoiceResult] = await conn.query(
      `INSERT INTO zv_invoices
   (
    invoice_number,
    customer_id,
    address_id,
    bank_detail_id,
    project_id,

    reference,
    subject,
    job,
    contact_person,

    invoice_date,
    due_date,

    subtotal,
    discount_pct,
    discount_amt,
    after_discount,

    tds_pct,
    tds_amt,

    tax_pct,
    tax_amt,

    vat_pct,
    vat_amt,

    total_gst_amt,
    adjustment,

    total,

    currency_code,
    exchange_rate,
    subtotal_usd,
    total_usd,
    invoice_exchange_date,

    notes,
    terms,
    created_by,
    balance_due
   )
   VALUES
   (
   ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
   )`,
      [
        invoiceNumber,
        customer_id,
        address_id || null,
        bank_detail_id || null,
        project_id || null,

        reference || null,
        job || null,
        job || null,
        contact_person || null,

        invoice_date,
        due_date,

        subtotal,
        discount_pct,
        discount_amt,
        after_discount,

        tds_pct,
        tds_amt,

        Number(tax_pct) || 0,
        calc_tax_amt,

        Number(vat_pct) || 0,
        calc_vat_amt,

        total_gst_amt,
        adjustment,

        total,

        customerCurrency,
        exchangeRate,
        subtotalUSD,
        totalUSD,
        new Date(),

        notes,
        terms,
        userId,
        total,
      ],
    );

    const invoiceId = invoiceResult.insertId;

    /* ── Insert Items ── */
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const amount = Number(item.quantity) * Number(item.rate);
      await conn.query(
        `INSERT INTO zv_invoice_items
         (invoice_id, description, quantity, rate, amount, sort_order)
         VALUES (?,?,?,?,?,?)`,
        [invoiceId, item.description, item.quantity, item.rate, amount, i + 1],
      );
    }

    /* ── Insert GST Lines (India only) ── */
    for (let i = 0; i < gst_lines.length; i++) {
      const gst = gst_lines[i];
      const gstAmount = after_discount * (gst.rate / 100);
      await conn.query(
        `INSERT INTO zv_invoice_gst_lines
         (invoice_id, gst_type, rate, is_custom, gst_amount, sort_order)
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
      invoice_number: invoiceNumber,
    });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
};

exports.updateInvoice = async (req, res) => {
  const conn = await db.promise().getConnection();

  try {
    await conn.beginTransaction();

    const { id } = req.params;

    const {
      customer_id,
      address_id,
      bank_detail_id,
      project_id,
      job,
      contact_person,
      invoice_date,
      due_date,
      discount_pct = 0,
      tds_pct = 0,
      adjustment = 0,
      notes,
      terms,
      status,
      tax_pct = 0,
      vat_pct = 0,
      items = [],
      gst_lines = [],
    } = req.body;

    /* ── Recalculate ── */
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

    const calc_tax_amt = after_discount * (Number(tax_pct) / 100);
    const calc_vat_amt = after_discount * (Number(vat_pct) / 100);

    const total =
      after_discount -
      tds_amt +
      total_gst_amt +
      calc_tax_amt +
      calc_vat_amt +
      Number(adjustment);

    /* ── Update Invoice ── */
    await conn.query(
      `UPDATE zv_invoices SET
        customer_id    = ?,
        address_id     = ?,
        bank_detail_id = ?,
        project_id     = ?,
        job            = ?,
        subject        = ?,
        contact_person = ?,
        invoice_date   = ?,
        due_date       = ?,
        subtotal       = ?,
        discount_pct   = ?,
        discount_amt   = ?,
        after_discount = ?,
        tds_pct        = ?,
        tds_amt        = ?,
        tax_pct        = ?,
        tax_amt        = ?,
        vat_pct        = ?,
        vat_amt        = ?,
        total_gst_amt  = ?,
        adjustment     = ?,
        total          = ?,
        notes          = ?,
        terms          = ?,
        status         = ?
       WHERE id = ?`,
      [
        customer_id,
        address_id || null,
        bank_detail_id || null,
        project_id || null,
        job || null,
        job || null, // keep subject in sync
        contact_person || null,
        invoice_date,
        due_date,
        subtotal,
        discount_pct,
        discount_amt,
        after_discount,
        tds_pct,
        tds_amt,
        Number(tax_pct) || 0,
        calc_tax_amt,
        Number(vat_pct) || 0,
        calc_vat_amt,
        total_gst_amt,
        adjustment,
        total,
        notes,
        terms,
        status,
        id,
      ],
    );

    /* ── Replace Items ── */
    await conn.query(`DELETE FROM zv_invoice_items WHERE invoice_id = ?`, [id]);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const amount = Number(item.quantity) * Number(item.rate);
      await conn.query(
        `INSERT INTO zv_invoice_items (invoice_id, description, quantity, rate, amount, sort_order) VALUES (?,?,?,?,?,?)`,
        [id, item.description, item.quantity, item.rate, amount, i + 1],
      );
    }

    /* ── Replace GST Lines ── */
    await conn.query(`DELETE FROM zv_invoice_gst_lines WHERE invoice_id = ?`, [
      id,
    ]);
    for (let i = 0; i < gst_lines.length; i++) {
      const gst = gst_lines[i];
      const gstAmount = after_discount * (gst.rate / 100);
      await conn.query(
        `INSERT INTO zv_invoice_gst_lines (invoice_id, gst_type, rate, is_custom, gst_amount, sort_order) VALUES (?,?,?,?,?,?)`,
        [id, gst.gst_type, gst.rate, gst.is_custom || 0, gstAmount, i + 1],
      );
    }

    await conn.commit();
    res.json({ success: true, message: "Invoice updated successfully" });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    // ✅ Auto mark overdue
    await db.promise().query(`
      UPDATE zv_invoices
      SET status = 'overdue'
      WHERE due_date < CURDATE()
      AND status NOT IN ('paid','cancelled','overdue')
    `);

    // ✅ Get invoices
    const [rows] = await db.promise().query(`
      SELECT
        i.id,
        i.invoice_number,

        -- Customer
        c.name AS customer_name,
        c.company_name AS customer_company,
        c.currency AS customer_currency,
        c.id AS customer_id,

        -- ✅ Customer Billing Country
        ca.country AS customer_country,

        -- Company Address
        sa.city AS company_addr_city,
        sa.country AS company_addr_country,

        -- Bank
        bd.bank_name,
        bd.account_number AS bank_account_number,

        -- Invoice
        i.reference,
        i.invoice_date,
        i.due_date,
        i.subtotal,
        i.total,
        i.status,
        i.created_at,
        i.total_paid,
        i.balance_due,
        i.quote_number

      FROM zv_invoices i

      JOIN zv_customers c
        ON c.id = i.customer_id

      -- ✅ Customer billing address
      LEFT JOIN zv_customer_addresses ca
        ON ca.customer_id = c.id
       AND ca.address_type = 'billing'

      -- Company Address
      LEFT JOIN zv_company_addresses sa
        ON sa.id = i.address_id

      -- Bank
      LEFT JOIN zv_bank_details bd
        ON bd.id = i.bank_detail_id

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

exports.getInvoiceById = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    // =========================
    // MAIN INVOICE
    // =========================

    const [invoiceRows] = await db.promise().query(
      `SELECT
        i.*,

        -- Customer
        c.name         AS customer_name,
        c.company_name AS customer_company,
        c.currency     AS customer_currency,

        -- Project
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

        -- Bank
        bd.id             AS bank_detail_id,
        bd.bank_name      AS bank_name,
        bd.branch         AS bank_branch,
        bd.account_name   AS bank_account_name,
        bd.account_number AS bank_account_number,
        bd.ifsc_code      AS bank_ifsc,
        bd.swift_code     AS bank_swift,
        bd.currency       AS bank_currency

      FROM zv_invoices i

      JOIN zv_customers c
        ON c.id = i.customer_id

      LEFT JOIN zv_projects p
        ON p.id = i.project_id

      LEFT JOIN zv_company_addresses sa
        ON sa.id = i.address_id

      LEFT JOIN zv_bank_details bd
        ON bd.id = i.bank_detail_id

      WHERE i.id = ?`,
      [invoiceId],
    );

    if (invoiceRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const invoice = invoiceRows[0];

    // =========================
    // ITEMS
    // =========================

    const [items] = await db.promise().query(
      `
      SELECT
        id,
        description,
        quantity,
        rate,
        amount,
        sort_order
      FROM zv_invoice_items
      WHERE invoice_id = ?
      ORDER BY sort_order ASC
      `,
      [invoiceId],
    );

    // =========================
    // GST
    // =========================

    const [gstLines] = await db.promise().query(
      `
      SELECT
        id,
        gst_type,
        rate,
        is_custom,
        gst_amount,
        sort_order
      FROM zv_invoice_gst_lines
      WHERE invoice_id = ?
      ORDER BY sort_order ASC
      `,
      [invoiceId],
    );

    // =========================
    // CUSTOMER ADDRESSES
    // =========================

    const [addressRows] = await db.promise().query(
      `
      SELECT
        address_type,
        country,
        address,
        city,
        state,
        pincode,
        fax,
        work_phone,
        mobile
      FROM zv_customer_addresses
      WHERE customer_id = ?
      `,
      [invoice.customer_id],
    );

    // =========================
    // BILLING / SHIPPING
    // =========================

    const billingAddress =
      addressRows.find((a) => a.address_type === "billing") || null;

    const shippingAddress =
      addressRows.find((a) => a.address_type === "shipping") || null;

    // =========================
    // RESPONSE
    // =========================

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

        // ✅ Billing Address
        billingAddress,

        // ✅ Shipping Address
        shippingAddress,

        // ✅ Bank Details
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
//       bank_detail_id,
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

//     // Get customer currency
//     const [customerRows] = await conn.query(
//       `SELECT currency
//    FROM zv_customers
//    WHERE id = ?`,
//       [customer_id],
//     );

//     const customerCurrency = customerRows[0]?.currency || "USD";

//     // Convert to USD
//     const exchangeRate = await getRate(customerCurrency);

//     const subtotalUSD = Number((subtotal / exchangeRate).toFixed(2));

//     const totalUSD = Number((total / exchangeRate).toFixed(2));

//     /* UPDATE INVOICE HEADER */

//     await conn.query(
//       `UPDATE zv_invoices SET
//     customer_id=?,
//     address_id=?,
//     bank_detail_id=?,
//     project_id=?,

//     reference=?,
//     invoice_date=?,
//     due_date=?,
//     subject=?,

//     subtotal=?,
//     discount_pct=?,
//     discount_amt=?,
//     after_discount=?,

//     tds_pct=?,
//     tds_amt=?,

//     total_gst_amt=?,
//     adjustment=?,
//     total=?,

//     currency_code=?,
//     exchange_rate=?,
//     subtotal_usd=?,
//     total_usd=?,
//     invoice_exchange_date=?,

//     notes=?,
//     terms=?,
//     status=?

//    WHERE id=?`,
//       [
//         customer_id,
//         address_id || null,
//         bank_detail_id || null,
//         req.body.project_id || null,

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

//         customerCurrency,
//         exchangeRate,
//         subtotalUSD,
//         totalUSD,
//         new Date(),

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
      job,
      contact_person,
      discount_pct = 0,
      tds_pct = 0,
      adjustment = 0,
      notes,
      terms,
      items = [],
      gst_lines = [],
      tax_pct = 0,
      vat_pct = 0,
    } = req.body;

    /* CHECK IF INVOICE EXISTS */
    const [check] = await conn.query("SELECT id FROM zv_invoices WHERE id=?", [invoiceId]);

    if (check.length === 0) {
      await conn.rollback();
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

    // Calculate tax and VAT amounts
    const tax_amt = after_discount * (tax_pct / 100);
    const vat_amt = after_discount * (vat_pct / 100);

    const total = after_discount - tds_amt + total_gst_amt + tax_amt + vat_amt + Number(adjustment);

    // Get customer currency
    const [customerRows] = await conn.query(
      `SELECT currency FROM zv_customers WHERE id = ?`,
      [customer_id],
    );

    const customerCurrency = customerRows[0]?.currency || "USD";

    // Convert to USD
    const exchangeRate = await getRate(customerCurrency);
    const subtotalUSD = Number((subtotal / exchangeRate).toFixed(2));
    const totalUSD = Number((total / exchangeRate).toFixed(2));

    // Get total paid amount for balance due calculation
    const [paymentRows] = await conn.query(
      `SELECT COALESCE(SUM(amount), 0) as paid_amount 
       FROM zv_payments 
       WHERE invoice_id = ? AND status IN ('completed', 'success', 'paid')`,
      [invoiceId]
    );

    const paidAmount = Number(paymentRows[0]?.paid_amount) || 0;
    const balanceDue = total - paidAmount;

    /* UPDATE INVOICE HEADER */
    await conn.query(
      `UPDATE zv_invoices SET
        customer_id = ?,
        address_id = ?,
        bank_detail_id = ?,
        project_id = ?,

        reference = ?,
        invoice_date = ?,
        due_date = ?,
        subject = ?,
        job = ?,
        contact_person = ?,

        subtotal = ?,
        discount_pct = ?,
        discount_amt = ?,
        after_discount = ?,

        tds_pct = ?,
        tds_amt = ?,

        tax_pct = ?,
        tax_amt = ?,

        vat_pct = ?,
        vat_amt = ?,

        total_gst_amt = ?,
        adjustment = ?,
        total = ?,

        currency_code = ?,
        exchange_rate = ?,
        subtotal_usd = ?,
        total_usd = ?,
        invoice_exchange_date = ?,

        notes = ?,
        terms = ?,
        status = ?,

        balance_due = ?

      WHERE id = ?`,
      [
        customer_id,
        address_id || null,
        bank_detail_id || null,
        req.body.project_id || null,

        reference,
        invoice_date,
        due_date,
        subject,
        job || null,
        contact_person || null,

        subtotal,
        discount_pct,
        discount_amt,
        after_discount,

        tds_pct,
        tds_amt,

        tax_pct || 0,
        tax_amt,

        vat_pct || 0,
        vat_amt,

        total_gst_amt,
        adjustment,
        total,

        customerCurrency,
        exchangeRate,
        subtotalUSD,
        totalUSD,
        new Date(),

        notes,
        terms,
        req.body.status || "sent",

        balanceDue,  // Updated balance due
        invoiceId,
      ],
    );

    /* =========================
       ITEMS SYNC LOGIC
       ========================= */
    const [existingItems] = await conn.query(
      "SELECT id FROM zv_invoice_items WHERE invoice_id = ?",
      [invoiceId],
    );

    const existingIds = existingItems.map((i) => i.id);
    const requestIds = items.filter((i) => i.id).map((i) => i.id);

    const itemsToDelete = existingIds.filter((id) => !requestIds.includes(id));

    for (let id of itemsToDelete) {
      await conn.query("DELETE FROM zv_invoice_items WHERE id = ?", [id]);
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const amount = Number(item.quantity) * Number(item.rate);

      if (item.id) {
        await conn.query(
          `UPDATE zv_invoice_items
           SET description = ?, quantity = ?, rate = ?, amount = ?, sort_order = ?
           WHERE id = ?`,
          [item.description, item.quantity, item.rate, amount, i + 1, item.id],
        );
      } else {
        await conn.query(
          `INSERT INTO zv_invoice_items
           (invoice_id, description, quantity, rate, amount, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [invoiceId, item.description, item.quantity, item.rate, amount, i + 1],
        );
      }
    }

    /* =========================
       GST SYNC LOGIC
       ========================= */
    const [existingGST] = await conn.query(
      "SELECT id FROM zv_invoice_gst_lines WHERE invoice_id = ?",
      [invoiceId],
    );

    const existingGstIds = existingGST.map((g) => g.id);
    const requestGstIds = gst_lines.filter((g) => g.id).map((g) => g.id);

    const gstToDelete = existingGstIds.filter((id) => !requestGstIds.includes(id));

    for (let id of gstToDelete) {
      await conn.query("DELETE FROM zv_invoice_gst_lines WHERE id = ?", [id]);
    }

    for (let i = 0; i < gst_lines.length; i++) {
      const gst = gst_lines[i];
      const gstAmount = after_discount * (gst.rate / 100);

      if (gst.id) {
        await conn.query(
          `UPDATE zv_invoice_gst_lines
           SET gst_type = ?, rate = ?, is_custom = ?, gst_amount = ?, sort_order = ?
           WHERE id = ?`,
          [gst.gst_type, gst.rate, gst.is_custom || 0, gstAmount, i + 1, gst.id],
        );
      } else {
        await conn.query(
          `INSERT INTO zv_invoice_gst_lines
           (invoice_id, gst_type, rate, is_custom, gst_amount, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [invoiceId, gst.gst_type, gst.rate, gst.is_custom || 0, gstAmount, i + 1],
        );
      }
    }

    await conn.commit();

    res.json({
      success: true,
      message: "Invoice updated successfully",
      data: {
        invoice_id: invoiceId,
        total: total,
        balance_due: balanceDue,
      },
    });
  } catch (error) {
    await conn.rollback();
    console.error("Update invoice error:", error);
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

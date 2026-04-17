const db = require("../config/db");

exports.createPayment = async (req, res) => {

  const conn = await db.promise().getConnection();

  try {

    await conn.beginTransaction();

    const userId = req.user.id;

    const {
      customer_id,
      invoice_id,
      amount,
      payment_date,
      payment_mode,
      reference,
      notes
    } = req.body;

    if (!customer_id || !invoice_id || !amount) {
      return res.status(400).json({
        success:false,
        message:"Required fields missing"
      });
    }

    /* GET INVOICE */

    const [invRows] = await conn.query(
      "SELECT total, total_paid FROM zv_invoices WHERE id=?",
      [invoice_id]
    );

    if (invRows.length === 0) {
      return res.status(404).json({
        success:false,
        message:"Invoice not found"
      });
    }

    const invoice = invRows[0];

    const newTotalPaid = Number(invoice.total_paid) + Number(amount);
    const balanceDue = Number(invoice.total) - newTotalPaid;

    /* DETERMINE STATUS */

    let status = "partial";

    if (newTotalPaid >= invoice.total) {
      status = "paid";
    }

    /* GENERATE PAYMENT NUMBER */

    const paymentNumber = "PAY-" + Date.now().toString().slice(-6);

    /* INSERT PAYMENT */

    await conn.query(
      `INSERT INTO zv_payments
      (customer_id,invoice_id,amount,payment_date,payment_mode,reference,notes,payment_number,status,created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        customer_id,
        invoice_id,
        amount,
        payment_date,
        payment_mode,
        reference,
        notes,
        paymentNumber,
        status,
        userId
      ]
    );

    /* UPDATE INVOICE */

    await conn.query(
      `UPDATE zv_invoices SET
        total_paid = ?,
        balance_due = ?,
        status = ?
      WHERE id = ?`,
      [
        newTotalPaid,
        balanceDue < 0 ? 0 : balanceDue,
        status,
        invoice_id
      ]
    );

    await conn.commit();

    res.json({
      success:true,
      message:"Payment recorded successfully"
    });

  } catch (error) {

    await conn.rollback();

    res.status(500).json({
      success:false,
      message:error.message
    });

  } finally {

    conn.release();

  }

};





exports.getAllPayments = async (req, res) => {

  try {

    const [rows] = await db.promise().query(`
      SELECT
        p.id,
        p.payment_number,
        p.payment_date,
        p.amount,
        p.payment_mode,
        p.reference,
        p.notes,
        p.status,

        c.name AS customer_name,
        c.currency AS customer_currency,
        i.invoice_number

      FROM zv_payments p
      JOIN zv_customers c ON c.id = p.customer_id
      JOIN zv_invoices i ON i.id = p.invoice_id

      ORDER BY p.payment_date DESC
    `);

    res.json({
      success: true,
      total: rows.length,
      data: rows
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
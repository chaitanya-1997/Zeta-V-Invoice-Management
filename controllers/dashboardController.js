const db = require("../config/db");

exports.getInvoiceStatusCounts = async (req, res) => {

  try {

    // 🔥 AUTO UPDATE OVERDUE FIRST
    await db.promise().query(`
      UPDATE zv_invoices
      SET status = 'overdue'
      WHERE due_date < CURDATE()
      AND status NOT IN ('paid', 'cancelled', 'overdue')
    `);

    // 🔥 COUNT ALL STATUSES
    const [rows] = await db.promise().query(`
      SELECT
        SUM(CASE WHEN status = 'paid'     THEN 1 ELSE 0 END) AS paid,
        SUM(CASE WHEN status = 'partial'  THEN 1 ELSE 0 END) AS partial,
        SUM(CASE WHEN status = 'overdue'  THEN 1 ELSE 0 END) AS overdue,
        SUM(CASE WHEN status = 'sent'     THEN 1 ELSE 0 END) AS sent
      FROM zv_invoices
    `);

    res.json({
      success: true,
      data: {
        paid: Number(rows[0].paid || 0),
        partial: Number(rows[0].partial || 0),
        overdue: Number(rows[0].overdue || 0),
        sent: Number(rows[0].sent || 0),
      }
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};


exports.getTotalRevenue = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        COUNT(*) AS totalInvoices,
        COALESCE(SUM(total_usd),0) AS totalRevenueUSD,
        COALESCE(SUM(balance_due),0) AS totalOutstanding
      FROM zv_invoices
    `);

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// exports.getRevenueByCountry = async (req, res) => {
//   try {
//     const [rows] = await db.promise().query(`
//       SELECT
//         currency_code,
//         COUNT(*) AS invoiceCount,
//         SUM(total) AS revenue
//       FROM zv_invoices
//       GROUP BY currency_code
//       ORDER BY revenue DESC
//     `);

//     res.json({
//       success: true,
//       data: rows
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };


exports.getRevenueByCountry = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        DATE_FORMAT(invoice_date, '%Y-%m') AS month,
        currency_code,
        COUNT(*) AS invoiceCount,
        SUM(total) AS revenue
      FROM zv_invoices
      GROUP BY DATE_FORMAT(invoice_date, '%Y-%m'), currency_code
      ORDER BY month ASC, revenue DESC
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMonthlyRevenue = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        DATE_FORMAT(invoice_date,'%Y-%m') AS month,
        SUM(total_usd) AS revenueUSD
      FROM zv_invoices
      GROUP BY DATE_FORMAT(invoice_date,'%Y-%m')
      ORDER BY month ASC
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
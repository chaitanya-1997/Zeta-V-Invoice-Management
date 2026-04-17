const db = require("../config/db");

/* INSERT QUOTE */

exports.insertQuote = async (conn, data) => {
  const [result] = await conn.query(
    `INSERT INTO zv_quotes
    (quote_number,customer_id,reference,quote_date,expiry_date,subject,
     subtotal,discount_pct,discount_amt,after_discount,
     tds_pct,tds_amt,total_gst_amt,adjustment,total,
     notes,terms,created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      data.quoteNumber,
      data.customer_id,
      data.reference,
      data.quote_date,
      data.expiry_date,
      data.subject,
      data.subtotal,
      data.discount_pct,
      data.discount_amt,
      data.after_discount,
      data.tds_pct,
      data.tds_amt,
      data.total_gst_amt,
      data.adjustment,
      data.total,
      data.notes,
      data.terms,
      data.userId,
    ],
  );

  return result.insertId;
};

/* INSERT ITEMS */

exports.insertItems = async (conn, quoteId, items) => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const amount = Number(item.qty) * Number(item.rate);

    await conn.query(
      `INSERT INTO zv_quote_items
      (quote_id,sort_order,description,qty,rate,amount)
      VALUES (?,?,?,?,?,?)`,
      [quoteId, i + 1, item.description, item.qty, item.rate, amount],
    );
  }
};

/* INSERT GST */

exports.insertGST = async (conn, quoteId, gstLines, afterDiscount) => {
  for (let g of gstLines) {
    const amount = afterDiscount * (g.rate / 100);

    await conn.query(
      `INSERT INTO zv_quote_gst_lines
      (quote_id,gst_type,rate,is_custom,amount)
      VALUES (?,?,?,?,?)`,
      [quoteId, g.gst_type, g.rate, g.is_custom || 0, amount],
    );
  }
};

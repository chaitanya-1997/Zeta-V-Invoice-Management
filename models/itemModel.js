// const db = require("../config/db");

// // Create a new item
// exports.createItem = (data, callback) => {
//   const sql = `
//     INSERT INTO zv_items
//     (user_id,type,name,description,rate,unit,tax_preference)
//     VALUES (?,?,?,?,?,?,?)
//   `;

//   db.query(
//     sql,
//     [
//       data.user_id,
//       data.type,
//       data.name,
//       data.description,
//       data.rate,
//       data.unit,
//       data.tax_preference,
//     ],
//     callback,
//   );
// };

// // Get all items with creator's name
// exports.getAllItems = (callback) => {
//   const sql = `
//     SELECT 
//       i.id,
//       i.type,
//       i.name,
//       i.description,
//       i.rate,
//       i.unit,
//       i.tax_preference,
//       i.created_at,
//       u.name AS created_by
//     FROM zv_items i
//     LEFT JOIN zv_users u ON i.user_id = u.id
//     ORDER BY i.created_at DESC
//   `;

//   db.query(sql, callback);
// };

// // Update an item
// exports.updateItem = (id, data, callback) => {
//   const sql = `
//         UPDATE zv_items
//         SET type = ?, name = ?, description = ?, rate = ?, unit = ?, tax_preference = ?
//         WHERE id = ?
//     `;
//   db.query(
//     sql,
//     [
//       data.type,
//       data.name,
//       data.description,
//       data.rate,
//       data.unit,
//       data.tax_preference,
//       id,
//     ],
//     callback,
//   );
// };

// // Delete an item
// exports.deleteItem = (id, callback) => {
//   const sql = `DELETE FROM zv_items WHERE id = ?`;
//   db.query(sql, [id], callback);
// };











const db = require("../config/db");

const COUNTRIES = [
  { code: "IN", currency: "INR" },
  { code: "HK", currency: "HKD" },
  { code: "US", currency: "USD" },
  { code: "CN", currency: "CNY" },
];

// ── Create item + all 4 rates ──────────────────────────────
exports.createItem = async (data) => {
  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO zv_items (user_id, type, name, description, unit)
       VALUES (?, ?, ?, ?, ?)`,
      [data.user_id, data.type, data.name, data.description || null, data.unit || null]
    );

    const itemId = result.insertId;

    for (const c of COUNTRIES) {
      const rate = Number(data.rates?.[c.code] || 0);
      await conn.query(
        `INSERT INTO zv_item_rates (item_id, country_code, currency, rate)
         VALUES (?, ?, ?, ?)`,
        [itemId, c.code, c.currency, rate]
      );
    }

    await conn.commit();
    return itemId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// ── Get all items with rates ────────────────────────────────
exports.getAllItems = async () => {
  const [items] = await db.promise().query(
    `SELECT i.id, i.type, i.name, i.description, i.unit, i.created_at,
            u.name AS created_by
     FROM zv_items i
     LEFT JOIN zv_users u ON i.user_id = u.id
     ORDER BY i.created_at DESC`
  );

  if (!items.length) return [];

  const ids = items.map(i => i.id);
  const [rates] = await db.promise().query(
    `SELECT item_id, country_code, currency, rate
     FROM zv_item_rates WHERE item_id IN (?)`,
    [ids]
  );

  // Embed rates into each item as { IN: { currency, rate }, HK: {...}, ... }
  return items.map(item => ({
    ...item,
    rates: rates
      .filter(r => r.item_id === item.id)
      .reduce((acc, r) => {
        acc[r.country_code] = { currency: r.currency, rate: Number(r.rate) };
        return acc;
      }, {}),
  }));
};

// ── Get single item ─────────────────────────────────────────
exports.getItemById = async (id) => {
  const [items] = await db.promise().query(
    `SELECT id, type, name, description, unit FROM zv_items WHERE id = ?`, [id]
  );
  if (!items.length) return null;

  const [rates] = await db.promise().query(
    `SELECT country_code, currency, rate FROM zv_item_rates WHERE item_id = ?`, [id]
  );

  return {
    ...items[0],
    rates: rates.reduce((acc, r) => {
      acc[r.country_code] = { currency: r.currency, rate: Number(r.rate) };
      return acc;
    }, {}),
  };
};

// ── Update item + rates ─────────────────────────────────────
exports.updateItem = async (id, data) => {
  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE zv_items SET type=?, name=?, description=?, unit=? WHERE id=?`,
      [data.type, data.name, data.description || null, data.unit || null, id]
    );

    for (const c of COUNTRIES) {
      const rate = Number(data.rates?.[c.code] || 0);
      await conn.query(
        `INSERT INTO zv_item_rates (item_id, country_code, currency, rate)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE rate = VALUES(rate)`,
        [id, c.code, c.currency, rate]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// ── Delete item (rates cascade) ─────────────────────────────
exports.deleteItem = async (id) => {
  await db.promise().query(`DELETE FROM zv_items WHERE id = ?`, [id]);
};
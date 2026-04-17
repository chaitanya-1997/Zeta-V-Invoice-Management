const db = require("../config/db");

// Create a new item
exports.createItem = (data, callback) => {
  const sql = `
    INSERT INTO zv_items
    (user_id,type,name,description,rate,unit,tax_preference)
    VALUES (?,?,?,?,?,?,?)
  `;

  db.query(
    sql,
    [
      data.user_id,
      data.type,
      data.name,
      data.description,
      data.rate,
      data.unit,
      data.tax_preference,
    ],
    callback,
  );
};

// Get all items with creator's name
exports.getAllItems = (callback) => {
  const sql = `
    SELECT 
      i.id,
      i.type,
      i.name,
      i.description,
      i.rate,
      i.unit,
      i.tax_preference,
      i.created_at,
      u.name AS created_by
    FROM zv_items i
    LEFT JOIN zv_users u ON i.user_id = u.id
    ORDER BY i.created_at DESC
  `;

  db.query(sql, callback);
};

// Update an item
exports.updateItem = (id, data, callback) => {
  const sql = `
        UPDATE zv_items
        SET type = ?, name = ?, description = ?, rate = ?, unit = ?, tax_preference = ?
        WHERE id = ?
    `;
  db.query(
    sql,
    [
      data.type,
      data.name,
      data.description,
      data.rate,
      data.unit,
      data.tax_preference,
      id,
    ],
    callback,
  );
};

// Delete an item
exports.deleteItem = (id, callback) => {
  const sql = `DELETE FROM zv_items WHERE id = ?`;
  db.query(sql, [id], callback);
};


const db = require("../config/db");


exports.getAllTaxes = async (req, res) => {
  try {

    const [rows] = await db.promise().query(
      "SELECT * FROM zv_tax_rates ORDER BY id DESC"
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
};





exports.createTax = async (req, res) => {

  const conn = await db.promise().getConnection();

  try {

    await conn.beginTransaction();

    const { name, rate, type, is_default } = req.body;

    if (!name || !rate) {
      return res.status(400).json({
        success:false,
        message:"Name and rate required"
      });
    }

    // 🔥 If default → reset all
    if (is_default) {
      await conn.query(
        "UPDATE zv_tax_rates SET is_default = 0"
      );
    }

    await conn.query(
      `INSERT INTO zv_tax_rates
       (name, rate, type, is_default)
       VALUES (?,?,?,?)`,
      [
        name,
        rate,
        type || "Percentage",
        is_default ? 1 : 0
      ]
    );

    await conn.commit();

    res.json({
      success:true,
      message:"Tax created successfully"
    });

  } catch (err) {

    await conn.rollback();

    res.status(500).json({
      success:false,
      message: err.message
    });

  } finally {
    conn.release();
  }

};





exports.updateTax = async (req, res) => {

  const conn = await db.promise().getConnection();

  try {

    await conn.beginTransaction();

    const id = req.params.id;

    const { name, rate, type, is_default } = req.body;

    // check exists
    const [check] = await conn.query(
      "SELECT id FROM zv_tax_rates WHERE id=?",
      [id]
    );

    if (check.length === 0) {
      return res.status(404).json({
        success:false,
        message:"Tax not found"
      });
    }

    // 🔥 handle default
    if (is_default) {
      await conn.query(
        "UPDATE zv_tax_rates SET is_default = 0"
      );
    }

    await conn.query(
      `UPDATE zv_tax_rates SET
        name=?,
        rate=?,
        type=?,
        is_default=?
      WHERE id=?`,
      [
        name,
        rate,
        type,
        is_default ? 1 : 0,
        id
      ]
    );

    await conn.commit();

    res.json({
      success:true,
      message:"Tax updated successfully"
    });

  } catch (err) {

    await conn.rollback();

    res.status(500).json({
      success:false,
      message: err.message
    });

  } finally {
    conn.release();
  }

};




exports.deleteTax = async (req, res) => {

  try {

    const id = req.params.id;

    const [check] = await db.promise().query(
      "SELECT id FROM zv_tax_rates WHERE id=?",
      [id]
    );

    if (check.length === 0) {
      return res.status(404).json({
        success:false,
        message:"Tax not found"
      });
    }

    await db.promise().query(
      "DELETE FROM zv_tax_rates WHERE id=?",
      [id]
    );

    res.json({
      success:true,
      message:"Tax deleted successfully"
    });

  } catch (err) {

    res.status(500).json({
      success:false,
      message: err.message
    });

  }

};
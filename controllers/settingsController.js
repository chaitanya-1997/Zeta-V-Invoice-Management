const db  = require('../config/db');
const multer = require('multer');
const path = require('path');

/* ═══════════════════════════════════════════════════════════════
   COMPANY PROFILE
═══════════════════════════════════════════════════════════════ */

exports.getCompanyProfile = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT * FROM zv_company_profile WHERE id = 1`
    );

    // If no row yet, return empty defaults
    if (rows.length === 0) {
      return res.json({ success: true, profile: null });
    }

    res.json({ success: true, profile: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCompanyProfile = async (req, res) => {
  try {
    const {
      company_name, tax_id, email, phone, website,
      street, city, state, zip, country, currency,
    } = req.body;

    const logoPath = req.file ? req.file.path : null;

    await db.promise().query(
      `UPDATE zv_company_profile SET
        company_name = ?,
        tax_id       = ?,
        email        = ?,
        phone        = ?,
        website      = ?,
        street       = ?,
        city         = ?,
        state        = ?,
        zip          = ?,
        country      = ?,
        currency     = ?,
        logo_path    = IFNULL(?, logo_path)
       WHERE id = 1`,
      [
        company_name || null,
        tax_id       || null,
        email        || null,
        phone        || null,
        website      || null,
        street       || null,
        city         || null,
        state        || null,
        zip          || null,
        country      || null,
        currency     || 'INR',
        logoPath,
      ]
    );

    res.json({ success: true, message: 'Company profile updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════════
   TAX RATES
═══════════════════════════════════════════════════════════════ */

exports.getTaxRates = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT * FROM zv_tax_rates ORDER BY created_at ASC`
    );
    res.json({ success: true, taxes: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTaxRate = async (req, res) => {
  try {
    const { name, rate, type, is_default } = req.body;

    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Tax name is required' });
    if (!rate)         return res.status(400).json({ success: false, message: 'Rate is required' });

    // If setting as default — clear existing default first
    if (is_default) {
      await db.promise().query(`UPDATE zv_tax_rates SET is_default = 0`);
    }

    const [result] = await db.promise().query(
      `INSERT INTO zv_tax_rates (name, rate, type, is_default) VALUES (?, ?, ?, ?)`,
      [name.trim(), Number(rate), type || 'Percentage', is_default ? 1 : 0]
    );

    res.json({ success: true, message: 'Tax rate added', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTaxRate = async (req, res) => {
  try {
    const { id }               = req.params;
    const { name, rate, type, is_default } = req.body;

    if (is_default) {
      await db.promise().query(`UPDATE zv_tax_rates SET is_default = 0`);
    }

    await db.promise().query(
      `UPDATE zv_tax_rates SET name = ?, rate = ?, type = ?, is_default = ? WHERE id = ?`,
      [name?.trim(), Number(rate), type || 'Percentage', is_default ? 1 : 0, id]
    );

    res.json({ success: true, message: 'Tax rate updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTaxRate = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.promise().query(
      `SELECT id FROM zv_tax_rates WHERE id = ?`, [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Tax rate not found' });
    }

    await db.promise().query(`DELETE FROM zv_tax_rates WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Tax rate deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════════
   TAX SETTINGS
═══════════════════════════════════════════════════════════════ */

exports.getTaxSettings = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT * FROM zv_tax_settings WHERE id = 1`
    );
    res.json({ success: true, settings: rows[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTaxSettings = async (req, res) => {
  try {
    const { tax_number, tax_inclusive, show_tax_on_invoice, compound_tax } = req.body;

    await db.promise().query(
      `UPDATE zv_tax_settings SET
        tax_number          = ?,
        tax_inclusive       = ?,
        show_tax_on_invoice = ?,
        compound_tax        = ?
       WHERE id = 1`,
      [
        tax_number           || null,
        tax_inclusive        ? 1 : 0,
        show_tax_on_invoice  ? 1 : 0,
        compound_tax         ? 1 : 0,
      ]
    );

    res.json({ success: true, message: 'Tax settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════════
   PREFERENCES
═══════════════════════════════════════════════════════════════ */

exports.getPreferences = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT * FROM zv_preferences WHERE id = 1`
    );
    res.json({ success: true, preferences: rows[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePreferences = async (req, res) => { 
  try {
    const {
      invoice_prefix, invoice_start_number, invoice_due_days,
      invoice_notes, invoice_footer,
      estimate_prefix, estimate_start_number, estimate_expiry_days,
      date_format, number_format, timezone, language,
      email_on_payment, email_on_overdue, email_on_quote_accepted,
      send_payment_reminder, reminder_days_before,
    } = req.body;

    await db.promise().query(
      `UPDATE zv_preferences SET
        invoice_prefix        = ?,
        invoice_start_number  = ?,
        invoice_due_days      = ?,
        invoice_notes         = ?,
        invoice_footer        = ?,
        estimate_prefix       = ?,
        estimate_start_number = ?,
        estimate_expiry_days  = ?,
        date_format           = ?,
        number_format         = ?,
        timezone              = ?,
        language              = ?,
        email_on_payment      = ?,
        email_on_overdue      = ?,
        email_on_quote_accepted  = ?,
        send_payment_reminder = ?,
        reminder_days_before  = ?
       WHERE id = 1`,
      [
        invoice_prefix        || 'INV',
        invoice_start_number  || 1001,
        invoice_due_days      || 30,
        invoice_notes         || null,
        invoice_footer        || null,
        estimate_prefix       || 'EST',
        estimate_start_number || 1001,
        estimate_expiry_days  || 15,
        date_format           || 'DD/MM/YYYY',
        number_format         || '1,00,000.00',
        timezone              || 'Asia/Kolkata',
        language              || 'en',
        email_on_payment         ? 1 : 0,
        email_on_overdue         ? 1 : 0,
        email_on_quote_accepted  ? 1 : 0,
        send_payment_reminder    ? 1 : 0,
        reminder_days_before  || 3,
      ]
    );

    res.json({ success: true, message: 'Preferences updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
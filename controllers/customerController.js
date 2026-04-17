const db = require("../config/db");

// exports.createCustomer = async (req, res) => {

//   const connection = await db.promise().getConnection();

//   try {

//     await connection.beginTransaction();

//     const userId = req.user.id;

//     const {
//       customerType,
//       name,
//       companyName,
//       email,
//       phone,
//       currency,
//       panNumber,
//       paymentTerms,
//       billingAddress,
//       shippingAddress,
//       contacts,
//       remarks
//     } = req.body;

//     /* INSERT CUSTOMER */

//     const [customerResult] = await connection.query(
//       `INSERT INTO zv_customers
//       (customer_type,name,company_name,email,phone,currency,pan_number,payment_terms,remarks,created_by)
//       VALUES (?,?,?,?,?,?,?,?,?,?)`,
//       [
//         customerType,
//         name,
//         companyName,
//         email,
//         phone,
//         currency,
//         panNumber,
//         paymentTerms,
//         remarks,
//         userId
//       ]
//     );

//     const customerId = customerResult.insertId;

//     /* INSERT BILLING ADDRESS */

//     await connection.query(
//       `INSERT INTO zv_customer_addresses
//       (customer_id,address_type,country,address,city,state,pincode,fax,work_phone,mobile)
//       VALUES (?,?,?,?,?,?,?,?,?,?)`,
//       [
//         customerId,
//         "billing",
//         billingAddress.country,
//         billingAddress.address,
//         billingAddress.city,
//         billingAddress.state,
//         billingAddress.pincode,
//         billingAddress.fax,
//         billingAddress.workPhone,
//         billingAddress.mobile
//       ]
//     );

//     /* INSERT SHIPPING ADDRESS */

//     await connection.query(
//       `INSERT INTO zv_customer_addresses
//       (customer_id,address_type,country,address,city,state,pincode,fax,work_phone,mobile)
//       VALUES (?,?,?,?,?,?,?,?,?,?)`,
//       [
//         customerId,
//         "shipping",
//         shippingAddress.country,
//         shippingAddress.address,
//         shippingAddress.city,
//         shippingAddress.state,
//         shippingAddress.pincode,
//         shippingAddress.fax,
//         shippingAddress.workPhone,
//         shippingAddress.mobile
//       ]
//     );

//     /* INSERT CONTACTS */

//     if (contacts && contacts.length > 0) {

//       for (const c of contacts) {

//         await connection.query(
//           `INSERT INTO zv_customer_contacts
//           (customer_id,name,email,work_phone,mobile)
//           VALUES (?,?,?,?,?)`,
//           [
//             customerId,
//             c.name,
//             c.email,
//             c.workPhone,
//             c.mobile
//           ]
//         );

//       }

//     }

//     /* INSERT DOCUMENTS */

//     if (req.files && req.files.length > 0) {

//       for (const file of req.files) {

//         await connection.query(
//           `INSERT INTO zv_customer_documents
//           (customer_id,file_name,file_path)
//           VALUES (?,?,?)`,
//           [
//             customerId,
//             file.originalname,
//             file.path
//           ]
//         );

//       }

//     }

//     await connection.commit();

//     res.json({
//       success: true,
//       message: "Customer created successfully",
//       customerId
//     });

//   } catch (error) {

//     await connection.rollback();

//     res.status(500).json({
//       success: false,
//       message: error.message
//     });

//   } finally {

//     connection.release();

//   }

// };

exports.createCustomer = async (req, res) => {
  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.user.id;

    // ── Parse FormData JSON strings safely ───────────────────
    let {
      customerType,
      name,
      companyName,
      email,
      phone,
      currency,
      panNumber,
      paymentTerms,
      remarks,
      billingAddress,
      shippingAddress,
      contacts,
    } = req.body;

    try {
      billingAddress = JSON.parse(billingAddress || "{}");
    } catch {
      billingAddress = {};
    }
    try {
      shippingAddress = JSON.parse(shippingAddress || "{}");
    } catch {
      shippingAddress = {};
    }
    try {
      contacts = JSON.parse(contacts || "[]");
    } catch {
      contacts = [];
    }

    // ── Basic validation ──────────────────────────────────────
    if (!name?.trim())
      return res
        .status(400)
        .json({ success: false, message: "Customer name is required" });
    if (!email?.trim())
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    // ── INSERT CUSTOMER ───────────────────────────────────────
    const [customerResult] = await connection.query(
      `INSERT INTO zv_customers
       (customer_type, name, company_name, email, phone, currency, pan_number, payment_terms, remarks, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerType?.trim() || "company",
        name.trim(),
        companyName?.trim() || null,
        email.trim(),
        phone?.trim() || null,
        currency || "USD",
        panNumber?.trim() || null,
        paymentTerms || 30,
        remarks?.trim() || null,
        userId,
      ],
    );

    const customerId = customerResult.insertId;

    // ── Helper: skip INSERT if address has no real data ───────
    const hasData = (obj) =>
      obj &&
      typeof obj === "object" &&
      Object.values(obj).some((v) => v?.toString().trim());

    // ── INSERT BILLING ADDRESS ────────────────────────────────
    if (hasData(billingAddress)) {
      await connection.query(
        `INSERT INTO zv_customer_addresses
         (customer_id, address_type, country, address, city, state, pincode, fax, work_phone, mobile)
         VALUES (?, 'billing', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customerId,
          billingAddress.country?.trim() || null,
          billingAddress.address?.trim() || null,
          billingAddress.city?.trim() || null,
          billingAddress.state?.trim() || null,
          billingAddress.pincode?.trim() || null,
          billingAddress.fax?.trim() || null,
          billingAddress.workPhone?.trim() || null,
          billingAddress.mobile?.trim() || null,
        ],
      );
    }

    // ── INSERT SHIPPING ADDRESS ───────────────────────────────
    if (hasData(shippingAddress)) {
      await connection.query(
        `INSERT INTO zv_customer_addresses
         (customer_id, address_type, country, address, city, state, pincode, fax, work_phone, mobile)
         VALUES (?, 'shipping', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customerId,
          shippingAddress.country?.trim() || null,
          shippingAddress.address?.trim() || null,
          shippingAddress.city?.trim() || null,
          shippingAddress.state?.trim() || null,
          shippingAddress.pincode?.trim() || null,
          shippingAddress.fax?.trim() || null,
          shippingAddress.workPhone?.trim() || null,
          shippingAddress.mobile?.trim() || null,
        ],
      );
    }

    // ── INSERT CONTACTS (skip empty rows) ─────────────────────
    if (Array.isArray(contacts) && contacts.length > 0) {
      const validContacts = contacts.filter(
        (c) =>
          c.name?.trim() ||
          c.email?.trim() ||
          c.workPhone?.trim() ||
          c.mobile?.trim(),
      );

      for (const c of validContacts) {
        await connection.query(
          `INSERT INTO zv_customer_contacts
           (customer_id, name, email, work_phone, mobile)
           VALUES (?, ?, ?, ?, ?)`,
          [
            customerId,
            c.name?.trim() || null,
            c.email?.trim() || null,
            c.workPhone?.trim() || null,
            c.mobile?.trim() || null,
          ],
        );
      }
    }

    // ── INSERT DOCUMENTS ──────────────────────────────────────
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await connection.query(
          `INSERT INTO zv_customer_documents
           (customer_id, file_name, file_path)
           VALUES (?, ?, ?)`,
          [customerId, file.originalname, file.path],
        );
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: "Customer created successfully",
      customerId,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const [customers] = await db.promise().query(`
      SELECT * FROM zv_customers ORDER BY created_at DESC
    `);

    const results = [];

    for (const customer of customers) {
      const [addresses] = await db
        .promise()
        .query(`SELECT * FROM zv_customer_addresses WHERE customer_id = ?`, [
          customer.id,
        ]);

      const billingAddress = addresses.find(
        (a) => a.address_type === "billing",
      );
      const shippingAddress = addresses.find(
        (a) => a.address_type === "shipping",
      );

      const [contacts] = await db.promise().query(
        `SELECT name,email,work_phone AS workPhone,mobile 
         FROM zv_customer_contacts WHERE customer_id = ?`,
        [customer.id],
      );

      const [documents] = await db.promise().query(
        `SELECT file_name,file_path 
         FROM zv_customer_documents WHERE customer_id = ?`,
        [customer.id],
      );

      results.push({
        id: customer.id,
        customerType: customer.customer_type,
        name: customer.name,
        companyName: customer.company_name,
        email: customer.email,
        phone: customer.phone,
        currency: customer.currency,
        panNumber: customer.pan_number,
        paymentTerms: customer.payment_terms,
        remarks: customer.remarks,

        billingAddress: billingAddress
          ? {
              country: billingAddress.country,
              address: billingAddress.address,
              city: billingAddress.city,
              state: billingAddress.state,
              pincode: billingAddress.pincode,
              fax: billingAddress.fax,
              workPhone: billingAddress.work_phone,
              mobile: billingAddress.mobile,
            }
          : null,

        shippingAddress: shippingAddress
          ? {
              country: shippingAddress.country,
              address: shippingAddress.address,
              city: shippingAddress.city,
              state: shippingAddress.state,
              pincode: shippingAddress.pincode,
              fax: shippingAddress.fax,
              workPhone: shippingAddress.work_phone,
              mobile: shippingAddress.mobile,
            }
          : null,

        contacts,

        documents,
      });
    }

    res.json({
      success: true,
      count: results.length,
      customers: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateCustomer = async (req, res) => {
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    const customerId = req.params.id;

    let {
      customerType,
      name,
      companyName,
      email,
      phone,
      currency,
      panNumber,
      paymentTerms,
      remarks,
      billingAddress,
      shippingAddress,
      contacts,
    } = req.body;

    try {
      billingAddress = JSON.parse(billingAddress || "{}");
    } catch {
      billingAddress = {};
    }
    try {
      shippingAddress = JSON.parse(shippingAddress || "{}");
    } catch {
      shippingAddress = {};
    }
    try {
      contacts = JSON.parse(contacts || "[]");
    } catch {
      contacts = [];
    }

    if (!name?.trim())
      return res
        .status(400)
        .json({ success: false, message: "Customer name is required" });
    if (!email?.trim())
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    // UPDATE customer
    await connection.query(
      `UPDATE zv_customers SET
        customer_type=?, name=?, company_name=?, email=?, phone=?,
        currency=?, pan_number=?, payment_terms=?, remarks=?
       WHERE id=?`,
      [
        customerType?.trim() || "company",
        name.trim(),
        companyName?.trim() || null,
        email.trim(),
        phone?.trim() || null,
        currency || "USD",
        panNumber?.trim() || null,
        paymentTerms || 30,
        remarks?.trim() || null,
        customerId,
      ],
    );

    // Helper — skip insert/update if address has no real data
    const hasData = (obj) =>
      obj &&
      typeof obj === "object" &&
      Object.values(obj).some((v) => v?.toString().trim());

    // DELETE old addresses, re-insert only if data present
    await connection.query(
      `DELETE FROM zv_customer_addresses WHERE customer_id = ?`,
      [customerId],
    );

    if (hasData(billingAddress)) {
      await connection.query(
        `INSERT INTO zv_customer_addresses
         (customer_id, address_type, country, address, city, state, pincode, fax, work_phone, mobile)
         VALUES (?, 'billing', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customerId,
          billingAddress.country?.trim() || null,
          billingAddress.address?.trim() || null,
          billingAddress.city?.trim() || null,
          billingAddress.state?.trim() || null,
          billingAddress.pincode?.trim() || null,
          billingAddress.fax?.trim() || null,
          billingAddress.workPhone?.trim() || null,
          billingAddress.mobile?.trim() || null,
        ],
      );
    }

    if (hasData(shippingAddress)) {
      await connection.query(
        `INSERT INTO zv_customer_addresses
         (customer_id, address_type, country, address, city, state, pincode, fax, work_phone, mobile)
         VALUES (?, 'shipping', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customerId,
          shippingAddress.country?.trim() || null,
          shippingAddress.address?.trim() || null,
          shippingAddress.city?.trim() || null,
          shippingAddress.state?.trim() || null,
          shippingAddress.pincode?.trim() || null,
          shippingAddress.fax?.trim() || null,
          shippingAddress.workPhone?.trim() || null,
          shippingAddress.mobile?.trim() || null,
        ],
      );
    }

    // DELETE old contacts, re-insert only valid rows
    await connection.query(
      `DELETE FROM zv_customer_contacts WHERE customer_id = ?`,
      [customerId],
    );

    if (Array.isArray(contacts) && contacts.length > 0) {
      const valid = contacts.filter(
        (c) =>
          c.name?.trim() ||
          c.email?.trim() ||
          c.workPhone?.trim() ||
          c.mobile?.trim(),
      );
      for (const c of valid) {
        await connection.query(
          `INSERT INTO zv_customer_contacts (customer_id, name, email, work_phone, mobile)
           VALUES (?, ?, ?, ?, ?)`,
          [
            customerId,
            c.name?.trim() || null,
            c.email?.trim() || null,
            c.workPhone?.trim() || null,
            c.mobile?.trim() || null,
          ],
        );
      }
    }

    // Append new documents if uploaded
    if (req.files?.length > 0) {
      for (const file of req.files) {
        await connection.query(
          `INSERT INTO zv_customer_documents (customer_id, file_name, file_path)
           VALUES (?, ?, ?)`,
          [customerId, file.originalname, file.path],
        );
      }
    }

    await connection.commit();
    res.json({ success: true, message: "Customer updated successfully" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

exports.deleteCustomer = async (req, res) => {
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    const customerId = req.params.id;

    const [existing] = await connection.query(
      `SELECT id FROM zv_customers WHERE id = ?`,
      [customerId],
    );
    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    // Delete related rows first (FK order)
    await connection.query(
      `DELETE FROM zv_customer_documents WHERE customer_id = ?`,
      [customerId],
    );
    await connection.query(
      `DELETE FROM zv_customer_contacts  WHERE customer_id = ?`,
      [customerId],
    );
    await connection.query(
      `DELETE FROM zv_customer_addresses WHERE customer_id = ?`,
      [customerId],
    );
    await connection.query(`DELETE FROM zv_customers          WHERE id = ?`, [
      customerId,
    ]);

    await connection.commit();
    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

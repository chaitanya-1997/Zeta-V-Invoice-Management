// const itemModel = require("../models/itemModel");

// // Create a new item :-

// exports.createItem = (req, res) => {
//   const user_id = req.user.id; // from JWT token

//   const { type, name, description, rate, unit, tax_preference } = req.body;

//   if (!type || !name || !rate) {
//     return res.status(400).json({
//       success: false,
//       message: "Required fields missing",
//     });
//   }

//   const itemData = {
//     user_id,
//     type,
//     name,
//     description,
//     rate,
//     unit,
//     tax_preference,
//   };

//   itemModel.createItem(itemData, (err, result) => {
//     if (err) {
//       return res.status(500).json({
//         success: false,
//         message: err.message,
//       });
//     }

//     res.json({
//       success: true,
//       message: "Item created successfully",
//     });
//   });
// };

// // Get all items :-

// exports.getItems = (req, res) => {
//   itemModel.getAllItems((err, results) => {
//     if (err) {
//       return res.status(500).json({
//         success: false,
//         message: err.message,
//       });
//     }

//     res.json({
//       success: true,
//       count: results.length,
//       items: results,
//     });
//   });
// };

// // Update an item :-

// exports.updateItem = (req, res) => {
//   const id = req.params.id;
//   const { type, name, description, rate, unit, tax_preference } = req.body;

//   const data = {
//     type,
//     name,
//     description,
//     rate,
//     unit,
//     tax_preference,
//   };

//   itemModel.updateItem(id, data, (err, result) => {
//     if (err) {
//       return res.status(500).json({
//         success: false,
//         message: err.message,
//       });
//     }

//     res.json({
//       success: true,
//       message: "Item updated successfully",
//     });
//   });
// };

// // Delete an item :-

// exports.deleteItem = (req, res) => {
//   const id = req.params.id;
//   itemModel.deleteItem(id, (err, result) => {
//     if (err) {
//       return res.status(500).json({
//         success: false,
//         message: err.message,
//       });
//     }

//     res.json({
//       success: true,
//       message: "Item deleted successfully",
//     });
//   });
// };











const itemModel = require("../models/itemModel");

const REQUIRED_COUNTRIES = ["IN", "HK", "US", "CN"];

exports.createItem = async (req, res) => {
  try {
    const { type, name, description, unit, rates } = req.body;

    if (!type || !name)
      return res.status(400).json({ success: false, message: "Type and name are required" });

    // Validate all 4 rates are present and > 0
    for (const code of REQUIRED_COUNTRIES) {
      if (!rates?.[code] || Number(rates[code]) <= 0)
        return res.status(400).json({
          success: false,
          message: `Rate for ${code} is required and must be greater than 0`,
        });
    }

    const itemId = await itemModel.createItem({
      user_id: req.user.id, type, name, description, unit, rates,
    });

    res.json({ success: true, message: "Item created successfully", item_id: itemId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getItems = async (req, res) => {
  try {
    const items = await itemModel.getAllItems();
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await itemModel.getItemById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { type, name, description, unit, rates } = req.body;

    for (const code of REQUIRED_COUNTRIES) {
      if (!rates?.[code] || Number(rates[code]) <= 0)
        return res.status(400).json({
          success: false,
          message: `Rate for ${code} is required and must be greater than 0`,
        });
    }

    await itemModel.updateItem(req.params.id, { type, name, description, unit, rates });
    res.json({ success: true, message: "Item updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    await itemModel.deleteItem(req.params.id);
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
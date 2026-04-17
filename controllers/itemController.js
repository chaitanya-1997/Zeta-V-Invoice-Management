const itemModel = require("../models/itemModel");

// Create a new item :-

exports.createItem = (req, res) => {
  const user_id = req.user.id; // from JWT token

  const { type, name, description, rate, unit, tax_preference } = req.body;

  if (!type || !name || !rate) {
    return res.status(400).json({
      success: false,
      message: "Required fields missing",
    });
  }

  const itemData = {
    user_id,
    type,
    name,
    description,
    rate,
    unit,
    tax_preference,
  };

  itemModel.createItem(itemData, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json({
      success: true,
      message: "Item created successfully",
    });
  });
};

// Get all items :-

exports.getItems = (req, res) => {
  itemModel.getAllItems((err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json({
      success: true,
      count: results.length,
      items: results,
    });
  });
};

// Update an item :-

exports.updateItem = (req, res) => {
  const id = req.params.id;
  const { type, name, description, rate, unit, tax_preference } = req.body;

  const data = {
    type,
    name,
    description,
    rate,
    unit,
    tax_preference,
  };

  itemModel.updateItem(id, data, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json({
      success: true,
      message: "Item updated successfully",
    });
  });
};

// Delete an item :-

exports.deleteItem = (req, res) => {
  const id = req.params.id;
  itemModel.deleteItem(id, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json({
      success: true,
      message: "Item deleted successfully",
    });
  });
};

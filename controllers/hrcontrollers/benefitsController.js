const benefitsModel = require("../../models/hrmodels/benefitsModel");

// Get all benefits
exports.getAllBenefits = async (req, res) => {
  try {
    benefitsModel.getAllBenefits((err, benefits) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching benefits",
          error: err.message
        });
      }
      return res.status(200).json({
        success: true,
        data: benefits
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create benefit
exports.createBenefit = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Benefit name is required"
      });
    }
    
    const benefitData = {
      name: name.trim(),
      description: description || null,
      created_by: req.user?.id || 1
    };
    
    benefitsModel.createBenefit(benefitData, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error creating benefit",
          error: err.message
        });
      }
      
      return res.status(201).json({
        success: true,
        message: "Benefit created successfully",
        benefit: { id: result.insertId, ...benefitData }
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update benefit
exports.updateBenefit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Benefit name is required"
      });
    }
    
    benefitsModel.updateBenefit(id, { name, description }, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error updating benefit",
          error: err.message
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Benefit not found"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Benefit updated successfully"
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete benefit
exports.deleteBenefit = async (req, res) => {
  try {
    const { id } = req.params;
    
    benefitsModel.deleteBenefit(id, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error deleting benefit",
          error: err.message
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Benefit deleted successfully"
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const departmentModel = require("../../models/hrmodels/departmentModel");

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    departmentModel.getAllDepartments((err, departments) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching departments",
          error: err.message
        });
      }
      return res.status(200).json({
        success: true,
        data: departments
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create department
exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Department name is required"
      });
    }
    
    const departmentData = {
      name: name.trim(),
      description: description || null,
      created_by: req.user?.id || 1
    };
    
    departmentModel.createDepartment(departmentData, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error creating department",
          error: err.message
        });
      }
      
      return res.status(201).json({
        success: true,
        message: "Department created successfully",
        department: { id: result.insertId, ...departmentData }
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Department name is required"
      });
    }
    
    departmentModel.updateDepartment(id, { name, description }, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error updating department",
          error: err.message
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Department not found"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Department updated successfully"
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    departmentModel.deleteDepartment(id, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error deleting department",
          error: err.message
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Department deleted successfully"
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
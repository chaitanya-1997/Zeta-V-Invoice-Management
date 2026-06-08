const teamModel = require("../../models/hrmodels/hrTeamModel");

// Create team member
exports.createTeamMember = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // Validation
    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email and role are required"
      });
    }

    // Check if email already exists
    teamModel.checkEmailExists(email, null, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error checking email",
          error: err.message
        });
      }

      if (result && result.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already exists"
        });
      }

      const teamData = {
        name,
        email,
        role,
        created_by: req.user?.id || 1
      };

      teamModel.createTeamMember(teamData, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: "Error creating team member",
            error: err.message
          });
        }

        // Fetch the created member
        teamModel.getTeamMemberById(result.insertId, (err, member) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Error fetching created member"
            });
          }

          return res.status(201).json({
            success: true,
            message: "Team member created successfully",
            data: member[0]
          });
        });
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// Get all team members
exports.getAllTeamMembers = async (req, res) => {
  try {
    teamModel.getAllTeamMembers((err, members) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching team members",
          error: err.message
        });
      }

      return res.status(200).json({
        success: true,
        count: members.length,
        data: members
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get team member by ID
exports.getTeamMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    teamModel.getTeamMemberById(id, (err, member) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching team member",
          error: err.message
        });
      }

      if (!member || member.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Team member not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: member[0]
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update team member
exports.updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email and role are required"
      });
    }

    // Check if email exists for other members
    teamModel.checkEmailExists(email, id, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error checking email"
        });
      }

      if (result && result.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already exists for another member"
        });
      }

      teamModel.updateTeamMember(id, { name, email, role }, (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error updating team member",
            error: err.message
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "Team member not found or cannot be updated"
          });
        }

        // Fetch updated member
        teamModel.getTeamMemberById(id, (err, member) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Error fetching updated member"
            });
          }

          return res.status(200).json({
            success: true,
            message: "Team member updated successfully",
            data: member[0]
          });
        });
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete team member
exports.deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    // First check if member exists and is not Admin
    teamModel.getTeamMemberById(id, (err, member) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error checking team member"
        });
      }

      if (!member || member.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Team member not found"
        });
      }

      if (member[0].role === 'Admin') {
        return res.status(400).json({
          success: false,
          message: "Cannot delete Admin user"
        });
      }

      teamModel.deleteTeamMember(id, (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error deleting team member",
            error: err.message
          });
        }

        return res.status(200).json({
          success: true,
          message: "Team member deleted successfully"
        });
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const bcrypt = require('bcrypt');
const profileModel = require("../../models/hrmodels/hrProfileModel");
const uploadProfilePhoto = require('../../middleware/hrmiddleware/uploadProfilePhoto');
const db = require("../../config/db");
// Get current user profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    profileModel.getProfileById(userId, (err, profile) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching profile",
          error: err.message,
        });
      }
      
      if (!profile || profile.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }
      
      const user = profile[0];
      delete user.password;
      
      return res.status(200).json({
        success: true,
        data: user,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { first_name, last_name, phone, job_title, department, bio } = req.body;
    
    const profileData = {
      first_name,
      last_name,
      phone,
      job_title,
      department,
      bio,
      profile_image: req.file ? `/uploads/profiles/${req.file.filename}` : null,
    };
    
    profileModel.updateProfile(userId, profileData, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error updating profile",
          error: err.message,
        });
      }
      
      // Fetch updated profile
      profileModel.getProfileById(userId, (err, updatedProfile) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error fetching updated profile",
          });
        }
        
        const user = updatedProfile[0];
        delete user.password;
        
        return res.status(200).json({
          success: true,
          message: "Profile updated successfully",
          data: user,
        });
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { current_password, new_password } = req.body;
    
    // Get user with password
    profileModel.getProfileById(userId, async (err, profile) => {
      if (err || !profile || profile.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      
      const user = profile[0];
      
      // Verify current password (if user has password set)
      if (user.password) {
        const isValid = await bcrypt.compare(current_password, user.password);
        if (!isValid) {
          return res.status(400).json({
            success: false,
            message: "Current password is incorrect",
          });
        }
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(new_password, 10);
      
      profileModel.updatePassword(userId, hashedPassword, (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error updating password",
            error: err.message,
          });
        }
        
        return res.status(200).json({
          success: true,
          message: "Password changed successfully",
        });
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get company settings
exports.getCompanySettings = async (req, res) => {
  try {
    profileModel.getCompanySettings((err, settings) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching company settings",
          error: err.message,
        });
      }
      
      return res.status(200).json({
        success: true,
        data: settings || {},
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update company settings
exports.updateCompanySettings = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { company_name, company_website, company_industry, company_size, company_about } = req.body;
    
    const settingsData = {
      company_name,
      company_website,
      company_industry,
      company_size,
      company_about,
      updated_by: userId,
    };
    
    profileModel.updateCompanySettings(settingsData, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error updating company settings",
          error: err.message,
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Company settings updated successfully",
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get email templates
exports.getEmailTemplates = async (req, res) => {
  try {
    profileModel.getEmailTemplates((err, templates) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching email templates",
          error: err.message,
        });
      }
      
      return res.status(200).json({
        success: true,
        data: templates || {},
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update email templates
exports.updateEmailTemplates = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { templates } = req.body;
    
    profileModel.updateEmailTemplates(JSON.stringify(templates), userId, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error updating email templates",
          error: err.message,
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Email templates updated successfully",
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get all HR users (for dropdown in candidate filters)
exports.getAllHrUsers = async (req, res) => {
  try {
    const sql = `
      SELECT 
        id, 
        first_name, 
        last_name,
        CONCAT(first_name, ' ', last_name) as full_name,
        email,
        role
      FROM hr_profiles 
      WHERE is_active = 1
      ORDER BY first_name ASC
    `;
    
    db.query(sql, (err, users) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching users",
          error: err.message
        });
      }
      
      return res.status(200).json({
        success: true,
        data: users
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
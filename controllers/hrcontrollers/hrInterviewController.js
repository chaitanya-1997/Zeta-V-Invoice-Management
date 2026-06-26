const interviewModel = require("../../models/hrmodels/hrInterviewModel");

// Create interview
exports.createInterview = async (req, res) => {
  try {
    const {
      candidate_id,
      job_id,
      team_member_id,
      interview_date,
      interview_time,
      duration,
      platform,
      meet_url,
      notes,
      status,
      result,
      send_invite
    } = req.body;

    // Validation
    if (!candidate_id || !team_member_id || !interview_date || !interview_time) {
      return res.status(400).json({
        success: false,
        message: "Candidate, team member, date and time are required"
      });
    }

    const interviewData = {
      candidate_id,
      job_id,
      team_member_id,
      interview_date,
      interview_time,
      duration: duration || 60,
      platform: platform || 'Google Meet',
      meet_url: meet_url || null,
      notes: notes || null,
      status: status || 'scheduled',
      result: result || 'pending',
      send_invite: send_invite !== undefined ? send_invite : true,
      created_by: req.user?.id || 1
    };

    interviewModel.createInterview(interviewData, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Error creating interview",
          error: err.message
        });
      }

      interviewModel.getInterviewById(result.insertId, (err, interview) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error fetching created interview"
          });
        }

        return res.status(201).json({
          success: true,
          message: "Interview scheduled successfully",
          data: interview[0]
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

// Get all interviews
exports.getAllInterviews = async (req, res) => {
  try {
    interviewModel.getAllInterviews((err, interviews) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching interviews",
          error: err.message
        });
      }

      return res.status(200).json({
        success: true,
        count: interviews.length,
        data: interviews
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get interview by ID
exports.getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;

    interviewModel.getInterviewById(id, (err, interview) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching interview",
          error: err.message
        });
      }

      if (!interview || interview.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Interview not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: interview[0]
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get interviews by date
exports.getInterviewsByDate = async (req, res) => {
  try {
    const { date } = req.params;

    interviewModel.getInterviewsByDate(date, (err, interviews) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching interviews",
          error: err.message
        });
      }

      return res.status(200).json({
        success: true,
        count: interviews.length,
        data: interviews
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update interview
exports.updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      candidate_id,
      job_id,
      team_member_id,
      interview_date,
      interview_time,
      duration,
      platform,
      meet_url,
      notes,
      status,
      result,
      send_invite
    } = req.body;

    interviewModel.updateInterview(id, {
      candidate_id,
      job_id,
      team_member_id,
      interview_date,
      interview_time,
      duration,
      platform,
      meet_url,
      notes,
      status,
      result,
      send_invite
    }, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error updating interview",
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Interview not found"
        });
      }

      interviewModel.getInterviewById(id, (err, interview) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error fetching updated interview"
          });
        }

        return res.status(200).json({
          success: true,
          message: "Interview updated successfully",
          data: interview[0]
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

// Update interview status
exports.updateInterviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, result } = req.body;

    interviewModel.updateInterviewStatus(id, status, result || 'pending', (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error updating interview status",
          error: err.message
        });
      }

      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Interview not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: `Interview ${status} successfully`
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete interview
exports.deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;

    interviewModel.deleteInterview(id, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error deleting interview",
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Interview not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Interview deleted successfully"
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get upcoming interviews
exports.getUpcomingInterviews = async (req, res) => {
  try {
    interviewModel.getUpcomingInterviews((err, interviews) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching upcoming interviews",
          error: err.message
        });
      }

      return res.status(200).json({
        success: true,
        count: interviews.length,
        data: interviews
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const jobModel = require("../../models/hrmodels/hrJobModel");

exports.createJob = async (req, res) => {
  try {
    const {
      title,
      department,
      job_type,
      experience_level,
      openings,
      location,
      work_mode,
      salary_min,
      salary_max,
      show_salary,
      description,
      deadline,
      status,
      skills,
      requirements,
      benefits,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Job title is required",
      });
    }

    const jobData = {
      title,
      department,
      job_type,
      experience_level,
      openings: openings || 1,
      location,
      work_mode,
      salary_min: salary_min || 0,
      salary_max: salary_max || 0,
      show_salary: show_salary ? 1 : 0,
      description,
      deadline,
      status: status || "draft",
      created_by: req.user?.id || null,
    };

    jobModel.createJob(jobData, (err, result) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          success: false,
          message: "Error creating job",
          error: err.message,
        });
      }

      const jobId = result.insertId;

      // Skills
      if (skills && Array.isArray(skills)) {
        skills.forEach((skill) => {
          jobModel.addSkill(jobId, skill);
        });
      }

      // Requirements
      if (requirements && Array.isArray(requirements)) {
        requirements.forEach((requirement) => {
          jobModel.addRequirement(jobId, requirement);
        });
      }

      // Benefits
      if (benefits && Array.isArray(benefits)) {
        benefits.forEach((benefit) => {
          jobModel.addBenefit(jobId, benefit);
        });
      }

      return res.status(201).json({
        success: true,
        message: "Job created successfully",
        job_id: jobId,
      });
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    jobModel.getAllJobs((err, jobs) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching jobs",
          error: err.message,
        });
      }

      return res.status(200).json({
        success: true,
        count: jobs.length,
        jobs,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    jobModel.getJobById(id, (err, job) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching job",
          error: err.message,
        });
      }

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found",
        });
      }

      return res.status(200).json({
        success: true,
        job,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      department,
      job_type,
      experience_level,
      openings,
      location,
      work_mode,
      salary_min,
      salary_max,
      show_salary,
      description,
      deadline,
      status,
      skills,
      requirements,
      benefits,
    } = req.body;

    const jobData = {
      title,
      department,
      job_type,
      experience_level,
      openings,
      location,
      work_mode,
      salary_min,
      salary_max,
      show_salary,
      description,
      deadline,
      status,
    };

    jobModel.updateJob(id, jobData, async (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error updating job",
          error: err.message,
        });
      }

      // Delete old data
      jobModel.deleteJobSkills(id);
      jobModel.deleteJobRequirements(id);
      jobModel.deleteJobBenefits(id);

      // Insert new skills
      if (skills?.length) {
        skills.forEach((skill) => {
          jobModel.addSkill(id, skill);
        });
      }

      // Insert new requirements
      if (requirements?.length) {
        requirements.forEach((req) => {
          jobModel.addRequirement(id, req);
        });
      }

      // Insert new benefits
      if (benefits?.length) {
        benefits.forEach((benefit) => {
          jobModel.addBenefit(id, benefit);
        });
      }

      return res.status(200).json({
        success: true,
        message: "Job updated successfully",
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    jobModel.deleteJob(id, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error deleting job",
          error: err.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Job deleted successfully",
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.pauseJob = async (req, res) => {
  try {
    const { id } = req.params;

    jobModel.pauseJob(id, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error pausing job",
          error: err.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Job paused successfully",
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.resumeJob = async (req, res) => {
  try {
    const { id } = req.params;

    jobModel.resumeJob(id, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error resuming job",
          error: err.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Job resumed successfully",
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
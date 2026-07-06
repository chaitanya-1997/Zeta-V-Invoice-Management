



const jobModel = require("../../models/hrmodels/hrJobModel");

// ─── Create Job ───────────────────────────────────────────────────────────────
exports.createJob = async (req, res) => {
  try {
    const {
      title, department, job_type, experience_level, required_experience,
      shift_timings, openings, location, work_mode, salary_min, salary_max,
      show_salary, description, deadline, status, skills, requirements, benefits,
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Job title is required" });
    }

    const jobData = {
      title, department, job_type, experience_level,
      required_experience: required_experience || null,
      shift_timings: shift_timings || null,
      openings: openings || 1,
      location, work_mode,
      salary_min: salary_min || 0,
      salary_max: salary_max || 0,
      show_salary: show_salary ? 1 : 0,
      description, deadline,
      status: status || "draft",
      created_by: req.user?.id || null,
    };

    jobModel.createJob(jobData, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error creating job", error: err.message });
      }

      const jobId = result.insertId;
      const jrId = result.jr_id;

      if (skills && Array.isArray(skills)) {
        skills.forEach((skill) => jobModel.addSkill(jobId, skill));
      }
      if (requirements && Array.isArray(requirements)) {
        requirements.forEach((req) => jobModel.addRequirement(jobId, req));
      }
      if (benefits && Array.isArray(benefits)) {
        benefits.forEach((benefit) => jobModel.addBenefit(jobId, benefit));
      }

      return res.status(201).json({
        success: true,
        message: "Job created successfully",
        job_id: jobId,
        jr_id: jrId,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// ─── Get All Jobs (with application counts) ───────────────────────────────────
exports.getAllJobs = async (req, res) => {
  try {
    jobModel.getAllJobs((err, jobs) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Error fetching jobs", error: err.message });
      }

      jobModel.getCandidateCountForAllJobs((err, counts) => {
        if (err) {
          console.error("Error fetching job counts:", err);
          // Still return jobs even if counts fail
          return res.status(200).json({ success: true, count: jobs.length, jobs });
        }

        const countMap = {};
        counts.forEach((item) => {
          countMap[item.id] = item.total_applications;
        });

        const jobsWithCount = jobs.map((job) => ({
          ...job,
          application_count: countMap[job.id] || 0,
        }));

        return res.status(200).json({ success: true, count: jobsWithCount.length, jobs: jobsWithCount });
      });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



// ─── Get Job By ID (with applied + manually added candidates) ─────────────────
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    jobModel.getJobById(id, (err, job) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Error fetching job", error: err.message });
      }
      if (!job) {
        return res.status(404).json({ success: false, message: "Job not found" });
      }

      // Run 3 queries in parallel
      let completed = 0;
      let totalApplications = 0;
      let appliedCandidates = [];
      let manualCandidates = [];

      const done = () => {
        completed++;
        if (completed === 3) {
          return res.status(200).json({
            success: true,
            data: {
              ...job,
              total_applications: totalApplications,
              candidates: appliedCandidates,        // source = 'website'
              manual_candidates: manualCandidates,  // source = 'manual'
            },
          });
        }
      };

      jobModel.getCandidateCountByJobId(id, (err, countResult) => {
        if (err) console.error("Count error:", err);
        totalApplications = countResult?.[0]?.total_applications || 0;
        done();
      });

      jobModel.getAppliedCandidatesByJobId(id, (err, rows) => {
        if (err) console.error("Applied candidates error:", err);
        appliedCandidates = rows || [];
        done();
      });

      jobModel.getManuallyAddedCandidatesByJobId(id, (err, rows) => {
        if (err) console.error("Manual candidates error:", err);
        manualCandidates = rows || [];
        done();
      });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Job ───────────────────────────────────────────────────────────────
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, department, job_type, experience_level, required_experience,
      shift_timings, openings, location, work_mode, salary_min, salary_max,
      show_salary, description, deadline, status, skills, requirements, benefits,
    } = req.body;

    const jobData = {
      title, department, job_type, experience_level,
      required_experience: required_experience || null,
      shift_timings: shift_timings || null,
      openings, location, work_mode, salary_min, salary_max,
      show_salary, description, deadline, status,
    };

    jobModel.updateJob(id, jobData, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Error updating job", error: err.message });
      }

      jobModel.deleteJobSkills(id);
      jobModel.deleteJobRequirements(id);
      jobModel.deleteJobBenefits(id);

      if (skills?.length) skills.forEach((s) => jobModel.addSkill(id, s));
      if (requirements?.length) requirements.forEach((r) => jobModel.addRequirement(id, r));
      if (benefits?.length) benefits.forEach((b) => jobModel.addBenefit(id, b));

      return res.status(200).json({ success: true, message: "Job updated successfully" });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Job ───────────────────────────────────────────────────────────────
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    jobModel.deleteJobPermanently(id, (err, result) => {
      if (err) {
        console.error("Delete error:", err);
        return res.status(500).json({ success: false, message: "Error deleting job", error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Job not found" });
      }
      return res.status(200).json({ success: true, message: "Job deleted successfully" });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Pause Job ────────────────────────────────────────────────────────────────
exports.pauseJob = async (req, res) => {
  try {
    const { id } = req.params;
    jobModel.pauseJob(id, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Error pausing job", error: err.message });
      }
      return res.status(200).json({ success: true, message: "Job paused successfully" });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Resume Job ───────────────────────────────────────────────────────────────
exports.resumeJob = async (req, res) => {
  try {
    const { id } = req.params;
    jobModel.resumeJob(id, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Error resuming job", error: err.message });
      }
      return res.status(200).json({ success: true, message: "Job resumed successfully" });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Picker Candidates (not yet linked to this job) ───────────────────────
exports.getPickerCandidates = async (req, res) => {
  try {
    const { id } = req.params;
    jobModel.getAllCandidatesForPicker(id, (err, candidates) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Error fetching candidates", error: err.message });
      }
      return res.status(200).json({ success: true, count: candidates.length, candidates: candidates || [] });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Add Candidates to Job (manually) ────────────────────────────────────────
exports.addCandidatesToJob = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const { candidate_ids, status } = req.body;
    const addedBy = req.user?.id || null;

    if (!candidate_ids || !Array.isArray(candidate_ids) || candidate_ids.length === 0) {
      return res.status(400).json({ success: false, message: "candidate_ids array is required" });
    }

    const validStatuses = ["applied", "shortlisted", "selected", "rejected", "withdrawn"];
    const candidateStatus = validStatuses.includes(status) ? status : "applied";

    let completed = 0;
    let errors = [];
    let added = 0;

    candidate_ids.forEach((candidateId) => {
      jobModel.addCandidateToJob(jobId, candidateId, addedBy, candidateStatus, (err) => {
        if (err) {
          console.error(`Error adding candidate ${candidateId}:`, err);
          errors.push(candidateId);
        } else {
          added++;
        }
        completed++;

        if (completed === candidate_ids.length) {
          if (errors.length > 0 && added === 0) {
            return res.status(500).json({ success: false, message: "Failed to add candidates", errors });
          }
          return res.status(200).json({
            success: true,
            message: `${added} candidate${added !== 1 ? "s" : ""} added to job successfully`,
            added,
            errors: errors.length > 0 ? errors : undefined,
          });
        }
      });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Remove Manually Added Candidate from Job ─────────────────────────────────
exports.removeCandidateFromJob = async (req, res) => {
  try {
    const { id: jobId, candidateId } = req.params;

    jobModel.removeCandidateFromJob(jobId, candidateId, (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Error removing candidate", error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found in this job or is a website applicant (cannot remove)",
        });
      }
      return res.status(200).json({ success: true, message: "Candidate removed from job" });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// ─── Update Candidate Status on a Job ────────────────────────────────────────
exports.updateCandidateJobStatus = async (req, res) => {
  try {
    const { id: jobId, candidateId } = req.params;
    const { status } = req.body;

    const validStatuses = ["applied", "shortlisted", "selected", "rejected", "withdrawn"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    jobModel.updateCandidateJobStatus(jobId, candidateId, status, (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Error updating status", error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Candidate-job record not found" });
      }
      return res.status(200).json({ success: true, message: "Status updated successfully" });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



// In your job controller file

// Get active jobs count only
exports.getActiveJobsCount = async (req, res) => {
  try {
    jobModel.getActiveJobsCount((err, result) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Error fetching active jobs count", 
          error: err.message 
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          active_jobs: result[0]?.count || 0
        }
      });
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get total jobs count only
exports.getTotalJobsCount = async (req, res) => {
  try {
    jobModel.getTotalJobsCount((err, result) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Error fetching total jobs count", 
          error: err.message 
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          total_jobs: result[0]?.count || 0
        }
      });
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};


const candidateModel = require("../../models/hrmodels/candidateModel");
const toast = require("react-hot-toast");
const fs = require("fs");
const path = require("path");

// ── CREATE CANDIDATE ──
// exports.createCandidate = async (req, res) => {
//   try {
//     const {
//       first_name,
//       last_name,
//       email,
//       phone,
//       headline,
//       location,
//       experience_years,
//       current_company,
//       expected_salary,
//       source,
//       education,
//       rating,
//       status,
//       skills,
//     } = req.body;

//     // Validation
//     if (!first_name || !last_name || !email || !phone) {
//       return res.status(400).json({
//         success: false,
//         message: "First name, last name, email, and phone are required.",
//       });
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email format.",
//       });
//     }

//     const candidateData = {
//       first_name,
//       last_name,
//       email,
//       phone,
//       headline: headline || "",
//       location: location || "",
//       experience_years: experience_years || 0,
//       current_company: current_company || "",
//       expected_salary: expected_salary || 0,
//       source: source || "Direct",
//       education: education || "",
//       avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
//         `${first_name} ${last_name}`
//       )}&background=3b82f6&color=fff`,
//       resume_file_name: req.file ? req.file.filename : null,
//       resume_url: req.file ? `/uploads/resumes/${req.file.filename}` : null,
//       rating: rating || 3,
//       status: status || "pending",
//       created_by: req.user.id,
//     };

//     candidateModel.createCandidate(candidateData, (err, result) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({
//           success: false,
//           message: "Error creating candidate",
//           error: err.message,
//         });
//       }

//       const candidateId = result.insertId;

//       // Add skills if provided
//       if (skills && Array.isArray(skills) && skills.length > 0) {
//         skills.forEach((skill) => {
//           candidateModel.addCandidateSkill(
//             candidateId,
//             skill.name || skill,
//             skill.category || null,
//             (err) => {
//               if (err) console.error("Error adding skill:", err);
//             }
//           );
//         });
//       }

//       return res.status(201).json({
//         success: true,
//         message: "Candidate created successfully",
//         candidate: {
//           id: candidateId,
//           ...candidateData,
//         },
//       });
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };


exports.createCandidate = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      headline,
      location,
      experience_years,
      current_company,
      expected_salary,
      source,
      education,
      rating,
      status,
    } = req.body;

    // Parse skills from FormData
    let skills = [];

    if (req.body.skills) {
      try {
        skills =
          typeof req.body.skills === "string"
            ? JSON.parse(req.body.skills)
            : req.body.skills;
      } catch (err) {
        console.error("Skills Parse Error:", err);
        skills = [];
      }
    }

    console.log("Skills Received:", skills);

    // Validation
    if (!first_name || !last_name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email, and phone are required.",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    const candidateData = {
      first_name,
      last_name,
      email,
      phone,
      headline: headline || "",
      location: location || "",
      experience_years: Number(experience_years) || 0,
      current_company: current_company || "",
      expected_salary: Number(expected_salary) || 0,
      source: source || "Direct",
      education: education || "",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        `${first_name} ${last_name}`
      )}&background=3b82f6&color=fff`,
      resume_file_name: req.file ? req.file.filename : null,
      resume_url: req.file ? `/uploads/resumes/${req.file.filename}` : null,
      rating: Number(rating) || 3,
      status: status || "pending",
      created_by: req.user?.id || null,
    };

    candidateModel.createCandidate(candidateData, (err, result) => {
      if (err) {
        console.error("Candidate Create Error:", err);

        return res.status(500).json({
          success: false,
          message: "Error creating candidate",
          error: err.message,
        });
      }

      const candidateId = result.insertId;

      console.log("Candidate Created:", candidateId);

      // Save Skills
      if (skills && skills.length > 0) {
        skills.forEach((skill) => {
          const skillName =
            typeof skill === "string"
              ? skill
              : skill.name || "";

          const skillCategory =
            typeof skill === "object"
              ? skill.category || null
              : null;

          if (!skillName) return;

          console.log(
            "Adding Skill:",
            candidateId,
            skillName,
            skillCategory
          );

          candidateModel.addCandidateSkill(
            candidateId,
            skillName,
            skillCategory,
            (err) => {
              if (err) {
                console.error(
                  "Skill Insert Error:",
                  skillName,
                  err
                );
              } else {
                console.log(
                  "Skill Added Successfully:",
                  skillName
                );
              }
            }
          );
        });
      }

      return res.status(201).json({
        success: true,
        message: "Candidate created successfully",
        candidate: {
          id: candidateId,
          ...candidateData,
          skills,
        },
      });
    });
  } catch (error) {
    console.error("Create Candidate Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ── GET ALL CANDIDATES ──
exports.getAllCandidates = async (req, res) => {
  try {
    const {
      status,
      source,
      location,
      search,
      sortBy,
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (page - 1) * limit;

    const filter = {
      status,
      source,
      location,
      search,
      sortBy,
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    candidateModel.getAllCandidates(filter, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Error fetching candidates",
          error: err.message,
        });
      }

      // Get total count
      candidateModel.getCandidatesCount(filter, (err, countResult) => {
        return res.status(200).json({
          success: true,
          data: results,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countResult[0].total,
            pages: Math.ceil(countResult[0].total / limit),
          },
        });
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ── GET SINGLE CANDIDATE ──
exports.getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;

    candidateModel.getCandidateById(id, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Error fetching candidate",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      const candidate = results[0];

      // Get skills separately
      candidateModel.getCandidateSkills(id, (err, skillResults) => {
        if (!err && skillResults) {
          candidate.skills = skillResults;
        }

        // Get notes
        candidateModel.getCandidateNotes(id, (err, noteResults) => {
          if (!err && noteResults) {
            candidate.notes = noteResults;
          }

          // Get status history
          candidateModel.getCandidateStatusHistory(id, (err, historyResults) => {
            if (!err && historyResults) {
              candidate.status_history = historyResults;
            }

            return res.status(200).json({
              success: true,
              data: candidate,
            });
          });
        });
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ── UPDATE CANDIDATE ──
exports.updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow direct ID/email changes
    delete updateData.id;
    delete updateData.email;
    delete updateData.created_by;

    // If new resume uploaded, update resume fields
    if (req.file) {
      updateData.resume_file_name = req.file.filename;
      updateData.resume_url = `/uploads/resumes/${req.file.filename}`;
    }

    candidateModel.updateCandidate(id, updateData, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Error updating candidate",
          error: err.message,
        });
      }

      // Get updated candidate
      candidateModel.getCandidateById(id, (err, results) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error fetching updated candidate",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Candidate updated successfully",
          data: results[0],
        });
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ── UPDATE CANDIDATE STATUS ──
exports.updateCandidateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = [
      "pending",
      "shortlisted",
      "interview",
      "offer",
      "hired",
      "rejected",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    candidateModel.updateCandidateStatus(id, status, req.user.id, reason, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Error updating candidate status",
          error: err.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: `Candidate status updated to ${status}`,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ── DELETE CANDIDATE ──
exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    // Get candidate to delete resume file
    candidateModel.getCandidateById(id, (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      const candidate = results[0];

      // Delete resume file if exists
      if (candidate.resume_file_name) {
        const resumePath = path.join(
          __dirname,
          "../../uploads/resumes",
          candidate.resume_file_name
        );
        if (fs.existsSync(resumePath)) {
          fs.unlinkSync(resumePath);
        }
      }

      // Delete from database
      candidateModel.deleteCandidate(id, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: "Error deleting candidate",
            error: err.message,
          });
        }

        return res.status(200).json({
          success: true,
          message: "Candidate deleted successfully",
        });
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ── ADD CANDIDATE SKILL ──
exports.addCandidateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { skill_name, skill_category } = req.body;

    if (!skill_name) {
      return res.status(400).json({
        success: false,
        message: "Skill name is required",
      });
    }

    candidateModel.addCandidateSkill(
      id,
      skill_name,
      skill_category || null,
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: "Error adding skill",
            error: err.message,
          });
        }

        return res.status(201).json({
          success: true,
          message: "Skill added successfully",
        });
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ── GET CANDIDATE SKILLS ──
exports.getCandidateSkills = async (req, res) => {
  try {
    const { id } = req.params;

    candidateModel.getCandidateSkills(id, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Error fetching skills",
          error: err.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: results,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ── REMOVE CANDIDATE SKILL ──
exports.removeCandidateSkill = async (req, res) => {
  try {
    const { skillId } = req.params;

    candidateModel.removeCandidateSkill(skillId, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Error removing skill",
          error: err.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Skill removed successfully",
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ── ADD CANDIDATE NOTE ──
exports.addCandidateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note_type, content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Note content is required",
      });
    }

    candidateModel.addCandidateNote(
      id,
      note_type || "General",
      content,
      req.user.id,
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: "Error adding note",
            error: err.message,
          });
        }

        return res.status(201).json({
          success: true,
          message: "Note added successfully",
          data: {
            id: result.insertId,
            content,
            note_type: note_type || "General",
            created_by: req.user.id,
          },
        });
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ── GET CANDIDATE NOTES ──
exports.getCandidateNotes = async (req, res) => {
  try {
    const { id } = req.params;

    candidateModel.getCandidateNotes(id, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Error fetching notes",
          error: err.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: results,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ── UPDATE CANDIDATE NOTE ──
exports.updateCandidateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Note content is required",
      });
    }

    candidateModel.updateCandidateNote(noteId, content, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Error updating note",
          error: err.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Note updated successfully",
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ── DELETE CANDIDATE NOTE ──
exports.deleteCandidateNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    candidateModel.deleteCandidateNote(noteId, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Error deleting note",
          error: err.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Note deleted successfully",
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ── SAVE CANDIDATE ──
exports.saveCandidateByHR = async (req, res) => {
  try {
    const { id } = req.params;
    const { saved_tag } = req.body;

    candidateModel.saveCandidateByHR(id, req.user.id, saved_tag || null, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Error saving candidate",
          error: err.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Candidate saved successfully",
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ── UNSAVE CANDIDATE ──
exports.unsaveCandidateByHR = async (req, res) => {
  try {
    const { id } = req.params;

    candidateModel.unsaveCandidateByHR(id, req.user.id, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Error unsaving candidate",
          error: err.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Candidate removed from saved",
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ── GET SAVED CANDIDATES ──
exports.getSavedCandidatesByHR = async (req, res) => {
  try {
    candidateModel.getSavedCandidatesByHR(req.user.id, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Error fetching saved candidates",
          error: err.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: results,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ── GET CANDIDATE STATUS HISTORY ──
exports.getCandidateStatusHistory = async (req, res) => {
  try {
    const { id } = req.params;

    candidateModel.getCandidateStatusHistory(id, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Error fetching status history",
          error: err.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: results,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
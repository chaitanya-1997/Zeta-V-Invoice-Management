// const candidateModel = require("../../models/hrmodels/candidateModel");
// const toast = require("react-hot-toast");
// const fs = require("fs");
// const path = require("path");

// // ── CREATE CANDIDATE ──
// // exports.createCandidate = async (req, res) => {
// //   try {
// //     const {
// //       first_name,
// //       last_name,
// //       email,
// //       phone,
// //       headline,
// //       location,
// //       experience_years,
// //       current_company,
// //       expected_salary,
// //       source,
// //       education,
// //       rating,
// //       status,
// //       skills,
// //     } = req.body;

// //     // Validation
// //     if (!first_name || !last_name || !email || !phone) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "First name, last name, email, and phone are required.",
// //       });
// //     }

// //     // Validate email format
// //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// //     if (!emailRegex.test(email)) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Invalid email format.",
// //       });
// //     }

// //     const candidateData = {
// //       first_name,
// //       last_name,
// //       email,
// //       phone,
// //       headline: headline || "",
// //       location: location || "",
// //       experience_years: experience_years || 0,
// //       current_company: current_company || "",
// //       expected_salary: expected_salary || 0,
// //       source: source || "Direct",
// //       education: education || "",
// //       avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
// //         `${first_name} ${last_name}`
// //       )}&background=3b82f6&color=fff`,
// //       resume_file_name: req.file ? req.file.filename : null,
// //       resume_url: req.file ? `/uploads/resumes/${req.file.filename}` : null,
// //       rating: rating || 3,
// //       status: status || "pending",
// //       created_by: req.user.id,
// //     };

// //     candidateModel.createCandidate(candidateData, (err, result) => {
// //       if (err) {
// //         console.error(err);
// //         return res.status(500).json({
// //           success: false,
// //           message: "Error creating candidate",
// //           error: err.message,
// //         });
// //       }

// //       const candidateId = result.insertId;

// //       // Add skills if provided
// //       if (skills && Array.isArray(skills) && skills.length > 0) {
// //         skills.forEach((skill) => {
// //           candidateModel.addCandidateSkill(
// //             candidateId,
// //             skill.name || skill,
// //             skill.category || null,
// //             (err) => {
// //               if (err) console.error("Error adding skill:", err);
// //             }
// //           );
// //         });
// //       }

// //       return res.status(201).json({
// //         success: true,
// //         message: "Candidate created successfully",
// //         candidate: {
// //           id: candidateId,
// //           ...candidateData,
// //         },
// //       });
// //     });
// //   } catch (error) {
// //     console.error(error);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Server error",
// //       error: error.message,
// //     });
// //   }
// // };


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
//     } = req.body;

//     // Parse skills from FormData
//     let skills = [];

//     if (req.body.skills) {
//       try {
//         skills =
//           typeof req.body.skills === "string"
//             ? JSON.parse(req.body.skills)
//             : req.body.skills;
//       } catch (err) {
//         console.error("Skills Parse Error:", err);
//         skills = [];
//       }
//     }

//     console.log("Skills Received:", skills);

//     // Validation
//     if (!first_name || !last_name || !email || !phone) {
//       return res.status(400).json({
//         success: false,
//         message: "First name, last name, email, and phone are required.",
//       });
//     }

//     // Email validation
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
//       experience_years: Number(experience_years) || 0,
//       current_company: current_company || "",
//       expected_salary: Number(expected_salary) || 0,
//       source: source || "Direct",
//       education: education || "",
//       avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
//         `${first_name} ${last_name}`
//       )}&background=3b82f6&color=fff`,
//       resume_file_name: req.file ? req.file.filename : null,
//       resume_url: req.file ? `/uploads/resumes/${req.file.filename}` : null,
//       rating: Number(rating) || 3,
//       status: status || "pending",
//       created_by: req.user?.id || null,
//     };

//     candidateModel.createCandidate(candidateData, (err, result) => {
//       if (err) {
//         console.error("Candidate Create Error:", err);

//         return res.status(500).json({
//           success: false,
//           message: "Error creating candidate",
//           error: err.message,
//         });
//       }

//       const candidateId = result.insertId;

//       console.log("Candidate Created:", candidateId);

//       // Save Skills
//       if (skills && skills.length > 0) {
//         skills.forEach((skill) => {
//           const skillName =
//             typeof skill === "string"
//               ? skill
//               : skill.name || "";

//           const skillCategory =
//             typeof skill === "object"
//               ? skill.category || null
//               : null;

//           if (!skillName) return;

//           console.log(
//             "Adding Skill:",
//             candidateId,
//             skillName,
//             skillCategory
//           );

//           candidateModel.addCandidateSkill(
//             candidateId,
//             skillName,
//             skillCategory,
//             (err) => {
//               if (err) {
//                 console.error(
//                   "Skill Insert Error:",
//                   skillName,
//                   err
//                 );
//               } else {
//                 console.log(
//                   "Skill Added Successfully:",
//                   skillName
//                 );
//               }
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
//           skills,
//         },
//       });
//     });
//   } catch (error) {
//     console.error("Create Candidate Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

// // ── GET ALL CANDIDATES ──
// exports.getAllCandidates = async (req, res) => {
//   try {
//     const {
//       status,
//       source,
//       location,
//       search,
//       sortBy,
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const offset = (page - 1) * limit;

//     const filter = {
//       status,
//       source,
//       location,
//       search,
//       sortBy,
//       limit: parseInt(limit),
//       offset: parseInt(offset),
//     };

//     candidateModel.getAllCandidates(filter, (err, results) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({
//           success: false,
//           message: "Error fetching candidates",
//           error: err.message,
//         });
//       }

//       // Get total count
//       candidateModel.getCandidatesCount(filter, (err, countResult) => {
//         return res.status(200).json({
//           success: true,
//           data: results,
//           pagination: {
//             page: parseInt(page),
//             limit: parseInt(limit),
//             total: countResult[0].total,
//             pages: Math.ceil(countResult[0].total / limit),
//           },
//         });
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

// // ── GET SINGLE CANDIDATE ──
// exports.getCandidateById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     candidateModel.getCandidateById(id, (err, results) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({
//           success: false,
//           message: "Error fetching candidate",
//           error: err.message,
//         });
//       }

//       if (results.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: "Candidate not found",
//         });
//       }

//       const candidate = results[0];

//       // Get skills separately
//       candidateModel.getCandidateSkills(id, (err, skillResults) => {
//         if (!err && skillResults) {
//           candidate.skills = skillResults;
//         }

//         // Get notes
//         candidateModel.getCandidateNotes(id, (err, noteResults) => {
//           if (!err && noteResults) {
//             candidate.notes = noteResults;
//           }

//           // Get status history
//           candidateModel.getCandidateStatusHistory(id, (err, historyResults) => {
//             if (!err && historyResults) {
//               candidate.status_history = historyResults;
//             }

//             return res.status(200).json({
//               success: true,
//               data: candidate,
//             });
//           });
//         });
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

// // ── UPDATE CANDIDATE ──
// exports.updateCandidate = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     // Don't allow direct ID/email changes
//     delete updateData.id;
//     delete updateData.email;
//     delete updateData.created_by;

//     // If new resume uploaded, update resume fields
//     if (req.file) {
//       updateData.resume_file_name = req.file.filename;
//       updateData.resume_url = `/uploads/resumes/${req.file.filename}`;
//     }

//     candidateModel.updateCandidate(id, updateData, (err) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({
//           success: false,
//           message: "Error updating candidate",
//           error: err.message,
//         });
//       }

//       // Get updated candidate
//       candidateModel.getCandidateById(id, (err, results) => {
//         if (err) {
//           return res.status(500).json({
//             success: false,
//             message: "Error fetching updated candidate",
//           });
//         }

//         return res.status(200).json({
//           success: true,
//           message: "Candidate updated successfully",
//           data: results[0],
//         });
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

// // ── UPDATE CANDIDATE STATUS ──
// exports.updateCandidateStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, reason } = req.body;

//     if (!status) {
//       return res.status(400).json({
//         success: false,
//         message: "Status is required",
//       });
//     }

//     const validStatuses = [
//       "pending",
//       "shortlisted",
//       "interview",
//       "offer",
//       "hired",
//       "rejected",
//     ];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
//       });
//     }

//     candidateModel.updateCandidateStatus(id, status, req.user.id, reason, (err) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({
//           success: false,
//           message: "Error updating candidate status",
//           error: err.message,
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         message: `Candidate status updated to ${status}`,
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

// // ── DELETE CANDIDATE ──
// exports.deleteCandidate = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Get candidate to delete resume file
//     candidateModel.getCandidateById(id, (err, results) => {
//       if (err || results.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: "Candidate not found",
//         });
//       }

//       const candidate = results[0];

//       // Delete resume file if exists
//       if (candidate.resume_file_name) {
//         const resumePath = path.join(
//           __dirname,
//           "../../uploads/resumes",
//           candidate.resume_file_name
//         );
//         if (fs.existsSync(resumePath)) {
//           fs.unlinkSync(resumePath);
//         }
//       }

//       // Delete from database
//       candidateModel.deleteCandidate(id, (err) => {
//         if (err) {
//           console.error(err);
//           return res.status(500).json({
//             success: false,
//             message: "Error deleting candidate",
//             error: err.message,
//           });
//         }

//         return res.status(200).json({
//           success: true,
//           message: "Candidate deleted successfully",
//         });
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

// // ── ADD CANDIDATE SKILL ──
// exports.addCandidateSkill = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { skill_name, skill_category } = req.body;

//     if (!skill_name) {
//       return res.status(400).json({
//         success: false,
//         message: "Skill name is required",
//       });
//     }

//     candidateModel.addCandidateSkill(
//       id,
//       skill_name,
//       skill_category || null,
//       (err) => {
//         if (err) {
//           console.error(err);
//           return res.status(500).json({
//             success: false,
//             message: "Error adding skill",
//             error: err.message,
//           });
//         }

//         return res.status(201).json({
//           success: true,
//           message: "Skill added successfully",
//         });
//       }
//     );
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

// // ── GET CANDIDATE SKILLS ──
// exports.getCandidateSkills = async (req, res) => {
//   try {
//     const { id } = req.params;

//     candidateModel.getCandidateSkills(id, (err, results) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({
//           success: false,
//           message: "Error fetching skills",
//           error: err.message,
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         data: results,
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

// // ── REMOVE CANDIDATE SKILL ──
// exports.removeCandidateSkill = async (req, res) => {
//   try {
//     const { skillId } = req.params;

//     candidateModel.removeCandidateSkill(skillId, (err) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({
//           success: false,
//           message: "Error removing skill",
//           error: err.message,
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Skill removed successfully",
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

// // ── ADD CANDIDATE NOTE ──
// exports.addCandidateNote = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { note_type, content } = req.body;

//     if (!content) {
//       return res.status(400).json({
//         success: false,
//         message: "Note content is required",
//       });
//     }

//     candidateModel.addCandidateNote(
//       id,
//       note_type || "General",
//       content,
//       req.user.id,
//       (err, result) => {
//         if (err) {
//           console.error(err);
//           return res.status(500).json({
//             success: false,
//             message: "Error adding note",
//             error: err.message,
//           });
//         }

//         return res.status(201).json({
//           success: true,
//           message: "Note added successfully",
//           data: {
//             id: result.insertId,
//             content,
//             note_type: note_type || "General",
//             created_by: req.user.id,
//           },
//         });
//       }
//     );
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

// // ── GET CANDIDATE NOTES ──
// exports.getCandidateNotes = async (req, res) => {
//   try {
//     const { id } = req.params;

//     candidateModel.getCandidateNotes(id, (err, results) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({
//           success: false,
//           message: "Error fetching notes",
//           error: err.message,
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         data: results,
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

// // ── UPDATE CANDIDATE NOTE ──
// exports.updateCandidateNote = async (req, res) => {
//   try {
//     const { noteId } = req.params;
//     const { content } = req.body;

//     if (!content) {
//       return res.status(400).json({
//         success: false,
//         message: "Note content is required",
//       });
//     }

//     candidateModel.updateCandidateNote(noteId, content, (err) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({
//           success: false,
//           message: "Error updating note",
//           error: err.message,
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Note updated successfully",
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

// // ── DELETE CANDIDATE NOTE ──
// exports.deleteCandidateNote = async (req, res) => {
//   try {
//     const { noteId } = req.params;

//     candidateModel.deleteCandidateNote(noteId, (err) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({
//           success: false,
//           message: "Error deleting note",
//           error: err.message,
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Note deleted successfully",
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

// // ── SAVE CANDIDATE ──
// exports.saveCandidateByHR = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { saved_tag } = req.body;

//     candidateModel.saveCandidateByHR(id, req.user.id, saved_tag || null, (err) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({
//           success: false,
//           message: "Error saving candidate",
//           error: err.message,
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Candidate saved successfully",
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

// // ── UNSAVE CANDIDATE ──
// exports.unsaveCandidateByHR = async (req, res) => {
//   try {
//     const { id } = req.params;

//     candidateModel.unsaveCandidateByHR(id, req.user.id, (err) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({
//           success: false,
//           message: "Error unsaving candidate",
//           error: err.message,
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Candidate removed from saved",
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

// // ── GET SAVED CANDIDATES ──
// exports.getSavedCandidatesByHR = async (req, res) => {
//   try {
//     candidateModel.getSavedCandidatesByHR(req.user.id, (err, results) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({
//           success: false,
//           message: "Error fetching saved candidates",
//           error: err.message,
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         data: results,
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

// // ── GET CANDIDATE STATUS HISTORY ──
// exports.getCandidateStatusHistory = async (req, res) => {
//   try {
//     const { id } = req.params;

//     candidateModel.getCandidateStatusHistory(id, (err, results) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({
//           success: false,
//           message: "Error fetching status history",
//           error: err.message,
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         data: results,
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












const candidateModel = require("../../models/hrmodels/candidateModel");
const fs   = require("fs");
const path = require("path");
const db = require("../../config/db");
// ── helpers ──────────────────────────────────────────────────────────────────
const VALID_STATUSES = [
  "unscreened","pending","shortlisted","interview","offer","hired","rejected",
];

function parseSkills(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed.map(s => (typeof s === "string" ? s : s.name || "")).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function safeNum(val) {
  const n = Number(val);
  return isNaN(n) || val === "" || val === null || val === undefined ? null : n;
}

// ── CREATE CANDIDATE ─────────────────────────────────────────────────────────
// exports.createCandidate = async (req, res) => {
//   try {
//     const {
//       first_name, last_name, email, phone,
//       headline, location,
//       experience_years, relevant_experience_years,
//       current_company, current_salary, expected_salary,
//       source, education, status,
//     } = req.body;

//     // Validation
//     if (!first_name || !last_name || !email || !phone) {
//       return res.status(400).json({ success: false, message: "First name, last name, email and phone are required." });
//     }
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       return res.status(400).json({ success: false, message: "Invalid email format." });
//     }
//     if (status && !VALID_STATUSES.includes(status)) {
//       return res.status(400).json({ success: false, message: `Invalid status.` });
//     }

//     const skills = parseSkills(req.body.skills);

//     const candidateData = {
//       first_name:                 first_name.trim(),
//       last_name:                  last_name.trim(),
//       email:                      email.trim(),
//       phone:                      phone.trim(),
//       headline:                   headline?.trim() || "",
//       location:                   location?.trim() || "",
//       experience_years:           safeNum(experience_years),
//       relevant_experience_years:  safeNum(relevant_experience_years),
//       current_company:            current_company?.trim() || "",
//       current_salary:             safeNum(current_salary),
//       expected_salary:            safeNum(expected_salary),
//       source:                     source || "Direct",
//       education:                  education?.trim() || "",
//       avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${first_name} ${last_name}`)}&background=3b82f6&color=fff`,
//       resume_file_name: req.file ? req.file.filename : null,
//       resume_url:       req.file ? `/uploads/resumes/${req.file.filename}` : null,
//       status:           status || "unscreened",
//       created_by:       req.user?.id || null,
//     };

//     candidateModel.createCandidate(candidateData, (err, result) => {
//       if (err) {
//         console.error("Create Candidate Error:", err);
//         return res.status(500).json({ success: false, message: "Error creating candidate", error: err.message });
//       }

//       const candidateId = result.insertId;

//       // Insert skills
//       skills.forEach(skillName => {
//         candidateModel.addCandidateSkill(candidateId, skillName, null, err => {
//           if (err) console.error("Skill Insert Error:", skillName, err);
//         });
//       });

//       return res.status(201).json({
//         success: true,
//         message: "Candidate created successfully",
//         candidate: { id: candidateId, ...candidateData, skills },
//       });
//     });
//   } catch (error) {
//     console.error("Create Candidate Error:", error);
//     return res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

exports.createCandidate = async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone,
      headline, location,
      experience_years, relevant_experience_years,
      current_company, current_salary, expected_salary,
      source, referral_person, education, status,
    } = req.body;

    // Validation
    if (!first_name || !last_name || !email || !phone) {
      return res.status(400).json({ success: false, message: "First name, last name, email and phone are required." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format." });
    }
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status.` });
    }
    
    // Validate referral_person if source is "Referral"
    if (source === "Referral" && (!referral_person || !referral_person.trim())) {
      return res.status(400).json({ success: false, message: "Referral person name is required when source is Referral." });
    }

    const skills = parseSkills(req.body.skills);

    const candidateData = {
      first_name:                 first_name.trim(),
      last_name:                  last_name.trim(),
      email:                      email.trim(),
      phone:                      phone.trim(),
      headline:                   headline?.trim() || "",
      location:                   location?.trim() || "",
      experience_years:           safeNum(experience_years),
      relevant_experience_years:  safeNum(relevant_experience_years),
      current_company:            current_company?.trim() || "",
      current_salary:             safeNum(current_salary),
      expected_salary:            safeNum(expected_salary),
      source:                     source || "Direct",
      referral_person:            source === "Referral" ? (referral_person?.trim() || null) : null,
      education:                  education?.trim() || "",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${first_name} ${last_name}`)}&background=3b82f6&color=fff`,
      resume_file_name: req.file ? req.file.filename : null,
      resume_url:       req.file ? `/uploads/resumes/${req.file.filename}` : null,
      status:           status || "unscreened",
      created_by:       req.user?.id || null,
    };

    candidateModel.createCandidate(candidateData, (err, result) => {
      if (err) {
        console.error("Create Candidate Error:", err);
        return res.status(500).json({ success: false, message: "Error creating candidate", error: err.message });
      }

      const candidateId = result.insertId;

      // Insert skills
      skills.forEach(skillName => {
        candidateModel.addCandidateSkill(candidateId, skillName, null, err => {
          if (err) console.error("Skill Insert Error:", skillName, err);
        });
      });

      return res.status(201).json({
        success: true,
        message: "Candidate created successfully",
        candidate: { id: candidateId, ...candidateData, skills },
      });
    });
  } catch (error) {
    console.error("Create Candidate Error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};







// ── GET ALL CANDIDATES ───────────────────────────────────────────────────────
exports.getAllCandidates = async (req, res) => {
  try {
    const {
      status, source, location, search, sortBy, qualification,
      expMin, expMax, relExpMin, relExpMax,
      page = 1, limit = 12,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const filter = {
      status, source, location, search, sortBy, qualification,
      expMin, expMax, relExpMin, relExpMax,
      limit: parseInt(limit),
      offset,
    };

    candidateModel.getAllCandidates(filter, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error fetching candidates", error: err.message });
      }

      candidateModel.getCandidatesCount(filter, (err, countResult) => {
        const total = countResult?.[0]?.total || 0;
        return res.status(200).json({
          success: true,
          data: results,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        });
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── GET SINGLE CANDIDATE ─────────────────────────────────────────────────────
exports.getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;

    candidateModel.getCandidateById(id, (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Error fetching candidate", error: err.message });
      if (!results.length) return res.status(404).json({ success: false, message: "Candidate not found" });

      return res.status(200).json({ success: true, data: results[0] });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── UPDATE CANDIDATE ─────────────────────────────────────────────────────────
// exports.updateCandidate = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const {
//       first_name, last_name, phone,
//       headline, location,
//       experience_years, relevant_experience_years,
//       current_company, current_salary, expected_salary,
//       source, education, status,
//     } = req.body;

//     if (status && !VALID_STATUSES.includes(status)) {
//       return res.status(400).json({ success: false, message: "Invalid status." });
//     }

//     // ✅ FIX: Use explicit key presence check via req.body directly
//     // so empty strings are still included (user clearing a field)
//     const body = req.body;
//     const updateData = {};

//     // String fields — include even if empty string
//     const stringFields = [
//       "first_name", "last_name", "phone",
//       "headline", "location", "current_company",
//       "education", "source", "status",
//     ];
//     for (const key of stringFields) {
//       if (key in body) {
//         updateData[key] = typeof body[key] === "string" ? body[key].trim() : body[key];
//       }
//     }

//     // Numeric nullable fields — include even if empty (model will convert to null)
//     const numericFields = [
//       "experience_years", "relevant_experience_years",
//       "current_salary", "expected_salary",
//     ];
//     for (const key of numericFields) {
//       if (key in body) {
//         updateData[key] = body[key]; // model handles null conversion
//       }
//     }

//     // New resume file uploaded
//     if (req.file) {
//       updateData.resume_file_name = req.file.filename;
//       updateData.resume_url       = `/uploads/resumes/${req.file.filename}`;
//     }

//     console.log("Update Data received:", updateData);

//     // Regenerate avatar if name fields are present
//     const needsAvatar = "first_name" in updateData || "last_name" in updateData;

//     function doUpdate() {
//       candidateModel.updateCandidate(id, updateData, (err) => {
//         if (err) {
//           console.error("Update Candidate Error:", err);
//           return res.status(500).json({
//             success: false,
//             message: "Error updating candidate",
//             error: err.message,
//           });
//         }

//         // Re-sync skills if skills field was sent
//         if ("skills" in body) {
//           const skills = parseSkills(body.skills);
//           candidateModel.deleteAllCandidateSkills(id, (delErr) => {
//             if (delErr) console.error("Delete skills error:", delErr);
//             skills.forEach(skillName => {
//               candidateModel.addCandidateSkill(id, skillName, null, err => {
//                 if (err) console.error("Skill re-insert error:", err);
//               });
//             });
//           });
//         }

//         // Return updated candidate
//         candidateModel.getCandidateById(id, (err, rows) => {
//           if (err || !rows || !rows.length) {
//             return res.status(200).json({
//               success: true,
//               message: "Candidate updated successfully",
//             });
//           }
//           return res.status(200).json({
//             success: true,
//             message: "Candidate updated successfully",
//             data: rows[0],
//           });
//         });
//       });
//     }

//     if (needsAvatar) {
//       // Fetch current record to fill in whichever name part wasn't sent
//       candidateModel.getCandidateById(id, (err, rows) => {
//         if (!err && rows && rows.length) {
//           const fn = updateData.first_name ?? rows[0].first_name;
//           const ln = updateData.last_name  ?? rows[0].last_name;
//           updateData.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${fn} ${ln}`)}&background=3b82f6&color=fff`;
//         }
//         doUpdate();
//       });
//     } else {
//       doUpdate();
//     }

//   } catch (error) {
//     console.error("Update Candidate Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };


exports.updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      first_name, last_name, phone,
      headline, location,
      experience_years, relevant_experience_years,
      current_company, current_salary, expected_salary,
      source, referral_person, education, status,
    } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    // Validate referral_person if source is "Referral"
    if (source === "Referral" && (!referral_person || !referral_person.trim())) {
      return res.status(400).json({ success: false, message: "Referral person name is required when source is Referral." });
    }

    const body = req.body;
    const updateData = {};

    // String fields
    const stringFields = [
      "first_name", "last_name", "phone",
      "headline", "location", "current_company",
      "education", "source", "status",
    ];
    for (const key of stringFields) {
      if (key in body) {
        updateData[key] = typeof body[key] === "string" ? body[key].trim() : body[key];
      }
    }

    // Referral person field (only if source is Referral)
    if ("source" in body) {
      if (body.source === "Referral" && referral_person) {
        updateData.referral_person = referral_person.trim();
      } else if (body.source !== "Referral") {
        updateData.referral_person = null;
      }
    } else if ("referral_person" in body && source === "Referral") {
      updateData.referral_person = referral_person?.trim() || null;
    }

    // Numeric nullable fields
    const numericFields = [
      "experience_years", "relevant_experience_years",
      "current_salary", "expected_salary",
    ];
    for (const key of numericFields) {
      if (key in body) {
        updateData[key] = body[key];
      }
    }

    // New resume file uploaded
    if (req.file) {
      updateData.resume_file_name = req.file.filename;
      updateData.resume_url       = `/uploads/resumes/${req.file.filename}`;
    }

    // Regenerate avatar if name fields are present
    const needsAvatar = "first_name" in updateData || "last_name" in updateData;

    function doUpdate() {
      candidateModel.updateCandidate(id, updateData, (err) => {
        if (err) {
          console.error("Update Candidate Error:", err);
          return res.status(500).json({
            success: false,
            message: "Error updating candidate",
            error: err.message,
          });
        }

        // Re-sync skills if skills field was sent
        if ("skills" in body) {
          const skills = parseSkills(body.skills);
          candidateModel.deleteAllCandidateSkills(id, (delErr) => {
            if (delErr) console.error("Delete skills error:", delErr);
            skills.forEach(skillName => {
              candidateModel.addCandidateSkill(id, skillName, null, err => {
                if (err) console.error("Skill re-insert error:", err);
              });
            });
          });
        }

        candidateModel.getCandidateById(id, (err, rows) => {
          if (err || !rows || !rows.length) {
            return res.status(200).json({
              success: true,
              message: "Candidate updated successfully",
            });
          }
          return res.status(200).json({
            success: true,
            message: "Candidate updated successfully",
            data: rows[0],
          });
        });
      });
    }

    if (needsAvatar) {
      candidateModel.getCandidateById(id, (err, rows) => {
        if (!err && rows && rows.length) {
          const fn = updateData.first_name ?? rows[0].first_name;
          const ln = updateData.last_name  ?? rows[0].last_name;
          updateData.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${fn} ${ln}`)}&background=3b82f6&color=fff`;
        }
        doUpdate();
      });
    } else {
      doUpdate();
    }

  } catch (error) {
    console.error("Update Candidate Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};



// ── UPDATE CANDIDATE STATUS ──────────────────────────────────────────────────
exports.updateCandidateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!status) return res.status(400).json({ success: false, message: "Status is required" });
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Valid: ${VALID_STATUSES.join(", ")}` });
    }

    candidateModel.updateCandidateStatus(id, status, req.user.id, reason || null, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error updating status", error: err.message });
      }
      return res.status(200).json({ success: true, message: `Status updated to ${status}` });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── DELETE CANDIDATE ─────────────────────────────────────────────────────────
exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    candidateModel.getCandidateById(id, (err, results) => {
      if (err || !results.length) {
        return res.status(404).json({ success: false, message: "Candidate not found" });
      }

      const candidate = results[0];

      // Delete resume file from disk
      if (candidate.resume_file_name) {
        const filePath = path.join(__dirname, "../../uploads/resumes", candidate.resume_file_name);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (e) { console.error("File delete error:", e); }
        }
      }

      candidateModel.deleteCandidate(id, (err) => {
        if (err) return res.status(500).json({ success: false, message: "Error deleting candidate", error: err.message });
        return res.status(200).json({ success: true, message: "Candidate deleted successfully" });
      });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── SKILLS ───────────────────────────────────────────────────────────────────
exports.addCandidateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { skill_name, skill_category } = req.body;
    if (!skill_name) return res.status(400).json({ success: false, message: "Skill name is required" });

    candidateModel.addCandidateSkill(id, skill_name, skill_category || null, (err) => {
      if (err) return res.status(500).json({ success: false, message: "Error adding skill", error: err.message });
      return res.status(201).json({ success: true, message: "Skill added" });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getCandidateSkills = async (req, res) => {
  try {
    candidateModel.getCandidateSkills(req.params.id, (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Error fetching skills", error: err.message });
      return res.status(200).json({ success: true, data: results });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.removeCandidateSkill = async (req, res) => {
  try {
    candidateModel.removeCandidateSkill(req.params.skillId, (err) => {
      if (err) return res.status(500).json({ success: false, message: "Error removing skill", error: err.message });
      return res.status(200).json({ success: true, message: "Skill removed" });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── NOTES ────────────────────────────────────────────────────────────────────
exports.addCandidateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note_type, content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: "Note content is required" });

    candidateModel.addCandidateNote(id, note_type || "General", content, req.user.id, (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Error adding note", error: err.message });
      return res.status(201).json({ success: true, message: "Note added", data: { id: result.insertId, content } });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getCandidateNotes = async (req, res) => {
  try {
    candidateModel.getCandidateNotes(req.params.id, (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Error fetching notes", error: err.message });
      return res.status(200).json({ success: true, data: results });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.updateCandidateNote = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: "Content is required" });

    candidateModel.updateCandidateNote(req.params.noteId, content, (err) => {
      if (err) return res.status(500).json({ success: false, message: "Error updating note", error: err.message });
      return res.status(200).json({ success: true, message: "Note updated" });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.deleteCandidateNote = async (req, res) => {
  try {
    candidateModel.deleteCandidateNote(req.params.noteId, (err) => {
      if (err) return res.status(500).json({ success: false, message: "Error deleting note", error: err.message });
      return res.status(200).json({ success: true, message: "Note deleted" });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── SAVE / UNSAVE ────────────────────────────────────────────────────────────
exports.saveCandidateByHR = async (req, res) => {
  try {
    candidateModel.saveCandidateByHR(req.params.id, req.user.id, req.body.saved_tag || null, (err) => {
      if (err) return res.status(500).json({ success: false, message: "Error saving candidate", error: err.message });
      return res.status(200).json({ success: true, message: "Candidate saved" });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.unsaveCandidateByHR = async (req, res) => {
  try {
    candidateModel.unsaveCandidateByHR(req.params.id, req.user.id, (err) => {
      if (err) return res.status(500).json({ success: false, message: "Error unsaving candidate", error: err.message });
      return res.status(200).json({ success: true, message: "Removed from saved" });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getSavedCandidatesByHR = async (req, res) => {
  try {
    candidateModel.getSavedCandidatesByHR(req.user.id, (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Error fetching saved", error: err.message });
      return res.status(200).json({ success: true, data: results });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── STATUS HISTORY ───────────────────────────────────────────────────────────
exports.getCandidateStatusHistory = async (req, res) => {
  try {
    candidateModel.getCandidateStatusHistory(req.params.id, (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Error fetching history", error: err.message });
      return res.status(200).json({ success: true, data: results });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};





// ── GET DASHBOARD STATS ──────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    // Total candidates by status
    const statusCountSql = `
      SELECT status, COUNT(*) as count
      FROM candidates
      GROUP BY status
    `;

    // Total candidates overall
    const totalCandidatesSql = `SELECT COUNT(*) as total FROM candidates`;

    // Applications this week (day-wise) — Mon to Sun
    const weeklyApplicationsSql = `
      SELECT 
        DAYNAME(applied_at) as day_name,
        DAYOFWEEK(applied_at) as day_num,
        COUNT(*) as count
      FROM candidates
      WHERE applied_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
        AND applied_at < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)
      GROUP BY DAYOFWEEK(applied_at), DAYNAME(applied_at)
      ORDER BY DAYOFWEEK(applied_at)
    `;

    // Recent candidates (last 5)
    const recentCandidatesSql = `
      SELECT 
        c.id, c.first_name, c.last_name, c.headline,
        c.avatar, c.status, c.applied_at,
        GROUP_CONCAT(cs.skill_name ORDER BY cs.id SEPARATOR ',') AS skills
      FROM candidates c
      LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id
      GROUP BY c.id
      ORDER BY c.applied_at DESC
      LIMIT 5
    `;

    // Upcoming interviews (not completed/cancelled)
    const upcomingInterviewsSql = `
      SELECT 
        i.*,
        CONCAT(c.first_name, ' ', c.last_name) AS candidate_name,
        c.avatar AS candidate_avatar,
        j.title AS job_title,
        tm.name AS team_member_name,
        tm.role AS team_member_role,
        tm.avatar AS team_member_avatar
      FROM hr_interviews i
      LEFT JOIN candidates c ON i.candidate_id = c.id
      LEFT JOIN jobs j ON i.job_id = j.id
      LEFT JOIN hr_team tm ON i.team_member_id = tm.id
      WHERE i.status NOT IN ('completed', 'cancelled', 'deleted')
        AND i.interview_date >= CURDATE()
      ORDER BY i.interview_date ASC, i.interview_time ASC
      LIMIT 5
    `;

    // Run all queries in parallel using Promise wrappers
    const query = (sql, params = []) =>
      new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

    const [
      statusCounts,
      totalResult,
      weeklyData,
      recentCandidates,
      upcomingInterviews,
    ] = await Promise.all([
      query(statusCountSql),
      query(totalCandidatesSql),
      query(weeklyApplicationsSql),
      query(recentCandidatesSql),
      query(upcomingInterviewsSql),
    ]);

    // Build status map
    const statusMap = {};
    statusCounts.forEach(row => {
      statusMap[row.status] = row.count;
    });

    // Build weekly day-wise data (Mon–Sun)
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const dayShort = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" };
    const weeklyMap = {};
    weeklyData.forEach(row => { weeklyMap[row.day_name] = row.count; });
    const weeklyFormatted = dayOrder.map(d => ({
      day: dayShort[d],
      applications: weeklyMap[d] || 0,
    }));

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          total_candidates:  totalResult[0].total,
          shortlisted:       statusMap.shortlisted || 0,
          offer:             statusMap.offer || 0,
          hired:             statusMap.hired || 0,
          pending:           statusMap.pending || 0,
          interview:         statusMap.interview || 0,
          rejected:          statusMap.rejected || 0,
          unscreened:        statusMap.unscreened || 0,
        },
        status_breakdown: statusCounts.map(row => ({
          name:  row.status.charAt(0).toUpperCase() + row.status.slice(1),
          value: row.count,
        })),
        weekly_applications: weeklyFormatted,
        recent_candidates:   recentCandidates,
        upcoming_interviews: upcomingInterviews,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};






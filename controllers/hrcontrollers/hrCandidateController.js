


const candidateModel = require("../../models/hrmodels/candidateModel");
const fs   = require("fs");
const path = require("path");
const db = require("../../config/db");
// ── helpers ──────────────────────────────────────────────────────────────────
// const VALID_STATUSES = [
//   "unscreened","pending","shortlisted","interview","offer","hired","rejected",
// ];

const VALID_STATUSES = [
  "application_received",
  "unscreened",
  "pending",
  "shortlisted",
  "screening_rejected",
  "interview_scheduled",
  "interview_rejected",
  "offered",
  "offer_declined",
  "withdrawn_by_candidate",
  "onboarded",
  "hired",
  "rejected",
  "position_on_hold" 
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
        return res.status(500).json({ 
          success: false, 
          message: "Error fetching candidates", 
          error: err.message 
        });
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
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// ── GET SINGLE CANDIDATE ─────────────────────────────────────────────────────
exports.getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;

    candidateModel.getCandidateById(id, (err, results) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Error fetching candidate", 
          error: err.message 
        });
      }
      if (!results || results.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "Candidate not found" 
        });
      }

      return res.status(200).json({ 
        success: true, 
        data: results[0] 
      });
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get All Candidates For Job Assignment
exports.getAllCandidatesForJob = async (req, res) => {
  try {
    candidateModel.getAllCandidatesForJob((err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Error fetching candidates",
          error: err.message,
        });
      }

      return res.status(200).json({
        success: true,
        count: results.length,
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

exports.getMonthlyCandidates = (req, res) => {
  console.log('✅ getMonthlyCandidates called');
  console.log('📝 Query params:', req.query);
  
  const { month, year } = req.query;
  const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
  const targetYear = year ? parseInt(year) : new Date().getFullYear();
  
  console.log(`📊 Fetching monthly data for: ${targetMonth}/${targetYear}`);
  
  // Validate month and year
  if (targetMonth < 1 || targetMonth > 12) {
    return res.status(400).json({
      success: false,
      message: "Invalid month. Must be between 1 and 12"
    });
  }
  
  // ✅ Removed deleted_at check since column doesn't exist
  const query = `
    SELECT 
      DAY(created_at) as day,
      COUNT(*) as count,
      DATE(created_at) as date
    FROM candidates
    WHERE MONTH(created_at) = ? 
      AND YEAR(created_at) = ?
    GROUP BY DAY(created_at), DATE(created_at)
    ORDER BY DAY(created_at) ASC
  `;
  
  db.query(query, [targetMonth, targetYear], (err, results) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: err.message
      });
    }
    
    console.log(`✅ Found ${results.length} days with data`);
    
    // Create map for daily counts
    const dataMap = {};
    results.forEach(row => {
      dataMap[row.day] = row.count;
    });
    
    // Build complete daily data
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const dailyData = [];
    let totalCandidates = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const count = dataMap[day] || 0;
      dailyData.push({
        day: day,
        count: count,
        date: `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      });
      totalCandidates += count;
    }
    
    const monthName = new Date(targetYear, targetMonth - 1).toLocaleString('default', { month: 'long' });
    
    return res.status(200).json({
      success: true,
      data: {
        month: targetMonth,
        year: targetYear,
        month_name: monthName,
        total_candidates: totalCandidates,
        daily_data: dailyData,
        days_in_month: daysInMonth
      }
    });
  });
};

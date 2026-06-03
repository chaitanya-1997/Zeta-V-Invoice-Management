const db = require("../../config/db");

// ── CREATE CANDIDATE ──
const createCandidate = (candidateData, callback) => {
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
    avatar,
    resume_file_name,
    resume_url,
    rating,
    status,
    created_by,
  } = candidateData;

  const sql = `
    INSERT INTO candidates (
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
      avatar,
      resume_file_name,
      resume_url,
      rating,
      status,
      created_by,
      applied_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    sql,
    [
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
      avatar,
      resume_file_name,
      resume_url,
      rating,
      status,
      created_by,
    ],
    callback
  );
};

// ── GET CANDIDATE BY ID ──
const getCandidateById = (candidateId, callback) => {
  const sql = `
    SELECT c.*, 
           GROUP_CONCAT(cs.skill_name) as skills
    FROM candidates c
    LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id
    WHERE c.id = ?
    GROUP BY c.id
  `;

  db.query(sql, [candidateId], callback);
};

// ── GET ALL CANDIDATES ──
const getAllCandidates = (filter = {}, callback) => {
  let sql = `
    SELECT c.*, 
           GROUP_CONCAT(cs.skill_name) as skills
    FROM candidates c
    LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id
    WHERE 1=1
  `;

  const params = [];

  // Filter by status
  if (filter.status && filter.status !== "all") {
    sql += ` AND c.status = ?`;
    params.push(filter.status);
  }

  // Filter by source
  if (filter.source) {
    sql += ` AND c.source = ?`;
    params.push(filter.source);
  }

  // Filter by location
  if (filter.location) {
    sql += ` AND c.location LIKE ?`;
    params.push(`%${filter.location}%`);
  }

  // Search by name, email, headline, company, skills
  if (filter.search) {
    sql += ` AND (
      c.first_name LIKE ? 
      OR c.last_name LIKE ? 
      OR c.email LIKE ? 
      OR c.headline LIKE ? 
      OR c.current_company LIKE ? 
      OR cs.skill_name LIKE ?
    )`;
    const searchTerm = `%${filter.search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  // Filter by created_by (HR who added the candidate)
  if (filter.created_by) {
    sql += ` AND c.created_by = ?`;
    params.push(filter.created_by);
  }

  // Filter by saved status
  if (filter.is_saved !== undefined) {
    sql += ` AND c.is_saved = ?`;
    params.push(filter.is_saved);
  }

  sql += ` GROUP BY c.id`;

  // Sort by
  if (filter.sortBy) {
    switch (filter.sortBy) {
      case "newest":
        sql += ` ORDER BY c.applied_at DESC`;
        break;
      case "experience":
        sql += ` ORDER BY c.experience_years DESC`;
        break;
      case "salary":
        sql += ` ORDER BY c.expected_salary DESC`;
        break;
      case "rating":
        sql += ` ORDER BY c.rating DESC`;
        break;
      default:
        sql += ` ORDER BY c.applied_at DESC`;
    }
  } else {
    sql += ` ORDER BY c.applied_at DESC`;
  }

  // Pagination
  if (filter.limit && filter.offset !== undefined) {
    sql += ` LIMIT ? OFFSET ?`;
    params.push(filter.limit, filter.offset);
  }

  db.query(sql, params, callback);
};

// ── UPDATE CANDIDATE ──
const updateCandidate = (candidateId, updateData, callback) => {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updateData)) {
    if (value !== undefined && value !== null) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    return callback(new Error("No fields to update"), null);
  }

  fields.push(`updated_at = NOW()`);
  values.push(candidateId);

  const sql = `UPDATE candidates SET ${fields.join(", ")} WHERE id = ?`;

  db.query(sql, values, callback);
};

// ── DELETE CANDIDATE ──
const deleteCandidate = (candidateId, callback) => {
  const sql = `DELETE FROM candidates WHERE id = ?`;
  db.query(sql, [candidateId], callback);
};

// ── ADD CANDIDATE SKILL ──
const addCandidateSkill = (candidateId, skillName, skillCategory, callback) => {
  const sql = `
    INSERT INTO candidate_skills (candidate_id, skill_name, skill_category)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      skill_category = VALUES(skill_category)
  `;

  db.query(sql, [candidateId, skillName, skillCategory], callback);
};

// ── GET CANDIDATE SKILLS ──
const getCandidateSkills = (candidateId, callback) => {
  const sql = `
    SELECT id, skill_name, skill_category, proficiency_level, years_of_experience
    FROM candidate_skills
    WHERE candidate_id = ?
  `;

  db.query(sql, [candidateId], callback);
};

// ── REMOVE CANDIDATE SKILL ──
const removeCandidateSkill = (skillId, callback) => {
  const sql = `DELETE FROM candidate_skills WHERE id = ?`;
  db.query(sql, [skillId], callback);
};

// ── UPDATE CANDIDATE STATUS ──
const updateCandidateStatus = (candidateId, newStatus, changedBy, reason, callback) => {
  // Get current status
  const getSql = `SELECT status FROM candidates WHERE id = ?`;

  db.query(getSql, [candidateId], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) return callback(new Error("Candidate not found"));

    const previousStatus = results[0].status;

    // Update candidate status
    const updateSql = `UPDATE candidates SET status = ?, updated_at = NOW() WHERE id = ?`;

    db.query(updateSql, [newStatus, candidateId], (err) => {
      if (err) return callback(err);

      // Log status change
      const historySql = `
        INSERT INTO candidate_status_history 
        (candidate_id, previous_status, new_status, changed_by, change_reason)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        historySql,
        [candidateId, previousStatus, newStatus, changedBy, reason || null],
        callback
      );
    });
  });
};

// ── GET CANDIDATE STATUS HISTORY ──
const getCandidateStatusHistory = (candidateId, callback) => {
  const sql = `
    SELECT csh.*, hp.first_name, hp.last_name
    FROM candidate_status_history csh
    JOIN hr_profiles hp ON csh.changed_by = hp.id
    WHERE csh.candidate_id = ?
    ORDER BY csh.change_date DESC
  `;

  db.query(sql, [candidateId], callback);
};

// ── SAVE CANDIDATE ──
const saveCandidateByHR = (candidateId, hrId, savedTag, callback) => {
  const sql = `
    INSERT INTO saved_candidates (candidate_id, saved_by, saved_tag)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE saved_tag = VALUES(saved_tag)
  `;

  db.query(sql, [candidateId, hrId, savedTag || null], callback);
};

// ── UNSAVE CANDIDATE ──
const unsaveCandidateByHR = (candidateId, hrId, callback) => {
  const sql = `DELETE FROM saved_candidates WHERE candidate_id = ? AND saved_by = ?`;
  db.query(sql, [candidateId, hrId], callback);
};

// ── GET SAVED CANDIDATES BY HR ──
const getSavedCandidatesByHR = (hrId, callback) => {
  const sql = `
    SELECT c.*, 
           GROUP_CONCAT(cs.skill_name) as skills,
           sc.saved_tag
    FROM candidates c
    JOIN saved_candidates sc ON c.id = sc.candidate_id
    LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id
    WHERE sc.saved_by = ?
    GROUP BY c.id
    ORDER BY sc.saved_at DESC
  `;

  db.query(sql, [hrId], callback);
};

// ── ADD CANDIDATE NOTE ──
const addCandidateNote = (candidateId, noteType, content, createdBy, callback) => {
  const sql = `
    INSERT INTO candidate_notes 
    (candidate_id, note_type, content, created_by, is_internal)
    VALUES (?, ?, ?, ?, 1)
  `;

  db.query(sql, [candidateId, noteType, content, createdBy], callback);
};

// ── GET CANDIDATE NOTES ──
const getCandidateNotes = (candidateId, callback) => {
  const sql = `
    SELECT cn.*, hp.first_name, hp.last_name
    FROM candidate_notes cn
    JOIN hr_profiles hp ON cn.created_by = hp.id
    WHERE cn.candidate_id = ?
    ORDER BY cn.created_at DESC
  `;

  db.query(sql, [candidateId], callback);
};

// ── UPDATE CANDIDATE NOTE ──
const updateCandidateNote = (noteId, content, callback) => {
  const sql = `UPDATE candidate_notes SET content = ?, updated_at = NOW() WHERE id = ?`;
  db.query(sql, [content, noteId], callback);
};

// ── DELETE CANDIDATE NOTE ──
const deleteCandidateNote = (noteId, callback) => {
  const sql = `DELETE FROM candidate_notes WHERE id = ?`;
  db.query(sql, [noteId], callback);
};

// ── GET CANDIDATES COUNT ──
const getCandidatesCount = (filter = {}, callback) => {
  let sql = `SELECT COUNT(*) as total FROM candidates WHERE 1=1`;
  const params = [];

  if (filter.status && filter.status !== "all") {
    sql += ` AND status = ?`;
    params.push(filter.status);
  }

  if (filter.source) {
    sql += ` AND source = ?`;
    params.push(filter.source);
  }

  db.query(sql, params, callback);
};

module.exports = {
  createCandidate,
  getCandidateById,
  getAllCandidates,
  updateCandidate,
  deleteCandidate,
  addCandidateSkill,
  getCandidateSkills,
  removeCandidateSkill,
  updateCandidateStatus,
  getCandidateStatusHistory,
  saveCandidateByHR,
  unsaveCandidateByHR,
  getSavedCandidatesByHR,
  addCandidateNote,
  getCandidateNotes,
  updateCandidateNote,
  deleteCandidateNote,
  getCandidatesCount,
};
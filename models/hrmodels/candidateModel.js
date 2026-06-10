// const db = require("../../config/db");

// // ── CREATE CANDIDATE ──
// const createCandidate = (candidateData, callback) => {
//   const {
//     first_name,
//     last_name,
//     email,
//     phone,
//     headline,
//     location,
//     experience_years,
//     current_company,
//     expected_salary,
//     source,
//     education,
//     avatar,
//     resume_file_name,
//     resume_url,
//     rating,
//     status,
//     created_by,
//   } = candidateData;

//   const sql = `
//     INSERT INTO candidates (
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
//       avatar,
//       resume_file_name,
//       resume_url,
//       rating,
//       status,
//       created_by,
//       applied_at
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
//   `;

//   db.query(
//     sql,
//     [
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
//       avatar,
//       resume_file_name,
//       resume_url,
//       rating,
//       status,
//       created_by,
//     ],
//     callback
//   );
// };

// // ── GET CANDIDATE BY ID ──
// const getCandidateById = (candidateId, callback) => {
//   const sql = `
//     SELECT c.*, 
//            GROUP_CONCAT(cs.skill_name) as skills
//     FROM candidates c
//     LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id
//     WHERE c.id = ?
//     GROUP BY c.id
//   `;

//   db.query(sql, [candidateId], callback);
// };

// // ── GET ALL CANDIDATES ──
// const getAllCandidates = (filter = {}, callback) => {
//   let sql = `
//     SELECT c.*, 
//            GROUP_CONCAT(cs.skill_name) as skills
//     FROM candidates c
//     LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id
//     WHERE 1=1
//   `;

//   const params = [];

//   // Filter by status
//   if (filter.status && filter.status !== "all") {
//     sql += ` AND c.status = ?`;
//     params.push(filter.status);
//   }

//   // Filter by source
//   if (filter.source) {
//     sql += ` AND c.source = ?`;
//     params.push(filter.source);
//   }

//   // Filter by location
//   if (filter.location) {
//     sql += ` AND c.location LIKE ?`;
//     params.push(`%${filter.location}%`);
//   }

//   // Search by name, email, headline, company, skills
//   if (filter.search) {
//     sql += ` AND (
//       c.first_name LIKE ? 
//       OR c.last_name LIKE ? 
//       OR c.email LIKE ? 
//       OR c.headline LIKE ? 
//       OR c.current_company LIKE ? 
//       OR cs.skill_name LIKE ?
//     )`;
//     const searchTerm = `%${filter.search}%`;
//     params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
//   }

//   // Filter by created_by (HR who added the candidate)
//   if (filter.created_by) {
//     sql += ` AND c.created_by = ?`;
//     params.push(filter.created_by);
//   }

//   // Filter by saved status
//   if (filter.is_saved !== undefined) {
//     sql += ` AND c.is_saved = ?`;
//     params.push(filter.is_saved);
//   }

//   sql += ` GROUP BY c.id`;

//   // Sort by
//   if (filter.sortBy) {
//     switch (filter.sortBy) {
//       case "newest":
//         sql += ` ORDER BY c.applied_at DESC`;
//         break;
//       case "experience":
//         sql += ` ORDER BY c.experience_years DESC`;
//         break;
//       case "salary":
//         sql += ` ORDER BY c.expected_salary DESC`;
//         break;
//       case "rating":
//         sql += ` ORDER BY c.rating DESC`;
//         break;
//       default:
//         sql += ` ORDER BY c.applied_at DESC`;
//     }
//   } else {
//     sql += ` ORDER BY c.applied_at DESC`;
//   }

//   // Pagination
//   if (filter.limit && filter.offset !== undefined) {
//     sql += ` LIMIT ? OFFSET ?`;
//     params.push(filter.limit, filter.offset);
//   }

//   db.query(sql, params, callback);
// };

// // ── UPDATE CANDIDATE ──
// const updateCandidate = (candidateId, updateData, callback) => {
//   const fields = [];
//   const values = [];

//   for (const [key, value] of Object.entries(updateData)) {
//     if (value !== undefined && value !== null) {
//       fields.push(`${key} = ?`);
//       values.push(value);
//     }
//   }

//   if (fields.length === 0) {
//     return callback(new Error("No fields to update"), null);
//   }

//   fields.push(`updated_at = NOW()`);
//   values.push(candidateId);

//   const sql = `UPDATE candidates SET ${fields.join(", ")} WHERE id = ?`;

//   db.query(sql, values, callback);
// };

// // ── DELETE CANDIDATE ──
// const deleteCandidate = (candidateId, callback) => {
//   const sql = `DELETE FROM candidates WHERE id = ?`;
//   db.query(sql, [candidateId], callback);
// };

// // ── ADD CANDIDATE SKILL ──
// const addCandidateSkill = (candidateId, skillName, skillCategory, callback) => {
//   const sql = `
//     INSERT INTO candidate_skills (candidate_id, skill_name, skill_category)
//     VALUES (?, ?, ?)
//     ON DUPLICATE KEY UPDATE 
//       skill_category = VALUES(skill_category)
//   `;

//   db.query(sql, [candidateId, skillName, skillCategory], callback);
// };

// // ── GET CANDIDATE SKILLS ──
// const getCandidateSkills = (candidateId, callback) => {
//   const sql = `
//     SELECT id, skill_name, skill_category, proficiency_level, years_of_experience
//     FROM candidate_skills
//     WHERE candidate_id = ?
//   `;

//   db.query(sql, [candidateId], callback);
// };

// // ── REMOVE CANDIDATE SKILL ──
// const removeCandidateSkill = (skillId, callback) => {
//   const sql = `DELETE FROM candidate_skills WHERE id = ?`;
//   db.query(sql, [skillId], callback);
// };

// // ── UPDATE CANDIDATE STATUS ──
// const updateCandidateStatus = (candidateId, newStatus, changedBy, reason, callback) => {
//   // Get current status
//   const getSql = `SELECT status FROM candidates WHERE id = ?`;

//   db.query(getSql, [candidateId], (err, results) => {
//     if (err) return callback(err);
//     if (results.length === 0) return callback(new Error("Candidate not found"));

//     const previousStatus = results[0].status;

//     // Update candidate status
//     const updateSql = `UPDATE candidates SET status = ?, updated_at = NOW() WHERE id = ?`;

//     db.query(updateSql, [newStatus, candidateId], (err) => {
//       if (err) return callback(err);

//       // Log status change
//       const historySql = `
//         INSERT INTO candidate_status_history 
//         (candidate_id, previous_status, new_status, changed_by, change_reason)
//         VALUES (?, ?, ?, ?, ?)
//       `;

//       db.query(
//         historySql,
//         [candidateId, previousStatus, newStatus, changedBy, reason || null],
//         callback
//       );
//     });
//   });
// };

// // ── GET CANDIDATE STATUS HISTORY ──
// const getCandidateStatusHistory = (candidateId, callback) => {
//   const sql = `
//     SELECT csh.*, hp.first_name, hp.last_name
//     FROM candidate_status_history csh
//     JOIN hr_profiles hp ON csh.changed_by = hp.id
//     WHERE csh.candidate_id = ?
//     ORDER BY csh.change_date DESC
//   `;

//   db.query(sql, [candidateId], callback);
// };

// // ── SAVE CANDIDATE ──
// const saveCandidateByHR = (candidateId, hrId, savedTag, callback) => {
//   const sql = `
//     INSERT INTO saved_candidates (candidate_id, saved_by, saved_tag)
//     VALUES (?, ?, ?)
//     ON DUPLICATE KEY UPDATE saved_tag = VALUES(saved_tag)
//   `;

//   db.query(sql, [candidateId, hrId, savedTag || null], callback);
// };

// // ── UNSAVE CANDIDATE ──
// const unsaveCandidateByHR = (candidateId, hrId, callback) => {
//   const sql = `DELETE FROM saved_candidates WHERE candidate_id = ? AND saved_by = ?`;
//   db.query(sql, [candidateId, hrId], callback);
// };

// // ── GET SAVED CANDIDATES BY HR ──
// const getSavedCandidatesByHR = (hrId, callback) => {
//   const sql = `
//     SELECT c.*, 
//            GROUP_CONCAT(cs.skill_name) as skills,
//            sc.saved_tag
//     FROM candidates c
//     JOIN saved_candidates sc ON c.id = sc.candidate_id
//     LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id
//     WHERE sc.saved_by = ?
//     GROUP BY c.id
//     ORDER BY sc.saved_at DESC
//   `;

//   db.query(sql, [hrId], callback);
// };

// // ── ADD CANDIDATE NOTE ──
// const addCandidateNote = (candidateId, noteType, content, createdBy, callback) => {
//   const sql = `
//     INSERT INTO candidate_notes 
//     (candidate_id, note_type, content, created_by, is_internal)
//     VALUES (?, ?, ?, ?, 1)
//   `;

//   db.query(sql, [candidateId, noteType, content, createdBy], callback);
// };

// // ── GET CANDIDATE NOTES ──
// const getCandidateNotes = (candidateId, callback) => {
//   const sql = `
//     SELECT cn.*, hp.first_name, hp.last_name
//     FROM candidate_notes cn
//     JOIN hr_profiles hp ON cn.created_by = hp.id
//     WHERE cn.candidate_id = ?
//     ORDER BY cn.created_at DESC
//   `;

//   db.query(sql, [candidateId], callback);
// };

// // ── UPDATE CANDIDATE NOTE ──
// const updateCandidateNote = (noteId, content, callback) => {
//   const sql = `UPDATE candidate_notes SET content = ?, updated_at = NOW() WHERE id = ?`;
//   db.query(sql, [content, noteId], callback);
// };

// // ── DELETE CANDIDATE NOTE ──
// const deleteCandidateNote = (noteId, callback) => {
//   const sql = `DELETE FROM candidate_notes WHERE id = ?`;
//   db.query(sql, [noteId], callback);
// };

// // ── GET CANDIDATES COUNT ──
// const getCandidatesCount = (filter = {}, callback) => {
//   let sql = `SELECT COUNT(*) as total FROM candidates WHERE 1=1`;
//   const params = [];

//   if (filter.status && filter.status !== "all") {
//     sql += ` AND status = ?`;
//     params.push(filter.status);
//   }

//   if (filter.source) {
//     sql += ` AND source = ?`;
//     params.push(filter.source);
//   }

//   db.query(sql, params, callback);
// };

// module.exports = {
//   createCandidate,
//   getCandidateById,
//   getAllCandidates,
//   updateCandidate,
//   deleteCandidate,
//   addCandidateSkill,
//   getCandidateSkills,
//   removeCandidateSkill,
//   updateCandidateStatus,
//   getCandidateStatusHistory,
//   saveCandidateByHR,
//   unsaveCandidateByHR,
//   getSavedCandidatesByHR,
//   addCandidateNote,
//   getCandidateNotes,
//   updateCandidateNote,
//   deleteCandidateNote,
//   getCandidatesCount,
// };


















const db = require("../../config/db");

// ── CREATE CANDIDATE ──
// const createCandidate = (candidateData, callback) => {
//   const {
//     first_name,
//     last_name,
//     email,
//     phone,
//     headline,
//     location,
//     experience_years,
//     relevant_experience_years,
//     current_company,
//     current_salary,
//     expected_salary,
//     source,
//     education,
//     avatar,
//     resume_file_name,
//     resume_url,
//     status,
//     created_by,
//   } = candidateData;

//   const sql = `
//     INSERT INTO candidates (
//       first_name,
//       last_name,
//       email,
//       phone,
//       headline,
//       location,
//       experience_years,
//       relevant_experience_years,
//       current_company,
//       current_salary,
//       expected_salary,
//       source,
//       education,
//       avatar,
//       resume_file_name,
//       resume_url,
//       status,
//       created_by,
//       applied_at
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
//   `;

//   db.query(
//     sql,
//     [
//       first_name,
//       last_name,
//       email,
//       phone,
//       headline,
//       location,
//       experience_years,
//       relevant_experience_years ?? null,
//       current_company,
//       current_salary ?? null,
//       expected_salary ?? null,
//       source,
//       education,
//       avatar,
//       resume_file_name,
//       resume_url,
//       status,
//       created_by,
//     ],
//     callback
//   );
// };

// // ── GET CANDIDATE BY ID ──
// const getCandidateById = (candidateId, callback) => {
//   const sql = `
//     SELECT c.*,
//            GROUP_CONCAT(cs.skill_name ORDER BY cs.id SEPARATOR ',') AS skills
//     FROM candidates c
//     LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id
//     WHERE c.id = ?
//     GROUP BY c.id
//   `;
//   db.query(sql, [candidateId], callback);
// };

// // ── GET ALL CANDIDATES ──
// const getAllCandidates = (filter = {}, callback) => {
//   let sql = `
//     SELECT c.*,
//            GROUP_CONCAT(cs.skill_name ORDER BY cs.id SEPARATOR ',') AS skills
//     FROM candidates c
//     LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id
//     WHERE 1=1
//   `;

//   const params = [];

//   if (filter.status && filter.status !== "all") {
//     sql += ` AND c.status = ?`;
//     params.push(filter.status);
//   }

//   if (filter.source) {
//     sql += ` AND c.source = ?`;
//     params.push(filter.source);
//   }

//   if (filter.location) {
//     sql += ` AND c.location LIKE ?`;
//     params.push(`%${filter.location}%`);
//   }

//   if (filter.search) {
//     sql += ` AND (
//       c.first_name   LIKE ? OR
//       c.last_name    LIKE ? OR
//       c.email        LIKE ? OR
//       c.headline     LIKE ? OR
//       c.current_company LIKE ? OR
//       cs.skill_name  LIKE ?
//     )`;
//     const t = `%${filter.search}%`;
//     params.push(t, t, t, t, t, t);
//   }

//   if (filter.created_by) {
//     sql += ` AND c.created_by = ?`;
//     params.push(filter.created_by);
//   }

//   if (filter.is_saved !== undefined) {
//     sql += ` AND c.is_saved = ?`;
//     params.push(filter.is_saved);
//   }

//   // Experience range filters
//   if (filter.expMin !== undefined && filter.expMin !== "") {
//     sql += ` AND c.experience_years >= ?`;
//     params.push(Number(filter.expMin));
//   }
//   if (filter.expMax !== undefined && filter.expMax !== "") {
//     sql += ` AND c.experience_years <= ?`;
//     params.push(Number(filter.expMax));
//   }
//   if (filter.relExpMin !== undefined && filter.relExpMin !== "") {
//     sql += ` AND c.relevant_experience_years >= ?`;
//     params.push(Number(filter.relExpMin));
//   }
//   if (filter.relExpMax !== undefined && filter.relExpMax !== "") {
//     sql += ` AND c.relevant_experience_years <= ?`;
//     params.push(Number(filter.relExpMax));
//   }

//   // Qualification filter
//   if (filter.qualification) {
//     sql += ` AND c.education LIKE ?`;
//     params.push(`%${filter.qualification}%`);
//   }

//   sql += ` GROUP BY c.id`;

//   switch (filter.sortBy) {
//     case "experience": sql += ` ORDER BY c.experience_years DESC`;  break;
//     case "salary":     sql += ` ORDER BY c.expected_salary DESC`;   break;
//     default:           sql += ` ORDER BY c.applied_at DESC`;
//   }

//   if (filter.limit && filter.offset !== undefined) {
//     sql += ` LIMIT ? OFFSET ?`;
//     params.push(filter.limit, filter.offset);
//   }

//   db.query(sql, params, callback);
// };

// // ── UPDATE CANDIDATE ──
// // ── UPDATE CANDIDATE ──
// const updateCandidate = (candidateId, updateData, callback) => {
//   const fields = [];
//   const values = [];

//   // Whitelist of updatable columns
//   const allowed = [
//     "first_name",
//     "last_name",
//     "phone",
//     "headline",
//     "location",
//     "experience_years",
//     "relevant_experience_years",
//     "current_company",
//     "current_salary",
//     "expected_salary",
//     "source",
//     "education",
//     "avatar",
//     "resume_file_name",
//     "resume_url",
//     "status",
//   ];

//   // Numeric nullable columns — store null when empty/undefined
//   const numericNullable = [
//     "experience_years",
//     "relevant_experience_years",
//     "current_salary",
//     "expected_salary",
//   ];

//   for (const key of allowed) {
//     // Only skip if key is completely absent from updateData object
//     if (!(key in updateData)) continue;

//     const raw = updateData[key];

//     if (numericNullable.includes(key)) {
//       // Convert to number; store null if blank/invalid
//       if (raw === "" || raw === null || raw === undefined) {
//         fields.push(`${key} = ?`);
//         values.push(null);
//       } else {
//         const n = Number(raw);
//         fields.push(`${key} = ?`);
//         values.push(isNaN(n) ? null : n);
//       }
//     } else {
//       // For string fields: allow empty string (user may clear a field)
//       fields.push(`${key} = ?`);
//       values.push(raw ?? null);
//     }
//   }

//   if (fields.length === 0) {
//     return callback(new Error("No fields to update"), null);
//   }

//   fields.push(`updated_at = NOW()`);
//   values.push(candidateId);

//   const sql = `UPDATE candidates SET ${fields.join(", ")} WHERE id = ?`;

//   console.log("Update SQL:", sql);
//   console.log("Update Values:", values);

//   db.query(sql, values, callback);
// };




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
    relevant_experience_years,
    current_company,
    current_salary,
    expected_salary,
    source,
    referral_person,
    education,
    avatar,
    resume_file_name,
    resume_url,
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
      relevant_experience_years,
      current_company,
      current_salary,
      expected_salary,
      source,
      referral_person,
      education,
      avatar,
      resume_file_name,
      resume_url,
      status,
      created_by,
      applied_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
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
      relevant_experience_years ?? null,
      current_company,
      current_salary ?? null,
      expected_salary ?? null,
      source,
      referral_person || null,
      education,
      avatar,
      resume_file_name,
      resume_url,
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
           GROUP_CONCAT(cs.skill_name ORDER BY cs.id SEPARATOR ',') AS skills
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
           GROUP_CONCAT(cs.skill_name ORDER BY cs.id SEPARATOR ',') AS skills
    FROM candidates c
    LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id
    WHERE 1=1
  `;

  const params = [];

  if (filter.status && filter.status !== "all") {
    sql += ` AND c.status = ?`;
    params.push(filter.status);
  }

  if (filter.source) {
    sql += ` AND c.source = ?`;
    params.push(filter.source);
  }

  if (filter.location) {
    sql += ` AND c.location LIKE ?`;
    params.push(`%${filter.location}%`);
  }

  if (filter.search) {
    sql += ` AND (
      c.first_name   LIKE ? OR
      c.last_name    LIKE ? OR
      c.email        LIKE ? OR
      c.headline     LIKE ? OR
      c.current_company LIKE ? OR
      cs.skill_name  LIKE ?
    )`;
    const t = `%${filter.search}%`;
    params.push(t, t, t, t, t, t);
  }

  if (filter.created_by) {
    sql += ` AND c.created_by = ?`;
    params.push(filter.created_by);
  }

  if (filter.is_saved !== undefined) {
    sql += ` AND c.is_saved = ?`;
    params.push(filter.is_saved);
  }

  // Experience range filters
  if (filter.expMin !== undefined && filter.expMin !== "") {
    sql += ` AND c.experience_years >= ?`;
    params.push(Number(filter.expMin));
  }
  if (filter.expMax !== undefined && filter.expMax !== "") {
    sql += ` AND c.experience_years <= ?`;
    params.push(Number(filter.expMax));
  }
  if (filter.relExpMin !== undefined && filter.relExpMin !== "") {
    sql += ` AND c.relevant_experience_years >= ?`;
    params.push(Number(filter.relExpMin));
  }
  if (filter.relExpMax !== undefined && filter.relExpMax !== "") {
    sql += ` AND c.relevant_experience_years <= ?`;
    params.push(Number(filter.relExpMax));
  }

  // Qualification filter
  if (filter.qualification) {
    sql += ` AND c.education LIKE ?`;
    params.push(`%${filter.qualification}%`);
  }

  sql += ` GROUP BY c.id`;

  switch (filter.sortBy) {
    case "experience": sql += ` ORDER BY c.experience_years DESC`;  break;
    case "salary":     sql += ` ORDER BY c.expected_salary DESC`;   break;
    default:           sql += ` ORDER BY c.applied_at DESC`;
  }

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

  // Whitelist of updatable columns
  const allowed = [
    "first_name",
    "last_name",
    "phone",
    "headline",
    "location",
    "experience_years",
    "relevant_experience_years",
    "current_company",
    "current_salary",
    "expected_salary",
    "source",
    "referral_person",
    "education",
    "avatar",
    "resume_file_name",
    "resume_url",
    "status",
  ];

  // Numeric nullable columns — store null when empty/undefined
  const numericNullable = [
    "experience_years",
    "relevant_experience_years",
    "current_salary",
    "expected_salary",
  ];

  for (const key of allowed) {
    if (!(key in updateData)) continue;

    const raw = updateData[key];

    if (numericNullable.includes(key)) {
      if (raw === "" || raw === null || raw === undefined) {
        fields.push(`${key} = ?`);
        values.push(null);
      } else {
        const n = Number(raw);
        fields.push(`${key} = ?`);
        values.push(isNaN(n) ? null : n);
      }
    } else {
      fields.push(`${key} = ?`);
      values.push(raw ?? null);
    }
  }

  if (fields.length === 0) {
    return callback(new Error("No fields to update"), null);
  }

  fields.push(`updated_at = NOW()`);
  values.push(candidateId);

  const sql = `UPDATE candidates SET ${fields.join(", ")} WHERE id = ?`;

  console.log("Update SQL:", sql);
  console.log("Update Values:", values);

  db.query(sql, values, callback);
};






// ── DELETE CANDIDATE ──
const deleteCandidate = (candidateId, callback) => {
  db.query(`DELETE FROM candidates WHERE id = ?`, [candidateId], callback);
};

// ── SKILLS ──
const addCandidateSkill = (candidateId, skillName, skillCategory, callback) => {
  const sql = `
    INSERT INTO candidate_skills (candidate_id, skill_name, skill_category)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE skill_category = VALUES(skill_category)
  `;
  db.query(sql, [candidateId, skillName, skillCategory || null], callback);
};

const deleteAllCandidateSkills = (candidateId, callback) => {
  db.query(`DELETE FROM candidate_skills WHERE candidate_id = ?`, [candidateId], callback);
};

const getCandidateSkills = (candidateId, callback) => {
  db.query(
    `SELECT id, skill_name, skill_category FROM candidate_skills WHERE candidate_id = ?`,
    [candidateId],
    callback
  );
};

const removeCandidateSkill = (skillId, callback) => {
  db.query(`DELETE FROM candidate_skills WHERE id = ?`, [skillId], callback);
};

// ── STATUS ──
const updateCandidateStatus = (candidateId, newStatus, changedBy, reason, callback) => {
  db.query(`SELECT status FROM candidates WHERE id = ?`, [candidateId], (err, rows) => {
    if (err) return callback(err);
    if (!rows.length) return callback(new Error("Candidate not found"));

    const previousStatus = rows[0].status;

    db.query(
      `UPDATE candidates SET status = ?, updated_at = NOW() WHERE id = ?`,
      [newStatus, candidateId],
      (err) => {
        if (err) return callback(err);

        db.query(
          `INSERT INTO candidate_status_history
            (candidate_id, previous_status, new_status, changed_by, change_reason)
           VALUES (?, ?, ?, ?, ?)`,
          [candidateId, previousStatus, newStatus, changedBy, reason || null],
          callback
        );
      }
    );
  });
};

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

// ── SAVE / UNSAVE ──
const saveCandidateByHR = (candidateId, hrId, savedTag, callback) => {
  db.query(
    `INSERT INTO saved_candidates (candidate_id, saved_by, saved_tag)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE saved_tag = VALUES(saved_tag)`,
    [candidateId, hrId, savedTag || null],
    callback
  );
};

const unsaveCandidateByHR = (candidateId, hrId, callback) => {
  db.query(
    `DELETE FROM saved_candidates WHERE candidate_id = ? AND saved_by = ?`,
    [candidateId, hrId],
    callback
  );
};

const getSavedCandidatesByHR = (hrId, callback) => {
  const sql = `
    SELECT c.*,
           GROUP_CONCAT(cs.skill_name ORDER BY cs.id SEPARATOR ',') AS skills,
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

// ── NOTES ──
const addCandidateNote = (candidateId, noteType, content, createdBy, callback) => {
  db.query(
    `INSERT INTO candidate_notes (candidate_id, note_type, content, created_by, is_internal)
     VALUES (?, ?, ?, ?, 1)`,
    [candidateId, noteType, content, createdBy],
    callback
  );
};

const getCandidateNotes = (candidateId, callback) => {
  db.query(
    `SELECT cn.*, hp.first_name, hp.last_name
     FROM candidate_notes cn
     JOIN hr_profiles hp ON cn.created_by = hp.id
     WHERE cn.candidate_id = ?
     ORDER BY cn.created_at DESC`,
    [candidateId],
    callback
  );
};

const updateCandidateNote = (noteId, content, callback) => {
  db.query(
    `UPDATE candidate_notes SET content = ?, updated_at = NOW() WHERE id = ?`,
    [content, noteId],
    callback
  );
};

const deleteCandidateNote = (noteId, callback) => {
  db.query(`DELETE FROM candidate_notes WHERE id = ?`, [noteId], callback);
};

// ── COUNT ──
 const getCandidatesCount = (filter = {}, callback) => {
  let sql = `SELECT COUNT(DISTINCT c.id) AS total FROM candidates c WHERE 1=1`;
  const params = [];

  if (filter.status && filter.status !== "all") {
    sql += ` AND c.status = ?`;
    params.push(filter.status);
  }
  if (filter.source) {
    sql += ` AND c.source = ?`;
    params.push(filter.source);
  }
  if (filter.search) {
    sql += ` AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ?)`;
    const t = `%${filter.search}%`;
    params.push(t, t, t);
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
  deleteAllCandidateSkills,
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
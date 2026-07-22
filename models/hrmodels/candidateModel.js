















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
//     referral_person,
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
//       referral_person,
//       education,
//       avatar,
//       resume_file_name,
//       resume_url,
//       status,
//       created_by,
//       applied_at
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
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
//       referral_person || null,
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
];

// Status flow configuration for UI
const STATUS_FLOW = {
  application_received: { next: ["unscreened", "screening_rejected"], color: "#9ca3af", label: "Application Received" },
  unscreened: { next: ["pending", "screening_rejected"], color: "#9ca3af", label: "Unscreened" },
  pending: { next: ["shortlisted", "screening_rejected"], color: "#f59e0b", label: "Pending" },
  shortlisted: { next: ["interview_scheduled", "rejected"], color: "#10b981", label: "Shortlisted" },
  screening_rejected: { next: [], color: "#ef4444", label: "Screening Rejected" },
  interview_scheduled: { next: ["offered", "interview_rejected"], color: "#3b82f6", label: "Interview Scheduled" },
  interview_rejected: { next: [], color: "#ef4444", label: "Interview Rejected" },
  offered: { next: ["onboarded", "offer_declined"], color: "#8b5cf6", label: "Offered" },
  offer_declined: { next: [], color: "#ef4444", label: "Offer Declined" },
  withdrawn_by_candidate: { next: [], color: "#f59e0b", label: "Withdrawn By Candidate" },
  onboarded: { next: ["hired"], color: "#10b981", label: "Onboarded" },
  hired: { next: [], color: "#10b981", label: "Hired" },
  rejected: { next: [], color: "#ef4444", label: "Rejected" },
};

// Update STATUS_STYLES for consistent display
const STATUS_STYLES = {
  application_received: { bg: "#f3f4f6", color: "#374151", border: "#9ca3af", label: "Application Received", icon: "📥" },
  unscreened: { bg: "#f3f4f6", color: "#374151", border: "#9ca3af", label: "Unscreened", icon: "👤" },
  pending: { bg: "#fef3c7", color: "#92400e", border: "#f59e0b", label: "Pending Review", icon: "⏳" },
  shortlisted: { bg: "#dcfce7", color: "#166534", border: "#22c55e", label: "Shortlisted", icon: "⭐" },
  screening_rejected: { bg: "#fee2e2", color: "#991b1b", border: "#ef4444", label: "Screening Rejected", icon: "❌" },
  interview_scheduled: { bg: "#dbeafe", color: "#1e40af", border: "#3b82f6", label: "Interview Scheduled", icon: "📅" },
  interview_rejected: { bg: "#fee2e2", color: "#991b1b", border: "#ef4444", label: "Interview Rejected", icon: "❌" },
  offered: { bg: "#e9d5ff", color: "#581c87", border: "#a855f7", label: "Offered", icon: "📄" },
  offer_declined: { bg: "#fee2e2", color: "#991b1b", border: "#ef4444", label: "Offer Declined", icon: "❌" },
  withdrawn_by_candidate: { bg: "#fef3c7", color: "#92400e", border: "#f59e0b", label: "Withdrawn", icon: "🚫" },
  onboarded: { bg: "#d1fae5", color: "#065f46", border: "#10b981", label: "Onboarded", icon: "✅" },
  hired: { bg: "#d1fae5", color: "#065f46", border: "#10b981", label: "Hired", icon: "🎉" },
  rejected: { bg: "#fee2e2", color: "#991b1b", border: "#ef4444", label: "Rejected", icon: "❌" },
};

// Update createCandidate function - default status to 'application_received'
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
    status = "application_received", // Changed default
    created_by,
  } = candidateData;

  const sql = `
    INSERT INTO candidates (
      first_name, last_name, email, phone, headline, location,
      experience_years, relevant_experience_years, current_company,
      current_salary, expected_salary, source, referral_person,
      education, avatar, resume_file_name, resume_url, status, created_by, applied_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    sql,
    [
      first_name, last_name, email, phone, headline, location,
      experience_years, relevant_experience_years ?? null, current_company,
      current_salary ?? null, expected_salary ?? null, source,
      referral_person || null, education, avatar,
      resume_file_name, resume_url, status, created_by,
    ],
    callback
  );
};



// ── GET CANDIDATE BY ID with creator info ──
const getCandidateById = (candidateId, callback) => {
  const sql = `
    SELECT c.*,
           GROUP_CONCAT(cs.skill_name ORDER BY cs.id SEPARATOR ',') AS skills,
           hp.first_name as created_by_first_name,
           hp.last_name as created_by_last_name,
           CONCAT(hp.first_name, ' ', hp.last_name) as created_by_name
    FROM candidates c
    LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id
    LEFT JOIN hr_profiles hp ON c.created_by = hp.id
    WHERE c.id = ?
    GROUP BY c.id
  `;
  db.query(sql, [candidateId], callback);
};

// ── GET ALL CANDIDATES with creator info ──
const getAllCandidates = (filter = {}, callback) => {
  let sql = `
    SELECT c.*,
           GROUP_CONCAT(cs.skill_name ORDER BY cs.id SEPARATOR ',') AS skills,
           hp.first_name as created_by_first_name,
           hp.last_name as created_by_last_name,
           CONCAT(hp.first_name, ' ', hp.last_name) as created_by_name
    FROM candidates c
    LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id
    LEFT JOIN hr_profiles hp ON c.created_by = hp.id
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
      cs.skill_name  LIKE ? OR
      hp.first_name  LIKE ? OR
      hp.last_name   LIKE ?
    )`;
    const t = `%${filter.search}%`;
    params.push(t, t, t, t, t, t, t, t);
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

const getAllCandidatesForJob = (callback) => {
  const sql = `
    SELECT
      c.*,
      GROUP_CONCAT(cs.skill_name ORDER BY cs.id SEPARATOR ',') AS skills,
      hp.first_name as created_by_first_name,
      hp.last_name as created_by_last_name,
      CONCAT(hp.first_name, ' ', hp.last_name) as created_by_name
    FROM candidates c
    LEFT JOIN candidate_skills cs
      ON c.id = cs.candidate_id
    LEFT JOIN hr_profiles hp
      ON c.created_by = hp.id
    GROUP BY c.id
    ORDER BY c.first_name ASC
  `;

  db.query(sql, callback);
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
  VALID_STATUSES,
  STATUS_FLOW,
  STATUS_STYLES,
getAllCandidatesForJob
};
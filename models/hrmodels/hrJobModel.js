// const db = require("../../config/db");

// const createJob = (data, callback) => {
//   const sql = `
//     INSERT INTO jobs (
//       title,
//       department,
//       job_type,
//       experience_level,
//       required_experience,
//       shift_timings,
//       openings,
//       location,
//       work_mode,
//       salary_min,
//       salary_max,
//       show_salary,
//       description,
//       deadline,
//       status,
//       created_by
//     )
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   db.query(
//     sql,
//     [
//       data.title,
//       data.department,
//       data.job_type,
//       data.experience_level,
//       data.required_experience,
//       data.shift_timings,
//       data.openings,
//       data.location,
//       data.work_mode,
//       data.salary_min,
//       data.salary_max,
//       data.show_salary,
//       data.description,
//       data.deadline,
//       data.status,
//       data.created_by,
//     ],
//     (err, result) => {
//       if (err) return callback(err);
      
//       // Fetch the newly created job with its JR ID
//       const getJobSql = `SELECT id, jr_id FROM jobs WHERE id = ?`;
//       db.query(getJobSql, [result.insertId], (err, jobs) => {
//         if (err) return callback(err);
//         callback(null, {
//           insertId: result.insertId,
//           jr_id: jobs[0]?.jr_id
//         });
//       });
//     }
//   );
// };

// const addSkill = (jobId, skill) => {
//   const sql = `INSERT INTO job_skills (job_id, skill_name) VALUES (?, ?)`;
//   db.query(sql, [jobId, skill]);
// };

// const addRequirement = (jobId, requirement) => {
//   const sql = `INSERT INTO job_requirements (job_id, requirement_text) VALUES (?, ?)`;
//   db.query(sql, [jobId, requirement]);
// };

// const addBenefit = (jobId, benefit) => {
//   const sql = `INSERT INTO job_benefits (job_id, benefit_name) VALUES (?, ?)`;
//   db.query(sql, [jobId, benefit]);
// };

// const getAllJobs = (callback) => {
//   const sql = `SELECT * FROM jobs ORDER BY created_at DESC`;
//   db.query(sql, callback);
// };

// const getJobById = (jobId, callback) => {
//   const sql = `SELECT * FROM jobs WHERE id = ?`;
//   db.query(sql, [jobId], (err, jobs) => {
//     if (err) return callback(err);
//     if (jobs.length === 0) return callback(null, null);

//     const job = jobs[0];

//     db.query(`SELECT skill_name FROM job_skills WHERE job_id=?`, [jobId], (err, skills) => {
//       if (err) return callback(err);

//       db.query(`SELECT requirement_text FROM job_requirements WHERE job_id=?`, [jobId], (err, requirements) => {
//         if (err) return callback(err);

//         db.query(`SELECT benefit_name FROM job_benefits WHERE job_id=?`, [jobId], (err, benefits) => {
//           if (err) return callback(err);

//           job.skills = skills.map(x => x.skill_name);
//           job.requirements = requirements.map(x => x.requirement_text);
//           job.benefits = benefits.map(x => x.benefit_name);

//           callback(null, job);
//         });
//       });
//     });
//   });
// };

// const updateJob = (jobId, data, callback) => {
//   const sql = `
//     UPDATE jobs
//     SET
//       title=?,
//       department=?,
//       job_type=?,
//       experience_level=?,
//       required_experience=?,
//       shift_timings=?,
//       openings=?,
//       location=?,
//       work_mode=?,
//       salary_min=?,
//       salary_max=?,
//       show_salary=?,
//       description=?,
//       deadline=?,
//       status=?
//     WHERE id=?
//   `;

//   db.query(
//     sql,
//     [
//       data.title,
//       data.department,
//       data.job_type,
//       data.experience_level,
//       data.required_experience,
//       data.shift_timings,
//       data.openings,
//       data.location,
//       data.work_mode,
//       data.salary_min,
//       data.salary_max,
//       data.show_salary,
//       data.description,
//       data.deadline,
//       data.status,
//       jobId,
//     ],
//     callback
//   );
// };

// // ACTUAL DELETE - Removes job and all related records
// const deleteJobPermanently = (jobId, callback) => {
//   // First delete related records
//   db.query("DELETE FROM job_skills WHERE job_id=?", [jobId]);
//   db.query("DELETE FROM job_requirements WHERE job_id=?", [jobId]);
//   db.query("DELETE FROM job_benefits WHERE job_id=?", [jobId]);
  
//   // Then delete the job
//   const sql = `DELETE FROM jobs WHERE id=?`;
//   db.query(sql, [jobId], callback);
// };

// const deleteJobSkills = (jobId) => {
//   db.query("DELETE FROM job_skills WHERE job_id=?", [jobId]);
// };

// const deleteJobRequirements = (jobId) => {
//   db.query("DELETE FROM job_requirements WHERE job_id=?", [jobId]);
// };

// const deleteJobBenefits = (jobId) => {
//   db.query("DELETE FROM job_benefits WHERE job_id=?", [jobId]);
// };

// const pauseJob = (jobId, callback) => {
//   const sql = `UPDATE jobs SET status='paused' WHERE id=?`;
//   db.query(sql, [jobId], callback);
// };

// const resumeJob = (jobId, callback) => {
//   const sql = `UPDATE jobs SET status='active' WHERE id=?`;
//   db.query(sql, [jobId], callback);
// };

// // Get candidate count for a specific job
// const getCandidateCountByJobId = (jobId, callback) => {
//   const sql = `
//     SELECT COUNT(*) as total_applications
//     FROM candidates
//     WHERE applied_job_id = ?
//   `;
//   db.query(sql, [jobId], callback);
// };

// // Get candidates who applied for a specific job
// const getCandidatesByJobId = (jobId, callback) => {
//   const sql = `
//     SELECT 
//       c.id,
//       c.first_name,
//       c.last_name,
//       c.email,
//       c.phone,
//       c.headline,
//       c.experience_years,
//       c.relevant_experience_years,
//       c.current_company,
//       c.current_designation,
//       c.expected_salary,
//       c.location,
//       c.status,
//       c.avatar,
//       c.applied_at,
//       GROUP_CONCAT(cs.skill_name ORDER BY cs.id SEPARATOR ',') AS skills
//     FROM candidates c
//     LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id
//     WHERE c.applied_job_id = ?
//     GROUP BY c.id
//     ORDER BY c.applied_at DESC
//   `;
//   db.query(sql, [jobId], callback);
// };

// // Get candidate count for all jobs
// const getCandidateCountForAllJobs = (callback) => {
//   const sql = `
//     SELECT 
//       j.id,
//       j.title,
//       j.jr_id,
//       COUNT(c.id) as total_applications
//     FROM jobs j
//     LEFT JOIN candidates c ON c.applied_job_id = j.id
//     GROUP BY j.id
//     ORDER BY total_applications DESC
//   `;
//   db.query(sql, callback);
// };


// //----18-6







// const getAppliedCandidatesByJobId = (jobId, callback) => {
//   const sql = `
//     SELECT
//       c.id,
//       c.first_name,
//       c.last_name,
//       c.email,
//       c.phone,
//       c.location,
//       c.headline,
//       c.experience_years,
//       c.relevant_experience_years,
//       c.current_company,
//       c.expected_salary,
//       c.skills,
//       c.avatar,
//       jc.status,
//       jc.source,
//       jc.applied_at
//     FROM job_candidates jc
//     INNER JOIN candidates c ON jc.candidate_id = c.id
//     WHERE jc.job_id = ? AND jc.source = 'website'
//     ORDER BY jc.applied_at DESC
//   `;
//   db.query(sql, [jobId], callback);
// };


// const getManuallyAddedCandidatesByJobId = (jobId, callback) => {
//   const sql = `
//     SELECT
//       c.id,
//       c.first_name,
//       c.last_name,
//       c.email,
//       c.phone,
//       c.location,
//       c.headline,
//       c.experience_years,
//       c.relevant_experience_years,
//       c.current_company,
//       c.expected_salary,
//       c.skills,
//       c.avatar,
//       jc.status,
//       jc.source,
//       jc.applied_at AS added_at
//     FROM job_candidates jc
//     INNER JOIN candidates c ON jc.candidate_id = c.id
//     WHERE jc.job_id = ? AND jc.source = 'manual'
//     ORDER BY jc.applied_at DESC
//   `;
//   db.query(sql, [jobId], callback);
// };


// const getAllCandidatesForPicker = (jobId, callback) => {
//   const sql = `
//     SELECT
//       c.id,
//       c.first_name,
//       c.last_name,
//       c.email,
//       c.phone,
//       c.location,
//       c.headline,
//       c.experience_years,
//       c.skills,
//       c.avatar,
//       c.current_company
//     FROM candidates c
//     WHERE c.id NOT IN (
//       SELECT candidate_id FROM job_candidates WHERE job_id = ?
//     )
//     ORDER BY c.first_name ASC, c.last_name ASC
//   `;
//   db.query(sql, [jobId], callback);
// };

// const addCandidateToJob = (jobId, candidateId, addedBy, status, callback) => {
//   const sql = `
//     INSERT INTO job_candidates (job_id, candidate_id, status, source, created_by)
//     VALUES (?, ?, ?, 'manual', ?)
//     ON DUPLICATE KEY UPDATE
//       source = 'manual',
//       updated_at = CURRENT_TIMESTAMP
//   `;
//   db.query(sql, [jobId, candidateId, status || 'applied', addedBy || null], callback);
// };


// const removeCandidateFromJob = (jobId, candidateId, callback) => {
//   const sql = `
//     DELETE FROM job_candidates
//     WHERE job_id = ? AND candidate_id = ? AND source = 'manual'
//   `;
//   db.query(sql, [jobId, candidateId], callback);
// };



// const updateCandidateJobStatus = (jobId, candidateId, status, callback) => {
//   const sql = `
//     UPDATE job_candidates
//     SET status = ?, updated_at = CURRENT_TIMESTAMP
//     WHERE job_id = ? AND candidate_id = ?
//   `;
//   db.query(sql, [status, jobId, candidateId], callback);
// };

// module.exports = {
//   createJob,
//   addSkill,
//   addRequirement,
//   addBenefit,
//   getAllJobs,
//   getJobById,
//   updateJob,
//   deleteJobPermanently,
//   deleteJobSkills,
//   deleteJobRequirements,
//   deleteJobBenefits,
//   pauseJob,
//   resumeJob,
//   getCandidateCountByJobId,
//   getCandidatesByJobId,
//   getCandidateCountForAllJobs,


//    getCandidateCountByJobId,
//   getCandidateCountForAllJobs,
//   getAppliedCandidatesByJobId,
//   getManuallyAddedCandidatesByJobId,
//   getAllCandidatesForPicker,
//   addCandidateToJob,
//   removeCandidateFromJob,
//   updateCandidateJobStatus,
 
// };


//-----------------------------------------18-6-026






const db = require("../../config/db");

// ─── Create Job ───────────────────────────────────────────────────────────────
const createJob = (data, callback) => {
  const sql = `
    INSERT INTO jobs (
      title, department, job_type, experience_level, required_experience,
      shift_timings, openings, location, work_mode, salary_min, salary_max,
      show_salary, description, deadline, status, created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [
      data.title, data.department, data.job_type, data.experience_level,
      data.required_experience, data.shift_timings, data.openings, data.location,
      data.work_mode, data.salary_min, data.salary_max, data.show_salary,
      data.description, data.deadline, data.status, data.created_by,
    ],
    (err, result) => {
      if (err) return callback(err);
      const getJobSql = `SELECT id, jr_id FROM jobs WHERE id = ?`;
      db.query(getJobSql, [result.insertId], (err, jobs) => {
        if (err) return callback(err);
        callback(null, { insertId: result.insertId, jr_id: jobs[0]?.jr_id });
      });
    }
  );
};

// ─── Skills / Requirements / Benefits ────────────────────────────────────────
const addSkill = (jobId, skill) => {
  db.query(`INSERT INTO job_skills (job_id, skill_name) VALUES (?, ?)`, [jobId, skill]);
};

const addRequirement = (jobId, requirement) => {
  db.query(`INSERT INTO job_requirements (job_id, requirement_text) VALUES (?, ?)`, [jobId, requirement]);
};

const addBenefit = (jobId, benefit) => {
  db.query(`INSERT INTO job_benefits (job_id, benefit_name) VALUES (?, ?)`, [jobId, benefit]);
};

const deleteJobSkills = (jobId) => {
  db.query("DELETE FROM job_skills WHERE job_id=?", [jobId]);
};

const deleteJobRequirements = (jobId) => {
  db.query("DELETE FROM job_requirements WHERE job_id=?", [jobId]);
};

const deleteJobBenefits = (jobId) => {
  db.query("DELETE FROM job_benefits WHERE job_id=?", [jobId]);
};

// ─── Get All Jobs ─────────────────────────────────────────────────────────────
const getAllJobs = (callback) => {
  const sql = `SELECT * FROM jobs ORDER BY created_at DESC`;
  db.query(sql, callback);
};

// ─── Get Job By ID (with skills, requirements, benefits) ─────────────────────
const getJobById = (jobId, callback) => {
  const sql = `SELECT * FROM jobs WHERE id = ?`;
  db.query(sql, [jobId], (err, jobs) => {
    if (err) return callback(err);
    if (jobs.length === 0) return callback(null, null);

    const job = jobs[0];

    db.query(`SELECT skill_name FROM job_skills WHERE job_id=?`, [jobId], (err, skills) => {
      if (err) return callback(err);

      db.query(`SELECT requirement_text FROM job_requirements WHERE job_id=?`, [jobId], (err, requirements) => {
        if (err) return callback(err);

        db.query(`SELECT benefit_name FROM job_benefits WHERE job_id=?`, [jobId], (err, benefits) => {
          if (err) return callback(err);

          job.skills       = skills.map((x) => x.skill_name);
          job.requirements = requirements.map((x) => x.requirement_text);
          job.benefits     = benefits.map((x) => x.benefit_name);

          callback(null, job);
        });
      });
    });
  });
};

// ─── Update Job ───────────────────────────────────────────────────────────────
const updateJob = (jobId, data, callback) => {
  const sql = `
    UPDATE jobs SET
      title=?, department=?, job_type=?, experience_level=?, required_experience=?,
      shift_timings=?, openings=?, location=?, work_mode=?, salary_min=?, salary_max=?,
      show_salary=?, description=?, deadline=?, status=?
    WHERE id=?
  `;
  db.query(
    sql,
    [
      data.title, data.department, data.job_type, data.experience_level,
      data.required_experience, data.shift_timings, data.openings, data.location,
      data.work_mode, data.salary_min, data.salary_max, data.show_salary,
      data.description, data.deadline, data.status, jobId,
    ],
    callback
  );
};

// ─── Delete Job ───────────────────────────────────────────────────────────────
const deleteJobPermanently = (jobId, callback) => {
  db.query("DELETE FROM job_skills WHERE job_id=?", [jobId]);
  db.query("DELETE FROM job_requirements WHERE job_id=?", [jobId]);
  db.query("DELETE FROM job_benefits WHERE job_id=?", [jobId]);
  db.query("DELETE FROM job_candidates WHERE job_id=?", [jobId]);
  db.query(`DELETE FROM jobs WHERE id=?`, [jobId], callback);
};

// ─── Pause / Resume ───────────────────────────────────────────────────────────
const pauseJob = (jobId, callback) => {
  db.query(`UPDATE jobs SET status='paused' WHERE id=?`, [jobId], callback);
};

const resumeJob = (jobId, callback) => {
  db.query(`UPDATE jobs SET status='active' WHERE id=?`, [jobId], callback);
};

// ─── Candidate Count (uses job_candidates table) ──────────────────────────────
// Total count for a single job (both website + manual)
// const getCandidateCountByJobId = (jobId, callback) => {
//   const sql = `
//     SELECT COUNT(*) AS total_applications
//     FROM job_candidates
//     WHERE job_id = ?
//   `;
//   db.query(sql, [jobId], callback);
// };

const getCandidateCountByJobId = (jobId, callback) => {
  const sql = `
    SELECT COUNT(*) AS total_applications
    FROM (
      SELECT id AS candidate_id
      FROM candidates
      WHERE applied_job_id = ?
      UNION
      SELECT candidate_id
      FROM job_candidates
      WHERE job_id = ?
    ) AS combined_applications
  `;
  db.query(sql, [jobId, jobId], callback);
};


// Count per job for ALL jobs (for the job listing page)
// const getCandidateCountForAllJobs = (callback) => {
//   const sql = `
//     SELECT job_id AS id, COUNT(*) AS total_applications
//     FROM job_candidates
//     GROUP BY job_id
//   `;
//   db.query(sql, callback);
// };

const getCandidateCountForAllJobs = (callback) => {
  const sql = `
    SELECT
      j.id,
      COALESCE(c.web_count, 0) + COALESCE(jc.manual_count, 0) AS total_applications
    FROM jobs j
    LEFT JOIN (
      SELECT applied_job_id, COUNT(*) AS web_count
      FROM candidates
      WHERE applied_job_id IS NOT NULL
      GROUP BY applied_job_id
    ) c ON j.id = c.applied_job_id
    LEFT JOIN (
      SELECT job_id, COUNT(*) AS manual_count
      FROM job_candidates
      GROUP BY job_id
    ) jc ON j.id = jc.job_id
  `;

  db.query(sql, callback);
};



// ─── Applied Candidates (source = 'website') ──────────────────────────────────
// const getAppliedCandidatesByJobId = (jobId, callback) => {
//   const sql = `
//     SELECT
//       c.id,
//       c.first_name,
//       c.last_name,
//       CONCAT(COALESCE(c.first_name,''), ' ', COALESCE(c.last_name,'')) AS full_name,
//       c.email,
//       c.phone,
//       c.location,
//       c.headline,
//       c.experience_years,
//       c.relevant_experience_years,
//       c.current_company,
//       c.expected_salary,
    
//       c.avatar,
//       jc.status,
//       jc.source,
//       jc.applied_at
//     FROM job_candidates jc
//     INNER JOIN candidates c ON jc.candidate_id = c.id
//     WHERE jc.job_id = ? AND jc.source = 'website'
//     ORDER BY jc.applied_at DESC
//   `;
//   db.query(sql, [jobId], callback);
// };

// ─── Applied Candidates (from candidates table using applied_job_id) ────────────
const getAppliedCandidatesByJobId = (jobId, callback) => {
  const sql = `
    SELECT
      id,
      first_name,
      last_name,
      CONCAT(COALESCE(first_name,''), ' ', COALESCE(last_name,'')) AS full_name,
      email,
      phone,
      location,
      headline,
      experience_years,
      relevant_experience_years,
      current_company,
      expected_salary,
      avatar,
      status,
      source,
      applied_at,
      'website' AS application_source
    FROM candidates
    WHERE applied_job_id = ?
    ORDER BY applied_at DESC
  `;
  db.query(sql, [jobId], callback);
};

// ─── Manually Added Candidates (source = 'manual') ───────────────────────────
// const getManuallyAddedCandidatesByJobId = (jobId, callback) => {
//   const sql = `
//     SELECT
//       c.id,
//       c.first_name,
//       c.last_name,
//       CONCAT(COALESCE(c.first_name,''), ' ', COALESCE(c.last_name,'')) AS full_name,
//       c.email,
//       c.phone,
//       c.location,
//       c.headline,
//       c.experience_years,
//       c.relevant_experience_years,
//       c.current_company,
//       c.expected_salary,
    
//       c.avatar,
//       jc.status,
//       jc.source,
//       jc.applied_at AS added_at
//     FROM job_candidates jc
//     INNER JOIN candidates c ON jc.candidate_id = c.id
//     WHERE jc.job_id = ? AND jc.source = 'manual'
//     ORDER BY jc.applied_at DESC
//   `;
//   db.query(sql, [jobId], callback);
// };

const getManuallyAddedCandidatesByJobId = (jobId, callback) => {
  const sql = `
    SELECT
      c.id,
      c.first_name,
      c.last_name,
      CONCAT(COALESCE(c.first_name,''), ' ', COALESCE(c.last_name,'')) AS full_name,
      c.email,
      c.phone,
      c.location,
      c.headline,
      c.experience_years,
      c.relevant_experience_years,
      c.current_company,
      c.expected_salary,
      c.avatar,
      c.status,
      jc.source,
      jc.applied_at AS added_at
    FROM job_candidates jc
    INNER JOIN candidates c ON jc.candidate_id = c.id
    WHERE jc.job_id = ? 
      AND jc.source = 'manual'
    ORDER BY jc.applied_at DESC
  `;

  db.query(sql, [jobId], callback);
};

// ─── Picker: All candidates NOT already linked to this job ───────────────────
const getAllCandidatesForPicker = (jobId, callback) => {
  const sql = `
    SELECT
      c.id,
      c.first_name,
      c.last_name,
      CONCAT(COALESCE(c.first_name,''), ' ', COALESCE(c.last_name,'')) AS full_name,
      c.email,
      c.phone,
      c.location,
      c.headline,
      c.experience_years,
   
      c.avatar,
      c.current_company,
      c.status,
      c.source
    FROM candidates c
    WHERE c.id NOT IN (
      SELECT candidate_id FROM job_candidates WHERE job_id = ?
    )
    ORDER BY c.first_name ASC, c.last_name ASC
  `;
  db.query(sql, [jobId], callback);
};

// ─── Add Candidate to Job (manual) ───────────────────────────────────────────
const addCandidateToJob = (jobId, candidateId, addedBy, status, callback) => {
  const sql = `
    INSERT INTO job_candidates (job_id, candidate_id, status, source, created_by)
    VALUES (?, ?, ?, 'manual', ?)
    ON DUPLICATE KEY UPDATE
      source = 'manual',
      updated_at = CURRENT_TIMESTAMP
  `;
  db.query(sql, [jobId, candidateId, status || "applied", addedBy || null], callback);
};

// ─── Remove Manually Added Candidate ─────────────────────────────────────────
const removeCandidateFromJob = (jobId, candidateId, callback) => {
  const sql = `
    DELETE FROM job_candidates
    WHERE job_id = ? AND candidate_id = ? AND source = 'manual'
  `;
  db.query(sql, [jobId, candidateId], callback);
};

// ─── Update Candidate Status on a Job ────────────────────────────────────────
const updateCandidateJobStatus = (jobId, candidateId, status, callback) => {
  const sql = `
    UPDATE job_candidates
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE job_id = ? AND candidate_id = ?
  `;
  db.query(sql, [status, jobId, candidateId], callback);
};


const getActiveJobsCount = (callback) => {
  const sql = `SELECT COUNT(*) as count FROM jobs WHERE status = 'active'`;
  db.query(sql, callback);
};

// Get count of all jobs
const getTotalJobsCount = (callback) => {
  const sql = `SELECT COUNT(*) as count FROM jobs`;
  db.query(sql, callback);
};



// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  // Job CRUD
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJobPermanently,

  // Skills / Requirements / Benefits
  addSkill,
  addRequirement,
  addBenefit,
  deleteJobSkills,
  deleteJobRequirements,
  deleteJobBenefits,

  // Job status
  pauseJob,
  resumeJob,

  // Candidate linking
  getCandidateCountByJobId,
  getCandidateCountForAllJobs,
  getAppliedCandidatesByJobId,
  getManuallyAddedCandidatesByJobId,
  getAllCandidatesForPicker,
  addCandidateToJob,
  removeCandidateFromJob,
  updateCandidateJobStatus,

  // Job counts
  getActiveJobsCount,
  getTotalJobsCount,

};
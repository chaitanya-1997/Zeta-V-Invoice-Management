const db = require("../../config/db");

const createJob = (data, callback) => {
  const sql = `
    INSERT INTO jobs (
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
      created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      data.title,
      data.department,
      data.job_type,
      data.experience_level,
      data.openings,
      data.location,
      data.work_mode,
      data.salary_min,
      data.salary_max,
      data.show_salary,
      data.description,
      data.deadline,
      data.status,
      data.created_by,
    ],
    callback
  );
};

const addSkill = (jobId, skill) => {
  const sql = `
    INSERT INTO job_skills
    (job_id, skill_name)
    VALUES (?, ?)
  `;

  db.query(sql, [jobId, skill]);
};

const addRequirement = (jobId, requirement) => {
  const sql = `
    INSERT INTO job_requirements
    (job_id, requirement_text)
    VALUES (?, ?)
  `;

  db.query(sql, [jobId, requirement]);
};

const addBenefit = (jobId, benefit) => {
  const sql = `
    INSERT INTO job_benefits
    (job_id, benefit_name)
    VALUES (?, ?)
  `;

  db.query(sql, [jobId, benefit]);
};

const getAllJobs = (callback) => {
  const sql = `
    SELECT *
    FROM jobs
    ORDER BY created_at DESC
  `;

  db.query(sql, callback);
};



const getJobById = (jobId, callback) => {
  const sql = `
    SELECT *
    FROM jobs
    WHERE id = ?
  `;

  db.query(sql, [jobId], (err, jobs) => {
    if (err) return callback(err);

    if (jobs.length === 0) {
      return callback(null, null);
    }

    const job = jobs[0];

    db.query(
      `SELECT skill_name FROM job_skills WHERE job_id=?`,
      [jobId],
      (err, skills) => {
        if (err) return callback(err);

        db.query(
          `SELECT requirement_text FROM job_requirements WHERE job_id=?`,
          [jobId],
          (err, requirements) => {
            if (err) return callback(err);

            db.query(
              `SELECT benefit_name FROM job_benefits WHERE job_id=?`,
              [jobId],
              (err, benefits) => {
                if (err) return callback(err);

                job.skills = skills.map((x) => x.skill_name);
                job.requirements = requirements.map(
                  (x) => x.requirement_text
                );
                job.benefits = benefits.map(
                  (x) => x.benefit_name
                );

                callback(null, job);
              }
            );
          }
        );
      }
    );
  });
};


const updateJob = (jobId, data, callback) => {
  const sql = `
    UPDATE jobs
    SET
      title=?,
      department=?,
      job_type=?,
      experience_level=?,
      openings=?,
      location=?,
      work_mode=?,
      salary_min=?,
      salary_max=?,
      show_salary=?,
      description=?,
      deadline=?,
      status=?
    WHERE id=?
  `;

  db.query(
    sql,
    [
      data.title,
      data.department,
      data.job_type,
      data.experience_level,
      data.openings,
      data.location,
      data.work_mode,
      data.salary_min,
      data.salary_max,
      data.show_salary,
      data.description,
      data.deadline,
      data.status,
      jobId,
    ],
    callback
  );
};


const deleteJobSkills = (jobId) => {
  db.query(
    "DELETE FROM job_skills WHERE job_id=?",
    [jobId]
  );
};


const deleteJobRequirements = (jobId) => {
  db.query(
    "DELETE FROM job_requirements WHERE job_id=?",
    [jobId]
  );
};

const deleteJobBenefits = (jobId) => {
  db.query(
    "DELETE FROM job_benefits WHERE job_id=?",
    [jobId]
  );
};


const deleteJob = (jobId, callback) => {
  const sql = `
    UPDATE jobs
    SET status='closed'
    WHERE id=?
  `;

  db.query(sql, [jobId], callback);
};


const pauseJob = (jobId, callback) => {
  const sql = `
    UPDATE jobs
    SET status='paused'
    WHERE id=?
  `;

  db.query(sql, [jobId], callback);
};

const resumeJob = (jobId, callback) => {
  const sql = `
    UPDATE jobs
    SET status='active'
    WHERE id=?
  `;

  db.query(sql, [jobId], callback);
};

module.exports = {
  createJob,
  addSkill,
  addRequirement,
  addBenefit,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  pauseJob,
  resumeJob,
  deleteJobSkills,
  deleteJobRequirements,
  deleteJobBenefits
};
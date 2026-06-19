

const db = require("../../config/db");

// Helper functions
const safeNum = (val) => {
  if (!val || val === "") return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
};

const parseSkills = (skillsStr) => {
  if (!skillsStr) return [];
  if (typeof skillsStr === "string") {
    return skillsStr.split(",").map(s => s.trim()).filter(Boolean);
  }
  if (Array.isArray(skillsStr)) return skillsStr;
  return [];
};

// Create candidate from public website (No authentication required)
exports.publicCreateCandidate = async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone,
      current_location, linkedin_url, portfolio_url, github_url,
      total_experience, relevant_experience,
      current_company, current_designation, current_ctc, expected_ctc,
      notice_period,
      highest_qualification, college, graduation_year, certifications,
      why_join, cover_letter, availability, willing_to_relocate,
      skills, job_id
    } = req.body;

    // Validation
    if (!first_name || !last_name || !email || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: "First name, last name, email and phone are required." 
      });
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email format." 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Resume file is required." 
      });
    }

    // Check if candidate already exists
    const checkSql = `SELECT id, email, phone FROM candidates WHERE email = ? OR phone = ?`;
    const existingCandidate = await new Promise((resolve, reject) => {
      db.query(checkSql, [email, phone], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    if (existingCandidate && existingCandidate.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: "A candidate with this email or phone already exists. Our team will contact you soon." 
      });
    }

    // Parse skills
    const skillsArr = parseSkills(skills);

    // Get IP address and user agent
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Prepare candidate data
    const candidateData = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      headline: current_designation || `${total_experience || 0}+ years experience`,
      location: current_location || null,
      experience_years: safeNum(total_experience),
      relevant_experience_years: safeNum(relevant_experience),
      current_company: current_company || null,
      current_designation: current_designation || null,
      current_salary: safeNum(current_ctc),
      expected_salary: safeNum(expected_ctc),
      notice_period: notice_period || null,
      highest_qualification: highest_qualification || null,
      college: college || null,
      graduation_year: graduation_year || null,
      certifications: certifications || null,
      why_join: why_join || null,
      cover_letter: cover_letter || null,
      availability: availability || null,
      willing_to_relocate: willing_to_relocate === 'true' || willing_to_relocate === true ? 1 : 0,
      linkedin_url: linkedin_url || null,
      portfolio_url: portfolio_url || null,
      github_url: github_url || null,
      applied_job_id: job_id || null,  // Store the job ID candidate applied for
      source: "Direct",
      application_source: "website",
      ip_address: ipAddress,
      user_agent: userAgent,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${first_name} ${last_name}`)}&background=3b82f6&color=fff`,
      resume_file_name: req.file.filename,
      resume_url: `/uploads/resumes/${req.file.filename}`,
      status: "unscreened",
      created_by: null
    };

    // Updated INSERT statement with applied_job_id column
    const sql = `
      INSERT INTO candidates (
        first_name, last_name, email, phone, headline, location,
        experience_years, relevant_experience_years, current_company, current_designation,
        current_salary, expected_salary, notice_period, highest_qualification, college,
        graduation_year, certifications, why_join, cover_letter, availability,
        willing_to_relocate, linkedin_url, portfolio_url, github_url, applied_job_id,
        source, application_source, ip_address, user_agent, avatar, resume_file_name,
        resume_url, status, created_by, applied_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      candidateData.first_name,
      candidateData.last_name,
      candidateData.email,
      candidateData.phone,
      candidateData.headline,
      candidateData.location,
      candidateData.experience_years,
      candidateData.relevant_experience_years,
      candidateData.current_company,
      candidateData.current_designation,
      candidateData.current_salary,
      candidateData.expected_salary,
      candidateData.notice_period,
      candidateData.highest_qualification,
      candidateData.college,
      candidateData.graduation_year,
      candidateData.certifications,
      candidateData.why_join,
      candidateData.cover_letter,
      candidateData.availability,
      candidateData.willing_to_relocate,
      candidateData.linkedin_url,
      candidateData.portfolio_url,
      candidateData.github_url,
      candidateData.applied_job_id,
      candidateData.source,
      candidateData.application_source,
      candidateData.ip_address,
      candidateData.user_agent,
      candidateData.avatar,
      candidateData.resume_file_name,
      candidateData.resume_url,
      candidateData.status,
      candidateData.created_by
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Create Candidate Error:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Error creating application", 
          error: err.message 
        });
      }

      const candidateId = result.insertId;

      // Insert skills
      if (skillsArr.length > 0) {
        const skillSql = `INSERT INTO candidate_skills (candidate_id, skill_name) VALUES (?, ?)`;
        skillsArr.forEach(skillName => {
          db.query(skillSql, [candidateId, skillName], (err) => {
            if (err) console.error("Skill Insert Error:", skillName, err);
          });
        });
      }

      // Optional: Also track in candidate_applications table if it exists
      if (job_id) {
        const jobSql = `INSERT INTO candidate_applications (candidate_id, job_id, applied_at) VALUES (?, ?, NOW())`;
        db.query(jobSql, [candidateId, job_id], (err) => {
          if (err) console.error("Job application tracking error:", err);
        });
      }

      return res.status(201).json({
        success: true,
        message: "Application submitted successfully! Our HR team will review your application.",
        application_id: candidateId,
        applied_job_id: job_id || null
      });
    });
  } catch (error) {
    console.error("Create Candidate Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};



// Check if candidate already applied
exports.checkExistingApplication = async (req, res) => {
  try {
    const { email, phone } = req.query;
    
    if (!email && !phone) {
      return res.status(400).json({ 
        success: false, 
        message: "Email or phone is required" 
      });
    }

    let sql = `SELECT id, email, phone, created_at FROM candidates WHERE `;
    const params = [];
    
    if (email && phone) {
      sql += `email = ? OR phone = ?`;
      params.push(email, phone);
    } else if (email) {
      sql += `email = ?`;
      params.push(email);
    } else {
      sql += `phone = ?`;
      params.push(phone);
    }

    db.query(sql, params, (err, results) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Error checking existing application" 
        });
      }

      return res.status(200).json({
        success: true,
        exists: results && results.length > 0,
        data: results && results.length > 0 ? results[0] : null
      });
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get job listings for website (with skills, requirements, benefits)
exports.getPublicJobs = async (req, res) => {
  try {
    const sql = `
      SELECT 
        j.id, 
        j.title, 
        j.department, 
        j.job_type, 
        j.experience_level, 
        j.location, 
        j.work_mode, 
        j.description, 
        j.required_experience, 
        j.shift_timings,
        j.salary_min,
        j.salary_max,
        j.show_salary,
        j.deadline, 
        j.created_at,
        j.jr_id
      FROM jobs j
      WHERE j.status = 'active' AND j.deadline >= CURDATE()
      ORDER BY j.created_at DESC
    `;
    
    db.query(sql, (err, jobs) => {
      if (err) {
        console.error("Error fetching jobs:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Error fetching jobs" 
        });
      }
      
      // If no jobs found, return empty array
      if (!jobs || jobs.length === 0) {
        return res.status(200).json({
          success: true,
          data: []
        });
      }
      
      // Fetch skills, requirements, benefits for each job
      const jobIds = jobs.map(job => job.id);
      
      // Get all skills for these jobs
      const skillSql = `SELECT job_id, skill_name FROM job_skills WHERE job_id IN (?)`;
      db.query(skillSql, [jobIds], (err, skills) => {
        if (err) {
          console.error("Error fetching skills:", err);
          // Continue without skills
        }
        
        // Get all requirements for these jobs
        const reqSql = `SELECT job_id, requirement_text FROM job_requirements WHERE job_id IN (?)`;
        db.query(reqSql, [jobIds], (err, requirements) => {
          if (err) {
            console.error("Error fetching requirements:", err);
          }
          
          // Get all benefits for these jobs
          const benefitSql = `SELECT job_id, benefit_name FROM job_benefits WHERE job_id IN (?)`;
          db.query(benefitSql, [jobIds], (err, benefits) => {
            if (err) {
              console.error("Error fetching benefits:", err);
            }
            
            // Group skills by job_id
            const skillsMap = {};
            if (skills) {
              skills.forEach(skill => {
                if (!skillsMap[skill.job_id]) skillsMap[skill.job_id] = [];
                skillsMap[skill.job_id].push(skill.skill_name);
              });
            }
            
            // Group requirements by job_id
            const requirementsMap = {};
            if (requirements) {
              requirements.forEach(req => {
                if (!requirementsMap[req.job_id]) requirementsMap[req.job_id] = [];
                requirementsMap[req.job_id].push(req.requirement_text);
              });
            }
            
            // Group benefits by job_id
            const benefitsMap = {};
            if (benefits) {
              benefits.forEach(benefit => {
                if (!benefitsMap[benefit.job_id]) benefitsMap[benefit.job_id] = [];
                benefitsMap[benefit.job_id].push(benefit.benefit_name);
              });
            }
            
            // Attach skills, requirements, benefits to each job
            const jobsWithDetails = jobs.map(job => ({
              ...job,
              skills: skillsMap[job.id] || [],
              requirements: requirementsMap[job.id] || [],
              benefits: benefitsMap[job.id] || []
            }));
            
            return res.status(200).json({
              success: true,
              data: jobsWithDetails
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("Error in getPublicJobs:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get single job details for website (with complete details)
exports.getPublicJobById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT 
        j.id, 
        j.title, 
        j.department, 
        j.job_type, 
        j.experience_level, 
        j.location, 
        j.work_mode, 
        j.description, 
        j.required_experience, 
        j.shift_timings,
        j.salary_min,
        j.salary_max,
        j.show_salary,
        j.deadline, 
        j.created_at,
        j.jr_id,
        j.openings
      FROM jobs j
      WHERE j.id = ? AND j.status = 'active' AND j.deadline >= CURDATE()
    `;
    
    db.query(sql, [id], (err, jobs) => {
      if (err) {
        console.error("Error fetching job details:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Error fetching job details" 
        });
      }
      
      if (!jobs || jobs.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "Job not found or expired" 
        });
      }
      
      const job = jobs[0];
      
      // Fetch skills for this job
      const skillSql = `SELECT skill_name FROM job_skills WHERE job_id = ?`;
      db.query(skillSql, [id], (err, skills) => {
        if (err) {
          console.error("Error fetching skills:", err);
        }
        
        // Fetch requirements for this job
        const reqSql = `SELECT requirement_text FROM job_requirements WHERE job_id = ?`;
        db.query(reqSql, [id], (err, requirements) => {
          if (err) {
            console.error("Error fetching requirements:", err);
          }
          
          // Fetch benefits for this job
          const benefitSql = `SELECT benefit_name FROM job_benefits WHERE job_id = ?`;
          db.query(benefitSql, [id], (err, benefits) => {
            if (err) {
              console.error("Error fetching benefits:", err);
            }
            
            // Attach details to job
            job.skills = skills ? skills.map(s => s.skill_name) : [];
            job.requirements = requirements ? requirements.map(r => r.requirement_text) : [];
            job.benefits = benefits ? benefits.map(b => b.benefit_name) : [];
            
            return res.status(200).json({
              success: true,
              data: job
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("Error in getPublicJobById:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
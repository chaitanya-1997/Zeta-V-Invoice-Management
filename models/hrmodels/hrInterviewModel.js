const db = require("../../config/db");

// Create interview
const createInterview = (data, callback) => {
  const sql = `
    INSERT INTO hr_interviews (
      candidate_id, job_id, team_member_id, interview_date, interview_time,
      duration, platform, meet_url, notes, status, result, send_invite, created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      data.candidate_id,
      data.job_id || null,
      data.team_member_id,
      data.interview_date,
      data.interview_time,
      data.duration,
      data.platform,
      data.meet_url,
      data.notes,
      data.status || 'scheduled',
      data.result || 'pending',
      data.send_invite ? 1 : 0,
      data.created_by
    ],
    callback
  );
};

// Get all interviews with details
const getAllInterviews = (callback) => {
  const sql = `
    SELECT 
      i.*,
      c.full_name as candidate_name,
      c.email as candidate_email,
      c.phone as candidate_phone,
      c.avatar as candidate_avatar,
      j.title as job_title,
      j.department as job_department,
      t.name as team_member_name,
      t.role as team_member_role,
      t.avatar as team_member_avatar
    FROM hr_interviews i
    LEFT JOIN candidates c ON i.candidate_id = c.id
    LEFT JOIN jobs j ON i.job_id = j.id
    LEFT JOIN hr_team t ON i.team_member_id = t.id
    WHERE i.status != 'deleted'
    ORDER BY i.interview_date DESC, i.interview_time ASC
  `;
  db.query(sql, callback);
};

// Get interview by ID
const getInterviewById = (id, callback) => {
  const sql = `
    SELECT 
      i.*,
      c.full_name as candidate_name,
      c.email as candidate_email,
      c.phone as candidate_phone,
      c.avatar as candidate_avatar,
      j.title as job_title,
      j.department as job_department,
      t.name as team_member_name,
      t.role as team_member_role,
      t.avatar as team_member_avatar
    FROM hr_interviews i
    LEFT JOIN candidates c ON i.candidate_id = c.id
    LEFT JOIN jobs j ON i.job_id = j.id
    LEFT JOIN hr_team t ON i.team_member_id = t.id
    WHERE i.id = ? AND i.status != 'deleted'
  `;
  db.query(sql, [id], callback);
};

// Get interviews by date
const getInterviewsByDate = (date, callback) => {
  const sql = `
    SELECT 
      i.*,
      c.full_name as candidate_name,
      c.avatar as candidate_avatar,
      j.title as job_title,
      t.name as team_member_name
    FROM hr_interviews i
    LEFT JOIN candidates c ON i.candidate_id = c.id
    LEFT JOIN jobs j ON i.job_id = j.id
    LEFT JOIN hr_team t ON i.team_member_id = t.id
    WHERE i.interview_date = ? AND i.status != 'deleted'
    ORDER BY i.interview_time ASC
  `;
  db.query(sql, [date], callback);
};

// Update interview
const updateInterview = (id, data, callback) => {
  const sql = `
    UPDATE hr_interviews
    SET 
      candidate_id = ?,
      job_id = ?,
      team_member_id = ?,
      interview_date = ?,
      interview_time = ?,
      duration = ?,
      platform = ?,
      meet_url = ?,
      notes = ?,
      status = ?,
      result = ?,
      send_invite = ?
    WHERE id = ? AND status != 'deleted'
  `;

  db.query(
    sql,
    [
      data.candidate_id,
      data.job_id || null,
      data.team_member_id,
      data.interview_date,
      data.interview_time,
      data.duration,
      data.platform,
      data.meet_url,
      data.notes,
      data.status,
      data.result,
      data.send_invite ? 1 : 0,
      id
    ],
    callback
  );
};

// Update interview status
const updateInterviewStatus = (id, status, result, callback) => {
  const sql = `
    UPDATE hr_interviews
    SET status = ?, result = ?
    WHERE id = ? AND status != 'deleted'
  `;
  db.query(sql, [status, result, id], callback);
};

// Delete interview (soft delete)
const deleteInterview = (id, callback) => {
  const sql = `
    UPDATE hr_interviews
    SET status = 'deleted'
    WHERE id = ?
  `;
  db.query(sql, [id], callback);
};

// Get upcoming interviews
const getUpcomingInterviews = (callback) => {
  const sql = `
    SELECT 
      i.*,
      c.full_name as candidate_name,
      c.avatar as candidate_avatar,
      j.title as job_title,
      t.name as team_member_name
    FROM hr_interviews i
    LEFT JOIN candidates c ON i.candidate_id = c.id
    LEFT JOIN jobs j ON i.job_id = j.id
    LEFT JOIN hr_team t ON i.team_member_id = t.id
    WHERE i.interview_date >= CURDATE() 
      AND i.status IN ('scheduled', 'confirmed')
      AND i.status != 'deleted'
    ORDER BY i.interview_date ASC, i.interview_time ASC
    LIMIT 10
  `;
  db.query(sql, callback);
};

module.exports = {
  createInterview,
  getAllInterviews,
  getInterviewById,
  getInterviewsByDate,
  updateInterview,
  updateInterviewStatus,
  deleteInterview,
  getUpcomingInterviews
};
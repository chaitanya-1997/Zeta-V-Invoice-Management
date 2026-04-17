const db = require("../config/db");

exports.createProject = async (req, res) => {
  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.user.id;

    let {
      name,
      code,
      customer_id,
      billing_method,
      status,
      start_date,
      end_date,
      budget,
      description,
      members,
      tasks,
    } = req.body;

    if (typeof members === "string") {
      members = JSON.parse(members);
    }

    if (typeof tasks === "string") {
      tasks = JSON.parse(tasks);
    }

    /* CREATE PROJECT */

    const [projectResult] = await connection.query(
      `INSERT INTO zv_projects
      (name,code,customer_id,billing_method,status,start_date,end_date,budget,description,created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        name,
        code,
        customer_id,
        billing_method,
        status,
        start_date,
        end_date,
        budget,
        description,
        userId,
      ],
    );

    const projectId = projectResult.insertId;

    /* ADD MEMBERS */

    for (const memberId of members) {
      await connection.query(
        `INSERT INTO zv_project_members
        (project_id,project_user_id)
        VALUES (?,?)`,
        [projectId, memberId],
      );
    }

    /* ADD TASKS */

    for (const task of tasks) {
      await connection.query(
        `INSERT INTO zv_project_tasks
        (project_id,name,description,billable)
        VALUES (?,?,?,?)`,
        [projectId, task.name, task.description, task.billable ? 1 : 0],
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: "Project created successfully",
      projectId,
    });
  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;

    /* PROJECT DETAILS */

    const [projectRows] = await db.promise().query(
      `SELECT 
        p.*,
        c.name AS customer_name
       FROM zv_projects p
       LEFT JOIN zv_customers c ON p.customer_id = c.id
       WHERE p.id = ?`,
      [projectId],
    );

    if (projectRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const project = projectRows[0];

    /* PROJECT MEMBERS */

    const [members] = await db.promise().query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.role
       FROM zv_project_members pm
       JOIN zv_project_users u
       ON pm.project_user_id = u.id
       WHERE pm.project_id = ?`,
      [projectId],
    );

    /* PROJECT TASKS */

    const [tasks] = await db.promise().query(
      `SELECT 
        id,
        name,
        description,
        billable
       FROM zv_project_tasks
       WHERE project_id = ?`,
      [projectId],
    );

    res.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        code: project.code,
        billing_method: project.billing_method,
        status: project.status,
        start_date: project.start_date,
        end_date: project.end_date,
        budget: project.budget,
        description: project.description,

        customer: {
          id: project.customer_id,
          name: project.customer_name,
        },

        members,
        tasks,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const [projects] = await db.promise().query(`
      SELECT 
        p.id,
        p.name,
        p.code,
        p.status,
        p.start_date,
        p.end_date,
        p.budget,
        c.name AS customer_name,

        COUNT(DISTINCT pm.project_user_id) AS members_count,
        COUNT(DISTINCT pt.id) AS tasks_count

      FROM zv_projects p

      LEFT JOIN zv_customers c
      ON p.customer_id = c.id

      LEFT JOIN zv_project_members pm
      ON p.id = pm.project_id

      LEFT JOIN zv_project_tasks pt
      ON p.id = pt.project_id

      GROUP BY p.id

      ORDER BY p.created_at DESC
    `);

    res.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateProject = async (req, res) => {
  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();

    const projectId = req.params.id;

    let {
      name,
      code,
      customer_id,
      billing_method,
      status,
      start_date,
      end_date,
      budget,
      description,
      members,
      tasks,
    } = req.body;

    if (typeof members === "string") members = JSON.parse(members);
    if (typeof tasks === "string") tasks = JSON.parse(tasks);

    /* UPDATE PROJECT */

    await connection.query(
      `UPDATE zv_projects
       SET name=?, code=?, customer_id=?, billing_method=?, status=?, 
           start_date=?, end_date=?, budget=?, description=?
       WHERE id=?`,
      [
        name,
        code,
        customer_id,
        billing_method,
        status,
        start_date,
        end_date,
        budget,
        description,
        projectId,
      ],
    );

    /* RESET MEMBERS */

    await connection.query(
      `DELETE FROM zv_project_members WHERE project_id=?`,
      [projectId],
    );

    for (const memberId of members) {
      await connection.query(
        `INSERT INTO zv_project_members
         (project_id,project_user_id)
         VALUES (?,?)`,
        [projectId, memberId],
      );
    }

    /* RESET TASKS */

    await connection.query(`DELETE FROM zv_project_tasks WHERE project_id=?`, [
      projectId,
    ]);

    for (const task of tasks) {
      await connection.query(
        `INSERT INTO zv_project_tasks
         (project_id,name,description,billable)
         VALUES (?,?,?,?)`,
        [projectId, task.name, task.description, task.billable ? 1 : 0],
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: "Project updated successfully",
    });
  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    await db.promise().query(`DELETE FROM zv_projects WHERE id=?`, [projectId]);

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

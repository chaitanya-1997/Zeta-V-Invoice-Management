const JOBS_API_URL =
  "https://zeta-v-invoicemanagement-ddgwdzg2dchdfaf4.centralindia-01.azurewebsites.net/api/public/jobs";

const cleanText = (text = "") => {
  return String(text)
    .replace(/\s+/g, " ")
    .trim();
};

const formatDate = (date) => {
  if (!date) {
    return "Not specified";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date);
  }

  return parsedDate
    .toISOString()
    .split("T")[0];
};

const getLivePublicJobs = async () => {
  try {
    const response = await fetch(
      JOBS_API_URL
    );

    if (!response.ok) {
      throw new Error(
        `Jobs API returned ${response.status}`
      );
    }

    const result = await response.json();

    if (
      !result.success ||
      !Array.isArray(result.data)
    ) {
      throw new Error(
        "Invalid jobs API response"
      );
    }

    console.log(
      "Live Jobs API count:",
      result.data.length
    );

    console.log(
      "Live Jobs API titles:",
      result.data.map(
        (job) => job.title
      )
    );

    return result.data;
  } catch (error) {
    console.error(
      "Chatbot live jobs API error:",
      error.message
    );

    throw error;
  }
};

const buildJobsContext = async () => {
  const jobs = await getLivePublicJobs();

  if (!jobs.length) {
    return {
      context: `
LIVE ZETA-V CAREERS DATA

CURRENT OPEN POSITIONS: 0

There are currently no active open positions at Zeta-V.
`,
      jobs: [],
      count: 0,
    };
  }

  const jobsContext = jobs
    .map((job, index) => {
      let salary =
        "Not publicly displayed";

      if (
        Number(job.show_salary) === 1
      ) {
        if (
          Number(job.salary_min) > 0 &&
          Number(job.salary_max) > 0
        ) {
          salary =
            `${job.salary_min} - ${job.salary_max}`;
        } else if (
          Number(job.salary_min) > 0
        ) {
          salary =
            `From ${job.salary_min}`;
        } else if (
          Number(job.salary_max) > 0
        ) {
          salary =
            `Up to ${job.salary_max}`;
        }
      }

      const skills =
        Array.isArray(job.skills) &&
        job.skills.length
          ? job.skills.join(", ")
          : "Not specified";

      const requirements =
        Array.isArray(job.requirements) &&
        job.requirements.length
          ? job.requirements.join(" | ")
          : "Not specified";

      const benefits =
        Array.isArray(job.benefits) &&
        job.benefits.length
          ? job.benefits.join(", ")
          : "Not specified";

      return `
JOB ${index + 1}

JOB REQUISITION ID:
${job.jr_id || job.id}

TITLE:
${cleanText(job.title)}

DEPARTMENT:
${cleanText(job.department) || "Not specified"}

JOB TYPE:
${cleanText(job.job_type) || "Not specified"}

EXPERIENCE LEVEL:
${cleanText(job.experience_level) || "Not specified"}

REQUIRED EXPERIENCE:
${cleanText(job.required_experience) || "Not specified"}

LOCATION:
${cleanText(job.location) || "Not specified"}

WORK MODE:
${cleanText(job.work_mode) || "Not specified"}

SHIFT TIMINGS:
${cleanText(job.shift_timings) || "Not specified"}

SALARY:
${salary}

APPLICATION DEADLINE:
${formatDate(job.deadline)}

SKILLS:
${skills}

REQUIREMENTS:
${requirements}

BENEFITS:
${benefits}

JOB DESCRIPTION:
${cleanText(job.description).slice(0, 1500)}
`;
    })
    .join(
      "\n\n------------------------------\n\n"
    );

  return {
    context: `
LIVE ZETA-V CAREERS DATA

CURRENT OPEN POSITIONS: ${jobs.length}

IMPORTANT:
Only the jobs listed below are currently active and available.

${jobsContext}
`,
    jobs,
    count: jobs.length,
  };
};

module.exports = {
  getLivePublicJobs,
  buildJobsContext,
};
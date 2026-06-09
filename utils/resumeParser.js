// utils/resumeParser.js

/**
 * Extract text from PDF file
 * @param {File} file - The PDF file
 * @returns {Promise<string>} Extracted text
 */
const extractTextFromPdf = async (file) => {
  try {
    // Dynamic import of pdf-parse
    const pdfParse = await import('pdf-parse');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdfParse.default(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
};

/**
 * Parse resume text to extract candidate information
 * @param {string} text - The extracted text from resume
 * @returns {Object} Extracted candidate information
 */
const parseResumeText = (text) => {
  if (!text) return {};
  
  const result = {};
  
  // Extract name (look for patterns like "Name: John Doe" or assume first 2-3 words)
  const namePatterns = [
    /Name[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/m,
    /Candidate[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i,
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.name = match[1].trim();
      break;
    }
  }
  
  // Extract email
  const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
  const emailMatch = text.match(emailPattern);
  if (emailMatch) {
    result.email = emailMatch[1].toLowerCase();
  }
  
  // Extract phone number (Indian format)
  const phonePatterns = [
    /(?:\+91|0)?[-\s]?[6-9]\d{9}/,
    /[6-9]\d{9}/,
    /\+91[-\s]?\d{10}/,
    /\(\+91\)[-\s]?\d{10}/,
  ];
  
  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match) {
      let phone = match[0].replace(/[\s-]/g, '');
      if (!phone.startsWith('+91') && phone.length === 10) {
        phone = '+91' + phone;
      }
      result.phone = phone;
      break;
    }
  }
  
  // Extract headline/current role
  const headlinePatterns = [
    /(?:Current Role|Designation|Position|Title)[:\s]+([^\n]+)/i,
    /(?:Summary|Profile|About)[:\s]+([^\n.]+(?:Developer|Engineer|Manager|Analyst|Designer|Architect))/i,
  ];
  
  for (const pattern of headlinePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.headline = match[1].trim();
      break;
    }
  }
  
  // Extract location
  const locationPatterns = [
    /(?:Location|Address|Based in|Currently in)[:\s]+([^\n,]+(?:,?\s*[A-Z]{2})?)/i,
    /(?:Mumbai|Delhi|Bangalore|Chennai|Kolkata|Hyderabad|Pune|Ahmedabad|Jaipur)/i,
  ];
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.location = match[0].trim();
      break;
    }
  }
  
  // Extract total experience
  const expPatterns = [
    /(?:Total Experience|Experience|Work Experience)[:\s]+(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i,
    /(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|work\s*experience)/i,
    /Experience\s*:\s*(\d+(?:\.\d+)?)/i,
  ];
  
  for (const pattern of expPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.experienceYears = parseFloat(match[1]);
      break;
    }
  }
  
  // Extract current company
  const companyPatterns = [
    /(?:Current Company|Current Employer|Currently at)[:\s]+([^\n]+)/i,
    /(?:at|@)\s+([A-Z][a-zA-Z\s&]+(?:Technologies|Solutions|Corp|Inc|Ltd|Private Limited))/i,
    /(?:Worked at|Working at)[:\s]+([^\n]+)/i,
  ];
  
  for (const pattern of companyPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.currentCompany = match[1].trim();
      break;
    }
  }
  
  // Extract expected salary
  const salaryPatterns = [
    /(?:Expected|Expecting)[:\s]*₹?\s*(\d+(?:\.\d+)?)\s*(?:Lakhs?|L|Lacs?)?/i,
    /(?:Salary Expectation|CTC Expected)[:\s]*₹?\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:Lakhs?|L)\s*(?:per annum|p\.?a\.?)?/i,
  ];
  
  for (const pattern of salaryPatterns) {
    const match = text.match(pattern);
    if (match) {
      let salary = parseFloat(match[1]);
      if (salary < 100) {
        // Assume it's in lakhs
        salary = salary * 100000;
      } else if (salary < 1000) {
        // Assume it's in thousands
        salary = salary * 1000;
      }
      result.expectedSalary = salary;
      break;
    }
  }
  
  // Extract education
  const educationPatterns = [
    /(?:Education|Qualification)[:\s]+([^\n]+(?:B\.?Tech|M\.?Tech|MCA|MBA|B\.?E|M\.?E|BSc|MSc|BCA))/i,
    /(B\.?Tech|M\.?Tech|MCA|MBA|B\.?E|M\.?E|BSc|MSc|BCA)[:\s]+([^\n]+)/i,
  ];
  
  for (const pattern of educationPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.education = match[1] || match[2];
      if (result.education) {
        result.education = result.education.trim();
        break;
      }
    }
  }
  
  // Extract skills
  const skillsPatterns = [
    /(?:Skills|Technical Skills|Core Competencies)[:\s]+([^\n]+(?:React|Node|Python|Java|JavaScript|AWS|Azure|Docker|Kubernetes|SQL|MongoDB|Express|Django|Flask|Spring|Angular|Vue))/i,
    /(?:Proficient in|Expertise in)[:\s]+([^\n]+)/i,
  ];
  
  for (const pattern of skillsPatterns) {
    const match = text.match(pattern);
    if (match) {
      let skillsText = match[1];
      // Clean up and format skills
      const skills = skillsText
        .split(/[•,•\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length < 30)
        .slice(0, 10);
      
      if (skills.length > 0) {
        result.skills = skills.join(', ');
        break;
      }
    }
  }
  
  // If no skills found with patterns, try to find common tech skills
  if (!result.skills) {
    const commonSkills = [
      'React', 'Angular', 'Vue', 'Node.js', 'Python', 'Java', 'JavaScript',
      'TypeScript', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'SQL', 'MongoDB',
      'PostgreSQL', 'MySQL', 'GraphQL', 'REST API', 'Git', 'CI/CD', 'Agile',
      'Scrum', 'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap'
    ];
    
    const foundSkills = [];
    for (const skill of commonSkills) {
      if (text.toLowerCase().includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    }
    
    if (foundSkills.length > 0) {
      result.skills = foundSkills.join(', ');
    }
  }
  
  return result;
};

module.exports = {
  extractTextFromPdf,
  parseResumeText,
};
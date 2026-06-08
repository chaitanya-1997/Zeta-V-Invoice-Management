// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // Ensure upload directory exists
// const uploadDir = "uploads/resumes";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     // Format: timestamp-candidateId-originalname
//     const timestamp = Date.now();
//     const extension = path.extname(file.originalname);
//     const nameWithoutExt = path.basename(file.originalname, extension);
//     const filename = `${timestamp}-${nameWithoutExt}${extension}`;
//     cb(null, filename);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   // Accept only PDF files for resumes
//   const allowed = ["application/pdf"];
  
//   if (allowed.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error("Only PDF files are allowed. Please upload a PDF resume."),
//       false
//     );
//   }
// };

// const uploadCandidateResume = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit for resumes
//   },
// });

// module.exports = uploadCandidateResume;














const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = "uploads/resumes";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, extension);
    const filename = `${timestamp}-${nameWithoutExt}${extension}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",
    "application/msword",                                                      // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  ];
  const allowedExts = [".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF and Word (.doc/.docx) files are allowed."),
      false
    );
  }
};

const uploadCandidateResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = uploadCandidateResume;
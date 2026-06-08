

// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const pool = require("./config/db");

// const app = express();

// // Static files
// app.use("/uploads", express.static("uploads"));

// // Middleware
// app.use(
//   cors({
//     origin: "*",
//     exposedHeaders: ["Content-Disposition"],
//   })
// );
// app.use(express.json());

// // Routes
// const authRoutes = require("./routes/authRoutes");
// const itemRoutes = require("./routes/itemRoutes");
// const customerRoutes = require("./routes/customerRoutes");
// const projectUserRoutes = require("./routes/projectUserRoutes");
// const projectRoutes = require("./routes/projectroutes");
// const profileRoutes = require("./routes/profileRoutes");
// const quoteRoutes = require("./routes/quoteRoutes");
// const invoiceRoutes = require("./routes/invoiceRoutes");
// const paymtentRoutes = require("./routes/paymentRoutes");
// const settingsRoutes = require("./routes/settingsRoutes");
// const dashboardRoutes = require("./routes/dashboardRoutes");

// app.use("/api/auth", authRoutes);
// app.use("/api/items", itemRoutes);
// app.use("/api/customers", customerRoutes);
// app.use("/api/project-users", projectUserRoutes);
// app.use("/api/projects", projectRoutes);
// app.use("/api", profileRoutes);
// app.use("/api", quoteRoutes);
// app.use("/api", invoiceRoutes);
// app.use("/api", paymtentRoutes);
// app.use("/api", settingsRoutes);
// app.use("/api", dashboardRoutes);

// // ✅ Health check route (VERY IMPORTANT for Azure)
// app.get("/", (req, res) => {
//   res.send("🚀 API is running successfully");
// });

// // ✅ Global error handler (optional but good)
// app.use((err, req, res, next) => {
//   console.error("Global Error:", err);
//   res.status(500).json({ error: "Internal Server Error" });
// });

// // ✅ Start server FIRST (do not wait for DB)
// const PORT = process.env.PORT || 8080;

// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });

// // ✅ DB connection check (NON-BLOCKING)
// pool.getConnection((err, connection) => {
//   if (err) {
//     console.error("❌ Database connection failed:", err.message);
//     // DO NOT exit — app should still run
//     return;
//   }

//   console.log("✅ Database connected");
//   connection.release();
// });






require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./config/db");

const app = express();

// ✅ CORS MIDDLEWARE FIRST (before static files)
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"],
  })
);

// ✅ JSON Parser
app.use(express.json());

// ✅ Static files AFTER CORS
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, path) => {
    // Allow all image types
    if (path.match(/\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|xlsx|txt)$/i)) {
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
  }
}));

// invoice  Routes
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const customerRoutes = require("./routes/customerRoutes");
const projectUserRoutes = require("./routes/projectUserRoutes");
const projectRoutes = require("./routes/projectroutes");
const profileRoutes = require("./routes/profileRoutes");
const quoteRoutes = require("./routes/quoteRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const paymtentRoutes = require("./routes/paymentRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const hrTeamRoutes = require("./routes/hrroutes/hrTeamRoutes");
const hrInterviewRoutes = require("./routes/hrroutes/hrInterviewRoutes");
// hr Routes
const hrRoutes = require("./routes/hrroutes/hrRoutes")
const hrCandidateRoutes = require("./routes/hrroutes/hrCandidateRoutes"); 
const hrJobRoutes = require("./routes/hrroutes/hrJobRoutes");
const hrProfileRoutes = require("./routes/hrroutes/hrProfileRoutes");

// invoice-apis/routes/authRoutes.js
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/project-users", projectUserRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", profileRoutes);
app.use("/api", quoteRoutes);
app.use("/api", invoiceRoutes);
app.use("/api", paymtentRoutes);
app.use("/api", settingsRoutes);
app.use("/api", dashboardRoutes);


// hr Routes
app.use("/api/hr", hrRoutes);
app.use("/api/hr/candidates", hrCandidateRoutes);
app.use("/api/hr", hrJobRoutes);
app.use("/api/hr", hrTeamRoutes);
app.use("/api/hr", hrInterviewRoutes);
app.use("/api/hr", hrProfileRoutes);
// ── Static Files ──
app.use("/uploads", express.static("uploads"));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("🚀 API is running successfully");
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// ✅ DB connection check
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    return;
  }

  console.log("✅ Database connected");
  connection.release();
});
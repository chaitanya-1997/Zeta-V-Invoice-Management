// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const db = require("./config/db");

// const app = express();

// // app.use(cors());
// app.use(
//   cors({
//     origin: "*",
//     exposedHeaders: ["Content-Disposition"],
//   })
// );
// app.use(express.json());
// const authRoutes = require("./routes/authRoutes");

// app.use("/api/auth", authRoutes);

// const PORT = process.env.PORT || 8080;

// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);

// });


//----------------------------------------------------------------------------------
// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const pool = require("./config/db");
// const app = express();
// app.use("/uploads", express.static("uploads"));

// app.use(
//   cors({
//     origin: "*",
//     exposedHeaders: ["Content-Disposition"],
//   }),
// );
// app.use(express.json());

// const authRoutes = require("./routes/authRoutes");
// const itemRoutes = require("./routes/itemRoutes");
// const customerRoutes = require("./routes/customerRoutes");
// const projectUserRoutes = require("./routes/projectUserRoutes");
// const projectRoutes = require("./routes/projectroutes");
// const profileRoutes = require("./routes/profileRoutes");
// const quoteRoutes = require("./routes/quoteRoutes");
// const invoiceRoutes = require("./routes/invoiceRoutes");
// const paymentRoutes = require("./routes/paymentRoutes");

// app.use("/api/auth", authRoutes);
// app.use("/api/items", itemRoutes);
// app.use("/api/customers", customerRoutes);
// app.use("/api/project-users", projectUserRoutes);
// app.use("/api/projects", projectRoutes);
// app.use("/api", profileRoutes);
// app.use("/api", quoteRoutes);
// app.use("/api", invoiceRoutes);
// app.use("/api", paymentRoutes);

// const PORT = process.env.PORT || 8080;

// pool.getConnection((err, connection) => {
//   if (err) {
//     console.error("❌ Database connection failed:", err.message);
//     process.exit(1); 
//   }
//   console.log("✅ Database connected");
//   connection.release();

//   app.listen(PORT, () => {
//     console.log(`✅ Server running on port ${PORT}`);
//   });
// });



///---------------------------------------------------------------------


require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();

// Static files
app.use("/uploads", express.static("uploads"));

// Middleware
app.use(
  cors({
    origin: "*",
    exposedHeaders: ["Content-Disposition"],
  })
);
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const customerRoutes = require("./routes/customerRoutes");
const projectUserRoutes = require("./routes/projectUserRoutes");
const projectRoutes = require("./routes/projectroutes");
const profileRoutes = require("./routes/profileRoutes");
const quoteRoutes = require("./routes/quoteRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/project-users", projectUserRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", profileRoutes);
app.use("/api", quoteRoutes);
app.use("/api", invoiceRoutes);
app.use("/api", paymentRoutes);

// ✅ Health check route (VERY IMPORTANT for Azure)
app.get("/", (req, res) => {
  res.send("🚀 API is running successfully");
});

// ✅ Global error handler (optional but good)
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start server FIRST (do not wait for DB)
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// ✅ DB connection check (NON-BLOCKING)
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    // DO NOT exit — app should still run
    return;
  }

  console.log("✅ Database connected");
  connection.release();
});
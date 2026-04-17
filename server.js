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
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const app = express();
app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: "*",
    exposedHeaders: ["Content-Disposition"],
  }),
);
app.use(express.json());

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

const PORT = process.env.PORT || 8080;

pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1); 
  }
  console.log("✅ Database connected");
  connection.release();

  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
});

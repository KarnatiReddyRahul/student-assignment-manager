
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const assignmentRoutes = require("./routes/assignmentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "ok",
      message: "Backend and MySQL are connected",
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

app.use("/api/assignments", assignmentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

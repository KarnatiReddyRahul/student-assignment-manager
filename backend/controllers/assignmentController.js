
const pool = require("../config/db");

const allowedPriorities = ["High", "Medium", "Low"];
const allowedStatuses = ["Pending", "Completed"];

// GET /api/assignments
exports.getAllAssignments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM assignments ORDER BY due_date ASC"
    );

    res.json(rows);
  } catch (error) {
    console.error("Get assignments error:", error.message);
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
};

// GET /api/assignments/:id
exports.getAssignmentById = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM assignments WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Get assignment error:", error.message);
    res.status(500).json({ message: "Failed to fetch assignment" });
  }
};

// POST /api/assignments
exports.createAssignment = async (req, res) => {
  const {
    title,
    subject,
    description = "",
    due_date,
    priority = "Medium",
  } = req.body;

  if (
    typeof title !== "string" || !title.trim() ||
    typeof subject !== "string" || !subject.trim() ||
    typeof due_date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(due_date)
  ) {
    return res.status(400).json({
      message: "Title, subject, and a valid due date are required",
    });
  }

  if (!allowedPriorities.includes(priority)) {
    return res.status(400).json({
      message: "Priority must be High, Medium, or Low",
    });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO assignments
       (title, subject, description, due_date, priority)
       VALUES (?, ?, ?, ?, ?)`,
      [title.trim(), subject.trim(), description, due_date, priority]
    );

    const [rows] = await pool.execute(
      "SELECT * FROM assignments WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      message: "Assignment created successfully",
      assignment: rows[0],
    });
  } catch (error) {
    console.error("Create assignment error:", error.message);
    res.status(500).json({ message: "Failed to create assignment" });
  }
};

// PUT /api/assignments/:id
exports.updateAssignment = async (req, res) => {
  const allowedFields = [
    "title",
    "subject",
    "description",
    "due_date",
    "priority",
    "status",
  ];

  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates.push(field);
      values.push(req.body[field]);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({
      message: "Provide at least one field to update",
    });
  }

  const { title, subject, due_date, priority, status, description } =
    req.body;

  if (
    ("title" in req.body &&
      (typeof title !== "string" || !title.trim())) ||
    ("subject" in req.body &&
      (typeof subject !== "string" || !subject.trim())) ||
    ("due_date" in req.body &&
      (typeof due_date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(due_date))) ||
    ("priority" in req.body && !allowedPriorities.includes(priority)) ||
    ("status" in req.body && !allowedStatuses.includes(status)) ||
    ("description" in req.body && typeof description !== "string")
  ) {
    return res.status(400).json({
      message: "One or more assignment fields are invalid",
    });
  }

  const assignments = updates.map((field) => `${field} = ?`).join(", ");

  try {
    values.push(req.params.id);

    const [result] = await pool.execute(
      `UPDATE assignments SET ${assignments} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      const [existing] = await pool.execute(
        "SELECT id FROM assignments WHERE id = ?",
        [req.params.id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ message: "Assignment not found" });
      }
    }

    const [rows] = await pool.execute(
      "SELECT * FROM assignments WHERE id = ?",
      [req.params.id]
    );

    res.json({
      message: "Assignment updated successfully",
      assignment: rows[0],
    });
  } catch (error) {
    console.error("Update assignment error:", error.message);
    res.status(500).json({ message: "Failed to update assignment" });
  }
};

// DELETE /api/assignments/:id
exports.deleteAssignment = async (req, res) => {
  try {
    const [result] = await pool.execute(
      "DELETE FROM assignments WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Delete assignment error:", error.message);
    res.status(500).json({ message: "Failed to delete assignment" });
  }
};

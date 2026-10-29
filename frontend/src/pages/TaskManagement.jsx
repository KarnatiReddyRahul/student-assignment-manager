import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import "./TaskManagement.css";

const API_URL = "http://localhost:5000/api/assignments";

function formatDueDate(value) {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateForInput(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function TaskManagement() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successFeedback, setSuccessFeedback] = useState("");

  // Filters and Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Edit Modal State
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    subject: "",
    description: "",
    due_date: "",
    priority: "Medium",
    status: "Pending",
  });
  const [editErrors, setEditErrors] = useState({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editServerError, setEditServerError] = useState("");

  // Delete Modal State
  const [deletingAssignment, setDeletingAssignment] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteServerError, setDeleteServerError] = useState("");

  const feedbackTimerRef = useRef(null);

  const showFeedback = useCallback((message) => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    setSuccessFeedback(message);
    feedbackTimerRef.current = setTimeout(() => {
      setSuccessFeedback("");
    }, 4000);
  }, []);

  const reloadAssignments = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Failed to load assignments (Status ${response.status}).`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setAssignments(data);
        setError("");
      }
    } catch (err) {
      setError(err.message || "Failed to refresh assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    async function fetchInitialAssignments() {
      try {
        const response = await fetch(API_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to load assignments (Status ${response.status}).`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Invalid response format from server.");
        }

        setAssignments(data);
        setError("");
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            `${err.message} Please check that your backend is running on port 5000.`
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchInitialAssignments();

    return () => {
      controller.abort();
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  // Toggle status: Complete or Reopen
  const handleToggleStatus = async (item) => {
    if (actionLoadingId === item.id) return;

    setActionLoadingId(item.id);
    setError("");

    const newStatus = item.status === "Completed" ? "Pending" : "Completed";

    try {
      const response = await fetch(`${API_URL}/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update assignment status.");
      }

      // Update state locally and trigger toast
      setAssignments((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, status: newStatus } : a))
      );

      showFeedback(
        newStatus === "Completed"
          ? `Assignment "${item.title}" marked as Completed!`
          : `Assignment "${item.title}" reopened to Pending.`
      );
    } catch (err) {
      setError(err.message || "Failed to update status. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingAssignment(item);
    setEditFormData({
      title: item.title || "",
      subject: item.subject || "",
      description: item.description || "",
      due_date: formatDateForInput(item.due_date),
      priority: item.priority || "Medium",
      status: item.status || "Pending",
    });
    setEditErrors({});
    setEditServerError("");
  };

  const handleCloseEdit = () => {
    if (isSavingEdit) return;
    setEditingAssignment(null);
    setEditErrors({});
    setEditServerError("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));

    if (editErrors[name]) {
      setEditErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateEditForm = () => {
    const errors = {};
    const trimmedTitle = editFormData.title.trim();
    if (!trimmedTitle) {
      errors.title = "Assignment title is required.";
    } else if (trimmedTitle.length > 150) {
      errors.title = "Title must not exceed 150 characters.";
    }

    const trimmedSubject = editFormData.subject.trim();
    if (!trimmedSubject) {
      errors.subject = "Subject is required.";
    } else if (trimmedSubject.length > 100) {
      errors.subject = "Subject must not exceed 100 characters.";
    }

    if (!editFormData.due_date) {
      errors.due_date = "Due date is required.";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(editFormData.due_date)) {
      errors.due_date = "Due date must be in YYYY-MM-DD format.";
    }

    if (!["High", "Medium", "Low"].includes(editFormData.priority)) {
      errors.priority = "Priority must be High, Medium, or Low.";
    }

    if (!["Pending", "Completed"].includes(editFormData.status)) {
      errors.status = "Status must be Pending or Completed.";
    }

    return errors;
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (isSavingEdit || !editingAssignment) return;

    setEditServerError("");
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setIsSavingEdit(true);

    const payload = {
      title: editFormData.title.trim(),
      subject: editFormData.subject.trim(),
      description: editFormData.description ? editFormData.description.trim() : "",
      due_date: editFormData.due_date,
      priority: editFormData.priority,
      status: editFormData.status,
    };

    try {
      const response = await fetch(`${API_URL}/${editingAssignment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update assignment.");
      }

      showFeedback(`Assignment "${payload.title}" updated successfully!`);
      setEditingAssignment(null);
      await reloadAssignments();
    } catch (err) {
      setEditServerError(err.message || "Failed to save changes. Please try again.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (item) => {
    setDeletingAssignment(item);
    setDeleteServerError("");
  };

  const handleCloseDelete = () => {
    if (isDeleting) return;
    setDeletingAssignment(null);
    setDeleteServerError("");
  };

  const handleConfirmDelete = async () => {
    if (isDeleting || !deletingAssignment) return;

    setIsDeleting(true);
    setDeleteServerError("");

    try {
      const response = await fetch(`${API_URL}/${deletingAssignment.id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete assignment.");
      }

      const deletedTitle = deletingAssignment.title;
      setAssignments((prev) => prev.filter((a) => a.id !== deletingAssignment.id));
      setDeletingAssignment(null);
      showFeedback(`Assignment "${deletedTitle}" deleted successfully.`);
    } catch (err) {
      setDeleteServerError(err.message || "Failed to delete assignment.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setPriorityFilter("All");
  };

  const isFiltered =
    searchQuery.trim() !== "" || statusFilter !== "All" || priorityFilter !== "All";

  // Filter assignments
  const filteredAssignments = assignments.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item.title?.toLowerCase().includes(query) ||
      item.subject?.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || item.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalCount = assignments.length;
  const pendingCount = assignments.filter((a) => a.status === "Pending").length;
  const completedCount = assignments.filter((a) => a.status === "Completed").length;

  return (
    <div className="task-management-page">
      {/* Page Header */}
      <div className="tasks-header">
        <div>
          <p className="eyebrow">TASK MANAGEMENT</p>
          <h1>Assignments &amp; Tasks</h1>
          <p className="tasks-subtitle">
            Organize, search, edit, and keep track of all your academic assignments.
          </p>
        </div>

        <Link to="/add-assignment" className="primary-button add-task-button">
          + Add Assignment
        </Link>
      </div>

      {/* Global Toast / Feedback */}
      {successFeedback && (
        <div className="alert alert-success" role="status">
          <span className="alert-icon" aria-hidden="true">✓</span>
          <div className="alert-content">
            <strong>Success:</strong> {successFeedback}
          </div>
          <button
            type="button"
            className="alert-dismiss"
            onClick={() => setSuccessFeedback("")}
            aria-label="Dismiss feedback"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert">
          <span className="alert-icon" aria-hidden="true">✕</span>
          <div className="alert-content">
            <strong>Error:</strong> {error}
          </div>
          <button
            type="button"
            className="retry-button"
            onClick={() => {
              setLoading(true);
              reloadAssignments();
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="tasks-stats-bar">
        <div className="stat-pill">
          <span className="stat-pill-label">Total</span>
          <span className="stat-pill-badge blue">{totalCount}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-pill-label">Pending</span>
          <span className="stat-pill-badge orange">{pendingCount}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-pill-label">Completed</span>
          <span className="stat-pill-badge green">{completedCount}</span>
        </div>
      </div>

      {/* Filters Card */}
      <div className="filter-card">
        <div className="filter-controls">
          {/* Search Box */}
          <div className="search-box">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              id="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or subject..."
              aria-label="Search assignments"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="filter-group">
            <label htmlFor="priority-filter">Priority:</label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              type="button"
              className="secondary-button reset-filter-btn"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="filter-summary">
          <span>
            Showing <strong>{filteredAssignments.length}</strong> of{" "}
            <strong>{totalCount}</strong> assignments
            {isFiltered && " (filtered)"}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="tasks-state-box">
          <div className="spinner large" aria-hidden="true" />
          <h3>Loading assignments...</h3>
          <p>Please wait while we retrieve your tasks.</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="tasks-state-box empty">
          <div className="empty-icon">📝</div>
          <h3>No assignments found</h3>
          <p>You haven't added any assignments yet. Start tracking your coursework now!</p>
          <Link to="/add-assignment" className="primary-button" style={{ marginTop: "16px" }}>
            + Add Your First Assignment
          </Link>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="tasks-state-box empty">
          <div className="empty-icon">🔍</div>
          <h3>No matching assignments</h3>
          <p>No assignments match your search query or selected filter criteria.</p>
          <button
            type="button"
            className="secondary-button"
            onClick={handleResetFilters}
            style={{ marginTop: "16px" }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="tasks-table-wrapper">
          <table className="tasks-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: "48px" }}>Status</th>
                <th scope="col">Assignment</th>
                <th scope="col">Subject</th>
                <th scope="col">Due Date</th>
                <th scope="col">Priority</th>
                <th scope="col" style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((item) => {
                const isCompleted = item.status === "Completed";
                const isItemActionLoading = actionLoadingId === item.id;

                return (
                  <tr
                    key={item.id}
                    className={`task-row ${isCompleted ? "task-completed" : ""}`}
                  >
                    {/* Status Toggle Icon / Checkbox */}
                    <td className="status-col">
                      <button
                        type="button"
                        className={`status-toggle-btn ${isCompleted ? "completed" : "pending"}`}
                        onClick={() => handleToggleStatus(item)}
                        disabled={isItemActionLoading}
                        title={
                          isCompleted
                            ? "Completed - Click to reopen"
                            : "Pending - Click to complete"
                        }
                        aria-label={
                          isCompleted
                            ? `Mark "${item.title}" as pending`
                            : `Mark "${item.title}" as completed`
                        }
                      >
                        {isItemActionLoading ? (
                          <span className="spinner-small" />
                        ) : isCompleted ? (
                          "✓"
                        ) : (
                          "○"
                        )}
                      </button>
                    </td>

                    {/* Title & Description */}
                    <td className="assignment-col">
                      <div className="task-title-wrap">
                        <span className={`task-title ${isCompleted ? "completed-text" : ""}`}>
                          {item.title}
                        </span>
                        <span
                          className={`status-badge-inline ${isCompleted ? "completed" : "pending"}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      {item.description ? (
                        <p className="task-desc">{item.description}</p>
                      ) : (
                        <span className="task-desc-empty">No description provided</span>
                      )}
                    </td>

                    {/* Subject */}
                    <td className="subject-col">
                      <span className="subject-tag">{item.subject}</span>
                    </td>

                    {/* Due Date */}
                    <td className="due-col">
                      <div className="date-wrapper">
                        <span className="calendar-icon" aria-hidden="true">📅</span>
                        <span>{formatDueDate(item.due_date)}</span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="priority-col">
                      <span
                        className={`priority-badge ${(item.priority || "Medium").toLowerCase()}`}
                      >
                        {item.priority || "Medium"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="actions-col">
                      <div className="action-buttons">
                        <button
                          type="button"
                          className={`btn-action btn-toggle-status ${isCompleted ? "reopen" : "complete"}`}
                          onClick={() => handleToggleStatus(item)}
                          disabled={isItemActionLoading}
                        >
                          {isItemActionLoading ? (
                            "Saving..."
                          ) : isCompleted ? (
                            "↺ Reopen"
                          ) : (
                            "✓ Complete"
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn-action btn-edit"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit assignment"
                        >
                          ✎ Edit
                        </button>
                        <button
                          type="button"
                          className="btn-action btn-delete"
                          onClick={() => handleOpenDelete(item)}
                          title="Delete assignment"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal Dialog */}
      {editingAssignment && (
        <div
          className="modal-backdrop"
          onClick={handleCloseEdit}
          role="presentation"
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
          >
            <div className="modal-header">
              <h2 id="edit-modal-title">Edit Assignment</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseEdit}
                disabled={isSavingEdit}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {editServerError && (
              <div className="alert alert-error modal-alert" role="alert">
                <span className="alert-icon">✕</span>
                <div className="alert-content">
                  <strong>Error:</strong> {editServerError}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveEdit} noValidate>
              <div className="modal-body">
                <div className="modal-form-grid">
                  {/* Title */}
                  <div className="form-group full-width">
                    <label htmlFor="edit-title">
                      <span>Assignment Title <span className="required-star">*</span></span>
                      <span className="char-count">{editFormData.title.length}/150</span>
                    </label>
                    <input
                      type="text"
                      id="edit-title"
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditChange}
                      maxLength={150}
                      disabled={isSavingEdit}
                      className={editErrors.title ? "has-error" : ""}
                      aria-required="true"
                      aria-invalid={!!editErrors.title}
                      aria-describedby={editErrors.title ? "edit-title-err" : undefined}
                    />
                    {editErrors.title && (
                      <span className="field-error" id="edit-title-err">
                        {editErrors.title}
                      </span>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="form-group">
                    <label htmlFor="edit-subject">
                      <span>Subject <span className="required-star">*</span></span>
                      <span className="char-count">{editFormData.subject.length}/100</span>
                    </label>
                    <input
                      type="text"
                      id="edit-subject"
                      name="subject"
                      value={editFormData.subject}
                      onChange={handleEditChange}
                      maxLength={100}
                      disabled={isSavingEdit}
                      className={editErrors.subject ? "has-error" : ""}
                      aria-required="true"
                      aria-invalid={!!editErrors.subject}
                      aria-describedby={editErrors.subject ? "edit-subject-err" : undefined}
                    />
                    {editErrors.subject && (
                      <span className="field-error" id="edit-subject-err">
                        {editErrors.subject}
                      </span>
                    )}
                  </div>

                  {/* Due Date */}
                  <div className="form-group">
                    <label htmlFor="edit-due-date">
                      <span>Due Date <span className="required-star">*</span></span>
                    </label>
                    <input
                      type="date"
                      id="edit-due-date"
                      name="due_date"
                      value={editFormData.due_date}
                      onChange={handleEditChange}
                      disabled={isSavingEdit}
                      className={editErrors.due_date ? "has-error" : ""}
                      aria-required="true"
                      aria-invalid={!!editErrors.due_date}
                      aria-describedby={editErrors.due_date ? "edit-due-err" : undefined}
                    />
                    {editErrors.due_date && (
                      <span className="field-error" id="edit-due-err">
                        {editErrors.due_date}
                      </span>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="form-group">
                    <label htmlFor="edit-priority">Priority</label>
                    <select
                      id="edit-priority"
                      name="priority"
                      value={editFormData.priority}
                      onChange={handleEditChange}
                      disabled={isSavingEdit}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="form-group">
                    <label htmlFor="edit-status">Status</label>
                    <select
                      id="edit-status"
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditChange}
                      disabled={isSavingEdit}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="form-group full-width">
                    <label htmlFor="edit-description">Description (Optional)</label>
                    <textarea
                      id="edit-description"
                      name="description"
                      rows={3}
                      value={editFormData.description}
                      onChange={handleEditChange}
                      placeholder="Add details, notes, or requirements..."
                      disabled={isSavingEdit}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCloseEdit}
                  disabled={isSavingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSavingEdit}
                >
                  {isSavingEdit ? (
                    <>
                      <span className="spinner-small" aria-hidden="true" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAssignment && (
        <div
          className="modal-backdrop"
          onClick={handleCloseDelete}
          role="presentation"
        >
          <div
            className="modal-container delete-modal"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-desc"
          >
            <div className="modal-header">
              <h2 id="delete-modal-title">Delete Assignment</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseDelete}
                disabled={isDeleting}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {deleteServerError && (
              <div className="alert alert-error modal-alert" role="alert">
                <span className="alert-icon">✕</span>
                <div className="alert-content">
                  <strong>Error:</strong> {deleteServerError}
                </div>
              </div>
            )}

            <div className="modal-body">
              <p id="delete-modal-desc">
                Are you sure you want to permanently delete the assignment{" "}
                <strong>&ldquo;{deletingAssignment.title}&rdquo;</strong>{" "}
                ({deletingAssignment.subject})?
              </p>
              <p className="delete-warning">
                This action cannot be undone. The assignment record will be removed from your database.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={handleCloseDelete}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner-small" aria-hidden="true" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  "Delete Assignment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskManagement;

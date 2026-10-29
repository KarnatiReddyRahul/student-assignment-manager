import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AddAssignment.css";

const API_URL = "http://localhost:5000/api/assignments";

function AddAssignment() {
  const navigate = useNavigate();
  const redirectTimerRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    due_date: "",
    priority: "Medium",
    status: "Pending",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (serverError) {
      setServerError("");
    }
  };

  const validate = () => {
    const errors = {};

    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle) {
      errors.title = "Assignment title is required.";
    } else if (trimmedTitle.length > 150) {
      errors.title = "Assignment title must not exceed 150 characters.";
    }

    const trimmedSubject = formData.subject.trim();
    if (!trimmedSubject) {
      errors.subject = "Subject is required.";
    } else if (trimmedSubject.length > 100) {
      errors.subject = "Subject must not exceed 100 characters.";
    }

    if (!formData.due_date) {
      errors.due_date = "Due date is required.";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.due_date)) {
      errors.due_date = "A valid due date (YYYY-MM-DD) is required.";
    }

    if (!["High", "Medium", "Low"].includes(formData.priority)) {
      errors.priority = "Priority must be High, Medium, or Low.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setServerError("");
    setSuccessMessage("");

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);

    const payload = {
      title: formData.title.trim(),
      subject: formData.subject.trim(),
      description: formData.description.trim(),
      due_date: formData.due_date,
      priority: formData.priority,
      status: formData.status,
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data?.message ||
          `Failed to create assignment (Status ${response.status}: ${response.statusText}).`;
        throw new Error(message);
      }

      setSuccessMessage(
        data?.message || "Assignment created successfully! Redirecting to dashboard..."
      );

      redirectTimerRef.current = setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setServerError(
          "Network error: Unable to connect to backend server. Please verify the server is running on http://localhost:5000."
        );
      } else {
        setServerError(
          err.message || "Failed to create assignment. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-assignment-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">NEW ASSIGNMENT</p>
          <h1>Add Assignment</h1>
          <p className="page-subtitle">
            Create an assignment to keep track of your academic deadlines.
          </p>
        </div>

        <Link to="/" className="secondary-button back-link">
          ← Back to Dashboard
        </Link>
      </div>

      {serverError && (
        <div className="alert alert-error" role="alert">
          <span className="alert-icon" aria-hidden="true">✕</span>
          <div className="alert-content">
            <strong>Error: </strong>
            <span>{serverError}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success" role="status">
          <span className="alert-icon" aria-hidden="true">✓</span>
          <div className="alert-content">
            <strong>Success: </strong>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      <div className="form-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="title">
                <span>Assignment Title <span className="required-star">*</span></span>
                <span className="char-count">{formData.title.length}/150</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Database Design Project Phase 1"
                maxLength={150}
                disabled={isSubmitting}
                className={validationErrors.title ? "has-error" : ""}
                aria-required="true"
                aria-invalid={!!validationErrors.title}
                aria-describedby={validationErrors.title ? "title-error" : undefined}
              />
              {validationErrors.title && (
                <span className="field-error" id="title-error">
                  {validationErrors.title}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="subject">
                <span>Subject <span className="required-star">*</span></span>
                <span className="char-count">{formData.subject.length}/100</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g., Computer Science 301"
                maxLength={100}
                disabled={isSubmitting}
                className={validationErrors.subject ? "has-error" : ""}
                aria-required="true"
                aria-invalid={!!validationErrors.subject}
                aria-describedby={validationErrors.subject ? "subject-error" : undefined}
              />
              {validationErrors.subject && (
                <span className="field-error" id="subject-error">
                  {validationErrors.subject}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="due_date">
                <span>Due Date <span className="required-star">*</span></span>
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                disabled={isSubmitting}
                className={validationErrors.due_date ? "has-error" : ""}
                aria-required="true"
                aria-invalid={!!validationErrors.due_date}
                aria-describedby={validationErrors.due_date ? "due_date-error" : undefined}
              />
              {validationErrors.due_date && (
                <span className="field-error" id="due_date-error">
                  {validationErrors.due_date}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="priority">
                <span>Priority</span>
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={isSubmitting}
                className={validationErrors.priority ? "has-error" : ""}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              {validationErrors.priority && (
                <span className="field-error" id="priority-error">
                  {validationErrors.priority}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="status">
                <span>Status</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="Pending">Pending (Default)</option>
                <option value="Completed">Completed</option>
              </select>
              <span className="field-hint">
                New assignments default to Pending.
              </span>
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">
                <span>Description (Optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Add instructions, resources, or submission requirements..."
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/")}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  <span>Adding Assignment...</span>
                </>
              ) : (
                "+ Add Assignment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAssignment;

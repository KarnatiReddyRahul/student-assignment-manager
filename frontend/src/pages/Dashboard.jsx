
import { useEffect, useState } from "react";
import "./Dashboard.css";

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

function getLocalDateKey(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function Dashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAssignments() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load assignments.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from the server.");
        }

        setAssignments(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            `${err.message} Check that your backend is running on port 5000.`
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchAssignments();

    return () => controller.abort();
  }, []);

  const total = assignments.length;

  const completed = assignments.filter(
    (item) => item.status === "Completed"
  ).length;

  const pending = assignments.filter(
    (item) => item.status === "Pending"
  ).length;

  const today = getLocalDateKey(new Date());

  const upcoming = assignments
    .filter((item) => {
      return (
        item.status === "Pending" &&
        getLocalDateKey(item.due_date) >= today
      );
    })
    .sort(
      (a, b) => new Date(a.due_date) - new Date(b.due_date)
    );

  const stats = [
    {
      label: "Total Assignments",
      value: total,
      icon: "▤",
      className: "blue",
    },
    {
      label: "Pending",
      value: pending,
      icon: "◷",
      className: "orange",
    },
    {
      label: "Completed",
      value: completed,
      icon: "✓",
      className: "green",
    },
    {
      label: "Upcoming",
      value: upcoming.length,
      icon: "▦",
      className: "purple",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Student Dashboard</h1>
          <p className="dashboard-subtitle">
            Track your assignments and stay ahead of your deadlines.
          </p>
        </div>

        <a className="primary-button" href="/add-assignment">
          + Add Assignment
        </a>
      </div>

      {error && (
        <div className="dashboard-error" role="alert">
          {error}
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      <div className="stats-grid">
        {stats.map((stat) => (
          <article
            className={`dashboard-stat ${stat.className}`}
            key={stat.label}
          >
            <div className="stat-top">
              <span>{stat.label}</span>
              <span className="stat-icon">{stat.icon}</span>
            </div>

            <div className="stat-number">
              {loading ? "—" : stat.value}
            </div>

            <p>
              {loading ? "Loading data..." : "From your saved assignments"}
            </p>
          </article>
        ))}
      </div>

      <section className="upcoming-section">
        <div className="section-heading">
          <div>
            <h2>Upcoming Assignments</h2>
            <p>Your pending work, ordered by due date.</p>
          </div>
          <a href="/tasks" className="text-link">
            View all tasks →
          </a>
        </div>

        {loading ? (
          <div className="dashboard-message">
            Loading your assignments...
          </div>
        ) : error ? (
          <div className="dashboard-message">
            Assignments could not be loaded.
          </div>
        ) : upcoming.length === 0 ? (
          <div className="dashboard-message">
            <div className="empty-icon">✓</div>
            <h3>You're all caught up!</h3>
            <p>
              There are no pending assignments with upcoming deadlines.
            </p>
          </div>
        ) : (
          <div className="assignment-list">
            {upcoming.slice(0, 5).map((item) => (
              <article className="assignment-row" key={item.id}>
                <div className="assignment-symbol">▤</div>

                <div className="assignment-details">
                  <h3>{item.title}</h3>
                  <p>{item.subject}</p>
                </div>

                <div className="assignment-due">
                  <span>Due date</span>
                  <strong>{formatDueDate(item.due_date)}</strong>
                </div>

                <span
                  className={`priority-badge ${(item.priority || "Medium").toLowerCase()}`}
                >
                  {item.priority || "Medium"}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;

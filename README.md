# Student Assignment Manager

A full-stack web application for managing student assignments, tracking deadlines, monitoring completion status, and organizing academic tasks in one place.

## Overview

The Student Assignment Manager helps students organize their academic workload through a dashboard, an assignment creation form, and a task management interface. The application uses a React frontend, a Node.js and Express backend, and a MySQL database to store assignment information.

## Features

### 1. Dashboard
- View total assignments.
- Track pending and completed assignments.
- View upcoming assignments and deadlines.
- Monitor assignment statistics using data from the backend.

### 2. Add Assignment
- Create new assignments using a form.
- Enter the assignment title, subject, description, due date, and priority.
- Save assignment details to the MySQL database through the backend API.
- View newly created assignments on the dashboard.

### 3. Task Management
- View and manage assignments.
- Search assignments by title or subject.
- Filter assignments by status and priority.
- Edit existing assignment details.
- Mark assignments as completed or reopen them.
- Delete assignments when they are no longer needed.

### 4. Backend and Database
- RESTful API built with Node.js and Express.
- MySQL database for persistent storage.
- CRUD operations for assignments.
- Frontend integration with the backend API.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | MySQL |
| API | REST API |
| Version Control | Git and GitHub |

## Project Structure

```text
student-assignment-manager/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── assignmentController.js
│   ├── routes/
│   │   └── assignmentRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Navbar.css
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AddAssignment.jsx
│   │   │   └── TaskManagement.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
│
├── .gitignore
└── README.md
```

*Note: The structure above shows the main expected files. Keep the names consistent with your actual repository.*

## Prerequisites

Install the following before running the project:

- Node.js and npm
- MySQL Server
- Git
- A code editor such as Visual Studio Code

## Installation and Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/KarnatiReddyRahul/student-assignment-manager.git
cd student-assignment-manager
```

### Step 2: Set up the MySQL database

Open the MySQL command-line client and run:

```sql
CREATE DATABASE student_task_manager;
```

The application uses an `assignments` table with fields for assignment title, subject, description, due date, priority, status, and creation timestamp.

If your backend does not create the table automatically, create it using:

```sql
USE student_task_manager;

CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    priority ENUM('High', 'Medium', 'Low')
        DEFAULT 'Medium',
    status ENUM('Pending', 'Completed')
        DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 3: Configure the backend

Open a terminal in the project root:

```bash
cd backend
npm install
```

Create a `.env` file using the provided example:

```bash
cp .env.example .env
```

Update the environment variables in `backend/.env` with your local MySQL credentials and database settings.

Typical settings include the database host, port, username, password, database name, and backend port. Use the exact variable names expected by your backend code.

**Security:** Never commit your actual `.env` file or database passwords to GitHub.

### Step 4: Start the backend

From the `backend` directory, run the start command defined in `backend/package.json`. For example, if a start script is configured:

```bash
npm start
```

The backend is expected to run at:

```text
http://localhost:5000
```

### Step 5: Configure and start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal. It is commonly `http://localhost:5173`, but the port may differ.

Keep the backend running while using the frontend.

## API Endpoints

Base URL: `http://localhost:5000`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/assignments` | Retrieve all assignments |
| GET | `/api/assignments/:id` | Retrieve an assignment by ID |
| POST | `/api/assignments` | Create an assignment |
| PUT | `/api/assignments/:id` | Update an assignment |
| DELETE | `/api/assignments/:id` | Delete an assignment |

### Example: Create an Assignment

**Request**

```http
POST /api/assignments
Content-Type: application/json
```

**Example JSON body**

```json
{
  "title": "Machine Learning Assignment",
  "subject": "Data Science",
  "description": "Complete the classification exercise",
  "due_date": "2026-11-15",
  "priority": "High",
  "status": "Pending"
}
```

The request body must match the fields accepted by the backend API.

## Assignment Data Model

| Field | Description |
|---|---|
| `id` | Unique assignment identifier |
| `title` | Assignment title |
| `subject` | Academic subject |
| `description` | Assignment details |
| `due_date` | Assignment deadline |
| `priority` | High, Medium, or Low |
| `status` | Pending or Completed |
| `created_at` | Record creation timestamp |

## Testing

Verify the following functionality after starting the application:

- Dashboard loads assignment data from the API.
- Assignment creation saves records to MySQL.
- New assignments appear on the dashboard.
- Search and filters return the expected assignments.
- Editing updates the selected assignment.
- Completing or reopening an assignment updates its status.
- Deleting an assignment removes it from the list.
- Invalid input and API errors are handled appropriately.

## Screenshots

Add screenshots of your working application here.

Recommended screenshots:

1. Dashboard
2. Add Assignment form
3. Task Management page
4. Search and filter functionality

For example, create a `screenshots/` folder in the project root and add images such as `dashboard.png`, `add-assignment.png`, and `task-management.png`.

Then reference them in this section:

```markdown
![Dashboard](screenshots/dashboard.png)

![Add Assignment](screenshots/add-assignment.png)

![Task Management](screenshots/task-management.png)
```

## Future Enhancements

- Student authentication and role-based access.
- Assignment reminders and notifications.
- Calendar view for deadlines.
- Assignment sorting and pagination.
- Deployment to a cloud hosting platform.
- Automated testing and continuous integration.

## Contributors

Developed as a collaborative full-stack web development project.

## License

This project is intended for academic and educational purposes. Add a `LICENSE` file if you intend to distribute the project under a specific open-source license.

---

**Repository:** [KarnatiReddyRahul/student-assignment-manager](https://github.com/KarnatiReddyRahul/student-assignment-manager)

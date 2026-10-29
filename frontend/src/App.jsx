
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import AddAssignment from "./pages/AddAssignment";
import TaskManagement from "./pages/TaskManagement";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main className="app-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/add-assignment" element={<AddAssignment />} />
          <Route path="/tasks" element={<TaskManagement />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;

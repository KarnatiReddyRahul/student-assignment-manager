
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main className="app-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />

          {/* Teammate pages will be connected after their files are ready */}
          <Route
            path="/add-assignment"
            element={<p>Add Assignment page is being developed.</p>}
          />
          <Route
            path="/tasks"
            element={<p>Task Management page is being developed.</p>}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;

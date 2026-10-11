
import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="nav-brand">
        <span className="brand-icon">T</span>
        <span>TaskMate</span>
      </NavLink>

      <nav className="nav-links">
        <NavLink to="/" end>
          Dashboard
        </NavLink>

        <NavLink to="/add-assignment">
          Add Assignment
        </NavLink>

        <NavLink to="/tasks">
          Task Management
        </NavLink>
      </nav>
    </header>
  );
}

export default Navbar;

import { NavLink } from "react-router-dom";
import ThemeSwitch from "./ThemeSwitch";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/lab", label: "Algorithm Lab" },
  { to: "/comparison", label: "Comparison" },
  { to: "/interactive", label: "Cipher Playground" },
  { to: "/challenge", label: "Cipher Challenge" },
  { to: "/vault", label: "My Vault" }
];

function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <h1>CryptoVault</h1>
      <p className="tagline">Python Crypto Engine</p>
      <ThemeSwitch />
      <nav>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="auth-block">
        {user ? (
          <>
            <p className="user-pill">Signed in as {user.name}</p>
            <button className="ghost-button" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="nav-link">Login</NavLink>
            <NavLink to="/register" className="nav-link">Register</NavLink>
          </>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;

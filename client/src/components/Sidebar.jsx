import { NavLink } from "react-router-dom";
import ThemeSwitch from "./ThemeSwitch";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/lab", label: "Algorithm Lab" },
  { to: "/comparison", label: "Comparison" },
  { to: "/interactive", label: "Cipher Playground" },
  { to: "/challenge", label: "Cipher Challenge" },
];


function Sidebar() {
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
    </aside>
  );
}

export default Sidebar;

import { useEffect, useState } from "react";

function ThemeSwitch() {
  const [theme, setTheme] = useState(localStorage.getItem("cv_theme") || "sand");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cv_theme", theme);
  }, [theme]);

  return (
    <div className="theme-switch">
      <button className={theme === "sand" ? "active" : ""} onClick={() => setTheme("sand")}>Sand</button>
      <button className={theme === "graphite" ? "active" : ""} onClick={() => setTheme("graphite")}>Graphite</button>
    </div>
  );
}

export default ThemeSwitch;

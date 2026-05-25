"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

const navItems = [
  { href: "/assessment", icon: "◈", label: "Assessment" },
  { href: "/dashboard",  icon: "⬡", label: "Dashboard"  },
  { href: "/projects",   icon: "◉", label: "Mini Projects" },
  { href: "/roadmap",    icon: "◎", label: "Roadmap"    },
  { href: "/settings",   icon: "◌", label: "Settings"   },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";

  return (
    <aside className="sidebar" style={{ transition: "background 0.3s" }}>
      {/* Logo */}
      <div className="sidebar-logo">
        <h1>SkillBridge</h1>
        <p>Personalized Learning</p>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="nav-section-label">Main</span>
        {navItems.slice(0, 2).map((item) => (
          <Link key={item.href} href={item.href}
            className={`nav-item ${pathname.startsWith(item.href) ? "active" : ""}`}>
            <span className="nav-icon" style={{ fontSize: 15 }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <span className="nav-section-label">Learning</span>
        {navItems.slice(2, 4).map((item) => (
          <Link key={item.href} href={item.href}
            className={`nav-item ${pathname.startsWith(item.href) ? "active" : ""}`}>
            <span className="nav-icon" style={{ fontSize: 15 }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <span className="nav-section-label">System</span>
        {navItems.slice(4).map((item) => (
          <Link key={item.href} href={item.href}
            className={`nav-item ${pathname.startsWith(item.href) ? "active" : ""}`}>
            <span className="nav-icon" style={{ fontSize: 15 }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="sidebar-user">
        {/* Theme toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>
            {isLight ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </span>
          <button
            onClick={toggle}
            className="theme-toggle"
            title="Toggle light/dark mode"
            aria-label="Toggle theme"
          >
            <div className={`theme-toggle-thumb ${isLight ? "light" : ""}`}>
              {isLight ? "☀️" : "🌙"}
            </div>
          </button>
        </div>

        {/* User card */}
        <div className="user-card">
          <div className="user-avatar">NA</div>
          <div className="user-info">
            <p>Nguyễn Văn A</p>
            <span>Free Plan</span>
          </div>
        </div>

        <button className="upgrade-btn">✦ Upgrade to Pro</button>
      </div>
    </aside>
  );
}

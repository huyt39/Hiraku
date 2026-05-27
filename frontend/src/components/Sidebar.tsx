"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/assessment", label: "Assessment" },
  { href: "/dashboard",  label: "Dashboard"  },
  { href: "/projects",   label: "Mini Projects" },
  { href: "/roadmap",    label: "Roadmap"    },
  { href: "/market",     label: "Thị Trường IT" },
  { href: "/settings",   label: "Settings"   },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`} style={{ transition: "background 0.3s, transform 0.3s" }}>
      {/* Logo */}
      <div className="sidebar-logo" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1>SkillBridge</h1>
          <p>Personalized Learning</p>
        </div>
        {/* Close btn (mobile only) */}
        {mobileOpen && (
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-secondary)", fontSize: 20, padding: 4,
            }}
            aria-label="Close sidebar"
          >
            Close
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="nav-section-label">Main</span>
        {navItems.slice(0, 2).map((item) => (
          <Link key={item.href} href={item.href} onClick={onClose}
            className={`nav-item ${pathname.startsWith(item.href) ? "active" : ""}`}>
            {item.label}
          </Link>
        ))}

        <span className="nav-section-label">Learning</span>
        {navItems.slice(2, 5).map((item) => (
          <Link key={item.href} href={item.href} onClick={onClose}
            className={`nav-item ${pathname.startsWith(item.href) ? "active" : ""}`}>
            {item.label}
          </Link>
        ))}

        <span className="nav-section-label">System</span>
        {navItems.slice(5).map((item) => (
          <Link key={item.href} href={item.href} onClick={onClose}
            className={`nav-item ${pathname.startsWith(item.href) ? "active" : ""}`}>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="sidebar-user">
        <div className="user-card">
          <div className="user-avatar">NA</div>
          <div className="user-info">
            <p>Nguyễn Văn A</p>
            <span>Free Plan</span>
          </div>
        </div>

        <button className="upgrade-btn">Upgrade to Pro</button>
      </div>
    </aside>
  );
}

"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Mobile overlay backdrop */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <div className="mobile-header" style={{
          display: "none",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--topbar-bg)",
          backdropFilter: "blur(10px)",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              cursor: "pointer", color: "var(--text-primary)",
              fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
            }}
            aria-label="Open menu"
          >
            Menu
          </button>
          <span style={{
            marginLeft: 12, fontSize: 16, fontWeight: 800, color: "var(--text-primary)",
          }}>
            SkillBridge
          </span>
        </div>
        {children}
      </main>
    </div>
  );
}

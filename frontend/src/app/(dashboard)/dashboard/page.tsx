"use client";
import Link from "next/link";

const skillData = [
  { name: "Foundation", current: 80, market: 90, color: "#6C63FF" },
  { name: "Web Development", current: 55, market: 85, color: "#4A90E2" },
  { name: "AI / Machine Learning", current: 30, market: 75, color: "#FF6B6B" },
  { name: "Data Engineering", current: 40, market: 70, color: "#4ECDC4" },
  { name: "Soft Skills", current: 70, market: 80, color: "#FFB347" },
];

const activities = [
  { date: "Hôm nay", action: "Hoàn thành module React Basics", type: "milestone", icon: "🏆" },
  { date: "2 ngày trước", action: "Nộp bài Task Manager App", type: "project", icon: "📦" },
  { date: "1 tuần trước", action: "Cập nhật roadmap – Tuần 2", type: "roadmap", icon: "🗺️" },
  { date: "2 tuần trước", action: "Hoàn thành Assessment", type: "assessment", icon: "✅" },
];

export default function DashboardPage() {
  return (
    <div className="page-content fade-in">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Dashboard</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
          Xin chào, Nguyễn Văn A! Hãy tiếp tục hành trình học tập hôm nay.
        </p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "Tiến độ tổng thể", value: "45%", sub: "+5% tuần này", color: "var(--accent-purple)", icon: "◎" },
          { label: "Streak học tập", value: "12 ngày", sub: "Kỷ lục cá nhân!", color: "var(--accent-orange)", icon: "🔥" },
          { label: "Projects hoàn thành", value: "3", sub: "2 đang làm", color: "var(--accent-teal)", icon: "◉" },
          { label: "Items CV sẵn sàng", value: "3", sub: "Mục tiêu: 8", color: "var(--accent-green)", icon: "📄" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 14, right: 16, fontSize: 22, opacity: 0.3 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Skill Gap */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Skill Gap Analysis</h3>
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>vs Yêu cầu thị trường</span>
          </div>
          {skillData.map((s) => (
            <div key={s.name} className="skill-row">
              <span className="skill-name" style={{ fontSize: 12 }}>{s.name}</span>
              <div className="skill-bars" style={{ flex: 1 }}>
                <div className="skill-bar-row">
                  <span className="skill-bar-label">Bạn</span>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${s.current}%`, background: s.color }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)", width: 30, textAlign: "right" }}>{s.current}%</span>
                </div>
                <div className="skill-bar-row">
                  <span className="skill-bar-label">Market</span>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${s.market}%`, background: "rgba(255,255,255,0.15)" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", width: 30, textAlign: "right" }}>{s.market}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Next milestone */}
          <div className="card" style={{ background: "linear-gradient(135deg, rgba(108,99,255,0.15), rgba(78,205,196,0.08))", border: "1px solid rgba(108,99,255,0.3)" }}>
            <div style={{ fontSize: 11, color: "var(--accent-purple)", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>🎯 Milestone tiếp theo</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Next.js & API Routes</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>Dự kiến hoàn thành trong 1 tuần</div>
            <div className="progress-bar" style={{ marginBottom: 8 }}>
              <div className="progress-fill" style={{ width: "60%", background: "linear-gradient(90deg, var(--accent-purple), var(--accent-teal))" }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>60% hoàn thành</div>
          </div>

          {/* Recent activity */}
          <div className="card" style={{ flex: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Hoạt động gần đây</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {activities.map((a) => (
                <div key={a.action} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.action}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{a.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="card" style={{ background: "linear-gradient(135deg, rgba(108,99,255,0.12), rgba(255,107,107,0.08))", border: "1px solid rgba(108,99,255,0.25)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Roadmap cập nhật sau 5 ngày nữa</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Hệ thống sẽ phân tích tiến độ và điều chỉnh lộ trình mỗi 2–4 tuần</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <Link href="/roadmap" className="btn btn-primary">Xem Roadmap →</Link>
          <Link href="/projects" className="btn btn-outline">Mini Projects</Link>
        </div>
      </div>
    </div>
  );
}

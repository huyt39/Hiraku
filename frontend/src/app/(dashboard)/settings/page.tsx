"use client";

export default function SettingsPage() {
  return (
    <div className="page-content fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Settings</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>Quản lý tài khoản và tuỳ chỉnh hệ thống</p>
      </div>

      <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Profile */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Thông tin cá nhân</h3>
          {[{ label: "Họ và tên", value: "Nguyễn Văn A" }, { label: "Email", value: "nguyenvana@student.edu.vn" }, { label: "Trường", value: "Đại học Công nghệ" }, { label: "Năm học", value: "Năm 3" }].map(f => (
            <div key={f.label} style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ width: 120, fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{f.label}</span>
              <span style={{ fontSize: 13, color: "var(--text-primary)", flex: 1 }}>{f.value}</span>
              <button style={{ fontSize: 12, color: "var(--accent-purple)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Sửa</button>
            </div>
          ))}
        </div>

        {/* Target */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Mục tiêu học tập</h3>
          <div style={{ display: "flex", gap: 10 }}>
            {["Web Developer", "AI/ML Engineer", "Data Engineer"].map((d) => (
              <button key={d} style={{
                flex: 1, padding: "12px", borderRadius: 10, border: `1px solid ${d === "Web Developer" ? "var(--accent-purple)" : "var(--border)"}`,
                background: d === "Web Developer" ? "rgba(108,99,255,0.12)" : "rgba(255,255,255,0.04)",
                color: d === "Web Developer" ? "var(--accent-purple)" : "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}>{d}</button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Thông báo</h3>
          {[{ label: "Nhắc nhở học tập hàng ngày", on: true }, { label: "Cập nhật roadmap", on: true }, { label: "Thông báo từ mentor", on: true }, { label: "Email newsletter", on: false }].map(n => (
            <div key={n.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 13 }}>{n.label}</span>
              <div style={{ width: 40, height: 22, borderRadius: 11, background: n.on ? "var(--accent-purple)" : "var(--border)", position: "relative", cursor: "pointer" }}>
                <div style={{ position: "absolute", top: 3, left: n.on ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

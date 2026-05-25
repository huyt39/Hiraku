"use client";
import { useState } from "react";

const projects = [
  { id: 1, domain: "Web", title: "Task Manager App", desc: "Xây dựng ứng dụng quản lý công việc với React và Node.js. CRUD, auth, real-time updates.", difficulty: "Beginner", duration: "2 tuần", skills: ["React", "Node.js", "MongoDB"], output: "Full-stack app lên Vercel", enrolled: 42, color: "#6C63FF" },
  { id: 2, domain: "Web", title: "E-commerce Frontend", desc: "Clone giao diện e-commerce với Next.js, Stripe payment và responsive design.", difficulty: "Intermediate", duration: "3 tuần", skills: ["Next.js", "TypeScript", "Stripe"], output: "E-commerce site trên CV", enrolled: 28, color: "#6C63FF" },
  { id: 3, domain: "AI", title: "Sentiment Analysis Tool", desc: "Phân tích cảm xúc review sản phẩm bằng Python, scikit-learn và deploy API FastAPI.", difficulty: "Beginner", duration: "2 tuần", skills: ["Python", "scikit-learn", "FastAPI"], output: "AI API với docs", enrolled: 35, color: "#FF6B6B" },
  { id: 4, domain: "AI", title: "Image Classification App", desc: "Train CNN model nhận diện 10 loại vật thể, tích hợp web app để user upload ảnh.", difficulty: "Intermediate", duration: "3 tuần", skills: ["PyTorch", "CNN", "Flask"], output: "Deployed AI Web App", enrolled: 19, color: "#FF6B6B" },
  { id: 5, domain: "Data", title: "Sales Dashboard", desc: "Phân tích dataset bán hàng thực tế, xây dựng dashboard interactive với Plotly/Streamlit.", difficulty: "Beginner", duration: "1 tuần", skills: ["Pandas", "Plotly", "Streamlit"], output: "Interactive Dashboard", enrolled: 56, color: "#4ECDC4" },
  { id: 6, domain: "Data", title: "ETL Pipeline với Airflow", desc: "Thiết kế ETL pipeline tự động thu thập, xử lý, lưu trữ dữ liệu từ nhiều nguồn.", difficulty: "Advanced", duration: "4 tuần", skills: ["Airflow", "PostgreSQL", "Docker"], output: "Production Pipeline", enrolled: 12, color: "#4ECDC4" },
];

const domains = ["All", "Web", "AI", "Data"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

const diffBadge: Record<string, string> = { Beginner: "badge-beginner", Intermediate: "badge-intermediate", Advanced: "badge-advanced" };
const domainBadge: Record<string, string> = { Web: "badge-web", AI: "badge-ai", Data: "badge-data" };

export default function ProjectsPage() {
  const [domain, setDomain] = useState("All");
  const [diff, setDiff] = useState("All");

  const filtered = projects.filter(p =>
    (domain === "All" || p.domain === domain) &&
    (diff === "All" || p.difficulty === diff)
  );

  return (
    <div className="page-content fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Mini Projects</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
          Trải nghiệm thực tế qua các dự án ngắn theo từng lĩnh vực
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 8, fontWeight: 600 }}>DOMAIN</div>
          <div style={{ display: "flex", gap: 6 }}>
            {domains.map(d => (
              <button key={d} onClick={() => setDomain(d)}
                style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: domain === d ? "var(--accent-purple)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${domain === d ? "var(--accent-purple)" : "var(--border)"}`,
                  color: domain === d ? "white" : "var(--text-secondary)", transition: "all 0.2s"
                }}>{d}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 8, fontWeight: 600 }}>DIFFICULTY</div>
          <div style={{ display: "flex", gap: 6 }}>
            {difficulties.map(d => (
              <button key={d} onClick={() => setDiff(d)}
                style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: diff === d ? "rgba(255,179,71,0.2)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${diff === d ? "var(--accent-orange)" : "var(--border)"}`,
                  color: diff === d ? "var(--accent-orange)" : "var(--text-secondary)", transition: "all 0.2s"
                }}>{d}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Project grid */}
      <div className="grid-3">
        {filtered.map((p) => (
          <div key={p.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 12, cursor: "pointer", position: "relative", overflow: "hidden" }}>
            {/* Top accent */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: p.color }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
              <span className={`badge ${domainBadge[p.domain]}`}>{p.domain}</span>
              <span className={`badge ${diffBadge[p.difficulty]}`}>{p.difficulty}</span>
            </div>

            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{p.desc}</p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {p.skills.map(s => (
                <span key={s} style={{ fontSize: 11, padding: "3px 8px", background: "rgba(255,255,255,0.07)", borderRadius: 6, color: "var(--text-secondary)", border: "1px solid var(--border)" }}>{s}</span>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)" }}>
              <span>⏱ {p.duration}</span>
              <span style={{ color: "var(--border)" }}>•</span>
              <span>👥 {p.enrolled} sinh viên</span>
            </div>

            <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}>
              <span style={{ color: "var(--text-muted)" }}>Output: </span>
              <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>{p.output}</span>
            </div>

            <button style={{ padding: "10px", background: p.color, border: "none", borderRadius: 8, color: "white", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseOver={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseOut={e => (e.currentTarget.style.opacity = "1")}>
              Bắt đầu ngay →
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <p>Không tìm thấy project phù hợp</p>
        </div>
      )}
    </div>
  );
}

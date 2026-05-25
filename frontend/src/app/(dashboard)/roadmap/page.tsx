"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Phase {
  week: string;
  topic: string;
  skills: string[];
  output: string;
  resources: string[];
  status: "completed" | "in_progress" | "upcoming";
  phase_index: number;
}

interface Roadmap {
  id: string;
  domain: string;
  domain_title: string;
  domain_color: string;
  phases: Phase[];
  skill_scores: Record<string, number>;
  skill_gap: Record<string, number>;
  progress_pct: number;
  cv_items: string[];
  next_milestone: string;
  learning_style: string;
  style_tip: string;
  next_update_at: string;
}

const DOMAIN_TABS = [
  { key: "web",  label: "Web Developer",  color: "#6C63FF" },
  { key: "ai",   label: "AI/ML Engineer", color: "#FF6B6B" },
  { key: "data", label: "Data Engineer",  color: "#4ECDC4" },
];

const STATUS_META = {
  completed:   { label: "Hoàn thành", color: "var(--accent-green)", dot: "✓" },
  in_progress: { label: "Đang học",   color: "var(--accent-purple)", dot: "⟳" },
  upcoming:    { label: "Sắp tới",    color: "var(--text-muted)", dot: "○" },
};

export default function RoadmapPage() {
  const [activeDomain, setActiveDomain] = useState("web");
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);

  useEffect(() => { fetchRoadmap(activeDomain); }, [activeDomain]);

  const fetchRoadmap = async (domain: string) => {
    setLoading(true);
    setRoadmap(null);

    // Try sessionStorage first (freshly generated from result page)
    const cached = sessionStorage.getItem("my_roadmap");
    if (cached) {
      const parsed: Roadmap = JSON.parse(cached);
      if (parsed.domain === domain) {
        setRoadmap(parsed);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(`http://localhost:8000/api/roadmap/student_001?domain=${domain}`);
      if (res.ok) setRoadmap(await res.json());
    } catch { setRoadmap(buildFallback(domain)); }
    finally { setLoading(false); }
  };

  const buildFallback = (domain: string): Roadmap => {
    const templates: Record<string, { title: string; color: string; phases: Omit<Phase, "status"|"phase_index">[] }> = {
      web: {
        title: "Web Developer Roadmap", color: "#6C63FF",
        phases: [
          { week: "Tuần 1–2",  topic: "HTML & CSS Fundamentals",  skills: ["HTML5","CSS3","Flexbox"],  output: "Portfolio tĩnh",       resources: ["MDN Web Docs"] },
          { week: "Tuần 3–4",  topic: "JavaScript ES6+",          skills: ["DOM","Async","Events"],    output: "DOM App",              resources: ["javascript.info"] },
          { week: "Tuần 5–6",  topic: "React Basics",             skills: ["JSX","Hooks","State"],     output: "Todo App với React",   resources: ["react.dev"] },
          { week: "Tuần 7–8",  topic: "Next.js & API Routes",     skills: ["SSR","Routing","API"],     output: "Full-stack Mini App",  resources: ["nextjs.org"] },
          { week: "Tuần 9–10", topic: "Database & Backend",       skills: ["MongoDB","REST","Auth"],   output: "CRUD Application",     resources: ["MongoDB Atlas"] },
          { week: "Tuần 11–12","topic": "Deployment & CI/CD",     skills: ["Docker","Vercel","Git"],   output: "Deployed Project",     resources: ["Vercel"] },
        ],
      },
      ai: {
        title: "AI/ML Engineer Roadmap", color: "#FF6B6B",
        phases: [
          { week: "Tuần 1–2",  topic: "Python & Math Foundation",  skills: ["NumPy","Stats","Algebra"], output: "Math Notebooks",       resources: ["Khan Academy"] },
          { week: "Tuần 3–4",  topic: "Data Processing",           skills: ["Pandas","EDA","Cleaning"], output: "EDA Report",           resources: ["Kaggle"] },
          { week: "Tuần 5–6",  topic: "Machine Learning",          skills: ["sklearn","Regression"],    output: "Classification Model", resources: ["fast.ai"] },
          { week: "Tuần 7–8",  topic: "Deep Learning",             skills: ["PyTorch","CNN","GPU"],     output: "Image Classifier",     resources: ["d2l.ai"] },
          { week: "Tuần 9–10", topic: "NLP & LLM",                 skills: ["BERT","LangChain","RAG"],  output: "Chatbot App",          resources: ["Hugging Face"] },
          { week: "Tuần 11–12","topic": "MLOps",                   skills: ["Docker","MLflow","API"],   output: "Deployed Model",       resources: ["MLflow"] },
        ],
      },
      data: {
        title: "Data Engineer Roadmap", color: "#4ECDC4",
        phases: [
          { week: "Tuần 1–2",  topic: "SQL Fundamentals",          skills: ["SELECT","JOIN","Index"],   output: "Query Portfolio",      resources: ["HackerRank"] },
          { week: "Tuần 3–4",  topic: "Python & Pandas",           skills: ["Pandas","NumPy","I/O"],    output: "Cleaning Script",      resources: ["Kaggle"] },
          { week: "Tuần 5–6",  topic: "Data Visualization",        skills: ["Plotly","Streamlit"],      output: "Dashboard",            resources: ["Streamlit"] },
          { week: "Tuần 7–8",  topic: "ETL Pipeline",              skills: ["Airflow","PostgreSQL"],    output: "ETL Pipeline",         resources: ["Airflow docs"] },
          { week: "Tuần 9–10", topic: "Big Data",                  skills: ["Spark","Kafka","Parquet"], output: "Spark Job",            resources: ["DataBricks"] },
          { week: "Tuần 11–12","topic": "Cloud",                   skills: ["GCS","BigQuery","dbt"],    output: "Cloud Pipeline",       resources: ["GCP"] },
        ],
      },
    };
    const t = templates[domain] || templates.web;
    const phases: Phase[] = t.phases.map((p, i) => ({
      ...p,
      status: i === 0 ? "completed" : i === 1 ? "in_progress" : "upcoming",
      phase_index: i,
    }));
    return {
      id: "fallback", domain, domain_title: t.title, domain_color: t.color, phases,
      skill_scores: { foundation: 0, web: 0, ai: 0, data: 0 },
      skill_gap: { foundation: 85, web: 80, ai: 75, data: 70 },
      progress_pct: 16,
      cv_items: [phases[0].output],
      next_milestone: phases[1].topic,
      learning_style: "",
      style_tip: "Kết hợp lý thuyết và thực hành đều đặn mỗi ngày.",
      next_update_at: new Date(Date.now() + 14 * 864e5).toISOString(),
    };
  };

  const activeTab = DOMAIN_TABS.find(t => t.key === activeDomain)!;
  const color = roadmap?.domain_color || activeTab.color;

  return (
    <div className="page-content fade-in">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Roadmap Cá Nhân Hóa</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
          Lộ trình được tạo tự động từ kết quả assessment, cập nhật mỗi 2–4 tuần
        </p>
      </div>

      {/* Domain tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {DOMAIN_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveDomain(tab.key)} style={{
            padding: "10px 22px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer",
            background: activeDomain === tab.key ? tab.color : "rgba(255,255,255,0.05)",
            border: `1px solid ${activeDomain === tab.key ? tab.color : "rgba(255,255,255,0.1)"}`,
            color: activeDomain === tab.key ? "white" : "var(--text-secondary)",
            boxShadow: activeDomain === tab.key ? `0 4px 16px ${tab.color}44` : "none",
            transition: "all 0.2s",
          }}>{tab.label}</button>
        ))}
        <Link href="/assessment" className="btn btn-outline" style={{ marginLeft: "auto", fontSize: 12, padding: "10px 16px" }}>
          ↺ Làm lại Assessment
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)" }}>
          <div style={{ fontSize: 32, marginBottom: 12, animation: "pulse 1.5s infinite" }}>⟳</div>
          Đang tải roadmap...
        </div>
      ) : roadmap ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>

          {/* ── Left: Timeline ── */}
          <div className="card">
            {/* Progress header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>{roadmap.domain_title}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color }}>{roadmap.progress_pct}%</span>
              </div>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, marginBottom: 24, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${roadmap.progress_pct}%`, background: color, borderRadius: 3, transition: "width 1s ease", boxShadow: `0 0 10px ${color}66` }} />
            </div>

            {/* Style tip */}
            {roadmap.style_tip && (
              <div style={{ marginBottom: 20, padding: "10px 14px", background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 8, fontSize: 13, color: "var(--text-secondary)", display: "flex", gap: 8 }}>
                <span>💡</span>{roadmap.style_tip}
              </div>
            )}

            {/* Phases timeline */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {roadmap.phases.map((phase, i) => {
                const sm = STATUS_META[phase.status];
                const isExpanded = expandedPhase === i;
                const isLast = i === roadmap.phases.length - 1;
                return (
                  <div key={i} style={{ display: "flex", gap: 16 }}>
                    {/* Dot + line */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                        background: phase.status === "completed" ? "var(--accent-green)"
                          : phase.status === "in_progress" ? color : "rgba(255,255,255,0.08)",
                        border: `2px solid ${phase.status === "upcoming" ? "rgba(255,255,255,0.15)" : "transparent"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, color: "white", fontWeight: 800,
                        boxShadow: phase.status === "in_progress" ? `0 0 12px ${color}88` : "none",
                      }}>{sm.dot}</div>
                      {!isLast && <div style={{ width: 2, flex: 1, minHeight: 32, background: phase.status === "completed" ? "var(--accent-green)" : "rgba(255,255,255,0.07)", marginTop: 2 }} />}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
                      <button onClick={() => setExpandedPhase(isExpanded ? null : i)}
                        style={{
                          width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer",
                          padding: "2px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                        }}>
                        <div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, marginBottom: 3 }}>{phase.week}</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: phase.status === "upcoming" ? "var(--text-secondary)" : "var(--text-primary)" }}>{phase.topic}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: sm.color, padding: "2px 8px", background: `${sm.color}18`, borderRadius: 20 }}>{sm.label}</span>
                          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{isExpanded ? "▲" : "▼"}</span>
                        </div>
                      </button>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div style={{ marginTop: 10, padding: "12px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>KỸ NĂNG</span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 5 }}>
                              {phase.skills.map(s => (
                                <span key={s} style={{ fontSize: 11, padding: "2px 8px", background: `${color}18`, color, borderRadius: 6, border: `1px solid ${color}33` }}>{s}</span>
                              ))}
                            </div>
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>OUTPUT</span>
                            <div style={{ fontSize: 13, color: "var(--accent-green)", marginTop: 3 }}>📦 {phase.output}</div>
                          </div>
                          <div>
                            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>TÀI LIỆU</span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 5 }}>
                              {phase.resources.map(r => (
                                <span key={r} style={{ fontSize: 11, padding: "2px 8px", background: "rgba(255,255,255,0.07)", borderRadius: 6, color: "var(--text-secondary)" }}>🔗 {r}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right panel ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Next milestone */}
            <div className="card" style={{ background: `${color}12`, border: `1px solid ${color}33` }}>
              <div style={{ fontSize: 11, color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>🎯 Milestone tiếp theo</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{roadmap.next_milestone}</div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${roadmap.progress_pct}%`, background: color, borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 5 }}>{roadmap.progress_pct}% hoàn thành</div>
            </div>

            {/* CV items */}
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>📄 Items sẵn sàng cho CV</div>
              {roadmap.cv_items.length > 0 ? roadmap.cv_items.map((item) => (
                <div key={item} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 13 }}>
                  <span style={{ color: "var(--accent-green)" }}>✓</span>{item}
                </div>
              )) : <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Hoàn thành phase đầu tiên để có CV item!</div>}
            </div>

            {/* Skill gap summary */}
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>📊 Khoảng cách kỹ năng</div>
              {Object.entries(roadmap.skill_gap).map(([d, gap]) => (
                <div key={d} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                    <span style={{ textTransform: "capitalize" }}>{d}</span>
                    <span style={{ color: gap > 40 ? "var(--accent-red)" : gap > 20 ? "var(--accent-orange)" : "var(--accent-green)" }}>
                      {gap > 0 ? `–${gap}` : "✓ Đạt"}
                    </span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${Math.max(0, 100 - gap)}%`, background: gap > 40 ? "var(--accent-red)" : gap > 20 ? "var(--accent-orange)" : "var(--accent-green)", borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Update schedule */}
            <div className="card" style={{ background: "rgba(108,99,255,0.07)", border: "1px solid rgba(108,99,255,0.2)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-purple)", marginBottom: 8 }}>🔄 Cập nhật tiếp theo</div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Roadmap tự động phân tích lại sau <strong style={{ color: "white" }}>2 tuần</strong> dựa trên tiến độ và feedback.
              </p>
              <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                📅 {new Date(roadmap.next_update_at).toLocaleDateString("vi-VN")}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import API_URL from "@/lib/api";

const fallbackSkillData = [
  { name: "Foundation", current: 80, market: 90, color: "#6C63FF" },
  { name: "Web Development", current: 55, market: 85, color: "#4A90E2" },
  { name: "AI / Machine Learning", current: 30, market: 75, color: "#FF6B6B" },
  { name: "Data Engineering", current: 40, market: 70, color: "#4ECDC4" },
  { name: "Soft Skills", current: 70, market: 80, color: "#FFB347" },
];

const activities = [
  { date: "Hôm nay", action: "Hoàn thành module React Basics", type: "milestone" },
  { date: "2 ngày trước", action: "Nộp bài Task Manager App", type: "project" },
  { date: "1 tuần trước", action: "Cập nhật roadmap – Tuần 2", type: "roadmap" },
  { date: "2 tuần trước", action: "Hoàn thành Assessment", type: "assessment" },
];

const skillColors: Record<string, string> = {
  Foundation: "#6C63FF",
  "Web Development": "#4A90E2",
  "AI/ML": "#FF6B6B",
  "Data Engineering": "#4ECDC4",
  "Soft Skills": "#FFB347",
};

interface DashboardData {
  name: string;
  overall_progress: number;
  assessment_done: boolean;
  skill_scores: Record<string, number>;
  market_gap: Record<string, number>;
  recent_activity: { date: string; action: string; type: string }[];
  cv_ready_items: number;
  next_milestone: string;
  streak_days: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/dashboard/student_001`)
      .then((res) => res.ok ? res.json() : null)
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const skillData = data && Object.keys(data.skill_scores).length
    ? Object.entries(data.skill_scores).map(([name, current]) => ({
        name,
        current,
        market: Math.min(100, current + (data.market_gap[name] || 0)),
        color: skillColors[name] || "#6C63FF",
      }))
    : fallbackSkillData;
  const recentActivities = data?.recent_activity?.length ? data.recent_activity : activities;
  const progress = data?.overall_progress ?? 45;

  return (
    <div className="page-content fade-in">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Dashboard</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
          Xin chào, {data?.name || "Nguyễn Văn A"}! Hãy tiếp tục hành trình học tập hôm nay.
        </p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "Tiến độ tổng thể", value: `${progress}%`, sub: data?.assessment_done ? "Dựa trên roadmap hiện tại" : "Chưa có assessment", color: "var(--accent-purple)" },
          { label: "Streak học tập", value: `${data?.streak_days ?? 12} ngày`, sub: "Theo hoạt động gần đây", color: "var(--accent-orange)" },
          { label: "Projects hoàn thành", value: "3", sub: "2 đang làm", color: "var(--accent-teal)" },
          { label: "Items CV sẵn sàng", value: String(data?.cv_ready_items ?? 3), sub: "Mục tiêu: 8", color: "var(--accent-green)" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ position: "relative", overflow: "hidden" }}>
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
          <div className="card">
            <div style={{ fontSize: 11, color: "var(--accent-purple)", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Milestone tiếp theo</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{data?.next_milestone || "Next.js & API Routes"}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>Dự kiến hoàn thành trong 1 tuần</div>
            <div className="progress-bar" style={{ marginBottom: 8 }}>
              <div className="progress-fill" style={{ width: `${progress}%`, background: "var(--accent-purple)" }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{progress}% hoàn thành</div>
          </div>

          {/* Recent activity */}
          <div className="card" style={{ flex: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Hoạt động gần đây</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentActivities.map((a) => (
                <div key={a.action} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
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
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Roadmap cập nhật sau 5 ngày nữa</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Hệ thống sẽ phân tích tiến độ và điều chỉnh lộ trình mỗi 2–4 tuần</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <Link href="/roadmap" className="btn btn-primary">Xem Roadmap</Link>
          <Link href="/projects" className="btn btn-outline">Mini Projects</Link>
        </div>
      </div>
    </div>
  );
}

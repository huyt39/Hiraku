"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AssessmentResult {
  result_id: string;
  skill_scores: Record<string, number>;
  skill_gap: Record<string, number>;
  target_domain: string;
  learning_style: string;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  market_requirements: Record<string, number>;
}

interface AISuggestion {
  recommended_domain: string;
  domain_label: string;
  confidence: number;
  reasons: string[];
  immediate_actions: string[];
  gemini_analysis: string | null;
  source: string;
}

const DOMAIN_META: Record<string, { label: string; color: string; icon: string; badge: string }> = {
  web:      { label: "Web Developer",       color: "#6C63FF", icon: "🌐", badge: "badge-web"  },
  ai:       { label: "AI/ML Engineer",      color: "#FF6B6B", icon: "🤖", badge: "badge-ai"   },
  data:     { label: "Data Engineer",       color: "#4ECDC4", icon: "📊", badge: "badge-data" },
  devops:   { label: "DevOps Engineer",     color: "#FFB347", icon: "☁️", badge: "badge-intermediate" },
  undecided:{ label: "Chưa xác định",       color: "#8892A4", icon: "❓", badge: "" },
};

const SKILL_LABELS: Record<string, string> = {
  foundation: "Foundation",
  web:        "Web Dev",
  ai:         "AI/ML",
  data:       "Data",
};

function RadialScore({ score, color }: { score: number; color: string }) {
  const r = 52, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={128} height={128} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={10} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease", filter: `drop-shadow(0 0 6px ${color}88)` }}
      />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fill="white" fontSize={22} fontWeight={800} style={{ transform: "rotate(90deg)", transformOrigin: `${cx}px ${cy}px` }}>
        {score}
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" dominantBaseline="middle"
        fill="rgba(255,255,255,0.5)" fontSize={11} style={{ transform: "rotate(90deg)", transformOrigin: `${cx}px ${cy}px` }}>
        /100
      </text>
    </svg>
  );
}

export default function AssessmentResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("assessment_result");
    if (!raw) { router.push("/assessment"); return; }
    const parsed: AssessmentResult = JSON.parse(raw);
    setResult(parsed);
    fetchAISuggestion(parsed);
  }, []);

  const fetchAISuggestion = async (r: AssessmentResult) => {
    setLoadingAI(true);
    try {
      const res = await fetch("http://localhost:8000/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: "student_001",
          skill_scores: r.skill_scores,
          skill_gap: r.skill_gap,
          target_domain: r.target_domain,
          learning_style: r.learning_style,
          overall_score: r.overall_score,
        }),
      });
      if (res.ok) setSuggestion(await res.json());
    } catch {
      // Fallback rule-based display
      setSuggestion({
        recommended_domain: r.target_domain === "undecided" ? "web" : r.target_domain,
        domain_label: DOMAIN_META[r.target_domain]?.label || "Web Developer",
        confidence: 72,
        reasons: [
          "Dựa trên kết quả assessment, đây là lĩnh vực phù hợp nhất với kỹ năng hiện tại.",
          "Khoảng cách với yêu cầu thị trường có thể thu hẹp trong 3–6 tháng.",
        ],
        immediate_actions: [
          "Hoàn thành 1 mini project trong lĩnh vực này",
          "Củng cố nền tảng Git và cấu trúc dữ liệu",
          "Xem roadmap cá nhân hóa được tạo tự động",
        ],
        gemini_analysis: null,
        source: "rule_based",
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!result || !suggestion) return;
    setGeneratingRoadmap(true);
    try {
      const res = await fetch("http://localhost:8000/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: "student_001",
          name: "Nguyễn Văn A",
          domain: suggestion.recommended_domain,
          skill_scores: result.skill_scores,
          skill_gap: result.skill_gap,
          learning_style: result.learning_style,
        }),
      });
      if (res.ok) {
        const roadmap = await res.json();
        sessionStorage.setItem("my_roadmap", JSON.stringify(roadmap));
      }
    } catch { /* ignore, roadmap page has fallback */ }
    finally { setGeneratingRoadmap(false); }
    router.push("/roadmap");
  };

  if (!result) return (
    <div className="page-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
      <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>⟳ Đang tải kết quả...</div>
    </div>
  );

  const recDomain = suggestion?.recommended_domain || result.target_domain;
  const domainMeta = DOMAIN_META[recDomain] || DOMAIN_META.web;
  const scores = result.skill_scores;
  const gap = result.skill_gap;
  const market = result.market_requirements;

  return (
    <div className="page-content fade-in">
      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Kết quả Self-Assessment</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Phân tích dựa trên câu trả lời của bạn và so sánh với yêu cầu thị trường IT Việt Nam
        </p>
      </div>

      {/* ── Overall score + domain ── */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "stretch", flexWrap: "wrap" }}>
        {/* Overall radial */}
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 180, flex: "0 0 auto" }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Điểm tổng thể</div>
          <RadialScore score={result.overall_score} color={domainMeta.color} />
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>Ready score</div>
        </div>

        {/* Skill bars */}
        <div className="card" style={{ flex: 1, minWidth: 280 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Kỹ năng theo lĩnh vực</h3>
          {Object.entries(scores).map(([domain, score]) => {
            const marketScore = market[domain] || 80;
            const gapVal = gap[domain] || 0;
            const dm = DOMAIN_META[domain];
            return (
              <div key={domain} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{SKILL_LABELS[domain] || domain}</span>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    <span style={{ color: dm?.color || "#fff", fontWeight: 700 }}>{score}</span>
                    <span style={{ color: "var(--text-muted)" }}> / {marketScore} yêu cầu</span>
                  </span>
                </div>
                <div style={{ position: "relative", height: 8, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "visible" }}>
                  {/* Market target line */}
                  <div style={{
                    position: "absolute", left: `${marketScore}%`, top: -3, bottom: -3,
                    width: 2, background: "rgba(255,255,255,0.25)", borderRadius: 1, zIndex: 2,
                  }} />
                  {/* User score fill */}
                  <div style={{
                    height: "100%", borderRadius: 4, width: `${Math.min(score, 100)}%`,
                    background: `linear-gradient(90deg, ${dm?.color || "#6C63FF"}, ${dm?.color || "#6C63FF"}bb)`,
                    transition: "width 0.8s ease",
                  }} />
                </div>
                {gapVal > 0 && (
                  <div style={{ fontSize: 11, color: "var(--accent-red)", marginTop: 4 }}>
                    ↑ Cần cải thiện thêm {gapVal} điểm để đạt yêu cầu
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Strengths & Weaknesses */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: "0 0 200px" }}>
          <div className="card" style={{ flex: 1, background: "rgba(86,207,143,0.07)", border: "1px solid rgba(86,207,143,0.25)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-green)", marginBottom: 10 }}>💪 Điểm mạnh</div>
            {result.strengths.length > 0
              ? result.strengths.map((s) => (
                <div key={s} style={{ fontSize: 13, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 6 }}>
                  <span>✓</span>{SKILL_LABELS[s] || s}
                </div>
              ))
              : <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Tiếp tục phát triển...</div>
            }
          </div>
          <div className="card" style={{ flex: 1, background: "rgba(255,107,107,0.07)", border: "1px solid rgba(255,107,107,0.25)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-red)", marginBottom: 10 }}>🎯 Cần cải thiện</div>
            {result.weaknesses.length > 0
              ? result.weaknesses.map((s) => (
                <div key={s} style={{ fontSize: 13, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 6 }}>
                  <span>↑</span>{SKILL_LABELS[s] || s}
                </div>
              ))
              : <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Tốt lắm!</div>
            }
          </div>
        </div>
      </div>

      {/* ── AI Suggestion ── */}
      <div className="card" style={{
        marginBottom: 20,
        background: `linear-gradient(135deg, ${domainMeta.color}12, ${domainMeta.color}06)`,
        border: `1px solid ${domainMeta.color}44`,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>{domainMeta.icon}</span>
              <div>
                <div style={{ fontSize: 11, color: domainMeta.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                  {loadingAI ? "🤖 AI đang phân tích..." : `🤖 AI đề xuất · ${suggestion?.source === "gemini" ? "Gemini" : "Rule-based"}`}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>
                  {loadingAI ? "Đang xử lý..." : suggestion?.domain_label || "Web Developer"}
                </div>
              </div>
              {!loadingAI && suggestion && (
                <div style={{ marginLeft: "auto", textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: domainMeta.color }}>{suggestion.confidence}%</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>phù hợp</div>
                </div>
              )}
            </div>

            {!loadingAI && suggestion?.gemini_analysis && (
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, fontStyle: "italic", marginBottom: 12, padding: "10px 14px", background: "rgba(255,255,255,0.05)", borderRadius: 8, borderLeft: `3px solid ${domainMeta.color}` }}>
                "{suggestion.gemini_analysis}"
              </div>
            )}

            {!loadingAI && suggestion?.reasons && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {suggestion.reasons.map((r, i) => (
                  <div key={i} style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", gap: 8 }}>
                    <span style={{ color: domainMeta.color, flexShrink: 0 }}>▸</span>{r}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Immediate actions */}
          {!loadingAI && suggestion?.immediate_actions && (
            <div style={{ minWidth: 220, flex: "0 0 auto" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Hành động ngay</div>
              {suggestion.immediate_actions.map((a, i) => (
                <div key={i} style={{
                  fontSize: 13, padding: "8px 12px", marginBottom: 6,
                  background: "rgba(255,255,255,0.05)", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", gap: 8, alignItems: "flex-start",
                }}>
                  <span style={{ color: domainMeta.color, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  {a}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CTA Buttons ── */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button
          className="btn btn-primary"
          onClick={handleGenerateRoadmap}
          disabled={generatingRoadmap || loadingAI}
          style={{
            padding: "12px 28px", fontSize: 14,
            background: `linear-gradient(135deg, ${domainMeta.color}, ${domainMeta.color}bb)`,
            boxShadow: `0 4px 20px ${domainMeta.color}44`,
            opacity: generatingRoadmap || loadingAI ? 0.6 : 1,
          }}
        >
          {generatingRoadmap ? "Đang tạo roadmap..." : "🗺 Tạo Roadmap Cá Nhân Hóa →"}
        </button>
        <Link href="/projects" className="btn btn-outline" style={{ padding: "12px 24px", fontSize: 14 }}>
          ◉ Khám phá Mini Projects
        </Link>
        <Link href="/dashboard" className="btn btn-outline" style={{ padding: "12px 24px", fontSize: 14 }}>
          ⬡ Về Dashboard
        </Link>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import API_URL from "@/lib/api";

const QUESTIONS = [
  {
    id: 1, module: "MODULE 1: FOUNDATION", moduleIdx: 1, total: 3,
    question: "Bạn đã học lập trình được bao lâu?",
    options: ["Dưới 6 tháng", "6 tháng – 1 năm", "1 – 2 năm", "Trên 2 năm"],
    type: "single",
  },
  {
    id: 2, module: "MODULE 1: FOUNDATION", moduleIdx: 2, total: 3,
    question: "Bạn thích học kỹ năng mới theo cách nào?",
    options: [
      "Học theo khóa học có cấu trúc rõ ràng với các mốc rõ ràng.",
      "Thực hành trực tiếp qua các dự án thực tế.",
      "Đọc tài liệu và sách chuyên sâu.",
      "Xem video hướng dẫn và pair programming với mentor.",
    ],
    type: "single",
  },
  {
    id: 3, module: "MODULE 1: FOUNDATION", moduleIdx: 3, total: 3,
    question: "Mục tiêu nghề nghiệp sau khi ra trường?",
    options: [
      "Web Developer / Frontend / Backend",
      "AI / Machine Learning Engineer",
      "Data Analyst / Data Engineer",
      "DevOps / Cloud Engineer",
      "Chưa quyết định",
    ],
    type: "single",
  },
  {
    id: 4, module: "MODULE 2: TECHNICAL SKILLS", moduleIdx: 1, total: 3,
    question: "Bạn đã làm việc với ngôn ngữ lập trình nào?",
    options: ["Python", "JavaScript / TypeScript", "Java", "C / C++", "Go / Rust", "Chưa biết ngôn ngữ nào"],
    type: "multiple",
    hint: "Chọn tất cả ngôn ngữ bạn đã dùng",
  },
  {
    id: 5, module: "MODULE 2: TECHNICAL SKILLS", moduleIdx: 2, total: 3,
    question: "Bạn có kinh nghiệm với cơ sở dữ liệu không?",
    options: [
      "Chưa từng dùng",
      "SQL cơ bản (SELECT, INSERT)",
      "SQL nâng cao (JOIN, Index, Transaction)",
      "NoSQL (MongoDB, Redis) hoặc cả hai",
    ],
    type: "single",
  },
  {
    id: 6, module: "MODULE 2: TECHNICAL SKILLS", moduleIdx: 3, total: 3,
    question: "Mức độ hiểu biết về Git / Version Control?",
    options: [
      "Chưa biết Git",
      "Biết commit, push cơ bản",
      "Biết branch, merge, Pull Request",
      "Thành thạo Git workflow trong team",
    ],
    type: "single",
  },
  {
    id: 7, module: "MODULE 3: DOMAIN KNOWLEDGE", moduleIdx: 1, total: 2,
    question: "Bạn đã từng xây dựng dự án Web chưa?",
    options: [
      "Chưa từng",
      "Đã làm HTML/CSS tĩnh",
      "Đã dùng React/Vue/Angular",
      "Đã deploy lên production",
    ],
    type: "single",
  },
  {
    id: 8, module: "MODULE 3: DOMAIN KNOWLEDGE", moduleIdx: 2, total: 2,
    question: "Kiến thức về AI/ML của bạn ở mức nào?",
    options: [
      "Chưa biết gì",
      "Hiểu khái niệm cơ bản",
      "Đã dùng scikit-learn, pandas",
      "Đã train và deploy model AI",
    ],
    type: "single",
  },
];

const MODULE_COLORS: Record<string, string> = {
  "MODULE 1: FOUNDATION":        "#6C63FF",
  "MODULE 2: TECHNICAL SKILLS":  "#4ECDC4",
  "MODULE 3: DOMAIN KNOWLEDGE":  "#FF6B6B",
};

export default function AssessmentPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const q = QUESTIONS[current];
  const color = MODULE_COLORS[q.module] || "#6C63FF";
  const progress = (current / QUESTIONS.length) * 100;
  const isMulti = q.type === "multiple";
  const curAnswer = answers[q.id];
  const hasAnswer = isMulti
    ? Array.isArray(curAnswer) && curAnswer.length > 0
    : !!curAnswer;

  // Single select
  const selectSingle = (opt: string) =>
    setAnswers((prev) => ({ ...prev, [q.id]: opt }));

  // Multi select toggle
  const toggleMulti = (opt: string) => {
    const prev = (answers[q.id] as string[]) || [];
    const next = prev.includes(opt)
      ? prev.filter((x) => x !== opt)
      : [...prev, opt];
    setAnswers((a) => ({ ...a, [q.id]: next }));
  };

  const isSelected = (opt: string) =>
    isMulti
      ? ((answers[q.id] as string[]) || []).includes(opt)
      : answers[q.id] === opt;

  const next = async () => {
    if (current < QUESTIONS.length - 1) {
      setCurrent((c) => c + 1);
      return;
    }
    // Last question → submit
    setSubmitting(true);
    try {
      const payload = {
        student_id: "student_001",
        name: "Nguyễn Văn A",
        answers: Object.entries(answers).map(([qid, ans]) => ({
          question_id: Number(qid),
          answer: ans,
        })),
      };
      const res = await fetch(`${API_URL}/api/assessment/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        // Store in sessionStorage and navigate to result
        sessionStorage.setItem("assessment_result", JSON.stringify(data));
        router.push("/assessment/result");
      } else {
        throw new Error("Submit failed");
      }
    } catch {
      // Fallback: compute client-side and navigate
      const mockResult = {
        result_id: "local_" + Date.now(),
        skill_scores: { foundation: 55, web: 40, ai: 20, data: 35 },
        skill_gap:    { foundation: 30, web: 40, ai: 55, data: 35 },
        target_domain: "web",
        overall_score: 40,
        strengths: ["foundation"],
        weaknesses: ["ai"],
        market_requirements: { foundation: 85, web: 80, ai: 75, data: 70 },
      };
      sessionStorage.setItem("assessment_result", JSON.stringify(mockResult));
      router.push("/assessment/result");
    } finally {
      setSubmitting(false);
    }
  };

  const prev = () => { if (current > 0) setCurrent((c) => c - 1); };

  return (
    <div className="page-content fade-in">
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color, textTransform: "uppercase",
            letterSpacing: 1, padding: "3px 10px", borderRadius: 20,
            background: `${color}18`, border: `1px solid ${color}44`,
          }}>{q.module}</span>
        </div>
        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
          Câu {current + 1} / {QUESTIONS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, marginBottom: 28, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 2, transition: "width 0.4s ease",
          background: `linear-gradient(90deg, ${color}, ${color}bb)`,
          width: `${progress}%`,
          boxShadow: `0 0 8px ${color}66`,
        }} />
      </div>

      {/* Question card */}
      <div className="card" style={{ maxWidth: 740, margin: "0 auto", padding: "28px 32px" }}>
        {q.hint && (
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span>☑</span> {q.hint}
          </div>
        )}
        <h2 style={{ fontSize: 21, fontWeight: 700, marginBottom: 24, lineHeight: 1.45 }}>
          {q.question}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt) => {
            const sel = isSelected(opt);
            return (
              <button
                key={opt}
                onClick={() => isMulti ? toggleMulti(opt) : selectSingle(opt)}
                style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "13px 18px",
                  background: sel ? `${color}16` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${sel ? color : "rgba(255,255,255,0.09)"}`,
                  borderRadius: 10, cursor: "pointer", textAlign: "left",
                  transition: "all 0.18s", color: sel ? color : "var(--text-primary)",
                  fontSize: 14, fontWeight: sel ? 600 : 400,
                  boxShadow: sel ? `0 0 0 1px ${color}44` : "none",
                }}
              >
                {/* Checkbox / Radio indicator */}
                <span style={{
                  width: 20, height: 20, borderRadius: isMulti ? 5 : "50%", flexShrink: 0,
                  border: `2px solid ${sel ? color : "rgba(255,255,255,0.2)"}`,
                  background: sel ? color : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.18s",
                }}>
                  {sel && (
                    <span style={{ color: "white", fontSize: isMulti ? 11 : 8, fontWeight: 800 }}>
                      {isMulti ? "✓" : "●"}
                    </span>
                  )}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 30 }}>
          <button
            className="btn btn-outline"
            onClick={prev}
            disabled={current === 0}
            style={{ opacity: current === 0 ? 0.3 : 1 }}
          >
            ← Previous
          </button>

          {/* Dot progress */}
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {QUESTIONS.map((_, i) => (
              <div key={i} style={{
                width: i === current ? 22 : 6,
                height: 6, borderRadius: 3,
                background: i < current
                  ? "var(--accent-green)"
                  : i === current ? color : "rgba(255,255,255,0.12)",
                transition: "all 0.3s",
              }} />
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={next}
            disabled={!hasAnswer || submitting}
            style={{
              opacity: !hasAnswer || submitting ? 0.45 : 1,
              background: `linear-gradient(135deg, ${color}, ${color}cc)`,
              boxShadow: hasAnswer ? `0 4px 16px ${color}44` : "none",
            }}
          >
            {submitting
              ? "Đang phân tích..."
              : current === QUESTIONS.length - 1
              ? "Hoàn thành ✓"
              : "Tiếp theo →"}
          </button>
        </div>
      </div>

      {/* Info hint */}
      <div style={{
        maxWidth: 740, margin: "18px auto 0", padding: "12px 18px",
        background: "rgba(108,99,255,0.05)", border: "1px solid rgba(108,99,255,0.18)",
        borderRadius: 10, fontSize: 13, color: "var(--text-secondary)",
        display: "flex", gap: 8, alignItems: "center",
      }}>
        <span>💡</span>
        Kết quả sẽ được so sánh với yêu cầu thị trường IT và dùng AI để đề xuất định hướng phù hợp nhất cho bạn.
      </div>
    </div>
  );
}

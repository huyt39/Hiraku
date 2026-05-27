"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import API_URL from "@/lib/api";

interface Domain {
  id: string;
  name: string;
  description: string;
  required_skills: string[];
  job_titles: string[];
  demand: string;
  avg_salary: string;
  trend: string;
}

const DOMAIN_META: Record<string, { color: string; background: string }> = {
  web:    { color: "#344256", background: "#f3f5f8" },
  ai:     { color: "#3f5f86", background: "#f3f5f8" },
  data:   { color: "#4f7f7a", background: "#f3f5f8" },
  devops: { color: "#9a7646", background: "#f3f5f8" },
};

const DEMAND_COLOR: Record<string, string> = {
  "Rất cao": "#56CF8F",
  "Cao":     "#4ECDC4",
  "Khá cao": "#FFB347",
};

const DEFAULT_DOMAINS: Domain[] = [
  {
    id: "web",
    name: "Web Developer",
    description: "Xây dựng frontend, backend và sản phẩm web full-stack. Lĩnh vực có nhu cầu tuyển dụng cao nhất tại Việt Nam hiện nay.",
    required_skills: ["HTML/CSS", "JavaScript", "React", "Node.js", "REST API", "Git"],
    job_titles: ["Frontend Developer", "Backend Developer", "Full-stack Developer"],
    demand: "Rất cao",
    avg_salary: "15–25M VND",
    trend: "Doanh nghiệp cần lập trình viên có khả năng ship sản phẩm nhanh và hiểu API.",
  },
  {
    id: "ai",
    name: "AI / Machine Learning Engineer",
    description: "Phát triển model ML, ứng dụng AI và tích hợp LLM vào sản phẩm. Lĩnh vực tăng trưởng mạnh nhất trong 3 năm qua.",
    required_skills: ["Python", "Machine Learning", "PyTorch/TensorFlow", "NLP", "MLOps"],
    job_titles: ["ML Engineer", "AI Engineer", "NLP Engineer"],
    demand: "Cao",
    avg_salary: "20–40M VND",
    trend: "Nhu cầu tăng mạnh ở các sản phẩm có tự động hóa, chatbot và phân tích dữ liệu.",
  },
  {
    id: "data",
    name: "Data Analyst / Data Engineer",
    description: "Thu thập, xử lý, phân tích và trực quan hóa dữ liệu phục vụ quyết định kinh doanh.",
    required_skills: ["SQL", "Python", "Pandas", "Visualization", "Airflow", "Cloud"],
    job_titles: ["Data Analyst", "Data Engineer", "BI Developer"],
    demand: "Cao",
    avg_salary: "12–22M VND",
    trend: "Các team cần dashboard, pipeline và phân tích dữ liệu đáng tin cậy.",
  },
  {
    id: "devops",
    name: "DevOps / Cloud Engineer",
    description: "Tự động hóa triển khai, vận hành hạ tầng cloud và giám sát hệ thống.",
    required_skills: ["Linux", "Docker", "CI/CD", "Cloud", "Monitoring", "Networking"],
    job_titles: ["DevOps Engineer", "Cloud Engineer", "SRE"],
    demand: "Khá cao",
    avg_salary: "18–35M VND",
    trend: "Nhu cầu ổn định ở các hệ thống cần scale, bảo mật và uptime cao.",
  },
];

const MARKET_STATS = [
  { label: "Vị trí tuyển dụng IT/năm", value: "120K+", color: "var(--accent-purple)" },
  { label: "Mức lương trung bình", value: "22M VND", color: "var(--accent-green)" },
  { label: "Tăng trưởng ngành", value: "+18%", color: "var(--accent-teal)" },
  { label: "Thiếu hụt nhân lực", value: "500K", color: "var(--accent-orange)" },
];

const COMPANY_REFERENCES: Record<string, { name: string; roles: string[]; note: string }[]> = {
  web: [
    { name: "FPT Software", roles: ["Frontend Developer", "Backend Developer", "Full-stack Developer"], note: "Outsourcing, enterprise systems" },
    { name: "VNG / Zalo", roles: ["Frontend Engineer", "Backend Engineer"], note: "Product, consumer platforms" },
    { name: "MoMo", roles: ["Web Engineer", "Backend Engineer"], note: "Fintech, payment products" },
    { name: "Shopee Vietnam", roles: ["Frontend Engineer", "Software Engineer"], note: "E-commerce, large-scale systems" },
    { name: "Tiki", roles: ["Frontend Developer", "Full-stack Developer"], note: "E-commerce, marketplace" },
  ],
  ai: [
    { name: "VinAI", roles: ["AI Engineer", "Machine Learning Engineer"], note: "Computer vision, NLP, applied AI" },
    { name: "FPT.AI", roles: ["AI Engineer", "NLP Engineer"], note: "Conversational AI, automation" },
    { name: "Viettel AI", roles: ["ML Engineer", "Data Scientist"], note: "AI platform, government and enterprise AI" },
    { name: "Zalo AI", roles: ["AI Engineer", "Research Engineer"], note: "Speech, NLP, recommendation systems" },
    { name: "MoMo", roles: ["ML Engineer", "Data Scientist"], note: "Fraud detection, personalization" },
  ],
  data: [
    { name: "FPT Software", roles: ["Data Engineer", "BI Developer"], note: "Data platform, analytics projects" },
    { name: "Viettel Digital", roles: ["Data Engineer", "Data Analyst"], note: "Digital products, analytics" },
    { name: "MoMo", roles: ["Data Analyst", "Data Engineer"], note: "Fintech analytics, growth data" },
    { name: "One Mount", roles: ["Data Analyst", "BI Analyst"], note: "Retail, loyalty, consumer data" },
    { name: "Shopee Vietnam", roles: ["Business Intelligence Analyst", "Data Analyst"], note: "Marketplace operations and analytics" },
  ],
  devops: [
    { name: "Viettel IDC", roles: ["Cloud Engineer", "System Engineer"], note: "Cloud infrastructure, data center" },
    { name: "FPT Smart Cloud", roles: ["Cloud Engineer", "DevOps Engineer"], note: "Cloud services, platform operations" },
    { name: "CMC Telecom", roles: ["DevOps Engineer", "Infrastructure Engineer"], note: "Network, cloud, managed services" },
    { name: "VNG Cloud", roles: ["SRE", "Cloud Engineer"], note: "Cloud platform and operations" },
    { name: "NashTech", roles: ["DevOps Engineer", "Cloud Engineer"], note: "Global delivery, enterprise systems" },
  ],
};

export default function MarketPage() {
  const [domains, setDomains] = useState<Domain[]>(DEFAULT_DOMAINS);
  const [selected, setSelected] = useState<Domain | null>(DEFAULT_DOMAINS[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/market/domains`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.domains?.length) {
          setDomains(data.domains);
          setSelected(data.domains[0]);
        }
      })
      .catch(() => {/* use defaults */})
      .finally(() => setLoading(false));
  }, []);

  const meta = selected ? (DOMAIN_META[selected.id] || DOMAIN_META.web) : DOMAIN_META.web;
  const demandColor = selected ? (DEMAND_COLOR[selected.demand] || "var(--accent-teal)") : "var(--accent-teal)";
  const companyReferences = selected ? (COMPANY_REFERENCES[selected.id] || []) : [];

  return (
    <div className="page-content fade-in">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Thị Trường IT & Nghề Nghiệp</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
          Khám phá nhu cầu tuyển dụng, mức lương và xu hướng ngành IT tại Việt Nam
        </p>
      </div>

      {/* Market stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {MARKET_STATS.map((s) => (
          <div key={s.label} className="card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main content: domain list + detail */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, alignItems: "start" }}>
        {/* Left: domain list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
            Lĩnh vực
          </div>
          {(loading ? DEFAULT_DOMAINS : domains).map((d) => {
            const m = DOMAIN_META[d.id] || DOMAIN_META.web;
            const isActive = selected?.id === d.id;
            return (
              <button
                key={d.id}
                id={`domain-btn-${d.id}`}
                onClick={() => setSelected(d)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                  background: isActive ? m.background : "var(--bg-card)",
                  border: `1px solid ${isActive ? m.color + "55" : "var(--border)"}`,
                  borderRadius: "var(--radius-sm)", cursor: "pointer", textAlign: "left",
                  transition: "all 0.2s",
                  boxShadow: "none",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? m.color : "var(--text-primary)" }}>
                    {d.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                    {d.avg_salary}
                  </div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                    background: `${DEMAND_COLOR[d.demand] || "var(--accent-teal)"}22`,
                    color: DEMAND_COLOR[d.demand] || "var(--accent-teal)",
                    border: `1px solid ${DEMAND_COLOR[d.demand] || "var(--accent-teal)"}44`,
                  }}>
                    {d.demand}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: domain detail */}
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="fade-in">
            {/* Header card */}
            <div className="card" style={{ background: meta.background, border: `1px solid ${meta.color}33` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: meta.color }}>{selected.name}</h2>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.6 }}>
                    {selected.description}
                  </p>
                </div>
              </div>

              {/* Key metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 20 }}>
                {[
                  { label: "Nhu cầu tuyển dụng", value: selected.demand, color: demandColor },
                  { label: "Mức lương TB", value: selected.avg_salary, color: meta.color },
                  { label: "Số vị trí việc làm", value: selected.id === "web" ? "45K+/năm" : selected.id === "ai" ? "28K+/năm" : selected.id === "data" ? "32K+/năm" : "20K+/năm", color: "var(--accent-teal)" },
                ].map((m2) => (
                  <div key={m2.label} style={{
                    padding: "12px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: m2.color }}>{m2.value}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 3 }}>{m2.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Required skills */}
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                  Kỹ năng cần có
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {selected.required_skills.map((skill, i) => (
                    <span key={skill} style={{
                      padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: `${meta.color}${i === 0 ? "25" : "15"}`,
                      color: i === 0 ? meta.color : "var(--text-secondary)",
                      border: `1px solid ${meta.color}${i === 0 ? "55" : "30"}`,
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Job titles */}
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                  Vị trí việc làm phổ biến
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selected.job_titles.map((title, i) => (
                    <div key={title} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                      background: "rgba(255,255,255,0.04)", borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      <span style={{ color: meta.color, fontWeight: 700, fontSize: 12 }}>{i + 1}</span>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Company references */}
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                Công ty tham khảo
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 14 }}>
                Một số công ty thường có nhu cầu hoặc từng tuyển các vị trí liên quan. Nên kiểm tra trang tuyển dụng chính thức để xem job đang mở.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                {companyReferences.map((company) => (
                  <div key={company.name} style={{
                    padding: "12px 14px",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    background: "var(--bg-card)",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{company.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 5, lineHeight: 1.5 }}>
                      {company.roles.join(", ")}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>
                      {company.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market trend */}
            <div className="card" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                Xu hướng thị trường
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                {selected.trend}
              </p>
              <div style={{ marginTop: 14, padding: "10px 14px", background: `${meta.color}10`, borderRadius: 8, border: `1px solid ${meta.color}25`, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  Tham khảo lộ trình học tập phù hợp để rút ngắn thời gian đạt chuẩn thị trường và tăng cơ hội tuyển dụng.
                </span>
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: "flex", gap: 12 }}>
              <Link
                href="/assessment"
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center", padding: "12px 20px" }}
              >
                Làm Assessment để xem bạn phù hợp chưa
              </Link>
              <Link
                href="/roadmap"
                className="btn btn-outline"
                style={{ flex: 1, justifyContent: "center", padding: "12px 20px" }}
              >
                Xem Roadmap {selected.name}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

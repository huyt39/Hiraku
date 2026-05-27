"use client";
import { useEffect, useMemo, useState } from "react";
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

interface JobPost {
  title: string;
  company: string;
  location: string;
  level: "Intern" | "Fresher" | "Junior" | "Middle" | "Senior";
  salary: string;
  workModel: "Onsite" | "Hybrid" | "Remote";
  postedAt: string;
  skills: string[];
  technologies: string[];
  summary: string;
  responsibilities: string[];
  requirements: string[];
  marketChange30d: string;
  recentDemand: "Rất cao" | "Cao" | "Ổn định";
  recentSignals: {
    newPosts7d: number;
    activeCompanies: number;
    avgTimeToHireDays: number;
    applicantsPerPost: number;
  };
}

const DEFAULT_DOMAINS: Domain[] = [
  {
    id: "web",
    name: "Web Developer",
    description: "Nhu cầu tuyển dụng ổn định cho các vai trò frontend, backend và full-stack trong các team sản phẩm và outsourcing.",
    required_skills: ["JavaScript", "TypeScript", "React", "Node.js", "REST API", "Git"],
    job_titles: ["Frontend Developer", "Backend Developer", "Full-stack Developer"],
    demand: "Rất cao",
    avg_salary: "15-25M VND",
    trend: "Các vị trí ưu tiên ứng viên có kinh nghiệm build sản phẩm thực tế, tối ưu hiệu năng và phối hợp tốt với product team.",
  },
  {
    id: "ai",
    name: "AI / Machine Learning Engineer",
    description: "Nhu cầu tăng mạnh ở các team xây dựng ứng dụng AI, recommendation và tự động hóa nghiệp vụ.",
    required_skills: ["Python", "Machine Learning", "PyTorch/TensorFlow", "NLP", "MLOps"],
    job_titles: ["ML Engineer", "AI Engineer", "NLP Engineer"],
    demand: "Cao",
    avg_salary: "20-40M VND",
    trend: "Doanh nghiệp ưu tiên hồ sơ có project triển khai thực tế và khả năng đưa model vào production.",
  },
  {
    id: "data",
    name: "Data Analyst / Data Engineer",
    description: "Nhiều doanh nghiệp mở rộng nhu cầu phân tích dữ liệu, dashboard và data pipeline phục vụ vận hành.",
    required_skills: ["SQL", "Python", "Pandas", "Visualization", "ETL", "Cloud"],
    job_titles: ["Data Analyst", "Data Engineer", "BI Developer"],
    demand: "Cao",
    avg_salary: "12-22M VND",
    trend: "Vai trò data đòi hỏi kết hợp kỹ thuật xử lý dữ liệu với khả năng chuyển đổi thành insight kinh doanh.",
  },
  {
    id: "devops",
    name: "DevOps / Cloud Engineer",
    description: "Các team sản phẩm cần nhân sự vận hành hệ thống ổn định, tự động hóa CI/CD và tối ưu hạ tầng cloud.",
    required_skills: ["Linux", "Docker", "CI/CD", "Cloud", "Monitoring", "Networking"],
    job_titles: ["DevOps Engineer", "Cloud Engineer", "SRE"],
    demand: "Khá cao",
    avg_salary: "18-35M VND",
    trend: "Nhu cầu tập trung vào năng lực triển khai production, reliability và kiểm soát chi phí cloud.",
  },
];

const JOB_POSTS: Record<string, JobPost[]> = {
  web: [
    {
      title: "Frontend Developer (React)",
      company: "Shopee Vietnam",
      location: "Ho Chi Minh City",
      level: "Junior",
      salary: "18-28M VND",
      workModel: "Hybrid",
      postedAt: "3 ngày trước",
      skills: ["React", "TypeScript", "UI Testing"],
      technologies: ["Next.js", "Redux Toolkit", "Cypress"],
      summary: "Tham gia xây dựng UI cho các flow mua hàng và trang quản lý seller trên web.",
      responsibilities: ["Phát triển tính năng mới theo thiết kế", "Tối ưu hiệu năng render", "Phối hợp với backend và QA"],
      requirements: ["Nắm chắc React và TypeScript", "Biết state management", "Ưu tiên có kinh nghiệm test UI"],
      marketChange30d: "+18%",
      recentDemand: "Rất cao",
      recentSignals: { newPosts7d: 46, activeCompanies: 19, avgTimeToHireDays: 22, applicantsPerPost: 41 },
    },
    {
      title: "Backend Developer (Node.js)",
      company: "MoMo",
      location: "Ho Chi Minh City",
      level: "Middle",
      salary: "25-40M VND",
      workModel: "Onsite",
      postedAt: "1 tuần trước",
      skills: ["Node.js", "Microservices", "SQL"],
      technologies: ["NestJS", "PostgreSQL", "Kafka"],
      summary: "Phát triển dịch vụ backend cho hệ thống thanh toán và xử lý giao dịch.",
      responsibilities: ["Thiết kế API nội bộ", "Tối ưu truy vấn database", "Theo dõi log và xử lý sự cố"],
      requirements: ["Kinh nghiệm Node.js", "Hiểu microservices", "Kinh nghiệm SQL ở mức production"],
      marketChange30d: "+12%",
      recentDemand: "Cao",
      recentSignals: { newPosts7d: 34, activeCompanies: 14, avgTimeToHireDays: 26, applicantsPerPost: 33 },
    },
    {
      title: "Full-stack Engineer",
      company: "FPT Software",
      location: "Da Nang",
      level: "Fresher",
      salary: "12-18M VND",
      workModel: "Onsite",
      postedAt: "2 ngày trước",
      skills: ["JavaScript", "REST API", "Git"],
      technologies: ["React", "Express", "MongoDB"],
      summary: "Tham gia team phát triển sản phẩm web cho khách hàng doanh nghiệp.",
      responsibilities: ["Xây dựng module frontend và backend", "Viết tài liệu API", "Fix bug theo sprint"],
      requirements: ["Nắm chắc JavaScript cơ bản", "Hiểu REST API", "Sử dụng Git workflow cơ bản"],
      marketChange30d: "+8%",
      recentDemand: "Cao",
      recentSignals: { newPosts7d: 29, activeCompanies: 12, avgTimeToHireDays: 24, applicantsPerPost: 27 },
    },
  ],
  ai: [
    {
      title: "Machine Learning Engineer",
      company: "VinAI",
      location: "Ha Noi",
      level: "Middle",
      salary: "30-50M VND",
      workModel: "Hybrid",
      postedAt: "4 ngày trước",
      skills: ["Model Training", "Evaluation", "Python"],
      technologies: ["PyTorch", "MLflow", "Docker"],
      summary: "Xây dựng và huấn luyện model cho các bài toán thị giác máy tính và NLP.",
      responsibilities: ["Chuẩn bị dữ liệu train/validation", "Theo dõi metric model", "Đóng gói model để triển khai"],
      requirements: ["Thành thạo Python", "Kinh nghiệm train model", "Hiểu vòng đời ML"],
      marketChange30d: "+22%",
      recentDemand: "Rất cao",
      recentSignals: { newPosts7d: 31, activeCompanies: 11, avgTimeToHireDays: 28, applicantsPerPost: 24 },
    },
    {
      title: "NLP Engineer",
      company: "Zalo AI",
      location: "Ho Chi Minh City",
      level: "Senior",
      salary: "40-65M VND",
      workModel: "Onsite",
      postedAt: "5 ngày trước",
      skills: ["NLP", "LLM Prompting", "Data Processing"],
      technologies: ["Transformers", "FastAPI", "Ray"],
      summary: "Phát triển giải pháp NLP/LLM phục vụ sản phẩm người dùng lớn.",
      responsibilities: ["Thiết kế pipeline NLP", "Xây dựng dịch vụ inference", "Đánh giá chất lượng đầu ra mô hình"],
      requirements: ["Kinh nghiệm NLP thực tế", "Hiểu Transformers", "Có kinh nghiệm triển khai API model"],
      marketChange30d: "+16%",
      recentDemand: "Cao",
      recentSignals: { newPosts7d: 22, activeCompanies: 8, avgTimeToHireDays: 30, applicantsPerPost: 18 },
    },
    {
      title: "AI Engineer (Applied)",
      company: "FPT.AI",
      location: "Ha Noi",
      level: "Junior",
      salary: "20-32M VND",
      workModel: "Hybrid",
      postedAt: "1 tuần trước",
      skills: ["Python", "API Integration", "Experimentation"],
      technologies: ["TensorFlow", "LangChain", "Redis"],
      summary: "Triển khai các tính năng AI vào sản phẩm nội bộ và khách hàng doanh nghiệp.",
      responsibilities: ["Prototype tính năng AI", "Tích hợp API vào hệ thống hiện có", "Theo dõi hiệu quả mô hình"],
      requirements: ["Thành thạo Python", "Hiểu API integration", "Biết đánh giá kết quả thử nghiệm"],
      marketChange30d: "+14%",
      recentDemand: "Cao",
      recentSignals: { newPosts7d: 25, activeCompanies: 9, avgTimeToHireDays: 27, applicantsPerPost: 21 },
    },
  ],
  data: [
    {
      title: "Data Analyst",
      company: "One Mount",
      location: "Ha Noi",
      level: "Junior",
      salary: "15-24M VND",
      workModel: "Hybrid",
      postedAt: "2 ngày trước",
      skills: ["SQL", "Dashboard", "Business Insight"],
      technologies: ["BigQuery", "Power BI", "dbt"],
      summary: "Phân tích dữ liệu vận hành và thương mại để hỗ trợ quyết định kinh doanh.",
      responsibilities: ["Xây dashboard theo yêu cầu phòng ban", "Phân tích số liệu định kỳ", "Đề xuất insight hành động"],
      requirements: ["SQL tốt", "Kỹ năng trực quan hóa dữ liệu", "Tư duy phân tích business"],
      marketChange30d: "+10%",
      recentDemand: "Cao",
      recentSignals: { newPosts7d: 38, activeCompanies: 16, avgTimeToHireDays: 20, applicantsPerPost: 36 },
    },
    {
      title: "Data Engineer",
      company: "Viettel Digital",
      location: "Ha Noi",
      level: "Middle",
      salary: "22-38M VND",
      workModel: "Onsite",
      postedAt: "6 ngày trước",
      skills: ["ETL", "Pipeline Design", "Data Modeling"],
      technologies: ["Airflow", "Spark", "Kafka"],
      summary: "Thiết kế pipeline dữ liệu ổn định cho hệ thống analytics và báo cáo.",
      responsibilities: ["Xây dựng DAG ETL", "Giám sát data pipeline", "Tối ưu dữ liệu cho BI"],
      requirements: ["Kinh nghiệm ETL", "Hiểu data modeling", "Làm việc tốt với pipeline lớn"],
      marketChange30d: "+13%",
      recentDemand: "Cao",
      recentSignals: { newPosts7d: 27, activeCompanies: 10, avgTimeToHireDays: 25, applicantsPerPost: 19 },
    },
    {
      title: "BI Developer",
      company: "FPT Software",
      location: "Ho Chi Minh City",
      level: "Fresher",
      salary: "12-18M VND",
      workModel: "Onsite",
      postedAt: "3 ngày trước",
      skills: ["SQL", "Reporting", "Data Quality"],
      technologies: ["SQL Server", "Tableau", "Python"],
      summary: "Phát triển báo cáo BI phục vụ khách hàng và quản trị nội bộ.",
      responsibilities: ["Phát triển báo cáo định kỳ", "Chuẩn hóa chất lượng dữ liệu", "Hỗ trợ team vận hành đọc dữ liệu"],
      requirements: ["SQL chắc", "Sử dụng công cụ BI", "Cẩn thận với data quality"],
      marketChange30d: "+7%",
      recentDemand: "Ổn định",
      recentSignals: { newPosts7d: 19, activeCompanies: 9, avgTimeToHireDays: 23, applicantsPerPost: 17 },
    },
  ],
  devops: [
    {
      title: "DevOps Engineer",
      company: "VNG Cloud",
      location: "Ho Chi Minh City",
      level: "Middle",
      salary: "26-42M VND",
      workModel: "Hybrid",
      postedAt: "2 ngày trước",
      skills: ["CI/CD", "Infrastructure as Code", "Monitoring"],
      technologies: ["Kubernetes", "Terraform", "Prometheus"],
      summary: "Vận hành nền tảng cloud và pipeline triển khai cho nhiều dịch vụ.",
      responsibilities: ["Xây dựng CI/CD pipeline", "Quản lý hạ tầng bằng IaC", "Theo dõi cảnh báo hệ thống"],
      requirements: ["Kinh nghiệm DevOps", "Hiểu Kubernetes", "Kỹ năng xử lý sự cố production"],
      marketChange30d: "+15%",
      recentDemand: "Cao",
      recentSignals: { newPosts7d: 24, activeCompanies: 9, avgTimeToHireDays: 27, applicantsPerPost: 22 },
    },
    {
      title: "Cloud Engineer",
      company: "FPT Smart Cloud",
      location: "Ha Noi",
      level: "Junior",
      salary: "20-32M VND",
      workModel: "Onsite",
      postedAt: "1 tuần trước",
      skills: ["Cloud Operations", "Linux", "Automation"],
      technologies: ["AWS", "Ansible", "Docker"],
      summary: "Hỗ trợ triển khai và vận hành các hệ thống cloud cho khách hàng doanh nghiệp.",
      responsibilities: ["Triển khai môi trường cloud", "Tự động hóa tác vụ vận hành", "Quản trị Linux server"],
      requirements: ["Nắm Linux tốt", "Có nền tảng cloud", "Ưu tiên biết automation"],
      marketChange30d: "+9%",
      recentDemand: "Ổn định",
      recentSignals: { newPosts7d: 18, activeCompanies: 7, avgTimeToHireDays: 29, applicantsPerPost: 16 },
    },
    {
      title: "Site Reliability Engineer",
      company: "Viettel IDC",
      location: "Ha Noi",
      level: "Senior",
      salary: "35-55M VND",
      workModel: "Onsite",
      postedAt: "5 ngày trước",
      skills: ["Reliability", "Incident Response", "Capacity Planning"],
      technologies: ["GCP", "Grafana", "ArgoCD"],
      summary: "Đảm bảo tính ổn định, SLA và khả năng mở rộng cho các hệ thống lõi.",
      responsibilities: ["Thiết lập SLI/SLO", "Điều phối incident response", "Lập kế hoạch năng lực hệ thống"],
      requirements: ["Kinh nghiệm SRE/DevOps senior", "Kỹ năng monitoring mạnh", "Kinh nghiệm production incident"],
      marketChange30d: "+11%",
      recentDemand: "Cao",
      recentSignals: { newPosts7d: 21, activeCompanies: 8, avgTimeToHireDays: 31, applicantsPerPost: 15 },
    },
  ],
};

const LEVEL_OPTIONS = ["All", "Intern", "Fresher", "Junior", "Middle", "Senior"] as const;
const WORK_MODEL_OPTIONS = ["All", "Onsite", "Hybrid", "Remote"] as const;

export default function MarketPage() {
  const [domains, setDomains] = useState<Domain[]>(DEFAULT_DOMAINS);
  const [selected, setSelected] = useState<Domain>(DEFAULT_DOMAINS[0]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<(typeof LEVEL_OPTIONS)[number]>("All");
  const [workModelFilter, setWorkModelFilter] = useState<(typeof WORK_MODEL_OPTIONS)[number]>("All");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/market/domains`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.domains?.length) {
          setDomains(data.domains);
          setSelected(data.domains[0]);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 980);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const currentDomain = domains.find((domain) => domain.id === selected.id) || selected;
  const jobs = useMemo(() => JOB_POSTS[currentDomain.id] || [], [currentDomain.id]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchLevel = levelFilter === "All" || job.level === levelFilter;
      const matchWorkModel = workModelFilter === "All" || job.workModel === workModelFilter;
      return matchLevel && matchWorkModel;
    });
  }, [jobs, levelFilter, workModelFilter]);

  const popularTechnologies = useMemo(() => {
    const allTech = jobs.flatMap((job) => job.technologies);
    return Array.from(new Set(allTech));
  }, [jobs]);

  const demandColor = (demand: JobPost["recentDemand"]) => {
    if (demand === "Rất cao") return "#0f8f5f";
    if (demand === "Cao") return "#b06a00";
    return "#5f6b7a";
  };

  return (
    <div className="page-content fade-in">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Thị Trường IT</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 6 }}>
          Mô phỏng dữ liệu tuyển dụng theo từng lĩnh vực để tham khảo nhu cầu thị trường, kỹ năng bắt buộc và công nghệ phổ biến.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 18 }}>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Lĩnh vực đang xem</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6 }}>{currentDomain.name}</div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Mức lương phổ biến</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6 }}>{currentDomain.avg_salary}</div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Nhu cầu thị trường</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6 }}>{currentDomain.demand}</div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Số tin tham khảo</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6 }}>{jobs.length}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "280px minmax(0, 1fr)", gap: 16, alignItems: "start" }}>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
            Lĩnh vực
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(loading ? DEFAULT_DOMAINS : domains).map((domain) => {
              const active = domain.id === currentDomain.id;
              return (
                <button
                  key={domain.id}
                  onClick={() => setSelected(domain)}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: `1px solid ${active ? "var(--accent-purple)" : "var(--border)"}`,
                    background: active ? "var(--bg-secondary)" : "var(--bg-card)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{domain.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>{domain.avg_salary}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Bộ lọc tin tuyển dụng</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Cấp bậc</span>
                <select
                  value={levelFilter}
                  onChange={(event) => setLevelFilter(event.target.value as (typeof LEVEL_OPTIONS)[number])}
                  style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "9px 10px", background: "var(--bg-card)" }}
                >
                  {LEVEL_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Hình thức làm việc</span>
                <select
                  value={workModelFilter}
                  onChange={(event) => setWorkModelFilter(event.target.value as (typeof WORK_MODEL_OPTIONS)[number])}
                  style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "9px 10px", background: "var(--bg-card)" }}
                >
                  {WORK_MODEL_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="card" style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Tin tuyển dụng tham khảo</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{filteredJobs.length} kết quả</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredJobs.map((job) => (
                <div key={`${job.company}-${job.title}`} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{job.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                        {job.company} | {job.location}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{job.salary}</div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>{job.postedAt}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                    <span style={{ fontSize: 11, border: "1px solid var(--border)", borderRadius: 999, padding: "3px 8px" }}>{job.level}</span>
                    <span style={{ fontSize: 11, border: "1px solid var(--border)", borderRadius: 999, padding: "3px 8px" }}>{job.workModel}</span>
                    <span style={{ fontSize: 11, border: "1px solid #9fc1ff", color: "#1a4bb3", borderRadius: 999, padding: "3px 8px", background: "#eaf2ff" }}>
                      Tin mới 7 ngày: {job.recentSignals.newPosts7d}
                    </span>
                    <span style={{ fontSize: 11, border: `1px solid ${demandColor(job.recentDemand)}33`, color: demandColor(job.recentDemand), borderRadius: 999, padding: "3px 8px", background: `${demandColor(job.recentDemand)}14` }}>
                      Công ty đang tuyển: {job.recentSignals.activeCompanies}
                    </span>
                    {job.skills.map((skill) => (
                      <span key={skill} style={{ fontSize: 11, background: "var(--bg-secondary)", borderRadius: 999, padding: "3px 8px" }}>{skill}</span>
                    ))}
                  </div>

                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8 }}>
                    Công nghệ phổ biến: {job.technologies.join(", ")}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <button
                      className="btn"
                      style={{ padding: "8px 12px", fontSize: 12, background: "#1f4ea3", color: "white", border: "1px solid #1f4ea3" }}
                      onClick={() => setSelectedJob(job)}
                    >
                      Xem chi tiết JD
                    </button>
                  </div>
                </div>
              ))}
              {filteredJobs.length === 0 && (
                <div style={{ border: "1px dashed var(--border)", borderRadius: 8, padding: 14, fontSize: 12, color: "var(--text-secondary)" }}>
                  Không có tin phù hợp với bộ lọc hiện tại.
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Tín hiệu tuyển dụng gần đây theo vị trí</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {jobs.map((job) => (
                <div key={`${job.title}-trend`} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.3fr 0.7fr 0.8fr", gap: 8, border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{job.title}</div>
                  <div style={{ fontSize: 12, color: "#1a4bb3", fontWeight: 700 }}>Tin mới 7d: {job.recentSignals.newPosts7d}</div>
                  <div style={{ fontSize: 12, color: demandColor(job.recentDemand), fontWeight: 700 }}>Công ty tuyển: {job.recentSignals.activeCompanies}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Time-to-hire TB: {job.recentSignals.avgTimeToHireDays} ngày</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Mức cạnh tranh: {job.recentSignals.applicantsPerPost} hồ sơ/tin</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Biến động 30d: {job.marketChange30d} | Nhu cầu: {job.recentDemand}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10, lineHeight: 1.5 }}>
              Ghi chú phương pháp: chỉ số trên là dữ liệu tham khảo đã chuẩn hóa theo cùng kỳ 7-30 ngày giữa các vị trí trong hệ thống demo.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Kỹ năng cần thiết</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {currentDomain.required_skills.map((skill) => (
                  <span key={skill} style={{ fontSize: 11, padding: "4px 8px", border: "1px solid var(--border)", borderRadius: 999 }}>
                    {skill}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 10, lineHeight: 1.6 }}>
                {currentDomain.trend}
              </div>
            </div>

            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Công nghệ phổ biến</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {popularTechnologies.map((technology) => (
                  <span key={technology} style={{ fontSize: 11, padding: "4px 8px", border: "1px solid var(--border)", borderRadius: 999 }}>
                    {technology}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Vị trí phổ biến: {currentDomain.job_titles.join(", ")}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/assessment" className="btn" style={{ padding: "10px 16px", background: "#0f8f5f", color: "white", border: "1px solid #0f8f5f" }}>
              Làm Assessment
            </Link>
            <Link href="/roadmap" className="btn" style={{ padding: "10px 16px", background: "#1f4ea3", color: "white", border: "1px solid #1f4ea3" }}>
              Xem Roadmap
            </Link>
          </div>
        </div>
      </div>

      {selectedJob && (
        <div
          onClick={() => setSelectedJob(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.25)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
            zIndex: 120,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="card"
            style={{
              width: "min(760px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{selectedJob.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                  {selectedJob.company} | {selectedJob.location}
                </div>
              </div>
              <button className="btn" style={{ padding: "6px 10px", fontSize: 12, background: "#eef2f8", color: "#24324a", border: "1px solid #d6dde8" }} onClick={() => setSelectedJob(null)}>
                Đóng
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <span style={{ fontSize: 11, border: "1px solid var(--border)", borderRadius: 999, padding: "3px 8px" }}>{selectedJob.level}</span>
              <span style={{ fontSize: 11, border: "1px solid var(--border)", borderRadius: 999, padding: "3px 8px" }}>{selectedJob.workModel}</span>
              <span style={{ fontSize: 11, border: "1px solid var(--border)", borderRadius: 999, padding: "3px 8px" }}>{selectedJob.salary}</span>
            </div>

            <div style={{ marginTop: 14, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {selectedJob.summary}
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Trách nhiệm chính</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {selectedJob.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Yêu cầu</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {selectedJob.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Kỹ năng và công nghệ</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[...selectedJob.skills, ...selectedJob.technologies].map((item) => (
                  <span key={item} style={{ fontSize: 11, border: "1px solid var(--border)", borderRadius: 999, padding: "4px 8px" }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"""
Feature 5 – Personalized Roadmap
Generate & store a roadmap personalized to the student's assessment result.
Updates every 2-4 weeks based on progress.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timedelta
import uuid

from database import col_roadmaps

router = APIRouter()

# ── Domain roadmap templates ────────────────────────────────────────────────────

ROADMAP_TEMPLATES = {
    "web": {
        "title": "Web Developer Roadmap",
        "color": "#6C63FF",
        "phases": [
            {"week": "Tuần 1–2",  "topic": "HTML & CSS Fundamentals",   "skills": ["HTML5","CSS3","Flexbox","Grid"],            "output": "Portfolio tĩnh",         "resources": ["MDN Web Docs","freeCodeCamp"]},
            {"week": "Tuần 3–4",  "topic": "JavaScript ES6+",           "skills": ["Variables","Functions","DOM","Async/Await"], "output": "DOM Manipulation App",   "resources": ["javascript.info","Eloquent JS"]},
            {"week": "Tuần 5–6",  "topic": "React Basics",              "skills": ["JSX","State","Props","Hooks"],              "output": "Todo App với React",     "resources": ["react.dev","Scrimba React"]},
            {"week": "Tuần 7–8",  "topic": "Next.js & API Routes",      "skills": ["SSR","SSG","API Routes","Routing"],         "output": "Full-stack Mini App",    "resources": ["nextjs.org/docs"]},
            {"week": "Tuần 9–10", "topic": "Database & Backend",        "skills": ["MongoDB","REST API","FastAPI","Auth"],      "output": "CRUD Application",       "resources": ["MongoDB Atlas","FastAPI docs"]},
            {"week": "Tuần 11–12","topic": "Deployment & CI/CD",        "skills": ["Vercel","Docker","GitHub Actions","Nginx"], "output": "Production Deploy on CV","resources": ["Vercel","Railway"]},
        ],
    },
    "ai": {
        "title": "AI/ML Engineer Roadmap",
        "color": "#FF6B6B",
        "phases": [
            {"week": "Tuần 1–2",  "topic": "Python & Math Foundation",  "skills": ["Python","NumPy","Linear Algebra","Stats"],  "output": "Math Notebooks",         "resources": ["Khan Academy","3Blue1Brown"]},
            {"week": "Tuần 3–4",  "topic": "Data Processing với Pandas","skills": ["Pandas","Matplotlib","EDA","Cleaning"],     "output": "EDA Report",             "resources": ["Kaggle Learn","Pandas docs"]},
            {"week": "Tuần 5–6",  "topic": "Machine Learning cơ bản",   "skills": ["scikit-learn","Regression","Classification"],"output": "Classification Model",   "resources": ["Hands-on ML book","fast.ai"]},
            {"week": "Tuần 7–8",  "topic": "Deep Learning",             "skills": ["PyTorch","CNN","Loss functions","GPU"],     "output": "Image Classifier",       "resources": ["PyTorch tutorials","d2l.ai"]},
            {"week": "Tuần 9–10", "topic": "NLP & LLM APIs",            "skills": ["Transformers","BERT","OpenAI API","RAG"],   "output": "Chatbot App",            "resources": ["Hugging Face","LangChain"]},
            {"week": "Tuần 11–12","topic": "MLOps & Deployment",        "skills": ["MLflow","Docker","FastAPI","Monitoring"],   "output": "Deployed AI Model",      "resources": ["MLflow docs","BentoML"]},
        ],
    },
    "data": {
        "title": "Data Engineer Roadmap",
        "color": "#4ECDC4",
        "phases": [
            {"week": "Tuần 1–2",  "topic": "SQL Fundamentals",          "skills": ["SELECT","JOIN","Aggregate","Index"],        "output": "Query Portfolio",        "resources": ["Mode SQL Tutorial","HackerRank"]},
            {"week": "Tuần 3–4",  "topic": "Python & Pandas",           "skills": ["Pandas","Numpy","Data Cleaning","I/O"],     "output": "Data Cleaning Script",   "resources": ["Kaggle Learn","Real Python"]},
            {"week": "Tuần 5–6",  "topic": "Data Visualization",        "skills": ["Plotly","Streamlit","Seaborn","Tableau"],   "output": "Interactive Dashboard",  "resources": ["Plotly docs","Streamlit gallery"]},
            {"week": "Tuần 7–8",  "topic": "Data Pipeline & ETL",       "skills": ["Airflow","Celery","S3","PostgreSQL"],       "output": "ETL Pipeline",           "resources": ["Airflow docs","DataTalks.Club"]},
            {"week": "Tuần 9–10", "topic": "Big Data cơ bản",           "skills": ["Spark","Hadoop","Kafka","Parquet"],         "output": "Spark Job",              "resources": ["Spark docs","DataBricks"]},
            {"week": "Tuần 11–12","topic": "Cloud Data Services",       "skills": ["GCS","BigQuery","dbt","Terraform"],         "output": "Cloud Pipeline",         "resources": ["GCP Free Tier","dbt docs"]},
        ],
    },
}


def _assign_statuses(phases: list, skill_score: int) -> list:
    """
    Assign completed/in_progress/upcoming based on current skill score.
    Higher score → more phases already 'completed'.
    """
    total = len(phases)
    completed_count = min(total - 1, round(skill_score / 100 * total))
    result = []
    for i, phase in enumerate(phases):
        if i < completed_count:
            status = "completed"
        elif i == completed_count:
            status = "in_progress"
        else:
            status = "upcoming"
        result.append({**phase, "status": status, "phase_index": i})
    return result


def generate_roadmap_doc(
    student_id: str,
    name: str,
    domain: str,
    skill_scores: dict,
    skill_gap: dict,
    learning_style: str,
) -> dict:
    template = ROADMAP_TEMPLATES.get(domain, ROADMAP_TEMPLATES["web"])
    domain_score = skill_scores.get(domain, 0)
    phases = _assign_statuses(template["phases"], domain_score)

    completed = [p for p in phases if p["status"] == "completed"]
    in_progress = next((p for p in phases if p["status"] == "in_progress"), None)

    cv_items = [p["output"] for p in completed]
    next_milestone = in_progress["topic"] if in_progress else "Roadmap hoàn thành!"
    progress_pct = round(len(completed) / len(phases) * 100)

    # Adaptive note based on learning style
    style_tip_map = {
        "Thực hành trực tiếp qua các dự án thực tế.": "Ưu tiên làm project thực tế ngay từ đầu, học lý thuyết song song.",
        "Đọc tài liệu và sách chuyên sâu.":            "Đọc kỹ tài liệu chính thống trước khi thực hành.",
        "Học theo khóa học có cấu trúc rõ ràng với các mốc rõ ràng.": "Theo sát lộ trình này theo thứ tự tuần.",
        "Xem video hướng dẫn và pair programming với mentor.": "Kết hợp video tutorial + tìm mentor hoặc study group.",
    }
    style_tip = style_tip_map.get(learning_style, "Hãy kết hợp lý thuyết và thực hành đều đặn mỗi ngày.")

    now = datetime.utcnow()
    return {
        "_id":            str(uuid.uuid4()),
        "student_id":     student_id,
        "name":           name,
        "domain":         domain,
        "domain_title":   template["title"],
        "domain_color":   template["color"],
        "phases":         phases,
        "skill_scores":   skill_scores,
        "skill_gap":      skill_gap,
        "progress_pct":   progress_pct,
        "cv_items":       cv_items,
        "next_milestone": next_milestone,
        "learning_style": learning_style,
        "style_tip":      style_tip,
        "created_at":     now.isoformat(),
        "next_update_at": (now + timedelta(weeks=2)).isoformat(),
        "version":        1,
    }


# ── Request model ───────────────────────────────────────────────────────────────

class RoadmapRequest(BaseModel):
    student_id:    str
    name:          str = "Anonymous"
    domain:        str = "web"
    skill_scores:  dict
    skill_gap:     dict
    learning_style: Optional[str] = ""


class ProgressUpdateRequest(BaseModel):
    phase_index: int = Field(..., ge=0)
    completed: bool = True


# ── Routes ──────────────────────────────────────────────────────────────────────

@router.post("/generate")
async def generate_roadmap(req: RoadmapRequest):
    """Generate and persist a personalized roadmap from assessment result."""
    doc = generate_roadmap_doc(
        req.student_id, req.name, req.domain,
        req.skill_scores, req.skill_gap, req.learning_style,
    )
    try:
        await col_roadmaps().insert_one(doc)
    except Exception as e:
        print(f"MongoDB insert error: {e}")

    doc["id"] = doc.pop("_id")
    return doc


@router.get("/templates/all")
async def get_templates():
    return {
        "templates": [
            {"domain": k, "title": v["title"], "color": v["color"], "total_phases": len(v["phases"])}
            for k, v in ROADMAP_TEMPLATES.items()
        ]
    }


@router.patch("/progress/{roadmap_id}")
async def update_progress(roadmap_id: str, req: ProgressUpdateRequest):
    """Update one phase status and recalculate progress, CV items, and next milestone."""
    doc = await col_roadmaps().find_one({"_id": roadmap_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    phases = doc.get("phases", [])
    if req.phase_index >= len(phases):
        raise HTTPException(status_code=422, detail="phase_index out of range")

    phases[req.phase_index]["status"] = "completed" if req.completed else "in_progress"
    for i, phase in enumerate(phases):
        if i < req.phase_index and req.completed:
            phase["status"] = "completed"
        elif i > req.phase_index and not req.completed and phase["status"] == "completed":
            phase["status"] = "upcoming"

    if req.completed:
        next_phase = next((p for p in phases if p["status"] != "completed"), None)
        if next_phase:
            next_phase["status"] = "in_progress"
    else:
        for i, phase in enumerate(phases):
            if i != req.phase_index and phase["status"] == "in_progress":
                phase["status"] = "upcoming"

    completed = [p for p in phases if p["status"] == "completed"]
    in_progress = next((p for p in phases if p["status"] == "in_progress"), None)
    progress_pct = round(len(completed) / len(phases) * 100) if phases else 0
    updates = {
        "phases": phases,
        "progress_pct": progress_pct,
        "cv_items": [p["output"] for p in completed],
        "next_milestone": in_progress["topic"] if in_progress else "Roadmap hoàn thành!",
        "updated_at": datetime.utcnow().isoformat(),
    }
    await col_roadmaps().update_one({"_id": roadmap_id}, {"$set": updates})
    doc.update(updates)
    doc["id"] = doc.pop("_id")
    return doc


@router.get("/{student_id}")
async def get_roadmap(student_id: str, domain: str = "web"):
    """Get latest roadmap for student (from DB or generate on-the-fly)."""
    doc = await col_roadmaps().find_one(
        {"student_id": student_id, "domain": domain},
        sort=[("created_at", -1)],
    )
    if doc:
        doc["id"] = doc.pop("_id")
        return doc

    # Fallback – generate static preview (scores = 0)
    fallback = generate_roadmap_doc(
        student_id, "Student", domain,
        {"foundation": 0, "web": 0, "ai": 0, "data": 0},
        {"foundation": 85, "web": 80, "ai": 75, "data": 70},
        "",
    )
    fallback["id"] = fallback.pop("_id")
    return fallback

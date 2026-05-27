from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

from database import col_domains

router = APIRouter()


# ── Pydantic schema for validation ─────────────────────────────────────────────

class DomainSchema(BaseModel):
    id: str = Field(..., min_length=1, max_length=50, pattern=r"^[a-z_]+$")
    name: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=10, max_length=500)
    required_skills: List[str] = Field(..., min_length=1)
    job_titles: List[str] = Field(..., min_length=1)
    demand: str = Field(..., pattern=r"^(Rất cao|Cao|Khá cao|Trung bình|Thấp)$")
    avg_salary: str = Field(..., min_length=3, max_length=50)
    trend: str = Field(..., min_length=10, max_length=300)


DEFAULT_DOMAINS = [
    {
        "_id": "web",
        "name": "Web Developer",
        "description": "Xây dựng frontend, backend và sản phẩm web full-stack. Lĩnh vực có nhu cầu tuyển dụng cao nhất tại Việt Nam hiện nay.",
        "required_skills": ["HTML/CSS", "JavaScript", "React", "Node.js", "REST API", "Git"],
        "job_titles": ["Frontend Developer", "Backend Developer", "Full-stack Developer"],
        "demand": "Rất cao",
        "avg_salary": "15-25M VND",
        "trend": "Doanh nghiệp cần lập trình viên có khả năng ship sản phẩm nhanh và hiểu API.",
    },
    {
        "_id": "ai",
        "name": "AI / Machine Learning Engineer",
        "description": "Phát triển model ML, ứng dụng AI và tích hợp LLM vào sản phẩm. Lĩnh vực tăng trưởng mạnh nhất trong 3 năm qua.",
        "required_skills": ["Python", "Machine Learning", "PyTorch/TensorFlow", "NLP", "MLOps"],
        "job_titles": ["ML Engineer", "AI Engineer", "NLP Engineer"],
        "demand": "Cao",
        "avg_salary": "20-40M VND",
        "trend": "Nhu cầu tăng mạnh ở các sản phẩm có tự động hóa, chatbot và phân tích dữ liệu.",
    },
    {
        "_id": "data",
        "name": "Data Analyst / Data Engineer",
        "description": "Thu thập, xử lý, phân tích và trực quan hóa dữ liệu phục vụ quyết định kinh doanh.",
        "required_skills": ["SQL", "Python", "Pandas", "Visualization", "Airflow", "Cloud"],
        "job_titles": ["Data Analyst", "Data Engineer", "BI Developer"],
        "demand": "Cao",
        "avg_salary": "12-22M VND",
        "trend": "Các team cần dashboard, pipeline và phân tích dữ liệu đáng tin cậy.",
    },
    {
        "_id": "devops",
        "name": "DevOps / Cloud Engineer",
        "description": "Tự động hóa triển khai, vận hành hạ tầng cloud và giám sát hệ thống.",
        "required_skills": ["Linux", "Docker", "CI/CD", "Cloud", "Monitoring", "Networking"],
        "job_titles": ["DevOps Engineer", "Cloud Engineer", "SRE"],
        "demand": "Khá cao",
        "avg_salary": "18-35M VND",
        "trend": "Nhu cầu ổn định ở các hệ thống cần scale, bảo mật và uptime cao.",
    },
]


def _public_domain(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = doc.pop("_id")
    return doc


@router.get("/domains")
async def list_domains():
    docs = []
    async for doc in col_domains().find({}).sort("name", 1):
        docs.append(_public_domain(doc))
    if docs:
        return {"domains": docs, "total": len(docs), "source": "database"}
    return {"domains": [_public_domain(d) for d in DEFAULT_DOMAINS], "total": len(DEFAULT_DOMAINS), "source": "default"}


@router.get("/domains/{domain_id}")
async def get_domain(domain_id: str):
    doc = await col_domains().find_one({"_id": domain_id})
    if doc:
        return _public_domain(doc)
    fallback = next((d for d in DEFAULT_DOMAINS if d["_id"] == domain_id), None)
    if not fallback:
        raise HTTPException(status_code=404, detail=f"Domain '{domain_id}' not found")
    return _public_domain(fallback)


@router.post("/domains", status_code=201)
async def create_domain(domain: DomainSchema):
    """Create or update a domain entry (upsert by id)."""
    existing = await col_domains().find_one({"_id": domain.id})
    if existing:
        raise HTTPException(status_code=409, detail=f"Domain '{domain.id}' already exists. Use PUT to update.")
    doc = domain.model_dump()
    doc["_id"] = doc.pop("id")
    await col_domains().insert_one(doc)
    return _public_domain(doc)


@router.post("/domains/seed", status_code=201)
async def seed_domains():
    """Seed default domains into database if empty."""
    count = await col_domains().count_documents({})
    if count > 0:
        return {"message": f"Already seeded ({count} domains exist)", "seeded": 0}
    await col_domains().insert_many(DEFAULT_DOMAINS)
    return {"message": "Seeded default domains", "seeded": len(DEFAULT_DOMAINS)}

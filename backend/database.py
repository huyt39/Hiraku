from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB  = os.getenv("MONGODB_DB", "skillbridge")

# Lazy singleton — safe for both local uvicorn and Vercel serverless
_client: AsyncIOMotorClient = None

DEFAULT_DOMAINS = [
    {"_id": "web",    "name": "Web Developer",           "description": "Xây dựng frontend, backend và sản phẩm web full-stack. Lĩnh vực có nhu cầu tuyển dụng cao nhất tại Việt Nam.", "required_skills": ["HTML/CSS","JavaScript","React","Node.js","REST API","Git"],          "job_titles": ["Frontend Developer","Backend Developer","Full-stack Developer"], "demand": "Rất cao", "avg_salary": "15-25M VND", "trend": "Doanh nghiệp cần lập trình viên có khả năng ship sản phẩm nhanh và hiểu API."},
    {"_id": "ai",     "name": "AI / ML Engineer",        "description": "Phát triển model ML, ứng dụng AI và tích hợp LLM vào sản phẩm. Lĩnh vực tăng trưởng mạnh nhất trong 3 năm qua.", "required_skills": ["Python","Machine Learning","PyTorch/TensorFlow","NLP","MLOps"], "job_titles": ["ML Engineer","AI Engineer","NLP Engineer"],                       "demand": "Cao",    "avg_salary": "20-40M VND", "trend": "Nhu cầu tăng mạnh ở các sản phẩm có tự động hóa, chatbot và phân tích dữ liệu."},
    {"_id": "data",   "name": "Data Analyst / Engineer", "description": "Thu thập, xử lý, phân tích và trực quan hóa dữ liệu phục vụ quyết định kinh doanh.", "required_skills": ["SQL","Python","Pandas","Visualization","Airflow","Cloud"],         "job_titles": ["Data Analyst","Data Engineer","BI Developer"],                    "demand": "Cao",    "avg_salary": "12-22M VND", "trend": "Các team cần dashboard, pipeline và phân tích dữ liệu đáng tin cậy."},
    {"_id": "devops", "name": "DevOps / Cloud Engineer", "description": "Tự động hóa triển khai, vận hành hạ tầng cloud và giám sát hệ thống.", "required_skills": ["Linux","Docker","CI/CD","Cloud","Monitoring","Networking"],       "job_titles": ["DevOps Engineer","Cloud Engineer","SRE"],                         "demand": "Khá cao","avg_salary": "18-35M VND", "trend": "Nhu cầu ổn định ở các hệ thống cần scale, bảo mật và uptime cao."},
]


def _get_client() -> AsyncIOMotorClient:
    """Return (or lazily create) the singleton Motor client."""
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(
            MONGODB_URL,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
        )
    return _client


def get_db():
    return _get_client()[MONGODB_DB]


# ── Collection helpers ──────────────────────────────────────────────────────
def col_students():    return get_db()["students"]
def col_assessments(): return get_db()["assessments"]
def col_roadmaps():    return get_db()["roadmaps"]
def col_results():     return get_db()["assessment_results"]
def col_domains():     return get_db()["domains"]


# ── Startup tasks (called by lifespan in local dev, or lazily on Vercel) ────
async def setup_db():
    """Create indexes and seed domain data. Safe to call multiple times."""
    db = get_db()
    try:
        await db["assessment_results"].create_index([("student_id", 1), ("created_at", -1)])
        await db["roadmaps"].create_index([("student_id", 1), ("domain", 1), ("created_at", -1)])
        await db["students"].create_index([("email", 1)], unique=True, sparse=True)

        count = await db["domains"].count_documents({})
        if count == 0:
            await db["domains"].insert_many(DEFAULT_DOMAINS)
            print(f"🌱 Seeded {len(DEFAULT_DOMAINS)} default domains")
    except Exception as e:
        print(f"⚠️  DB setup warning: {e}")  # Non-fatal


# ── Lifespan hooks (used by local uvicorn / make dev) ───────────────────────
async def connect_db():
    _get_client()  # Ensure client is created
    print(f"✅ MongoDB client ready: {MONGODB_DB}")
    await setup_db()


async def close_db():
    global _client
    if _client:
        _client.close()
        _client = None
        print("🔌 MongoDB connection closed")

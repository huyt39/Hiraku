from fastapi import APIRouter
from typing import List

router = APIRouter()

MINI_PROJECTS = [
    {
        "id": 1,
        "domain": "Web",
        "title": "Task Manager App",
        "description": "Xây dựng ứng dụng quản lý công việc với React và Node.js. Bao gồm CRUD operations, user authentication và real-time updates.",
        "difficulty": "Beginner",
        "duration": "2 tuần",
        "skills": ["React", "Node.js", "MongoDB", "REST API"],
        "output": "Full-stack web app deploy lên Vercel",
        "enrolled": 42,
        "color": "#6C63FF"
    },
    {
        "id": 2,
        "domain": "Web",
        "title": "E-commerce Frontend",
        "description": "Clone giao diện e-commerce với Next.js, tích hợp Stripe payment và responsive design.",
        "difficulty": "Intermediate",
        "duration": "3 tuần",
        "skills": ["Next.js", "TypeScript", "Stripe", "Tailwind"],
        "output": "E-commerce site trên CV",
        "enrolled": 28,
        "color": "#6C63FF"
    },
    {
        "id": 3,
        "domain": "AI",
        "title": "Sentiment Analysis Tool",
        "description": "Xây dựng tool phân tích cảm xúc review sản phẩm với Python, scikit-learn và deploy API với FastAPI.",
        "difficulty": "Beginner",
        "duration": "2 tuần",
        "skills": ["Python", "scikit-learn", "FastAPI", "NLP"],
        "output": "AI API với documentation",
        "enrolled": 35,
        "color": "#FF6B6B"
    },
    {
        "id": 4,
        "domain": "AI",
        "title": "Image Classification App",
        "description": "Train CNN model nhận diện 10 loại vật thể, tích hợp với web app để user upload ảnh và nhận kết quả.",
        "difficulty": "Intermediate",
        "duration": "3 tuần",
        "skills": ["PyTorch", "CNN", "Flask", "Computer Vision"],
        "output": "Deployed AI Web App",
        "enrolled": 19,
        "color": "#FF6B6B"
    },
    {
        "id": 5,
        "domain": "Data",
        "title": "Sales Dashboard",
        "description": "Phân tích dataset bán hàng thực tế, xây dựng dashboard interactive với Plotly và Streamlit.",
        "difficulty": "Beginner",
        "duration": "1 tuần",
        "skills": ["Python", "Pandas", "Plotly", "Streamlit"],
        "output": "Interactive Dashboard",
        "enrolled": 56,
        "color": "#4ECDC4"
    },
    {
        "id": 6,
        "domain": "Data",
        "title": "ETL Pipeline với Airflow",
        "description": "Thiết kế và triển khai ETL pipeline tự động thu thập, xử lý và lưu trữ dữ liệu từ nhiều nguồn.",
        "difficulty": "Advanced",
        "duration": "4 tuần",
        "skills": ["Airflow", "PostgreSQL", "Docker", "Python"],
        "output": "Production-ready Pipeline",
        "enrolled": 12,
        "color": "#4ECDC4"
    },
]

@router.get("/")
def get_projects(domain: str = None, difficulty: str = None):
    projects = MINI_PROJECTS
    if domain:
        projects = [p for p in projects if p["domain"].lower() == domain.lower()]
    if difficulty:
        projects = [p for p in projects if p["difficulty"].lower() == difficulty.lower()]
    return {"projects": projects, "total": len(projects)}

@router.get("/{project_id}")
def get_project(project_id: int):
    project = next((p for p in MINI_PROJECTS if p["id"] == project_id), None)
    if not project:
        return {"error": "Project not found"}
    return project

from fastapi import APIRouter

router = APIRouter()

@router.get("/{student_id}")
def get_dashboard(student_id: str):
    return {
        "student_id": student_id,
        "name": "Nguyễn Văn A",
        "target_domain": "Web Developer",
        "overall_progress": 45,
        "assessment_done": True,
        "skill_scores": {
            "Foundation": 80,
            "Web Development": 55,
            "AI/ML": 30,
            "Data Engineering": 40,
            "Soft Skills": 70
        },
        "market_gap": {
            "Foundation": 20,
            "Web Development": 45,
            "AI/ML": 70,
            "Data Engineering": 60,
            "Soft Skills": 30
        },
        "recent_activity": [
            {"date": "2024-05-20", "action": "Hoàn thành module React Basics", "type": "milestone"},
            {"date": "2024-05-18", "action": "Nộp bài Task Manager App", "type": "project"},
            {"date": "2024-05-15", "action": "Cập nhật roadmap tuần 2", "type": "roadmap"},
        ],
        "cv_ready_items": 3,
        "next_milestone": "Next.js & API Routes",
        "streak_days": 12
    }

@router.get("/")
def get_overview():
    return {
        "total_students": 234,
        "active_today": 48,
        "projects_completed": 127,
        "avg_progress": 52
    }

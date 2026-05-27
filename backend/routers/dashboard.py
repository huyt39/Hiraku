from fastapi import APIRouter

from database import col_results, col_roadmaps, col_students

router = APIRouter()


SKILL_LABELS = {
    "foundation": "Foundation",
    "web": "Web Development",
    "ai": "AI/ML",
    "data": "Data Engineering",
}


def _fallback_dashboard(student_id: str):
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
        },
        "market_gap": {
            "Foundation": 20,
            "Web Development": 45,
            "AI/ML": 70,
            "Data Engineering": 60,
        },
        "recent_activity": [
            {"date": "2024-05-20", "action": "Hoàn thành module React Basics", "type": "milestone"},
            {"date": "2024-05-18", "action": "Nộp bài Task Manager App", "type": "project"},
            {"date": "2024-05-15", "action": "Cập nhật roadmap tuần 2", "type": "roadmap"},
        ],
        "cv_ready_items": 3,
        "next_milestone": "Next.js & API Routes",
        "streak_days": 12,
    }


@router.get("/{student_id}")
async def get_dashboard(student_id: str):
    student = await col_students().find_one({"_id": student_id})
    latest_result = await col_results().find_one(
        {"student_id": student_id},
        sort=[("created_at", -1)],
    )
    latest_roadmap = await col_roadmaps().find_one(
        {"student_id": student_id},
        sort=[("updated_at", -1), ("created_at", -1)],
    )

    if not latest_result and not latest_roadmap and not student:
        return _fallback_dashboard(student_id)

    raw_scores = (latest_result or {}).get("skill_scores", {})
    raw_gap = (latest_result or {}).get("skill_gap", {})
    skill_scores = {SKILL_LABELS.get(k, k): v for k, v in raw_scores.items()}
    market_gap = {SKILL_LABELS.get(k, k): v for k, v in raw_gap.items()}

    activities = []
    if latest_result:
        activities.append({
            "date": latest_result.get("created_at"),
            "action": "Hoàn thành bài self-assessment",
            "type": "assessment",
        })
    if latest_roadmap:
        activities.append({
            "date": latest_roadmap.get("updated_at") or latest_roadmap.get("created_at"),
            "action": f"Cập nhật roadmap {latest_roadmap.get('domain_title', '')}".strip(),
            "type": "roadmap",
        })

    return {
        "student_id": student_id,
        "name": (student or {}).get("name") or (latest_result or {}).get("name") or "Student",
        "target_domain": (latest_result or {}).get("target_domain") or (student or {}).get("target_domain", "undecided"),
        "overall_progress": (latest_roadmap or {}).get("progress_pct", 0),
        "assessment_done": latest_result is not None,
        "skill_scores": skill_scores,
        "market_gap": market_gap,
        "recent_activity": activities,
        "cv_ready_items": len((latest_roadmap or {}).get("cv_items", [])),
        "next_milestone": (latest_roadmap or {}).get("next_milestone", "Làm bài assessment để tạo roadmap"),
        "streak_days": 0,
    }


@router.get("/")
async def get_overview():
    total_students = await col_students().count_documents({})
    projects_completed = await col_roadmaps().count_documents({"progress_pct": 100})
    roadmaps = []
    async for doc in col_roadmaps().find({}, {"progress_pct": 1}):
        roadmaps.append(doc.get("progress_pct", 0))
    avg_progress = round(sum(roadmaps) / len(roadmaps)) if roadmaps else 0
    return {
        "total_students": total_students,
        "active_today": 0,
        "projects_completed": projects_completed,
        "avg_progress": avg_progress,
    }

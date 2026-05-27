from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Union
from datetime import datetime
import uuid

from database import col_assessments, col_results
from scoring import compute_scores

router = APIRouter()

# ── Pydantic models ────────────────────────────────────────────────────────────

class AssessmentAnswer(BaseModel):
    question_id: int
    answer: Union[str, List[str]]   # single or multi-select

class AssessmentSubmission(BaseModel):
    student_id: str = Field(..., min_length=1)
    name: str = "Anonymous"
    answers: List[AssessmentAnswer] = Field(..., min_length=1)

# ── Static question bank ────────────────────────────────────────────────────────

QUESTIONS = [
    {
        "id": 1, "module": "MODULE 1: FOUNDATION", "module_order": 1, "total_in_module": 3,
        "question": "Bạn đã học lập trình được bao lâu?",
        "options": ["Dưới 6 tháng", "6 tháng – 1 năm", "1 – 2 năm", "Trên 2 năm"],
        "type": "single",
    },
    {
        "id": 2, "module": "MODULE 1: FOUNDATION", "module_order": 1, "total_in_module": 3,
        "question": "Bạn thích học kỹ năng mới theo cách nào?",
        "options": [
            "Học theo khóa học có cấu trúc rõ ràng với các mốc rõ ràng.",
            "Thực hành trực tiếp qua các dự án thực tế.",
            "Đọc tài liệu và sách chuyên sâu.",
            "Xem video hướng dẫn và pair programming với mentor.",
        ],
        "type": "single",
    },
    {
        "id": 3, "module": "MODULE 1: FOUNDATION", "module_order": 1, "total_in_module": 3,
        "question": "Mục tiêu nghề nghiệp sau khi ra trường?",
        "options": [
            "Web Developer / Frontend / Backend",
            "AI / Machine Learning Engineer",
            "Data Analyst / Data Engineer",
            "DevOps / Cloud Engineer",
            "Chưa quyết định",
        ],
        "type": "single",
    },
    {
        "id": 4, "module": "MODULE 2: TECHNICAL SKILLS", "module_order": 2, "total_in_module": 3,
        "question": "Bạn đã làm việc với ngôn ngữ lập trình nào? (Chọn tất cả)",
        "options": ["Python", "JavaScript / TypeScript", "Java", "C / C++", "Go / Rust", "Chưa biết ngôn ngữ nào"],
        "type": "multiple",
    },
    {
        "id": 5, "module": "MODULE 2: TECHNICAL SKILLS", "module_order": 2, "total_in_module": 3,
        "question": "Bạn có kinh nghiệm với cơ sở dữ liệu không?",
        "options": [
            "Chưa từng dùng",
            "SQL cơ bản (SELECT, INSERT)",
            "SQL nâng cao (JOIN, Index, Transaction)",
            "NoSQL (MongoDB, Redis) hoặc cả hai",
        ],
        "type": "single",
    },
    {
        "id": 6, "module": "MODULE 2: TECHNICAL SKILLS", "module_order": 2, "total_in_module": 3,
        "question": "Mức độ hiểu biết về Git / Version Control của bạn?",
        "options": [
            "Chưa biết Git",
            "Biết commit, push cơ bản",
            "Biết branch, merge, Pull Request",
            "Thành thạo Git workflow trong team",
        ],
        "type": "single",
    },
    {
        "id": 7, "module": "MODULE 3: DOMAIN KNOWLEDGE", "module_order": 3, "total_in_module": 2,
        "question": "Bạn đã từng xây dựng dự án Web chưa?",
        "options": [
            "Chưa từng",
            "Đã làm HTML/CSS tĩnh",
            "Đã dùng React/Vue/Angular",
            "Đã deploy lên production",
        ],
        "type": "single",
    },
    {
        "id": 8, "module": "MODULE 3: DOMAIN KNOWLEDGE", "module_order": 3, "total_in_module": 2,
        "question": "Kiến thức về AI/ML của bạn ở mức nào?",
        "options": [
            "Chưa biết gì",
            "Hiểu khái niệm cơ bản",
            "Đã dùng scikit-learn, pandas",
            "Đã train và deploy model AI",
        ],
        "type": "single",
    },
]

QUESTION_BY_ID = {q["id"]: q for q in QUESTIONS}


def validate_submission_answers(answers: List[AssessmentAnswer]) -> None:
    seen = set()
    for item in answers:
        question = QUESTION_BY_ID.get(item.question_id)
        if not question:
            raise HTTPException(status_code=422, detail=f"Unknown question_id: {item.question_id}")
        if item.question_id in seen:
            raise HTTPException(status_code=422, detail=f"Duplicate answer for question_id: {item.question_id}")
        seen.add(item.question_id)

        valid_options = set(question["options"])
        if question["type"] == "single":
            if not isinstance(item.answer, str) or item.answer not in valid_options:
                raise HTTPException(status_code=422, detail=f"Invalid answer for question_id: {item.question_id}")
        else:
            if not isinstance(item.answer, list) or not item.answer:
                raise HTTPException(status_code=422, detail=f"question_id {item.question_id} requires at least one selected option")
            invalid = [opt for opt in item.answer if opt not in valid_options]
            if invalid:
                raise HTTPException(status_code=422, detail=f"Invalid option(s) for question_id {item.question_id}: {invalid}")
            if "Chưa biết ngôn ngữ nào" in item.answer and len(item.answer) > 1:
                raise HTTPException(status_code=422, detail="'Chưa biết ngôn ngữ nào' cannot be combined with other languages")

    missing = sorted(set(QUESTION_BY_ID) - seen)
    if missing:
        raise HTTPException(status_code=422, detail=f"Missing answers for question_id(s): {missing}")

# ── Routes ──────────────────────────────────────────────────────────────────────

@router.get("/questions")
async def get_questions():
    return {"questions": QUESTIONS, "total": len(QUESTIONS)}

@router.get("/market-requirements")
async def get_market_requirements():
    return {
        "web_developer":  {"skills": ["HTML/CSS", "JavaScript", "React", "Node.js", "Git", "REST API"], "avg_salary": "15–25M VND", "demand": "Rất cao"},
        "ai_engineer":    {"skills": ["Python", "Machine Learning", "Deep Learning", "PyTorch/TensorFlow", "MLOps"], "avg_salary": "20–40M VND", "demand": "Cao"},
        "data_engineer":  {"skills": ["SQL", "Python", "Pandas", "Airflow", "Spark", "Cloud"], "avg_salary": "12–22M VND", "demand": "Cao"},
    }

@router.post("/submit")
async def submit_assessment(submission: AssessmentSubmission):
    validate_submission_answers(submission.answers)

    # Build answers dict: {question_id: answer}
    answers_dict = {str(a.question_id): a.answer for a in submission.answers}

    # Run scoring engine
    result = compute_scores(answers_dict)

    result_id = str(uuid.uuid4())
    doc = {
        "_id":           result_id,
        "student_id":    submission.student_id,
        "name":          submission.name,
        "answers":       answers_dict,
        "skill_scores":  result["skill_scores"],
        "skill_gap":     result["skill_gap"],
        "target_domain": result["target_domain"],
        "learning_style":result["learning_style"],
        "overall_score": result["overall_score"],
        "strengths":     result["strengths"],
        "weaknesses":    result["weaknesses"],
        "market_requirements": result["market_requirements"],
        "created_at":    datetime.utcnow().isoformat(),
    }

    try:
        await col_results().insert_one(doc)
    except Exception as e:
        print(f"MongoDB insert error: {e}")  # non-fatal in POC

    return {
        "result_id":     result_id,
        "student_id":    submission.student_id,
        **result,
        "message": "Assessment completed successfully",
    }

@router.get("/result/{result_id}")
async def get_result(result_id: str):
    doc = await col_results().find_one({"_id": result_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Result not found")
    doc["id"] = doc.pop("_id")
    return doc

@router.get("/history/{student_id}")
async def get_history(student_id: str):
    cursor = col_results().find({"student_id": student_id}).sort("created_at", -1).limit(10)
    docs = []
    async for doc in cursor:
        doc["id"] = doc.pop("_id")
        docs.append(doc)
    return {"history": docs}

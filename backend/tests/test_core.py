import pytest
from fastapi import HTTPException

from routers.assessment import AssessmentAnswer, QUESTIONS, validate_submission_answers
from routers.roadmap import ProgressUpdateRequest, generate_roadmap_doc, update_progress
from scoring import compute_scores


def valid_answers():
    return [
        AssessmentAnswer(question_id=q["id"], answer=q["options"][0] if q["type"] == "single" else [q["options"][0]])
        for q in QUESTIONS
    ]


def test_scoring_returns_expected_shape():
    result = compute_scores({
        "1": "1 – 2 năm",
        "2": "Thực hành trực tiếp qua các dự án thực tế.",
        "3": "AI / Machine Learning Engineer",
        "4": ["Python", "JavaScript / TypeScript"],
        "5": "SQL nâng cao (JOIN, Index, Transaction)",
        "6": "Biết branch, merge, Pull Request",
        "7": "Đã dùng React/Vue/Angular",
        "8": "Đã dùng scikit-learn, pandas",
    })

    assert result["target_domain"] == "ai"
    assert set(result["skill_scores"]) == {"foundation", "web", "ai", "data"}
    assert result["overall_score"] > 0
    assert result["skill_gap"]["ai"] == 15


def test_assessment_validation_rejects_missing_answer():
    answers = valid_answers()[:-1]
    with pytest.raises(HTTPException) as exc:
        validate_submission_answers(answers)
    assert exc.value.status_code == 422
    assert "Missing answers" in exc.value.detail


def test_assessment_validation_rejects_conflicting_multi_answer():
    answers = valid_answers()
    answers[3] = AssessmentAnswer(question_id=4, answer=["Python", "Chưa biết ngôn ngữ nào"])
    with pytest.raises(HTTPException) as exc:
        validate_submission_answers(answers)
    assert exc.value.status_code == 422
    assert "cannot be combined" in exc.value.detail


def test_generate_roadmap_has_progress_and_next_milestone():
    doc = generate_roadmap_doc(
        "student_001",
        "Student",
        "web",
        {"foundation": 60, "web": 50, "ai": 0, "data": 0},
        {"foundation": 25, "web": 30, "ai": 75, "data": 70},
        "Thực hành trực tiếp qua các dự án thực tế.",
    )

    assert doc["domain"] == "web"
    assert 0 <= doc["progress_pct"] <= 100
    assert any(p["status"] == "in_progress" for p in doc["phases"])
    assert doc["next_milestone"]


@pytest.mark.asyncio
async def test_update_progress_recalculates_roadmap(monkeypatch):
    doc = generate_roadmap_doc(
        "student_001",
        "Student",
        "web",
        {"foundation": 0, "web": 0, "ai": 0, "data": 0},
        {"foundation": 85, "web": 80, "ai": 75, "data": 70},
        "",
    )

    class FakeRoadmaps:
        async def find_one(self, query):
            return dict(doc) if query["_id"] == doc["_id"] else None

        async def update_one(self, query, update):
            doc.update(update["$set"])

    monkeypatch.setattr("routers.roadmap.col_roadmaps", lambda: FakeRoadmaps())

    updated = await update_progress(doc["_id"], ProgressUpdateRequest(phase_index=0, completed=True))

    assert updated["progress_pct"] > 0
    assert updated["cv_items"] == [doc["phases"][0]["output"]]
    assert updated["phases"][0]["status"] == "completed"

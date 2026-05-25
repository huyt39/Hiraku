"""
Feature 4 – AI Career Suggestion using Google Gemini API
Nhận kết quả assessment → gọi Gemini → trả về đề xuất định hướng + lý do
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

DOMAIN_LABELS = {
    "web":       "Web Developer (Frontend / Backend / Fullstack)",
    "ai":        "AI / Machine Learning Engineer",
    "data":      "Data Analyst / Data Engineer",
    "devops":    "DevOps / Cloud Engineer",
    "undecided": "Chưa xác định",
}

DOMAIN_ROADMAP_SUMMARY = {
    "web":  "HTML→CSS→JS→React→Next.js→Node.js→Database→Deploy",
    "ai":   "Python→Math→Pandas→scikit-learn→PyTorch→NLP→MLOps",
    "data": "SQL→Python→Pandas→Visualization→Airflow→Spark→Cloud",
}

class SuggestionRequest(BaseModel):
    student_id:   str
    skill_scores: dict          # {foundation, web, ai, data}
    skill_gap:    dict
    target_domain: str
    learning_style: Optional[str] = ""
    overall_score:  int = 0

class SuggestionResponse(BaseModel):
    recommended_domain: str
    domain_label:       str
    confidence:         int         # 0-100
    reasons:            list[str]
    immediate_actions:  list[str]
    gemini_analysis:    Optional[str] = None
    source:             str          # "gemini" | "rule_based"

# ── Rule-based fallback (no API key needed) ─────────────────────────────────────

def rule_based_suggestion(req: SuggestionRequest) -> SuggestionResponse:
    scores = req.skill_scores
    gap    = req.skill_gap
    target = req.target_domain

    # Pick domain with highest score (or user target if confident enough)
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    best_domain = ranked[0][0] if ranked else "web"

    # If user has a clear target and score ≥ 30, respect it
    if target in scores and scores[target] >= 30:
        recommended = target
    else:
        recommended = best_domain

    # Build reasons
    reasons = []
    score = scores.get(recommended, 0)
    if score >= 60:
        reasons.append(f"Bạn đã có nền tảng tốt trong lĩnh vực {DOMAIN_LABELS.get(recommended, recommended)} (điểm {score}/100).")
    elif score >= 30:
        reasons.append(f"Bạn có kiến thức cơ bản về {DOMAIN_LABELS.get(recommended, recommended)} và có thể phát triển tiếp.")
    else:
        reasons.append(f"Đây là lĩnh vực bạn đang hướng tới – hãy bắt đầu từ nền tảng.")

    gap_val = gap.get(recommended, 0)
    if gap_val > 50:
        reasons.append(f"Khoảng cách với yêu cầu thị trường còn {gap_val} điểm – cần tập trung học nhiều hơn.")
    elif gap_val > 20:
        reasons.append(f"Bạn còn cách mục tiêu thị trường {gap_val} điểm – tiếp tục cải thiện.")
    else:
        reasons.append("Kỹ năng của bạn đang tiệm cận yêu cầu thị trường!")

    foundation = scores.get("foundation", 0)
    if foundation < 50:
        reasons.append("Nền tảng lập trình cần được củng cố trước – Git, cấu trúc dữ liệu, tư duy giải thuật.")

    # Immediate actions
    actions_map = {
        "web":  ["Học JavaScript ES6+ nếu chưa vững", "Làm 1 project React hoàn chỉnh", "Deploy lên Vercel/Netlify"],
        "ai":   ["Ôn Python và NumPy/Pandas", "Hoàn thành 1 project ML với scikit-learn", "Tìm hiểu PyTorch cơ bản"],
        "data": ["Luyện SQL hàng ngày (HackerRank)", "Phân tích 1 dataset thực tế với Pandas", "Xây dựng dashboard với Plotly/Streamlit"],
    }
    actions = actions_map.get(recommended, ["Xác định rõ định hướng nghề nghiệp", "Học Python cơ bản", "Tham gia mini project đầu tiên"])
    if foundation < 40:
        actions.insert(0, "Học Git cơ bản và thiết lập GitHub profile")

    confidence = min(100, score + (100 - gap_val) // 2)

    return SuggestionResponse(
        recommended_domain=recommended,
        domain_label=DOMAIN_LABELS.get(recommended, recommended),
        confidence=confidence,
        reasons=reasons,
        immediate_actions=actions,
        gemini_analysis=None,
        source="rule_based",
    )

# ── Gemini-powered suggestion ────────────────────────────────────────────────────

async def gemini_suggestion(req: SuggestionRequest) -> SuggestionResponse:
    import google.generativeai as genai

    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        return rule_based_suggestion(req)

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = f"""
Bạn là cố vấn định hướng nghề nghiệp cho sinh viên IT tại Việt Nam.

Thông tin sinh viên:
- Điểm kỹ năng hiện tại: Foundation={req.skill_scores.get('foundation',0)}/100, Web={req.skill_scores.get('web',0)}/100, AI={req.skill_scores.get('ai',0)}/100, Data={req.skill_scores.get('data',0)}/100
- Điểm tổng thể: {req.overall_score}/100
- Khoảng cách với thị trường: {req.skill_gap}
- Định hướng mong muốn: {DOMAIN_LABELS.get(req.target_domain, req.target_domain)}
- Phong cách học: {req.learning_style}

Yêu cầu thị trường (điểm cần đạt): Foundation=85, Web=80, AI=75, Data=70

Hãy phân tích và trả lời NGẮN GỌN (tiếng Việt) theo format JSON sau (không thêm markdown):
{{
  "recommended_domain": "web|ai|data",
  "confidence": 0-100,
  "reasons": ["lý do 1", "lý do 2", "lý do 3"],
  "immediate_actions": ["hành động 1", "hành động 2", "hành động 3"],
  "analysis": "1-2 câu nhận xét tổng quan về sinh viên này"
}}
"""
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Clean markdown code fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        import json
        data = json.loads(text)
        rec = data.get("recommended_domain", "web")
        return SuggestionResponse(
            recommended_domain=rec,
            domain_label=DOMAIN_LABELS.get(rec, rec),
            confidence=data.get("confidence", 70),
            reasons=data.get("reasons", []),
            immediate_actions=data.get("immediate_actions", []),
            gemini_analysis=data.get("analysis"),
            source="gemini",
        )
    except Exception as e:
        print(f"Gemini error: {e}, falling back to rule-based")
        fallback = rule_based_suggestion(req)
        return fallback

# ── API Endpoint ────────────────────────────────────────────────────────────────

@router.post("/suggest", response_model=SuggestionResponse)
async def get_suggestion(req: SuggestionRequest):
    """
    Gọi Gemini API để phân tích kết quả assessment và đề xuất định hướng nghề nghiệp.
    Nếu chưa có API key, fallback sang rule-based engine.
    """
    return await gemini_suggestion(req)

@router.get("/domains")
async def get_domains():
    return {
        "domains": [
            {"key": k, "label": v, "roadmap_summary": DOMAIN_ROADMAP_SUMMARY.get(k, "")}
            for k, v in DOMAIN_LABELS.items()
        ]
    }

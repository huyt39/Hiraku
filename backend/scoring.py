"""
Scoring engine for self-assessment.

Each question maps answers to scores (0–100) per skill domain:
  - foundation  : lập trình nền tảng, Git, tư duy
  - web         : HTML/CSS, JS, Framework web
  - ai          : Python ML, Deep Learning, NLP
  - data        : SQL, Pandas, Pipeline

Market requirements (target scores):
  foundation=85, web=80, ai=75, data=70
"""

MARKET_REQUIREMENTS = {
    "foundation": 85,
    "web":        80,
    "ai":         75,
    "data":       70,
}

# ── per-question scoring maps ─────────────────────────────────────────────────
SCORING_MAP = {
    # Q1 – Kinh nghiệm lập trình  → foundation
    1: {
        "domain": "foundation",
        "scores": {
            "Dưới 6 tháng":   15,
            "6 tháng – 1 năm": 35,
            "1 – 2 năm":       60,
            "Trên 2 năm":      90,
        },
    },
    # Q2 – Phong cách học         → không tính điểm (style detection only)
    2: {
        "domain": None,
        "scores": {},
    },
    # Q3 – Mục tiêu nghề nghiệp  → xác định target_domain
    3: {
        "domain": "target",
        "scores": {
            "Web Developer / Frontend / Backend": "web",
            "AI / Machine Learning Engineer":     "ai",
            "Data Analyst / Data Engineer":       "data",
            "DevOps / Cloud Engineer":            "devops",
            "Chưa quyết định":                    "undecided",
        },
    },
    # Q4 – Ngôn ngữ lập trình (multi-select) → foundation
    4: {
        "domain": "foundation",
        "multi": True,
        "per_choice": 15,   # +15 per language (max ~75 = 5 langs)
        "cap": 80,
    },
    # Q5 – Database experience    → data + foundation
    5: {
        "domain": "data",
        "scores": {
            "Chưa từng dùng":                             0,
            "SQL cơ bản (SELECT, INSERT)":               25,
            "SQL nâng cao (JOIN, Index, Transaction)":   55,
            "NoSQL (MongoDB, Redis) hoặc cả hai":        80,
        },
    },
    # Q6 – Git/Version Control    → foundation
    6: {
        "domain": "foundation",
        "scores": {
            "Chưa biết Git":                        0,
            "Biết commit, push cơ bản":            30,
            "Biết branch, merge, Pull Request":    65,
            "Thành thạo Git workflow trong team": 100,
        },
    },
    # Q7 – Dự án Web              → web
    7: {
        "domain": "web",
        "scores": {
            "Chưa từng":               0,
            "Đã làm HTML/CSS tĩnh":   25,
            "Đã dùng React/Vue/Angular": 65,
            "Đã deploy lên production": 100,
        },
    },
    # Q8 – AI/ML knowledge        → ai
    8: {
        "domain": "ai",
        "scores": {
            "Chưa biết gì":                  0,
            "Hiểu khái niệm cơ bản":        20,
            "Đã dùng scikit-learn, pandas": 60,
            "Đã train và deploy model AI": 100,
        },
    },
}


def compute_scores(answers: dict) -> dict:
    """
    answers: {question_id (int): answer_value (str | list[str])}
    Returns full result dict.
    """
    domain_totals  = {"foundation": [], "web": [], "ai": [], "data": []}
    target_domain  = "undecided"
    learning_style = ""

    for qid_str, answer in answers.items():
        qid  = int(qid_str)
        rule = SCORING_MAP.get(qid)
        if rule is None:
            continue

        domain = rule["domain"]

        # Learning style (Q2)
        if domain is None:
            learning_style = answer
            continue

        # Target domain (Q3)
        if domain == "target":
            target_domain = rule["scores"].get(answer, "undecided")
            continue

        # Multi-select question (Q4)
        if rule.get("multi"):
            selected = answer if isinstance(answer, list) else [answer]
            # filter out "Chưa biết ngôn ngữ nào"
            langs = [a for a in selected if "Chưa" not in a]
            score = min(len(langs) * rule["per_choice"], rule["cap"])
            domain_totals[domain].append(score)
            continue

        # Normal single-select
        score_map = rule["scores"]
        score = score_map.get(answer, 0)
        if domain in domain_totals:
            domain_totals[domain].append(score)

    # Average per domain (if no data → 0)
    skill_scores = {
        d: (round(sum(vals) / len(vals)) if vals else 0)
        for d, vals in domain_totals.items()
    }

    # Skill gap vs market
    skill_gap = {
        d: max(0, MARKET_REQUIREMENTS[d] - skill_scores[d])
        for d in MARKET_REQUIREMENTS
    }

    # Overall readiness (weighted avg)
    weights = {"foundation": 0.3, "web": 0.25, "ai": 0.25, "data": 0.2}
    overall = round(sum(skill_scores[d] * w for d, w in weights.items()))

    # Strengths & weaknesses
    sorted_skills = sorted(skill_scores.items(), key=lambda x: x[1], reverse=True)
    strengths    = [d for d, s in sorted_skills if s >= 60]
    weaknesses   = [d for d, s in sorted_skills if s < 40]

    return {
        "skill_scores":    skill_scores,
        "skill_gap":       skill_gap,
        "target_domain":   target_domain,
        "learning_style":  learning_style,
        "overall_score":   overall,
        "strengths":       strengths,
        "weaknesses":      weaknesses,
        "market_requirements": MARKET_REQUIREMENTS,
    }

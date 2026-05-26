# SkillBridge — IT Student Skill Assessment & Personalized Roadmap Platform

> Hệ thống 3 bước giúp sinh viên IT xác định kỹ năng, trải nghiệm dự án thực tế, và nhận lộ trình học tập cá nhân hóa.

## Tính năng chính

| # | Tính năng | Mô tả |
|---|-----------|-------|
| 1 | **Self-Assessment** | Bài test đánh giá kỹ năng hiện tại, so sánh với yêu cầu thị trường |
| 2 | **Skill Gap Analysis** | Phân tích khoảng cách kỹ năng theo từng lĩnh vực (Foundation, Web, AI, Data) |
| 3 | **Màn hình kết quả** | Hiển thị điểm kỹ năng, điểm mạnh/yếu, đề xuất ngay |
| 4 | **AI Career Suggestion** | Dùng Gemini API phân tích và đề xuất định hướng nghề nghiệp |
| 5 | **Personalized Roadmap** | Tạo lộ trình 12 tuần cá nhân hóa, lưu MongoDB, cập nhật mỗi 2–4 tuần |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Vanilla CSS |
| Backend | Python FastAPI, Uvicorn |
| Database | MongoDB (Motor async driver) |
| AI | Google Gemini API (with rule-based fallback) |

## Cấu trúc project

```
/
├── frontend/               # Next.js app (port 3001)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── assessment/     # Feature 1 & 3: Self-assessment + kết quả
│   │   │   │   ├── dashboard/      # Feature 2: Skill gap analysis
│   │   │   │   ├── projects/       # Mini projects theo domain
│   │   │   │   ├── roadmap/        # Feature 5: Personalized roadmap
│   │   │   │   └── settings/       # Cài đặt người dùng
│   │   │   └── globals.css         # Design system (dark/light mode)
│   │   ├── components/
│   │   │   ├── Sidebar.tsx         # Navigation + theme toggle
│   │   │   └── ThemeProvider.tsx   # Dark/Light mode context
│   │   └── lib/
│   │       └── api.ts              # Central API URL config
│   └── .env.example
│
├── backend/                # FastAPI app (port 8000)
│   ├── main.py             # App entry point
│   ├── database.py         # MongoDB connection (Motor)
│   ├── scoring.py          # Assessment scoring engine
│   ├── routers/
│   │   ├── assessment.py   # Feature 1 & 2: Questions, submit, MongoDB
│   │   ├── ai_suggestion.py # Feature 4: Gemini API suggestion
│   │   ├── roadmap.py      # Feature 5: Personalized roadmap generation
│   │   ├── dashboard.py    # Dashboard data
│   │   └── projects.py     # Mini projects catalog
│   ├── requirements.txt
│   └── .env.example
│
└── .gitignore
```

## Cài đặt & Chạy

### Prerequisites
- Node.js >= 20
- Python >= 3.10
- MongoDB (local hoặc Atlas)

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # Điền GEMINI_API_KEY nếu có
uvicorn main:app --reload --port 8000
```

API Docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev                    # Chạy tại http://localhost:3001
```

## Environment Variables

### Backend (`backend/.env`)
```env
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB=skillbridge
GEMINI_API_KEY=your_key_here   # Optional - có fallback rule-based
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

# SkillBridge — IT Student Skill Assessment & Personalized Roadmap Platform

> Hệ thống giúp sinh viên IT xác định kỹ năng, nhận lộ trình học tập cá nhân hóa, và khám phá thị trường IT Việt Nam.

---

## 🚀 Chạy nhanh (Quick Start)

### Backend

```bash
cd backend
make install     # Lần đầu: tạo venv & cài dependencies
make dev         # Khởi động API → http://localhost:8000
```

> API Docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
pnpm install     # hoặc: npm install
pnpm dev         # hoặc: npm run dev  → http://localhost:3001
```

> Yêu cầu Node.js ≥ 20. Dùng `nvm use 20` nếu cần.

---

## ✨ Tính năng chính

| # | Tính năng | Mô tả |
|---|-----------|-------|
| 1 | **Self-Assessment** | Bài test 8 câu đánh giá kỹ năng, so sánh với yêu cầu thị trường |
| 2 | **Skill Gap Analysis** | Phân tích khoảng cách kỹ năng (Foundation / Web / AI / Data) |
| 3 | **Màn hình kết quả** | Điểm kỹ năng, điểm mạnh/yếu, đề xuất định hướng |
| 4 | **AI Career Suggestion** | Gemini API phân tích và đề xuất nghề nghiệp cá nhân hóa |
| 5 | **Personalized Roadmap** | Lộ trình 12 tuần theo ngành, lưu MongoDB, cập nhật mỗi 2–4 tuần |
| 6 | **Progress Tracking** | Đánh dấu hoàn thành từng phase, đồng bộ dashboard |
| 7 | **Thị trường IT** | Thông tin nhu cầu tuyển dụng, mức lương, xu hướng theo lĩnh vực |
| 8 | **Auth & Profile** | Đăng ký / đăng nhập, lưu kết quả và roadmap theo tài khoản |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Vanilla CSS |
| Backend | Python FastAPI, Uvicorn (hot-reload) |
| Database | MongoDB (Motor async driver, auto-seed) |
| AI | Google Gemini API (rule-based fallback nếu không có key) |
| Package | pnpm / npm (frontend), make + venv (backend) |

---

## 📁 Cấu trúc project

```
/
├── .nvmrc                      # Node.js version (≥ 20)
├── frontend/                   # Next.js app (port 3001)
│   ├── .nvmrc
│   ├── pnpm-lock.yaml
│   ├── src/app/(dashboard)/
│   │   ├── assessment/         # Self-assessment + kết quả
│   │   ├── dashboard/          # Tổng quan skill gap
│   │   ├── roadmap/            # Lộ trình cá nhân hóa
│   │   ├── market/             # Thị trường IT & nghề nghiệp
│   │   ├── projects/           # Mini projects gợi ý
│   │   └── settings/
│   └── src/components/
│       ├── Sidebar.tsx
│       └── ThemeProvider.tsx
│
└── backend/                    # FastAPI app (port 8000)
    ├── Makefile                # make dev / install / test
    ├── main.py
    ├── database.py             # MongoDB + auto-seed + indexes
    ├── scoring.py              # Assessment scoring engine
    └── routers/
        ├── assessment.py       # Questions, submit, history
        ├── ai_suggestion.py    # Gemini API suggestion
        ├── roadmap.py          # Roadmap generation + progress
        ├── dashboard.py        # Dashboard data
        ├── market.py           # Thị trường IT domains
        ├── auth.py             # Register / login / profile
        └── projects.py         # Mini projects catalog
```

---

## ⚙️ Cài đặt chi tiết

### Prerequisites

- Node.js ≥ 20 (`nvm install 20`)
- Python ≥ 3.10
- MongoDB (local hoặc Atlas)

### Backend — Makefile commands

```bash
cd backend

make install   # Tạo venv + pip install -r requirements.txt
make dev       # uvicorn main:app --reload --port 8000
make test      # pytest tests/
make clean     # Xoá __pycache__ và .pytest_cache
```

### Frontend — pnpm / npm

```bash
cd frontend

pnpm install   # Cài dependencies
pnpm dev       # http://localhost:3001 (hot-reload)
pnpm build     # Production build
pnpm start     # Chạy production

# Hoặc dùng npm:
npm install
npm run dev
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB=skillbridge
GEMINI_API_KEY=your_key_here   # Optional — có rule-based fallback
```

### Frontend (`frontend/.env.local`) — tuỳ chọn

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> Nếu không có `.env.local`, frontend tự động dùng `http://localhost:8000`.

---

## 📋 Make commands reference

| Command | Mô tả |
|---------|-------|
| `make dev` | Start API server với hot-reload |
| `make install` | Tạo venv và cài dependencies |
| `make test` | Chạy pytest |
| `make lint` | Lint code (cần ruff) |
| `make clean` | Xoá cache files |

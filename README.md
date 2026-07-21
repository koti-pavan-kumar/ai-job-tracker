# ⚡ TalentFlow Studio | AI-Powered Job Application & Resume Tailoring Engine

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-Neon%20PostgreSQL-4169E1?style=flat&logo=postgresql)](https://neon.tech/)
[![Groq](https://img.shields.io/badge/AI%20Engine-Groq%20%2F%20LLaMA--3.3--70B-f34f29?style=flat)](https://groq.com/)
[![Render](https://img.shields.io/badge/Deployment-Render-46E3B7?style=flat&logo=render)](https://render.com/)

**TalentFlow Studio** is a full-stack, AI-driven career management platform designed to automate job tracking and generate tailored, ATS-optimized resumes and cover letters in real-time. Powered by **Groq LLaMA-3.3-70B**, **FastAPI**, **React**, and **Neon Cloud PostgreSQL**, it transforms unstructured job descriptions and raw base resumes into recruiter-ready applications structured according to strict industry standards.

---

## ✨ Key Features

* **🤖 LLM-Powered Resume Tailoring:** Leverages Groq's high-throughput LLaMA-3.3-70B model to rewrite resumes into strict, single-column, markdown-formatted structures targeting specific ATS keywords and metrics.
* **📄 Automated Document Generation:** Compiles optimized assets directly into downloadable **PDF** (via ReportLab) and **DOCX** (via `python-docx`) formats with custom typography and layout parsing.
* **📊 Visual Application Kanban & Tracker:** Full CRUD pipeline tracking job statuses (Applied, Interviewing, Offer, Rejected) linked per user profile.
* **🔐 Secure Auth System:** JWT bearer token authentication using `bcrypt` password hashing and role-based permissions (User / Admin controls).
* **🌐 Automated Job Scraping & Analysis:** Ingests live job posting URLs, scrapes underlying job descriptions, and auto-extracts top required skill categories.
* **⚡ Cloud Native Architecture:** Fully decoupled REST architecture deployed on Render with serverless PostgreSQL via Neon DB.

---

## 🏗️ System Architecture

```text
  ┌─────────────────────────────────────────────────────────────┐
  │                      React Frontend                         │
  │            (Tailwind CSS, Vite, AuthContext)                 │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                   HTTPS / JSON  │ JWT Auth
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                     FastAPI Backend                         │
  │      (CORSMiddleware, PyPDF Extractor, Document Engine)      │
  └──────────────┬──────────────────────────────┬───────────────┘
                 │                              │
    SQLAlchemy   │                              │ Groq API
    ORM          ▼                              ▼
  ┌───────────────────────────┐    ┌───────────────────────────┐
  │   Neon Cloud PostgreSQL   │    │     Groq LLaMA-3.3-70B     │
  │   (Users, Jobs Schema)    │    │ (Structured Prompt Engine)│
  └───────────────────────────┘    └───────────────────────────┘

🛠️ Tech Stack
**Frontend**
>Framework: React.js + Vite

>Styling: Tailwind CSS

>Icons & UI Components: Lucide Icons / Custom Modern UI

**Backend**
>Framework: FastAPI (Python 3.13)

>Authentication: OAuth2 with Password Hashing (native bcrypt), PyJWT

>ORM & Database: SQLAlchemy, psycopg2, Neon PostgreSQL

>Document Compilation: PyPDF, ReportLab (PDF Engine), python-docx (Word Engine)

**AI & Intelligence**
>LLM Orchestration: Official Groq Python SDK (llama-3.3-70b-versatile)

>Scraper Engine: BeautifulSoup4 & Requests

**🚀 Live Demo & Endpoints**


Service                Host                       Live URL
Frontend Application   Render Static Site         https://ai-job-tracker-frontend-2fj1.onrender.com
Backend REST API       Render Web Service         https://ai-job-tracker-byeq.onrender.com
API Interactive Docs   Swagger UI                 https://ai-job-tracker-byeq.onrender.com/docs

⚙️ Local Development Setup
Prerequisites
Node.js (v18+)

Python (v3.11+)

PostgreSQL / Neon Database Account

Groq API Key

**1. Clone Repository**
git clone [https://github.com/YOUR_USERNAME/ai-job-tracker.git](https://github.com/YOUR_USERNAME/ai-job-tracker.git)
cd ai-job-tracker

**2. Backend Configuration**
cd backend

# Create & Activate Virtual Environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Dependencies
pip install -r requirements.txt

# Create .env File
cp .env.example .env

Add your environment variables to backend/.env:
DATABASE_URL=postgresql://user:password@ep-your-neon-endpoint.neon.tech/neondb?sslmode=require
SECRET_KEY=your_super_secret_jwt_key_here
ALGORITHM=HS256
GROQ_API_KEY=gsk_your_groq_api_key_here

Run backend server:
uvicorn main:app --reload --port 8000

**3. Frontend Configuration**
Open a new terminal window:
cd frontend

# Install Dependencies
npm install

# Start Development Server
npm run dev

Visit http://localhost:5173 in your browser.

📁 Repository Structure
ai-job-tracker/
├── backend/
│   ├── main.py              # FastAPI application routes & middleware
│   ├── ai_service.py        # Groq LLM integration & prompt template engine
│   ├── models.py            # SQLAlchemy database schemas
│   ├── database.py          # PostgreSQL database connection setup
│   ├── scraper.py           # Web scraping engine for job posting URL ingestion
│   └── requirements.txt     # Python dependencies
└── frontend/
    ├── src/
    │   ├── App.jsx          # Workspace layout & state orchestration
    │   ├── AuthContext.jsx  # Global authentication context
    │   ├── Dashboard.jsx    # Kanban tracking cards
    │   └── JobForm.jsx      # Job ingestion & URL parser form
    ├── package.json
    └── vite.config.js

🛡️ License
Distributed under the MIT License. See LICENSE for more information.

👨‍💻 Author
Pavan Kumar

LinkedIn: https://www.linkedin.com/in/pavan-kumar-koti-200b4438b/

GitHub: github.com/koti-pavan-kumar/

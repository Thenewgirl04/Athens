# Athens LMS

Athens is a full-stack Learning Management System built with a FastAPI backend and a modern React / Vite front-end.
It is intended for local development & demo purposes – no external databases are required because all data is persisted as JSON files inside the repository.

---

## 1. Project structure

```
Athens/               # ← repo root
│
├─ backend/           # FastAPI application (Python 3.11)
│   ├─ database/      # JSON "databases" – created on first run or via helper script
│   ├─ models.py      # Pydantic models shared by the API
│   ├─ services/      # Business-logic layer (curriculum, auth, quiz, …)
│   ├─ main.py        # FastAPI entry-point (app instance)
│   └─ requirements.txt
│
└─ frontend/
    └─ StudentDashboard/   # React-TS app powered by Vite
        ├─ src/
        └─ package.json
```

---

## 2. Prerequisites

| Tool                | Version (tested) | Notes                                     |
|---------------------|------------------|-------------------------------------------|
| Python              | 3.10+            | create a virtual environment              |
| Node.js & npm       | ≥ 18 LTS         | installs front-end deps                   |
| Git                 | any              | clone the repo                            |

> If you prefer **Docker**, jump to section 6.

---

## 3. Environment variables

The backend relies on API keys for AI providers.  Copy the sample below into `backend/.env` and adjust values as needed.

```dotenv
# backend/.env – example
GEMINI_API_KEY     = "your_google_generative_ai_key"
OPENAI_API_KEY     = "your_openai_key"
# Add any other secrets here
```

No environment variables are required for the front-end; the default Vite dev server configuration proxies API requests to `http://localhost:8000`.

---

## 4. Running locally (three terminals)

Below is the recommended setup when you want to showcase **both** the student-facing and teacher-facing dashboards side-by-side.

### 4.1 Start the backend (terminal 1)

```bash
cd backend
python -m venv .venv          # one-time
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# optional: seed sample data
python generate_sample_data.py

uvicorn main:app --reload --port 8000
```

### 4.2 Start the Student Dashboard (terminal 2)

```bash
cd frontend/StudentDashboard
npm install          # one-time
npm run dev          # ➜ http://localhost:5173
```

### 4.3 Start the Teacher Dashboard (terminal 3)

```bash
cd frontend/TeacherDashboard
npm install          # one-time
npm run dev          # ➜ http://localhost:5174 (Vite will pick the next free port if 5173 is taken)
```

At this point you have:

* FastAPI API → http://localhost:8000 (docs at /docs)
* Student UI → http://localhost:5173
* Teacher UI → http://localhost:5174

---

## 5. Demo accounts

| Role      | Name                | Email                              | Password    |
|-----------|---------------------|------------------------------------|-------------|
| Student   | Arthur Thompson     | arthur.thompson@university.edu     | student123  |
| Student   | Sarah Martinez      | sarah.martinez@university.edu      | student123  |
| Student   | James Wilson        | james.wilson@university.edu        | student123  |
| Professor | Sarah Johnson       | sarah.johnson@university.edu       | teacher123  |

---

## 6. Common issues

1. **CORS errors** – ensure your front-end dev server origins are listed in `backend/main.py`.
2. **Python package errors** – recreate your virtual environment.
3. **Port already in use** – change the `--port` for uvicorn or Vite.

---

## 7. Contributing & License

Pull requests are welcome! Create a feature branch off `stagging` and open a PR.

This project is licensed under the MIT License – see `LICENSE` for details.

# Teacher Dashboard Backend

FastAPI backend that generates, stores, and serves course curricula using Google Gemini.

---

## Setup

### Prerequisites

- Python **3.10+**
- Google Gemini API key (create one at https://aistudio.google.com/app/apikeys)

### Installation

1. **Activate the virtual environment** (from the repository root):

   ```bash
   # Windows (cmd)
   call .venv\Scripts\activate.bat

   # Windows (PowerShell)
   .venv\Scripts\Activate.ps1

   # macOS / Linux
   source .venv/bin/activate
   ```

2. **Install backend dependencies**:

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Configure environment variables**. Copy the template and fill in your settings:

   ```bash
   cp .env.example .env
   ```

   Required key:

   ```
   GOOGLE_API_KEY=your_google_gemini_key
   ```

   Optional overrides (defaults shown):

   ```
   GEMINI_MODEL=gemini-2.5-flash
   HOST=0.0.0.0
   PORT=8000
   DEBUG=true
   ```

---

## Running the Server

From the `backend` directory (with the venv active):

```bash
python main.py
```

Or, for auto-reload during development:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at **http://localhost:8000**.

### API Docs

- Swagger UI: http://localhost:8000/docs  
- ReDoc: http://localhost:8000/redoc

### Quick Health Check

```bash
curl http://localhost:8000/health
```

Expected JSON:

```json
{
  "status": "healthy",
  "message": "Backend server is running"
}
```

---

## Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| `POST` | `/api/curriculum/generate` | Generate and persist a curriculum. Accepts either JSON or `multipart/form-data`. |
| `GET`  | `/api/curriculum/{course_id}` | Retrieve the latest stored curriculum for a course. |
| `GET`  | `/health` | Basic health check. |
| `GET`  | `/` | Service metadata. |

### Request Examples

**JSON body**

```json
{
  "course_id": "cs101",
  "course_outline": "Week 1: Intro...",
  "number_of_weeks": 12,
  "include_study_materials": true,
  "include_media_links": true,
  "ai_engine": "gemini"
}
```

**Multipart form-data** (for syllabus uploads)

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `course_id` | text | ✅ | Identifier used for storage/retrieval |
| `number_of_weeks` | number | ✅ | e.g. `12` |
| `course_outline` | text | ❌ | Alternative to file upload |
| `syllabus_file` | file | ❌ | `.txt`, `.pdf`, `.doc`, etc. |
| `include_study_materials` | boolean/string | ❌ | Defaults to `true` |
| `include_media_links` | boolean/string | ❌ | Defaults to `true` |
| `ai_engine` | text | ❌ | Defaults to `gemini` |

At least one of `course_outline` or `syllabus_file` must be supplied.

### Response Shape

```json
{
  "course_id": "cs101",
  "success": true,
  "message": "Curriculum generated successfully",
  "weeks": [
    {
      "week_number": 1,
      "title": "Foundations",
      "topics": [
        {
          "id": "topic_1_1",
          "title": "What is Python?",
          "description": "...",
          "resources": ["https://..."]
        }
      ]
    }
  ]
}
```

Curricula are stored under `backend/data/curriculum_<course_id>.json` so the latest plan can be retrieved without regenerating.

---

## Project Structure

```
backend/
├── main.py                    # FastAPI entry point and route definitions
├── services/
│   └── curriculum_service.py  # Gemini integration, parsing, persistence
├── utils/
│   └── gemini_client.py       # Wrapper around google-generativeai
├── storage/
│   └── curriculum_storage.py  # Simple JSON file storage
├── models.py                  # Pydantic request/response schemas
├── config.py                  # Environment-backed settings
├── requirements.txt           # Dependency list
├── data/                      # Generated curriculum cache (created at runtime)
├── .env / .env.example        # Environment variables
└── README.md                  # This document
```

---

## Troubleshooting

### `ModuleNotFoundError`
- Ensure the virtual environment is activated.
- Re-run `pip install -r requirements.txt`.

### `course_id and number_of_weeks are required`
- Provide both fields when submitting multipart form-data (file upload).
- For JSON requests, make sure the payload includes `course_id` and `number_of_weeks`.

### `At least one of syllabus_content or course_outline is required`
- Supply either a syllabus file or pasted outline text.

### Gemini model errors (`model not found` or unsupported)
- Verify `GEMINI_MODEL` matches a model your API key can access (e.g. `gemini-2.5-flash`).
- Confirm `GOOGLE_API_KEY` is valid and has the correct permissions.

### Port already in use
- Change the `PORT` value in `.env`, or stop the process using port 8000.

---

Happy hacking!

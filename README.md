# Athens LMS
An advanced learning management system with JSON-based database

## Student Login Credentials

The following student accounts are available for testing:

1. **Arthur Thompson** (High Performer)
   - Email: `arthur.thompson@university.edu`
   - Password: `student123`
   - GPA: 3.85, 78 credits, Junior
   - Enrolled in 4 courses with varied progress

2. **Sarah Martinez** (Mid Progress)
   - Email: `sarah.martinez@university.edu`
   - Password: `student123`
   - GPA: 3.42, 45 credits, Sophomore
   - Enrolled in 5 courses

3. **James Wilson** (Beginner)
   - Email: `james.wilson@university.edu`
   - Password: `student123`
   - GPA: 3.20, 15 credits, Freshman
   - Enrolled in 4 courses

## Setup

### Backend
1. Navigate to `backend/` directory
2. Create a virtual environment: `python -m venv venv`
3. Activate virtual environment
4. Install dependencies: `pip install -r requirements.txt`
5. Generate sample data: `python generate_sample_data.py`
6. Run the server: `python main.py`

### Frontend
1. Navigate to `frontend/StudentDashboard/` directory
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Database Structure

All data is stored in JSON files under `backend/database/`:
- `students/students.json` - Student profiles
- `teachers/teachers.json` - Teacher profiles
- `courses/courses.json` - Course information
- `enrollments/enrollments.json` - Student-course enrollments
- `assignments/assignments.json` - Assignment details
- `quizzes/quizzes.json` - Quiz information
- `submissions/submissions.json` - Student submissions

"""
Script to generate sample data for the JSON database.
Run this once to populate initial data.
"""
import json
import bcrypt
from datetime import datetime, timedelta
from pathlib import Path

# Create database directory if it doesn't exist
BASE_DIR = Path(__file__).parent / "database"

# Hash password helper
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Generate students
students = [
    {
        "id": "stu_001",
        "firstName": "Arthur",
        "lastName": "Thompson",
        "email": "arthur.thompson@university.edu",
        "password": hash_password("student123"),
        "studentId": "STU-2024-0825",
        "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=Arthur",
        "major": "Computer Science",
        "yearLevel": "Junior",
        "department": "School of Computer Science & Engineering",
        "advisor": "Dr. Sarah Johnson",
        "gpa": 3.85,
        "credits": 78,
        "enrolledCourses": ["course_001", "course_002", "course_003", "course_004"],
        "completedAssignments": [
            {"assignmentId": "assign_001", "courseId": "course_001", "score": 95, "submittedAt": "2025-10-15T10:30:00Z"},
            {"assignmentId": "assign_002", "courseId": "course_001", "score": 88, "submittedAt": "2025-10-20T14:20:00Z"},
            {"assignmentId": "assign_003", "courseId": "course_001", "score": 92, "submittedAt": "2025-10-25T09:15:00Z"},
            {"assignmentId": "assign_004", "courseId": "course_002", "score": 85, "submittedAt": "2025-10-18T16:45:00Z"},
            {"assignmentId": "assign_005", "courseId": "course_002", "score": 90, "submittedAt": "2025-10-22T11:30:00Z"},
            {"assignmentId": "assign_006", "courseId": "course_003", "score": 94, "submittedAt": "2025-10-16T13:20:00Z"},
            {"assignmentId": "assign_007", "courseId": "course_003", "score": 87, "submittedAt": "2025-10-21T15:10:00Z"},
            {"assignmentId": "assign_008", "courseId": "course_003", "score": 91, "submittedAt": "2025-10-24T10:00:00Z"},
            {"assignmentId": "assign_009", "courseId": "course_004", "score": 82, "submittedAt": "2025-10-19T12:30:00Z"},
            {"assignmentId": "assign_010", "courseId": "course_004", "score": 79, "submittedAt": "2025-10-23T14:00:00Z"},
            {"assignmentId": "assign_011", "courseId": "course_001", "score": 89, "submittedAt": "2025-10-26T09:45:00Z"},
            {"assignmentId": "assign_012", "courseId": "course_002", "score": 86, "submittedAt": "2025-10-27T11:20:00Z"}
        ],
        "quizAttempts": [
            {"quizId": "quiz_001", "courseId": "course_001", "score": 92, "maxScore": 100, "attemptedAt": "2025-10-14T10:00:00Z", "answers": {}},
            {"quizId": "quiz_002", "courseId": "course_001", "score": 88, "maxScore": 100, "attemptedAt": "2025-10-19T14:30:00Z", "answers": {}},
            {"quizId": "quiz_003", "courseId": "course_002", "score": 85, "maxScore": 100, "attemptedAt": "2025-10-17T16:00:00Z", "answers": {}},
            {"quizId": "quiz_004", "courseId": "course_002", "score": 90, "maxScore": 100, "attemptedAt": "2025-10-21T11:00:00Z", "answers": {}},
            {"quizId": "quiz_005", "courseId": "course_003", "score": 94, "maxScore": 100, "attemptedAt": "2025-10-15T13:00:00Z", "answers": {}},
            {"quizId": "quiz_006", "courseId": "course_003", "score": 87, "maxScore": 100, "attemptedAt": "2025-10-20T15:30:00Z", "answers": {}},
            {"quizId": "quiz_007", "courseId": "course_004", "score": 81, "maxScore": 100, "attemptedAt": "2025-10-18T12:00:00Z", "answers": {}},
            {"quizId": "quiz_008", "courseId": "course_001", "score": 89, "maxScore": 100, "attemptedAt": "2025-10-25T10:30:00Z", "answers": {}}
        ],
        "grades": []
    },
    {
        "id": "stu_002",
        "firstName": "Sarah",
        "lastName": "Martinez",
        "email": "sarah.martinez@university.edu",
        "password": hash_password("student123"),
        "studentId": "STU-2024-0912",
        "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        "major": "Graphic Design",
        "yearLevel": "Sophomore",
        "department": "School of Arts & Design",
        "advisor": "Prof. Michael Chen",
        "gpa": 3.42,
        "credits": 45,
        "enrolledCourses": ["course_001", "course_002", "course_003", "course_004", "course_005"],
        "completedAssignments": [
            {"assignmentId": "assign_001", "courseId": "course_001", "score": 78, "submittedAt": "2025-10-15T10:30:00Z"},
            {"assignmentId": "assign_002", "courseId": "course_001", "score": 82, "submittedAt": "2025-10-20T14:20:00Z"},
            {"assignmentId": "assign_004", "courseId": "course_002", "score": 75, "submittedAt": "2025-10-18T16:45:00Z"},
            {"assignmentId": "assign_005", "courseId": "course_002", "score": 80, "submittedAt": "2025-10-22T11:30:00Z"},
            {"assignmentId": "assign_006", "courseId": "course_003", "score": 85, "submittedAt": "2025-10-16T13:20:00Z"},
            {"assignmentId": "assign_009", "courseId": "course_004", "score": 72, "submittedAt": "2025-10-19T12:30:00Z"}
        ],
        "quizAttempts": [
            {"quizId": "quiz_001", "courseId": "course_001", "score": 75, "maxScore": 100, "attemptedAt": "2025-10-14T10:00:00Z", "answers": {}},
            {"quizId": "quiz_002", "courseId": "course_001", "score": 80, "maxScore": 100, "attemptedAt": "2025-10-19T14:30:00Z", "answers": {}},
            {"quizId": "quiz_003", "courseId": "course_002", "score": 78, "maxScore": 100, "attemptedAt": "2025-10-17T16:00:00Z", "answers": {}},
            {"quizId": "quiz_005", "courseId": "course_003", "score": 82, "maxScore": 100, "attemptedAt": "2025-10-15T13:00:00Z", "answers": {}}
        ],
        "grades": []
    },
    {
        "id": "stu_003",
        "firstName": "James",
        "lastName": "Wilson",
        "email": "james.wilson@university.edu",
        "password": hash_password("student123"),
        "studentId": "STU-2024-1001",
        "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
        "major": "Business Administration",
        "yearLevel": "Freshman",
        "department": "School of Business",
        "advisor": "Prof. James Wilson",
        "gpa": 3.20,
        "credits": 15,
        "enrolledCourses": ["course_001", "course_002", "course_003", "course_004"],
        "completedAssignments": [
            {"assignmentId": "assign_001", "courseId": "course_001", "score": 68, "submittedAt": "2025-10-15T10:30:00Z"},
            {"assignmentId": "assign_004", "courseId": "course_002", "score": 70, "submittedAt": "2025-10-18T16:45:00Z"}
        ],
        "quizAttempts": [
            {"quizId": "quiz_001", "courseId": "course_001", "score": 65, "maxScore": 100, "attemptedAt": "2025-10-14T10:00:00Z", "answers": {}}
        ],
        "grades": []
    }
]

# Generate courses
courses = [
    {
        "id": "course_001",
        "title": "Advanced Web Development",
        "description": "Learn modern web development techniques including React, Node.js, and advanced JavaScript patterns.",
        "instructor": "Dr. Sarah Johnson",
        "instructorId": "teach_001",
        "thumbnail": "https://images.unsplash.com/photo-1593720213681-e9a8778330a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NjEzMjI3NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "modules": [
            {"id": "mod_001", "title": "Introduction to React", "order": 1},
            {"id": "mod_002", "title": "React Hooks Deep Dive", "order": 2},
            {"id": "mod_003", "title": "State Management", "order": 3},
            {"id": "mod_004", "title": "Advanced Patterns", "order": 4}
        ],
        "assignments": ["assign_001", "assign_002", "assign_003", "assign_011"],
        "quizzes": ["quiz_001", "quiz_002", "quiz_008"]
    },
    {
        "id": "course_002",
        "title": "Graphic Design Fundamentals",
        "description": "Master the principles of graphic design, typography, and visual communication.",
        "instructor": "Prof. Michael Chen",
        "instructorId": "teach_002",
        "thumbnail": "https://images.unsplash.com/photo-1572882724878-e17d310e6a74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwZGVzaWduJTIwdG9vbHN8ZW58MXx8fHwxNzYxMzE3NTQ3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "modules": [
            {"id": "mod_005", "title": "Color Theory Basics", "order": 1},
            {"id": "mod_006", "title": "Color Theory in Practice", "order": 2},
            {"id": "mod_007", "title": "Typography Fundamentals", "order": 3}
        ],
        "assignments": ["assign_004", "assign_005", "assign_012"],
        "quizzes": ["quiz_003", "quiz_004"]
    },
    {
        "id": "course_003",
        "title": "Data Science & Analytics",
        "description": "Explore data analysis, machine learning, and statistical methods for data-driven decision making.",
        "instructor": "Dr. Emily Rodriguez",
        "instructorId": "teach_003",
        "thumbnail": "https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMGFuYWx5dGljc3xlbnwxfHx8fDE3NjEyODU2NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "modules": [
            {"id": "mod_008", "title": "Python Basics", "order": 1},
            {"id": "mod_009", "title": "Machine Learning Basics", "order": 2},
            {"id": "mod_010", "title": "Data Visualization", "order": 3}
        ],
        "assignments": ["assign_006", "assign_007", "assign_008"],
        "quizzes": ["quiz_005", "quiz_006"]
    },
    {
        "id": "course_004",
        "title": "Business Strategy",
        "description": "Learn strategic thinking, market analysis, and business planning for competitive advantage.",
        "instructor": "Prof. James Wilson",
        "instructorId": "teach_004",
        "thumbnail": "https://images.unsplash.com/photo-1709715357520-5e1047a2b691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmd8ZW58MXx8fHwxNzYxMjk2NTg2fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "modules": [
            {"id": "mod_011", "title": "Market Analysis Techniques", "order": 1},
            {"id": "mod_012", "title": "Strategic Planning", "order": 2}
        ],
        "assignments": ["assign_009", "assign_010"],
        "quizzes": ["quiz_007"]
    },
    {
        "id": "course_005",
        "title": "Introduction to Psychology",
        "description": "Explore the fundamentals of human behavior and mental processes.",
        "instructor": "Dr. Lisa Anderson",
        "instructorId": "teach_005",
        "thumbnail": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        "modules": [
            {"id": "mod_013", "title": "Introduction to Psychology", "order": 1}
        ],
        "assignments": [],
        "quizzes": []
    }
]

# Generate enrollments
enrollments = [
    {"studentId": "stu_001", "courseId": "course_001", "enrolledAt": "2025-09-01T00:00:00Z", "progress": 65},
    {"studentId": "stu_001", "courseId": "course_002", "enrolledAt": "2025-09-01T00:00:00Z", "progress": 78},
    {"studentId": "stu_001", "courseId": "course_003", "enrolledAt": "2025-09-01T00:00:00Z", "progress": 42},
    {"studentId": "stu_001", "courseId": "course_004", "enrolledAt": "2025-09-01T00:00:00Z", "progress": 23},
    {"studentId": "stu_002", "courseId": "course_001", "enrolledAt": "2025-09-01T00:00:00Z", "progress": 45},
    {"studentId": "stu_002", "courseId": "course_002", "enrolledAt": "2025-09-01T00:00:00Z", "progress": 50},
    {"studentId": "stu_002", "courseId": "course_003", "enrolledAt": "2025-09-01T00:00:00Z", "progress": 40},
    {"studentId": "stu_002", "courseId": "course_004", "enrolledAt": "2025-09-01T00:00:00Z", "progress": 35},
    {"studentId": "stu_002", "courseId": "course_005", "enrolledAt": "2025-09-01T00:00:00Z", "progress": 55},
    {"studentId": "stu_003", "courseId": "course_001", "enrolledAt": "2025-09-01T00:00:00Z", "progress": 15},
    {"studentId": "stu_003", "courseId": "course_002", "enrolledAt": "2025-09-01T00:00:00Z", "progress": 20},
    {"studentId": "stu_003", "courseId": "course_003", "enrolledAt": "2025-09-01T00:00:00Z", "progress": 10},
    {"studentId": "stu_003", "courseId": "course_004", "enrolledAt": "2025-09-01T00:00:00Z", "progress": 15}
]

# Generate assignments
assignments = [
    {
        "id": "assign_001",
        "courseId": "course_001",
        "title": "React Component Library",
        "description": "Build a reusable component library using React",
        "dueDate": "2025-10-28T23:59:59Z",
        "points": 100,
        "type": "project"
    },
    {
        "id": "assign_002",
        "courseId": "course_001",
        "title": "Hooks Implementation",
        "description": "Implement custom React hooks",
        "dueDate": "2025-10-30T23:59:59Z",
        "points": 50,
        "type": "assignment"
    },
    {
        "id": "assign_003",
        "courseId": "course_001",
        "title": "State Management Exercise",
        "description": "Practice with Redux and Context API",
        "dueDate": "2025-11-05T23:59:59Z",
        "points": 75,
        "type": "assignment"
    },
    {
        "id": "assign_004",
        "courseId": "course_002",
        "title": "Color Palette Design",
        "description": "Create a cohesive color palette",
        "dueDate": "2025-10-26T23:59:59Z",
        "points": 50,
        "type": "project"
    },
    {
        "id": "assign_005",
        "courseId": "course_002",
        "title": "Typography Study",
        "description": "Analyze and apply typography principles",
        "dueDate": "2025-11-01T23:59:59Z",
        "points": 60,
        "type": "assignment"
    },
    {
        "id": "assign_006",
        "courseId": "course_003",
        "title": "Data Analysis Project",
        "description": "Analyze a dataset using Python",
        "dueDate": "2025-10-29T23:59:59Z",
        "points": 100,
        "type": "project"
    },
    {
        "id": "assign_007",
        "courseId": "course_003",
        "title": "ML Model Implementation",
        "description": "Build a simple machine learning model",
        "dueDate": "2025-11-03T23:59:59Z",
        "points": 100,
        "type": "project"
    },
    {
        "id": "assign_008",
        "courseId": "course_003",
        "title": "Data Visualization",
        "description": "Create visualizations using matplotlib/seaborn",
        "dueDate": "2025-11-06T23:59:59Z",
        "points": 75,
        "type": "assignment"
    },
    {
        "id": "assign_009",
        "courseId": "course_004",
        "title": "Market Analysis Report",
        "description": "Analyze a market and write a strategic report",
        "dueDate": "2025-10-27T23:59:59Z",
        "points": 100,
        "type": "project"
    },
    {
        "id": "assign_010",
        "courseId": "course_004",
        "title": "Business Plan Draft",
        "description": "Create a business plan outline",
        "dueDate": "2025-11-04T23:59:59Z",
        "points": 80,
        "type": "project"
    },
    {
        "id": "assign_011",
        "courseId": "course_001",
        "title": "Final Project Proposal",
        "description": "Submit proposal for final project",
        "dueDate": "2025-11-10T23:59:59Z",
        "points": 25,
        "type": "assignment"
    },
    {
        "id": "assign_012",
        "courseId": "course_002",
        "title": "Design Portfolio",
        "description": "Compile design portfolio",
        "dueDate": "2025-11-12T23:59:59Z",
        "points": 150,
        "type": "project"
    }
]

# Generate quizzes
quizzes = [
    {
        "id": "quiz_001",
        "courseId": "course_001",
        "title": "React Basics Quiz",
        "description": "Test your understanding of React fundamentals",
        "questions": [
            {"id": "q1", "question": "What is JSX?", "type": "multiple_choice", "options": ["JavaScript XML", "Java Syntax Extension", "JSON XML"], "correctAnswer": 0},
            {"id": "q2", "question": "What is a component?", "type": "multiple_choice", "options": ["A function", "A class", "Both"], "correctAnswer": 2}
        ],
        "maxScore": 100,
        "timeLimit": 30
    },
    {
        "id": "quiz_002",
        "courseId": "course_001",
        "title": "React Hooks Quiz",
        "description": "Test your knowledge of React Hooks",
        "questions": [
            {"id": "q3", "question": "What does useState return?", "type": "multiple_choice", "options": ["A value", "An array", "An object"], "correctAnswer": 1}
        ],
        "maxScore": 100,
        "timeLimit": 20
    },
    {
        "id": "quiz_003",
        "courseId": "course_002",
        "title": "Color Theory Quiz",
        "description": "Test your color theory knowledge",
        "questions": [
            {"id": "q4", "question": "What are primary colors?", "type": "multiple_choice", "options": ["Red, Blue, Yellow", "Red, Green, Blue", "Cyan, Magenta, Yellow"], "correctAnswer": 0}
        ],
        "maxScore": 100,
        "timeLimit": 25
    },
    {
        "id": "quiz_004",
        "courseId": "course_002",
        "title": "Typography Quiz",
        "description": "Test typography fundamentals",
        "questions": [
            {"id": "q5", "question": "What is kerning?", "type": "multiple_choice", "options": ["Letter spacing", "Line spacing", "Word spacing"], "correctAnswer": 0}
        ],
        "maxScore": 100,
        "timeLimit": 20
    },
    {
        "id": "quiz_005",
        "courseId": "course_003",
        "title": "Python Basics Quiz",
        "description": "Test Python programming basics",
        "questions": [
            {"id": "q6", "question": "What is a list comprehension?", "type": "multiple_choice", "options": ["A way to create lists", "A loop", "A function"], "correctAnswer": 0}
        ],
        "maxScore": 100,
        "timeLimit": 30
    },
    {
        "id": "quiz_006",
        "courseId": "course_003",
        "title": "Machine Learning Quiz",
        "description": "Test ML concepts",
        "questions": [
            {"id": "q7", "question": "What is supervised learning?", "type": "multiple_choice", "options": ["Learning with labels", "Learning without labels", "Reinforcement learning"], "correctAnswer": 0}
        ],
        "maxScore": 100,
        "timeLimit": 25
    },
    {
        "id": "quiz_007",
        "courseId": "course_004",
        "title": "Business Strategy Quiz",
        "description": "Test strategic thinking concepts",
        "questions": [
            {"id": "q8", "question": "What is SWOT analysis?", "type": "multiple_choice", "options": ["Strengths, Weaknesses, Opportunities, Threats", "Sales, Work, Operations, Technology", "Strategy, Workflow, Objectives, Tactics"], "correctAnswer": 0}
        ],
        "maxScore": 100,
        "timeLimit": 20
    },
    {
        "id": "quiz_008",
        "courseId": "course_001",
        "title": "Advanced React Patterns",
        "description": "Test advanced React concepts",
        "questions": [
            {"id": "q9", "question": "What is the purpose of useMemo?", "type": "multiple_choice", "options": ["Memoize values", "Memoize functions", "Both"], "correctAnswer": 0}
        ],
        "maxScore": 100,
        "timeLimit": 25
    }
]

# Generate submissions (empty for now, will be populated as students submit)
submissions = []

# Write all JSON files
(BASE_DIR / "students" / "students.json").write_text(json.dumps(students, indent=2))
(BASE_DIR / "courses" / "courses.json").write_text(json.dumps(courses, indent=2))
(BASE_DIR / "enrollments" / "enrollments.json").write_text(json.dumps(enrollments, indent=2))
(BASE_DIR / "assignments" / "assignments.json").write_text(json.dumps(assignments, indent=2))
(BASE_DIR / "quizzes" / "quizzes.json").write_text(json.dumps(quizzes, indent=2))
(BASE_DIR / "submissions" / "submissions.json").write_text(json.dumps(submissions, indent=2))

print("Sample data generated successfully!")


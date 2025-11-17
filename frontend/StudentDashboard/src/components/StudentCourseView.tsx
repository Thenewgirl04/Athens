import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  LayoutDashboard,
  BookOpen,
  FileText,
  User,
  LogOut,
  Bell,
  FileIcon,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Link as LinkIcon,
  Video,
  ChevronDown,
  Lightbulb,
  Target,
  Briefcase,
  CalendarClock,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { AssignmentCard, Assignment as AssignmentType } from './AssignmentCard';
import { AssignmentDetails } from './AssignmentDetails';
import { CourseAssignmentsTab } from './CourseAssignmentsTab';
import { ModulesTab, Module as ModuleType } from './ModulesTab';
import { useAuth } from '../contexts/AuthContext';

interface Lesson {
  id: number;
  title: string;
  uploadDate: string;
  fileSize: string;
  type: string;
}

interface Assignment {
  id: number;
  title: string;
  dueDate: string;
  description: string;
  status: 'Not Submitted' | 'Submitted' | 'Graded';
  grade?: string;
}

interface Resource {
  id: number;
  name: string;
  type: 'PDF' | 'Link' | 'Video';
  fileSize?: string;
  uploadDate: string;
}

interface ModuleOverview {
  weekTitle: string;
  subtopics: string[];
  whatYouLearn: string[];
  whyItMatters: string;
  realWorldApplications: string[];
}

interface CurriculumModule {
  id: number;
  number: number;
  title: string;
  description: string;
  estimatedTime: string;
  overview: ModuleOverview;
  resources: Resource[];
}

type TabValue = 'lessons' | 'assignments' | 'curriculum';

// Mock data based on course ID
const getCourseData = (courseId: number) => {
  const courses = {
    1: {
      title: 'Introduction to Programming',
      code: 'CS101',
      modules: [
        {
          id: 1,
          title: 'Introduction to Programming',
          description: 'Learn the fundamentals of programming and Python syntax',
          notes: [
            { id: 1, title: 'What is Programming?', duration: '8 min read', completed: true },
            { id: 2, title: 'Python Installation Guide', duration: '5 min read', completed: true },
            { id: 3, title: 'Variables & Data Types', duration: '12 min read', completed: false },
            { id: 4, title: 'Basic Operators', duration: '10 min read', completed: false },
            { id: 5, title: 'Input & Output', duration: '7 min read', completed: false },
          ],
          quiz: {
            id: 1,
            title: 'Module 1: Programming Fundamentals Quiz',
            totalQuestions: 10,
            timeLimit: 15,
            totalPoints: 100,
            completed: false,
          },
        },
        {
          id: 2,
          title: 'Data Structures',
          description: 'Explore lists, dictionaries, sets, and tuples',
          notes: [
            { id: 6, title: 'Introduction to Lists', duration: '10 min read', completed: false },
            { id: 7, title: 'Working with Dictionaries', duration: '12 min read', completed: false },
            { id: 8, title: 'Sets and Tuples', duration: '9 min read', completed: false },
            { id: 9, title: 'List Comprehensions', duration: '15 min read', completed: false },
            { id: 10, title: 'Practice Exercises', duration: '20 min', completed: false },
          ],
          quiz: {
            id: 2,
            title: 'Module 2: Data Structures Quiz',
            totalQuestions: 12,
            timeLimit: 20,
            totalPoints: 120,
            completed: false,
          },
        },
        {
          id: 3,
          title: 'Object-Oriented Programming',
          description: 'Master classes, objects, and inheritance',
          notes: [
            { id: 11, title: 'Introduction to OOP', duration: '10 min read', completed: false },
            { id: 12, title: 'Creating Classes', duration: '14 min read', completed: false },
            { id: 13, title: 'Class Attributes & Methods', duration: '12 min read', completed: false },
            { id: 14, title: 'Inheritance Fundamentals', duration: '16 min read', completed: false },
            { id: 15, title: 'Polymorphism Explained', duration: '13 min read', completed: false },
            { id: 16, title: 'OOP Practice Projects', duration: '25 min', completed: false },
          ],
          quiz: {
            id: 3,
            title: 'Module 3: Object-Oriented Programming Quiz',
            totalQuestions: 15,
            timeLimit: 25,
            totalPoints: 150,
            completed: false,
          },
        },
        {
          id: 4,
          title: 'File Handling and APIs',
          description: 'Work with files and external APIs',
          notes: [
            { id: 17, title: 'Reading & Writing Files', duration: '11 min read', completed: false },
            { id: 18, title: 'Working with CSV Files', duration: '9 min read', completed: false },
            { id: 19, title: 'JSON Data Handling', duration: '10 min read', completed: false },
            { id: 20, title: 'Introduction to APIs', duration: '15 min read', completed: false },
            { id: 21, title: 'Making HTTP Requests', duration: '12 min read', completed: false },
          ],
          quiz: {
            id: 4,
            title: 'Module 4: File Handling and APIs Quiz',
            totalQuestions: 10,
            timeLimit: 15,
            totalPoints: 100,
            completed: false,
          },
        },
      ],
      lessons: [
        { id: 1, title: 'Introduction to Python Basics', uploadDate: 'Nov 1, 2025', fileSize: '2.4 MB', type: 'PDF' },
        { id: 2, title: 'Variables and Data Types', uploadDate: 'Nov 3, 2025', fileSize: '1.8 MB', type: 'PDF' },
        { id: 3, title: 'Control Flow and Loops', uploadDate: 'Nov 5, 2025', fileSize: '3.2 MB', type: 'Video' },
        { id: 4, title: 'Functions and Modules', uploadDate: 'Nov 7, 2025', fileSize: '2.1 MB', type: 'PDF' },
      ],
      assignmentsNew: [
        { 
          id: 1, 
          title: 'Python Basics Quiz', 
          courseName: 'Introduction to Programming',
          dueDate: 'Nov 15, 2025 at 11:59 PM',
          points: 100,
          status: 'submitted' as const,
          score: 92,
          category: 'upcoming' as const,
        },
        { 
          id: 2, 
          title: 'Loop Practice Problems', 
          courseName: 'Introduction to Programming',
          dueDate: 'Nov 20, 2025 at 11:59 PM',
          points: 75,
          status: 'not-submitted' as const,
          category: 'upcoming' as const,
        },
        { 
          id: 3, 
          title: 'Final Project: Calculator App', 
          courseName: 'Introduction to Programming',
          dueDate: 'Dec 1, 2025 at 11:59 PM',
          points: 200,
          status: 'not-submitted' as const,
          category: 'upcoming' as const,
        },
        { 
          id: 4, 
          title: 'Mid-term Exam', 
          courseName: 'Introduction to Programming',
          dueDate: 'Oct 31, 2025 at 11:59 PM',
          points: 150,
          status: 'missing' as const,
          category: 'overdue' as const,
        },
        { 
          id: 5, 
          title: 'Bonus Assignment', 
          courseName: 'Introduction to Programming',
          dueDate: null,
          points: 50,
          status: 'graded' as const,
          score: 48,
          category: 'undated' as const,
        },
      ],
      assignments: [
        { id: 1, title: 'Python Basics Quiz', dueDate: 'Nov 15, 2025', description: 'Complete the quiz covering variables, data types, and basic operations.', status: 'Submitted' as const, grade: 'A' },
        { id: 2, title: 'Loop Practice Problems', dueDate: 'Nov 20, 2025', description: 'Solve 5 programming challenges using loops and conditional statements.', status: 'Not Submitted' as const },
        { id: 3, title: 'Final Project: Calculator App', dueDate: 'Dec 1, 2025', description: 'Build a command-line calculator using Python functions.', status: 'Not Submitted' as const },
      ],
      curriculum: [
        { 
          id: 1, 
          number: 1, 
          title: 'Introduction to Programming', 
          description: 'Learn the fundamentals of programming and Python syntax', 
          estimatedTime: '2 weeks',
          overview: {
            weekTitle: 'Week 1-2: Introduction to Modern Programming Concepts',
            subtopics: [
              'Understanding what programming is and why it matters',
              'Introduction to the digital problem-solving mindset',
              'The role of Python in modern software development',
              'Basic terminology (syntax, variables, data types)',
              'Setting up your development environment',
            ],
            whatYouLearn: [
              'Write your first Python programs',
              'Understand variables and data types',
              'Use basic operators and expressions',
              'Debug simple code errors',
            ],
            whyItMatters: 'Programming is the foundation of all modern technology. By learning Python, you\'re gaining a skill that opens doors to careers in web development, data science, AI, automation, and more.',
            realWorldApplications: [
              'Automating repetitive tasks in your daily work',
              'Building web applications and APIs',
              'Analyzing data and creating visualizations',
              'Creating games and interactive programs',
            ],
          },
          resources: [
            { id: 1, name: 'Intro to Python', type: 'PDF' as const, fileSize: '2.4 MB', uploadDate: 'Nov 1, 2025' },
            { id: 2, name: 'Official Python Docs', type: 'Link' as const, uploadDate: 'Nov 1, 2025' },
            { id: 3, name: 'Intro Video Lecture', type: 'Video' as const, fileSize: '45 MB', uploadDate: 'Nov 1, 2025' },
            { id: 4, name: 'Python Installation Guide', type: 'PDF' as const, fileSize: '1.2 MB', uploadDate: 'Nov 1, 2025' },
          ]
        },
        { 
          id: 2, 
          number: 2, 
          title: 'Data Structures', 
          description: 'Explore lists, dictionaries, sets, and tuples', 
          estimatedTime: '3 weeks',
          overview: {
            weekTitle: 'Week 3-5: Mastering Python Data Structures',
            subtopics: [
              'Understanding different collection types in Python',
              'Working with lists: creation, indexing, and slicing',
              'Dictionaries for key-value pair storage',
              'Sets for unique collections and mathematical operations',
              'Tuples for immutable data',
              'Choosing the right data structure for your problem',
            ],
            whatYouLearn: [
              'Create and manipulate various data structures',
              'Iterate through collections efficiently',
              'Perform common operations like sorting and searching',
              'Understand when to use each data structure type',
            ],
            whyItMatters: 'Data structures are the building blocks of efficient programs. Choosing the right structure can make your code faster, more readable, and easier to maintain.',
            realWorldApplications: [
              'Managing user data in applications',
              'Building inventory systems',
              'Processing and organizing large datasets',
              'Creating shopping carts and wish lists',
            ],
          },
          resources: [
            { id: 1, name: 'Data Structures Overview', type: 'PDF' as const, fileSize: '3.1 MB', uploadDate: 'Nov 8, 2025' },
            { id: 2, name: 'Working with Lists', type: 'Video' as const, fileSize: '52 MB', uploadDate: 'Nov 8, 2025' },
            { id: 3, name: 'Dictionary Deep Dive', type: 'PDF' as const, fileSize: '2.8 MB', uploadDate: 'Nov 10, 2025' },
            { id: 4, name: 'Python Collections Docs', type: 'Link' as const, uploadDate: 'Nov 8, 2025' },
            { id: 5, name: 'Sets and Tuples Tutorial', type: 'Video' as const, fileSize: '38 MB', uploadDate: 'Nov 12, 2025' },
            { id: 6, name: 'Practice Problems', type: 'PDF' as const, fileSize: '1.5 MB', uploadDate: 'Nov 12, 2025' },
          ]
        },
        { 
          id: 3, 
          number: 3, 
          title: 'Object-Oriented Programming', 
          description: 'Master classes, objects, and inheritance', 
          estimatedTime: '3 weeks',
          overview: {
            weekTitle: 'Week 6-8: Object-Oriented Programming Fundamentals',
            subtopics: [
              'Introduction to object-oriented programming concepts',
              'Creating and using classes and objects',
              'Understanding attributes and methods',
              'Inheritance and code reusability',
              'Polymorphism and method overriding',
              'Encapsulation and data hiding',
            ],
            whatYouLearn: [
              'Design programs using OOP principles',
              'Create reusable and maintainable code',
              'Model real-world entities as objects',
              'Implement inheritance hierarchies',
            ],
            whyItMatters: 'OOP is the dominant programming paradigm in modern software development. Understanding these concepts is essential for working with frameworks, building scalable applications, and collaborating with other developers.',
            realWorldApplications: [
              'Building user authentication systems',
              'Creating game characters with shared behaviors',
              'Designing e-commerce product catalogs',
              'Developing modular software components',
            ],
          },
          resources: [
            { id: 1, name: 'OOP Fundamentals', type: 'PDF' as const, fileSize: '4.2 MB', uploadDate: 'Nov 15, 2025' },
            { id: 2, name: 'Classes and Objects', type: 'Video' as const, fileSize: '65 MB', uploadDate: 'Nov 15, 2025' },
            { id: 3, name: 'Inheritance Tutorial', type: 'PDF' as const, fileSize: '3.5 MB', uploadDate: 'Nov 17, 2025' },
            { id: 4, name: 'Polymorphism Explained', type: 'Video' as const, fileSize: '42 MB', uploadDate: 'Nov 19, 2025' },
            { id: 5, name: 'Real Python OOP Guide', type: 'Link' as const, uploadDate: 'Nov 15, 2025' },
          ]
        },
        { 
          id: 4, 
          number: 4, 
          title: 'File Handling and APIs', 
          description: 'Work with files and external APIs', 
          estimatedTime: '2 weeks',
          overview: {
            weekTitle: 'Week 9-10: Working with External Data',
            subtopics: [
              'Reading from and writing to files',
              'Working with different file formats (text, CSV, JSON)',
              'Understanding APIs and REST principles',
              'Making HTTP requests in Python',
              'Parsing and handling API responses',
              'Error handling and exceptions',
            ],
            whatYouLearn: [
              'Read and write data to files',
              'Connect to and consume web APIs',
              'Process JSON and CSV data',
              'Handle errors gracefully',
            ],
            whyItMatters: 'Most modern applications need to interact with external data sources. Whether you\'re saving user preferences, importing datasets, or connecting to web services, these skills are essential.',
            realWorldApplications: [
              'Importing and exporting data for analysis',
              'Integrating with third-party services (weather, maps, payments)',
              'Building data pipelines and ETL processes',
              'Creating backup and restore functionality',
            ],
          },
          resources: [
            { id: 1, name: 'File I/O in Python', type: 'PDF' as const, fileSize: '2.7 MB', uploadDate: 'Nov 22, 2025' },
            { id: 2, name: 'Working with APIs', type: 'Video' as const, fileSize: '58 MB', uploadDate: 'Nov 22, 2025' },
            { id: 3, name: 'JSON and CSV Handling', type: 'PDF' as const, fileSize: '2.1 MB', uploadDate: 'Nov 24, 2025' },
            { id: 4, name: 'Requests Library Docs', type: 'Link' as const, uploadDate: 'Nov 22, 2025' },
          ]
        },
      ],
    },
    2: {
      title: 'Digital Art Masterclass',
      code: 'ART201',
      modules: [
        {
          id: 1,
          title: 'Fundamentals of Digital Art',
          description: 'Introduction to digital art tools and techniques',
          notes: [
            { id: 1, title: 'Understanding Color Theory', duration: '10 min read', completed: false },
            { id: 2, title: 'Digital Art Software Basics', duration: '15 min read', completed: false },
            { id: 3, title: 'Brush Types and Usage', duration: '12 min read', completed: false },
            { id: 4, title: 'Layer Management', duration: '9 min read', completed: false },
          ],
          quiz: {
            id: 1,
            title: 'Module 1: Digital Art Fundamentals Quiz',
            totalQuestions: 8,
            timeLimit: 12,
            totalPoints: 80,
            completed: false,
          },
        },
        {
          id: 2,
          title: 'Advanced Painting Techniques',
          description: 'Master brushwork and layering',
          notes: [
            { id: 5, title: 'Advanced Layering Strategies', duration: '14 min read', completed: false },
            { id: 6, title: 'Custom Brush Creation', duration: '18 min read', completed: false },
            { id: 7, title: 'Light and Shadow Mastery', duration: '16 min read', completed: false },
            { id: 8, title: 'Texture Application', duration: '13 min read', completed: false },
          ],
          quiz: {
            id: 2,
            title: 'Module 2: Advanced Painting Techniques Quiz',
            totalQuestions: 10,
            timeLimit: 15,
            totalPoints: 100,
            completed: false,
          },
        },
        {
          id: 3,
          title: 'Character Design',
          description: 'Create compelling character designs',
          notes: [
            { id: 9, title: 'Character Design Principles', duration: '12 min read', completed: false },
            { id: 10, title: 'Anatomy for Character Artists', duration: '20 min read', completed: false },
            { id: 11, title: 'Facial Expressions Guide', duration: '15 min read', completed: false },
            { id: 12, title: 'Character Sheet Creation', duration: '18 min read', completed: false },
          ],
          quiz: {
            id: 3,
            title: 'Module 3: Character Design Quiz',
            totalQuestions: 12,
            timeLimit: 18,
            totalPoints: 120,
            completed: false,
          },
        },
      ],
      lessons: [
        { id: 1, title: 'Color Theory Fundamentals', uploadDate: 'Nov 2, 2025', fileSize: '5.6 MB', type: 'Video' },
        { id: 2, title: 'Digital Painting Techniques', uploadDate: 'Nov 4, 2025', fileSize: '8.2 MB', type: 'Video' },
        { id: 3, title: 'Composition and Layout', uploadDate: 'Nov 6, 2025', fileSize: '3.4 MB', type: 'PDF' },
      ],
      assignmentsNew: [
        { 
          id: 1, 
          title: 'Color Palette Creation', 
          courseName: 'Digital Art Masterclass',
          dueDate: 'Nov 18, 2025 at 11:59 PM',
          points: 80,
          status: 'graded' as const,
          score: 75,
          category: 'upcoming' as const,
        },
        { 
          id: 2, 
          title: 'Portrait Study', 
          courseName: 'Digital Art Masterclass',
          dueDate: 'Nov 25, 2025 at 11:59 PM',
          points: 100,
          status: 'not-submitted' as const,
          category: 'upcoming' as const,
        },
        { 
          id: 3, 
          title: 'Sketch Assignment', 
          courseName: 'Digital Art Masterclass',
          dueDate: null,
          points: 30,
          status: 'submitted' as const,
          category: 'undated' as const,
        },
      ],
      assignments: [
        { id: 1, title: 'Color Palette Creation', dueDate: 'Nov 18, 2025', description: 'Create 3 unique color palettes for different moods.', status: 'Graded' as const, grade: 'B+' },
        { id: 2, title: 'Portrait Study', dueDate: 'Nov 25, 2025', description: 'Complete a digital portrait using the techniques learned.', status: 'Not Submitted' as const },
      ],
      curriculum: [
        { 
          id: 1, 
          number: 1, 
          title: 'Introduction to Programming', 
          description: 'Learn the fundamentals of programming and Python syntax', 
          estimatedTime: '2 weeks',
          overview: {
            weekTitle: 'Week 1-2: Introduction to Modern Programming Concepts',
            subtopics: [
              'Understanding what programming is and why it matters',
              'Introduction to the digital problem-solving mindset',
              'The role of Python in modern software development',
              'Basic terminology (syntax, variables, data types)',
              'Setting up your development environment',
            ],
            whatYouLearn: [
              'Write your first Python programs',
              'Understand variables and data types',
              'Use basic operators and expressions',
              'Debug simple code errors',
            ],
            whyItMatters: 'Programming is the foundation of all modern technology. By learning Python, you\'re gaining a skill that opens doors to careers in web development, data science, AI, automation, and more.',
            realWorldApplications: [
              'Automating repetitive tasks in your daily work',
              'Building web applications and APIs',
              'Analyzing data and creating visualizations',
              'Creating games and interactive programs',
            ],
          },
          resources: [
            { id: 1, name: 'Intro to Python', type: 'PDF' as const, fileSize: '2.4 MB', uploadDate: 'Nov 1, 2025' },
            { id: 2, name: 'Official Python Docs', type: 'Link' as const, uploadDate: 'Nov 1, 2025' },
            { id: 3, name: 'Intro Video Lecture', type: 'Video' as const, fileSize: '45 MB', uploadDate: 'Nov 1, 2025' },
            { id: 4, name: 'Python Installation Guide', type: 'PDF' as const, fileSize: '1.2 MB', uploadDate: 'Nov 1, 2025' },
          ]
        },
        { 
          id: 2, 
          number: 2, 
          title: 'Data Structures', 
          description: 'Explore lists, dictionaries, sets, and tuples', 
          estimatedTime: '3 weeks',
          overview: {
            weekTitle: 'Week 3-5: Mastering Python Data Structures',
            subtopics: [
              'Understanding different collection types in Python',
              'Working with lists: creation, indexing, and slicing',
              'Dictionaries for key-value pair storage',
              'Sets for unique collections and mathematical operations',
              'Tuples for immutable data',
              'Choosing the right data structure for your problem',
            ],
            whatYouLearn: [
              'Create and manipulate various data structures',
              'Iterate through collections efficiently',
              'Perform common operations like sorting and searching',
              'Understand when to use each data structure type',
            ],
            whyItMatters: 'Data structures are the building blocks of efficient programs. Choosing the right structure can make your code faster, more readable, and easier to maintain.',
            realWorldApplications: [
              'Managing user data in applications',
              'Building inventory systems',
              'Processing and organizing large datasets',
              'Creating shopping carts and wish lists',
            ],
          },
          resources: [
            { id: 1, name: 'Data Structures Overview', type: 'PDF' as const, fileSize: '3.1 MB', uploadDate: 'Nov 8, 2025' },
            { id: 2, name: 'Working with Lists', type: 'Video' as const, fileSize: '52 MB', uploadDate: 'Nov 8, 2025' },
            { id: 3, name: 'Dictionary Deep Dive', type: 'PDF' as const, fileSize: '2.8 MB', uploadDate: 'Nov 10, 2025' },
            { id: 4, name: 'Python Collections Docs', type: 'Link' as const, uploadDate: 'Nov 8, 2025' },
            { id: 5, name: 'Sets and Tuples Tutorial', type: 'Video' as const, fileSize: '38 MB', uploadDate: 'Nov 12, 2025' },
            { id: 6, name: 'Practice Problems', type: 'PDF' as const, fileSize: '1.5 MB', uploadDate: 'Nov 12, 2025' },
          ]
        },
        { 
          id: 3, 
          number: 3, 
          title: 'Object-Oriented Programming', 
          description: 'Master classes, objects, and inheritance', 
          estimatedTime: '3 weeks',
          overview: {
            weekTitle: 'Week 6-8: Object-Oriented Programming Fundamentals',
            subtopics: [
              'Introduction to object-oriented programming concepts',
              'Creating and using classes and objects',
              'Understanding attributes and methods',
              'Inheritance and code reusability',
              'Polymorphism and method overriding',
              'Encapsulation and data hiding',
            ],
            whatYouLearn: [
              'Design programs using OOP principles',
              'Create reusable and maintainable code',
              'Model real-world entities as objects',
              'Implement inheritance hierarchies',
            ],
            whyItMatters: 'OOP is the dominant programming paradigm in modern software development. Understanding these concepts is essential for working with frameworks, building scalable applications, and collaborating with other developers.',
            realWorldApplications: [
              'Building user authentication systems',
              'Creating game characters with shared behaviors',
              'Designing e-commerce product catalogs',
              'Developing modular software components',
            ],
          },
          resources: [
            { id: 1, name: 'OOP Fundamentals', type: 'PDF' as const, fileSize: '4.2 MB', uploadDate: 'Nov 15, 2025' },
            { id: 2, name: 'Classes and Objects', type: 'Video' as const, fileSize: '65 MB', uploadDate: 'Nov 15, 2025' },
            { id: 3, name: 'Inheritance Tutorial', type: 'PDF' as const, fileSize: '3.5 MB', uploadDate: 'Nov 17, 2025' },
            { id: 4, name: 'Polymorphism Explained', type: 'Video' as const, fileSize: '42 MB', uploadDate: 'Nov 19, 2025' },
            { id: 5, name: 'Real Python OOP Guide', type: 'Link' as const, uploadDate: 'Nov 15, 2025' },
          ]
        },
        { 
          id: 4, 
          number: 4, 
          title: 'File Handling and APIs', 
          description: 'Work with files and external APIs', 
          estimatedTime: '2 weeks',
          overview: {
            weekTitle: 'Week 9-10: Working with External Data',
            subtopics: [
              'Reading from and writing to files',
              'Working with different file formats (text, CSV, JSON)',
              'Understanding APIs and REST principles',
              'Making HTTP requests in Python',
              'Parsing and handling API responses',
              'Error handling and exceptions',
            ],
            whatYouLearn: [
              'Read and write data to files',
              'Connect to and consume web APIs',
              'Process JSON and CSV data',
              'Handle errors gracefully',
            ],
            whyItMatters: 'Most modern applications need to interact with external data sources. Whether you\'re saving user preferences, importing datasets, or connecting to web services, these skills are essential.',
            realWorldApplications: [
              'Importing and exporting data for analysis',
              'Integrating with third-party services (weather, maps, payments)',
              'Building data pipelines and ETL processes',
              'Creating backup and restore functionality',
            ],
          },
          resources: [
            { id: 1, name: 'File I/O in Python', type: 'PDF' as const, fileSize: '2.7 MB', uploadDate: 'Nov 22, 2025' },
            { id: 2, name: 'Working with APIs', type: 'Video' as const, fileSize: '58 MB', uploadDate: 'Nov 22, 2025' },
            { id: 3, name: 'JSON and CSV Handling', type: 'PDF' as const, fileSize: '2.1 MB', uploadDate: 'Nov 24, 2025' },
            { id: 4, name: 'Requests Library Docs', type: 'Link' as const, uploadDate: 'Nov 22, 2025' },
          ]
        },
      ],
    },
  };

  return courses[courseId as keyof typeof courses] || courses[1];
};

export function StudentCourseView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  const [activeNav, setActiveNav] = useState('courses');
  const [activeTab, setActiveTab] = useState<TabValue>('lessons');
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentType | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'not-submitted' | 'to-be-graded' | 'graded' | 'overdue' | 'upcoming'>('all');
  const [overdueOpen, setOverdueOpen] = useState(true);
  const [upcomingOpen, setUpcomingOpen] = useState(true);
  const [undatedOpen, setUndatedOpen] = useState(true);
  
  const courseIdNum = courseId ? parseInt(courseId, 10) : 1;
  const courseData = getCourseData(courseIdNum);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, path: '/courses' },
    { id: 'assignments', label: 'Assignments', icon: FileText, path: '/assignments' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  const handleNavigation = (path: string, id: string) => {
    setActiveNav(id);
    navigate(path);
  };

  const handleBack = () => {
    navigate('/courses');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabActiveStyles: Record<TabValue, { bg: string; text: string }> = {
    lessons: { bg: 'bg-indigo-600', text: '!text-white' },
    assignments: { bg: 'bg-emerald-600', text: '!text-white' },
    curriculum: { bg: 'bg-sky-600', text: '!text-white' },
  };

  const getTabTriggerClass = (tab: TabValue) => {
    const baseClasses = 'group transition-all';
    if (activeTab === tab) {
      const style = tabActiveStyles[tab];
      // Force override default TabsTrigger styles for active state
      return `${baseClasses} ${style.bg} ${style.text} shadow-md font-semibold data-[state=active]:${style.bg} data-[state=active]:${style.text}`;
    }
    return `${baseClasses} text-slate-600 hover:text-slate-900 hover:bg-slate-50 data-[state=active]:bg-transparent data-[state=active]:text-slate-600`;
  };

  const getTabIconClass = (tab: TabValue) =>
    `w-4 h-4 mr-2 transition-colors flex-shrink-0 ${
      activeTab === tab ? '!text-white' : 'text-slate-500'
    }`;

  const getStatusBadge = (status: Assignment['status']) => {
    switch (status) {
      case 'Graded':
        return <Badge className="bg-emerald-500">Graded</Badge>;
      case 'Submitted':
        return <Badge className="bg-blue-500">Submitted</Badge>;
      case 'Not Submitted':
        return <Badge variant="outline">Not Submitted</Badge>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-indigo-600">LearnHub</h1>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.path, item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeNav === item.id || location.pathname === item.path
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-slate-900 font-semibold">Course Details</h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Avatar>
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Arthur" />
                <AvatarFallback>AR</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Course Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Course Hero Section */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700">
            <div className="px-8 py-12">
              <button 
                onClick={handleBack} 
                className="flex items-center gap-2 mb-6 text-white/90 hover:text-white transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4 text-white/90" />
                Back to Courses
              </button>
              
              <div className="max-w-4xl">
                <div className="mb-4">
                  <Badge className="bg-white/20 text-blue-950 border-white/30 mb-4 hover:bg-white/30">
                    {courseData.code}
                  </Badge>
                  <h1 className="text-4xl font-bold mb-3 text-blue-950">{courseData.title}</h1>
                  <p className="text-blue-950 text-lg">
                    Master the fundamentals and advance your skills with comprehensive modules and hands-on assignments
                  </p>
                </div>
                
                {/* Course Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/20 hover:bg-white/15 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/30 rounded-xl shadow-md ring-1 ring-white/60">
                        <BookOpen className="w-6 h-6 text-blue-950 drop-shadow" />
                      </div>
                      <div>
                        <p className="text-3xl font-semibold text-blue-950 drop-shadow">{courseData.modules?.length || 0}</p>
                        <p className="text-sm text-blue-950 font-medium">Modules</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/20 hover:bg-white/15 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/30 rounded-xl shadow-md ring-1 ring-white/60">
                        <FileText className="w-6 h-6 text-blue-950 drop-shadow" />
                      </div>
                      <div>
                        <p className="text-3xl font-semibold text-blue-950 drop-shadow">{courseData.assignmentsNew?.length || 0}</p>
                        <p className="text-sm text-blue-950 font-medium">Assignments</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/20 hover:bg-white/15 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/30 rounded-xl shadow-md ring-1 ring-white/60">
                        <Clock className="w-6 h-6 text-blue-950 drop-shadow" />
                      </div>
                      <div>
                        <p className="text-3xl font-semibold text-blue-950 drop-shadow">10</p>
                        <p className="text-sm text-blue-950 font-medium">Weeks</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/20 hover:bg-white/15 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/30 rounded-xl shadow-md ring-1 ring-white/60">
                        <Award className="w-6 h-6 text-blue-950 drop-shadow" />
                      </div>
                      <div>
                        <p className="text-3xl font-semibold text-blue-950 drop-shadow">100%</p>
                        <p className="text-sm text-blue-950 font-medium">Completion</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content Section */}
          <div className="p-8">

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab((value as TabValue) || 'lessons')}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8 bg-slate-100 border border-slate-200 p-1.5 rounded-lg gap-1.5">
              <TabsTrigger 
                value="lessons" 
                className={getTabTriggerClass('lessons')}
              >
                <BookOpen className={getTabIconClass('lessons')} />
                Lessons / Modules
              </TabsTrigger>
              <TabsTrigger 
                value="assignments"
                className={getTabTriggerClass('assignments')}
              >
                <FileText className={getTabIconClass('assignments')} />
                Assignments
              </TabsTrigger>
              <TabsTrigger 
                value="curriculum"
                className={getTabTriggerClass('curriculum')}
              >
                <Target className={getTabIconClass('curriculum')} />
                Curriculum
              </TabsTrigger>
            </TabsList>

            {/* Lessons Tab */}
            <TabsContent value="lessons" className="space-y-4">
              <ModulesTab modules={courseData.modules || []} />
            </TabsContent>

            {/* Assignments Tab */}
            <TabsContent value="assignments" className="space-y-4">
              <CourseAssignmentsTab assignments={courseData.assignmentsNew} />
            </TabsContent>

            {/* Curriculum Tab */}
            <TabsContent value="curriculum" className="space-y-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Course Curriculum</h3>
                <p className="text-slate-600">Explore the comprehensive curriculum designed to help you master the course material</p>
              </div>
              
              <Accordion type="single" collapsible className="space-y-4">
                {courseData.curriculum.map((module) => (
                  <AccordionItem 
                    key={module.id} 
                    value={`module-${module.id}`}
                    className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]>div>svg]:rotate-180">
                      <div className="flex items-start gap-4 flex-1 text-left">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex-shrink-0">
                          {module.number}
                        </div>
                        <div className="flex-1 pr-4">
                          <h4 className="text-slate-900 mb-2">
                            Module {module.number}: {module.title}
                          </h4>
                          <p className="text-sm text-slate-600 mb-3">{module.description}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {module.estimatedTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileIcon className="w-4 h-4" />
                              {module.resources.length} resources
                            </span>
                          </div>
                        </div>
                        <ChevronDown className="w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="pl-16 space-y-6">
                        {/* Module Overview Section */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 space-y-6">
                          {/* Week Breakdown Title */}
                          <div>
                            <h4 className="text-slate-900 mb-2">{module.overview.weekTitle}</h4>
                          </div>

                          {/* Subtopics */}
                          <div>
                            <h5 className="text-slate-900 mb-3 flex items-center gap-2">
                              <div className="w-1 h-5 bg-indigo-600 rounded"></div>
                              Key Topics Covered
                            </h5>
                            <ul className="space-y-2">
                              {module.overview.subtopics.map((subtopic, index) => (
                                <li key={index} className="flex items-start gap-2 text-slate-700">
                                  <span className="text-indigo-600 mt-1.5">•</span>
                                  <span>{subtopic}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* What You'll Learn */}
                          <div>
                            <h5 className="text-slate-900 mb-3 flex items-center gap-2">
                              <Lightbulb className="w-5 h-5 text-amber-600" />
                              What You'll Learn
                            </h5>
                            <ul className="space-y-2">
                              {module.overview.whatYouLearn.map((item, index) => (
                                <li key={index} className="flex items-start gap-2 text-slate-700">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Why This Matters */}
                          <div>
                            <h5 className="text-slate-900 mb-3 flex items-center gap-2">
                              <Target className="w-5 h-5 text-rose-600" />
                              Why This Matters
                            </h5>
                            <p className="text-slate-700">{module.overview.whyItMatters}</p>
                          </div>

                          {/* Real-World Applications */}
                          <div>
                            <h5 className="text-slate-900 mb-3 flex items-center gap-2">
                              <Briefcase className="w-5 h-5 text-blue-600" />
                              Real-World Applications
                            </h5>
                            <ul className="space-y-2">
                              {module.overview.realWorldApplications.map((app, index) => (
                                <li key={index} className="flex items-start gap-2 text-slate-700">
                                  <span className="text-blue-600 mt-1.5">▸</span>
                                  <span>{app}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Module Resources Section */}
                        <div>
                          <h5 className="text-slate-900 mb-4">Module Resources</h5>
                          <div className="space-y-3">
                            {module.resources.map((resource) => {
                              const getResourceIcon = (type: Resource['type']) => {
                                switch (type) {
                                  case 'PDF':
                                    return <FileIcon className="w-5 h-5 text-red-500" />;
                                  case 'Link':
                                    return <LinkIcon className="w-5 h-5 text-blue-500" />;
                                  case 'Video':
                                    return <Video className="w-5 h-5 text-purple-500" />;
                                }
                              };

                              return (
                                <div
                                  key={resource.id}
                                  className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all"
                                >
                                  <div className="p-2 bg-slate-50 rounded">
                                    {getResourceIcon(resource.type)}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-slate-900">{resource.name}</p>
                                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {resource.uploadDate}
                                      </span>
                                      {resource.fileSize && (
                                        <span>• {resource.fileSize}</span>
                                      )}
                                      <Badge variant="outline" className="text-xs">
                                        {resource.type}
                                      </Badge>
                                    </div>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    View
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
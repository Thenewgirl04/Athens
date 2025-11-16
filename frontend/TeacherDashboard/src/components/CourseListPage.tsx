import { PlusCircle, Users, TrendingUp, Edit, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

interface Course {
  id: string;
  name: string;
  code: string;
  students: number;
  completionRate: number;
  status: "active" | "archived" | "draft";
  semester: string;
}

const courses: Course[] = [
  {
    id: "1",
    name: "Introduction to Computer Science",
    code: "CS101",
    students: 45,
    completionRate: 78,
    status: "active",
    semester: "Fall 2025",
  },
  {
    id: "2",
    name: "Data Structures & Algorithms",
    code: "CS201",
    students: 38,
    completionRate: 65,
    status: "active",
    semester: "Fall 2025",
  },
  {
    id: "3",
    name: "Web Development Fundamentals",
    code: "CS105",
    students: 52,
    completionRate: 82,
    status: "active",
    semester: "Fall 2025",
  },
  {
    id: "4",
    name: "Database Management Systems",
    code: "CS301",
    students: 28,
    completionRate: 71,
    status: "active",
    semester: "Fall 2025",
  },
  {
    id: "5",
    name: "Machine Learning Basics",
    code: "CS401",
    students: 19,
    completionRate: 58,
    status: "active",
    semester: "Fall 2025",
  },
  {
    id: "6",
    name: "Software Engineering",
    code: "CS305",
    students: 34,
    completionRate: 88,
    status: "archived",
    semester: "Spring 2025",
  },
];

export function CourseListPage() {
  const navigate = useNavigate();

  const getStatusColor = (status: Course["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "archived":
        return "bg-gray-500/10 text-gray-700 border-gray-200";
      case "draft":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2">My Courses</h1>
          <p className="text-gray-600">
            Manage and track all your courses in one place
          </p>
        </div>
        <Button onClick={() => navigate("/create-course")} size="lg">
          <PlusCircle className="h-5 w-5 mr-2" />
          Create New Course
        </Button>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className={getStatusColor(course.status)}>
                  {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                </Badge>
                <span className="text-sm text-gray-500">{course.code}</span>
              </div>
              <CardTitle className="text-xl">{course.name}</CardTitle>
              <p className="text-sm text-gray-500">{course.semester}</p>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="space-y-4">
                {/* Students Count */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    {course.students} enrolled student{course.students !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Completion Rate */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">Completion Rate</span>
                    </div>
                    <span className="text-gray-900">{course.completionRate}%</span>
                  </div>
                  <Progress 
                    value={course.completionRate} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex gap-2 pt-4 border-t">
              <Button
                variant="default"
                className="flex-1"
                onClick={() =>
                  navigate(`/courses/${course.id}`, {
                    state: { courseName: course.name, courseCode: course.code },
                  })
                }
              >
                <Eye className="h-4 w-4 mr-2" />
                View Course
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  navigate(`/courses/${course.id}`, {
                    state: { courseName: course.name, courseCode: course.code },
                  })
                }
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Course
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Empty State - shown when no courses */}
      {courses.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl mb-2">No courses yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first course
          </p>
          <Button onClick={() => navigate("/create-course")}>
            <PlusCircle className="h-5 w-5 mr-2" />
            Create New Course
          </Button>
        </div>
      )}
    </div>
  );
}

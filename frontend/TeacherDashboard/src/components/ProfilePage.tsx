import { useState } from "react";
import {
  Mail,
  Briefcase,
  BookOpen,
  Edit,
  Lock,
  Save,
  X,
  User,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

interface Course {
  id: string;
  name: string;
  code: string;
  students: number;
  status: "active" | "archived";
}

const courses: Course[] = [
  {
    id: "1",
    name: "Introduction to Computer Science",
    code: "CS101",
    students: 45,
    status: "active",
  },
  {
    id: "2",
    name: "Data Structures & Algorithms",
    code: "CS201",
    students: 38,
    status: "active",
  },
  {
    id: "3",
    name: "Web Development Fundamentals",
    code: "CS105",
    students: 52,
    status: "active",
  },
  {
    id: "4",
    name: "Database Management Systems",
    code: "CS301",
    students: 28,
    status: "active",
  },
  {
    id: "5",
    name: "Machine Learning Basics",
    code: "CS401",
    students: 19,
    status: "active",
  },
  {
    id: "6",
    name: "Software Engineering",
    code: "CS305",
    students: 34,
    status: "archived",
  },
];

export function ProfilePage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Profile data
  const [name, setName] = useState("Prof. Roberts");
  const [email, setEmail] = useState("prof.roberts@university.edu");
  const [department, setDepartment] = useState("Computer Science");
  const [bio, setBio] = useState(
    "Experienced computer science professor with over 10 years of teaching experience. Passionate about educating the next generation of software engineers and researchers."
  );

  // Temporary edit states
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [editDepartment, setEditDepartment] = useState(department);
  const [editBio, setEditBio] = useState(bio);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveProfile = () => {
    setName(editName);
    setEmail(editEmail);
    setDepartment(editDepartment);
    setBio(editBio);
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setEditName(name);
    setEditEmail(email);
    setEditDepartment(department);
    setEditBio(bio);
    setIsEditingProfile(false);
  };

  const handleChangePassword = () => {
    // In a real app, this would make an API call
    console.log("Changing password...");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsChangingPassword(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const activeCourses = courses.filter((c) => c.status === "active");
  const archivedCourses = courses.filter((c) => c.status === "archived");

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Profile</h1>
        <p className="text-gray-600">Manage your profile information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                {!isEditingProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and Name */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-blue-600 text-white text-2xl">
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  {isEditingProfile ? (
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-2xl mb-1">{name}</h2>
                      <p className="text-gray-600">{department}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  Email Address
                </Label>
                {isEditingProfile ? (
                  <Input
                    id="email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                ) : (
                  <p className="text-gray-700">{email}</p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  Department / Subject Area
                </Label>
                {isEditingProfile ? (
                  <Input
                    id="department"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                  />
                ) : (
                  <p className="text-gray-700">{department}</p>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  Biography
                </Label>
                {isEditingProfile ? (
                  <Textarea
                    id="bio"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700">{bio}</p>
                )}
              </div>

              {/* Edit Actions */}
              {isEditingProfile && (
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveProfile} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Security</CardTitle>
                {!isChangingPassword && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsChangingPassword(true)}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                )}
              </div>
            </CardHeader>
            {isChangingPassword && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleChangePassword} className="flex-1">
                    <Lock className="h-4 w-4 mr-2" />
                    Update Password
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Right Column - Courses Overview */}
        <div className="space-y-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Teaching Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Active Courses</span>
                </div>
                <span className="text-xl">{activeCourses.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Total Students</span>
                </div>
                <span className="text-xl">
                  {courses.reduce((sum, c) => sum + c.students, 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Courses List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeCourses.map((course) => (
                <div
                  key={course.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm mb-1">{course.name}</p>
                      <p className="text-xs text-gray-500">{course.code}</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-700 border-green-200">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Users className="h-3 w-3" />
                    <span>{course.students} students</span>
                  </div>
                </div>
              ))}

              {archivedCourses.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <p className="text-sm text-gray-600 mb-2">Archived</p>
                  {archivedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm mb-1">{course.name}</p>
                          <p className="text-xs text-gray-500">{course.code}</p>
                        </div>
                        <Badge className="bg-gray-500/10 text-gray-700 border-gray-200">
                          Archived
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Users className="h-3 w-3" />
                        <span>{course.students} students</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

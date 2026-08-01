import { API_BASE_URL } from "../../lib/api";
 
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Hash, 
  BookOpen,
  GraduationCap,
  Trophy,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/components/store/store";
import { StudentProfileInfo } from "@/components/store/slices/student/profileSlice";
import StudentEditProfile from "@/components/Student/Editprofile";

interface EnrolledCourse {
  _id: string;
  course: [{
    courseId: {
      files: Array<{ title: string }>;
      _id: string;
      title: string;
      rating?: number;
    };
  }];
}

interface StatItem {
  icon: JSX.Element;
  label: string;
  value: string;
}

export default function StudentProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, profileInfo } = useSelector((state: RootState) => state.studentProfile);
  const [, setMyCourses] = useState<EnrolledCourse[]>([]);
  const [stats, setStats] = useState<StatItem[]>([
    { icon: <BookOpen className="h-5 w-5" />, label: "Enrolled Courses", value: "0" },
    { icon: <GraduationCap className="h-5 w-5" />, label: "Total Lessons", value: "0" },
    { icon: <Trophy className="h-5 w-5" />, label: "Completion Rate", value: "0%" },
    { icon: <Star className="h-5 w-5" />, label: "Avg Rating", value: "0.0" }
  ]);

  useEffect(() => {
    dispatch(StudentProfileInfo());
  }, [dispatch]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/student/mycourse/all`, {
          credentials: "include"
        });
        const data = await response.json();
        if (data.success) {
          setMyCourses(data.studentCourses || []);
          updateStats(data.studentCourses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  const updateStats = (courses: EnrolledCourse[]) => {
    if (!courses?.length) return;

    const totalCourses = courses.length;
    const totalLessons = courses.reduce((acc, course) => 
      acc + (course.course[0].courseId.files?.length || 0), 0);
    const completionRate = 75; // This would ideally come from progress tracking
    const avgRating = 4.8; // This would ideally come from course ratings

    setStats([
      { icon: <BookOpen className="h-5 w-5" />, label: "Enrolled Courses", value: totalCourses.toString() },
      { icon: <GraduationCap className="h-5 w-5" />, label: "Total Lessons", value: totalLessons.toString() },
      { icon: <Trophy className="h-5 w-5" />, label: "Completion Rate", value: completionRate + "%" },
      { icon: <Star className="h-5 w-5" />, label: "Avg Rating", value: avgRating.toFixed(1) }
    ]);
  };

  if (isLoading || !profileInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card className="border bg-primary/5 text-foreground overflow-hidden">
          <CardContent className="p-6">
            <div className="relative">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Profile Image */}
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-primary-foreground/10">
                    <AvatarImage src={profileInfo.profileImg} alt={profileInfo.name} />
                    <AvatarFallback className="text-xl bg-primary-foreground/10">
                      {profileInfo.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left space-y-2">
                  <h1 className="text-2xl font-semibold">
                    {profileInfo.name}
                  </h1>
                  <p className="text-primary-foreground/80">{profileInfo.branch}</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge variant="secondary" className="bg-primary-foreground/10 hover:bg-primary-foreground/20">
                      {profileInfo.rollNumber}
                    </Badge>
                    <Badge variant="secondary" className="bg-primary-foreground/10 hover:bg-primary-foreground/20">
                      Team {profileInfo.teamNum || profileInfo.teamNo}
                    </Badge>
                  </div>
                </div>

                {/* Edit Button */}
                <StudentEditProfile />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    {React.cloneElement(stat.icon, { className: "h-5 w-5 text-primary" })}
                  </div>
                  <p className="text-xl font-semibold">{stat.value}</p>
                </div>
                <h3 className="font-medium text-sm">{stat.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Updated today</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </h2>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" /> Full Name
                </Label>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="font-medium">{profileInfo.name}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email Address
                </Label>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="font-medium">{profileInfo.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4" /> Roll Number
                </Label>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="font-medium">{profileInfo.rollNumber}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" /> Branch
                </Label>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="font-medium">{profileInfo.branch}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" /> Gender
                </Label>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="font-medium">{profileInfo.gender}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Team Number
                </Label>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="font-medium">Team {profileInfo.teamNum || profileInfo.teamNo}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-xl font-semibold">Quick Actions</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="secondary"
                className="w-full justify-start group hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                onClick={() => navigate('/student/courses')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                View Courses
              </Button>
              <Button 
                variant="secondary"
                className="w-full justify-start group hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                onClick={() => navigate('/student/mycourses')}
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                My Learning
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

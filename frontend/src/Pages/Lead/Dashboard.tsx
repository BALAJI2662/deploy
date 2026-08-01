import { API_BASE_URL } from "../../lib/api";
import React, { useEffect, useState, useMemo } from "react";
import { BookOpen, Users, Star, Award, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/components/store/store";
import { fetchAllCourses } from "@/components/store/slices/CommonSlice";

interface EnrolledCourse {
  _id: string;
  course: [{
    courseId: {
      _id: string;
      title: string;
      thumbnail: string;
      files: Array<{ title: string }>;

      instructor: {
        name: string;
      };
      students: Array<{ studentId: string }>;
    };
    DateOfPurchase: string;
    instructorId: string;
    paid: number;
  }];
}

export default function LeadDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { courses } = useSelector((state: RootState) => state.course);
  const [isLoading, setIsLoading] = useState(true);
  const [teamCourses, setTeamCourses] = useState<EnrolledCourse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch all courses
        await dispatch(fetchAllCourses());
        
        // Fetch team's enrolled courses
        const coursesResponse = await fetch(`${API_BASE_URL}/lead/mycourse/all`, {
          credentials: "include"
        });
        const coursesData = await coursesResponse.json();
        if (coursesData.success) {
          setTeamCourses(coursesData.leadCourses || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const stats = useMemo(() => {
    if (!courses?.length) return [];

    const totalStudents = courses.reduce((acc, course) => acc + (course.students?.length || 0), 0);
    const teamEnrolledCourses = teamCourses.length;
    
    return [
      {
        icon: <BookOpen className="h-5 w-5" />,
        value: courses.length + "+",
        label: "Available Courses"
      },
      {
        icon: <Users className="h-5 w-5" />,
        value: new Intl.NumberFormat("en-US", { notation: "compact" }).format(totalStudents) + "+",
        label: "Active Students"
      },
      {
        icon: <GraduationCap className="h-5 w-5" />,
        value: teamEnrolledCourses + "+",
        label: "Team Enrollments"
      }
    ];
  }, [courses, teamCourses]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center mb-6">
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 mb-4">
            <Award className="w-4 h-4 mr-2" />
            Lead Dashboard
          </Badge>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            Welcome to Your <span className="text-primary">Leadership Portal</span>
          </h1>
          
          <p className="text-base text-muted-foreground max-w-xl mx-auto mb-6">
            Track and manage course progress across your team
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/lead/courses">
                <div className="group cursor-pointer">
                  <div className="p-4 rounded-lg bg-card hover:bg-muted transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-0.5">Explore Courses</h3>
                        <p className="text-sm text-muted-foreground">Find courses for your team</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/lead/members">
                <div className="group cursor-pointer">
                  <div className="p-4 rounded-lg bg-card hover:bg-muted transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-0.5">Team Management</h3>
                        <p className="text-sm text-muted-foreground">Manage your team's progress</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/lead/mycourses">
                <div className="group cursor-pointer">
                  <div className="p-4 rounded-lg bg-card hover:bg-muted transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-0.5">My Learning</h3>
                        <p className="text-sm text-muted-foreground">Track team enrolled courses</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Team's Recent Courses */}
        {teamCourses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Team's Recent Courses</h2>
                <p className="text-muted-foreground">Recent enrollments by your team</p>
              </div>
              <Link to="/lead/mycourses">
                <Button variant="secondary">View All</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {teamCourses.slice(0, 3).map((course) => (
                <Link key={course._id} to={`/lead/mycourses/view-page/${course._id}`}>
                  <Card className="group cursor-pointer border-0 bg-card hover:bg-muted transition-colors duration-200">
                    <div className="relative">
                      <AspectRatio ratio={16/9}>
                        <img 
                          src={course.course?.[0]?.courseId?.thumbnail}
                          alt={course.course?.[0]?.courseId?.title || 'Course'}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      </AspectRatio>                      <Badge 
                        variant="secondary"
                        className="absolute top-2 right-2 bg-primary-foreground/90"
                      >
                        Enrolled
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-base mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {course.course?.[0]?.courseId?.title || 'Untitled Course'}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {course.course?.[0]?.courseId?.files?.length || 0} lessons
                        </div>                        <Button variant="secondary" size="sm" 
                          className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Courses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recommended for Your Team</h2>
              <p className="text-muted-foreground">Curated courses for skill development</p>
            </div>
            <Link to="/lead/courses">
              <Button variant="secondary">Browse All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.slice(0, 4).map((course) => (
              <Link key={course._id} to={`/lead/courses/${course._id}`}>
                <Card className="group cursor-pointer border-0">
                  <div className="relative">
                    <AspectRatio ratio={16/9}>
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    </AspectRatio>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-medium text-base group-hover:text-primary transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">by {course.instructor?.name || 'Unknown Instructor'}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-primary fill-current" />
                        <span className="text-sm font-medium">4.8</span>
                        <span className="text-sm text-muted-foreground">({course.students?.length || 0})</span>
                      </div>
                      <div className="text-base font-semibold text-primary">₹{course.price}</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

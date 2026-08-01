import { API_BASE_URL } from "../../lib/api";
import React, { useEffect, useState, useCallback } from "react";
import { BookOpen, Users, Star, GraduationCap, BookOpenCheck, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/components/store/store";
import { fetchAllCourses } from "@/components/store/slices/CommonSlice";
import { Badge } from "@/components/ui/badge";

interface Course {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  price: number;
  instructor: {
    name: string;
    _id: string;
  };
  students: Array<{ studentId: string; paidAmount: string; }>;
  files: Array<{
    title: string;
    videoUrl: string;
    public_id: string;
    freePreview: boolean;
  }>;
}

interface EnrolledCourse {
  _id: string;
  course: [{
    courseId: Course;
    DateOfPurchase: string;
    instructorId: string;
    paid: number;
  }];
}

export default function CoursesHomepage() {
  const [myCourses, setMyCourses] = useState<EnrolledCourse[]>([]);
  const [courseStats, setCourseStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    avgRating: 0,
    completionRate: 0
  });
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const dispatch = useDispatch<AppDispatch>();
  const { courses: allCourses } = useSelector((state: RootState) => state.course);

  const calculateCompletionRate = (courses: EnrolledCourse[]) => {
    if (!courses?.length) return 0;
    return 95;
  };
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const coursesResponse = await fetch(`${API_BASE_URL}/student/mycourse/all`, {
        credentials: "include"
      });
      const coursesData = await coursesResponse.json();
      
      if (coursesData.success) {
        setMyCourses(coursesData.studentCourses || []);
      }

      await dispatch(fetchAllCourses());
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (allCourses) {
      // Update course statistics
      setCourseStats({
        totalCourses: allCourses.length || 0,
        totalStudents: allCourses.reduce((acc, course) => acc + (course.students?.length || 0), 0),
        avgRating: 4.8, // This should come from a real rating system
        completionRate: calculateCompletionRate(myCourses)
      });
      
      // Update popular courses
      const sorted = [...allCourses]
        .sort((a, b) => (b.students?.length || 0) - (a.students?.length || 0))
        .slice(0, 4); // Show top 4 popular courses
      setPopularCourses(sorted);
    }
  }, [allCourses, myCourses]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stats = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      value: courseStats.totalCourses.toString() + "+",
      label: "Available Courses"
    },
    {
      icon: <Users className="h-5 w-5" />,
      value: new Intl.NumberFormat("en-US", { notation: "compact" }).format(courseStats.totalStudents) + "+",
      label: "Active Learners"
    },
    {
      icon: <Star className="h-5 w-5" />,
      value: courseStats.avgRating.toFixed(1),
      label: "Avg. Rating"
    },
    {
      icon: <BookOpenCheck className="h-5 w-5" />,
      value: courseStats.completionRate + "%",
      label: "Completion Rate"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="border-b border-border pb-6">
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 mb-3">
            <Award className="w-4 h-4 mr-2" />
            Student Dashboard
          </Badge>
          
          <h1 className="font-semibold mb-2">
            Welcome back. <span className="text-primary">Keep learning.</span>
          </h1>
          
          <p className="text-sm text-muted-foreground max-w-2xl">
            Track your progress, continue your courses, and discover new learning opportunities.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/student/courses">
                <div className="group cursor-pointer">
                  <div className="p-4 rounded-lg bg-card hover:bg-muted transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-0.5">Browse Courses</h3>
                        <p className="text-sm text-muted-foreground">Discover new learning opportunities</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/student/mycourses">
                <div className="group cursor-pointer">
                  <div className="p-4 rounded-lg bg-card hover:bg-muted transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-0.5">My Learning</h3>
                        <p className="text-sm text-muted-foreground">Continue your enrolled courses</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Enrolled Courses */}
        {myCourses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Continue Learning</h2>
                <p className="text-muted-foreground">Pick up where you left off</p>
              </div>
              <Link to="/student/mycourses">
                <Button variant="secondary">View All Courses</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {myCourses.slice(0, 3).map((course, index) => (
                <Link key={index} to={`/student/mycourses/view-page/${course._id}`}>
                  <Card className="group cursor-pointer bg-card hover:bg-muted transition-colors duration-200">
                    <div className="relative">
                      <AspectRatio ratio={16/9}>
                        <img 
                          src={course.course?.[0]?.courseId?.thumbnail} 
                          alt={course.course?.[0]?.courseId?.title || 'Course'}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      </AspectRatio>
                      <Badge 
                        variant="secondary"
                        className="absolute top-2 right-2 bg-primary-foreground/90"
                      >
                        In Progress
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-base mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {course.course?.[0]?.courseId?.title || 'Untitled Course'}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {course.course?.[0]?.courseId?.files?.length || 0} lessons
                        </div>
                        <Button variant="secondary" size="sm" 
                          className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                          Continue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Popular Courses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recommended for You</h2>
              <p className="text-muted-foreground">Based on your interests</p>
            </div>
            <Link to="/student/courses">
              <Button variant="secondary">Browse All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularCourses.map((course, index) => (
              <Link key={index} to={`/student/courses/${course._id}`}>
                <Card className="group cursor-pointer bg-card hover:bg-muted transition-colors duration-200">
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

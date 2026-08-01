import { API_BASE_URL } from "../../lib/api";
import { BookOpen, Clock, Users, Search, BookCheck, Layers } from "lucide-react";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ICompleateCourseInfo {
    _id: string;
    course: [{
        _id: string | number;
        courseId: {
            _id: string;
            title: string;
            description: string;
            thumbnail: string;
            instructor: {
                name: string;
            };
            files: Array<{
                title: string;
                videoUrl: string;
                freePreview: boolean;
            }>;
        };
        DateOfPurchase: string;
        instructorId: string;
        paid: number;
    }];
    leadId: {
        _id: string;
        userId: string;
        name: string;
        email: string;
    };
}

export default function LeadMyCourses() {
    const [myCourseInfo, setMyCourseInfo] = useState<ICompleateCourseInfo[] | null>(null);
    const [search, setSearch] = useState<string>('');

    // Calculate course statistics
    const stats = useMemo(() => {
        if (!myCourseInfo) return [];

        let totalCourses = 0;
        let totalLessons = 0;
        let totalHours = 0;

        myCourseInfo.forEach(enrollment => {
            enrollment.course.forEach(course => {
                totalCourses++;
                totalLessons += course.courseId?.files?.length || 0;
                // Assuming each lesson is approximately 30 minutes
                totalHours += ((course.courseId?.files?.length || 0) * 30) / 60;
            });
        });

        return [
            {
                icon: <Layers className="h-4 w-4" />,
                value: totalCourses,
                label: "Enrolled Courses"
            },
            {
                icon: <BookCheck className="h-4 w-4" />,
                value: totalLessons,
                label: "Total Lessons"
            },
            {
                icon: <Clock className="h-4 w-4" />,
                value: `${Math.round(totalHours)}h`,
                label: "Total Hours"
            },
            {
                icon: <Users className="h-4 w-4" />,
                value: myCourseInfo.length,
                label: "Active Courses"
            }
        ];
    }, [myCourseInfo]);

    const FetchMyCourses = useCallback(async () => {
        const url = search
            ? `${API_BASE_URL}/lead/mycourse/search/${search}`
            : `${API_BASE_URL}/lead/mycourse/all`;

        try {
            const response = await fetch(url, {
                credentials: "include"
            });
            const data = await response.json();

            if (data.success) {
                setMyCourseInfo(data.leadCourses);
                console.log(data.leadCourses);
            } else {
                console.log(data.message);
                setMyCourseInfo([]);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            setMyCourseInfo([]);
        }
    }, [search]);

    useEffect(() => {
        FetchMyCourses();
    }, [FetchMyCourses]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        FetchMyCourses();
    };

    return (
        <div className="min-h-full bg-background">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Welcome Banner */}
                <Card className="overflow-hidden border bg-primary/5 text-foreground">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-primary-foreground/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                <BookOpen className="h-6 w-6 text-primary-foreground" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold mb-1">
                                My Learning Journey
                            </h1>
                            <p className="text-primary-foreground/80">
                                Track your progress and continue learning
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Search Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold">Enrolled Courses</h2>
                    </div>
                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                onChange={(e) => setSearch(e.target.value)}
                                value={search}
                                name="search"
                                className="pl-8 bg-muted"
                                placeholder="Search courses..."
                            />
                        </div>
                        <Button type="submit" variant="secondary">Search</Button>
                    </form>
                </div>

                {/* Statistics Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <Card key={index}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10">
                                    {React.cloneElement(stat.icon, { className: "h-5 w-5 text-primary" })}
                                </div>
                                <div>
                                    <p className="text-xl font-semibold">{stat.value}</p>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {myCourseInfo && myCourseInfo.length === 0 ? (
                        <div className="col-span-full flex justify-center items-center py-12">
                            <Card className="border-0 bg-muted p-6 text-center max-w-sm">
                                <h3 className="text-lg font-medium mb-2">No courses found</h3>
                                <p className="text-muted-foreground mb-4">Start your learning journey today.</p>
                                <Link to="/lead/courses">
                                    <Button variant="secondary" className="w-full">
                                        Browse Courses
                                    </Button>
                                </Link>
                            </Card> 
                        </div>                    ) : (
                        myCourseInfo && myCourseInfo.flatMap((enrolledCourse) => 
                            enrolledCourse.course.map((course) => (
                                <Card 
                                    key={`${enrolledCourse._id}-${course._id}`}
                                    className="group bg-card hover:bg-muted transition-colors duration-200"
                                >
                                    <div className="relative">
                                        <AspectRatio ratio={16 / 9}>
                                            <img 
                                                src={course.courseId?.thumbnail} 
                                                alt={course.courseId?.title || 'Course'} 
                                                className="w-full h-full object-cover rounded-t-lg"
                                            />
                                        </AspectRatio>
                                    </div>
                                    
                                    <CardContent className="p-4 space-y-3">
                                        <h3 className="font-medium text-base line-clamp-2">
                                            {course.courseId?.title || 'Untitled Course'}                                    </h3>
                                    
                                    <p className="text-sm text-muted-foreground">by {course.courseId?.instructor?.name || 'Unknown Instructor'}</p>
                                    
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Users className="h-4 w-4" />
                                            <span>Active</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-4 w-4" />
                                            <span>{course.courseId?.files?.length || 0} Lessons</span>
                                        </div>
                                    </div>

                                    <Link to={`view-page/${enrolledCourse._id}`} className="block pt-2">
                                        <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                                            Continue Learning
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )))
                    )}
                </div>
            </div>
        </div>
    );
}

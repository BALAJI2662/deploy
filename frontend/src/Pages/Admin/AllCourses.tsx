import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
    Search, 
    Filter, 
    Star, 
    Clock, 
    Users, 
    PlayCircle,
    BookOpen,
    GraduationCap,
    Layers,
    ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/components/store/store";
import { fetchAllCourses } from "@/components/store/slices/CommonSlice";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Loader from "@/components/Loading";

export default function AdminAllcourses() {
    const [searchTerm, setSearchTerm] = useState("");
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading, courses } = useSelector((state: RootState) => state.course);

    useEffect(() => {
        dispatch(fetchAllCourses());
    }, [dispatch]);

    // Calculate course statistics
    const stats = useMemo(() => {
        if (!courses?.length) return [];

        const totalStudents = courses.reduce((acc, course) => acc + (course.students?.length || 0), 0);
        const avgRating = 4.8; // This should come from actual ratings
        const totalInstructors = new Set(
            courses
                .filter(course => course.instructor)
                .map(course => course.instructor._id)
        ).size;
        
        return [
            {
                icon: <Layers className="h-4 w-4" />,
                value: courses.length + "+",
                label: "Total Courses",
                color: "text-blue-600"
            },
            {
                icon: <Users className="h-4 w-4" />,
                value: new Intl.NumberFormat("en-US", { notation: "compact" }).format(totalStudents) + "+",
                label: "Active Students",
                color: "text-green-600"
            },
            {
                icon: <Star className="h-4 w-4" />,
                value: avgRating.toFixed(1),
                label: "Avg Rating",
                color: "text-purple-600"
            },
            {
                icon: <GraduationCap className="h-4 w-4" />,
                value: totalInstructors + "+",
                label: "Instructors",
                color: "text-orange-600"
            }
        ];
    }, [courses]);

    const filteredCourses = useMemo(() => {
        if (!courses) return [];
        
        return courses.filter(course =>
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.instructor?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [courses, searchTerm]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader />
            </div>
        );
    }

    if (!courses?.length) {
        return (
            <div className="min-h-full bg-background">
                <div className="max-w-7xl mx-auto">
                    <Card className="overflow-hidden border bg-primary/5 shadow-sm text-foreground">
                        <CardContent className="p-8 flex items-center gap-6">
                            <div className="text-white">
                                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                                    Welcome to Admin Dashboard
                                </h1>
                                <p className="text-white/90 text-lg">
                                    No courses available at the moment. Please check back later.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-background">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Welcome Banner */}
                <Card className="overflow-hidden border bg-primary/5 shadow-sm text-foreground">
                    <CardContent className="p-8 flex items-center gap-6">
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <BookOpen className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div className="text-white">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">
                                Welcome to <span className="text-yellow-300">GCC Academy</span> Admin
                            </h1>
                            <p className="text-white/90 text-lg">
                                Manage and Monitor All Courses
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">All Courses</h2>
                        <p className="text-gray-600">Manage {courses.length}+ courses in the platform</p>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search courses or instructors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 border-0 shadow-md"
                            />
                        </div>
                        <Button variant="outline" size="icon" className="shadow-md">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <Card key={index} className="p-4 flex items-center gap-4">
                            <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-gray-500">{stat.label}</p>
                            </div>
                        </Card>
                    ))}
                </div>

                <Separator className="my-6" />

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCourses.map((course) => (
                        <Card 
                            key={course._id} 
                            className="group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 overflow-hidden"
                        >
                            <div className="relative">
                                <AspectRatio ratio={16/9}>
                                    <img 
                                        src={course.thumbnail} 
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </AspectRatio>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                    <PlayCircle className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <Badge 
                                    className={`absolute top-3 right-3 ${
                                        course.level === 'Beginner' ? 'bg-green-500' :
                                        course.level === 'Intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                >
                                    {course.level || 'All Levels'}
                                </Badge>
                            </div>
                            
                            <CardContent className="p-5 space-y-3">
                                <h3 className="font-bold text-lg leading-tight text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {course.title}
                                </h3>
                                
                                <p className="text-gray-600 text-sm">
                                    by {course.instructor?.name || 'Unknown Instructor'}
                                </p>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                        <span className="font-medium">4.8</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>{course.students?.length || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{course.files?.length || 0} lessons</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-2xl font-bold text-blue-600">₹{course.price}</span>
                                    <Link to={`${course._id}`}>
                                        <Button variant="outline" size="sm">
                                            View Details
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredCourses.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg mb-2">No courses found</div>
                        <p className="text-gray-500">Try adjusting your search terms</p>
                    </div>
                )}
            </div>
        </div>
    );
}

import { API_BASE_URL } from "../../lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {    Users,
    Search,
    GraduationCap,
    BookOpen,
    Trophy,
    Github,
    Linkedin,
} from "lucide-react";
import Loader from "@/components/Loading";

interface Instructor {
    _id: string;
    name: string;
    email: string;
    profileImg: string;
    branch: string;
    rollNumber: string;
    role: string;
    gender: string;
    college: string;
    gitHub: string;
    linkedIn: string;
    courseId: string[];
}

export default function AdminInstructors() {
    const navigate = useNavigate();    const [data, setData] = useState<Instructor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    async function fetchInstructors() {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/admin/instructor/all`, {
                credentials: 'include' // Include credentials for cross-origin requests
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            if (!Array.isArray(result)) {
                throw new Error('Invalid data format received from server');
            }
            
            setData(result);
        } catch (error) {
            console.error("Error fetching instructors:", error);
            setError(error instanceof Error ? error.message : 'An error occurred while fetching instructors');
            setData([]);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchInstructors();
    }, []);

    const stats = useMemo(() => {
        return [
            {
                icon: <Users className="h-4 w-4" />,
                value: data.length,
                label: "Total Instructors",
                color: "text-primary"
            },
            {
                icon: <BookOpen className="h-4 w-4" />,
                value: data.reduce((acc, instructor) => acc + instructor.courseId.length, 0),
                label: "Total Courses",
                color: "text-success"
            },
            {
                icon: <GraduationCap className="h-4 w-4" />,
                value: data.filter(instructor => instructor.courseId.length > 0).length,
                label: "Active Instructors",
                color: "text-info"
            },
            {
                icon: <Trophy className="h-4 w-4" />,
                value: Math.round(data.reduce((acc, instructor) => acc + instructor.courseId.length, 0) / (data.length || 1)),
                label: "Avg Courses/Instructor",
                color: "text-warning"
            }
        ];
    }, [data]);

    const filteredInstructors = useMemo(() => {
        return data.filter(instructor =>
            instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            instructor.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
            instructor.branch.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="text-destructive text-xl font-semibold">Error loading instructors</div>
                <p className="text-muted-foreground">{error}</p>
                <Button 
                    variant="outline"
                    onClick={() => {
                        fetchInstructors();
                    }}
                >
                    Try Again
                </Button>
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
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <GraduationCap className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <div className="text-foreground">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">
                                Instructor Management
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Manage and monitor all instructors in the platform
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground mb-2">All Instructors</h2>
                        <p className="text-muted-foreground">Manage {data.length} registered instructors</p>
                    </div>
                    
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                        disabled
                            placeholder="Search by name, email, college..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-0 shadow-md"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <Card key={index} className="p-4 flex items-center gap-4">
                            <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                            </div>
                        </Card>
                    ))}
                </div>

                <Separator className="my-6" />

                {/* Instructors Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredInstructors.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <div className="text-muted-foreground text-lg mb-2">No instructors found</div>
                            <p className="text-muted-foreground">Try adjusting your search terms</p>
                        </div>
                    ) : (
                        filteredInstructors.map((instructor) => (
                            <Card 
                                key={instructor._id}
                                className="group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-primary/30"
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4 mb-4">                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border">
                                            <img 
                                                src={instructor.profileImg} 
                                                alt={instructor.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(instructor.name) + "&background=random";
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-foreground truncate">
                                                {instructor.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {instructor.email}
                                            </p>
                                            <Badge 
                                                variant="secondary" 
                                                className="mt-1 bg-primary/10 text-primary hover:bg-primary/20"
                                            >
                                                {instructor.branch}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Roll Number:</span>
                                            <span className="font-medium text-foreground">{instructor.rollNumber}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Courses:</span>
                                            <span className="font-medium text-foreground">{instructor.courseId.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">College:</span>
                                            <span className="font-medium text-foreground truncate ml-2">{instructor.college}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <TooltipProvider>
                                                {instructor.gitHub && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <a 
                                                                href={instructor.gitHub}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 rounded-full hover:bg-muted transition-colors"
                                                            >
                                                                <Github className="h-4 w-4 text-muted-foreground" />
                                                            </a>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>GitHub Profile</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                                {instructor.linkedIn && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <a 
                                                                href={instructor.linkedIn}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 rounded-full hover:bg-muted transition-colors"
                                                            >
                                                                <Linkedin className="h-4 w-4 text-muted-foreground" />
                                                            </a>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>LinkedIn Profile</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </TooltipProvider>
                                        </div>
                                        <Button 
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/Admin/courseProviders/${instructor._id}`)}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

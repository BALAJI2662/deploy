import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/components/store/store";
import { FetchInstructorCourses } from "@/components/store/slices/Instructor/courses";
import Loader from "@/components/Loading";

export default function InstructorAllCourses() {
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { courses, isLoading, error } = useSelector((state: RootState) => state.Instructor);

    useEffect(() => {
        dispatch(FetchInstructorCourses());
    }, [dispatch]);

    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <Loader />;

    if (error) {
        return <div className="flex min-h-screen items-center justify-center"><Button onClick={() => dispatch(FetchInstructorCourses())}>Try again</Button></div>;
    }

    return (
        <div className="min-h-screen bg-background p-4 lg:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">My Courses</h1>
                        <p className="text-sm text-muted-foreground">Manage the courses you have created.</p>
                    </div>
                    <Button onClick={() => navigate("/instructor/new")}><Plus className="mr-2 h-4 w-4" />New Course</Button>
                </div>

                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Search your courses" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
                </div>

                {filteredCourses.length === 0 ? (
                    <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">No courses found.</CardContent></Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCourses.map((course) => (
                            <Card key={course._id} className="overflow-hidden">
                                <img src={course.thumbnail} alt={course.title} className="aspect-video w-full object-cover" />
                                <CardContent className="space-y-3 p-4">
                                    <Link to={`/instructor/courses/view/${course._id}`} className="block font-semibold hover:text-primary">{course.title}</Link>
                                    <p className="text-sm text-muted-foreground">{course.level || "All levels"}</p>
                                    <div className="flex gap-4 text-sm text-muted-foreground">
                                        <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />{course.students?.length || 0}</span>
                                        <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{course.files?.length || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between"><span className="font-semibold">₹{course.price}</span><Button variant="outline" size="sm" asChild><Link to={`/instructor/courses/view/${course._id}`}>Manage</Link></Button></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, Clock, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/components/store/store";
import { fetchAllCourses } from "@/components/store/slices/CommonSlice";

export default function StudentAllCourses() {
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, courses } = useSelector((state: RootState) => state.course);

  useEffect(() => { dispatch(fetchAllCourses()); }, [dispatch]);

  const filteredCourses = useMemo(() => (courses || []).filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.instructor?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  ), [courses, searchTerm]);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Course catalogue</p>
            <h1 className="mt-1 font-semibold">Explore courses</h1>
            <p className="mt-1 text-sm text-muted-foreground">Find a course that matches what you want to learn.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search courses" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
          </div>
        </header>

        {filteredCourses.length === 0 ? (
          <Card className="mt-6"><CardContent className="flex flex-col items-center py-12 text-center"><BookOpen className="h-5 w-5 text-primary" /><h2 className="mt-3 font-semibold">No courses found</h2><p className="mt-1 text-sm text-muted-foreground">Try a different search term.</p>{searchTerm && <Button className="mt-4" variant="outline" onClick={() => setSearchTerm("")}>Clear search</Button>}</CardContent></Card>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Link key={course._id} to={`${course._id}`} className="group">
                <Card className="h-full overflow-hidden transition-colors group-hover:border-primary/40">
                  <img src={course.thumbnail} alt={course.title} className="aspect-video w-full object-cover" />
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3"><h2 className="font-semibold leading-snug group-hover:text-primary">{course.title}</h2>{course.level && <Badge variant="secondary" className="shrink-0">{course.level}</Badge>}</div>
                    <p className="text-sm text-muted-foreground">{course.instructor?.name || "Instructor unavailable"}</p>
                    <div className="flex items-center justify-between border-t border-border pt-3 text-sm"><span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" />{course.files?.length || 0} lessons</span><span className="font-semibold text-foreground">₹{course.price}</span></div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

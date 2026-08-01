import { API_BASE_URL } from "../../lib/api";
import { useEffect, useState, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Loader from "../Loading"
import { Button } from "../ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Videoplayer from "../Common/VideoPlayer/Videoplayer"

interface ICourse {
    _id: string;
    title: string;
    subtitle?: string;
    description: string;
    instructor: {
        name: string;
    };
    updatedAt?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    students: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    leads: any[];
    objectives: string;
    thumbnail: string;
    files: Array<{
        videoUrl: string;
        title: string;
        freePreview: boolean;
    }>;
    price: number;
}

export default function AdminCourseDetailesView() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [courseInfo, setCourseInfo] = useState<ICourse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const FetchCourseInfo = useCallback(async () => {
        if (!id) return
        
        try {
            setIsLoading(true)
            setError(null)
            const response = await fetch(`${API_BASE_URL}/courses/get/${id}`)
            if (!response.ok) {
                throw new Error('Failed to fetch course information')
            }
            const data = await response.json()
            setCourseInfo(data.course)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            setCourseInfo(null)
        } finally {
            setIsLoading(false)
        }
    }, [id])    

    useEffect(() => {
        FetchCourseInfo()
    }, [FetchCourseInfo])

    const [open, setOpen] = useState(false)
    const handleDailog = () => {
        setOpen(!open)
    }

    const handleDelete = async (courseId: string) => {
        try {
            setIsLoading(true)
            const response = await fetch(`${API_BASE_URL}/admin/course/${courseId}`, {
                method: "DELETE",
                credentials: "include"
            })
            const data = await response.json()
            if (data.success) {
                navigate("/Admin/courses")
            } else {
                throw new Error(data.message || 'Failed to delete course')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete course')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <Loader />
    }

    if (error) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4">
                <p className="text-destructive">{error}</p>
                <Button onClick={() => FetchCourseInfo()}>Retry</Button>
            </div>
        )
    }

    if (!courseInfo) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4">
                <p>Course not found</p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col gap-6 p-4 bg-background">
            <div className="w-full flex justify-between items-center">
                <Button
                    onClick={() => navigate(-1)}
                    variant="ghost"
                    className="flex gap-2"
                >
                    <i className="fa-solid fa-arrow-left"></i> Back
                </Button>
                <Button
                    variant='outline'
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(courseInfo._id)}
                >
                    Delete Course
                </Button>
            </div>

            <div className="w-full bg-card rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-semibold text-foreground">{courseInfo.title}</h1>
                <p className="mt-2 text-muted-foreground">{courseInfo.subtitle}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <p>Instructor: {courseInfo.instructor.name}</p>
                    <p>Updated: {courseInfo.updatedAt
                        ? new Date(courseInfo.updatedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })
                        : new Date().toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                    </p>
                    <p>Students: {courseInfo.students.length}</p>
                    <p>Leads: {courseInfo.leads.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">Course Description</h2>
                        <p className="text-muted-foreground">{courseInfo.description}</p>
                    </div>

                    <div className="bg-card rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">What you'll learn</h2>
                        <ul className="space-y-2">
                            {courseInfo.objectives.split(',').map((objective, index) => (
                                <li key={index} className="flex gap-2 text-muted-foreground">
                                    <i className="fa-solid fa-check text-success mt-1"></i>
                                    <span>{objective.trim()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-card rounded-lg shadow-sm p-6 sticky top-4">
                        <div className="aspect-video mb-4">
                            <Videoplayer
                                width="100%"
                                height="100%"
                                thumbnail={courseInfo.thumbnail}
                                videoUrl={courseInfo.files[0]?.videoUrl || ""}
                            />
                        </div>
                        <p className="text-2xl font-bold mb-4">₹ {courseInfo.price}</p>
                        <Button
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() => navigate(`/Admin/courses/coureview/${courseInfo._id}`)}
                        >
                            View Course Content
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Course Curriculum</h2>
                <div className="space-y-2">
                    {courseInfo.files.map((video, index) => (
                        <Dialog key={index} open={open} onOpenChange={setOpen}>
                            <div className="border rounded-lg p-3 hover:bg-muted transition-colors">
                                {video.freePreview ? (
                                    <DialogTrigger asChild>
                                        <div className="flex items-center gap-3 cursor-pointer">
                                            <i className="fa-regular fa-circle-play text-primary"></i>
                                            <p className="text-foreground">{video.title}</p>
                                        </div>
                                    </DialogTrigger>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <i className="fa-solid fa-lock text-muted-foreground"></i>
                                        <p className="text-muted-foreground">{video.title}</p>
                                    </div>
                                )}
                                <DialogContent className="sm:max-w-[600px]">
                                    <DialogHeader>
                                        <DialogTitle className="mb-6">{video.title}</DialogTitle>
                                        <Videoplayer width="100%" height="300px" videoUrl={video.videoUrl} />
                                    </DialogHeader>
                                    <Button onClick={handleDailog} variant="secondary" className="w-full">
                                        Close Preview
                                    </Button>
                                </DialogContent>
                            </div>
                        </Dialog>
                    ))}
                </div>
            </div>
        </div>
    )
}

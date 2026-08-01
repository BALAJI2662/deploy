import { API_BASE_URL } from "../../lib/api";
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Loader from "../Loading"
import { Button } from "../ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import Videoplayer from "../Common/VideoPlayer/Videoplayer"
import { Card, CardContent } from "../ui/card"

export default function ViewCourse() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [courseInfo, setCourseInfo] = useState<ICourse>()

    const FetchCourseInfo = async () => {
        const response = await fetch(`${API_BASE_URL}/courses/get/${id}`)
        const data = await response.json()
        setCourseInfo(data.course)
    }
    useEffect(() => {
        FetchCourseInfo()
    }, [id])

    const [selectedResource, setSelectedResource] = useState<{ title: string; resourceUrl: string; resourceType: "video" | "pdf" | "image" } | null>(null)

    const handleDelete = async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/admin/course/${id}`, {
            method: "DELETE",
            credentials: "include"
        })
        const data = await response.json();
        if (data.success) {
            navigate("/instructor/courses")
        }
    }

    if (!courseInfo) {
        return <Loader />
    }

    return (
        <div className="min-h-screen bg-background p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Actions */}
                <div className="flex justify-between items-center">
                    <Button
                        onClick={() => navigate(-1)}
                        variant="outline"
                        className="flex items-center gap-2 bg-card hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                    >
                        <i className="fa-solid fa-arrow-left text-sm"></i>
                        <span className="font-medium">Back to Courses</span>
                    </Button>
                    <Button 
                        variant="destructive"
                        className="hover:bg-destructive transition-colors duration-200"
                        onClick={() => handleDelete(courseInfo._id)}
                    >
                        <i className="fa-solid fa-trash-alt mr-2"></i>
                        Delete Course
                    </Button>
                </div>

                {/* Course Header Card */}
                <Card className="border-0 shadow-xl bg-card">
                    <CardContent className="p-6">
                        <h1 className="text-2xl font-bold text-foreground mb-2">
                            {courseInfo.title}
                        </h1>
                        <p className="text-muted-foreground mb-4">{courseInfo.subtitle}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <Badge variant="outline">
                                <i className="fa-solid fa-user-tie mr-2"></i>
                                {courseInfo.instructor.name}
                            </Badge>
                            <Badge variant="outline">
                                <i className="fa-regular fa-calendar mr-2"></i>
                                {courseInfo.updatedAt
                                    ? new Date(courseInfo.updatedAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })
                                    : "N/A"}
                            </Badge>
                            <Badge variant="outline">
                                <i className="fa-solid fa-users mr-2"></i>
                                {courseInfo.students.length} Students
                            </Badge>
                            <Badge variant="outline">
                                <i className="fa-solid fa-user-graduate mr-2"></i>
                                {courseInfo.leads.length} Leads
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Course Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Course Description</h2>
                                <p className="text-muted-foreground leading-relaxed">{courseInfo.description}</p>
                            </CardContent>
                        </Card>

                        {/* What You'll Learn */}
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-semibold mb-4">What You'll Learn</h2>
                                <ul className="space-y-2">
                                    {courseInfo.objectives.split(',').map((objective, index) => (
                                        <li key={index} className="flex items-start gap-2 text-muted-foreground">
                                            <i className="fa-solid fa-check-circle text-success mt-1"></i>
                                            <span>{objective.trim()}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Course Curriculum */}
                        <Card className="border-0 shadow-md">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Course Curriculum</h2>
                                <div className="space-y-2">
                                    {courseInfo.files.map((resource, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors duration-200"
                                            onClick={() => setSelectedResource({
                                                title: resource.title,
                                                resourceUrl: resource.resourceUrl || resource.videoUrl,
                                                resourceType: resource.resourceType || "video",
                                            })}
                                        >
                                            <i className={`fa-solid ${resource.resourceType === "pdf" ? "fa-file-pdf" : resource.resourceType === "image" ? "fa-image" : "fa-circle-play"} text-primary`}></i>
                                            <span className="text-foreground">{resource.title}</span>
                                            {resource.freePreview && (
                                                <Badge variant="secondary" className="ml-auto">Preview</Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resource dialog */}
                        <Dialog open={!!selectedResource} onOpenChange={(open) => { if (!open) setSelectedResource(null) }}>
                            <DialogContent className="sm:max-w-[800px]">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-semibold text-center mb-4">
                                        {selectedResource?.title}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="relative rounded-lg overflow-hidden">
                                    {selectedResource?.resourceType === "pdf" ? (
                                        <iframe title={selectedResource.title} src={selectedResource.resourceUrl} className="h-[450px] w-full bg-card" />
                                    ) : selectedResource?.resourceType === "image" ? (
                                        <img src={selectedResource.resourceUrl} alt={selectedResource.title} className="max-h-[450px] w-full object-contain" />
                                    ) : (
                                        <Videoplayer width="100%" height="450px" videoUrl={selectedResource?.resourceUrl ?? ""} />
                                    )}
                                </div>
                                <Button
                                    className="w-full mt-4"
                                    variant="outline"
                                    onClick={() => setSelectedResource(null)}
                                >
                                    Close
                                </Button>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="border-0 shadow-md sticky top-6">
                            <CardContent className="p-6 space-y-6">
                                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                                    <Videoplayer
                                        width="100%"
                                        height="100%"
                                        thumbnail={courseInfo.thumbnail}
                                        videoUrl={courseInfo.files.find((item) => !item.resourceType || item.resourceType === "video")?.resourceUrl || courseInfo.files.find((item) => !item.resourceType || item.resourceType === "video")?.videoUrl || ""}
                                    />
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold text-primary">₹{courseInfo.price}</span>
                                        <Badge variant="secondary" className="text-sm">
                                            {courseInfo.files.length} Lessons
                                        </Badge>
                                    </div>
                                    
                                    <Button 
                                        className="w-full"
                                        onClick={() => navigate(`/instructor/courses/coureview/${courseInfo._id}`)}
                                    >
                                        <i className="fa-solid fa-play-circle mr-2"></i>
                                        View Full Course
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

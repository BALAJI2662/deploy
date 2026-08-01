import { API_BASE_URL } from "../../lib/api";
import { useEffect, useState, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Loader from "../Loading"
import Videoplayer from "../Common/VideoPlayer/Videoplayer"
import { Button } from "../ui/button"
import { useSelector } from "react-redux"
import { RootState } from "../store/store"
import { toast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function StudentCourseDetailesView() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [courseInfo, setCourseInfo] = useState<ICourse>()
    const [isProcessing, setIsProcessing] = useState(false)
    const [isPurchased, setIsPurchased] = useState(false)
    
    const FetchCourseInfo = useCallback(async () => {
        const response = await fetch(`${API_BASE_URL}/courses/get/${id}`)
        const data = await response.json()
        setCourseInfo(data.course)
    }, [id])

    useEffect(() => {
        FetchCourseInfo()   
    }, [FetchCourseInfo])

    const { user } = useSelector((state: RootState) => state.auth)

    useEffect(() => {
        const fetchPurchasedCourses = async () => {
            if (!id) return;
            try {
                const response = await fetch(`${API_BASE_URL}/student/mycourse/all`, { credentials: "include" });
                const data = await response.json();
                const purchased = (data.studentCourses || []).some((purchase: { course?: { courseId: string | { _id: string } }[] }) =>
                    purchase.course?.some((item) => String(typeof item.courseId === "string" ? item.courseId : item.courseId?._id) === id)
                );
                setIsPurchased(purchased);
            } catch (error) {
                console.error("Unable to check purchased courses:", error);
            }
        };
        fetchPurchasedCourses();
    }, [id]);

    const handleDirectOrder = async () => {
        setIsProcessing(true)
        const orderPayload = {
            userId: user.userId,
            userEmail: user.email,
            instructorId: courseInfo?.instructor._id,
            courseId: courseInfo?._id,
            coursePrice: courseInfo?.price,
            courseTitle: courseInfo?.title
        }
        try {
            const response = await fetch(`${API_BASE_URL}/order/direct/stu`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                credentials: "include",
                body: JSON.stringify(orderPayload)
            })
            const data = await response.json()
            if (data.success) {
                toast({ title: "Course purchased successfully!" })
                setIsPurchased(true)
                navigate("/student/mycourses")
            } else {
                toast({ title: data.message || "Order failed, please try again", variant: "destructive" })
            }
        } catch (err) {
            console.log(err)
            toast({ title: "Something went wrong, please try again", variant: "destructive" })
        } finally {
            setIsProcessing(false)
        }
    }

    const [open, setOpen] = useState(false)
    const handleDailog = () => {
        setOpen(!open)
    }

    return (
        <div className="w-full h-full max-sm:h-fit max-sm:mb-20">
            <Button onClick={() => navigate(-1)} variant="link" className="flex gap-2 mb-5"><i className="fa-solid fa-arrow-left"></i> Back</Button>
            {courseInfo == undefined ?
                <Loader />
                :
                <div className="w-full h-[94%]">
                    <div className="w-full h-full grid grid-cols-3 overflow-y-scroll gap-5 max-sm:grid-cols-1">
                        <div className="w-full h-fit bg-black dark:bg-background text-background dark:text-white border shadow-md px-5 py-4 rounded-lg col-span-3 max-sm:col-span-2">
                            <p className="font-bold text-xl">{courseInfo.title}</p>
                            <p className="mt-4 text-gray-400 text-sm">{courseInfo?.subtitle}</p>
                            <div className="mt-4 flex gap-8 font-semibold">
                                <p className=" text-sm text-gray-400">created by {courseInfo?.instructor.name}</p>
                                <p className="text-sm text-gray-400">created on  {courseInfo?.updatedAt
                                    ? new Date(courseInfo.updatedAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })
                                    : new Date().toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}</p>
                                <p className="text-sm text-gray-400">students : {courseInfo.students.length}</p>
                                <p className="text-sm text-gray-400">leads : {courseInfo.leads.length}</p>
                            </div>
                        </div>

                        <div className="shadow-sm w-full h-full px-5 py-4 border-2 rounded-lg col-span-2">
                            <p className="font-bold">Course Description</p>
                            <p className="mt-2">{courseInfo.description}</p>
                        </div>

                        <div className="shadow-sm w-full h-full row-span-4">
                            <div className="w-full h-fit border-2 rounded-lg px-5 py-4 ">
                                <div className="w-full h-full">
                                    <Videoplayer width="100%" height="200px" thumbnail={courseInfo.thumbnail} videoUrl="https://firebasestorage.googleapis.com/v0/b/coursemanagementsystem-ca033.appspot.com/o/52%20-%20Project%20Overview.mp4?alt=media&token=326d2820-70ca-4a4a-b4db-e165a282b234" />
                                </div>
                                <div className="mt-1.5 flex flex-col gap-3">
                                    <p className="font-bold text-lg pl-3">  ₹ {courseInfo.price} </p>
                                    <Button
                                        disabled={isProcessing}
                                        onClick={isPurchased ? () => navigate("/student/mycourses") : handleDirectOrder}
                                        className="w-full"
                                    >
                                        {isPurchased ? "Go to My Courses" : isProcessing ? "Processing ..." : "Order Now"}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="shadow-sm w-full h-fit px-5 py-4 border-2 rounded-lg col-span-2">
                            <p className="font-bold">What you'll learn</p>
                            {
                                courseInfo.objectives.split(',').map((object, index) => {
                                    return <li key={index} className="mt-2">{object}</li>
                                })
                            }
                        </div>

                        <div className="shadow-sm w-full h-fit px-5 py-4 border-2 rounded-lg col-span-2">
                            <p className="font-bold mb-2">Course Curriculum</p>
                            {
                                courseInfo.files.map((video, index) => {
                                    return (
                                        <div key={index} className="h-full w-full flex gap-5">
                                            <Dialog open={open} onOpenChange={setOpen}>
                                                <div className={`flex gap-5 mt-3 items-center h-full ${video.freePreview ? "cursor-pointer" : "cursor-not-allowed"}`}>
                                                    {video.freePreview ? (
                                                        <DialogTrigger asChild>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <i className="fa-regular fa-circle-play"></i>
                                                                <p className="text-gray-600">{video.title}</p>
                                                            </div>
                                                        </DialogTrigger>
                                                    ) : (
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <i className="fa-solid fa-lock"></i>
                                                            <p className="text-gray-500">{video.title}</p>
                                                        </div>
                                                    )}
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle className="mb-6 text-center">{video.title}</DialogTitle>
                                                            <Videoplayer width={"100%"} height={"250px"} videoUrl={video.videoUrl} />
                                                            <DialogDescription>
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <Button onClick={handleDailog} variant="secondary">close</Button>
                                                    </DialogContent>
                                                </div>
                                            </Dialog>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

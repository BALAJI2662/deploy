import Videoplayer from "@/components/Common/VideoPlayer/Videoplayer";
import Loader from "@/components/Loading";
import { FetchViewCourses } from "@/components/store/slices/lead/courseprogress";
import { AppDispatch, RootState } from "@/components/store/store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { hourglass } from 'ldrs'

export default function LeadCourseEnrollDetailesPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, courseData } = useSelector(
    (state: RootState) => state.progress
  );
  const [value, setValue] = useState<number | undefined>(1);
  const [videoLoad,setVideoLoad] = useState<boolean>(false);
  const { id } = useParams();
  hourglass.register() 

  useEffect(() => {
    if (id) {
      dispatch(FetchViewCourses(id));
    }
  }, [id]);

 
  
  if (isLoading) {
    return <Loader/>;
  }

  if (!courseData || courseData.length === 0 || !courseData[0]?.course?.[0]?.courseId) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto text-center py-20">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-500 mb-4">The course you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
        </div>
      </div>
    );
  }
  function handleCourse(index:number){

    setValue(index+1);
    setVideoLoad(true);

    setTimeout(() => {
      setVideoLoad(false); 
    },1000); 
  }
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center gap-2 bg-white hover:bg-primary hover:text-white transition-colors duration-200"
          >
            <i className="fa-solid fa-arrow-left text-sm"></i>
            <span className="font-medium">Back to Courses</span>
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
          {/* Course Videos Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <i className="fa-solid fa-list-ul text-primary text-sm"></i>
                  Course Content
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {courseData[0].course[0].courseId.files.length} items
                </p>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {courseData[0].course[0].courseId.files.map((data, index) => (
                    <div
                      onClick={() => handleCourse(index)}
                      key={index}
                      className={`
                        group relative flex items-center gap-3 p-3 m-1 rounded-lg cursor-pointer
                        transition-all duration-200 hover:bg-primary/5
                        ${value && value - 1 === index 
                          ? "bg-primary/10 border border-primary/20 shadow-sm" 
                          : "hover:shadow-sm"
                        }
                      `}
                    >
                      <div className={`
                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                        ${value && value - 1 === index 
                          ? "bg-primary text-white" 
                          : "bg-gray-100 text-gray-400 group-hover:bg-primary/20 group-hover:text-primary"
                        }
                      `}>
                        <i className={`fa-solid ${data.resourceType === "pdf" ? "fa-file-pdf" : data.resourceType === "image" ? "fa-image" : value && value - 1 === index ? "fa-pause" : "fa-play"} text-xs`}></i>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`
                          text-sm font-medium truncate
                          ${value && value - 1 === index 
                            ? "text-primary" 
                            : "text-gray-700 group-hover:text-gray-900"
                          }
                        `}>
                          {data.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {(data.resourceType || "video").toUpperCase()} {index + 1}
                        </p>
                      </div>

                      {value && value - 1 === index && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Video Player Section */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
              {courseData[0].course[0].courseId.files
                .filter((_, index) => index + 1 === value)
                .map((data) => (
                  <div key={data.title} className="h-full flex flex-col">
                    {/* Video Container */}
                    <div className="flex-1 p-4 lg:p-6">
                      <div className="w-full h-full min-h-[300px] lg:min-h-[400px] rounded-lg overflow-hidden bg-black/5 flex items-center justify-center">
                        {videoLoad ? (
                          <div className="flex flex-col items-center gap-4">
                            <p className="text-sm text-gray-500">Loading video...</p>
                          </div>
                        ) : data.resourceType === "pdf" ? (
                          <iframe title={data.title} src={data.resourceUrl || data.videoUrl} className="h-full w-full bg-white" />
                        ) : data.resourceType === "image" ? (
                          <img src={data.resourceUrl || data.videoUrl} alt={data.title} className="h-full w-full object-contain" />
                        ) : (
                          <Videoplayer
                            thumbnail={courseData[0].course[0].courseId.thumbnail}
                            width="100%"
                            height="100%"
                            videoUrl={data.resourceUrl || data.videoUrl}
                          />
                        )}
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="border-t border-gray-100 p-4 lg:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 leading-tight">
                            {data.title}
                          </h1>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <i className={`fa-solid ${data.resourceType === "pdf" ? "fa-file-pdf" : data.resourceType === "image" ? "fa-image" : "fa-video"} text-xs`}></i>
                              {(data.resourceType || "video").toUpperCase()} {value} of {courseData[0].course[0].courseId.files.length}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="fa-solid fa-clock text-xs"></i>
                              Now Playing
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={value === 1}
                            onClick={() => value && value > 1 && handleCourse(value - 2)}
                            className="h-9 px-3"
                          >
                            <i className="fa-solid fa-step-backward text-xs"></i>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={value === courseData[0].course[0].courseId.files.length}
                            onClick={() => value && value < courseData[0].course[0].courseId.files.length && handleCourse(value)}
                            className="h-9 px-3"
                          >
                            <i className="fa-solid fa-step-forward text-xs"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

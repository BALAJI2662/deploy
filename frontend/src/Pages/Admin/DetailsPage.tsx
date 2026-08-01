import Videoplayer from "@/components/Common/VideoPlayer/Videoplayer";
import Loader from "@/components/Loading";
import { AppDispatch, RootState } from "@/components/store/store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { hourglass } from "ldrs";
import BookLoader from "@/components/Loading/BookLoader";
import { FetchAdminCourseView } from "@/components/store/slices/admin/course-view";

export default function StudentCourseEnrollDetailesPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, courseData } = useSelector(
    (state: RootState) => state.adminProgress
  );
  const [value, setValue] = useState<number | undefined>(1);
  const [videoLoad, setVideoLoad] = useState<boolean>(false);
  const { id } = useParams();
  hourglass.register();

  useEffect(() => {
    if (id) {
      dispatch(FetchAdminCourseView(id));
    }
  }, [id]);

  if (isLoading) {
    return <Loader />;
  }

  function handleCourse(index: number) {
    setValue(index + 1);
    setVideoLoad(true);

    setTimeout(() => {
      setVideoLoad(false);
    }, 1000);
  }

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 bg-background">
      {/* Course Navigation Sidebar */}
      <div className="lg:w-1/4 w-full lg:h-auto h-fit bg-card rounded-lg shadow-sm">
        <div className="p-4">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="flex gap-2 w-full hover:bg-muted"
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Course
          </Button>
        </div>
        <div className="border-t">
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-4">
              <h4 className="mb-4 text-lg font-semibold text-foreground">
                Course Content
              </h4>
              {courseData?.files &&
                courseData.files.map((data, index) => (
                  <div
                    onClick={() => handleCourse(index)}
                    key={index}
                    className={`
                      flex items-center gap-3 px-4 py-3 my-1 rounded-lg cursor-pointer
                      transition-colors duration-200
                      ${
                        value && value - 1 === index
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      }
                    `}
                  >
                    {value && value - 1 === index ? (
                      <i className="fa-solid fa-circle-pause"></i>
                    ) : (
                      <i className="fa-regular fa-circle-play"></i>
                    )}
                    <span className="text-sm font-medium truncate">
                      {data.title}
                    </span>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="lg:w-3/4 w-full bg-card shadow-sm rounded-lg">
        {courseData?.files &&
          courseData.files
            .filter((_, index) => index + 1 === value)
            .map((data) => (
              <div key={data.title} className="w-full h-full p-6">
                <div className="mb-6">
                  <h1 className="text-2xl font-semibold text-foreground">
                    {data.title}
                  </h1>
                </div>
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted">
                  {videoLoad ? (
                    <div className="h-full flex justify-center items-center">
                      <BookLoader />
                    </div>
                  ) : (
                    <Videoplayer
                      thumbnail={courseData.thumbnail}
                      width="100%"
                      height="100%"
                      videoUrl={data.videoUrl}
                    />
                  )}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

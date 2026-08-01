import { API_BASE_URL } from "../../lib/api";
import { ChangeEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { courseSchemaFields } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { uploadToCloudinary } from "@/lib/cloudinary";
import Videoplayer from "@/components/Common/VideoPlayer/Videoplayer";
import { useNavigate } from "react-router-dom";

type ResourceType = "video" | "pdf" | "image";
type CourseResource = {
    id: number;
    title: string;
    freePreview: boolean;
    resourceType: ResourceType;
    resourceUrl: string | null;
};

const AddCourse = () => {
    const navigate = useNavigate()
    const [sections, setSections] = useState<CourseResource[]>([
        { id: 1, title: "", freePreview: false, resourceType: "video", resourceUrl: null },
    ]);

    const [formData, setFormData] = useState({
        title: "",
        thumbnail: "",
        subtitle: "",
        description: "",
        category: "",
        objectives: "",
        requirements: "",
        price: "",
        Level: "",
    });

    const addSection = () => {
        setSections((prev) => [
            ...prev,
            { id: prev.length + 1, title: "", freePreview: false, resourceType: "video", resourceUrl: null },
        ]);
    };

    const deleteSection = (id: number) => {
        setSections((prev) => prev.filter((section) => section.id !== id));
    };

    const handleInputChange = (
        id: number,
        key: "title" | "freePreview" | "resourceUrl",
        value: string | boolean | null
    ) => {
        setSections((prev) =>
            prev.map((section) =>
                section.id === id ? { ...section, [key]: value } : section
            )
        );
    };

    const handleResourceTypeChange = (id: number, resourceType: ResourceType) => {
        setSections((prev) => prev.map((section) =>
            section.id === id ? { ...section, resourceType, resourceUrl: null } : section
        ));
    };

    const handleFileChange = async (section: CourseResource, file: File | null) => {
        if (file) {
            try {
                const isValidFile = section.resourceType === "video"
                    ? file.type.startsWith("video/")
                    : section.resourceType === "pdf"
                        ? file.type === "application/pdf"
                        : file.type.startsWith("image/");
                if (!isValidFile) {
                    alert(`Please upload a valid ${section.resourceType} file`);
                    return;
                }
                const maxSize = section.resourceType === "video" ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
                if (file.size > maxSize) {
                    alert(`File size should be less than ${section.resourceType === "video" ? "100" : "10"}MB`);
                    return;
                }
                const folder = section.resourceType === "video"
                    ? "CourseVideos"
                    : section.resourceType === "pdf" ? "CourseDocuments" : "CourseImages";
                const resourceUrl = await uploadToCloudinary(file, folder, (progress) => {
                    console.log(`Upload is ${progress}% done`);
                });
                handleInputChange(section.id, "resourceUrl", resourceUrl);
            } catch (error) {
                console.error("Error during file upload: ", error);
                alert(error instanceof Error ? error.message : "Error uploading file");
            }
        }
    };

    const handleThumbnailChange = async (file: File | null) => {
        if (file) {
            try {
                if (!file.type.startsWith('image/')) {
                    alert('Please upload a valid image file');
                    return;
                }
                const maxSize = 5 * 1024 * 1024;
                if (file.size > maxSize) {
                    alert('File size should be less than 5MB');
                    return;
                }
                const thumbnailUrl = await uploadToCloudinary(file, "CourseThumbnails", (progress) => {
                    console.log(`Thumbnail upload is ${progress}% done`);
                });
                setFormData((prevData) => ({
                    ...prevData,
                    thumbnail: thumbnailUrl,
                }));
            } catch (error) {
                console.error("Error during thumbnail upload: ", error);
                alert(error instanceof Error ? error.message : "Error uploading thumbnail");
            }
        }
    };

    const handleInput = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((data) => ({
            ...data,
            [event.target.name]: event.target.value,
        }));
    };

    const isFormValid = () => {
        const requiredFields = [
            "title",
            "price",
            "requirements",
            "objectives",
            "thumbnail",
            "subtitle",
            "description",
            "category",
            "Level",
        ];
        const areFieldsValid = requiredFields.every((field) =>
            formData[field as keyof typeof formData]?.toString().trim() !== ""
        );
        const areSectionsValid = sections.every(
            (section) => section.title.trim() !== "" && section.resourceUrl !== null
        );
        return areFieldsValid && areSectionsValid;
    };

    const handleFormSubmit = () => {
        const formSubmissionData = {
            ...formData,
            files: sections.map(({ id, title, freePreview, resourceType, resourceUrl }) => ({
                id,
                title,
                freePreview,
                resourceType,
                resourceUrl,
                videoUrl: resourceType === "video" ? resourceUrl : "",
            })),
        };

        console.log("Submitting form data: ", formSubmissionData);
        fetch(`${API_BASE_URL}/instructor/course/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials : "include",
            body: JSON.stringify(formSubmissionData)
        }).then(response => response.json())
            .then((data) => {
                console.log(data)
                navigate("/instructor/courses")
            })
            .catch((err) => {
                console.log(err)
            })
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!isFormValid()) {
            console.error("Form is invalid");
            return;
        }
        handleFormSubmit();
    };

    return (
        <div className="min-h-full bg-background">
            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto pb-8">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Course Details */}
                    <div className="w-full min-w-0 lg:w-1/2 rounded-lg border bg-card p-5">
                        <div className="border-b border-border pb-4 mb-5">
                            <h1 className="text-xl font-semibold">Create New Course</h1>
                            <p className="text-sm text-muted-foreground">Fill in the details</p>
                        </div>
                        
                        <div className="space-y-4">
                            {courseSchemaFields.map((field, index) => (
                                <div key={field.label + index}>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                                        {field.label}
                                    </label>
                                    
                                    {field.type === "text" || field.type === "number" ? (
                                        <Input
                                            onChange={handleInput}
                                            name={field.name}
                                            type={field.type}
                                            placeholder={field.label}
                                            className="border-gray-200"
                                        />
                                    ) : null}

                                    {field.type === "textarea" ? (
                                        <Textarea
                                            onChange={handleInput}
                                            name={field.name}
                                            placeholder={field.label}
                                            rows={4}
                                            className="border-gray-200"
                                        />
                                    ) : null}

                                    {field.type === "file" && field.name === "thumbnail" ? (
                                        <div className="space-y-2">
                                            <Input
                                                type="file"
                                                name={field.name}
                                                placeholder={field.label}
                                                onChange={(e) => handleThumbnailChange(e.target.files?.[0] ?? null)}
                                                className="border-gray-200"
                                            />
                                            {formData.thumbnail && (
                                                <img 
                                                    src={formData.thumbnail} 
                                                    alt="Course thumbnail" 
                                                    className="w-full h-32 object-cover rounded-md"
                                                />
                                            )}
                                        </div>
                                    ) : null}

                                    {field.type === "select" && field.options ? (
                                        <Select
                                            onValueChange={(value) =>
                                                setFormData((data) => ({ ...data, [field.name]: value }))
                                            }
                                        >
                                            <SelectTrigger className="w-full border-gray-200">
                                                <SelectValue placeholder={field.label} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {field.options.map((option, idx) => (
                                                    <SelectItem key={option + idx} value={option}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Course resources */}
                    <div className="w-full min-w-0 lg:w-1/2 rounded-lg border bg-card p-5">
                        <div className="border-b border-border pb-4 mb-5">
                            <h1 className="text-xl font-semibold">Course Content</h1>
                            <p className="text-sm text-muted-foreground">Add videos, PDFs, and images in any order</p>
                        </div>
                        
                        <div className="space-y-4">
                            {sections.map((section) => (
                                <div
                                    key={section.id}
                                    className="border rounded-lg p-4"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-medium">Section {section.id}</h3>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="h-7 w-7 rounded-full p-0"
                                            type="button"
                                            onClick={() => deleteSection(section.id)}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                    
                                    <Input
                                        placeholder="Enter resource title"
                                        value={section.title}
                                        onChange={(e) => handleInputChange(section.id, "title", e.target.value)}
                                        className="mb-3"
                                    />

                                    <Select
                                        value={section.resourceType}
                                        onValueChange={(value) => handleResourceTypeChange(section.id, value as ResourceType)}
                                    >
                                        <SelectTrigger className="mb-3">
                                            <SelectValue placeholder="Resource type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="video">Video lesson</SelectItem>
                                            <SelectItem value="pdf">PDF document</SelectItem>
                                            <SelectItem value="image">Image</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {section.resourceUrl && section.resourceType === "video" ? (
                                        <div className="rounded-md overflow-hidden mb-3">
                                            <Videoplayer height="150px" width="100%" videoUrl={section.resourceUrl} />
                                        </div>
                                    ) : section.resourceUrl && section.resourceType === "image" ? (
                                        <img src={section.resourceUrl} alt={section.title || "Course resource"} className="mb-3 h-36 w-full rounded-md object-cover" />
                                    ) : section.resourceUrl ? (
                                        <a href={section.resourceUrl} target="_blank" rel="noreferrer" className="mb-3 block rounded-md border p-3 text-sm text-primary underline">
                                            PDF uploaded — open preview
                                        </a>
                                    ) : (
                                        <Input
                                            type="file"
                                            accept={section.resourceType === "video" ? "video/*" : section.resourceType === "pdf" ? "application/pdf" : "image/*"}
                                            onChange={(e) => handleFileChange(section, e.target.files?.[0] ?? null)}
                                            className="mb-3"
                                        />
                                    )}
                                    
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={section.freePreview}
                                            onCheckedChange={(checked) =>
                                                handleInputChange(section.id, "freePreview", Boolean(checked))
                                            }
                                        />
                                        <label className="text-sm text-gray-600">
                                            Free preview
                                        </label>
                                    </div>
                                </div>
                            ))}
                            
                            <Button 
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                type="button" 
                                onClick={addSection}
                            >
                                Add Section
                            </Button>
                        </div>
                    </div>
                </div>
                
                <div className="mt-4">
                    <Button 
                        type="submit" 
                        disabled={!isFormValid()} 
                        className={`w-full py-2 ${
                            isFormValid() 
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                                : 'opacity-50 cursor-not-allowed'
                        }`}
                    >
                        {isFormValid() ? 'Create Course' : 'Please fill all required fields'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddCourse;

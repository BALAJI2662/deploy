import { AppDispatch } from "@/components/store/store";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Progress } from "@/components/ui/progress";
import { FetchInstructor } from "@/components/store/slices/authSlice";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function InstructorForm() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [progress, setProgress] = useState<number>();
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const uploadFile = async (file: File): Promise<string> => {
        return uploadToCloudinary(file, "Profiles", (prog) => {
            setProgress(prog);
        });
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        
        try {
            const formData = new FormData(event.currentTarget);
            const rollNumber = formData.get("rollNumber") as string;
            const branch = formData.get("branch") as string;
            const college = formData.get("college") as string;
            const gender = formData.get("gender") as string;
            const linkedIn = formData.get("linkedIn") as string;
            const gitHub = formData.get("gitHub") as string;
            const UPI = formData.get("UPI") as string;

            // Validate roll number
            const rollNumberVerify = /^[A-Z0-9]{10}$/;
            if (!rollNumberVerify.test(rollNumber)) {
                toast({
                    title: "Invalid roll number format",
                    description: "Roll number must be 10 characters long and contain only capital letters and numbers",
                    variant: "destructive"
                });
                setLoading(false);
                return;
            }

            // Use uploaded image or default avatar
            const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80";
            let profileImgUrl = DEFAULT_AVATAR;

            if (selectedFiles && selectedFiles[0]) {
                try {
                    profileImgUrl = await uploadFile(selectedFiles[0]);
                } catch (uploadError) {
                    console.warn("Cloudinary upload failed, falling back to default image:", uploadError);
                    profileImgUrl = DEFAULT_AVATAR;
                }
            }

            // Validate LinkedIn URL
            if (linkedIn && !linkedIn.includes('linkedin.com')) {
                toast({
                    title: "Invalid LinkedIn URL",
                    description: "Please enter a valid LinkedIn profile URL",
                    variant: "destructive"
                });
                setLoading(false);
                return;
            }

            // Validate GitHub URL
            if (gitHub && !gitHub.includes('github.com')) {
                toast({
                    title: "Invalid GitHub URL",
                    description: "Please enter a valid GitHub profile URL",
                    variant: "destructive"
                });
                setLoading(false);
                return;
            }

            // Submit form data
            const instructorData = {
                rollNumber,
                branch,
                college,
                gender,
                linkedIn,
                gitHub,
                UPI,
                profileImg: profileImgUrl
            };

            const result = await dispatch(FetchInstructor(instructorData)).unwrap();
            
            if (result.success) {
                toast({
                    title: result.message || "Registration successful",
                    variant: "default"
                });
                navigate("/instructor/dashboard");
            } else {
                toast({
                    title: result.message || "Registration failed",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error("Form submission failed:", error);
            toast({
                title: "Form submission failed",
                description: error instanceof Error ? error.message : "Please try again",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full h-full p-4 md:px-10 md:py-5 flex flex-col items-center gap-3">
            <div className="w-full max-w-lg">
                <FileUpload 
                    onChange={(files) => setSelectedFiles(files)}
                    value={selectedFiles}
                />
                {progress !== undefined && progress < 100 && (
                    <Progress value={progress} className="w-full h-2 mt-2" />
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full max-w-lg">
                <div className="w-full md:w-1/2">
                    <Label htmlFor="rollnumber" className="text-sm font-medium">Roll Number</Label>
                    <Input 
                        required 
                        name="rollNumber" 
                        minLength={10} 
                        maxLength={10} 
                        id="rollnumber" 
                        className="mt-1 bg-background p-2 md:p-5" 
                        placeholder="e.g., 21A91A05J5" 
                    />
                </div>

                <div className="w-full md:w-1/2">
                    <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                    <Select required name="gender">
                        <SelectTrigger id="gender" className="mt-1 bg-background p-2 md:p-5">
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full max-w-lg">
                <div className="w-full md:w-1/2">
                    <Label htmlFor="branch" className="text-sm font-medium">Branch</Label>
                    <Select required name="branch">
                        <SelectTrigger id="branch" className="mt-1 bg-background p-2 md:p-5">
                            <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CSE">Computer Science</SelectItem>
                            <SelectItem value="IT">Information Technology</SelectItem>
                            <SelectItem value="ECE">Electronics & Communication</SelectItem>
                            <SelectItem value="EEE">Electrical & Electronics</SelectItem>
                            <SelectItem value="MECH">Mechanical</SelectItem>
                            <SelectItem value="CIVIL">Civil</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full md:w-1/2">
                    <Label htmlFor="college" className="text-sm font-medium">College</Label>
                    <Input 
                        required 
                        name="college" 
                        id="college" 
                        className="mt-1 bg-background p-2 md:p-5" 
                        placeholder="Enter your college name" 
                    />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full max-w-lg">
                <div className="w-full md:w-1/2">
                    <Label htmlFor="linkedIn" className="text-sm font-medium">LinkedIn Profile</Label>
                    <Input 
                        required 
                        name="linkedIn" 
                        id="linkedIn" 
                        type="url" 
                        className="mt-1 bg-background p-2 md:p-5" 
                        placeholder="https://linkedin.com/in/username" 
                    />
                </div>

                <div className="w-full md:w-1/2">
                    <Label htmlFor="gitHub" className="text-sm font-medium">GitHub Profile</Label>
                    <Input 
                        required 
                        name="gitHub" 
                        id="gitHub" 
                        type="url" 
                        className="mt-1 bg-background p-2 md:p-5" 
                        placeholder="https://github.com/username" 
                    />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full max-w-lg">
                <div className="w-full md:w-1/2">
                    <Label htmlFor="UPI" className="text-sm font-medium">UPI ID</Label>
                    <Input 
                        required 
                        name="UPI" 
                        id="UPI" 
                        className="mt-1 bg-background p-2 md:p-5" 
                        placeholder="Enter your UPI ID" 
                    />
                </div>
            </div>

            <Button 
                disabled={loading} 
                type="submit" 
                className="w-full md:w-1/2 mt-6 md:mt-10"
            >
                {loading ? "Submitting..." : "Submit"}
            </Button>
        </form>
    );
}
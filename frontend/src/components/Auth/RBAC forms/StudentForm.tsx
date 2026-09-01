import { FetchStudent } from "@/components/store/slices/authSlice";
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
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Progress } from "@radix-ui/react-progress";
import { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function StudentForm() {
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
        
        try {            const formData = new FormData(event.currentTarget);
            const rollNumber = formData.get("rollNumber") as string;
            const branch = formData.get("branch") as string;
            const teamNum = formData.get("team") as string;
            const gender = formData.get("gender") as string;

            // Validate team number
            if (!teamNum || !teamNum.match(/^Team-([1-9]|10)$/)) {
                toast({
                    title: "Invalid team number",
                    description: "Please select a valid team",
                    variant: "destructive"
                });
                setLoading(false);
                return;
            }

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

            // Submit form data
            const studentData = {
                rollNumber,
                branch,
                teamNum,
                gender,
                profileImg: profileImgUrl
            };

            const result = await dispatch(FetchStudent(studentData)).unwrap();
            
            if (result.success) {
                toast({
                    title: result.message || "Registration successful",
                    variant: "default"
                });
                navigate("/student/dashboard");
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
                            <SelectItem value="CSD">Computer Science & Design</SelectItem>
                            <SelectItem value="CAI">Computer Science & AI</SelectItem>
                            <SelectItem value="AID">Artificial Intelligence & Data Science</SelectItem>
                            <SelectItem value="CMS">Computer Science & Machine learning</SelectItem>
                            <SelectItem value="CSC">Computer Science & Cyber Security</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full md:w-1/2">
                    <Label htmlFor="team" className="text-sm font-medium">Team</Label>
                    <Select required name="team">
                        <SelectTrigger id="team" className="mt-1 bg-background p-2 md:p-5">
                            <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Team-1">Team 1</SelectItem>
                            <SelectItem value="Team-2">Team 2</SelectItem>
                            <SelectItem value="Team-3">Team 3</SelectItem>
                            <SelectItem value="Team-4">Team 4</SelectItem>
                            <SelectItem value="Team-5">Team 5</SelectItem>
                            <SelectItem value="Team-6">Team 6</SelectItem>
                            <SelectItem value="Team-7">Team 7</SelectItem>
                            <SelectItem value="Team-8">Team 8</SelectItem>
                            <SelectItem value="Team-9">Team 9</SelectItem>
                            <SelectItem value="Team-10">Team 10</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Button 
                disabled={loading} 
                type="submit" 
                className="w-full md:w-1/2 mt-6 md:mt-10 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all duration-200"
            >
                {loading ? "Submitting..." : "Submit"}
            </Button>
        </form>
    );
}

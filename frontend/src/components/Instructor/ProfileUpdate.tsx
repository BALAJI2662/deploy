import { Label } from "@radix-ui/react-label";
import { FileUpload } from "../ui/file-upload";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { ChangeEvent, FormEvent, useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { UpdateInstructorProfileInfo } from "../store/slices/Instructor/profile";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InstructorProfileUpdate() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<{
    linkedIn?: string;
    gitHub?: string;
    rollNumber?: string;
    gender?: string;
    college?: string;
    branch?: string;
    UPI?: string;
    profileImg?: string;
  }>({
    linkedIn: "",
    gitHub: "",
    rollNumber: "",
    gender: "",
    college: "",
    branch: "",
    UPI: "",
    profileImg: ""
  });

  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleFileUpload = (file: File[]) => {
    if (file && file[0]) {
      setProfileImg(file[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (profileImg) {
        const imgUrl = await uploadToCloudinary(profileImg, "Profiles", (prog) => {
          setProgress(prog);
        });
        await submitProfileData({ ...formData, profileImg: imgUrl });
      } else {
        await submitProfileData(formData);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error updating profile",
        description: "Please try again",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  const submitProfileData = async (data: typeof formData) => {
    try {
      const result = await dispatch(UpdateInstructorProfileInfo(data as FORMDATA));
      if (result) {
        toast({
          title: "Profile updated successfully",
          variant: "default"
        });
        navigate("/instructor/profile");
      } else {
        throw new Error("Update failed");
      }    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Please try again later";
      toast({
        title: "Failed to update profile",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <Button 
          onClick={() => navigate(-1)} 
          variant="outline" 
          className="mb-6 flex items-center gap-2 bg-card hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
        >
          <i className="fa-solid fa-arrow-left text-sm"></i>
          <span className="font-medium">Back</span>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Update Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center">
                <FileUpload onChange={handleFileUpload} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="linkedIn" className="text-sm font-medium">LinkedIn Profile</Label>
                  <Input
                    name="linkedIn"
                    id="linkedIn"
                    placeholder="https://linkedin.com/in/..."
                    className="bg-card"
                    value={formData.linkedIn}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gitHub" className="text-sm font-medium">GitHub Profile</Label>
                  <Input
                    name="gitHub"
                    id="gitHub"
                    placeholder="https://github.com/..."
                    className="bg-card"
                    value={formData.gitHub}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rollNumber" className="text-sm font-medium">Roll Number</Label>
                  <Input
                    name="rollNumber"
                    id="rollNumber"
                    minLength={10}
                    maxLength={10}
                    placeholder="Enter your roll number"
                    className="bg-card"
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                  <Select
                    name="gender"
                    onValueChange={(value) => handleSelectChange("gender", value)}
                  >
                    <SelectTrigger id="gender" className="bg-card">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Transgender">Transgender</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="college" className="text-sm font-medium">College</Label>
                  <Input
                    name="college"
                    id="college"
                    placeholder="Enter your college name"
                    className="bg-card"
                    value={formData.college}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-sm font-medium">Branch</Label>
                  <Select
                    name="branch"
                    onValueChange={(value) => handleSelectChange("branch", value)}
                  >
                    <SelectTrigger id="branch" className="bg-card">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSD">CSD</SelectItem>
                      <SelectItem value="AID">AID</SelectItem>
                      <SelectItem value="CAI">CAI</SelectItem>
                      <SelectItem value="Cyber">Cyber</SelectItem>
                      <SelectItem value="CSM">CSM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="UPI" className="text-sm font-medium">UPI ID</Label>
                  <Input
                    id="UPI"
                    name="UPI"
                    placeholder="Enter your UPI ID"
                    className="bg-card"
                    value={formData.UPI}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full p-6 mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  progress > 0 && progress < 100 ? (
                    `Uploading: ${progress}%`
                  ) : (
                    "Updating profile..."
                  )
                ) : (
                  "Update Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

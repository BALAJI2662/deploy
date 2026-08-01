import InstructorForm from "@/components/Auth/RBAC forms/InstructorForm"
import LeadForm from "@/components/Auth/RBAC forms/LeadForm"
import StudentForm from "@/components/Auth/RBAC forms/StudentForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function UserInfo() {
    return (
        <div className="w-full min-h-screen p-2 md:p-4">
            <Tabs defaultValue="student" className="w-full h-full flex flex-col lg:flex-row p-2 md:p-6 lg:p-10 gap-4 lg:gap-5">
                <div className="w-full lg:w-[20%] bg-muted rounded-xl flex flex-col items-center p-4">
                    <div className="w-full h-28 justify-center flex flex-col items-center mt-2 lg:mt-10">
                        <img className="rounded-full w-16 h-16 md:w-20 md:h-20" src="https://media.licdn.com/dms/image/v2/D560BAQEdNp5niau0Rw/company-logo_200_200/company-logo_200_200/0/1683745552013?e=2147483647&v=beta&t=_aZWsVKmdXjwuABqnHdc-DnHvLrZJxHfSQjtkJ_qzhM" alt="CMS Logo" />
                        <p className="font-bold mt-2">CMS</p>
                    </div>
                    <TabsList className="flex flex-row lg:flex-col w-full h-fit mt-4 lg:mt-24 gap-2 lg:gap-4">
                        <TabsTrigger className="p-2 md:p-3 w-full bg-background text-sm md:text-base" value="student">Student</TabsTrigger>
                        <TabsTrigger className="p-2 md:p-3 w-full bg-background text-sm md:text-base" value="lead">Lead</TabsTrigger>
                        <TabsTrigger className="p-2 md:p-3 w-full bg-background text-sm md:text-base" value="instructor">Instructor</TabsTrigger>
                    </TabsList>
                </div>
                <div className="w-full lg:w-[78%] bg-muted rounded-xl mt-4 lg:mt-0">
                    <TabsContent className="w-full h-full p-2 md:p-4" value="student">
                        <StudentForm />
                    </TabsContent>
                    <TabsContent className="w-full h-full p-2 md:p-4" value="lead">
                        <LeadForm />
                    </TabsContent>
                    <TabsContent className="w-full h-full p-2 md:p-4" value="instructor">
                        <InstructorForm />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}

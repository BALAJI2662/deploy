import Loader from "@/components/Loading";
import { FindTeamMembers, setSearchTerm, setSortBy, toggleSortOrder, sendTeamMessage } from "@/components/store/slices/lead/teamSlice";
import { AppDispatch, RootState } from "@/components/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
    Mail, 
    ArrowUpDown, 
    ArrowDown, 
    ArrowUp, 
    Search, 
    User, 
    Users,
    Phone, 
    Building2, 
    GraduationCap,
    Book,
    BookOpen,
    CircleDot,
    MessageSquare
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";


export const LeadTeamMembers = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading, filteredTeamInfo, sortBy, sortOrder } = useSelector((state: RootState) => state.team);
    const [selectedMember, setSelectedMember] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        dispatch(FindTeamMembers());
    }, [dispatch]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setSearchTerm(e.target.value));
    };

    const handleSort = (value: 'name' | 'team' | 'courses') => {
        if (value === sortBy) {
            dispatch(toggleSortOrder());
        } else {
            dispatch(setSortBy(value));
        }
    };

    const handleSendMessage = async (memberId: string) => {
        if (!message.trim()) {
            toast({
                title: "Error",
                description: "Please enter a message",
                variant: "destructive"
            });
            return;
        }        try {
            await dispatch(sendTeamMessage({ memberId, message }));
            toast({
                title: "Success",
                description: "Message sent successfully",
            });
            setMessage("");
        } catch (err) {
            toast({
                title: "Error",
                description: err instanceof Error ? err.message : "Failed to send message",
                variant: "destructive"
            });
        }
    };

    if (isLoading) {
        return <Loader />;
    }    const SortIcon = () => {
        if (sortOrder === 'asc') return <ArrowUp className="inline ml-2 h-4 w-4" />;
        return <ArrowDown className="inline ml-2 h-4 w-4" />;
    };

    return (
        <div className="w-full h-full">
            <div className="w-full h-fit flex items-center justify-between px-1 max-sm:px-2 max-sm:flex-col max-sm:gap-5">
                <h1 className="text-xl font-bold">Your Team Members</h1>
                <div className="w-[60%] flex items-center gap-5 justify-end max-sm:w-full">
                    <Select value={sortBy} onValueChange={(value: 'name' | 'team' | 'courses') => handleSort(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by..." />
                            <ArrowUpDown className="h-4 w-4" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Sort by</SelectLabel>
                                <SelectItem value="name">
                                    <User className="mr-2 h-4 w-4 inline" />
                                    Name {sortBy === 'name' && <SortIcon />}
                                </SelectItem>
                                <SelectItem value="team">
                                    <Users className="mr-2 h-4 w-4 inline" />
                                    Team {sortBy === 'team' && <SortIcon />}
                                </SelectItem>
                                <SelectItem value="courses">
                                    <GraduationCap className="mr-2 h-4 w-4 inline" />
                                    Courses {sortBy === 'courses' && <SortIcon />}
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>                    <div className="relative w-[60%]">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-8"
                            placeholder="Search by name, team, or email..."
                            onChange={handleSearch}
                        />
                    </div>
                </div>
            </div>
            <div className="w-full h-full py-10 flex justify-center max-sm:px-3">
                <div className="w-[100%] h-fit grid grid-cols-4 grid-flow-row gap-10 max-sm:grid-cols-1 pb-16 max-sm:w-[80%]">
                    {filteredTeamInfo.length > 0 ? (
                        filteredTeamInfo.map((member) => (
                            <div key={member._id} className="w-[100%] h-fit border-2 shadow-sm py-4 rounded-md flex flex-col items-center justify-center gap-y-3">
                                <div className="w-[90%]">
                                    <h1 className="font-bold text-foreground text-center truncate">{member.name}</h1>
                                </div>
                                <div>
                                    <img
                                        src={member.profileImg}
                                        className="h-20 w-20 flex-shrink-0 rounded-full object-cover"
                                        width={80}
                                        height={80}
                                        alt={`${member.name}'s avatar`}
                                    />
                                </div>
                                <div className="w-[100%] flex flex-col items-center">
                                    <p className="font-medium text-foreground">{member.teamNum}</p>
                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                    {member.branch && <p className="text-sm text-muted-foreground">{member.branch}</p>}
                                </div>

                                <div className="w-[100%] justify-center flex gap-2 px-5">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">View Profile</Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-[500px]">
                                            <DialogHeader>
                                                <DialogTitle className="text-center text-primary">
                                                    {member.name} <span className="text-foreground">from {member.teamNum}</span>
                                                </DialogTitle>
                                                <DialogDescription className="text-center pt-2">
                                                    <p>{member.email}</p>                                                {member.phone && (
                                                    <p className="flex items-center gap-2 justify-center">
                                                        <Phone className="h-4 w-4" />
                                                        {member.phone}
                                                    </p>
                                                )}
                                                    {member.college && (
                                                        <p className="flex items-center gap-2 justify-center">
                                                            <Building2 className="h-4 w-4" />
                                                            {member.college}
                                                        </p>
                                                    )}
                                                    {member.branch && (
                                                        <p className="flex items-center gap-2 justify-center">
                                                            <GraduationCap className="h-4 w-4" />
                                                            {member.branch}
                                                        </p>
                                                    )}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="p-4 space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Book className="h-5 w-5" />
                                                    <h3 className="font-semibold">Enrolled Courses ({member.courses?.length || 0})</h3>
                                                </div>
                                                <div className="max-h-[200px] overflow-y-auto space-y-2">
                                                    {member.courses?.length > 0 ? (
                                                        member.courses.map((courseData, index) => (
                                                            <div key={index} className="flex items-center gap-2 p-2 border rounded">
                                                                <BookOpen className="h-4 w-4 flex-shrink-0" />
                                                                <div className="flex-1">
                                                                    <p className="font-medium">{courseData.course[0].courseId.title}</p>
                                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                                        <CircleDot className="h-3 w-3" />
                                                                        Status: {courseData.course[0].courseId.status || "In Progress"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-muted-foreground text-center">No courses enrolled</p>
                                                    )}
                                                </div>
                                                
                                                <div className="pt-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <MessageSquare className="h-5 w-5" />
                                                        <h3 className="font-semibold">Send Message</h3>
                                                    </div>
                                                    <Textarea
                                                        placeholder="Type your message here..."
                                                        value={selectedMember === member._id ? message : ""}
                                                        onChange={(e) => {
                                                            setSelectedMember(member._id);
                                                            setMessage(e.target.value);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button 
                                                    onClick={() => handleSendMessage(member._id)}
                                                    className="w-full"
                                                >
                                                    <Mail className="mr-2 h-4 w-4" />
                                                    Send Message
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="w-full h-[500px] col-span-4 row-auto text-center content-center">
                            <h1 className="text-lg font-bold text-primary animate-pulse">
                                No team members found
                            </h1>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

import Loader from "@/components/Loading";
import { FetchProfileInfo } from "@/components/store/slices/Instructor/profile";
import { AppDispatch, RootState } from "@/components/store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Edit3, Github, Hash, Landmark, Linkedin, Mail, UserRound } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const InstructorProfile = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading, profileInfo } = useSelector((state: RootState) => state.InstructorProfile);

    useEffect(() => {
        dispatch(FetchProfileInfo());
    }, [dispatch]);

    if (isLoading || !profileInfo) return <Loader />;

    const initials = profileInfo.name?.split(" ").map((name: string) => name[0]).join("").slice(0, 2) || "IN";
    const details = [
        { label: "Email address", value: profileInfo.email, icon: Mail },
        { label: "Branch", value: profileInfo.branch, icon: Building2 },
        { label: "Roll number", value: profileInfo.rollNumber, icon: Hash },
        { label: "College", value: profileInfo.college, icon: Landmark },
        { label: "Gender", value: profileInfo.gender, icon: UserRound },
    ];

    return (
        <div className="min-h-full bg-background">
            <div className="mx-auto max-w-5xl space-y-6">
                <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-primary">Instructor workspace</p>
                        <h1 className="mt-1 font-semibold">Profile</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Keep your teaching profile and payment details up to date.</p>
                    </div>
                    <Button asChild>
                        <Link to="update"><Edit3 className="mr-2 h-4 w-4" />Edit profile</Link>
                    </Button>
                </header>

                <Card className="overflow-hidden">
                    <CardContent className="px-5 py-6 sm:px-7">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                <Avatar className="h-20 w-20 border border-border shadow-sm">
                                    <AvatarImage src={profileInfo.profileImg} alt={profileInfo.name} />
                                    <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">{initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="font-semibold">{profileInfo.name}</h2>
                                        <Badge variant="secondary">Instructor</Badge>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">{profileInfo.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {profileInfo.gitHub && <Button variant="outline" size="sm" asChild><a href={profileInfo.gitHub} target="_blank" rel="noreferrer"><Github className="mr-2 h-4 w-4" />GitHub</a></Button>}
                                {profileInfo.linkedIn && <Button variant="outline" size="sm" asChild><a href={profileInfo.linkedIn} target="_blank" rel="noreferrer"><Linkedin className="mr-2 h-4 w-4" />LinkedIn</a></Button>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardContent className="p-5 sm:p-6">
                            <div className="mb-5">
                                <h2 className="font-semibold">Personal information</h2>
                                <p className="mt-1 text-sm text-muted-foreground">These details are visible to your course learners and administrators.</p>
                            </div>
                            <div className="grid gap-x-6 sm:grid-cols-2">
                                {details.map(({ label, value, icon: Icon }) => (
                                    <div key={label} className="flex gap-3 border-t border-border py-4 first:border-t-0 sm:odd:border-t-0">
                                        <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary"><Icon className="h-4 w-4" /></div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-muted-foreground">{label}</p>
                                            <p className="mt-1 break-words text-sm font-medium capitalize">{value || "Not provided"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5 sm:p-6">
                            <h2 className="font-semibold">Payout details</h2>
                            <p className="mt-1 text-sm text-muted-foreground">Used when withdrawal requests are processed.</p>
                            <div className="mt-5 rounded-lg border border-border bg-muted/50 p-4">
                                <p className="text-xs font-medium text-muted-foreground">UPI ID</p>
                                <p className="mt-1 break-all font-mono text-sm font-medium">{profileInfo.UPI || "Not provided"}</p>
                            </div>
                            <Button className="mt-4 w-full" variant="secondary" asChild>
                                <Link to="update">Update payout details</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default InstructorProfile;

import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { CircleArrowRight, Code, Folder, FolderCheck, LogInIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlipWords } from "@/components/ui/flip-words";

export function Home() {
    const links = [
        {
            label: "Dashboard",
            href: "auth/signin",
            icon: (
                <Code className="text-neutral-900 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "All Courses",
            href: "auth/signin",
            icon: (
                <Folder className="text-neutral-900 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Enrolled Courses",
            href: "auth/signin",
            icon: (
                <FolderCheck className="text-neutral-900 dark:text-neutral-200 h-54 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Register Now",
            href: "auth/signup",
            icon: (
                <LogInIcon className="text-neutral-900 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Login",
            href: "auth/signin",
            icon: (
                <CircleArrowRight className="text-neutral-900 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        }
    ];
    const [open, setOpen] = useState(false);
    return (
        <>
            <div
                className={cn(
                    "flex flex-col md:flex-row bg-background w-full flex-1 max-w-full mx-auto overflow-hidden",
                    "h-[100vh]"
                )}
            >
               
                <Sidebar open={open} setOpen={setOpen}>
                    <SidebarBody className="text-sidebar-foreground">
                        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                            {open ? (
                                <Logo />
                            ) : (
                                <img
                                    className="rounded-full w-6 h-6"
                                    src="https://media.licdn.com/dms/image/v2/D560BAQEdNp5niau0Rw/company-logo_200_200/company-logo_200_200/0/1683745552013?e=1735171200&v=beta&t=5ykcq9A8xtYhhFFdbeRTpzs8JjbqEQL_P5dkkE70rOs"
                                />
                            )}
                            <div className="mt-20 flex flex-col gap-4">
                                {links.map((link, idx) => (
                                    <SidebarLink key={idx} link={link} />
                                ))}
                            </div>
                        </div>
                        <div>
                            <SidebarLink
                                link={{
                                    label: "Profile",
                                    href: "auth/signin",
                                    icon: (
                                        <img
                                            src="https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg"
                                            className="h-7 w-7 flex-shrink-0 rounded-full"
                                            width={50}
                                            height={50}
                                            alt="Avatar"
                                        />
                                    ),
                                }}
                            />
                        </div>
                    </SidebarBody>
                </Sidebar>
                <Dashboard />
            </div>
        </>
    );
}
export const Logo = () => {
    return (
        <Link to="auth/signin" className="flex gap-2 ">
            <img
                className="rounded-full w-6 h-6"
                src="https://media.licdn.com/dms/image/v2/D560BAQEdNp5niau0Rw/company-logo_200_200/company-logo_200_200/0/1683745552013?e=1735171200&v=beta&t=5ykcq9A8xtYhhFFdbeRTpzs8JjbqEQL_P5dkkE70rOs"
            />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-lg text-black dark:text-white whitespace-pre w-6 h-6"
            >
                CMS
            </motion.span>
        </Link>
    );
};
export const LogoIcon = () => {
    return (
        <Link
            to="auth/signin"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
        </Link>
    );
};

const Dashboard = () => {
    const featuredCourses = [
        {
            title: "Web Development Bootcamp",
            description: "Master modern web development with hands-on projects",
            image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
            category: "Development",
            rating: 4.8,
            students: 1234
        },
        {
            title: "Data Science Fundamentals",
            description: "Learn data analysis, visualization and machine learning",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
            category: "Data Science",
            rating: 4.7,
            students: 987
        },
        {
            title: "Digital Marketing Mastery",
            description: "Master modern digital marketing strategies and tools",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
            category: "Marketing",
            rating: 4.9,
            students: 2156
        }
    ];

    return (
        <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Hero Section */}
            <div className="relative border-b border-border bg-background p-6 md:p-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 space-y-6">
                            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                                Better Learning Future Starts With{' '}
                                <FlipWords 
                                    className="text-primary" 
                                    words={["Knowledge", "Innovation", "Growth", "Success"]} 
                                />
                            </h1>
                            <p className="text-base text-muted-foreground max-w-2xl">
                                Welcome to Byway, where learning knows no bounds. Discover expert-led courses 
                                designed to transform your skills and accelerate your career.
                            </p>
                            <div className="flex gap-4">
                                <Button size="lg" asChild>
                                    <Link to="auth/signin">Get Started</Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link to="auth/signin">Browse Courses</Link>
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 hidden md:block">
                            <img 
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
                                alt="Students learning"
                                className="rounded-lg shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Courses Section */}
            <section className="py-12 px-6 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                        <h2 className="text-xl font-semibold">Featured Courses</h2>
                            <p className="text-muted-foreground mt-2">Explore our most popular courses</p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link to="auth/signin">View All Courses</Link>
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {featuredCourses.map((course, idx) => (
                            <div key={idx} className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-lg transition-all">
                                <div className="aspect-video relative overflow-hidden">
                                    <img 
                                        src={course.image} 
                                        alt={course.title}
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                        {course.category}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                                    <p className="text-muted-foreground mb-4">{course.description}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center">
                                                <span className="text-yellow-400">★</span>
                                                <span className="ml-1 font-medium">{course.rating}</span>
                                            </div>
                                            <span className="text-muted-foreground">
                                                {course.students.toLocaleString()} students
                                            </span>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link to="auth/signin">Learn More</Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="bg-muted/50 py-12 px-6 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-xl font-semibold text-center mb-8">Why Choose Byway?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center text-center p-6">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Code className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Expert Instructors</h3>
                            <p className="text-muted-foreground">Learn from industry professionals with real-world experience</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <FolderCheck className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Flexible Learning</h3>
                            <p className="text-muted-foreground">Study at your own pace with lifetime access to courses</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <CircleArrowRight className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Career Growth</h3>
                            <p className="text-muted-foreground">Gain skills that help you advance in your career path</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

import { useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link, Outlet } from "react-router-dom";
import { AppDispatch, RootState } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { FetchProfileInfo } from "../store/slices/Instructor/profile";
import { Logout } from "../store/slices/authSlice";

export function InstructorLayout() {
    const links = [
        {
            label: "Home",
            href: "dashboard",
            icon: (
                <i className="fa-solid fa-house mt-1"></i>
            ),
        },
        {
            label: "All Courses",
            href: "courses",
            icon: (
                <i className="fa-solid fa-book-open-reader mt-1"></i>
            ),
        },        {
            label: "Earnings",
            href: "earnings",
            icon: (
                <i className="fa-solid fa-wallet mt-1"></i>
            ),
        },
        {
            label: "Withdrawals",
            href: "withdrawals",
            icon: (
                <i className="fa-solid fa-money-bill-transfer mt-1"></i>
            ),
        }
    ];

    const [open, setOpen] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    // Fetching profile info from Redux store
    const { profileInfo } = useSelector((state: RootState) => state.InstructorProfile);

    useEffect(() => {
        // Dispatch action to fetch profile info on component mount
        dispatch(FetchProfileInfo());
    }, [dispatch]);

    const handleLogout = () => {
        dispatch(Logout());
    };

    const handleLinkClick = () => {
        if (open) {
            setOpen(false); // Close the sidebar on link click (for mobile view)
        }
    };

    return (
        <div
            className={cn(
                "flex h-screen w-screen max-w-full flex-col md:flex-row overflow-hidden no-scrollbar"
            )}
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {open ? (
                            <Logo />
                        ) : (
                            <img
                                className="rounded-full w-7 h-7"
                                src="/logo.png"
                                alt="Company Logo"
                            />
                        )}
                        <div className="mt-24 flex flex-col gap-3">
                            {links.map((link, idx) => (
                                <SidebarLink 
                                    key={idx} 
                                    link={link} 
                                    onClick={handleLinkClick}  // Pass the function to close the sidebar
                                />
                            ))}
                            <div className="flex gap-3 mt-3 cursor-pointer" onClick={handleLogout}>
                                <i className="fa-solid fa-reply-all"></i>
                                <p className="text-sm -mt-1">Logout</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <SidebarLink
                            link={{
                                label: "Profile",
                                href: "profile",
                                icon: (
                                    <img
                                        src={profileInfo?.profileImg || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKfj6RsyRZqO4nnWkPFrYMmgrzDmyG31pFQ&s"}
                                        className="h-7 w-7 flex-shrink-0 rounded-full"
                                        width={50}
                                        height={50}
                                        alt="Profile Avatar"
                                    />
                                ),
                            }}
                            onClick={handleLinkClick} // Close sidebar when profile link is clicked
                        />
                    </div>
                </SidebarBody>
            </Sidebar>
            <div className="flex-1 flex flex-col w-full h-full min-w-0 bg-background">
                <div className="overflow-y-scroll no-scrollbar flex-1 overflow-auto p-5 md:p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export const Logo = () => {
    return (
        <Link to="auth/signin" className="flex gap-2">
            <img
                className="rounded-full w-7 h-7"
                src="/logo.png"
                alt="Company Logo"
            />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-semibold text-base text-sidebar-foreground whitespace-pre"
            >
                CMS
            </motion.span>
        </Link>
    );
};

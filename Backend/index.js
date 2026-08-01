const express = require('express');
const cors = require('cors');
require('dotenv').config()
const cookieParser = require('cookie-parser');
const db = require('./Utils/DB/db');
const authRouter = require("./routes/auth/auth-router");
const RoleRouter = require('./routes/Roles/Role-routes');
const CourseRouter = require("./routes/Instructor/Courses")
const AllCourseRouter = require("./routes/Common/Courses")
const LeadOrderRouter = require('./routes/Orders/Order-route');
const LeadCoursesRouter = require('./routes/Lead/mycourse-route');
const ProfileRouter = require("./routes/Lead/profile-route")
const viewcourseRouter = require("./routes/Lead/viewcourse-route")
const studentViewcourseRouter = require("./routes/student/viewcourse-route")
const adminViewCourse = require('./routes/admin/courseview-route')
const TeamMembers = require("./routes/Lead/team-allocation-route")
const StudentCoursesROuter = require("./routes/student/mycourses-route")
const StudentProfileRouter = require("./routes/student/profile-route")
const AdminCourseAccessRouter = require("./routes/admin/courseAccess-route")
const InstrctorProfile = require("./routes/Instructor/profile")
const InstrctorEarnings = require("./routes/Instructor/earnings")
const Instrctordetailes = require("./routes/admin/instructor-route")
const InstructorWithdrawal = require("./routes/Instructor/withdrawal-route")
const AdminWithdrawalRouter = require("./routes/admin/withdrawal-route")
const { VerifyToken, authorizeRoles } = require('./Controllers/auth/Auth-controller');
const { authRateLimiter, publicRateLimiter } = require('./Utils/lib/upstash');
const { rateLimit, cachePublicCourses, warnWhenUpstashIsMissing } = require('./middleware/upstash');

const app = express();
app.set('trust proxy', 1);
app.use(express.json())
warnWhenUpstashIsMissing();

app.use(cors({
    origin: ['http://localhost:5173',"http://localhost:4173" , "https://course-management-system-1-a96d.onrender.com" , "https://cms-bharani.vercel.app" , "https://cms4.vercel.app"], // or whatever port your Vite frontend runs on
    credentials: true
}));

app.use(cookieParser())
app.get("/", (req, res) => {
    res.send({ success: true, message: "It's Working" })
})

// auth (public routes)
app.use("/api/auth", rateLimit(authRateLimiter, 'auth'), authRouter)

// RBAC - role selection (requires auth)
app.use('/api/check-verify', VerifyToken, RoleRouter)

// All Courses (public)
app.use("/courses", rateLimit(publicRateLimiter, 'courses'), cachePublicCourses(300), AllCourseRouter)

// instructor (requires auth + Instructor role)
app.use('/instructor/course', VerifyToken, authorizeRoles("Instructor"), CourseRouter)
app.use("/instructor/profile", VerifyToken, authorizeRoles("Instructor"), InstrctorProfile)
app.use("/instructor/earning", VerifyToken, authorizeRoles("Instructor"), InstrctorEarnings)
app.use("/instructor/withdrawal", VerifyToken, authorizeRoles("Instructor"), InstructorWithdrawal)

// admin (requires auth + Admin role)
app.use("/admin/withdrawals", VerifyToken, authorizeRoles("Admin"), AdminWithdrawalRouter)
app.use("/admin/course", VerifyToken, authorizeRoles("Admin"), AdminCourseAccessRouter)
app.use("/admin/courseview", VerifyToken, authorizeRoles("Admin"), adminViewCourse)
app.use("/admin/instructor", VerifyToken, authorizeRoles("Admin"), Instrctordetailes)

// orderCourses (requires auth)
app.use('/order', VerifyToken, LeadOrderRouter)

// lead (requires auth + Lead role)
app.use("/lead/mycourse", VerifyToken, authorizeRoles("Lead"), LeadCoursesRouter)
app.use("/lead/profile", VerifyToken, authorizeRoles("Lead"), ProfileRouter)
app.use("/lead/progress-page", VerifyToken, authorizeRoles("Lead"), viewcourseRouter)
app.use("/lead/team", VerifyToken, authorizeRoles("Lead"), TeamMembers)

// student (requires auth + Student role)
app.use("/student/mycourse", VerifyToken, authorizeRoles("Student"), StudentCoursesROuter)
app.use("/student/profile", VerifyToken, authorizeRoles("Student"), StudentProfileRouter)
app.use("/student/progress-page", VerifyToken, authorizeRoles("Student"), studentViewcourseRouter)

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" })
})

// Global error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    })
})

// Connect to DB once at startup, then start server
db().then(() => {
    app.listen(process.env.PORT || 8000, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${process.env.PORT || 8000}`);
    })
}).catch((err) => {
    console.error("Failed to connect to database:", err.message);
    process.exit(1);
})

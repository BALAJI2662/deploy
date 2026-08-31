const db = require('../../Utils/DB/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userModel = require('../../Models/RBAC/userModel');
require('dotenv').config()

const COOKIE_NAME = process.env.COOKIE_NAME || 'cms_auth_token';
const JWT_EXPIRY = '7d';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    path: '/',
    expires: new Date(Date.now() + COOKIE_MAX_AGE)
});

const signToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

const sanitizeUser = (user) => ({
    userId: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    image: user.image
});

// signup
const signup = async (req, res) => {
    await db()
    const UserInfo = req.body
    
    if (!UserInfo.email || !UserInfo.password || !UserInfo.name) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide all required fields", 
            error: "auth/missing-fields" 
        });
    }

    try {
        const ExistedUser = await userModel.findOne({ email: UserInfo.email.toLowerCase() })
        if (ExistedUser) {
            return res.status(409).json({ 
                success: false, 
                message: "An account with this email already exists", 
                error: "auth/email-already-exists" 
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(UserInfo.email)) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide a valid email address", 
                error: "auth/invalid-email" 
            });
        }

        if (UserInfo.password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: "Password must be at least 6 characters long", 
                error: "auth/weak-password" 
            });
        }

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(UserInfo.password, salt);
        
        const NewUserInfo = new userModel({
            name: UserInfo.name,
            email: UserInfo.email.toLowerCase(),
            password: hash,
            image: UserInfo.image || "",
            role: "Empty"
        })
        
        const SignUpData = await NewUserInfo.save()
        if (SignUpData) {
            res.status(201).json({ 
                success: true, 
                message: "Account created successfully",
                user: {
                    name: SignUpData.name,
                    email: SignUpData.email,
                    role: SignUpData.role
                }
            });
        }
    }
    catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "An error occurred during registration",
            error: "auth/registration-failed"
        });
    }
}

// signin
const signin = async (req, res) => {
    await db();
    const UserInfo = req.body;

    if (!UserInfo.email || !UserInfo.password) {
        return res.status(400).json({
            success: false,
            message: "Please provide email and password",
            error: "auth/missing-fields"
        });
    }

    try {
        const SignInData = await userModel.findOne({ email: UserInfo.email.toLowerCase() }).select('+password');
        if (!SignInData) {
            return res.status(404).json({ 
                success: false, 
                message: "Account not found. Please register first.", 
                error: "auth/user-not-found"
            });
        }

        const CheckPassword = bcrypt.compareSync(UserInfo.password, SignInData.password);
        if (!CheckPassword) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials",
                error: "auth/invalid-password"
            });
        }

        const userPayload = sanitizeUser(SignInData);
        const token = signToken(userPayload);

        res.cookie(COOKIE_NAME, token, getCookieOptions()).json({ 
            success: true, 
            role: SignInData.role, 
            message: "Login Success",
            user: userPayload
        });
    } catch (err) {
        console.error("Signin Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "An error occurred during login",
            error: "auth/signin-failed"
        });
    }
};

// logout
const logout = async (req, res) => {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        path: '/',
    }).json({
        success : true ,
        message : "Logged out successfully"
    })
}

const VerifyToken = async (req, res, next) => {
    const token = req.cookies[COOKIE_NAME];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Please log in.",
            error: "auth/no-token"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            throw new Error("Invalid token");
        }
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Your session has expired. Please log in again.",
                error: "auth/token-expired"
            });
        }
        
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token. Please log in again.",
                error: "auth/invalid-token"
            });
        }

        res.status(401).json({
            success: false,
            message: "Authentication failed. Please log in again.",
            error: "auth/verification-failed"
        });
    }
}

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource",
                error: "auth/forbidden"
            });
        }
        next();
    };
};

// Google Auth 
const Google = async (req, res) => {
    await db();
    const userInfo = req.body;

    if (!userInfo.email || !userInfo.name) {
        return res.status(400).json({
            success: false,
            message: "Missing required Google auth fields",
            error: "auth/missing-fields"
        });
    }

    try {
        let user = await userModel.findOne({ email: userInfo.email.toLowerCase() })

        if (!user) {
            const generatePass = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(generatePass, salt);

            user = new userModel({
                name: userInfo.name,
                email: userInfo.email.toLowerCase(),
                image: userInfo.image,
                password: hash,
                role: "Empty" // Always default to Empty - never trust client-provided role
            });

            await user.save();
        }

        const userPayload = sanitizeUser(user);
        const token = signToken(userPayload);

        res.cookie(COOKIE_NAME, token, getCookieOptions()).json({ 
            success: true, 
            role: user.role, 
            message: "Successfully logged in with Google",
            user: userPayload
        });
    } catch (err) {
        console.error("Google Auth Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "An error occurred during Google authentication",
            error: "auth/google-signin-failed"
        });
    }
}

// GitHub Auth 
const GitHub = async (req, res) => {
    await db()
    const UserInfo = req.body

    if (!UserInfo.email || !UserInfo.name) {
        return res.status(400).json({
            success: false,
            message: "Missing required GitHub auth fields",
            error: "auth/missing-fields"
        });
    }

    try {
        let user = await userModel.findOne({ email: UserInfo.email.toLowerCase() })
        
        if (!user) {
            const generatePass = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(generatePass, salt);
            
            user = new userModel({
                name: UserInfo.name,
                email: UserInfo.email.toLowerCase(),
                image: UserInfo.image,
                password: hash,
                role: "Empty" // Always default to Empty - never trust client-provided role
            });
            await user.save();
        }

        const userPayload = sanitizeUser(user);
        const token = signToken(userPayload);

        res.cookie(COOKIE_NAME, token, getCookieOptions()).json({ 
            success: true, 
            role: user.role, 
            message: "Successfully logged in with GitHub",
            user: userPayload
        });
    } catch (err) {
        console.error("GitHub Auth Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "An error occurred during GitHub authentication",
            error: "auth/github-signin-failed"
        });
    }
}

module.exports = { signin, signup, logout, Google, GitHub, VerifyToken, authorizeRoles, COOKIE_NAME }
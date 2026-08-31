const mongoose = require('mongoose');
const InstructorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    profileImg: {
        type: String,
        default: "https://as1.ftcdn.net/v2/jpg/03/46/83/96/1000_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg"
    },
    role: {
        type: String,
        enum: ["Admin", "Instructor", "Lead", "Student", "Empty"],
        default: "Instructor"
    },
    linkedIn: {
        type: String,
        required: true
    },
    gitHub: {
        type: String,
        required: true
    },
    courseId: [
        { type: mongoose.Schema.Types.ObjectId, ref: "courses" }
    ],
    gender : {
        type : String ,
        required : true ,
        enum : ["Male", "Female", "Other"]
    },
    college : {
        type : String ,
        required : true
    },
    UPI : {
        type : String ,
        required : true
    }
}, { timestamps: true })

InstructorSchema.index({ userId: 1 });

const InstructorModel = mongoose.model("Instructors", InstructorSchema);
module.exports = InstructorModel;
const mongoose = require('mongoose');
const courseSchema = mongoose.Schema({
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "Instructors", required: true },
    thumbnail: { type: String, default : "https://i.pinimg.com/736x/af/44/ea/af44ea07fa5bfd828004747f62f63bc3.jpg"},
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: [
            "Web Development",
            "Data Science",
            "Artificial Intelligence",
            "Machine Learning",
            "Mobile Development",
            "Cloud Computing",
            "Cybersecurity",
            "DevOps",
            "UI/UX Design",
            "Digital Marketing",
            "Business",
            "Personal Development",
            "Other",
        ],
    },
    objectives: { type: String, required: true },
    level: {
        type: String,
        required: true,
        enum: ["Beginner", "Intermediate", "Advanced", "All levels"]
    },
    leads: [{
        leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Leaders" },
        paidAmount: { type: Number, default: 0 },
    },
    ],
    students: [
        {
            studentId: { type: mongoose.Schema.Types.ObjectId, ref: "students" },
            paidAmount: { type: Number, default: 0 },
        }
    ],
    requirements: { type: String, required: true },
    keyPoints: { type: String },
    files: [
        {
            resourceType: {
                type: String,
                enum: ["video", "pdf", "image"],
                default: "video",
            },
            resourceUrl: String,
            videoUrl: String,
            public_id: String,
            freePreview: Boolean,
            title: String
        }
    ],
    isPublished: { type: Boolean, default: false },
    price: { type: Number, required: true, min: 0 },

}, { timestamps: true })
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ isPublished: 1 });

const courseModel = mongoose.model("courses", courseSchema)
module.exports = courseModel

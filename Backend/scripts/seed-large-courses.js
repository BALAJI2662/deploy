require("dotenv").config();

const mongoose = require("mongoose");
const Instructor = require("../Models/RBAC/InstructorModel");
const Course = require("../Models/Instructor/Courses");

const pdf = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
const videos = [
    "https://www.w3schools.com/html/mov_bbb.mp4",
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
];
const images = [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80",
];

function resources(topic) {
    return [
        { title: `Welcome to ${topic}`, resourceType: "video", resourceUrl: videos[0], videoUrl: videos[0], freePreview: true },
        { title: "Course workbook", resourceType: "pdf", resourceUrl: pdf, videoUrl: "", freePreview: true },
        { title: "Course roadmap", resourceType: "image", resourceUrl: images[0], videoUrl: "", freePreview: true },
        { title: "Foundation lesson", resourceType: "video", resourceUrl: videos[1], videoUrl: videos[1], freePreview: false },
        { title: "Foundation notes", resourceType: "pdf", resourceUrl: pdf, videoUrl: "", freePreview: false },
        { title: "Reference diagram", resourceType: "image", resourceUrl: images[1], videoUrl: "", freePreview: false },
        { title: "Building the first project", resourceType: "video", resourceUrl: videos[0], videoUrl: videos[0], freePreview: false },
        { title: "Project checklist", resourceType: "pdf", resourceUrl: pdf, videoUrl: "", freePreview: false },
        { title: "Example implementation", resourceType: "image", resourceUrl: images[2], videoUrl: "", freePreview: false },
        { title: "Practice walkthrough", resourceType: "video", resourceUrl: videos[1], videoUrl: videos[1], freePreview: false },
        { title: "Practice exercises", resourceType: "pdf", resourceUrl: pdf, videoUrl: "", freePreview: false },
        { title: "Final recap", resourceType: "video", resourceUrl: videos[0], videoUrl: videos[0], freePreview: false },
        { title: "Final reference sheet", resourceType: "pdf", resourceUrl: pdf, videoUrl: "", freePreview: false },
        { title: "Next steps", resourceType: "image", resourceUrl: images[0], videoUrl: "", freePreview: false },
    ];
}

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    const instructor = await Instructor.findOne({ email: "rayudubharani7288@gmail.com" });
    if (!instructor) throw new Error("Instructor account was not found");

    const courses = [
        {
            title: "Complete JavaScript Project Workshop",
            subtitle: "Build practical projects from fundamentals to deployment",
            description: "A full JavaScript practice course with guided videos, printable notes, diagrams, and project checkpoints.",
            category: "Web Development",
            objectives: "Understand modern JavaScript,Build reusable components,Complete practical projects",
            requirements: "A computer and basic familiarity with HTML",
            level: "Beginner",
            price: 0,
            thumbnail: images[0],
        },
        {
            title: "UI Design Systems: Practical Guide",
            subtitle: "Create consistent interfaces and scalable design foundations",
            description: "A hands-on UI design course covering layouts, reusable patterns, visual references, and downloadable learning material.",
            category: "UI/UX Design",
            objectives: "Design clear interfaces,Create reusable components,Document a design system",
            requirements: "A computer and interest in interface design",
            level: "Beginner",
            price: 0,
            thumbnail: images[1],
        },
    ];

    for (const data of courses) {
        await Course.findOneAndUpdate(
            { instructor: instructor._id, title: data.title },
            { $set: { ...data, instructor: instructor._id, isPublished: true, files: resources(data.title) } },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        );
    }
    console.log(`Created or updated ${courses.length} large courses for ${instructor.email}.`);
}

seed()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());

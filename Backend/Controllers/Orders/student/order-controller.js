const db = require("../../../Utils/DB/db");
const paypal = require("../../../Utils/lib/paypal");
const StudentModel = require('../../../Models/RBAC/StudentModel');
const OrderModel = require("../../../Models/Common/OrderModel");
const StudentCoursePurchaseModel = require("../../../Models/Student/PurchaseCourses");
const courseModel = require("../../../Models/Instructor/Courses");

const StudentCreateModel = async (req, res) => {
    await db()
    const {
        userId,
        userEmail,
        orderStatus,
        paymentMethod,
        orderDate,
        paymentId,
        payerId,
        instructorId,
        courseId,
        coursePrice,
        courseTitle
    } = req.body

    try {
        const formattedPrice = Number(coursePrice).toFixed(2);
        const create_payment_json = {
            intent: "sale",
            payer: {
                payment_method: "paypal"
            },
            redirect_urls: {
                return_url: `${process.env.CLIENT_URL}/student/payment-return`,
                cancel_url: `${process.env.CLIENT_URL}/student/payment-cancel`
            },
            transactions: [{
                item_list: {
                    items: [{
                        name: courseTitle,
                        sku: courseId,
                        price: formattedPrice,
                        currency: "USD",
                        quantity: 1
                    }]
                },
                amount: {
                    currency: "USD",
                    total: formattedPrice
                },
                description: courseTitle
            }]
        };

        paypal.payment.create(create_payment_json, async (err, paymentInfo) => {
            if (err) {
                return res.status(err.httpStatusCode || 500).json({
                    success: false,
                    message: "Failed to create PayPal payment"
                });
            }
            
            try {
                const newlyCreatedCourseOrder = new OrderModel({
                    userId,
                    userEmail,
                    orderStatus,
                    paymentMethod,
                    orderDate,
                    paymentId,
                    payerId,
                    instructorId,
                    courseId,
                    coursePrice: Number(coursePrice),
                    courseTitle
                });
                await newlyCreatedCourseOrder.save();
                const approvalUrl = paymentInfo.links.find((link) => link.rel === "approval_url").href;
                res.send({
                    success: true,
                    orderId: String(newlyCreatedCourseOrder._id),
                    approvalUrl
                });
            } catch (dbError) {
                res.status(500).json({
                    success: false,
                    message: "Failed to save order details"
                });
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

const StudentCapturePayment = async (req, res) => {
    await db()
    const { paymentId, payerId, orderId, studentId } = req.body;
    
    try {
        // Find student
        const FindStudentInfo = await StudentModel.findOne({ userId: studentId });
        if (!FindStudentInfo) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Find order
        let order = await OrderModel.findById(String(orderId));
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Execute the PayPal payment
        const execute_payment_json = {
            payer_id: payerId,
            transactions: [{
                amount: {
                    currency: "USD",
                    total: Number(order.coursePrice).toFixed(2)
                }
            }]
        };

        // Verify and execute the payment with PayPal
        paypal.payment.execute(paymentId, execute_payment_json, async function(error, payment) {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Payment execution failed"
                });
            }

            try {
                // Update order status
                order.orderStatus = "Approved";
                order.paymentId = paymentId;
                order.payerId = payerId;
                await order.save();

                // Check if student already has purchased courses
                let studentCourses = await StudentCoursePurchaseModel.findOne({
                    studentId: FindStudentInfo._id
                });
                
                if (studentCourses) {
                    // Check if course already exists in student's courses
                    const courseExists = studentCourses.course.some(
                        c => c.courseId.toString() === order.courseId.toString()
                    );

                    if (!courseExists) {
                        studentCourses.course.push({
                            courseId: order.courseId,
                            courseTitle: order.courseTitle,
                            instructorId: order.instructorId,
                            paid: order.coursePrice
                        });
                        await studentCourses.save();
                    }
                } else {
                    // Create new purchase record
                    studentCourses = new StudentCoursePurchaseModel({
                        studentId: FindStudentInfo._id,
                        course: [{
                            courseId: order.courseId,
                            courseTitle: order.courseTitle,
                            instructorId: order.instructorId,
                            paid: order.coursePrice
                        }]
                    });
                    await studentCourses.save();
                }

                // Update course with new student
                await courseModel.findByIdAndUpdate(order.courseId, {
                    $addToSet: {
                        students: {
                            studentId: FindStudentInfo._id,
                            paidAmount: order.coursePrice,
                        }
                    }
                });

                console.log("All database updates completed successfully");

                res.json({
                    success: true,
                    message: "Payment successful and course access granted"
                });
            } catch (saveError) {
                res.status(500).json({
                    success: false,
                    message: "Payment verified but failed to update records"
                });
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Payment capture failed"
        });
    }
}

// ─── DIRECT PURCHASE (PayPal bypassed) ───────────────────────────────────────
const DirectPurchaseStudent = async (req, res) => {
    await db();
    const { courseId } = req.body;
    try {
        const userId = req.user.userId;
        const FindStudentInfo = await StudentModel.findOne({ userId });
        if (!FindStudentInfo) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const course = await courseModel.findOne({ _id: courseId, isPublished: true });
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        const existingPurchase = await StudentCoursePurchaseModel.exists({
            studentId: FindStudentInfo._id,
            "course.courseId": courseId,
        });
        if (existingPurchase) {
            return res.status(409).json({
                success: false,
                message: "You have already purchased this course",
            });
        }

        // Create order with Approved status directly (no PayPal)
        const newOrder = new OrderModel({
            userId,
            userEmail: FindStudentInfo.email,
            orderStatus: "Approved",
            paymentMethod: "direct",
            orderDate: Date.now(),
            paymentId: "direct",
            payerId: "direct",
            instructorId: course.instructor,
            courseId,
            coursePrice: Number(course.price),
            courseTitle: course.title
        });
        await newOrder.save();

        // Upsert PurchaseCourses
        let studentCourses = await StudentCoursePurchaseModel.findOne({ studentId: FindStudentInfo._id });
        if (studentCourses) {
            const courseExists = studentCourses.course.some(c => c.courseId.toString() === courseId.toString());
            if (!courseExists) {
                studentCourses.course.push({ courseId, courseTitle: course.title, instructorId: course.instructor, paid: course.price });
                await studentCourses.save();
            }
        } else {
            studentCourses = new StudentCoursePurchaseModel({
                studentId: FindStudentInfo._id,
                course: [{ courseId, courseTitle: course.title, instructorId: course.instructor, paid: course.price }]
            });
            await studentCourses.save();
        }

        // Update course enrollment
        await courseModel.findByIdAndUpdate(courseId, {
            $addToSet: { students: { studentId: FindStudentInfo._id, paidAmount: course.price } }
        });

        res.json({ success: true, message: "Course purchased successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { StudentCreateModel, StudentCapturePayment, DirectPurchaseStudent }

const express = require('express');
const { CreateOrder, CapturePayment, DirectPurchaseLead } = require('../../Controllers/Orders/order-controllers');
const { StudentCreateModel, StudentCapturePayment, DirectPurchaseStudent } = require('../../Controllers/Orders/student/order-controller');
const { authorizeRoles } = require('../../Controllers/auth/Auth-controller');
const router = express.Router()

// PayPal routes (commented out - using direct purchase instead)
// router.post("/create", CreateOrder)
// router.post("/capture", CapturePayment)
// router.post("/create/stu", StudentCreateModel)
// router.post("/capture/stu", StudentCapturePayment)

// Direct purchase routes (no payment gateway)
router.post("/direct", DirectPurchaseLead)
router.post("/direct/stu", authorizeRoles("Student"), DirectPurchaseStudent)

module.exports = router

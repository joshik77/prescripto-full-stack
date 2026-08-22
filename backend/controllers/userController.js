import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import reviewModel from "../models/reviewModel.js";
import { v2 as cloudinary } from "cloudinary";
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";
import { sendAppointmentEmail } from "../config/email.js";

const stripeInstance =
    new Stripe(
        process.env.STRIPE_SECRET_KEY
    );

const razorpayInstance =
    new Razorpay({
        key_id:
            process.env.RAZORPAY_KEY_ID,
        key_secret:
            process.env.RAZORPAY_KEY_SECRET
    });


// REGISTER USER

const registerUser =
async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;

        if (
            !name ||
            !email ||
            !password
        ) {

            return res.json({
                success: false,
                message: "Missing Details"
            });
        }

        if (
            !validator.isEmail(email)
        ) {

            return res.json({
                success: false,
                message:
                    "Please enter a valid email"
            });
        }

        if (
            password.length < 8
        ) {

            return res.json({
                success: false,
                message:
                    "Please enter a strong password"
            });
        }

        const existingUser =
            await userModel.findOne({
                email
            });

        if (existingUser) {

            return res.json({
                success: false,
                message:
                    "User already exists"
            });
        }

        const salt =
            await bcrypt.genSalt(10);

        const hashedPassword =
            await bcrypt.hash(
                password,
                salt
            );

        const userData = {
            name,
            email,
            password:
                hashedPassword
        };

        const newUser =
            new userModel(
                userData
            );

        const user =
            await newUser.save();

        const token =
            jwt.sign(
                {
                    id: user._id
                },
                process.env.JWT_SECRET
            );

        return res.json({
            success: true,
            token
        });

    } catch (error) {

        console.error(
            "REGISTER USER ERROR:",
            error
        );

        return res.json({
            success: false,
            message:
                error.message
        });
    }
};


// LOGIN USER

const loginUser =
async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        const user =
            await userModel.findOne({
                email
            });

        if (!user) {

            return res.json({
                success: false,
                message:
                    "User does not exist"
            });
        }

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {

            return res.json({
                success: false,
                message:
                    "Invalid credentials"
            });
        }

        const token =
            jwt.sign(
                {
                    id: user._id
                },
                process.env.JWT_SECRET
            );

        return res.json({
            success: true,
            token
        });

    } catch (error) {

        console.error(
            "LOGIN USER ERROR:",
            error
        );

        return res.json({
            success: false,
            message:
                error.message
        });
    }
};


// GET PROFILE

const getProfile =
async (req, res) => {

    try {

        const {
            userId
        } = req.body;

        const userData =
            await userModel
                .findById(userId)
                .select("-password");

        return res.json({
            success: true,
            userData
        });

    } catch (error) {

        console.error(
            "GET PROFILE ERROR:",
            error
        );

        return res.json({
            success: false,
            message:
                error.message
        });
    }
};


// UPDATE PROFILE

const updateProfile =
async (req, res) => {

    try {

        const {
            userId,
            name,
            phone,
            address,
            dob,
            gender
        } = req.body;

        const imageFile =
            req.file;

        if (
            !name ||
            !phone ||
            !dob ||
            !gender
        ) {

            return res.json({
                success: false,
                message:
                    "Data Missing"
            });
        }

        let parsedAddress;

        try {

            parsedAddress =
                typeof address ===
                "string"
                    ? JSON.parse(
                        address
                    )
                    : address;

        } catch (error) {

            return res.json({
                success: false,
                message:
                    "Invalid address format"
            });
        }

        await userModel
            .findByIdAndUpdate(
                userId,
                {
                    name,
                    phone,
                    address:
                        parsedAddress,
                    dob,
                    gender
                }
            );

        if (imageFile) {

            const imageUpload =
                await cloudinary
                    .uploader
                    .upload(
                        imageFile.path,
                        {
                            resource_type:
                                "image"
                        }
                    );

            const imageURL =
                imageUpload
                    .secure_url;

            await userModel
                .findByIdAndUpdate(
                    userId,
                    {
                        image:
                            imageURL
                    }
                );
        }

        return res.json({
            success: true,
            message:
                "Profile Updated"
        });

    } catch (error) {

        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );

        return res.json({
            success: false,
            message:
                error.message
        });
    }
};


// BOOK APPOINTMENT

const bookAppointment =
async (req, res) => {

    try {

        const {
            userId,
            docId,
            slotDate,
            slotTime
        } = req.body;

        const docData =
            await doctorModel
                .findById(docId)
                .select("-password");

        if (!docData) {

            return res.json({
                success: false,
                message:
                    "Doctor not found"
            });
        }

        if (!docData.available) {

            return res.json({
                success: false,
                message:
                    "Doctor Not Available"
            });
        }

        let slots_booked =
            docData.slots_booked ||
            {};

        if (
            slots_booked[
                slotDate
            ]
        ) {

            if (
                slots_booked[
                    slotDate
                ].includes(
                    slotTime
                )
            ) {

                return res.json({
                    success: false,
                    message:
                        "Slot Not Available"
                });

            } else {

                slots_booked[
                    slotDate
                ].push(
                    slotTime
                );
            }

        } else {

            slots_booked[
                slotDate
            ] = [
                slotTime
            ];
        }

        const userData =
            await userModel
                .findById(userId)
                .select("-password");

        if (!userData) {

            return res.json({
                success: false,
                message:
                    "User not found"
            });
        }

        const appointmentData = {

            userId,

            docId,

            userData,

            docData,

            amount:
                Number(
                    docData.fees
                ),

            slotTime,

            slotDate,

            date:
                Date.now()
        };

        const newAppointment =
            new appointmentModel(
                appointmentData
            );

        await newAppointment.save();

        await doctorModel
            .findByIdAndUpdate(
                docId,
                {
                    slots_booked
                }
            );

        sendAppointmentEmail({

            to:
                userData.email,

            userName:
                userData.name,

            type:
                "booked",

            doctorName:
                docData.name,

            speciality:
                docData.speciality,

            slotDate,

            slotTime,

            amount:
                docData.fees
        });

        return res.json({
            success: true,
            message:
                "Appointment Booked"
        });

    } catch (error) {

        console.error(
            "BOOK APPOINTMENT ERROR:",
            error
        );

        return res.json({
            success: false,
            message:
                error.message
        });
    }
};


// CANCEL APPOINTMENT

const cancelAppointment =
async (req, res) => {

    try {

        const {
            userId,
            appointmentId
        } = req.body;

        const appointmentData =
            await appointmentModel
                .findById(
                    appointmentId
                );

        if (!appointmentData) {

            return res.json({
                success: false,
                message:
                    "Appointment not found"
            });
        }

        if (
            String(
                appointmentData.userId
            ) !==
            String(userId)
        ) {

            return res.json({
                success: false,
                message:
                    "Unauthorized action"
            });
        }

        if (
            appointmentData.cancelled
        ) {

            return res.json({
                success: false,
                message:
                    "Appointment already cancelled"
            });
        }

        await appointmentModel
            .findByIdAndUpdate(
                appointmentId,
                {
                    cancelled: true
                }
            );

        const {
            docId,
            slotDate,
            slotTime
        } = appointmentData;

        const doctorData =
            await doctorModel
                .findById(
                    docId
                );

        if (doctorData) {

            let slots_booked =
                doctorData
                    .slots_booked ||
                {};

            if (
                slots_booked[
                    slotDate
                ]
            ) {

                slots_booked[
                    slotDate
                ] =
                    slots_booked[
                        slotDate
                    ].filter(
                        time =>
                            time !==
                            slotTime
                    );

                await doctorModel
                    .findByIdAndUpdate(
                        docId,
                        {
                            slots_booked
                        }
                    );
            }
        }

        const userData =
            await userModel
                .findById(userId)
                .select("-password");

        if (userData) {

            sendAppointmentEmail({

                to:
                    userData.email,

                userName:
                    userData.name,

                type:
                    "cancelled",

                doctorName:
                    appointmentData
                        .docData
                        ?.name ||
                    doctorData
                        ?.name ||
                    "Doctor",

                speciality:
                    appointmentData
                        .docData
                        ?.speciality ||
                    doctorData
                        ?.speciality ||
                    "N/A",

                slotDate,

                slotTime,

                amount:
                    appointmentData
                        .amount
            });
        }

        return res.json({
            success: true,
            message:
                "Appointment Cancelled"
        });

    } catch (error) {

        console.error(
            "CANCEL APPOINTMENT ERROR:",
            error
        );

        return res.json({
            success: false,
            message:
                error.message
        });
    }
};


// RESCHEDULE APPOINTMENT

const rescheduleAppointment =
async (req, res) => {

    try {

        const {
            userId,
            appointmentId,
            slotDate,
            slotTime
        } = req.body;

        if (
            !appointmentId ||
            !slotDate ||
            !slotTime
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Appointment ID, date and time are required"
                });
        }

        const appointmentData =
            await appointmentModel
                .findById(
                    appointmentId
                );

        if (!appointmentData) {

            return res
                .status(404)
                .json({
                    success: false,
                    message:
                        "Appointment not found"
                });
        }

        if (
            String(
                appointmentData.userId
            ) !==
            String(userId)
        ) {

            return res
                .status(403)
                .json({
                    success: false,
                    message:
                        "Unauthorized action"
                });
        }

        if (
            appointmentData.cancelled
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Cancelled appointment cannot be rescheduled"
                });
        }

        if (
            appointmentData
                .isCompleted
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Completed appointment cannot be rescheduled"
                });
        }

        if (
            appointmentData
                .slotDate ===
                slotDate &&
            appointmentData
                .slotTime ===
                slotTime
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Please select a different appointment slot"
                });
        }

        const doctorData =
            await doctorModel
                .findById(
                    appointmentData
                        .docId
                );

        if (!doctorData) {

            return res
                .status(404)
                .json({
                    success: false,
                    message:
                        "Doctor not found"
                });
        }

        if (
            !doctorData.available
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Doctor is currently not available"
                });
        }

        const slots_booked =
            doctorData.slots_booked
                ? JSON.parse(
                    JSON.stringify(
                        doctorData
                            .slots_booked
                    )
                )
                : {};

        if (
            slots_booked[
                slotDate
            ] &&
            slots_booked[
                slotDate
            ].includes(
                slotTime
            )
        ) {

            return res
                .status(409)
                .json({
                    success: false,
                    message:
                        "Selected slot is already booked"
                });
        }

        const oldSlotDate =
            appointmentData
                .slotDate;

        const oldSlotTime =
            appointmentData
                .slotTime;

        if (
            slots_booked[
                oldSlotDate
            ]
        ) {

            slots_booked[
                oldSlotDate
            ] =
                slots_booked[
                    oldSlotDate
                ].filter(
                    time =>
                        time !==
                        oldSlotTime
                );

            if (
                slots_booked[
                    oldSlotDate
                ].length === 0
            ) {

                delete slots_booked[
                    oldSlotDate
                ];
            }
        }

        if (
            slots_booked[
                slotDate
            ]
        ) {

            slots_booked[
                slotDate
            ].push(
                slotTime
            );

        } else {

            slots_booked[
                slotDate
            ] = [
                slotTime
            ];
        }

        await doctorModel
            .findByIdAndUpdate(
                appointmentData.docId,
                {
                    slots_booked
                }
            );

        await appointmentModel
            .findByIdAndUpdate(
                appointmentId,
                {
                    slotDate,
                    slotTime
                }
            );

        const userData =
            await userModel
                .findById(userId)
                .select("-password");

        if (userData) {

            sendAppointmentEmail({

                to:
                    userData.email,

                userName:
                    userData.name,

                type:
                    "rescheduled",

                doctorName:
                    doctorData.name,

                speciality:
                    doctorData
                        .speciality,

                slotDate,

                slotTime,

                amount:
                    appointmentData
                        .amount
            });
        }

        return res.json({
            success: true,
            message:
                "Appointment rescheduled successfully"
        });

    } catch (error) {

        console.error(
            "RESCHEDULE APPOINTMENT ERROR:",
            error
        );

        return res
            .status(500)
            .json({
                success: false,
                message:
                    error.message
            });
    }
};


// LIST APPOINTMENTS

const listAppointment =
async (req, res) => {

    try {

        const {
            userId
        } = req.body;

        const appointments =
            await appointmentModel
                .find({
                    userId
                });

        return res.json({
            success: true,
            appointments
        });

    } catch (error) {

        console.error(
            "LIST APPOINTMENTS ERROR:",
            error
        );

        return res.json({
            success: false,
            message:
                error.message
        });
    }
};


// ADD REVIEW

const addReview =
async (req, res) => {

    try {

        const {
            userId,
            appointmentId,
            rating,
            comment
        } = req.body;

        if (
            !appointmentId ||
            rating === undefined ||
            !comment?.trim()
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Rating and review are required"
                });
        }

        const ratingNumber =
            Number(rating);

        if (
            !Number.isInteger(
                ratingNumber
            ) ||
            ratingNumber < 1 ||
            ratingNumber > 5
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Rating must be between 1 and 5"
                });
        }

        const cleanComment =
            comment.trim();

        if (
            cleanComment.length < 3
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Review is too short"
                });
        }

        if (
            cleanComment.length > 500
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Review cannot exceed 500 characters"
                });
        }

        const appointment =
            await appointmentModel
                .findById(
                    appointmentId
                );

        if (!appointment) {

            return res
                .status(404)
                .json({
                    success: false,
                    message:
                        "Appointment not found"
                });
        }

        if (
            String(
                appointment.userId
            ) !==
            String(userId)
        ) {

            return res
                .status(403)
                .json({
                    success: false,
                    message:
                        "You cannot review this appointment"
                });
        }

        if (
            appointment.cancelled
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Cancelled appointments cannot be reviewed"
                });
        }

        if (
            !appointment
                .isCompleted
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "You can review only after the appointment is completed"
                });
        }

        const existingReview =
            await reviewModel
                .findOne({
                    appointmentId
                });

        if (
            existingReview ||
            appointment.reviewed
        ) {

            return res
                .status(409)
                .json({
                    success: false,
                    message:
                        "You have already reviewed this appointment"
                });
        }

        const user =
            await userModel
                .findById(userId)
                .select(
                    "name image"
                );

        if (!user) {

            return res
                .status(404)
                .json({
                    success: false,
                    message:
                        "User not found"
                });
        }

        const doctor =
            await doctorModel
                .findById(
                    appointment.docId
                );

        if (!doctor) {

            return res
                .status(404)
                .json({
                    success: false,
                    message:
                        "Doctor not found"
                });
        }

        const newReview =
            new reviewModel({

                userId,

                docId:
                    appointment.docId,

                appointmentId,

                userName:
                    user.name,

                userImage:
                    user.image || "",

                rating:
                    ratingNumber,

                comment:
                    cleanComment
            });

        await newReview.save();

        await appointmentModel
            .findByIdAndUpdate(
                appointmentId,
                {
                    reviewed: true
                }
            );

        const ratingStats =
            await reviewModel
                .aggregate([

                    {
                        $match: {
                            docId:
                                String(
                                    appointment
                                        .docId
                                )
                        }
                    },

                    {
                        $group: {

                            _id: "$docId",

                            averageRating: {
                                $avg:
                                    "$rating"
                            },

                            reviewCount: {
                                $sum: 1
                            }
                        }
                    }
                ]);

        const averageRating =
            ratingStats.length > 0
                ? Number(
                    ratingStats[0]
                        .averageRating
                        .toFixed(1)
                )
                : 0;

        const reviewCount =
            ratingStats.length > 0
                ? ratingStats[0]
                    .reviewCount
                : 0;

        await doctorModel
            .findByIdAndUpdate(
                appointment.docId,
                {
                    rating:
                        averageRating,
                    reviewCount
                }
            );

        return res.json({
            success: true,
            message:
                "Review submitted successfully",
            rating:
                averageRating,
            reviewCount
        });

    } catch (error) {

        console.error(
            "ADD REVIEW ERROR:",
            error
        );

        if (
            error.code === 11000
        ) {

            return res
                .status(409)
                .json({
                    success: false,
                    message:
                        "You have already reviewed this appointment"
                });
        }

        return res
            .status(500)
            .json({
                success: false,
                message:
                    error.message
            });
    }
};


// GET DOCTOR REVIEWS

const getDoctorReviews =
async (req, res) => {

    try {

        const {
            docId
        } = req.params;

        const reviews =
            await reviewModel
                .find({
                    docId:
                        String(docId)
                })
                .sort({
                    date: -1
                });

        return res.json({
            success: true,
            reviews
        });

    } catch (error) {

        console.error(
            "GET REVIEWS ERROR:",
            error
        );

        return res
            .status(500)
            .json({
                success: false,
                message:
                    error.message
            });
    }
};


// RAZORPAY CREATE ORDER

const paymentRazorpay =
async (req, res) => {

    try {

        const {
            userId,
            appointmentId
        } = req.body;

        if (
            !process.env
                .RAZORPAY_KEY_ID
        ) {

            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        "RAZORPAY_KEY_ID is missing on Render"
                });
        }

        if (
            !process.env
                .RAZORPAY_KEY_SECRET
        ) {

            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        "RAZORPAY_KEY_SECRET is missing on Render"
                });
        }

        if (!userId) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "User ID is missing"
                });
        }

        if (!appointmentId) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Appointment ID is missing"
                });
        }

        const appointmentData =
            await appointmentModel
                .findById(
                    appointmentId
                );

        if (!appointmentData) {

            return res
                .status(404)
                .json({
                    success: false,
                    message:
                        "Appointment not found"
                });
        }

        if (
            String(
                appointmentData
                    .userId
            ) !==
            String(userId)
        ) {

            return res
                .status(403)
                .json({
                    success: false,
                    message:
                        "Unauthorized payment request"
                });
        }

        if (
            appointmentData
                .cancelled
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Appointment is cancelled"
                });
        }

        if (
            appointmentData
                .payment
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Appointment is already paid"
                });
        }

        const appointmentAmount =
            Number(
                appointmentData
                    .amount
            );

        if (
            !Number.isFinite(
                appointmentAmount
            ) ||
            appointmentAmount <= 0
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Invalid appointment amount"
                });
        }

        const amount =
            Math.round(
                appointmentAmount *
                100
            );

        const currency =
            (
                process.env
                    .CURRENCY ||
                "INR"
            )
                .trim()
                .toUpperCase();

        const orderOptions = {

            amount,

            currency,

            receipt:
                String(
                    appointmentId
                )
        };

        const order =
            await razorpayInstance
                .orders
                .create(
                    orderOptions
                );

        return res.json({
            success: true,
            order
        });

    } catch (error) {

        console.error(
            "RAZORPAY CREATE ORDER ERROR:",
            error
        );

        return res
            .status(500)
            .json({
                success: false,
                message:
                    error?.error
                        ?.description ||
                    error?.description ||
                    error?.message ||
                    "Razorpay order creation failed"
            });
    }
};


// VERIFY RAZORPAY

const verifyRazorpay =
async (req, res) => {

    try {

        const {
            userId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !process.env
                .RAZORPAY_KEY_SECRET
        ) {

            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        "RAZORPAY_KEY_SECRET is missing on Render"
                });
        }

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Missing Razorpay payment verification details"
                });
        }

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env
                        .RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpay_order_id}|${razorpay_payment_id}`
                )
                .digest("hex");

        if (
            generatedSignature !==
            razorpay_signature
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Payment signature verification failed"
                });
        }

        const orderInfo =
            await razorpayInstance
                .orders
                .fetch(
                    razorpay_order_id
                );

        if (!orderInfo) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Razorpay order not found"
                });
        }

        const appointmentId =
            orderInfo.receipt;

        const appointmentData =
            await appointmentModel
                .findById(
                    appointmentId
                );

        if (!appointmentData) {

            return res
                .status(404)
                .json({
                    success: false,
                    message:
                        "Appointment not found"
                });
        }

        if (
            String(
                appointmentData
                    .userId
            ) !==
            String(userId)
        ) {

            return res
                .status(403)
                .json({
                    success: false,
                    message:
                        "Unauthorized payment verification"
                });
        }

        const expectedAmount =
            Math.round(
                Number(
                    appointmentData
                        .amount
                ) * 100
            );

        if (
            Number(
                orderInfo.amount
            ) !==
            expectedAmount
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Payment amount mismatch"
                });
        }

        const paymentInfo =
            await razorpayInstance
                .payments
                .fetch(
                    razorpay_payment_id
                );

        if (
            paymentInfo.order_id !==
            razorpay_order_id
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Payment does not belong to this order"
                });
        }

        if (
            Number(
                paymentInfo.amount
            ) !==
            Number(
                orderInfo.amount
            )
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Payment amount mismatch"
                });
        }

        if (
            paymentInfo.status ===
            "authorized"
        ) {

            await razorpayInstance
                .payments
                .capture(
                    razorpay_payment_id,
                    orderInfo.amount,
                    orderInfo.currency
                );

        } else if (
            paymentInfo.status !==
            "captured"
        ) {

            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        `Payment was not captured. Current status: ${paymentInfo.status}`
                });
        }

        await appointmentModel
            .findByIdAndUpdate(
                appointmentId,
                {
                    payment: true
                }
            );

        return res.json({
            success: true,
            message:
                "Payment Successful"
        });

    } catch (error) {

        console.error(
            "RAZORPAY VERIFY ERROR:",
            error
        );

        return res
            .status(500)
            .json({
                success: false,
                message:
                    error?.error
                        ?.description ||
                    error?.description ||
                    error?.message ||
                    "Razorpay payment verification failed"
            });
    }
};


// STRIPE PAYMENT

const paymentStripe =
async (req, res) => {

    try {

        const {
            appointmentId
        } = req.body;

        const {
            origin
        } = req.headers;

        const appointmentData =
            await appointmentModel
                .findById(
                    appointmentId
                );

        if (
            !appointmentData ||
            appointmentData
                .cancelled
        ) {

            return res.json({
                success: false,
                message:
                    "Appointment Cancelled or not found"
            });
        }

        const currency =
            (
                process.env
                    .CURRENCY ||
                "INR"
            )
                .toLowerCase();

        const line_items = [

            {

                price_data: {

                    currency,

                    product_data: {
                        name:
                            "Appointment Fees"
                    },

                    unit_amount:
                        Math.round(
                            Number(
                                appointmentData
                                    .amount
                            ) * 100
                        )
                },

                quantity: 1
            }

        ];

        const session =
            await stripeInstance
                .checkout
                .sessions
                .create({

                    success_url:
                        `${origin}/verify?success=true&appointmentId=${appointmentData._id}`,

                    cancel_url:
                        `${origin}/verify?success=false&appointmentId=${appointmentData._id}`,

                    line_items,

                    mode:
                        "payment"
                });

        return res.json({
            success: true,
            session_url:
                session.url
        });

    } catch (error) {

        console.error(
            "STRIPE PAYMENT ERROR:",
            error
        );

        return res.json({
            success: false,
            message:
                error.message
        });
    }
};


// VERIFY STRIPE

const verifyStripe =
async (req, res) => {

    try {

        const {
            appointmentId,
            success
        } = req.body;

        if (
            success === "true"
        ) {

            await appointmentModel
                .findByIdAndUpdate(
                    appointmentId,
                    {
                        payment: true
                    }
                );

            return res.json({
                success: true,
                message:
                    "Payment Successful"
            });
        }

        return res.json({
            success: false,
            message:
                "Payment Failed"
        });

    } catch (error) {

        console.error(
            "VERIFY STRIPE ERROR:",
            error
        );

        return res.json({
            success: false,
            message:
                error.message
        });
    }
};


export {

    loginUser,

    registerUser,

    getProfile,

    updateProfile,

    bookAppointment,

    listAppointment,

    cancelAppointment,

    rescheduleAppointment,

    addReview,

    getDoctorReviews,

    paymentRazorpay,

    verifyRazorpay,

    paymentStripe,

    verifyStripe
};
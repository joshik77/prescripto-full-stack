import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from "cloudinary";
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";

// ======================================================
// PAYMENT GATEWAYS
// ======================================================

const stripeInstance = new Stripe(
    process.env.STRIPE_SECRET_KEY
);

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


// ======================================================
// REGISTER USER
// ======================================================

const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;

        if (!name || !email || !password) {

            return res.json({
                success: false,
                message: "Missing Details"
            });
        }

        if (!validator.isEmail(email)) {

            return res.json({
                success: false,
                message: "Please enter a valid email"
            });
        }

        if (password.length < 8) {

            return res.json({
                success: false,
                message: "Please enter a strong password"
            });
        }

        const existingUser =
            await userModel.findOne({ email });

        if (existingUser) {

            return res.json({
                success: false,
                message: "User already exists"
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
            password: hashedPassword
        };

        const newUser =
            new userModel(userData);

        const user =
            await newUser.save();

        const token =
            jwt.sign(
                {
                    id: user._id
                },
                process.env.JWT_SECRET
            );

        res.json({
            success: true,
            token
        });

    } catch (error) {

        console.error(
            "REGISTER USER ERROR:",
            error
        );

        res.json({
            success: false,
            message: error.message
        });
    }
};


// ======================================================
// LOGIN USER
// ======================================================

const loginUser = async (req, res) => {

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
                message: "User does not exist"
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
                message: "Invalid credentials"
            });
        }

        const token =
            jwt.sign(
                {
                    id: user._id
                },
                process.env.JWT_SECRET
            );

        res.json({
            success: true,
            token
        });

    } catch (error) {

        console.error(
            "LOGIN USER ERROR:",
            error
        );

        res.json({
            success: false,
            message: error.message
        });
    }
};


// ======================================================
// GET PROFILE
// ======================================================

const getProfile = async (req, res) => {

    try {

        const {
            userId
        } = req.body;

        const userData =
            await userModel
                .findById(userId)
                .select("-password");

        res.json({
            success: true,
            userData
        });

    } catch (error) {

        console.error(
            "GET PROFILE ERROR:",
            error
        );

        res.json({
            success: false,
            message: error.message
        });
    }
};


// ======================================================
// UPDATE PROFILE
// ======================================================

const updateProfile = async (req, res) => {

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
                message: "Data Missing"
            });
        }

        let parsedAddress;

        try {

            parsedAddress =
                typeof address === "string"
                    ? JSON.parse(address)
                    : address;

        } catch (error) {

            return res.json({
                success: false,
                message: "Invalid address format"
            });
        }

        await userModel.findByIdAndUpdate(
            userId,
            {
                name,
                phone,
                address: parsedAddress,
                dob,
                gender
            }
        );

        if (imageFile) {

            const imageUpload =
                await cloudinary.uploader.upload(
                    imageFile.path,
                    {
                        resource_type: "image"
                    }
                );

            const imageURL =
                imageUpload.secure_url;

            await userModel.findByIdAndUpdate(
                userId,
                {
                    image: imageURL
                }
            );
        }

        res.json({
            success: true,
            message: "Profile Updated"
        });

    } catch (error) {

        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );

        res.json({
            success: false,
            message: error.message
        });
    }
};


// ======================================================
// BOOK APPOINTMENT
// ======================================================

const bookAppointment = async (req, res) => {

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
                message: "Doctor not found"
            });
        }

        if (!docData.available) {

            return res.json({
                success: false,
                message: "Doctor Not Available"
            });
        }

        let slots_booked =
            docData.slots_booked || {};

        if (slots_booked[slotDate]) {

            if (
                slots_booked[slotDate]
                    .includes(slotTime)
            ) {

                return res.json({
                    success: false,
                    message: "Slot Not Available"
                });

            } else {

                slots_booked[slotDate]
                    .push(slotTime);
            }

        } else {

            slots_booked[slotDate] = [
                slotTime
            ];
        }

        const userData =
            await userModel
                .findById(userId)
                .select("-password");

        const appointmentData = {

            userId,

            docId,

            userData,

            docData,

            amount:
                Number(docData.fees),

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

        await doctorModel.findByIdAndUpdate(
            docId,
            {
                slots_booked
            }
        );

        res.json({
            success: true,
            message: "Appointment Booked"
        });

    } catch (error) {

        console.error(
            "BOOK APPOINTMENT ERROR:",
            error
        );

        res.json({
            success: false,
            message: error.message
        });
    }
};


// ======================================================
// CANCEL APPOINTMENT
// ======================================================

const cancelAppointment = async (req, res) => {

    try {

        const {
            userId,
            appointmentId
        } = req.body;

        const appointmentData =
            await appointmentModel.findById(
                appointmentId
            );

        if (!appointmentData) {

            return res.json({
                success: false,
                message: "Appointment not found"
            });
        }

        if (
            String(appointmentData.userId) !==
            String(userId)
        ) {

            return res.json({
                success: false,
                message: "Unauthorized action"
            });
        }

        await appointmentModel.findByIdAndUpdate(
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
            await doctorModel.findById(
                docId
            );

        if (doctorData) {

            let slots_booked =
                doctorData.slots_booked || {};

            if (slots_booked[slotDate]) {

                slots_booked[slotDate] =
                    slots_booked[slotDate]
                        .filter(
                            e => e !== slotTime
                        );

                await doctorModel.findByIdAndUpdate(
                    docId,
                    {
                        slots_booked
                    }
                );
            }
        }

        res.json({
            success: true,
            message: "Appointment Cancelled"
        });

    } catch (error) {

        console.error(
            "CANCEL APPOINTMENT ERROR:",
            error
        );

        res.json({
            success: false,
            message: error.message
        });
    }
};


// ======================================================
// LIST USER APPOINTMENTS
// ======================================================

const listAppointment = async (req, res) => {

    try {

        const {
            userId
        } = req.body;

        const appointments =
            await appointmentModel.find({
                userId
            });

        res.json({
            success: true,
            appointments
        });

    } catch (error) {

        console.error(
            "LIST APPOINTMENTS ERROR:",
            error
        );

        res.json({
            success: false,
            message: error.message
        });
    }
};


// ======================================================
// RAZORPAY - CREATE ORDER
// ======================================================

const paymentRazorpay = async (req, res) => {

    try {

        const {
            userId,
            appointmentId
        } = req.body;


        console.log(
            "===================================="
        );

        console.log(
            "RAZORPAY CREATE ORDER"
        );

        console.log(
            "User:",
            userId
        );

        console.log(
            "Appointment:",
            appointmentId
        );

        console.log(
            "===================================="
        );


        // ------------------------------------------------
        // CHECK RAZORPAY CONFIGURATION
        // ------------------------------------------------

        if (
            !process.env.RAZORPAY_KEY_ID
        ) {

            console.error(
                "RAZORPAY_KEY_ID IS MISSING"
            );

            return res.status(500).json({
                success: false,
                message:
                    "RAZORPAY_KEY_ID is missing on Render"
            });
        }


        if (
            !process.env.RAZORPAY_KEY_SECRET
        ) {

            console.error(
                "RAZORPAY_KEY_SECRET IS MISSING"
            );

            return res.status(500).json({
                success: false,
                message:
                    "RAZORPAY_KEY_SECRET is missing on Render"
            });
        }


        // ------------------------------------------------
        // CHECK REQUEST
        // ------------------------------------------------

        if (!userId) {

            return res.status(400).json({
                success: false,
                message:
                    "User ID is missing"
            });
        }


        if (!appointmentId) {

            return res.status(400).json({
                success: false,
                message:
                    "Appointment ID is missing"
            });
        }


        // ------------------------------------------------
        // FIND APPOINTMENT
        // ------------------------------------------------

        const appointmentData =
            await appointmentModel.findById(
                appointmentId
            );


        if (!appointmentData) {

            return res.status(404).json({
                success: false,
                message:
                    "Appointment not found"
            });
        }


        // ------------------------------------------------
        // VERIFY USER
        // ------------------------------------------------

        if (
            String(appointmentData.userId) !==
            String(userId)
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Unauthorized payment request"
            });
        }


        // ------------------------------------------------
        // CHECK CANCELLED
        // ------------------------------------------------

        if (
            appointmentData.cancelled
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Appointment is cancelled"
            });
        }


        // ------------------------------------------------
        // CHECK ALREADY PAID
        // ------------------------------------------------

        if (
            appointmentData.payment
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Appointment is already paid"
            });
        }


        // ------------------------------------------------
        // CALCULATE AMOUNT
        // ------------------------------------------------

        const appointmentAmount =
            Number(
                appointmentData.amount
            );


        if (
            !Number.isFinite(
                appointmentAmount
            ) ||
            appointmentAmount <= 0
        ) {

            console.error(
                "INVALID APPOINTMENT AMOUNT:",
                appointmentData.amount
            );

            return res.status(400).json({
                success: false,
                message:
                    "Invalid appointment amount"
            });
        }


        const amount =
            Math.round(
                appointmentAmount * 100
            );


        // ------------------------------------------------
        // CURRENCY
        // ------------------------------------------------

        const currency =
            (
                process.env.CURRENCY ||
                "INR"
            )
                .trim()
                .toUpperCase();


        // ------------------------------------------------
        // RAZORPAY ORDER
        // ------------------------------------------------

        const orderOptions = {

            amount:

                amount,

            currency:

                currency,

            receipt:

                String(
                    appointmentId
                )
        };


        console.log(
            "Razorpay order options:",
            orderOptions
        );


        const order =
            await razorpayInstance
                .orders
                .create(
                    orderOptions
                );


        console.log(
            "Razorpay order successfully created:",
            {
                id:
                    order.id,

                amount:
                    order.amount,

                currency:
                    order.currency,

                receipt:
                    order.receipt
            }
        );


        return res.json({

            success: true,

            order

        });


    } catch (error) {

        console.error(
            "===================================="
        );

        console.error(
            "RAZORPAY CREATE ORDER ERROR"
        );

        console.error(
            error
        );

        console.error(
            "===================================="
        );


        return res.status(500).json({

            success: false,

            message:

                error?.error?.description ||

                error?.description ||

                error?.message ||

                "Razorpay order creation failed"

        });
    }
};


// ======================================================
// RAZORPAY - VERIFY PAYMENT
// ======================================================

const verifyRazorpay = async (req, res) => {

    try {

        const {
            userId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;


        // ------------------------------------------------
        // CHECK SECRET
        // ------------------------------------------------

        if (
            !process.env.RAZORPAY_KEY_SECRET
        ) {

            return res.status(500).json({
                success: false,
                message:
                    "RAZORPAY_KEY_SECRET is missing on Render"
            });
        }


        // ------------------------------------------------
        // CHECK PAYMENT DATA
        // ------------------------------------------------

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Missing Razorpay payment verification details"

            });
        }


        // ------------------------------------------------
        // VERIFY SIGNATURE
        // ------------------------------------------------

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpay_order_id}|${razorpay_payment_id}`
                )
                .digest("hex");


        const signaturesMatch =
            generatedSignature ===
            razorpay_signature;


        if (!signaturesMatch) {

            console.error(
                "Razorpay signature verification failed"
            );

            return res.status(400).json({

                success: false,

                message:
                    "Payment signature verification failed"

            });
        }


        // ------------------------------------------------
        // GET ORDER
        // ------------------------------------------------

        const orderInfo =
            await razorpayInstance
                .orders
                .fetch(
                    razorpay_order_id
                );


        if (!orderInfo) {

            return res.status(400).json({

                success: false,

                message:
                    "Razorpay order not found"

            });
        }


        const appointmentId =
            orderInfo.receipt;


        if (!appointmentId) {

            return res.status(400).json({

                success: false,

                message:
                    "Appointment ID missing from Razorpay order"

            });
        }


        // ------------------------------------------------
        // GET APPOINTMENT
        // ------------------------------------------------

        const appointmentData =
            await appointmentModel.findById(
                appointmentId
            );


        if (!appointmentData) {

            return res.status(404).json({

                success: false,

                message:
                    "Appointment not found"

            });
        }


        // ------------------------------------------------
        // VERIFY USER
        // ------------------------------------------------

        if (
            String(appointmentData.userId) !==
            String(userId)
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Unauthorized payment verification"

            });
        }


        // ------------------------------------------------
        // VERIFY ORDER AMOUNT
        // ------------------------------------------------

        const expectedAmount =
            Math.round(
                Number(
                    appointmentData.amount
                ) * 100
            );


        if (
            Number(orderInfo.amount) !==
            expectedAmount
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment amount mismatch"

            });
        }


        // ------------------------------------------------
        // FETCH PAYMENT
        // ------------------------------------------------

        const paymentInfo =
            await razorpayInstance
                .payments
                .fetch(
                    razorpay_payment_id
                );


        console.log(
            "Razorpay payment information:",
            {
                id:
                    paymentInfo.id,

                order_id:
                    paymentInfo.order_id,

                amount:
                    paymentInfo.amount,

                status:
                    paymentInfo.status
            }
        );


        // ------------------------------------------------
        // VERIFY ORDER ID
        // ------------------------------------------------

        if (
            paymentInfo.order_id !==
            razorpay_order_id
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment does not belong to this order"

            });
        }


        // ------------------------------------------------
        // VERIFY PAYMENT AMOUNT
        // ------------------------------------------------

        if (
            Number(paymentInfo.amount) !==
            Number(orderInfo.amount)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment amount mismatch"

            });
        }


        // ------------------------------------------------
        // CAPTURE PAYMENT IF AUTHORIZED
        // ------------------------------------------------

        if (
            paymentInfo.status ===
            "authorized"
        ) {

            console.log(
                "Payment authorized. Capturing..."
            );


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

            return res.status(400).json({

                success: false,

                message:
                    `Payment was not captured. Current status: ${paymentInfo.status}`

            });
        }


        // ------------------------------------------------
        // MARK APPOINTMENT AS PAID
        // ------------------------------------------------

        await appointmentModel.findByIdAndUpdate(

            appointmentId,

            {
                payment: true
            },

            {
                new: true
            }

        );


        console.log(
            "===================================="
        );

        console.log(
            "RAZORPAY PAYMENT SUCCESS"
        );

        console.log(
            "Appointment:",
            appointmentId
        );

        console.log(
            "Order:",
            razorpay_order_id
        );

        console.log(
            "Payment:",
            razorpay_payment_id
        );

        console.log(
            "===================================="
        );


        return res.json({

            success: true,

            message:
                "Payment Successful"

        });


    } catch (error) {

        console.error(
            "===================================="
        );

        console.error(
            "RAZORPAY VERIFY ERROR"
        );

        console.error(
            error
        );

        console.error(
            "===================================="
        );


        return res.status(500).json({

            success: false,

            message:

                error?.error?.description ||

                error?.description ||

                error?.message ||

                "Payment verification failed"

        });
    }
};


// ======================================================
// STRIPE PAYMENT
// ======================================================

const paymentStripe = async (req, res) => {

    try {

        const {
            appointmentId
        } = req.body;

        const {
            origin
        } = req.headers;


        const appointmentData =
            await appointmentModel.findById(
                appointmentId
            );


        if (
            !appointmentData ||
            appointmentData.cancelled
        ) {

            return res.json({

                success: false,

                message:
                    "Appointment Cancelled or not found"

            });
        }


        const currency =
            (
                process.env.CURRENCY ||
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
                                appointmentData.amount
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


        res.json({

            success: true,

            session_url:
                session.url

        });


    } catch (error) {

        console.error(
            "STRIPE PAYMENT ERROR:",
            error
        );

        res.json({

            success: false,

            message:
                error.message

        });
    }
};


// ======================================================
// VERIFY STRIPE
// ======================================================

const verifyStripe = async (req, res) => {

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


        res.json({

            success: false,

            message:
                "Payment Failed"

        });


    } catch (error) {

        console.error(
            "VERIFY STRIPE ERROR:",
            error
        );

        res.json({

            success: false,

            message:
                error.message

        });
    }
};


// ======================================================
// EXPORTS
// ======================================================

export {

    loginUser,

    registerUser,

    getProfile,

    updateProfile,

    bookAppointment,

    listAppointment,

    cancelAppointment,

    paymentRazorpay,

    verifyRazorpay,

    paymentStripe,

    verifyStripe

};
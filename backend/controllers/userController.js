import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import crypto from "crypto";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from 'cloudinary'
import stripe from "stripe";
import razorpay from 'razorpay';

// Gateway Initialize
const stripeInstance = new stripe(
    process.env.STRIPE_SECRET_KEY
)

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})


// API to register user
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
                message: 'Missing Details'
            })
        }

        if (!validator.isEmail(email)) {
            return res.json({
                success: false,
                message: "Please enter a valid email"
            })
        }

        if (password.length < 8) {
            return res.json({
                success: false,
                message: "Please enter a strong password"
            })
        }

        const salt = await bcrypt.genSalt(10);

        const hashedPassword =
            await bcrypt.hash(
                password,
                salt
            )

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newUser =
            new userModel(userData)

        const user =
            await newUser.save()

        const token =
            jwt.sign(
                {
                    id: user._id
                },
                process.env.JWT_SECRET
            )

        res.json({
            success: true,
            token
        })

    } catch (error) {

        console.log(error)

        res.json({
            success: false,
            message: error.message
        })
    }
}


// API to login user
const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        const user =
            await userModel.findOne({
                email
            })

        if (!user) {

            return res.json({
                success: false,
                message: "User does not exist"
            })
        }

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            )

        if (isMatch) {

            const token =
                jwt.sign(
                    {
                        id: user._id
                    },
                    process.env.JWT_SECRET
                )

            res.json({
                success: true,
                token
            })

        } else {

            res.json({
                success: false,
                message: "Invalid credentials"
            })
        }

    } catch (error) {

        console.log(error)

        res.json({
            success: false,
            message: error.message
        })
    }
}


// API to get user profile data
const getProfile = async (req, res) => {

    try {

        const {
            userId
        } = req.body

        const userData =
            await userModel
                .findById(userId)
                .select('-password')

        res.json({
            success: true,
            userData
        })

    } catch (error) {

        console.log(error)

        res.json({
            success: false,
            message: error.message
        })
    }
}


// API to update user profile
const updateProfile = async (req, res) => {

    try {

        const {
            userId,
            name,
            phone,
            address,
            dob,
            gender
        } = req.body

        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {

            return res.json({
                success: false,
                message: "Data Missing"
            })
        }

        await userModel.findByIdAndUpdate(
            userId,
            {
                name,
                phone,
                address: JSON.parse(address),
                dob,
                gender
            }
        )

        if (imageFile) {

            const imageUpload =
                await cloudinary.uploader.upload(
                    imageFile.path,
                    {
                        resource_type: "image"
                    }
                )

            const imageURL =
                imageUpload.secure_url

            await userModel.findByIdAndUpdate(
                userId,
                {
                    image: imageURL
                }
            )
        }

        res.json({
            success: true,
            message: 'Profile Updated'
        })

    } catch (error) {

        console.log(error)

        res.json({
            success: false,
            message: error.message
        })
    }
}


// API to book appointment
const bookAppointment = async (req, res) => {

    try {

        const {
            userId,
            docId,
            slotDate,
            slotTime
        } = req.body

        const docData =
            await doctorModel
                .findById(docId)
                .select("-password")

        if (!docData.available) {

            return res.json({
                success: false,
                message: 'Doctor Not Available'
            })
        }

        let slots_booked =
            docData.slots_booked

        if (slots_booked[slotDate]) {

            if (
                slots_booked[slotDate]
                    .includes(slotTime)
            ) {

                return res.json({
                    success: false,
                    message: 'Slot Not Available'
                })

            } else {

                slots_booked[slotDate]
                    .push(slotTime)
            }

        } else {

            slots_booked[slotDate] = []

            slots_booked[slotDate]
                .push(slotTime)
        }

        const userData =
            await userModel
                .findById(userId)
                .select("-password")

        delete docData.slots_booked

        const appointmentData = {

            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment =
            new appointmentModel(
                appointmentData
            )

        await newAppointment.save()

        await doctorModel.findByIdAndUpdate(
            docId,
            {
                slots_booked
            }
        )

        res.json({
            success: true,
            message: 'Appointment Booked'
        })

    } catch (error) {

        console.log(error)

        res.json({
            success: false,
            message: error.message
        })
    }
}


// API to cancel appointment
const cancelAppointment = async (req, res) => {

    try {

        const {
            userId,
            appointmentId
        } = req.body

        const appointmentData =
            await appointmentModel
                .findById(appointmentId)

        if (!appointmentData) {

            return res.json({
                success: false,
                message: 'Appointment not found'
            })
        }

        if (
            String(appointmentData.userId) !==
            String(userId)
        ) {

            return res.json({
                success: false,
                message: 'Unauthorized action'
            })
        }

        await appointmentModel.findByIdAndUpdate(
            appointmentId,
            {
                cancelled: true
            }
        )

        const {
            docId,
            slotDate,
            slotTime
        } = appointmentData

        const doctorData =
            await doctorModel.findById(docId)

        let slots_booked =
            doctorData.slots_booked

        slots_booked[slotDate] =
            slots_booked[slotDate]
                .filter(
                    e => e !== slotTime
                )

        await doctorModel.findByIdAndUpdate(
            docId,
            {
                slots_booked
            }
        )

        res.json({
            success: true,
            message: 'Appointment Cancelled'
        })

    } catch (error) {

        console.log(error)

        res.json({
            success: false,
            message: error.message
        })
    }
}


// API to get user appointments
const listAppointment = async (req, res) => {

    try {

        const {
            userId
        } = req.body

        const appointments =
            await appointmentModel.find({
                userId
            })

        res.json({
            success: true,
            appointments
        })

    } catch (error) {

        console.log(error)

        res.json({
            success: false,
            message: error.message
        })
    }
}


// ======================================================
// RAZORPAY - CREATE ORDER
// ======================================================

const paymentRazorpay = async (req, res) => {

    try {

        const {
            userId,
            appointmentId
        } = req.body

        console.log(
            '=============================='
        )

        console.log(
            'RAZORPAY CREATE ORDER'
        )

        console.log(
            'User ID:',
            userId
        )

        console.log(
            'Appointment ID:',
            appointmentId
        )

        console.log(
            'Razorpay Key exists:',
            !!process.env.RAZORPAY_KEY_ID
        )

        console.log(
            'Razorpay Secret exists:',
            !!process.env.RAZORPAY_KEY_SECRET
        )

        console.log(
            '=============================='
        )


        if (!process.env.RAZORPAY_KEY_ID) {

            return res.status(500).json({
                success: false,
                message:
                    'RAZORPAY_KEY_ID is missing on Render'
            })
        }


        if (!process.env.RAZORPAY_KEY_SECRET) {

            return res.status(500).json({
                success: false,
                message:
                    'RAZORPAY_KEY_SECRET is missing on Render'
            })
        }


        const appointmentData =
            await appointmentModel.findById(
                appointmentId
            )


        if (!appointmentData) {

            return res.status(404).json({
                success: false,
                message:
                    'Appointment not found'
            })
        }


        if (
            String(appointmentData.userId) !==
            String(userId)
        ) {

            return res.status(403).json({
                success: false,
                message:
                    'Unauthorized action'
            })
        }


        if (appointmentData.cancelled) {

            return res.json({
                success: false,
                message:
                    'Appointment has been cancelled'
            })
        }


        if (appointmentData.payment) {

            return res.json({
                success: false,
                message:
                    'Appointment is already paid'
            })
        }


        const amount =
            Math.round(
                Number(appointmentData.amount) * 100
            )


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    'Invalid appointment amount'
            })
        }


        const currency =
            (
                process.env.CURRENCY ||
                'INR'
            )
                .trim()
                .toUpperCase()


        const options = {

            amount,

            currency,

            receipt:
                String(appointmentId)
        }


        console.log(
            'Creating Razorpay order:',
            options
        )


        const order =
            await razorpayInstance
                .orders
                .create(options)


        console.log(
            'RAZORPAY ORDER CREATED:',
            {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt
            }
        )


        return res.json({

            success: true,

            order

        })

    } catch (error) {

        console.error(
            '=============================='
        )

        console.error(
            'RAZORPAY ORDER CREATION ERROR'
        )

        console.error(error)

        console.error(
            '=============================='
        )


        return res.status(500).json({

            success: false,

            message:
                error?.error?.description ||
                error?.description ||
                error?.message ||
                'Unable to create Razorpay order'

        })
    }
}


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
        } = req.body


        console.log(
            '=============================='
        )

        console.log(
            'RAZORPAY VERIFY PAYMENT'
        )

        console.log(
            'Order ID:',
            razorpay_order_id
        )

        console.log(
            'Payment ID:',
            razorpay_payment_id
        )

        console.log(
            '=============================='
        )


        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Missing Razorpay verification details'

            })
        }


        if (!process.env.RAZORPAY_KEY_SECRET) {

            return res.status(500).json({

                success: false,

                message:
                    'RAZORPAY_KEY_SECRET is missing on Render'

            })
        }


        // ------------------------------------------------
        // Verify Razorpay signature
        // ------------------------------------------------

        const generatedSignature =
            crypto
                .createHmac(
                    'sha256',
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    razorpay_order_id +
                    '|' +
                    razorpay_payment_id
                )
                .digest('hex')


        if (
            generatedSignature !==
            razorpay_signature
        ) {

            console.error(
                'INVALID RAZORPAY SIGNATURE'
            )

            return res.status(400).json({

                success: false,

                message:
                    'Invalid Razorpay payment signature'

            })
        }


        console.log(
            'Razorpay signature verified'
        )


        // ------------------------------------------------
        // Fetch order
        // ------------------------------------------------

        const order =
            await razorpayInstance
                .orders
                .fetch(
                    razorpay_order_id
                )


        console.log(
            'RAZORPAY ORDER:',
            {
                id: order.id,
                status: order.status,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt
            }
        )


        const appointmentId =
            order.receipt


        if (!appointmentId) {

            return res.status(400).json({

                success: false,

                message:
                    'Appointment ID missing from Razorpay order'

            })
        }


        // ------------------------------------------------
        // Find appointment
        // ------------------------------------------------

        const appointmentData =
            await appointmentModel
                .findById(
                    appointmentId
                )


        if (!appointmentData) {

            return res.status(404).json({

                success: false,

                message:
                    'Appointment not found'

            })
        }


        // ------------------------------------------------
        // Verify user owns appointment
        // ------------------------------------------------

        if (
            String(appointmentData.userId) !==
            String(userId)
        ) {

            return res.status(403).json({

                success: false,

                message:
                    'Unauthorized payment verification'

            })
        }


        // ------------------------------------------------
        // Fetch payment
        // ------------------------------------------------

        const payment =
            await razorpayInstance
                .payments
                .fetch(
                    razorpay_payment_id
                )


        console.log(
            'RAZORPAY PAYMENT:',
            {
                id: payment.id,
                status: payment.status,
                amount: payment.amount,
                currency: payment.currency,
                order_id: payment.order_id
            }
        )


        // ------------------------------------------------
        // Verify payment belongs to order
        // ------------------------------------------------

        if (
            payment.order_id !==
            razorpay_order_id
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Payment does not belong to this order'

            })
        }


        // ------------------------------------------------
        // Verify payment amount
        // ------------------------------------------------

        if (
            Number(payment.amount) !==
            Number(order.amount)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Payment amount does not match order amount'

            })
        }


        // ------------------------------------------------
        // Capture payment if authorized
        // ------------------------------------------------

        if (
            payment.status ===
            'authorized'
        ) {

            console.log(
                'Payment authorized. Capturing...'
            )


            await razorpayInstance
                .payments
                .capture(
                    razorpay_payment_id,
                    order.amount,
                    order.currency
                )


            console.log(
                'Payment captured successfully'
            )

        } else if (
            payment.status !==
            'captured'
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Payment is not captured. Current status: ' +
                    payment.status

            })
        }


        // ------------------------------------------------
        // Mark appointment as paid
        // ------------------------------------------------

        await appointmentModel
            .findByIdAndUpdate(
                appointmentId,
                {
                    payment: true
                }
            )


        console.log(
            '================================'
        )

        console.log(
            'PAYMENT SUCCESSFULLY COMPLETED'
        )

        console.log(
            'Appointment:',
            appointmentId
        )

        console.log(
            '================================'
        )


        return res.json({

            success: true,

            message:
                'Payment Successful'

        })

    } catch (error) {

        console.error(
            '=============================='
        )

        console.error(
            'RAZORPAY VERIFICATION ERROR'
        )

        console.error(error)

        console.error(
            '=============================='
        )


        return res.status(500).json({

            success: false,

            message:
                error?.error?.description ||
                error?.description ||
                error?.message ||
                'Payment verification failed'

        })
    }
}


// ======================================================
// STRIPE
// ======================================================

// API to make payment using Stripe
const paymentStripe = async (req, res) => {

    try {

        const {
            appointmentId
        } = req.body

        const {
            origin
        } = req.headers

        const appointmentData =
            await appointmentModel
                .findById(
                    appointmentId
                )

        if (
            !appointmentData ||
            appointmentData.cancelled
        ) {

            return res.json({

                success: false,

                message:
                    'Appointment Cancelled or not found'

            })
        }


        const currency =
            process.env.CURRENCY
                .toLocaleLowerCase()


        const line_items = [{

            price_data: {

                currency,

                product_data: {

                    name:
                        "Appointment Fees"

                },

                unit_amount:
                    appointmentData.amount * 100

            },

            quantity: 1

        }]


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
                        'payment'

                })


        res.json({

            success: true,

            session_url:
                session.url

        })

    } catch (error) {

        console.log(error)

        res.json({

            success: false,

            message:
                error.message

        })
    }
}


const verifyStripe = async (req, res) => {

    try {

        const {
            appointmentId,
            success
        } = req.body


        if (success === "true") {

            await appointmentModel
                .findByIdAndUpdate(
                    appointmentId,
                    {
                        payment: true
                    }
                )

            return res.json({

                success: true,

                message:
                    'Payment Successful'

            })
        }


        res.json({

            success: false,

            message:
                'Payment Failed'

        })

    } catch (error) {

        console.log(error)

        res.json({

            success: false,

            message:
                error.message

        })
    }

}


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
}
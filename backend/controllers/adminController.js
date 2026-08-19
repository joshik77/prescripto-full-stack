import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";

// API for admin login
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (
            email === process.env.ADMIN_EMAIL &&
            password === process.env.ADMIN_PASSWORD
        ) {

            const token = jwt.sign(
                email + password,
                process.env.JWT_SECRET
            );

            return res.json({
                success: true,
                token
            });

        } else {

            return res.json({
                success: false,
                message: "Invalid credentials"
            });
        }

    } catch (error) {

        console.error("ADMIN LOGIN ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};


// API to get all appointments
const appointmentsAdmin = async (req, res) => {

    try {

        const appointments =
            await appointmentModel.find({});

        res.json({
            success: true,
            appointments
        });

    } catch (error) {

        console.error("ADMIN APPOINTMENTS ERROR:", error);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// API for appointment cancellation
const appointmentCancel = async (req, res) => {

    try {

        const { appointmentId } = req.body;

        await appointmentModel.findByIdAndUpdate(
            appointmentId,
            {
                cancelled: true
            }
        );

        res.json({
            success: true,
            message: "Appointment Cancelled"
        });

    } catch (error) {

        console.error("ADMIN CANCEL ERROR:", error);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// ======================================================
// ADD DOCTOR
// ======================================================

const addDoctor = async (req, res) => {

    try {

        console.log("==============================");
        console.log("ADD DOCTOR REQUEST");
        console.log("Body:", req.body);
        console.log("File exists:", !!req.file);

        if (req.file) {

            console.log(
                "File name:",
                req.file.originalname
            );

            console.log(
                "File size:",
                req.file.size
            );

            console.log(
                "File type:",
                req.file.mimetype
            );
        }

        console.log("==============================");


        const {
            name,
            email,
            password,
            speciality,
            degree,
            experience,
            about,
            fees,
            address
        } = req.body;


        const imageFile = req.file;


        // Check all fields
        if (
            !name ||
            !email ||
            !password ||
            !speciality ||
            !degree ||
            !experience ||
            !about ||
            fees === undefined ||
            fees === null ||
            !address
        ) {

            return res.status(400).json({
                success: false,
                message: "Missing Details"
            });
        }


        // Check image
        if (!imageFile) {

            return res.status(400).json({
                success: false,
                message:
                    "Doctor image is required. Please select an image file."
            });
        }


        // Validate email
        if (!validator.isEmail(email)) {

            return res.status(400).json({
                success: false,
                message:
                    "Please enter a valid email"
            });
        }


        // Validate password
        if (password.length < 8) {

            return res.status(400).json({
                success: false,
                message:
                    "Please enter a strong password"
            });
        }


        // Check Cloudinary configuration
        if (
            !process.env.CLOUDINARY_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_SECRET_KEY
        ) {

            console.error(
                "CLOUDINARY CONFIGURATION ERROR"
            );

            console.error(
                "CLOUDINARY_NAME exists:",
                !!process.env.CLOUDINARY_NAME
            );

            console.error(
                "CLOUDINARY_API_KEY exists:",
                !!process.env.CLOUDINARY_API_KEY
            );

            console.error(
                "CLOUDINARY_SECRET_KEY exists:",
                !!process.env.CLOUDINARY_SECRET_KEY
            );

            return res.status(500).json({
                success: false,
                message:
                    "Cloudinary configuration is missing on Render"
            });
        }


        // Check duplicate email
        const existingDoctor =
            await doctorModel.findOne({
                email
            });


        if (existingDoctor) {

            return res.status(400).json({
                success: false,
                message:
                    "Doctor with this email already exists"
            });
        }


        // Hash password
        const salt =
            await bcrypt.genSalt(10);

        const hashedPassword =
            await bcrypt.hash(
                password,
                salt
            );


        // ------------------------------------------------
        // Upload image to Cloudinary
        // ------------------------------------------------

        const uploadImage =
            () => new Promise(
                (resolve, reject) => {

                    const stream =
                        cloudinary.uploader.upload_stream(
                            {
                                resource_type: "image",
                                folder: "prescripto/doctors"
                            },
                            (error, result) => {

                                if (error) {

                                    console.error(
                                        "================================"
                                    );

                                    console.error(
                                        "CLOUDINARY UPLOAD ERROR"
                                    );

                                    console.error(
                                        "Message:",
                                        error.message
                                    );

                                    console.error(
                                        "HTTP Code:",
                                        error.http_code
                                    );

                                    console.error(
                                        "Name:",
                                        error.name
                                    );

                                    console.error(
                                        "Full Cloudinary Error:",
                                        error
                                    );

                                    console.error(
                                        "================================"
                                    );

                                    reject(error);

                                } else {

                                    console.log(
                                        "CLOUDINARY UPLOAD SUCCESS"
                                    );

                                    console.log(
                                        "Cloudinary URL:",
                                        result?.secure_url
                                    );

                                    resolve(result);
                                }
                            }
                        );


                    stream.on(
                        "error",
                        (streamError) => {

                            console.error(
                                "CLOUDINARY STREAM ERROR:",
                                streamError
                            );

                            reject(streamError);
                        }
                    );


                    stream.end(
                        imageFile.buffer
                    );
                }
            );


        console.log(
            "Uploading doctor image to Cloudinary..."
        );


        const imageUpload =
            await uploadImage();


        if (
            !imageUpload ||
            !imageUpload.secure_url
        ) {

            return res.status(500).json({
                success: false,
                message:
                    "Cloudinary image upload failed"
            });
        }


        console.log(
            "Cloudinary upload successful:",
            imageUpload.secure_url
        );


        // Parse address safely
        let parsedAddress;

        try {

            parsedAddress =
                typeof address === "string"
                    ? JSON.parse(address)
                    : address;

        } catch (error) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid address format"
            });
        }


        // Create doctor
        const doctorData = {

            name,

            email,

            image:
                imageUpload.secure_url,

            password:
                hashedPassword,

            speciality,

            degree,

            experience,

            about,

            fees:
                Number(fees),

            address:
                parsedAddress,

            date:
                Date.now()
        };


        const newDoctor =
            new doctorModel(
                doctorData
            );


        await newDoctor.save();


        console.log(
            "Doctor successfully added:",
            email
        );


        return res.json({

            success: true,

            message:
                "Doctor Added"

        });

    } catch (error) {

        console.error(
            "=============================="
        );

        console.error(
            "ADD DOCTOR ERROR"
        );

        console.error(
            "Message:",
            error?.message
        );

        console.error(
            "Name:",
            error?.name
        );

        console.error(
            "HTTP Code:",
            error?.http_code
        );

        console.error(
            "Full Error:",
            error
        );

        console.error(
            "=============================="
        );


        return res.status(500).json({

            success: false,

            message:
                error?.message ||
                "Failed to add doctor"

        });
    }
};


// API to get all doctors
const allDoctors = async (req, res) => {

    try {

        const doctors =
            await doctorModel
                .find({})
                .select("-password");

        res.json({
            success: true,
            doctors
        });

    } catch (error) {

        console.error(
            "ALL DOCTORS ERROR:",
            error
        );

        res.json({
            success: false,
            message: error.message
        });
    }
};


// ======================================================
// REMOVE DOCTOR
// ======================================================

const removeDoctor = async (req, res) => {

    try {

        const { id } = req.body;

        if (!id) {

            return res.status(400).json({
                success: false,
                message: "Doctor ID is required"
            });
        }


        const doctor =
            await doctorModel.findById(id);


        if (!doctor) {

            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }


        await doctorModel.findByIdAndDelete(id);


        res.json({
            success: true,
            message: "Doctor removed successfully"
        });

    } catch (error) {

        console.error(
            "REMOVE DOCTOR ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// API to get dashboard data
const adminDashboard = async (req, res) => {

    try {

        const doctors =
            await doctorModel.find({});

        const users =
            await userModel.find({});

        const appointments =
            await appointmentModel.find({});

        const dashData = {

            doctors:
                doctors.length,

            appointments:
                appointments.length,

            patients:
                users.length,

            latestAppointments:
                appointments.reverse()
        };


        res.json({
            success: true,
            dashData
        });

    } catch (error) {

        console.error(
            "ADMIN DASHBOARD ERROR:",
            error
        );

        res.json({
            success: false,
            message: error.message
        });
    }
};


export {
    loginAdmin,
    appointmentsAdmin,
    appointmentCancel,
    addDoctor,
    allDoctors,
    removeDoctor,
    adminDashboard
};
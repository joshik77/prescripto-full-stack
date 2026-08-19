import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";

import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";


// ======================================================
// CLOUDINARY CONFIG
// ======================================================

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
    secure: true
});


// ======================================================
// ADMIN LOGIN
// ======================================================

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

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================================
// GET ALL APPOINTMENTS
// ======================================================

const appointmentsAdmin = async (req, res) => {

    try {

        const appointments =
            await appointmentModel.find({});

        return res.json({
            success: true,
            appointments
        });

    } catch (error) {

        console.error(
            "ADMIN APPOINTMENTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================================
// CANCEL APPOINTMENT
// ======================================================

const appointmentCancel = async (req, res) => {

    try {

        const { appointmentId } = req.body;

        if (!appointmentId) {

            return res.status(400).json({
                success: false,
                message: "Appointment ID is required"
            });
        }

        await appointmentModel.findByIdAndUpdate(
            appointmentId,
            {
                cancelled: true
            }
        );

        return res.json({
            success: true,
            message: "Appointment Cancelled"
        });

    } catch (error) {

        console.error(
            "ADMIN CANCEL APPOINTMENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================================
// CLOUDINARY UNSIGNED DOCTOR IMAGE UPLOAD
// ======================================================

const uploadDoctorImage = (buffer) => {

    return new Promise((resolve, reject) => {

        console.log(
            "=============================================="
        );

        console.log(
            "CLOUDINARY UNSIGNED UPLOAD START"
        );

        console.log(
            "=============================================="
        );

        console.log(
            "Cloud name:",
            process.env.CLOUDINARY_NAME
        );

        console.log(
            "Upload preset:",
            "prescripto_doctors"
        );

        console.log(
            "Buffer exists:",
            !!buffer
        );

        console.log(
            "Buffer size:",
            buffer?.length
        );


        if (!buffer) {

            reject(
                new Error("Image buffer is missing")
            );

            return;
        }


        const stream =
            cloudinary.uploader.unsigned_upload_stream(

                "prescripto_doctors",

                {
                    resource_type: "image"
                },

                (error, result) => {

                    if (error) {

                        console.error(
                            "=============================================="
                        );

                        console.error(
                            "CLOUDINARY UNSIGNED UPLOAD ERROR"
                        );

                        console.error(
                            "=============================================="
                        );

                        console.error(
                            "Message:",
                            error?.message
                        );

                        console.error(
                            "HTTP Code:",
                            error?.http_code
                        );

                        console.error(
                            "Name:",
                            error?.name
                        );

                        console.error(
                            "Full Error:",
                            error
                        );

                        console.error(
                            "=============================================="
                        );

                        reject(error);

                        return;
                    }


                    console.log(
                        "=============================================="
                    );

                    console.log(
                        "CLOUDINARY UPLOAD SUCCESS"
                    );

                    console.log(
                        "=============================================="
                    );

                    console.log(
                        "Secure URL:",
                        result?.secure_url
                    );

                    console.log(
                        "Public ID:",
                        result?.public_id
                    );

                    console.log(
                        "Format:",
                        result?.format
                    );

                    console.log(
                        "Resource type:",
                        result?.resource_type
                    );

                    console.log(
                        "=============================================="
                    );


                    resolve(result);
                }
            );


        stream.on(
            "error",
            (streamError) => {

                console.error(
                    "=============================================="
                );

                console.error(
                    "CLOUDINARY STREAM ERROR"
                );

                console.error(
                    "=============================================="
                );

                console.error(
                    "Message:",
                    streamError?.message
                );

                console.error(
                    "Full Error:",
                    streamError
                );

                console.error(
                    "=============================================="
                );

                reject(streamError);
            }
        );


        stream.end(buffer);
    });
};


// ======================================================
// ADD DOCTOR
// ======================================================

const addDoctor = async (req, res) => {

    try {

        console.log(
            "=============================================="
        );

        console.log(
            "ADD DOCTOR REQUEST"
        );

        console.log(
            "=============================================="
        );

        console.log(
            "Body:",
            req.body
        );

        console.log(
            "File exists:",
            !!req.file
        );


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

            console.log(
                "File buffer exists:",
                !!req.file.buffer
            );

            console.log(
                "File buffer size:",
                req.file.buffer?.length
            );
        }


        console.log(
            "=============================================="
        );


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


        // ==================================================
        // VALIDATION
        // ==================================================

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


        if (!imageFile) {

            return res.status(400).json({

                success: false,

                message: "Doctor image is required"

            });
        }


        if (!imageFile.buffer) {

            return res.status(400).json({

                success: false,

                message: "Image buffer is missing"

            });
        }


        if (!validator.isEmail(email)) {

            return res.status(400).json({

                success: false,

                message: "Please enter a valid email"

            });
        }


        if (password.length < 8) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter a strong password"

            });
        }


        // ==================================================
        // CHECK EXISTING DOCTOR
        // ==================================================

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


        // ==================================================
        // HASH PASSWORD
        // ==================================================

        const salt =
            await bcrypt.genSalt(10);

        const hashedPassword =
            await bcrypt.hash(
                password,
                salt
            );


        // ==================================================
        // CLOUDINARY IMAGE UPLOAD
        // ==================================================

        console.log(
            "Uploading doctor image to Cloudinary..."
        );


        let imageUpload;


        try {

            imageUpload =
                await uploadDoctorImage(
                    imageFile.buffer
                );

        } catch (cloudinaryError) {

            console.error(
                "=============================================="
            );

            console.error(
                "ADD DOCTOR CLOUDINARY FAILURE"
            );

            console.error(
                "=============================================="
            );

            console.error(
                "Message:",
                cloudinaryError?.message
            );

            console.error(
                "HTTP Code:",
                cloudinaryError?.http_code
            );

            console.error(
                "Name:",
                cloudinaryError?.name
            );

            console.error(
                "Full Error:",
                cloudinaryError
            );

            console.error(
                "=============================================="
            );


            return res.status(500).json({

                success: false,

                message:
                    cloudinaryError?.message ||
                    "Cloudinary image upload failed"

            });
        }


        if (
            !imageUpload ||
            !imageUpload.secure_url
        ) {

            return res.status(500).json({

                success: false,

                message:
                    "Cloudinary returned no image URL"

            });
        }


        const imageUrl =
            imageUpload.secure_url;


        console.log(
            "Cloudinary image URL:",
            imageUrl
        );


        // ==================================================
        // PARSE ADDRESS
        // ==================================================

        let parsedAddress;


        try {

            parsedAddress =
                typeof address === "string"
                    ? JSON.parse(address)
                    : address;

        } catch (error) {

            console.error(
                "ADDRESS PARSE ERROR:",
                error
            );

            return res.status(400).json({

                success: false,

                message:
                    "Invalid address format"

            });
        }


        // ==================================================
        // CREATE DOCTOR
        // ==================================================

        const doctorData = {

            name,

            email,

            image: imageUrl,

            password: hashedPassword,

            speciality,

            degree,

            experience,

            about,

            fees: Number(fees),

            address: parsedAddress,

            date: Date.now()

        };


        const newDoctor =
            new doctorModel(doctorData);


        await newDoctor.save();


        console.log(
            "=============================================="
        );

        console.log(
            "DOCTOR SUCCESSFULLY ADDED"
        );

        console.log(
            "=============================================="
        );


        return res.json({

            success: true,

            message: "Doctor Added"

        });


    } catch (error) {

        console.error(
            "=============================================="
        );

        console.error(
            "ADD DOCTOR ERROR"
        );

        console.error(
            "=============================================="
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
            "=============================================="
        );


        return res.status(500).json({

            success: false,

            message:
                error?.message ||
                "Failed to add doctor"

        });
    }
};


// ======================================================
// GET ALL DOCTORS
// ======================================================

const allDoctors = async (req, res) => {

    try {

        const doctors =
            await doctorModel
                .find({})
                .select("-password");

        return res.json({

            success: true,

            doctors

        });

    } catch (error) {

        console.error(
            "ALL DOCTORS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message

        });
    }
};


// ======================================================
// CHANGE DOCTOR AVAILABILITY
// ======================================================

const changeAvailability = async (req, res) => {

    try {

        console.log(
            "=============================================="
        );

        console.log(
            "CHANGE AVAILABILITY REQUEST"
        );

        console.log(
            "=============================================="
        );

        console.log(
            "Request body:",
            req.body
        );


        const { docId } = req.body;


        console.log(
            "Doctor ID received:",
            docId
        );


        if (!docId) {

            return res.status(400).json({

                success: false,

                message:
                    "Doctor ID is required"

            });
        }


        const doctor =
            await doctorModel.findById(docId);


        if (!doctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found"

            });
        }


        doctor.available =
            !doctor.available;


        await doctor.save();


        console.log(
            "Doctor availability changed:",
            doctor.available
        );


        return res.json({

            success: true,

            message:
                "Doctor availability changed"

        });


    } catch (error) {

        console.error(
            "=============================================="
        );

        console.error(
            "CHANGE AVAILABILITY ERROR"
        );

        console.error(
            "=============================================="
        );

        console.error(
            "Message:",
            error?.message
        );

        console.error(
            "Full Error:",
            error
        );

        console.error(
            "=============================================="
        );


        return res.status(500).json({

            success: false,

            message:
                error?.message ||
                "Failed to change availability"

        });
    }
};


// ======================================================
// REMOVE DOCTOR
// ======================================================

const removeDoctor = async (req, res) => {

    try {

        console.log(
            "=============================================="
        );

        console.log(
            "REMOVE DOCTOR REQUEST"
        );

        console.log(
            "=============================================="
        );

        console.log(
            "Request body:",
            req.body
        );


        /*
         * IMPORTANT:
         *
         * AdminContext.jsx sends:
         *
         * {
         *     docId: doctor._id
         * }
         *
         * Therefore the backend MUST read docId.
         */

        const { docId } = req.body;


        console.log(
            "Doctor ID received:",
            docId
        );


        // ==================================================
        // CHECK ID EXISTS
        // ==================================================

        if (!docId) {

            console.error(
                "Doctor ID is missing"
            );

            return res.status(400).json({

                success: false,

                message:
                    "Doctor ID is required"

            });
        }


        // ==================================================
        // CHECK VALID MONGODB OBJECT ID
        // ==================================================

        if (!doctorModel.schema.path("_id").cast(docId)) {

            console.error(
                "Invalid Doctor ID:",
                docId
            );

            return res.status(400).json({

                success: false,

                message:
                    "Invalid Doctor ID"

            });
        }


        // ==================================================
        // FIND DOCTOR
        // ==================================================

        const doctor =
            await doctorModel.findById(docId);


        if (!doctor) {

            console.error(
                "Doctor not found:",
                docId
            );

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found"

            });
        }


        console.log(
            "Doctor found:",
            doctor.name
        );


        // ==================================================
        // DELETE DOCTOR
        // ==================================================

        await doctorModel.findByIdAndDelete(
            docId
        );


        console.log(
            "Doctor successfully deleted:",
            docId
        );

        console.log(
            "=============================================="
        );


        return res.json({

            success: true,

            message:
                "Doctor removed successfully"

        });


    } catch (error) {

        console.error(
            "=============================================="
        );

        console.error(
            "REMOVE DOCTOR ERROR"
        );

        console.error(
            "=============================================="
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
            "Code:",
            error?.code
        );

        console.error(
            "Full Error:",
            error
        );

        console.error(
            "=============================================="
        );


        return res.status(500).json({

            success: false,

            message:
                error?.message ||
                "Failed to remove doctor"

        });
    }
};


// ======================================================
// ADMIN DASHBOARD
// ======================================================

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


        return res.json({

            success: true,

            dashData

        });


    } catch (error) {

        console.error(
            "ADMIN DASHBOARD ERROR:",
            error
        );


        return res.status(500).json({

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
    loginAdmin,
    appointmentsAdmin,
    appointmentCancel,
    addDoctor,
    allDoctors,
    changeAvailability,
    removeDoctor,
    adminDashboard
};
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
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

        console.log(error);

        return res.json({
            success: false,
            message: error.message
        });

    }
};


// API to get all appointments
const appointmentsAdmin = async (req, res) => {

    try {

        const appointments = await appointmentModel.find({});

        res.json({
            success: true,
            appointments
        });

    } catch (error) {

        console.log(error);

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
            { cancelled: true }
        );

        res.json({
            success: true,
            message: "Appointment Cancelled"
        });

    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: error.message
        });

    }

};


// API for adding Doctor
const addDoctor = async (req, res) => {

    try {

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

        // Check image
        if (!imageFile) {
            return res.json({
                success: false,
                message: "Image Not Selected"
            });
        }

        // Check all data
        if (
            !name ||
            !email ||
            !password ||
            !speciality ||
            !degree ||
            !experience ||
            !about ||
            !fees ||
            !address
        ) {
            return res.json({
                success: false,
                message: "Missing Details"
            });
        }

        // Validate email
        if (!validator.isEmail(email)) {
            return res.json({
                success: false,
                message: "Please enter a valid email"
            });
        }

        // Validate password
        if (password.length < 8) {
            return res.json({
                success: false,
                message: "Please enter a strong password"
            });
        }

        // Check duplicate doctor email
        const existingDoctor = await doctorModel.findOne({ email });

        if (existingDoctor) {
            return res.json({
                success: false,
                message: "Doctor with this email already exists"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(
            password,
            salt
        );

        // Convert image to Base64
        // This completely removes Cloudinary from Add Doctor.
        const imageBase64 =
            `data:${imageFile.mimetype};base64,` +
            imageFile.buffer.toString("base64");

        // Create doctor data
        const doctorData = {
            name,
            email,
            image: imageBase64,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees: Number(fees),
            address: JSON.parse(address),
            date: Date.now()
        };

        // Save doctor
        const newDoctor = new doctorModel(doctorData);

        await newDoctor.save();

        console.log("Doctor added successfully:", email);

        return res.json({
            success: true,
            message: "Doctor Added"
        });

    } catch (error) {

        console.log("ADD DOCTOR ERROR:", error);

        return res.json({
            success: false,
            message: error.message
        });

    }

};


// API to get all doctors
const allDoctors = async (req, res) => {

    try {

        const doctors = await doctorModel
            .find({})
            .select("-password");

        res.json({
            success: true,
            doctors
        });

    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: error.message
        });

    }

};


// API to get dashboard data
const adminDashboard = async (req, res) => {

    try {

        const doctors = await doctorModel.find({});
        const users = await userModel.find({});
        const appointments = await appointmentModel.find({});

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse()
        };

        res.json({
            success: true,
            dashData
        });

    } catch (error) {

        console.log(error);

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
    adminDashboard
};
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

const defaultWorkingHours = {
    sunday: {
        enabled: false,
        startTime: "10:00",
        endTime: "21:00"
    },
    monday: {
        enabled: true,
        startTime: "10:00",
        endTime: "21:00"
    },
    tuesday: {
        enabled: true,
        startTime: "10:00",
        endTime: "21:00"
    },
    wednesday: {
        enabled: true,
        startTime: "10:00",
        endTime: "21:00"
    },
    thursday: {
        enabled: true,
        startTime: "10:00",
        endTime: "21:00"
    },
    friday: {
        enabled: true,
        startTime: "10:00",
        endTime: "21:00"
    },
    saturday: {
        enabled: true,
        startTime: "10:00",
        endTime: "21:00"
    }
};


// API for doctor Login
const loginDoctor = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await doctorModel.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (isMatch) {

            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET
            );

            res.json({
                success: true,
                token
            });

        } else {

            res.json({
                success: false,
                message: "Invalid credentials"
            });
        }

    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// API to get doctor appointments
const appointmentsDoctor = async (req, res) => {

    try {

        const { docId } = req.body;

        const appointments =
            await appointmentModel.find({ docId });

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


// API to cancel appointment
const appointmentCancel = async (req, res) => {

    try {

        const {
            docId,
            appointmentId
        } = req.body;

        const appointmentData =
            await appointmentModel.findById(
                appointmentId
            );

        if (
            appointmentData &&
            appointmentData.docId === docId
        ) {

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
        }

        res.json({
            success: false,
            message: "Appointment not found"
        });

    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// API to mark appointment completed
const appointmentComplete = async (req, res) => {

    try {

        const {
            docId,
            appointmentId
        } = req.body;

        const appointmentData =
            await appointmentModel.findById(
                appointmentId
            );

        if (
            appointmentData &&
            appointmentData.docId === docId
        ) {

            await appointmentModel.findByIdAndUpdate(
                appointmentId,
                {
                    isCompleted: true
                }
            );

            return res.json({
                success: true,
                message: "Appointment Completed"
            });
        }

        res.json({
            success: false,
            message: "Appointment not found"
        });

    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// API to get all doctors list for Frontend
const doctorList = async (req, res) => {

    try {

        const doctors =
            await doctorModel
                .find({})
                .select(["-password", "-email"]);

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


// API to change doctor availability
const changeAvailablity = async (req, res) => {

    try {

        const { docId } = req.body;

        const docData =
            await doctorModel.findById(docId);

        if (!docData) {

            return res.json({
                success: false,
                message: "Doctor not found"
            });
        }

        await doctorModel.findByIdAndUpdate(
            docId,
            {
                available: !docData.available
            }
        );

        res.json({
            success: true,
            message: "Availability Changed"
        });

    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// API to get doctor profile
const doctorProfile = async (req, res) => {

    try {

        const { docId } = req.body;

        const profileData =
            await doctorModel
                .findById(docId)
                .select("-password");

        if (!profileData) {

            return res.json({
                success: false,
                message: "Doctor not found"
            });
        }

        const profileObject =
            profileData.toObject();

        if (
            !profileObject.workingHours ||
            Object.keys(
                profileObject.workingHours
            ).length === 0
        ) {

            profileObject.workingHours =
                defaultWorkingHours;
        }

        if (!profileObject.leaveDates) {
            profileObject.leaveDates = [];
        }

        res.json({
            success: true,
            profileData: profileObject
        });

    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// API to update doctor profile
const updateDoctorProfile = async (req, res) => {

    try {

        const {
            docId,
            fees,
            address,
            available,
            about,
            workingHours,
            leaveDates
        } = req.body;

        const doctor =
            await doctorModel.findById(docId);

        if (!doctor) {

            return res.json({
                success: false,
                message: "Doctor not found"
            });
        }

        if (workingHours) {

            const days =
                Object.keys(workingHours);

            for (const day of days) {

                const schedule =
                    workingHours[day];

                if (
                    schedule.enabled &&
                    (
                        !schedule.startTime ||
                        !schedule.endTime
                    )
                ) {

                    return res.json({
                        success: false,
                        message:
                            `Please select start and end time for ${day}`
                    });
                }

                if (
                    schedule.enabled &&
                    schedule.startTime >=
                    schedule.endTime
                ) {

                    return res.json({
                        success: false,
                        message:
                            `End time must be after start time for ${day}`
                    });
                }
            }
        }

        const updateData = {
            fees,
            address,
            available,
            about
        };

        if (workingHours) {
            updateData.workingHours =
                workingHours;
        }

        if (leaveDates) {

            updateData.leaveDates =
                [...new Set(leaveDates)];
        }

        await doctorModel.findByIdAndUpdate(
            docId,
            updateData
        );

        res.json({
            success: true,
            message:
                "Profile and schedule updated successfully"
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
const doctorDashboard = async (req, res) => {

    try {

        const { docId } = req.body;

        const appointments =
            await appointmentModel.find({ docId });

        let earnings = 0;

        appointments.forEach((item) => {

            if (
                item.isCompleted ||
                item.payment
            ) {

                earnings += item.amount;
            }
        });

        const patients = [];

        appointments.forEach((item) => {

            if (
                !patients.includes(
                    item.userId
                )
            ) {

                patients.push(
                    item.userId
                );
            }
        });

        const dashData = {

            earnings,

            appointments:
                appointments.length,

            patients:
                patients.length,

            latestAppointments:
                [...appointments].reverse()
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
    loginDoctor,
    appointmentsDoctor,
    appointmentCancel,
    doctorList,
    changeAvailablity,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile
};
import mongoose from "mongoose";

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

const doctorSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    image: {
        type: String,
        required: true
    },

    speciality: {
        type: String,
        required: true
    },

    degree: {
        type: String,
        required: true
    },

    experience: {
        type: String,
        required: true
    },

    about: {
        type: String,
        required: true
    },

    available: {
        type: Boolean,
        default: true
    },

    fees: {
        type: Number,
        required: true
    },

    slots_booked: {
        type: Object,
        default: {}
    },

    address: {
        type: Object,
        required: true
    },

    date: {
        type: Number,
        required: true
    },

    workingHours: {
        type: Object,
        default: () => defaultWorkingHours
    },

    leaveDates: {
        type: [String],
        default: []
    },

    rating: {
        type: Number,
        default: 0
    },

    reviewCount: {
        type: Number,
        default: 0
    }

}, {
    minimize: false
});

const doctorModel =
    mongoose.models.doctor ||
    mongoose.model(
        "doctor",
        doctorSchema
    );

export default doctorModel;
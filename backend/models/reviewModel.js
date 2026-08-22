import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true
    },

    docId: {
        type: String,
        required: true
    },

    appointmentId: {
        type: String,
        required: true,
        unique: true
    },

    userName: {
        type: String,
        required: true
    },

    userImage: {
        type: String,
        default: ""
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },

    date: {
        type: Number,
        default: Date.now
    }

});

const reviewModel =
    mongoose.models.review ||
    mongoose.model("review", reviewSchema);

export default reviewModel;
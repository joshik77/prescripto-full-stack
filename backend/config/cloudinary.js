import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = async () => {

    console.log("========== CLOUDINARY CONFIG ==========");

    console.log(
        "Cloud name:",
        process.env.CLOUDINARY_NAME
    );

    console.log(
        "API key exists:",
        !!process.env.CLOUDINARY_API_KEY
    );

    console.log(
        "API secret exists:",
        !!process.env.CLOUDINARY_SECRET_KEY
    );


    console.log("CLOUDINARY CHECK:", {
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  secret_exists: !!process.env.CLOUDINARY_SECRET_KEY
});

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET_KEY
    });

    try {

        const result = await cloudinary.api.ping();

        console.log(
            "CLOUDINARY PING SUCCESS:",
            result
        );

    } catch (error) {

        console.error(
            "========================================"
        );

        console.error(
            "CLOUDINARY PING FAILED"
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
            "========================================"
        );
    }

    console.log("=======================================");
};

export default connectCloudinary;
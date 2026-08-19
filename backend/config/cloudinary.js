import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = async () => {

    console.log("========== CLOUDINARY CONFIG ==========");

    const cloudName = process.env.CLOUDINARY_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_SECRET_KEY;

    console.log("Cloud name:", cloudName);
    console.log("API key exists:", !!apiKey);
    console.log("API secret exists:", !!apiSecret);

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
    });

    console.log(
        "Cloudinary upload URL:",
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
    );

    try {

        const result = await cloudinary.api.ping();

        console.log("========== CLOUDINARY PING SUCCESS ==========");
        console.log(result);
        console.log("=============================================");

    } catch (error) {

        console.error("========== CLOUDINARY PING FAILED ==========");
        console.error("Message:", error?.message);
        console.error("HTTP Code:", error?.http_code);
        console.error("Name:", error?.name);
        console.error("Error:", error?.error);
        console.error("Response:", error?.response);
        console.error(
            "Response Headers:",
            error?.response?.headers
        );
        console.error(
            "X-Cld-Error:",
            error?.response?.headers?.["x-cld-error"]
        );
        console.error("Full Error:", error);
        console.error("============================================");

    }

    console.log("============================================");
};

export default connectCloudinary;
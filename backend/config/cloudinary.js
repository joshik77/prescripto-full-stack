try {
    console.log("================================");
    console.log("UPLOADING DOCTOR IMAGE");
    console.log("File path:", imageFile?.path);
    console.log("File exists:", !!imageFile);
    console.log("File size:", imageFile?.size);
    console.log("File type:", imageFile?.mimetype);

    const imageUpload = await cloudinary.uploader.upload(
        imageFile.path,
        {
            resource_type: "image"
        }
    );

    console.log("========== CLOUDINARY UPLOAD SUCCESS ==========");
    console.log("Public ID:", imageUpload.public_id);
    console.log("Secure URL:", imageUpload.secure_url);
    console.log("===============================================");

    const imageUrl = imageUpload.secure_url;

    // Continue your existing doctor creation code here.

} catch (error) {
    console.error("========== CLOUDINARY UPLOAD ERROR ==========");

    console.error("Message:", error?.message);
    console.error("HTTP Code:", error?.http_code);
    console.error("Name:", error?.name);
    console.error("Error:", error?.error);
    console.error("Response:", error?.response);

    console.error(
        "Response Status:",
        error?.response?.status
    );

    console.error(
        "Response Data:",
        error?.response?.data
    );

    console.error(
        "Response Headers:",
        error?.response?.headers
    );

    console.error(
        "X-Cld-Error:",
        error?.response?.headers?.["x-cld-error"]
    );

    console.error("FULL ERROR:", error);

    console.error("============================================");

    return res.status(500).json({
        success: false,
        message: error?.message || "Cloudinary upload failed",
        cloudinary_error:
            error?.error?.message ||
            error?.response?.data?.error?.message ||
            null
    });
}
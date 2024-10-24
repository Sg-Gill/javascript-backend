import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
});

const uploadFileOnCloudinary = async (uploadedFilePath) => {
  try {
    if (!uploadedFilePath) return null;
    // check for null file
    const response = await cloudinary.uploader.upload(uploadedFilePath, {
      resource_type: "auto",
    });
    // file uploaded
    if(uploadedFilePath) fs.unlinkSync(uploadedFilePath)
    return response;
  } catch (error) {
    console.log(error);
    // if(uploadedFilePath) fs.unlinkSync(uploadedFilePath)
    // remove the uploaded file if the upload failed
    return null;
  }
};

// cloudinary.uploader.upload(
//   "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function (error, result) {
//     console.log(result);
//   }
// );

export { uploadFileOnCloudinary };

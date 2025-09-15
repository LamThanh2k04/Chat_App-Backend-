// import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
dotenv.config();



// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log(process.env.CLOUDINARY_CLOUD_NAME)
console.log(process.env.CLOUDINARY_API_KEY)
console.log(process.env.CLOUDINARY_API_SECRET)


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        console.log(file);
        if (file.fieldname === "imageFile") {
            return {
                folder: "avatars",
                allowed_formats: ["jpg", "png", "jpeg"],
            };
        }
        if (file.fieldname === "audioFile") {
            return {
                folder: "musics",
                resource_type: "auto",
                allowed_formats: ["mp3", "wav", "flac", "aac", "ogg", "m4a"],
            };
        }
        if (file.fieldname === "videoFile") {
            return {
                folder: "videos",
        resource_type: "video", 
        allowed_formats: ["mp4", "mov", "avi", "mkv", "webm"],
            };
        }

        return null;
    },
});

export const upload = multer({ storage });
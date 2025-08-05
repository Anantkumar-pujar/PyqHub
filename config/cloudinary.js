const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pyqhub_uploads', // Folder name in Cloudinary
    resource_type: 'raw', // Automatically detect resource type
    allowed_formats: ['pdf', 'docx', 'jpg', 'png'], // Extend as needed
     public_id: (req, file) => {
      const timestamp = Date.now();
      const originalName = file.originalname.replace(/\.[^/.]+$/, ""); // removes extension
      return `${timestamp}-${originalName}`;
    },
  },
});

module.exports = {
  cloudinary,
  storage,
};

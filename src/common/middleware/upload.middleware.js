const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AppError = require("../errors/app.error");

// Helper to ensure target upload directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Storage engine for Patient Appointment Documents (.pdf, .jpg, .jpeg, .png, .webp)
const appointmentDocumentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "public/uploads/appointment-documents");
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `apt-doc-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter for appointment documents
const appointmentDocumentFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Only PDF documents (.pdf) and images (.jpg, .png, .webp) are allowed for appointment documents", 400), false);
  }
};

module.exports.uploadAppointmentDocument = multer({
  storage: appointmentDocumentStorage,
  fileFilter: appointmentDocumentFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB Max
}).single("document");

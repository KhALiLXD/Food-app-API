const express = require('express');
const router = express.Router();
const multer = require('multer');
const { handleSseProgress, uploadImage } = require('../../controllers/upload-image');

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
        if (allowed.includes(file.mimetype)) return cb(null, true);
        cb(new Error('Invalid file type. Allowed: jpeg, png, webp, avif'));
    }
});

router.post('/upload-image', upload.single('image'), uploadImage);
router.get('/image-upload-progress/:imageId', handleSseProgress);

module.exports = router;
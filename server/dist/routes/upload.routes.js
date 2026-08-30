"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_js_1 = require("../config/multer.js");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const response_js_1 = require("../utils/response.js");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_js_1.authenticateToken, multer_js_1.upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            (0, response_js_1.sendError)(res, 'No image file uploaded or invalid file format.', 400);
            return;
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        (0, response_js_1.sendSuccess)(res, {
            url: fileUrl,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
        }, 'Image uploaded successfully');
    }
    catch (err) {
        (0, response_js_1.sendError)(res, err.message || 'File upload failed', 500);
    }
});
exports.default = router;

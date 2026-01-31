/**
 * Media Controller
 * File upload and management
 */

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const AWS = require('aws-sdk');
const config = require('../config');
const db = require('../utils/db');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
}).single('file');

/**
 * Upload media file
 */
exports.uploadMedia = asyncHandler(async (req, res) => {
  // Handle multer upload
  await new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err) reject(new ApiError(400, err.message));
      else resolve();
    });
  });

  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const { originalname, mimetype, buffer, size } = req.file;
  const ext = path.extname(originalname);
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;

  let processedBuffer = buffer;
  let width = null;
  let height = null;

  // Process images
  if (mimetype.startsWith('image/') && mimetype !== 'image/gif') {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    width = metadata.width;
    height = metadata.height;

    // Resize if too large
    if (width > 2000 || height > 2000) {
      processedBuffer = await image
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .toBuffer();
    }

    // Convert to WebP for better compression
    if (mimetype !== 'image/webp') {
      processedBuffer = await sharp(processedBuffer)
        .webp({ quality: 85 })
        .toBuffer();
    }
  }

  // Upload to S3
  const s3Key = `uploads/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${filename}`;
  
  await s3.upload({
    Bucket: config.aws.s3Bucket,
    Key: s3Key,
    Body: processedBuffer,
    ContentType: mimetype.startsWith('image/') ? 'image/webp' : mimetype,
    ACL: 'public-read'
  }).promise();

  const url = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${s3Key}`;

  // Save to database
  const [media] = await db('media')
    .insert({
      filename,
      original_name: originalname,
      mime_type: mimetype,
      size,
      width,
      height,
      url,
      s3_key: s3Key,
      uploaded_by: req.user.id,
      created_at: new Date()
    })
    .returning('*');

  res.status(201).json({
    message: 'File uploaded successfully',
    data: media
  });
});

/**
 * Get media by ID
 */
exports.getMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const media = await db('media').where({ id }).first();

  if (!media) {
    throw new ApiError(404, 'Media not found');
  }

  res.json({ data: media });
});

/**
 * Delete media
 */
exports.deleteMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const media = await db('media').where({ id }).first();

  if (!media) {
    throw new ApiError(404, 'Media not found');
  }

  // Delete from S3
  await s3.deleteObject({
    Bucket: config.aws.s3Bucket,
    Key: media.s3_key
  }).promise();

  // Delete from database
  await db('media').where({ id }).del();

  res.json({ message: 'Media deleted' });
});

/**
 * List all media (admin/editor)
 */
exports.listMedia = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type } = req.query;
  const offset = (page - 1) * limit;

  let query = db('media')
    .select('*')
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);

  if (type) {
    query = query.where('mime_type', 'like', `${type}%`);
  }

  const media = await query;

  res.json({
    data: media,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

// Validate required environment variables
const validateEnvVariables = () => {
  const required = ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "S3_BUCKET_NAME"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

// Validate env on module load
validateEnvVariables();

// Initialize S3 Client
export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Generate a random filename with extension based on mimetype
 * @param {string} mimeType - The MIME type of the file
 * @param {number} bytes - Number of random bytes to generate
 * @returns {string} Random filename with extension
 */
const generateRandomFileName = (mimeType, bytes = 16) => {
  const randomName = crypto.randomBytes(bytes).toString("hex");
  const extension = mimeType.split("/")[1]; // e.g., "image/jpeg" -> "jpeg"
  return `${randomName}.${extension}`;
};

/**
 * Upload a file to AWS S3
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} mimeType - The MIME type of the file
 * @returns {Promise<string>} The public URL of the uploaded file
 * @throws {Error} If upload fails
 */
export const uploadToS3 = async (fileBuffer, mimeType) => {
  try {
    if (!fileBuffer) {
      throw new Error("File buffer is required");
    }

    if (!mimeType) {
      throw new Error("MIME type is required");
    }

    const fileName = generateRandomFileName(mimeType);
    const bucketName = process.env.S3_BUCKET_NAME;

    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: mimeType,
      // Note: ACL "public-read" is deprecated. Instead, configure bucket policy
      // or use CloudFront for public access
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    // Construct the S3 URL
    const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    return s3Url;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

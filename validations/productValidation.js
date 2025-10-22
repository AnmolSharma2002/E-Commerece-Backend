import { body } from "express-validator";

/**
 * Validation rules for creating a product
 */
export const createProductValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Product name must be between 3 and 100 characters")
    .matches(/^[a-zA-Z0-9\s\-_.,()]+$/)
    .withMessage("Product name contains invalid characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0.01 })
    .withMessage("Price must be a positive number greater than 0")
    .toFloat(),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Category must be between 2 and 50 characters")
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage("Category contains invalid characters"),
];

/**
 * Validation rules for file upload (image)
 */
export const validateProductImage = (req, res, next) => {
  const file = req.file;

  // Image is optional
  if (!file) {
    return next();
  }

  // Validate file type
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: "Invalid file type. Only JPEG, PNG, and WebP images are allowed",
    });
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: "File size too large. Maximum size is 5MB",
    });
  }

  next();
};

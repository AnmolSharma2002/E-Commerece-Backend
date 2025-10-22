import express from "express";
import multer from "multer";
import * as productController from "#controllers/productController.js";
import {
  createProductValidation,
  validateProductImage,
} from "#validations/productValidation.js";
import { validate } from "#validations/validationMiddleware.js";

const router = express.Router();

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// POST /api/products - Create a new product
router.post(
  "/",
  upload.single("image"),
  validateProductImage,
  createProductValidation,
  validate,
  productController.createProduct
);

export default router;

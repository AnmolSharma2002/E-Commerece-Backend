import Product from "#models/Product.js";
import { uploadToS3 } from "#utils/s3.js";

/**
 * Create a new product
 * @route POST /api/products
 * @access Public (add auth middleware later)
 */
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    const file = req.file;

    let imageURL = null;

    // Handle image upload to S3 if file is present
    if (file) {
      try {
        imageURL = await uploadToS3(file.buffer, file.mimetype);
      } catch (uploadError) {
        console.error("S3 Upload Error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to S3",
          error: process.env.NODE_ENV === "development" ? uploadError.message : undefined,
        });
      }
    }

    // Create product in database
    const product = await Product.create({
      name,
      price,
      description: description || "",
      category,
      image: imageURL,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (err) {
    console.error("Product Creation Error:", err);

    // Handle mongoose validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Database validation error",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product already exists",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters long"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0.01, "Price must be greater than 0"],
      validate: {
        validator: function (value) {
          return value > 0;
        },
        message: "Price must be a positive number",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      minlength: [2, "Category must be at least 2 characters long"],
      maxlength: [50, "Category cannot exceed 50 characters"],
      lowercase: true,
    },
    image: {
      type: String,
      default: null,
      validate: {
        validator: function (value) {
          if (!value) return true;
          // Validate URL format
          return /^https?:\/\/.+/.test(value);
        },
        message: "Image must be a valid URL",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add indexes for better query performance
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for formatted price
productSchema.virtual("formattedPrice").get(function () {
  return `$${this.price.toFixed(2)}`;
});

export default mongoose.model("Product", productSchema);


import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    barcode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    productName: {
      type: String,
      default: ""
    },

    brand: {
      type: String,
      default: ""
    },

    imageUrl: {
      type: String,
      default: ""
    },

    quantity: {
      type: String,
      default: ""
    },

    mrp: {
      type: Number,
      default: null,
      min: 0
    },

    dataSource: {
      type: String,
      default: "Open Food Facts"
    },

    lastFetchedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;

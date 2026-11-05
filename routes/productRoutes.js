
import express from "express";
import Product from "../models/product.js";

const router = express.Router();

// Get product details using barcode
router.get("/:barcode", async (req, res) => {
  try {
    const { barcode } = req.params;

    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: "Barcode is required",
      });
    }

    // Check MongoDB cache first
    const cachedProduct = await Product.findOne({ barcode });

    if (cachedProduct) {
      return res.status(200).json({
        success: true,
        source: "MongoDB",
        product: cachedProduct,
      });
    }

    // Search Open Food Facts
    const response = await fetch(
  `https://world.openfoodfacts.org/api/v3/product/${encodeURIComponent(barcode)}.json?fields=product_name,brands,image_url,quantity`,
  {
    headers: {
      "User-Agent": "BarcodeBillingApp/1.0 (contact: manojjagan2005@gmail.com)",
      "Accept": "application/json",
    },
  }
);
   console.log("Open Food Facts status:", response.status);

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: "Product database is temporarily unavailable",
      });
    }

    const data = await response.json();

console.log(
  "Open Food Facts response:",
  JSON.stringify(data, null, 2)
);

// Check whether product exists
if (!data.product || Object.keys(data.product).length === 0) {
  return res.status(404).json({
    success: false,
    message: "Product not found",
  });
}

const details = data.product;

    // Save the retrieved product in MongoDB
    const product = await Product.create({
      barcode,
      productName: details.product_name || "",
      brand: details.brands || "",
      imageUrl: details.image_url || "",
      quantity: details.quantity || "",
      mrp: null,
      dataSource: "Open Food Facts",
      lastFetchedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      source: "Open Food Facts",
      product,
    });
  } catch (error) {
    console.error("Product lookup error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching product details",
    });
  }
});


// Update product MRP
router.patch("/:barcode/mrp", async (req, res) => {
  try {
    const { barcode } = req.params;
    const { mrp } = req.body;

    // Validate MRP
    if (
      mrp === undefined ||
      mrp === null ||
      mrp === "" ||
      !Number.isFinite(Number(mrp)) ||
      Number(mrp) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid MRP",
      });
    }

    // Find product and update MRP
    const product = await Product.findOneAndUpdate(
      { barcode },
      { $set: { mrp: Number(mrp) } },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "MRP updated successfully",
      product,
    });
  } catch (error) {
    console.error("MRP update error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update MRP",
    });
  }
});


export default router;

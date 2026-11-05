
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Connect MongoDB before handling API requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Barcode Scanner API is running!",
  });
});

export default app;

import express from "express";
import Sale from "../models/sale.js";

const router = express.Router();

// Record a new sale / checkout bill
router.post("/", async (req, res) => {
  try {
    const {
      invoiceNumber,
      items,
      totalAmount,
      itemsCount,
      paymentMethod,
      customerName,
      customerPhone,
    } = req.body;

    if (!items || items.length === 0 || totalAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Items and total amount are required",
      });
    }

    const invNum =
      invoiceNumber ||
      `INV-${Date.now().toString().slice(-6)}`;

    const sale = await Sale.create({
      invoiceNumber: invNum,
      items,
      totalAmount: Number(totalAmount),
      itemsCount: itemsCount || items.reduce((acc, i) => acc + (i.quantity || 1), 0),
      paymentMethod: paymentMethod || "Cash",
      customerName: customerName || "Walk-in Customer",
      customerPhone: customerPhone || "",
      date: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Sale recorded successfully",
      sale,
    });
  } catch (error) {
    console.error("Sale recording error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to record sale",
    });
  }
});

// Get all sales
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });

    // Calculate today's summary
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaySales = sales.filter((s) => new Date(s.createdAt) >= startOfToday);
    const todayTotal = todaySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const todayItemsCount = todaySales.reduce((sum, s) => sum + (s.itemsCount || 0), 0);

    return res.status(200).json({
      success: true,
      sales,
      todaySummary: {
        totalAmount: todayTotal,
        billsCount: todaySales.length,
        itemsCount: todayItemsCount,
      },
    });
  } catch (error) {
    console.error("Fetch sales error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sales",
    });
  }
});

export default router;


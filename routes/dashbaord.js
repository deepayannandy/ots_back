require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../utils/verifyToken");
const workOrderModel = require("../models/workOrderModel");

router.get("/getDashboardData", verifyToken, async (req, res) => {
  try {
    const workOrderModels = await workOrderModel
      .find({ isVisible: true })
      .populate("tubeSheet")
      .populate("phaseData.phaseData")
      .exec();
    return res.status(200).json({
      Success: true,
      data: workOrderModels,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;

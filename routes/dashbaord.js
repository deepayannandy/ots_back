require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../utils/verifyToken");
const workOrderModel = require("../models/workOrderModel");
const reactorModel = require("../models/reactorModel");

router.get("/getDashboardData", verifyToken, async (req, res) => {
  try {
    const workOrderModels = await workOrderModel
      .find({ isVisible: true })
      .populate("tubeSheet")
      .populate("phaseData.phaseData")
      .exec();
    const numTubes = 187;
    const finalData = [];
    workOrderModels.forEach((wo_1) => {
      const wo = wo_1.toObject();
      wo.phaseData.forEach((phase) => {
        if (phase.phaseData != undefined) {
          console.log(
            Math.ceil(
              ((phase.phaseData.data.length - phase.phaseData.repeat) /
                numTubes) *
                100,
            ),
          );
          phase["progress"] = Math.ceil(
            ((phase.phaseData.data.length - phase.phaseData.repeat) /
              numTubes) *
              100,
          );
        }
      });
      finalData.push(wo);
    });
    return res.status(200).json({
      Success: true,
      data: finalData,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;

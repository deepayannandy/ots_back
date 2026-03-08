require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../utils/verifyToken");

router.get("/getDashboardData", verifyToken, async (req, res) => {
  try {
    // const tubeSheetCount = await tubeSheetModel.countDocuments();
    // const reactorCount = await reactorModel.countDocuments();
    // const cameraCount = await cameraModel.countDocuments();
    return res.status(200).json({
      Success: true,
      data: [
        {
          equipmentId: "OT187",
          type: "HEAT_EXCHANGER",
          clientName: "OT Software LLC",
          clientAddress: "Houston TX",
          projectStartTime: new Date("2026-02-03T06:30:00.000+00:00"),
          lastUpdatedTime: new Date("2026-02-03T12:10:00.000+00:00"),
          endTime: null,
          woId: "PO/2526/12112",
          phases: [
            {
              phaseName: "Initial Tube Sheet Inspection",
              progress: 100,
              phaseStartTime: new Date("2026-02-03T06:30:00.000+00:00"),
              lastUpdatedTime: new Date("2026-02-03T08:20:00.000+00:00"),
              endTime: new Date("2026-02-03T08:20:00.000+00:00"),
              surveyID: "69a725f32f458d4e8bd1f232",
            },
            {
              phaseName: "Eddy Current Or RFT Probe Detection",
              progress: 100,
              phaseStartTime: new Date("2026-02-03T08:30:00.000+00:00"),
              lastUpdatedTime: new Date("2026-02-03T10:50:00.000+00:00"),
              endTime: new Date("2026-02-03T10:50:00.000+00:00"),
              surveyID: "69a725f32f458w123dqweeq",
            },
            {
              phaseName: "Idle Time",
              phaseStartTime: new Date("2026-02-03T10:51:00.000+00:00"),
              lastUpdatedTime: null,
              endTime: new Date("2026-02-03T11:29:00.000+00:00"),
            },
            {
              phaseName: "Fish Tape",
              progress: 44,
              phaseStartTime: new Date("2026-02-03T11:30:00.000+00:00"),
              lastUpdatedTime: new Date("2026-02-03T12:10:00.000+00:00"),
              endTime: null,
              surveyID: "69a725f32f458d4e8bd1fc3d",
            },
            {
              phaseName: "Color Cap",
              progress: null,
              phaseStartTime: null,
              lastUpdatedTime: null,
              endTime: null,
              surveyID: null,
            },
          ],
        },
      ],
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;

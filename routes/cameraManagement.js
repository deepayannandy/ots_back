require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../utils/verifyToken");

const cameraModel = require("../models/cameraModel");

router.post("/createCamera", verifyToken, async (req, res) => {
  try {
    const newCamera = new cameraModel({
      name: req.body.name,
      macId: req.body.macId,
      ipAddress: req.body.ipAddress,
    });
    const savedCamera = await newCamera.save();
    return res.status(201).json({
      Success: true,
      message: "Camera added",
      id: savedCamera._id,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
router.get("/getAllCameras", verifyToken, async (req, res) => {
  try {
    const allCameras = await cameraModel.find();
    return res.status(200).json({
      Success: true,
      data: allCameras,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
router.get("/getAvailableCameras", verifyToken, async (req, res) => {
  try {
    const allCameras = await cameraModel.find({ isOccupied: false });
    return res.status(200).json({
      Success: true,
      data: allCameras,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;

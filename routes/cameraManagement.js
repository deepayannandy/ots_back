require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../utils/verifyToken");
const mqttService = require("../utils/mqtt");
const cameraModel = require("../models/cameraModel");

router.post("/createCamera", verifyToken, async (req, res) => {
  try {
    const newCamera = new cameraModel({
      name: req.body.name,
      macId: req.body.macId,
      ipAddress: req.body.ipAddress,
      rtspUrl: req.body.rtspUrl,
      controllerIp: req.body.controllerIp,
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

router.post("/setCameraAngle/:itemId", verifyToken, async (req, res) => {
  try {
    const selectedCamera = await cameraModel.findById(req.params.itemId);
    if (!selectedCamera)
      return res
        .status(404)
        .json({ error: "Selected Camera no longer available" });
    if (req.body.x != null && req.body.y != null) {
      selectedCamera.x = req.body.x;
      selectedCamera.y = req.body.y;
      mqttService.publish("motorControl/commands", {
        x: req.body.x,
        y: req.body.y,
      });
    }

    //Add the controller logic
    const savedCamera = await selectedCamera.save();
    return res.status(200).json({
      Success: true,
      data: savedCamera,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
router.get("/getCameraDetails/:itemId", verifyToken, async (req, res) => {
  try {
    const selectedCamera = await cameraModel.findById(req.params.itemId);
    if (!selectedCamera)
      return res
        .status(404)
        .json({ error: "Selected Camera no longer available" });
    return res.status(200).json({
      Success: true,
      data: selectedCamera,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
router.patch("/updateCamera/:itemId", verifyToken, async (req, res) => {
  try {
    const selectedCamera = await cameraModel.findById(req.params.itemId);
    if (!selectedCamera)
      return res
        .status(404)
        .json({ error: "Selected Camera no longer available" });
    if (req.body.status != null) {
      selectedCamera.status = req.body.status;
    }
    if (req.body.rtspUrl != null) {
      selectedCamera.rtspUrl = req.body.rtspUrl;
    }
    if (req.body.controllerIp != null) {
      selectedCamera.controllerIp = req.body.controllerIp;
    }
    const savedCamera = await selectedCamera.save();
    return res.status(200).json({
      Success: true,
      data: savedCamera,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;

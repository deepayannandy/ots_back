require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../utils/verifyToken");
const mongoose = require("mongoose");

const tubeSheetModel = require("../models/tubeSheetModel");
const cameraModel = require("../models/cameraModel");

router.post("/createTubeSheet", verifyToken, async (req, res) => {
  try {
    const newTubeSheet = new tubeSheetModel({
      equipmentId: req.body.equipmentId,
      clientName: req.body.clientName,
      clientAddress: req.body.clientAddress,
      type: req.body.type,
      reactorId: req.body.reactorId,
      projectStartDate: new Date(req.body.projectStartDate),
      material: req.body.material,
      totalNoOfTubes: req.body.totalNoOfTubes,
      typeOfPhases: req.body.typeOfPhases,
    });
    const savedTubeSheet = await newTubeSheet.save();
    return res.status(201).json({
      Success: true,
      message: "TubeSheet added",
      id: savedTubeSheet._id,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
router.get("/getAllTubeSheet", verifyToken, async (req, res) => {
  try {
    const allTubeSheet = await tubeSheetModel.find();
    return res.status(200).json({
      Success: true,
      data: allTubeSheet,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
router.get("/getSpecificTubeSheet/:itemId", verifyToken, async (req, res) => {
  try {
    const selectedTubeSheet = await tubeSheetModel.findById(req.params.itemId);
    if (!selectedTubeSheet)
      return res.status(404).json({ error: "TubeSheet not found" });
    return res.status(200).json({
      Success: true,
      data: selectedTubeSheet,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
router.patch("/addCameraDetails/:itemId", verifyToken, async (req, res) => {
  try {
    const selectedTubeSheet = await tubeSheetModel.findById(req.params.itemId);
    if (!selectedTubeSheet)
      return res.status(404).json({ error: "TubeSheet not found" });

    if (req.body.numberOfCameras)
      selectedTubeSheet.numberOfCameras = req.body.numberOfCameras;
    if (req.body.cameras) {
      selectedTubeSheet.cameras = req.body.cameras;
      var objectIdsToUpdate = [];
      const objectIds = selectedTubeSheet.cameras.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
      const result = await cameraModel.updateMany(
        { _id: { $in: objectIds } },
        {
          $set: {
            isOccupied: true,
            reactorId: selectedTubeSheet.reactorId
          }
        }
      );

      console.log(`${result.modifiedCount} documents updated.`);
    }
    if (
      selectedTubeSheet.numberOfCameras != null &&
      selectedTubeSheet.cameras != null
    )
      selectedTubeSheet.status = "CAMERA_CONFIGURED";
    await selectedTubeSheet.save();
    return res.status(200).json({
      Success: true,
      data: selectedTubeSheet,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
router.delete("/deleteTubeSheet/:itemId", verifyToken, async (req, res) => {
  try {
    const selectedTubeSheet = await tubeSheetModel.findById(req.params.itemId);
    if (!selectedTubeSheet)
      return res.status(404).json({ error: "TubeSheet not found" });
    selectedTubeSheet.isVisible = false;
    await selectedTubeSheet.save();
    return res.status(200).json({
      Success: true,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.patch(
  "/patchTubeSheetDetails/:itemId",
  verifyToken,
  async (req, res) => {
    try {
      const selectedTubeSheet = await tubeSheetModel.findById(
        req.params.itemId
      );
      if (!selectedTubeSheet)
        return res.status(404).json({ error: "TubeSheet not found" });

      if (req.body.reactorId) {
        selectedTubeSheet.reactorId = req.body.reactorId;
        selectedTubeSheet.status = "REACTOR_CREATED";
      }
      if (req.body.clientName) {
        selectedTubeSheet.clientName = req.body.clientName;
      }
      if (req.body.clientAddress) {
        selectedTubeSheet.clientAddress = req.body.clientAddress;
      }
      if (req.body.reactorId) {
        selectedTubeSheet.reactorId = req.body.reactorId;
      }
      if (req.body.projectStartDate) {
        selectedTubeSheet.projectStartDate = req.body.projectStartDate;
      }
      if (req.body.typeOfPhases) {
        selectedTubeSheet.typeOfPhases = req.body.typeOfPhases;
      }

      await selectedTubeSheet.save();
      return res.status(200).json({
        Success: true,
        data: selectedTubeSheet,
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
);

module.exports = router;

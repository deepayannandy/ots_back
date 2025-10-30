require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../utils/verifyToken");

const tubeSheetModel = require("../models/tubeSheetModel");

router.post("/createTubeSheet", verifyToken, async (req, res) => {
  try {
    const newTubeSheet = new tubeSheetModel({
      name: req.body.name,
      type: req.body.type,
      siteName: req.body.siteName,
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
router.patch("/patchTubeSheet/:itemId", verifyToken, async (req, res) => {
  try {
    const selectedTubeSheet = await tubeSheetModel.findById(req.params.itemId);
    if (!selectedTubeSheet)
      return res.status(404).json({ error: "TubeSheet not found" });
    if (req.body.reactorId) selectedTubeSheet.reactorId = req.body.reactorId;
    if (req.body.name) selectedTubeSheet.reactorId = req.body.name;
    if (req.body.status) selectedTubeSheet.status = req.body.status;
    if (req.body.siteName) selectedTubeSheet.siteName = req.body.siteName;
    if (req.body.type) selectedTubeSheet.type = req.body.type;
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

module.exports = router;

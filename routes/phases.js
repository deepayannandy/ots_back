require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../utils/verifyToken");

const phaseModel = require("../models/phaseModel");
const tubeSheetModel = require("../models/tubeSheetModel");
const { route } = require("./survey");

router.post("/createPhase", verifyToken, async (req, res) => {
  try {
    const samePhases = await phaseModel.findOne({
      phaseName: req.body.phaseName,
    });
    if (samePhases)
      return res
        .status(400)
        .json({ error: `${req.body.phaseName} already exist` });
    const newPhase = new phaseModel({
      phaseName: req.body.phaseName,
      configs: req.body.configs,
    });
    const savedPhase = await newPhase.save();
    return res.status(201).json({
      Success: true,
      message: "Phase added",
      id: savedPhase._id,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
router.get("/getAllPhases", verifyToken, async (req, res) => {
  try {
    const allPhases = await phaseModel.find({ isVisible: true });
    return res.status(200).json({
      Success: true,
      data: allPhases,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.patch("/updatePhase/:itemId", verifyToken, async (req, res) => {
  try {
    const selectedPhases = await phaseModel.findById(req.params.itemId);
    if (!selectedPhases)
      return res.status(404).json({ error: "Phase not found" });
    if (req.body.phaseName) selectedPhases.phaseName = req.body.phaseName;
    if (req.body.configs) selectedPhases.configs = req.body.configs;

    const updatedPhase = await selectedPhases.save();
    return res.status(200).json({
      Success: true,
      data: updatedPhase,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
router.delete("/removePhase/:itemId", verifyToken, async (req, res) => {
  try {
    const selectedPhases = await phaseModel.findById(req.params.itemId);
    if (!selectedPhases)
      return res.status(404).json({ error: "Phase not found" });
    const usedTubeSheet = await tubeSheetModel.find({
      typeOfPhases: { $in: [selectedPhases.phaseName] },
    });
    console.log(usedTubeSheet);
    if (usedTubeSheet.length > 0)
      return res
        .status(400)
        .json({ error: "This phase is already in use. Can't be deleted!" });
    selectedPhases.isVisible = false;
    const updatedPhase = await selectedPhases.save();
    return res.status(200).json({
      Success: true,
      data: updatedPhase,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;

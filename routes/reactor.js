require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../utils/verifyToken");

const reactorModel = require("../models/reactorModel");
const tubeSheetModel = require("../models/tubeSheetModel");

router.post("/createReactor", verifyToken, async (req, res) => {
  try {
    const newReactor = new reactorModel({
      config: req.body.config,
      tubes: req.body.tubes,
    });
    const savedReactor = await newReactor.save();
    return res
      .status(201)
      .json({ Success: true, message: "Reactor added", id: savedReactor._id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
router.patch("/patchReactor/:itemId", verifyToken, async (req, res) => {
  try {
    const selectedReactor = await reactorModel.findById(req.params.itemId);
    if (!selectedReactor)
      return res.status(404).json({ error: "Reactor not found" });
    if (req.body.config != null) selectedReactor.config = req.body.config;
    if (req.body.tubes != null) selectedReactor.tubes = req.body.tubes;
    const savedReactor = await selectedReactor.save();
    return res.status(200).json({
      Success: true,
      message: "Reactor Updated",
      data: savedReactor,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
router.get("/getReactorById/:itemId", verifyToken, async (req, res) => {
  try {
    const selectedReactor = await reactorModel.findById(req.params.itemId);
    if (!selectedReactor)
      return res.status(404).json({ error: "Reactor not found" });
    return res.status(200).json({
      Success: true,
      data: selectedReactor,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
router.delete("/deleteReactor/:itemId", verifyToken, async (req, res) => {
  try {
    const selectedReactor = await reactorModel.findById(req.params.itemId);
    if (!selectedReactor)
      return res.status(404).json({ error: "Reactor not found" });
    const linkedTubeSheets = await tubeSheetModel.findOne({
      reactorId: req.params.itemId,
    });
    if (linkedTubeSheets)
      return res
        .status(400)
        .json({ error: "Reactor is linked with one or more tubeSheets" });
    selectedReactor.isVisible = false;
    await selectedReactor.save();
    return res.status(200).json({
      Success: true,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;

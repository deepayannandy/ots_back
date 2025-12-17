require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../utils/verifyToken");

const reactorModel = require("../models/reactorModel");
const tubeSheetModel = require("../models/tubeSheetModel");
const surveyReactorModel = require("../models/surveyReactor");

router.post("/createSurveyReactor", verifyToken, async (req, res) => {
  try {
    const selectedReactor = await reactorModel.findById(req.body.reactorId);
    if (!selectedReactor)
      return res.status(404).json({ error: "Reactor not found" });
    const newSurveyReactor = new surveyReactorModel({
      tubeSheetId: req.body.tubeSheetId,
      status: "INITIATED",
      surveyType: req.body.surveyType,
      reactorId: selectedReactor.reactorId,
    });
    const savedSurveyReactor = await newSurveyReactor.save();
    return res.status(201).json({
      Success: true,
      message: "Survey Reactor added",
      id: savedSurveyReactor._id,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.patch("/updateSurvey/:id", async (req, res) => {
  try {
    const selectedSurveyReactor = await surveyReactorModel.findOne({
      reactorId: req.params.id,
    });
    console.log(selectedSurveyReactor);
    if (!selectedSurveyReactor)
      return res.status(404).json({ error: "Reactor not found" });
    console.log(selectedSurveyReactor);
    if (req.body.detection != null) {
      const data = req.body.detection;
      data.timeStamp = new Date();
      data.tubeId = parseInt(data.tubeId) - 1;
      selectedSurveyReactor.data.push(data);
      console.log(data);
      console.log(selectedSurveyReactor);
    }

    const savedReactor = await selectedSurveyReactor.save();
    return res.status(200).json({
      Success: true,
      message: "Reactor Updated",
      data: savedReactor,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.get("/getSurveyData/:itemId", verifyToken, async (req, res) => {
  try {
    const selectedReactor = await surveyReactorModel.findById(
      req.params.itemId
    );
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
router.patch("/resetAll", async (req, res) => {
  try {
    const selectedReactor = await surveyReactorModel.find();
    if (!selectedReactor)
      return res.status(404).json({ error: "Reactor not found" });
    selectedReactor[0].data = [];
    await selectedReactor[0].save();
    return res.status(200).json({
      Success: true,
      data: selectedReactor[0],
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
module.exports = router;

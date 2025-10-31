require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../utils/verifyToken");

const reactorModel = require("../models/reactorModel");
const tubeSheetModel = require("../models/tubeSheetModel");
const surveyReactorModel = require("../models/surveyReactor");

router.post("/createSurveyReactor", verifyToken, async (req, res) => {
  try {
    const newSurveyReactor = new surveyReactorModel({
      tubeSheetId: req.body.tubeSheetId,
      status: "INITIATED",
      surveyType: req.body.surveyType,
      reactorId: req.body.reactorId,
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
router.patch("/updateSurvey/:itemId", verifyToken, async (req, res) => {
  try {
    const selectedSurveyReactor = await surveyReactorModel.findById(
      req.params.itemId
    );
    if (!selectedSurveyReactor)
      return res.status(404).json({ error: "Reactor not found" });
    console.log(selectedSurveyReactor);
    if (req.body.detection != null) {
      const data = req.body.detection;
      data.timeStamp = new Date();
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
module.exports = router;

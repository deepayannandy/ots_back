require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../utils/verifyToken");

const reactorModel = require("../models/reactorModel");
const tubeSheetModel = require("../models/tubeSheetModel");
const surveyReactorModel = require("../models/surveyReactor");

router.post("/createSurveyReactor", verifyToken, async (req, res) => {
  try {
    const selectedTubeSheet = await tubeSheetModel.findById(
      req.body.tubeSheetId
    );
    if (!selectedTubeSheet)
      return res.status(404).json({ error: "Reactor not found" });
    const newSurveyReactor = new surveyReactorModel({
      tubeSheet: selectedTubeSheet._id,
      equipmentId: selectedTubeSheet.equipmentId,
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

router.patch("/updateSurvey/:id", async (req, res) => {
  try {
    const selectedSurveyReactor = await surveyReactorModel
      .find({
        equipmentId: req.params.id,
      })
      .sort({ _id: -1 })
      .limit(1);
    if (!selectedSurveyReactor)
      return res.status(404).json({ error: "Survey Reactor not found" });
    const selectedReactor = await reactorModel.findById(
      selectedSurveyReactor[0].reactorId
    );
    if (!selectedReactor)
      return res.status(404).json({ error: "Reactor not found" });
    console.log(selectedReactor);
    if (req.body.detection != null) {
      const data = req.body.detection;
      const isExisting = selectedSurveyReactor[0].data.find(
        (detection) => detection.tubeId === parseInt(data.tubeId) - 1
      );
      if (isExisting) {
        data.isDuplicate = true;
        selectedSurveyReactor[0].repeat = selectedSurveyReactor[0].repeat + 1;
      }
      data.tubeIdAsperLayout =
        selectedReactor.tubes[parseInt(data.tubeId) - 1].id;
      data.activity = `Detected in ${data.face} view`;
      data.timeStamp = new Date();
      data.tubeId = parseInt(data.tubeId) - 1;
      selectedSurveyReactor[0].data.push(data);
      console.log(data);
      console.log(selectedSurveyReactor);
    }

    const savedReactor = await selectedSurveyReactor[0].save();
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

router.post("/stopSurvey/:id", async (req, res) => {
  try {
    const selectedReactor = await surveyReactorModel.findById(req.params.id);
    if (!selectedReactor)
      return res.status(404).json({ error: "Reactor not found" });
    selectedReactor.status = "Completed";
    selectedReactor.endTimeStamp = new Date();
    await selectedReactor.save();
    return res.status(200).json({
      Success: true,
      data: selectedReactor,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
router.get("/getAllSurvey", async (req, res) => {
  try {
    const selectedReactors = await surveyReactorModel
      .find({
        status: "Completed",
      })
      .populate({
        path: "tubeSheet",
        options: { strictPopulate: false },
      });

    if (!selectedReactors)
      return res.status(404).json({ error: "No historical data found!" });
    return res.status(200).json({
      Success: true,
      data: selectedReactors,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
router.post("/stopSurvey/:id", async (req, res) => {
  try {
    const selectedReactor = await surveyReactorModel.findById(req.params.id);
    if (!selectedReactor)
      return res.status(404).json({ error: "Reactor not found" });
    selectedReactor.status = "Completed";
    selectedReactor.endTimeStamp = new Date();
    await selectedReactor.save();
    return res.status(200).json({
      Success: true,
      data: selectedReactor,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
module.exports = router;

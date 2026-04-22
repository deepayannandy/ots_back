require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../utils/verifyToken");

const reactorModel = require("../models/reactorModel");
const tubeSheetModel = require("../models/tubeSheetModel");
const surveyReactorModel = require("../models/surveyReactor");
const workOrderModel = require("../models/workOrderModel");
const upload = require("../utils/multerFileUploader");

const { link } = require("joi");

function getUniqueTubeCount(tubes) {
  var count = 0;
  tubes.map((tube) => {
    if (tube.isDuplicate != true) count++;
  });
  console.log(count);
  return count;
}

function validateDayNight(date) {
  const now = new Date(date);
  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

  const startMinutes = 8 * 60 + 0; // 08:00
  const endMinutes = 18 * 60 + 0; // 18:00

  return (
    currentTimeInMinutes >= startMinutes && currentTimeInMinutes < endMinutes
  );
}

router.post("/createSurveyReactor", verifyToken, async (req, res) => {
  try {
    const selectedTubeSheet = await tubeSheetModel.findById(
      req.body.tubeSheetId,
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
    selectedTubeSheet.surveyId = savedSurveyReactor._id;
    selectedTubeSheet.isUnderSurvey = true;
    const linkedWO = await workOrderModel.findOne({
      workOrderId: selectedTubeSheet.workOrder,
    });
    if (linkedWO) {
      linkedWO.status = "OnGoing";
      linkedWO.startTimeStamp
        ? linkedWO.startTimeStamp
        : (linkedWO.startTimeStamp = new Date());
      linkedWO.phaseData.forEach((phase) => {
        if (phase.phaseName === req.body.surveyType) {
          phase.phaseStatus = "OnGoing";
          phase.phaseStartTimeStamp = new Date();
          phase.phaseData = savedSurveyReactor._id;
        }
      });
      await linkedWO.save();
    }

    await selectedTubeSheet.save();
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
      selectedSurveyReactor[0].reactorId,
    );
    if (!selectedReactor)
      return res.status(404).json({ error: "Reactor not found" });
    console.log(selectedSurveyReactor);
    console.log(new Date() - selectedSurveyReactor[0].updatedAt);
    if (req.body.detection != null) {
      const data = req.body.detection;
      if (selectedSurveyReactor[0].surveyType == "COLOR_CAP_TRACKING") {
        console.log(data);
        const isExisting = selectedSurveyReactor[0].data.find(
          (detection) => detection.tubeId === parseInt(data.tubeId) - 1,
        );
        if (isExisting) {
          if (data.color == "white") {
            data.isDuplicate = true;
            selectedSurveyReactor[0].repeat =
              selectedSurveyReactor[0].repeat + 1;
            data.tubeIdAsperLayout =
              selectedReactor.tubes[parseInt(data.tubeId) - 1].id;
            data.activity = `Color ${data.color} Detected in ${data.face} view`;
            data.timeStamp = new Date();
            data.tubeId = parseInt(data.tubeId) - 1;
            selectedSurveyReactor[0].data.push(data);
          } else {
            const isSameExisting = selectedSurveyReactor[0].data.find(
              (detection) =>
                detection.tubeId === parseInt(data.tubeId) - 1 &&
                detection.color === data.color,
            );
            if (!isSameExisting) {
              data.isDuplicate = true;
              selectedSurveyReactor[0].repeat =
                selectedSurveyReactor[0].repeat + 1;
              data.tubeIdAsperLayout =
                selectedReactor.tubes[parseInt(data.tubeId) - 1].id;
              data.activity = `Color ${data.color} Detected in ${data.face} view`;
              data.timeStamp = new Date();
              data.tubeId = parseInt(data.tubeId) - 1;
              if (data.color != "white")
                selectedSurveyReactor[0].data.push(data);
            }
          }
        } else {
          data.tubeIdAsperLayout =
            selectedReactor.tubes[parseInt(data.tubeId) - 1].id;
          data.activity = `Color ${data.color} Detected in ${data.face} view`;
          data.timeStamp = new Date();
          data.tubeId = parseInt(data.tubeId) - 1;
          if (data.color != "white") selectedSurveyReactor[0].data.push(data);
        }
      } else {
        // if (new Date() - selectedSurveyReactor[0].updatedAt < 0) {
        //   console.log("Please wait for 10 seconds before updating again");
        //   return res.status(409).json({
        //     error: "Please wait for 10 seconds before updating again",
        //   });
        // }
        const isExisting = selectedSurveyReactor[0].data.filter(
          (detection) => detection.tubeId === parseInt(data.tubeId) - 1,
        ).length;
        data.tubeIdAsperLayout =
          selectedReactor.tubes[parseInt(data.tubeId) - 1].id;
        data.activity = `Detected in ${data.face} view`;
        data.timeStamp = new Date();
        data.tubeId = parseInt(data.tubeId) - 1;
        if (isExisting == 1) {
          data.isDuplicate = true;
          data.color = "blue";
          selectedSurveyReactor[0].repeat = selectedSurveyReactor[0].repeat + 1;
          selectedSurveyReactor[0].data.push(data);
        } else if (isExisting >= 2) {
          console.log("Duplicate detection for tube id ", data.tubeId);
          data.isDuplicate = true;
          data.color = "red";
          data.activity = `Detected in ${data.face} multiple times`;
          // selectedSurveyReactor[0].repeat = selectedSurveyReactor[0].repeat + 1;
          selectedSurveyReactor[0].errorLogs.push(data);
        } else {
          selectedSurveyReactor[0].data.push(data);
        }
      }
    }
    const savedReactor = await selectedSurveyReactor[0].save();
    return res.status(200).json({
      Success: true,
      message: "Reactor Updated",
      data: savedReactor._id,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.patch(
  "/advUpdateSurvey/:id",
  upload.single("evidenceImage"),
  async (req, res) => {
    try {
      const paths = `/public/uploads/${req.file.filename}`;
      const selectedSurveyReactor = await surveyReactorModel
        .find({
          equipmentId: req.params.id,
        })
        .sort({ _id: -1 })
        .limit(1);
      if (!selectedSurveyReactor)
        return res.status(404).json({ error: "Survey Reactor not found" });
      const selectedReactor = await reactorModel.findById(
        selectedSurveyReactor[0].reactorId,
      );
      if (!selectedReactor)
        return res.status(404).json({ error: "Reactor not found" });
      // console.log(selectedSurveyReactor);
      // console.log(new Date() - selectedSurveyReactor[0].updatedAt);
      if (req.body != null) {
        const data = JSON.parse(JSON.stringify(req.body));
        data.evidenceImage = paths;
        console.log("Data received: ", data);
        if (selectedSurveyReactor[0].surveyType == "HIGH_PRESSURE_CLEANING") {
          // console.log(data);
          const isExisting = selectedSurveyReactor[0].data.find(
            (detection) => detection.tubeId === parseInt(data.tubeId) - 1,
          );
          if (isExisting) {
            data.isDuplicate = true;
            selectedSurveyReactor[0].repeat =
              selectedSurveyReactor[0].repeat + 1;
            data.tubeIdAsperLayout =
              selectedReactor.tubes[parseInt(data.tubeId) - 1].id;
            data.activity = `High Pressure Cleaning Detected in ${data.face} view`;
            data.timeStamp = new Date();
            data.tubeId = parseInt(data.tubeId) - 1;
            data.color = "blue";
            selectedSurveyReactor[0].data.push(data);
          } else {
            data.tubeIdAsperLayout =
              selectedReactor.tubes[parseInt(data.tubeId) - 1].id;
            data.activity = `High Pressure Cleaning Detected in ${data.face} view`;
            data.timeStamp = new Date();
            data.tubeId = parseInt(data.tubeId) - 1;
            data.color = "green";
            selectedSurveyReactor[0].data.push(data);
          }
        } else if (
          selectedSurveyReactor[0].surveyType == "COLOR_CAP_TRACKING"
        ) {
          // console.log(data);
          const isExisting = selectedSurveyReactor[0].data.find(
            (detection) => detection.tubeId === parseInt(data.tubeId) - 1,
          );
          if (isExisting) {
            if (data.color == "white") {
              data.isDuplicate = true;
              selectedSurveyReactor[0].repeat =
                selectedSurveyReactor[0].repeat + 1;
              data.tubeIdAsperLayout =
                selectedReactor.tubes[parseInt(data.tubeId) - 1].id;
              data.activity = `Color ${data.color} Detected in ${data.face} view`;
              data.timeStamp = new Date();
              data.tubeId = parseInt(data.tubeId) - 1;
              selectedSurveyReactor[0].data.push(data);
            } else {
              const isSameExisting = selectedSurveyReactor[0].data.find(
                (detection) =>
                  detection.tubeId === parseInt(data.tubeId) - 1 &&
                  detection.color === data.color,
              );
              if (!isSameExisting) {
                data.isDuplicate = true;
                selectedSurveyReactor[0].repeat =
                  selectedSurveyReactor[0].repeat + 1;
                data.tubeIdAsperLayout =
                  selectedReactor.tubes[parseInt(data.tubeId) - 1].id;
                data.activity = `Color ${data.color} Detected in ${data.face} view`;
                data.timeStamp = new Date();
                data.tubeId = parseInt(data.tubeId) - 1;
                if (data.color != "white")
                  selectedSurveyReactor[0].data.push(data);
              }
            }
          } else {
            data.tubeIdAsperLayout =
              selectedReactor.tubes[parseInt(data.tubeId) - 1].id;
            data.activity = `Color ${data.color} Detected in ${data.face} view`;
            data.timeStamp = new Date();
            data.tubeId = parseInt(data.tubeId) - 1;
            if (data.color != "white") selectedSurveyReactor[0].data.push(data);
          }
        } else {
          data.tubeIdAsperLayout =
            selectedReactor.tubes[parseInt(data.tubeId) - 1].id;
          data.activity = `Detected in ${data.face} view`;
          data.timeStamp = new Date();
          data.tubeId = parseInt(data.tubeId) - 1;
          const lastEntryTime =
            selectedSurveyReactor[0].data.length > 0
              ? new Date(
                  selectedSurveyReactor[0].data[
                    selectedSurveyReactor[0].data.length - 1
                  ].timeStamp,
                )
              : null;
          if (
            new Date() - selectedSurveyReactor[0].updatedAt < 5000 ||
            (lastEntryTime && new Date() - lastEntryTime < 5000)
          ) {
            console.log(
              "Please wait for 5 seconds before updating again",
              data.tubeId,
            );
            data.isDuplicate = false;
            data.color = "orange";
            data.activity = `Detected within the cool-down period in ${data.face} view`;
            // selectedSurveyReactor[0].repeat = selectedSurveyReactor[0].repeat + 1;
            selectedSurveyReactor[0].errorLogs.push(data);
            await selectedSurveyReactor[0].save();
            return res.status(409).json({
              error: "Please wait for 10 seconds before updating again",
            });
          }
          const isExisting = selectedSurveyReactor[0].data.filter(
            (detection) => parseInt(detection.tubeId) === parseInt(data.tubeId),
          ).length;
          console.log(
            "Existing count for tube id ",
            data.tubeId,
            " is ",
            isExisting,
          );
          if (isExisting == 1) {
            data.isDuplicate = true;
            data.color = "blue";
            selectedSurveyReactor[0].repeat =
              selectedSurveyReactor[0].repeat + 1;
            selectedSurveyReactor[0].data.push(data);
          } else if (isExisting >= 2) {
            console.log("Duplicate detection for tube id ", data.tubeId);
            data.isDuplicate = true;
            data.color = "red";
            data.activity = `Detected in ${data.face} multiple times`;
            // selectedSurveyReactor[0].repeat = selectedSurveyReactor[0].repeat + 1;
            selectedSurveyReactor[0].errorLogs.push(data);
          } else {
            selectedSurveyReactor[0].data.push(data);
          }
        }
      }
      const savedReactor = await selectedSurveyReactor[0].save();
      return res.status(200).json({
        Success: true,
        message: "Reactor Updated",
        data: savedReactor._id,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ error: e.message });
    }
  },
);
function getHourlyTimestamps(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid start or end time provided");
  }

  if (start > end) {
    throw new Error("Start time must be before or equal to end time");
  }

  const timestamps = [];
  let current = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
    start.getHours(),
    start.getMinutes(),
    0,
    0,
  );

  while (current <= end) {
    timestamps.push(current.getTime());
    current.setMinutes(current.getMinutes() + 10);
  }
  timestamps.push(endTime.getTime());
  return timestamps;
}

router.get("/getSurveyData/:itemId", verifyToken, async (req, res) => {
  const interval = 60 * 60 * 1000; // 60 minutes in milliseconds
  try {
    const selectedReactor = await surveyReactorModel.findById(
      req.params.itemId,
    );
    if (!selectedReactor)
      return res.status(404).json({ error: "Reactor not found" });
    const progress = [];
    const endtime = selectedReactor.endTimeStamp ?? new Date();
    if ((endtime - selectedReactor.createdAt) / 60000 < 10) {
      console.log("Survey time an hour");
      progress.push({
        time: endtime,
        tubes: getUniqueTubeCount(selectedReactor.data),
        isDay: true,
      });
    } else {
      const timeStamps = getHourlyTimestamps(
        selectedReactor.createdAt,
        endtime,
      );
      timeStamps.forEach((element) => {
        let count = 0;
        selectedReactor.data.forEach((data) => {
          console.log(new Date(element), new Date(data.timeStamp));
          if (
            new Date(data.timeStamp).getTime() < element &&
            data.isDuplicate != true
          ) {
            count += 1;
            console.log(">>", data.timeStamp);
          }
        });
        progress.push({
          time: new Date(element),
          tubes: count,
          isDay: validateDayNight(new Date(element)),
        });
      });
    }
    if (selectedReactor.surveyType !== "COLOR_CAP_TRACKING") {
      selectedReactor.data.forEach((data) => {
        console.log(
          data.isDuplicate != true,
          new Date() - new Date(data.timeStamp) > 60000,
        );
        if (
          data.isDuplicate != true &&
          new Date() - new Date(data.timeStamp) > 60000
        ) {
          data.color = "green";
        }
      });
      await selectedReactor.save();
    }
    const data = selectedReactor.toObject();
    data.progress = progress;
    // data.data = data.data.reverse();
    return res.status(200).json({
      Success: true,
      data: data,
    });
  } catch (e) {
    console.log(e);
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
      return res.status(404).json({ error: "Survey not found" });
    const selectedTubeSheet = await tubeSheetModel.findById(
      selectedReactor.tubeSheet,
    );
    if (!selectedTubeSheet)
      return res.status(404).json({ error: "TubeSheet not found" });
    selectedReactor.status = "Completed";
    selectedReactor.endTimeStamp = new Date();
    selectedTubeSheet.isUnderSurvey = false;
    selectedTubeSheet.surveyId = null;
    await selectedReactor.save();
    await selectedTubeSheet.save();
    const linkedWO = await workOrderModel.findOne({
      workOrderId: selectedTubeSheet.workOrder,
    });
    if (linkedWO) {
      linkedWO.phaseData.forEach((phase, index) => {
        if (phase.phaseName === selectedReactor.surveyType) {
          phase.phaseStatus = "Completed";
          phase.phaseEndTimeStamp = new Date();
          if (index + 1 == linkedWO.phaseData.length) {
            linkedWO.status = "Completed";
            linkedWO.endTimeStamp = new Date();
          }
        }
      });
      await linkedWO.save();
    }
    return res.status(200).json({
      success: true,
      data: selectedReactor,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
router.post("/addComment/:surveyId", async (req, res) => {
  const selectedSurveyReactor = await surveyReactorModel.findById(
    req.params.surveyId,
  );
  if (!selectedSurveyReactor)
    return res.status(404).json({
      success: false,
      error: "Survey not found!",
    });
  try {
    comment = {
      tubeIdAsperLayout: req.body.tubeIdAsperLayout,
      comment: req.body.comment,
      timeStamp: new Date(),
    };
    selectedSurveyReactor.comments.push(comment);
    const updatedSurveyData = await selectedSurveyReactor.save();
    return res.status(201).json({ success: true, data: updatedSurveyData });
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
// router.post("/stopSurvey/:id", async (req, res) => {
//   try {
//     const selectedReactor = await surveyReactorModel.findById(req.params.id);
//     if (!selectedReactor)
//       return res.status(404).json({ error: "Reactor not found" });
//     selectedReactor.status = "Completed";
//     selectedReactor.endTimeStamp = new Date();
//     await selectedReactor.save();
//     return res.status(200).json({
//       Success: true,
//       data: selectedReactor,
//     });
//   } catch (e) {
//     return res.status(500).json({ error: e.message });
//   }
// });
module.exports = router;

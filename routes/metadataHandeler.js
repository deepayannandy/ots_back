require("dotenv").config();
const express = require("express");
const router = express.Router();
const upload = require("../utils/multerFileUploader");
const verifyToken = require("../utils/verifyToken");
const Metadata = require("../models/metadataModel");
const multer = require("multer");
const metadataModel = require("../models/metadataModel");

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = `/public/uploads/${req.file.filename}`;
    const metadata = new Metadata({
      name: req.body.reactorName,
      fileUrl,
    });
    await metadata.save();
    return res.status(200).json({
      Success: true,
      data: {
        id: metadata._id,
        name: metadata.name,
        fileUrl: metadata.fileUrl,
      },
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.get("/getAll", async (req, res) => {
  try {
    const metadataList = await Metadata.find({ isVisible: { $ne: false } });
    return res.status(200).json({
      Success: true,
      data: metadataList.reverse(),
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

//Soft delete metadata
router.delete("/deleteMetadata/:itemId", verifyToken, async (req, res) => {
  try {
    const selectedMetaData = await metadataModel.findById(req.params.itemId);
    if (!selectedMetaData)
      return res.status(404).json({ error: "Metadata not found" });
    selectedMetaData.isVisible = false;
    await selectedMetaData.save();
    return res.status(200).json({
      Success: true,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

//Get specific metadata
router.get("/:name", async (req, res) => {
  const reactorName = req.params.name;
  const selectedMetaData = await metadataModel.findOne({
    name: reactorName,
    isVisible: { $ne: false },
  });
  if (!selectedMetaData)
    return res
      .status(404)
      .json({ error: `No metadata found with name: ${reactorName}` });

  return res.status(200).json({ data: selectedMetaData });
});

//Multiple field handeler
const cpUpload = upload.fields([
  { name: "calibrationFile", maxCount: 1 },
  { name: "tubeDetectionFile", maxCount: 1 },
]);

//need to add multiple file upload
router.post("/calibrationUpload", cpUpload, async (req, res) => {
  try {
    const metadataName = req.body.reactorName;
    const selectedMetaData = await metadataModel.findOne({
      name: metadataName,
      isVisible: { $ne: false },
    });
    if (!selectedMetaData)
      return res
        .status(404)
        .json({ error: `No metadata found with name: ${metadataName}` });
    if (!req.files) {
      return res.status(400).json({ error: "No files uploaded." });
    }
    const calibrationFile = req.files["calibrationFile"]
      ? `/public/uploads/${req.files["calibrationFile"][0].filename}`
      : null;
    const tubeDetectionFile = req.files["tubeDetectionFile"]
      ? `/public/uploads/${req.files["tubeDetectionFile"][0].filename}`
      : null;

    selectedMetaData.calibrationFile = calibrationFile;
    selectedMetaData.tubeDetectionFile = tubeDetectionFile;
    const updateData = await selectedMetaData.save();
    res.status(200).json({
      metadata: updateData,
      message: "Calibration files uploaded successfully.",
      calibrationFile,
      tubeDetectionFile,
    });
  } catch (e) {
    res.status(200).json({
      error: e.message,
    });
  }
});

module.exports = router;

require("dotenv").config();
const express = require("express");
const router = express.Router();
const upload = require("../utils/multerFileUploader");
const Metadata = require("../models/metadataModel");

router.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = `/public/uploads/${req.file.filename}`;
    const metadata = new Metadata({
      name: req.body.reactorName,
      fileUrl,
    });
    metadata.save();
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
    const metadataList = await Metadata.find();
    return res.status(200).json({
      Success: true,
      data: metadataList,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;

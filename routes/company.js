require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../utils/verifyToken");
const upload = require("../utils/multerFileUploader");

const userModel = require("../models/userModel");
const companyModel = require("../models/constantModel");

router.post("/createCompany", upload.single("logo"), async (req, res) => {
  if (!req.file)
    return res
      .status(500)
      .json({ success: false, error: "Files Upload Failed" });

  const paths = `/public/uploads/${req.file.filename}`;
  try {
    const newCompany = new companyModel({
      companyName: req.body.companyName,
      email: req.body.email,
      address: req.body.address,
      numberOfLayouts: req.body.numberOfLayouts,
      logo: paths,
      endDate: req.body.endDate,
    });
    const savedCompany = await newCompany.save();
    return res
      .status(200)
      .json({ Success: true, message: "Company added", id: savedCompany._id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
router.get("/getCompanyDetails", async (req, res) => {
  try {
    const companyData = await companyModel.find().sort({ createdAt: -1 });
    if (!companyData)
      return res
        .status(404)
        .json({ success: false, message: "No Company details available" });

    return res.status(200).json({ Success: true, data: companyData[0] });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
module.exports = router;

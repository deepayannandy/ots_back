require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../utils/verifyToken");

const userModel = require("../models/userModel");
const companyModel = require("../models/constantModel");

router.post("/createCompany", verifyToken, async (req, res) => {
  const loginUser = await userModel.findById(req.tokendata.id);
  if (!loginUser) return res.status(401).json({ error: "User not found" });
  if (loginUser.role != "superAdmin")
    return res.status(403).json({ error: "User not have proper access" });
  try {
    const newCompany = new companyModel({
      companyName: req.body.companyName,
      email: req.body.email,
      address: req.body.address,
    });
    const savedCompany = await newCompany.save();
    return res
      .status(200)
      .json({ Success: true, message: "Company added", id: savedCompany._id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
module.exports = router;

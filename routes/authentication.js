require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const verifyToken = require("../utils/verifyToken");

const userModel = require("../models/userModel");

router.post("/login", async (req, res) => {
  const loginUser = await userModel.findOne({ email: req.body.email });
  console.log(loginUser);
  if (!loginUser) return res.status(404).json({ error: "User not found" });
  if (loginUser.password != req.body.password)
    return res.status(403).json({ error: "Authentication Failed!" });

  try {
    const token = jwt.sign(
      { id: loginUser._id, role: loginUser.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );
    return res.status(200).json({
      token,
      tokenType: "Bearer",
      userRole: loginUser.role,
      xpr: 86399,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/createAccount", async (req, res) => {
  const newUser = new userModel({
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
  });
  const savedUser = await newUser.save();
  return res.status(200).json({ Success: true, message: "User added" });
});

module.exports = router;

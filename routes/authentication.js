require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const verifyToken = require("../utils/verifyToken");
const { ACCOUNT_EXPIRED, EXPIRED_MESSAGE } = verifyToken;
const { verifyPassword } = require("../utils/password");

const userModel = require("../models/userModel");

const DAY_SECONDS = 24 * 60 * 60;

router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const loginUser = await userModel.findOne({
      email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    });
    if (!loginUser) return res.status(404).json({ error: "User not found" });
    if (!(await verifyPassword(req.body.password, loginUser.password)))
      return res.status(403).json({ error: "Authentication Failed!" });

    if (loginUser.isExpired())
      return res
        .status(403)
        .json({ code: ACCOUNT_EXPIRED, error: EXPIRED_MESSAGE });

    // Guests never get a token that outlives their validity window.
    let expiresIn = DAY_SECONDS;
    if (loginUser.isGuest && loginUser.validTill) {
      const remaining = Math.floor(
        (loginUser.validTill.getTime() - Date.now()) / 1000
      );
      expiresIn = Math.max(1, Math.min(DAY_SECONDS, remaining));
    }

    const token = jwt.sign(
      { id: loginUser._id, role: loginUser.role, isGuest: !!loginUser.isGuest },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    loginUser.lastLoginTime = new Date().toISOString();
    await loginUser.save();

    return res.status(200).json({
      token,
      tokenType: "Bearer",
      userRole: loginUser.role,
      fullName: loginUser.fullName,
      isGuest: !!loginUser.isGuest,
      validTill: loginUser.validTill || null,
      xpr: expiresIn - 1,
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

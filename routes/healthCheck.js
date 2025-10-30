require("dotenv").config();
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  return res.status(200).json({ Success: true, message: "I am running" });
});

module.exports = router;

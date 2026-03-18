require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../utils/verifyToken");

router.post("/searchActions", async (req, res) => {
  try {
    const actions = req.body;
    console.log("Getting actions");
    console.log(actions);
    return res.status(200).json({
      Success: true,
      data: actions,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;

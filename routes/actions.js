require("dotenv").config();
const express = require("express");
const router = express.Router();
const verifyToken = require("../utils/verifyToken");
const reactorModel = require("../models/reactorModel");
const mqttService = require("../utils/mqtt");

router.post("/searchActions", async (req, res) => {
  try {
    const actions = req.body;
    console.log("Getting actions");
    console.log(actions);
    const reactor = await reactorModel.findById(actions.reactorId);
    if (!reactor) {
      return res.status(404).json({ error: "Reactor not found" });
    }
    let index = 0;
    reactor.tubes.forEach((tube, index) => {
      if (tube.id.toString() === actions.holeId) {
        mqttService.publish("iiotcore/gotoTube", {
          tubeIndex: index,
          tubeId: actions.holeId,
        });
      }
    });
    return res.status(200).json({
      Success: true,
      data: actions,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;

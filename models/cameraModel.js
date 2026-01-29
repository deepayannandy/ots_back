const mongoos = require("mongoose");

const cameraSchema = new mongoos.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    macId: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    isOccupied: {
      type: Boolean,
      required: true,
      default: false,
    },
    reactorId: {
      type: String,
      required: false,
    },
    rtspUrl: {
      type: String,
      required: false,
    },
    controllerIp: {
      type: String,
      required: false,
    },
    x: {
      type: Number,
      required: false,
      default: 90,
    },
    y: {
      type: Number,
      required: false,
      default: 90,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoos.model("Camera", cameraSchema);

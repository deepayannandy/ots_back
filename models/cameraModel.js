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
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoos.model("Camera", cameraSchema);

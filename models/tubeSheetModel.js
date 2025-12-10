const mongoos = require("mongoose");

const tubeSheetSchema = new mongoos.Schema(
  {
    equipmentId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "HEAT_EXCHANGER",
        "BOILER",
        "EOEG_REACTOR",
        "GLYCOL_REACTOR",
        "AERYLIC_REACTOR",
        "GAS_COOLER",
      ],
    },
    clientName: {
      type: String,
      required: true,
    },
    clientAddress: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "TUBE_SHEET_CREATED",
      enum: [
        "TUBE_SHEET_CREATED",
        "CAMERA_CONFIGURED",
        "REACTOR_CREATED",
        "CAMERA_CALIBRATED",
        "IDLE",
        "UNDER_SURVEY",
      ],
    },
    reactorId: {
      type: String,
      required: false,
    },
    isVisible: {
      type: Boolean,
      required: true,
      default: true,
    },
    projectStartDate: {
      type: Date,
      required: true,
    },
    material: {
      type: String,
      required: true,
    },
    totalNoOfTubes: {
      type: Number,
      required: true,
    },
    numberOfCameras: {
      type: Number,
      required: false,
    },
    cameras: {
      type: Array,
      required: false,
    },
    typeOfPhases: {
      type: Array,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoos.model("tubeSheet", tubeSheetSchema);

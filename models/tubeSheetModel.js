const mongoos = require("mongoose");

const tubeSheetSchema = new mongoos.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["REACTOR", "HEAT_EXCHANGER"],
    },
    siteName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "SHAPE_CREATION",
      enum: ["SHAPE_CREATION", "SHAPE_CREATED", "UNDER_SURVEY", "IDLE"],
    },
    surveys: {
      type: Array,
      required: true,
      default: ["SOD", "WD"],
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
  },
  { timestamps: true }
);

module.exports = mongoos.model("tubeSheet", tubeSheetSchema);

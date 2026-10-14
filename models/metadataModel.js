const mongoos = require("mongoose");

const metadataSchema = new mongoos.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    calibrationFile: {
      type: String,
      required: false,
    },
    tubeDetectionFile: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoos.model("Metadata", metadataSchema);

const mongoos = require("mongoose");

const surveyReactorSchema = new mongoos.Schema(
  {
    tubeSheetId: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: false,
      enum: ["INITIATED", "ONGOING", "Completed"],
    },
    surveyType: {
      type: String,
      required: false,
    },
    reactorId: {
      type: String,
      required: false,
    },
    repeat: {
      type: Number,
      required: false,
      default: 0,
    },
    data: [
      {
        tubeId: {
          type: Number,
          required: false,
        },
        tubeIdAsperLayout: {
          type: String,
          required: false,
        },
        activity: {
          type: String,
          required: false,
        },
        color: {
          type: String,
          required: false,
        },
        timeStamp: {
          type: Date,
          required: false,
        },
        isDetected: {
          type: Boolean,
          required: false,
        },
        isDuplicate: {
          type: Boolean,
          required: false,
        },
        face: {
          type: String,
          required: false,
          enum: ["front", "back"],
        },
      },
    ],
    isVisible: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoos.model("surveyReactor", surveyReactorSchema);

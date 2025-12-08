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
    data: [
      {
        tubeId: {
          type: Number,
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

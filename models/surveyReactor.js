const mongoos = require("mongoose");

const surveyReactorSchema = new mongoos.Schema(
  {
    tubeSheet: {
      type: mongoos.Schema.Types.ObjectId,
      ref: "TubeSheet",
    },
    equipmentId: {
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
    endTimeStamp: {
      type: Date,
      required: false,
    },
    comments: [
      {
        tubeIdAsperLayout: {
          type: String,
          required: false,
        },
        comment: {
          type: String,
          required: false,
        },
        timeStamp: {
          type: Date,
          required: false,
        },
      },
    ],

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
        evidenceImage: {
          type: String,
          required: false,
        },
        evidenceExitImage: {
          type: String,
          required: false,
        },
        exitTimeStamp: {
          type: Date,
          required: false,
        },
        isExit: {
          type: Boolean,
          required: false,
        },
      },
    ],
    errorLogs: [
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
        evidenceImage: {
          type: String,
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
  { timestamps: true },
);

module.exports = mongoos.model("surveyReactor", surveyReactorSchema);

const mongoos = require("mongoose");

const workOrderSchema = new mongoos.Schema(
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
      default: "NotStarted",
      enum: ["NotStarted", "OnGoing", "Idle", "Completed"],
    },
    currentPhase: {
      type: String,
      required: false,
    },
    reactorId: {
      type: mongoos.Schema.Types.ObjectId,
      ref: "reactor",
    },
    workOrderId: {
      type: String,
      required: true,
    },
    startTimeStamp: {
      type: Date,
      required: false,
    },
    endTimeStamp: {
      type: Date,
      required: false,
    },
    isVisible: {
      type: Boolean,
      required: false,
      default: true,
    },
    phaseData: [
      {
        phaseName: {
          type: String,
          required: false,
        },
        phaseStartTimeStamp: {
          type: Date,
          required: false,
        },
        phaseEndTimeStamp: {
          type: Date,
          required: false,
        },
        phaseStatus: {
          type: String,
          required: false,
          default: "NotStarted",
          enum: ["NotStarted", "OnGoing", "Idle", "Completed"],
        },
        phaseData: {
          type: mongoos.Schema.Types.ObjectId,
          ref: "surveyReactor",
        },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoos.model("workOrder", workOrderSchema);

const mongoos = require("mongoose");

const phaseSchema = new mongoos.Schema(
  {
    phaseName: {
      type: String,
      required: false,
    },
    isVisible: {
      type: Boolean,
      required: true,
      default: true,
    },
    configs: {
      colorA: {
        type: String,
        required: false,
      },
      colorB: {
        type: String,
        required: false,
      },
      colorC: {
        type: String,
        required: false,
      },
      colorD: {
        type: String,
        required: false,
      },
      baseColor: {
        type: String,
        required: false,
      },
      fsdEntry: {
        type: String,
        required: false,
      },
      bsd: {
        type: String,
        required: false,
      },
      bsdExit: {
        type: String,
        required: false,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoos.model("Phases", phaseSchema);

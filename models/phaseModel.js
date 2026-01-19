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
        color: { type: String, required: false },
        abbreviation: { type: String, required: false },
      },
      colorB: {
        color: { type: String, required: false },
        abbreviation: { type: String, required: false },
      },
      colorC: {
        color: { type: String, required: false },
        abbreviation: { type: String, required: false },
      },
      colorD: {
        color: { type: String, required: false },
        abbreviation: { type: String, required: false },
      },
      baseColor: {
        color: { type: String, required: false },
        abbreviation: { type: String, required: false },
      },
      fsdEntry: {
        color: { type: String, required: false },
        abbreviation: { type: String, required: false },
      },
      bsd: {
        color: { type: String, required: false },
        abbreviation: { type: String, required: false },
      },
      bsdExit: {
        color: { type: String, required: false },
        abbreviation: { type: String, required: false },
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoos.model("Phases", phaseSchema);

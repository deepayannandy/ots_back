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
  },
  { timestamps: true },
);

module.exports = mongoos.model("Metadata", metadataSchema);

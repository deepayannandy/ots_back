const mongoos = require("mongoose");

const companySchema = new mongoos.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    numberOfLayouts: {
      type: Number,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoos.model("Company", companySchema);

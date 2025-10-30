const mongoos = require("mongoose");

const userSchema = new mongoos.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      enum: ["user", "admin", "superAdmin"],
      type: String,
      required: true,
      default: "user",
    },
    password: {
      type: String,
      required: true,
    },
    lastLoginTime: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoos.model("User", userSchema);

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
      enum: ["user", "admin", "superAdmin", "guest"],
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
    // Guest accounts can log in only until `validTill`. After that the
    // account stays locked until an admin extends the validity.
    isGuest: {
      type: Boolean,
      default: false,
    },
    validTill: {
      type: Date,
      required: false,
    },
    createdBy: {
      type: mongoos.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

userSchema.methods.isExpired = function () {
  return !!(
    this.isGuest &&
    this.validTill &&
    this.validTill.getTime() <= Date.now()
  );
};

module.exports = mongoos.model("User", userSchema);

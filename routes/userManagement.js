require("dotenv").config();
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const verifyToken = require("../utils/verifyToken");
const verifyAdmin = require("../utils/verifyAdmin");
const { generatePassword, hashPassword } = require("../utils/password");

const userModel = require("../models/userModel");

// Every route here is admin-only.
router.use(verifyToken, verifyAdmin);

const MAX_VALIDITY_MS = 365 * 24 * 60 * 60 * 1000;

const validTillSchema = Joi.date()
  .iso()
  .required()
  .custom((value, helpers) => {
    const now = Date.now();
    if (value.getTime() <= now) return helpers.message("Validity must end in the future");
    if (value.getTime() > now + MAX_VALIDITY_MS)
      return helpers.message("Validity cannot exceed 1 year");
    return value;
  });

const createGuestSchema = Joi.object({
  fullName: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().trim().lowercase().email().required(),
  validTill: validTillSchema,
});

const PUBLIC_FIELDS = "-password -__v";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serialize(user) {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  delete obj.__v;
  obj.isExpired = !!(obj.isGuest && obj.validTill && new Date(obj.validTill) <= new Date());
  return obj;
}

// Generates a fresh password and stores only its hash. The plain password is
// returned once so the admin UI can show/share it; it is never retrievable later.
// (SMTP delivery via utils/mailer.sendGuestCredentials is available but not
// used for now — the admin shares the details from the UI instead.)
async function issueCredentials(user) {
  const password = generatePassword();
  user.password = await hashPassword(password);
  await user.save();
  return { email: user.email, password, validTill: user.validTill };
}

router.get("/getAllUsers", async (req, res) => {
  try {
    const users = await userModel.find().select(PUBLIC_FIELDS).sort({ createdAt: -1 });
    return res.status(200).json({ Success: true, data: users.map(serialize) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/createGuestUser", async (req, res) => {
  const { error, value } = createGuestSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const existing = await userModel.findOne({
      email: new RegExp(`^${escapeRegex(value.email)}$`, "i"),
    });
    if (existing)
      return res.status(409).json({ error: "A user with this email already exists" });

    const user = new userModel({
      fullName: value.fullName,
      email: value.email,
      role: "guest",
      isGuest: true,
      validTill: value.validTill,
      createdBy: req.tokendata.id,
      password: "pending", // replaced by issueCredentials
    });
    const credentials = await issueCredentials(user);

    return res.status(200).json({
      Success: true,
      message: "Guest user created",
      credentials,
      data: serialize(user),
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Extend / unlock a guest account by setting a new validity end.
router.patch("/updateValidity/:userId", async (req, res) => {
  const { error, value } = Joi.object({ validTill: validTillSchema }).validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const user = await userModel.findById(req.params.userId);
    if (!user || !user.isGuest)
      return res.status(404).json({ error: "Guest user not found" });

    user.validTill = value.validTill;
    await user.save();
    return res.status(200).json({ Success: true, message: "Validity updated", data: serialize(user) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Lock a guest account immediately.
router.patch("/revokeAccess/:userId", async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId);
    if (!user || !user.isGuest)
      return res.status(404).json({ error: "Guest user not found" });

    user.validTill = new Date();
    await user.save();
    return res.status(200).json({ Success: true, message: "Access revoked", data: serialize(user) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Generate a new password (the old one stops working) and return it once.
router.post("/resetPassword/:userId", async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId);
    if (!user || !user.isGuest)
      return res.status(404).json({ error: "Guest user not found" });

    const credentials = await issueCredentials(user);
    return res.status(200).json({
      Success: true,
      message: "Password reset",
      credentials,
      data: serialize(user),
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.delete("/deleteUser/:userId", async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId);
    if (!user || !user.isGuest)
      return res.status(404).json({ error: "Guest user not found" });

    await user.deleteOne();
    return res.status(200).json({ Success: true, message: "Guest user deleted" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;

const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const ACCOUNT_EXPIRED = "ACCOUNT_EXPIRED";
const EXPIRED_MESSAGE =
  "Your guest access has expired. Please contact the administrator to unlock your account.";

module.exports = async function (req, res, next) {
  let token = req.header("Authorization");
  if (!token) return res.status(401).send("Access Denied!");

  let verified;
  try {
    verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
  } catch (error) {
    console.log(error);
    return res.status(401).send("Invalid token!");
  }

  // Guest tokens are re-checked against the DB so that an admin revoking or
  // extending access takes effect immediately, not only when the JWT expires.
  if (verified.isGuest || verified.role === "guest") {
    // Guests may never delete anything (covers every DELETE route).
    if (req.method === "DELETE")
      return res
        .status(403)
        .json({ error: "Guest users are not allowed to delete data" });

    try {
      const user = await userModel
        .findById(verified.id)
        .select("isGuest validTill");
      if (!user) return res.status(401).send("Invalid token!");
      if (user.isExpired())
        return res
          .status(403)
          .json({ code: ACCOUNT_EXPIRED, error: EXPIRED_MESSAGE });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  req.tokendata = verified;
  next();
};

module.exports.ACCOUNT_EXPIRED = ACCOUNT_EXPIRED;
module.exports.EXPIRED_MESSAGE = EXPIRED_MESSAGE;

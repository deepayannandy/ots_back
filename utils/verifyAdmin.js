// Use after verifyToken. Allows only admin / superAdmin roles.
module.exports = function (req, res, next) {
  const role = req.tokendata && req.tokendata.role;
  if (role === "admin" || role === "superAdmin") return next();
  return res.status(403).json({ error: "Admin access required" });
};

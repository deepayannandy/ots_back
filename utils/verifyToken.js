const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  let token = req.header("Authorization");
  //   console.log(token.replace("Bearer ", ""));
  if (!token) return res.status(401).send("Access Denied!");
  try {
    const verified = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    req.tokendata = verified;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send("Invalid token!");
  }
};

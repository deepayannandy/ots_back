require("dotenv").config();
var cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
process.env.TZ = "America/Chicago";
console.log(`DA: ${process.env.DATABASE_URL}`);
mongoose.set("strictQuery", false);
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;

db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database!"));
const PORT = process.env.PORT || 5000;

const app = express();
app.use("/public/uploads", express.static("public/uploads"));
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const health = require("./routes/healthCheck");
const auth = require("./routes/authentication");
const company = require("./routes/company");
const reactor = require("./routes/reactor");
const tubeSheet = require("./routes/tubeSheet");
const camera = require("./routes/cameraManagement");
const surveyReactor = require("./routes/survey");
const phase = require("./routes/phases");

app.use("/api/v2/healthCheck", health);
app.use("/api/v2/auth", auth);
app.use("/api/v2/company", company);
app.use("/api/v2/reactor", reactor);
app.use("/api/v2/tubeSheet", tubeSheet);
app.use("/api/v2/survey", surveyReactor);
app.use("/api/v2/camera", camera);
app.use("/api/v2/phase", phase);

app.listen(PORT, () => {
  console.log("Http Server is listning!");
});

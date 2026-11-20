// Use after verifyToken. Blocks guest users from changing anything that belongs
// to a tubesheet (project) an admin has marked `protected`. Guests can still
// read it; admins and regular users are never affected.
//
// Each guard resolves the request to a tubesheet filter, then checks whether
// any matching tubesheet is protected.
const mongoose = require("mongoose");
const tubeSheetModel = require("../models/tubeSheetModel");
const surveyReactorModel = require("../models/surveyReactor");
const cameraModel = require("../models/cameraModel");

const PROTECTED_MESSAGE =
  "This project is protected. Guest users can view it but cannot modify it.";

function isGuest(req) {
  const t = req.tokendata || {};
  return !!(t.isGuest || t.role === "guest");
}

const validId = (id) => id != null && mongoose.isValidObjectId(String(id));

// resolve(req) -> Promise<tubesheet filter | null>. null = nothing to check.
function guard(resolve) {
  return async function (req, res, next) {
    if (!isGuest(req)) return next();
    try {
      const filter = await resolve(req);
      if (!filter) return next();
      const isProtected = await tubeSheetModel.exists({
        ...filter,
        protected: true,
      });
      if (isProtected)
        return res
          .status(403)
          .json({ code: "PROJECT_PROTECTED", error: PROTECTED_MESSAGE });
      return next();
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  };
}

// Tubesheet id in a route param (default :itemId) or body field.
const byTubeSheetParam = (param = "itemId") =>
  guard(async (req) =>
    validId(req.params[param]) ? { _id: req.params[param] } : null,
  );
const byTubeSheetBody = (field = "tubeSheetId") =>
  guard(async (req) =>
    validId(req.body && req.body[field]) ? { _id: req.body[field] } : null,
  );

// Reactor layout id in a route param: protected if any linked tubesheet is.
const byReactorParam = (param = "itemId") =>
  guard(async (req) =>
    req.params[param] ? { reactorId: String(req.params[param]) } : null,
  );

// Survey id in a route param -> the survey's tubesheet.
const bySurveyParam = (param = "id") =>
  guard(async (req) => {
    if (!validId(req.params[param])) return null;
    const survey = await surveyReactorModel
      .findById(req.params[param])
      .select("tubeSheet")
      .lean();
    return survey && survey.tubeSheet ? { _id: survey.tubeSheet } : null;
  });

// Camera id in a route param -> tubesheet using the camera's reactor.
const byCameraParam = (param = "itemId") =>
  guard(async (req) => {
    if (!validId(req.params[param])) return null;
    const camera = await cameraModel
      .findById(req.params[param])
      .select("reactorId")
      .lean();
    return camera && camera.reactorId
      ? { reactorId: String(camera.reactorId) }
      : null;
  });

module.exports = {
  PROTECTED_MESSAGE,
  byTubeSheetParam,
  byTubeSheetBody,
  byReactorParam,
  bySurveyParam,
  byCameraParam,
};

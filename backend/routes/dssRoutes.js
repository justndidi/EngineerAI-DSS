const express = require("express");

const { runDSS, getLatestDSSResult } = require("../controllers/dssController");

const router = express.Router();

router.post("/run", runDSS);

router.get("/latest", getLatestDSSResult);

module.exports = router;

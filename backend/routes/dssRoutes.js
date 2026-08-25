const express = require("express");

const router = express.Router();

const {
    runDSS
} = require("../controllers/dssController");


// ========================================
// RUN EXCEL DSS
// ========================================

router.post(
    "/run",
    runDSS
);


module.exports = router;
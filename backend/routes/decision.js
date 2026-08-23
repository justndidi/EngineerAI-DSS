const express = require("express");

const router = express.Router();

const {
    calculateDecision
} = require("../controllers/decisionController");

router.post("/", calculateDecision);

module.exports = router;
const express = require("express");

const router =
    express.Router();

const {
    chat
} = require("../controllers/chatController");


// ========================================
// CHAT
// ========================================

router.post(
    "/",
    chat
);


// ========================================
// TEST ROUTE
// ========================================

router.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Chat API is working."

        });

    }
);


module.exports = router;
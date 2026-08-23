
const { askAI } = require("../services/aiService");

const {
    getLatestDSSResult
} = require("../services/dssStateService");


// ========================================
// ENGINEERING AI CHAT
// ========================================

async function chat(req, res) {

    try {

        // ========================================
        // GET USER MESSAGE
        // ========================================

        const {
            message
        } = req.body;


        // ========================================
        // VALIDATE MESSAGE
        // ========================================

        if (
            !message ||
            typeof message !== "string" ||
            !message.trim()
        ) {

            return res.status(400).json({

                success: false,

                error:
                    "Message is required."

            });

        }


        // ========================================
        // GET LATEST DSS RESULT
        // ========================================

        const dssResult =
            getLatestDSSResult();


        // ========================================
        // BUILD AI CONTEXT
        // ========================================

        const context = {

            dss:
                dssResult || null

        };


        // ========================================
        // SEND QUESTION TO AI
        // ========================================

        const reply =
            await askAI(
                message.trim(),
                context
            );


        // ========================================
        // SEND RESPONSE
        // ========================================

        res.json({

            success: true,

            reply,

            dss:
                dssResult || null

        });


    } catch (error) {

        console.error(
            "Chat Error:",
            error
        );


        res.status(500).json({

            success: false,

            error:
                "Unable to process your request."

        });

    }

}


// ========================================
// EXPORT
// ========================================

module.exports = {

    chat

};



// ========================================
// ENGINEERING AI CHAT CONTROLLER
// ========================================

const { askAI } = require("../services/aiService");

const {
    getLatestDSSResult
} = require("../services/dssStateService");


// ========================================
// CHAT
// ========================================

async function chat(req, res) {

    try {

        const {
            message,
            dssResult
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
        // GET DSS RESULT
        //
        // Priority:
        // 1. Result supplied by frontend
        // 2. Backend stored result
        // ========================================

        const currentDSSResult =
            dssResult || getLatestDSSResult();


        // ========================================
        // CHECK DSS RESULT
        // ========================================

        if (!currentDSSResult) {

            return res.status(400).json({

                success: false,

                error:
                    "Please run a DSS analysis before asking questions about the results."

            });

        }


        // ========================================
        // SEND EXCEL RESULT TO AI
        // ========================================

        const context = {

            dss:
                currentDSSResult

        };


        const reply =
            await askAI(
                message.trim(),
                context
            );


        // ========================================
        // RESPONSE
        // ========================================

        return res.json({

            success: true,

            reply,

            dss:
                currentDSSResult

        });

    } catch (error) {

        console.error(
            "Chat Error:",
            error
        );


        return res.status(500).json({

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
const {
    runExcelDSS
} = require("../services/excelService");


// ========================================
// RUN DSS
// ========================================

async function runDSS(req, res) {

    try {

        const {
            decisionMatrix,
            alternatives
        } = req.body;


        // ========================================
        // VALIDATION
        // ========================================

        if (
            !Array.isArray(
                decisionMatrix
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Decision matrix is required."

            });

        }


        if (
            !Array.isArray(
                alternatives
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Alternatives are required."

            });

        }


        // ========================================
        // SEND TO EXCEL
        // ========================================

        const result =
            await runExcelDSS({

                decisionMatrix,

                alternatives

            });


        // ========================================
        // RETURN RESULT
        // ========================================

        return res.status(200).json({

            success: true,

            message:
                "Excel DSS analysis completed successfully.",

            result

        });


    } catch (error) {

        console.error(
            "DSS Controller Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to run DSS analysis."

        });

    }

}


module.exports = {

    runDSS

};
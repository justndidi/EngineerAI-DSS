// ========================================
// DSS CONTROLLER
// ========================================

const {
    calculateDSS
} = require("../services/dssService");


const {
    ahpMatrix
} = require("../dssData");


const {
    setLatestDSSResult,

    getLatestDSSResult
} = require("../services/dssStateService");


// ========================================
// RUN DSS
// ========================================

function runDSS(req, res) {

    try {

        const {

            decisionMatrix,

            alternatives,

            criteriaTypes

        } = req.body;


        // ========================================
        // VALIDATE REQUEST
        // ========================================

        if (
            !Array.isArray(decisionMatrix)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Decision matrix is required."

            });

        }


        if (
            !Array.isArray(alternatives)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Alternatives are required."

            });

        }


        if (
            !Array.isArray(criteriaTypes)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Criteria types are required."

            });

        }


        // ========================================
        // CALCULATE
        // ========================================

        const result =
            calculateDSS({

                ahpMatrix,

                decisionMatrix,

                alternatives,

                criteriaTypes

            });


        // ========================================
        // SAVE
        // ========================================

        setLatestDSSResult(
            result
        );


        // ========================================
        // RESPONSE
        // ========================================

        return res.json({

            success: true,

            result

        });


    } catch (error) {

        console.error(
            "DSS Error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

}


// ========================================
// GET LATEST DSS RESULT
// ========================================

function getLatestDSSResultRoute(
    req,
    res
) {

    const result =
        getLatestDSSResult();


    if (!result) {

        return res.status(404).json({

            success: false,

            message:
                "No DSS analysis has been performed yet."

        });

    }


    return res.json({

        success: true,

        result

    });

}


// ========================================
// EXPORT
// ========================================

module.exports = {

    runDSS,

    getLatestDSSResult:
        getLatestDSSResultRoute

};
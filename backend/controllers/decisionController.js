const { calculateAHP } =
    require("../services/ahpService");

const { calculateTOPSIS } =
    require("../services/topsisService");

function calculateDecision(req, res) {

    try {

        const {
            pairwiseMatrix,
            decisionMatrix,
            alternatives
        } = req.body;

        if (
            !pairwiseMatrix ||
            !decisionMatrix ||
            !alternatives
        ) {
            return res.status(400).json({
                error: "Incomplete decision data"
            });
        }

        // AHP
        const ahpResult =
            calculateAHP(pairwiseMatrix);

        // All criteria are currently benefit criteria
        const criteriaTypes =
            pairwiseMatrix[0].map(() => "benefit");

        // TOPSIS
        const topsisResult =
            calculateTOPSIS(
                decisionMatrix,
                ahpResult.weights,
                criteriaTypes
            );

        const rankedAlternatives =
            topsisResult.ranking.map(
                (item, index) => ({

                    rank: index + 1,

                    alternative:
                        alternatives[
                            item.alternativeIndex
                        ],

                    score:
                        item.closenessCoefficient
                })
            );

        const recommendation =
            rankedAlternatives[0];

        res.json({

            success: true,

            ahp: ahpResult,

            topsis: topsisResult,

            ranking: rankedAlternatives,

            recommendation

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            error:
                "Decision calculation failed"

        });
    }
}

module.exports = {
    calculateDecision
};
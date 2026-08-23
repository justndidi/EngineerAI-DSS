// ========================================
// ENGINEERING DSS SERVICE
// ========================================

const {
    calculateAHP
} = require("./ahpService");


const {
    calculateTOPSIS
} = require("./topsisService");


// ========================================
// CATEGORY STRUCTURE
// ========================================

const categorySizes = [

    5,  // Technical

    3,  // Operational

    4,  // Environmental & Safety

    3,  // Financial

    3   // Regulatory

];


// ========================================
// CALCULATE DSS
// ========================================

function calculateDSS({

    ahpMatrix,

    decisionMatrix,

    alternatives,

    criteriaTypes

}) {


    // ========================================
    // BASIC VALIDATION
    // ========================================

    if (!Array.isArray(ahpMatrix)) {

        throw new Error(
            "AHP matrix is required."
        );

    }


    if (!Array.isArray(decisionMatrix)) {

        throw new Error(
            "Decision matrix is required."
        );

    }


    if (!Array.isArray(alternatives)) {

        throw new Error(
            "Alternatives are required."
        );

    }


    if (!Array.isArray(criteriaTypes)) {

        throw new Error(
            "Criteria types are required."
        );

    }


    // ========================================
    // ALTERNATIVES
    // ========================================

    if (alternatives.length !== 3) {

        throw new Error(
            "The DSS requires exactly 3 alternatives."
        );

    }


    // ========================================
    // DECISION MATRIX
    // ========================================

    if (decisionMatrix.length !== 3) {

        throw new Error(
            "The decision matrix must contain exactly 3 alternatives."
        );

    }


    decisionMatrix.forEach(
        (row, index) => {

            if (
                !Array.isArray(row) ||
                row.length !== 18
            ) {

                throw new Error(
                    `Alternative ${index + 1} must contain exactly 18 scores.`
                );

            }

        }
    );


    // ========================================
    // CRITERIA TYPES
    // ========================================

    if (
        criteriaTypes.length !== 18
    ) {

        throw new Error(
            "Exactly 18 criteria types are required."
        );

    }


    criteriaTypes.forEach(
        (type, index) => {

            if (
                type !== "benefit" &&
                type !== "cost"
            ) {

                throw new Error(
                    `Invalid criteria type at criterion ${index + 1}.`
                );

            }

        }
    );


    // ========================================
    // VALIDATE SCORES
    // ========================================

    decisionMatrix.forEach(
        (row, alternativeIndex) => {

            row.forEach(
                (value, criterionIndex) => {

                    if (
                        !Number.isFinite(
                            Number(value)
                        ) ||
                        Number(value) < 1 ||
                        Number(value) > 10
                    ) {

                        throw new Error(
                            `Invalid score at alternative ${alternativeIndex + 1}, criterion ${criterionIndex + 1}. Scores must be between 1 and 10.`
                        );

                    }

                }
            );

        }
    );


    // ========================================
    // 1. AHP
    // ========================================

    const ahpResult =
        calculateAHP(
            ahpMatrix
        );


    // ========================================
    // 2. AHP CONSISTENCY
    // ========================================

    if (!ahpResult.consistent) {

        throw new Error(
            `AHP matrix is inconsistent. Consistency Ratio: ${ahpResult.consistencyRatio.toFixed(4)}`
        );

    }


    // ========================================
    // 3. AHP CATEGORY WEIGHTS
    // ========================================

    const ahpWeights =
        ahpResult.weights;


    if (ahpWeights.length !== 5) {

        throw new Error(
            "AHP must produce exactly 5 category weights."
        );

    }


    // ========================================
    // 4. CREATE 18 TOPSIS WEIGHTS
    // ========================================

    const topsisWeights = [];


    categorySizes.forEach(
        (size, categoryIndex) => {

            const categoryWeight =
                ahpWeights[categoryIndex];


            const subcriterionWeight =
                categoryWeight / size;


            for (
                let i = 0;
                i < size;
                i++
            ) {

                topsisWeights.push(
                    subcriterionWeight
                );

            }

        }
    );


    // ========================================
    // 5. VALIDATE WEIGHTS
    // ========================================

    if (
        topsisWeights.length !== 18
    ) {

        throw new Error(
            "The DSS failed to generate exactly 18 TOPSIS weights."
        );

    }


    // ========================================
    // 6. TOPSIS
    // ========================================

    const topsisResult =
        calculateTOPSIS(

            decisionMatrix,

            topsisWeights,

            criteriaTypes

        );


    // ========================================
    // 7. ATTACH ALTERNATIVE NAMES
    // ========================================

    const ranking =
        topsisResult.ranking.map(
            item => ({

                alternative:
                    alternatives[
                        item.alternativeIndex
                    ],

                rank: 0,

                closenessCoefficient:
                    item.closenessCoefficient,

                positiveDistance:
                    item.positiveDistance,

                negativeDistance:
                    item.negativeDistance

            })
        );


    // ========================================
    // 8. SORT
    // ========================================

    ranking.sort(
        (a, b) =>
            b.closenessCoefficient -
            a.closenessCoefficient
    );


    // ========================================
    // 9. ASSIGN RANK
    // ========================================

    ranking.forEach(
        (item, index) => {

            item.rank =
                index + 1;

        }
    );


    // ========================================
    // 10. RECOMMENDATION
    // ========================================

    const recommendation =
        ranking[0];


    // ========================================
    // 11. RETURN RESULT
    // ========================================

    return {

        ahp: {

            weights:
                ahpWeights,

            lambdaMax:
                ahpResult.lambdaMax,

            consistencyIndex:
                ahpResult.consistencyIndex,

            consistencyRatio:
                ahpResult.consistencyRatio,

            consistent:
                ahpResult.consistent

        },

        topsis: {

            weights:
                topsisWeights,

            ranking,

            recommendation

        }

    };

}


// ========================================
// EXPORT
// ========================================

module.exports = {

    calculateDSS

};
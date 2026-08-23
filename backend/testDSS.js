const {
    calculateDSS
} = require("./services/dssService");


const {
    ahpMatrix,
    decisionMatrix,
    alternatives,
    criteriaTypes
} = require("./dssData");


console.log(
    "\nENGINEERING DECISION SUPPORT SYSTEM"
);

console.log(
    "===================================="
);


try {

    const result = calculateDSS({

        ahpMatrix,

        decisionMatrix,

        alternatives,

        criteriaTypes

    });


    // ====================================
    // AHP
    // ====================================

    console.log("\nAHP RESULTS");
    console.log("-----------");

    console.log(
        "Weights:",
        result.ahp.weights
    );

    console.log(
        "Consistency Ratio:",
        result.ahp.consistencyRatio
    );

    console.log(
        "Consistent:",
        result.ahp.consistent
    );


    // ====================================
    // TOPSIS
    // ====================================

    console.log("\nTOPSIS RESULTS");
    console.log("--------------");


    result.topsis.ranking.forEach(
        item => {

            console.log(
                `${item.rank}. ${item.alternative}`
            );

            console.log(
                `   Closeness: ${item.closenessCoefficient}`
            );

        }
    );


    // ====================================
    // RECOMMENDATION
    // ====================================

    console.log(
        "\nFINAL RECOMMENDATION"
    );

    console.log(
        "--------------------"
    );

    console.log(
        result.topsis.recommendation.alternative
    );

    console.log(
        "Closeness Coefficient:",
        result.topsis.recommendation.closenessCoefficient
    );


} catch (error) {

    console.error(
        "\nDSS ERROR:"
    );

    console.error(
        error.message
    );

}
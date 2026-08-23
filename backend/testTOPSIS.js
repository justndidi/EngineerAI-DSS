const {
    calculateTOPSIS
} = require("./services/topsisService");


// ========================================
// AHP WEIGHTS
// ========================================

const weights = [

    // Technical — 5 criteria
    0.0947093934,
    0.0947093934,
    0.0947093934,
    0.0947093934,
    0.0947093934,

    // Operational — 3 criteria
    0.0694904335,
    0.0694904335,
    0.0694904335,

    // Environmental & Safety — 4 criteria
    0.0390536728,
    0.0390536728,
    0.0390536728,
    0.0390536728,

    // Financial — 3 criteria
    0.0347831141,
    0.0347831141,
    0.0347831141,

    // Regulatory — 3 criteria
    0.0191392330,
    0.0191392330,
    0.0191392330

];
// ========================================
// DECISION MATRIX
// ========================================

const matrix = [

    // Alternative A
    [
        5, 3, 10, 10, 10,
        10, 3, 3,
        3, 3, 10, 6,
        8, 8, 8,
        5, 1, 3
    ],

    // Alternative B
    [
        7, 5, 5, 10, 3,
        10, 5, 5,
        8, 10, 6, 8,
        6, 8, 6,
        5, 4, 10
    ],

    // Alternative C
    [
        10, 5, 5, 10, 4,
        10, 7, 7,
        8, 5, 6, 8,
        3, 3, 3,
        5, 10, 7
    ]

];


// ========================================
// CRITERIA TYPES
// ========================================

const criteriaTypes = [

    // Technical
    "benefit",
    "benefit",
    "benefit",
    "benefit",
    "benefit",

    // Operational
    "benefit",
    "benefit",
    "benefit",

    // Environmental & Safety
    "benefit",
    "benefit",
    "benefit",
    "benefit",

    // Financial
    "cost",
    "cost",
    "cost",

    // Regulatory
    "benefit",
    "benefit",
    "benefit"

];


// ========================================
// RUN TOPSIS
// ========================================

const result = calculateTOPSIS(
    matrix,
    weights,
    criteriaTypes
);


// ========================================
// DISPLAY RESULTS
// ========================================

console.log("\nENGINEERING DSS TOPSIS");
console.log("========================");

console.log("\nCloseness Coefficients:");

result.results.forEach(
    (item, index) => {

        console.log(
            `Alternative ${String.fromCharCode(65 + index)}:`,
            item.closenessCoefficient
        );

    }
);


console.log("\nRanking:");

result.ranking.forEach(
    (item, index) => {

        console.log(
            `${index + 1}. Alternative ${String.fromCharCode(65 + item.alternativeIndex)}`
        );

        console.log(
            `   Closeness: ${item.closenessCoefficient}`
        );

        console.log(
            `   S+: ${item.positiveDistance}`
        );

        console.log(
            `   S-: ${item.negativeDistance}`
        );

    }
);
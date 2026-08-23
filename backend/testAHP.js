const { calculateAHP } = require("./services/ahpService");

const matrix = [
    [1, 5, 5, 5.8, 3.8],
    [1 / 5, 1, 3, 4.6, 3.4],
    [1 / 5, 1 / 3, 1, 5.4, 3.4],
    [1 / 5.8, 1 / 4.6, 1 / 5.4, 1, 5.4],
    [1 / 3.8, 1 / 3.4, 1 / 3.4, 1 / 5.4, 1]
];

const result = calculateAHP(matrix);

console.log("ENGINEERING DSS AHP RESULT");
console.log("============================");

console.log("Weights:");
console.log(result.weights);

console.log("Lambda Max:");
console.log(result.lambdaMax);

console.log("Consistency Index:");
console.log(result.consistencyIndex);

console.log("Consistency Ratio:");
console.log(result.consistencyRatio);

console.log("Consistent:");
console.log(result.consistent);
// ========================================
// AHP CALCULATION SERVICE
// ========================================

function calculateAHP(matrix) {

    // ========================================
    // VALIDATION
    // ========================================

    if (!Array.isArray(matrix)) {

        throw new Error(
            "AHP matrix must be an array."
        );

    }


    const n = matrix.length;


    if (n === 0) {

        throw new Error(
            "AHP matrix cannot be empty."
        );

    }


    if (n !== 5) {

        throw new Error(
            "AHP matrix must contain exactly 5 criteria categories."
        );

    }


    matrix.forEach(
        (row, index) => {

            if (
                !Array.isArray(row) ||
                row.length !== n
            ) {

                throw new Error(
                    `AHP matrix row ${index + 1} is invalid.`
                );

            }

        }
    );


    // ========================================
    // 1. COLUMN SUMS
    // ========================================

    const columnSums =
        Array(n).fill(0);


    for (let j = 0; j < n; j++) {

        for (let i = 0; i < n; i++) {

            columnSums[j] +=
                Number(matrix[i][j]);

        }

    }


    // ========================================
    // 2. NORMALIZE MATRIX
    // ========================================

    const normalized =
        matrix.map(
            row =>
                row.map(
                    (value, j) =>
                        Number(value) /
                        columnSums[j]
                )
        );


    // ========================================
    // 3. PRIORITY VECTOR
    // ========================================

    const weights =
        normalized.map(
            row => {

                const sum =
                    row.reduce(
                        (total, value) =>
                            total + value,
                        0
                    );


                return sum / n;

            }
        );


    // ========================================
    // 4. WEIGHTED SUM VECTOR
    // ========================================

    const weightedSum =
        matrix.map(
            row => {

                return row.reduce(
                    (sum, value, j) =>
                        sum +
                        Number(value) *
                        weights[j],
                    0
                );

            }
        );


    // ========================================
    // 5. LAMBDA VALUES
    // ========================================

    const lambdaValues =
        weightedSum.map(
            (value, i) =>
                value / weights[i]
        );


    const lambdaMax =
        lambdaValues.reduce(
            (sum, value) =>
                sum + value,
            0
        ) / n;


    // ========================================
    // 6. CONSISTENCY INDEX
    // ========================================

    const consistencyIndex =
        (lambdaMax - n) /
        (n - 1);


    // ========================================
    // 7. RANDOM INDEX
    // ========================================

    const RI = {

        1: 0,

        2: 0,

        3: 0.58,

        4: 0.90,

        5: 1.12,

        6: 1.24,

        7: 1.32,

        8: 1.41,

        9: 1.45,

        10: 1.49

    };


    // ========================================
    // 8. CONSISTENCY RATIO
    // ========================================

    const consistencyRatio =
        RI[n] === 0
            ? 0
            : consistencyIndex /
              RI[n];


    // ========================================
    // 9. RETURN RESULT
    // ========================================

    return {

        weights,

        lambdaMax,

        consistencyIndex,

        consistencyRatio,

        consistent:
            consistencyRatio < 0.10

    };

}


// ========================================
// EXPORT
// ========================================

module.exports = {

    calculateAHP

};
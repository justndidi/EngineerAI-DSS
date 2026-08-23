// ========================================
// ENGINEERING DSS - TOPSIS SERVICE
// ========================================

function calculateTOPSIS(
    matrix,
    weights,
    criteriaTypes
) {

    // ========================================
    // VALIDATION
    // ========================================

    if (
        !Array.isArray(matrix) ||
        matrix.length === 0
    ) {
        throw new Error(
            "TOPSIS decision matrix is required."
        );
    }

    if (!Array.isArray(weights)) {
        throw new Error(
            "TOPSIS weights are required."
        );
    }

    if (!Array.isArray(criteriaTypes)) {
        throw new Error(
            "TOPSIS criteria types are required."
        );
    }


    const rows = matrix.length;
    const cols = matrix[0].length;


    if (cols === 0) {
        throw new Error(
            "TOPSIS decision matrix contains no criteria."
        );
    }


    // ========================================
    // VALIDATE WEIGHTS
    // ========================================

    if (weights.length !== cols) {
        throw new Error(
            `TOPSIS requires ${cols} weights, but received ${weights.length}.`
        );
    }


    weights.forEach((weight, index) => {

        if (
            !Number.isFinite(Number(weight)) ||
            Number(weight) < 0
        ) {
            throw new Error(
                `Invalid TOPSIS weight at criterion ${index + 1}.`
            );
        }

    });


    // ========================================
    // VALIDATE CRITERIA TYPES
    // ========================================

    if (criteriaTypes.length !== cols) {
        throw new Error(
            `TOPSIS requires ${cols} criteria types, but received ${criteriaTypes.length}.`
        );
    }


    criteriaTypes.forEach((type, index) => {

        if (
            type !== "benefit" &&
            type !== "cost"
        ) {
            throw new Error(
                `Invalid criteria type at criterion ${index + 1}.`
            );
        }

    });


    // ========================================
    // VALIDATE MATRIX
    // ========================================

    matrix.forEach((row, i) => {

        if (!Array.isArray(row)) {
            throw new Error(
                `Decision matrix row ${i + 1} is invalid.`
            );
        }


        if (row.length !== cols) {
            throw new Error(
                `Decision matrix row ${i + 1} must contain ${cols} values.`
            );
        }


        row.forEach((value, j) => {

            const numericValue =
                Number(value);


            if (
                !Number.isFinite(numericValue)
            ) {
                throw new Error(
                    `Invalid decision score at row ${i + 1}, criterion ${j + 1}.`
                );
            }


            if (
                numericValue < 1 ||
                numericValue > 10
            ) {
                throw new Error(
                    `Decision scores must be between 1 and 10.`
                );
            }

        });

    });


    // ========================================
    // 1. NORMALIZE DECISION MATRIX
    // ========================================

    const denominators = [];


    for (
        let j = 0;
        j < cols;
        j++
    ) {

        let sumSquares = 0;


        for (
            let i = 0;
            i < rows;
            i++
        ) {

            const value =
                Number(matrix[i][j]);

            sumSquares +=
                value ** 2;

        }


        denominators[j] =
            Math.sqrt(sumSquares);


        if (denominators[j] === 0) {

            throw new Error(
                `Criterion ${j + 1} cannot be normalized because all values are zero.`
            );

        }

    }


    const normalized =
        matrix.map(row =>

            row.map((value, j) =>

                Number(value) /
                denominators[j]

            )

        );


    // ========================================
    // 2. WEIGHTED NORMALIZED MATRIX
    // ========================================

    const weighted =
        normalized.map(row =>

            row.map((value, j) =>

                value *
                Number(weights[j])

            )

        );


    // ========================================
    // 3. IDEAL SOLUTIONS
    // ========================================

    const positiveIdeal = [];
    const negativeIdeal = [];


    for (
        let j = 0;
        j < cols;
        j++
    ) {

        const values =
            weighted.map(
                row => row[j]
            );


        if (
            criteriaTypes[j] === "cost"
        ) {

            // Lower is better
            positiveIdeal[j] =
                Math.min(...values);

            negativeIdeal[j] =
                Math.max(...values);

        } else {

            // Higher is better
            positiveIdeal[j] =
                Math.max(...values);

            negativeIdeal[j] =
                Math.min(...values);

        }

    }


    // ========================================
    // 4. SEPARATION DISTANCES
    // ========================================

    const positiveDistance = [];
    const negativeDistance = [];


    for (
        let i = 0;
        i < rows;
        i++
    ) {

        let positiveSum = 0;
        let negativeSum = 0;


        for (
            let j = 0;
            j < cols;
            j++
        ) {

            positiveSum +=

                (
                    weighted[i][j] -
                    positiveIdeal[j]
                ) ** 2;


            negativeSum +=

                (
                    weighted[i][j] -
                    negativeIdeal[j]
                ) ** 2;

        }


        positiveDistance[i] =
            Math.sqrt(
                positiveSum
            );


        negativeDistance[i] =
            Math.sqrt(
                negativeSum
            );

    }


    // ========================================
    // 5. CLOSENESS COEFFICIENT
    // ========================================

    const results =
        positiveDistance.map(
            (distance, i) => {

                const negative =
                    negativeDistance[i];


                const denominator =
                    negative +
                    distance;


                let coefficient;


                // ====================================
                // IDENTICAL ALTERNATIVES
                // ====================================

                if (denominator === 0) {

                    // The alternative is simultaneously
                    // at the positive and negative ideal
                    // because all alternatives have the
                    // same values.

                    coefficient = 0.5;

                } else {

                    coefficient =
                        negative /
                        denominator;

                }


                return {

                    positiveDistance:
                        distance,

                    negativeDistance:
                        negative,

                    closenessCoefficient:
                        coefficient

                };

            }
        );


    // ========================================
    // 6. RANKING
    // ========================================

    const ranking =
        [...results]
            .map(
                (result, index) => ({

                    alternativeIndex:
                        index,

                    ...result

                })
            )
            .sort(
                (a, b) =>

                    b.closenessCoefficient -
                    a.closenessCoefficient

            );


    // ========================================
    // RETURN
    // ========================================

    return {

        normalized,

        weighted,

        positiveIdeal,

        negativeIdeal,

        results,

        ranking

    };

}


// ========================================
// EXPORT
// ========================================

module.exports = {
    calculateTOPSIS
};
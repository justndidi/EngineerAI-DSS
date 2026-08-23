
// ========================================
// ENGINEERING DSS DECISION INPUT
// ========================================


// ========================================
// GET ELEMENTS
// ========================================

const criteriaTableBody =
    document.getElementById("criteriaTableBody");

const runAnalysisBtn =
    document.getElementById("runAnalysisBtn");

const statusMessage =
    document.getElementById("statusMessage");


// ========================================
// CRITERIA
// ========================================

const criteria = [

    // ========================================
    // TECHNICAL - 5
    // ========================================

    {
        category: "Technical",
        name: "Technical Expertise",
        type: "benefit"
    },

    {
        category: "Technical",
        name: "Engineering Competence",
        type: "benefit"
    },

    {
        category: "Technical",
        name: "Equipment Availability",
        type: "benefit"
    },

    {
        category: "Technical",
        name: "Service Quality",
        type: "benefit"
    },

    {
        category: "Technical",
        name: "Technology Capability",
        type: "benefit"
    },


    // ========================================
    // OPERATIONAL - 3
    // ========================================

    {
        category: "Operational",
        name: "Operational Efficiency",
        type: "benefit"
    },

    {
        category: "Operational",
        name: "Workforce Availability",
        type: "benefit"
    },

    {
        category: "Operational",
        name: "Location Accessibility",
        type: "benefit"
    },


    // ========================================
    // ENVIRONMENTAL & SAFETY - 4
    // ========================================

    {
        category: "Environmental & Safety",
        name: "Environmental Impact",
        type: "cost"
    },

    {
        category: "Environmental & Safety",
        name: "Safety Standards",
        type: "benefit"
    },

    {
        category: "Environmental & Safety",
        name: "Waste Management",
        type: "benefit"
    },

    {
        category: "Environmental & Safety",
        name: "HSE Compliance",
        type: "benefit"
    },


    // ========================================
    // FINANCIAL - 3
    // ========================================

    {
        category: "Financial",
        name: "Startup Cost",
        type: "cost"
    },

    {
        category: "Financial",
        name: "Operating Cost",
        type: "cost"
    },

    {
        category: "Financial",
        name: "Revenue Potential",
        type: "benefit"
    },


    // ========================================
    // REGULATORY - 3
    // ========================================

    {
        category: "Regulatory",
        name: "Regulatory Compliance",
        type: "benefit"
    },

    {
        category: "Regulatory",
        name: "Licensing Requirements",
        type: "cost"
    },

    {
        category: "Regulatory",
        name: "Industry Standards",
        type: "benefit"
    }

];


// ========================================
// ALTERNATIVES
// ========================================

const alternatives = [

    "Process Optimization-Focused Firm",

    "Environmental Compliance-Focused Firm",

    "Laboratory Testing-Focused Firm"

];


// ========================================
// AHP MATRIX
//
// This must match the backend DSS model.
// ========================================

const ahpMatrix = [

    [1, 2.272, 3.031, 4.538, 8.247],

    [0.440, 1, 1.335, 1.998, 3.631],

    [0.330, 0.749, 1, 1.497, 2.721],

    [0.220, 0.501, 0.668, 1, 1.817],

    [0.121, 0.275, 0.368, 0.550, 1]

];


// ========================================
// GENERATE TABLE
// ========================================

function generateCriteriaTable() {

    criteriaTableBody.innerHTML = "";

    let currentCategory = "";


    criteria.forEach(
        (criterion, index) => {

            // ==================================
            // CATEGORY ROW
            // ==================================

            if (
                criterion.category !==
                currentCategory
            ) {

                currentCategory =
                    criterion.category;


                const categoryRow =
                    document.createElement("tr");


                categoryRow.className =
                    "category-row";


                categoryRow.innerHTML = `

                    <td colspan="5">

                        ${criterion.category}

                    </td>

                `;


                criteriaTableBody.appendChild(
                    categoryRow
                );

            }


            // ==================================
            // CRITERION ROW
            // ==================================

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    ${criterion.name}

                </td>


                <td>

                    <span class="criterion-type">

                        ${criterion.type}

                    </span>

                </td>


                <!-- PROCESS OPTIMIZATION -->

                <td>

                    <input
                        type="number"
                        class="score-input"
                        min="1"
                        max="10"
                        step="1"
                        data-criterion="${criterion.name}"
                        data-index="${index}"
                        data-alternative="0"
                        placeholder="1-10"
                    >

                </td>


                <!-- ENVIRONMENTAL COMPLIANCE -->

                <td>

                    <input
                        type="number"
                        class="score-input"
                        min="1"
                        max="10"
                        step="1"
                        data-criterion="${criterion.name}"
                        data-index="${index}"
                        data-alternative="1"
                        placeholder="1-10"
                    >

                </td>


                <!-- LABORATORY TESTING -->

                <td>

                    <input
                        type="number"
                        class="score-input"
                        min="1"
                        max="10"
                        step="1"
                        data-criterion="${criterion.name}"
                        data-index="${index}"
                        data-alternative="2"
                        placeholder="1-10"
                    >

                </td>

            `;


            criteriaTableBody.appendChild(
                row
            );

        }
    );

}


// ========================================
// GET SCORES
//
// IMPORTANT:
// Backend expects:
//
// 3 alternatives × 18 criteria
//
// NOT:
//
// 18 criteria × 3 alternatives
// ========================================

function getDecisionMatrix() {

    const inputs =
        document.querySelectorAll(
            ".score-input"
        );


    // 18 criteria × 3 alternatives
    // = 54 input fields

    if (inputs.length !== 54) {

        throw new Error(
            `The system expected 54 score fields but found ${inputs.length}.`
        );

    }


    // ========================================
    // CREATE CORRECT MATRIX
    //
    // 3 rows
    // 18 columns
    // ========================================

    const decisionMatrix = [

        new Array(18).fill(null),

        new Array(18).fill(null),

        new Array(18).fill(null)

    ];


    // ========================================
    // READ EACH INPUT
    // ========================================

    inputs.forEach(
        input => {

            const criterionIndex =
                Number(
                    input.dataset.index
                );


            const alternativeIndex =
                Number(
                    input.dataset.alternative
                );


            const value =
                Number(
                    input.value
                );


            // ==================================
            // VALIDATE SCORE
            // ==================================

            if (
                input.value === "" ||
                !Number.isFinite(value) ||
                value < 1 ||
                value > 10
            ) {

                throw new Error(

                    `Scores must be between 1 and 10. Check "${input.dataset.criterion}".`

                );

            }


            // ==================================
            // STORE CORRECTLY
            //
            // Row = alternative
            // Column = criterion
            // ==================================

            decisionMatrix[
                alternativeIndex
            ][
                criterionIndex
            ] = value;

        }
    );


    // ========================================
    // FINAL VALIDATION
    // ========================================

    decisionMatrix.forEach(
        (row, alternativeIndex) => {

            if (row.length !== 18) {

                throw new Error(
                    `Alternative ${alternativeIndex + 1} does not contain 18 criteria.`
                );

            }


            row.forEach(
                (value, criterionIndex) => {

                    if (
                        value === null ||
                        value === undefined
                    ) {

                        throw new Error(

                            `Missing score for criterion ${criterionIndex + 1} in alternative ${alternativeIndex + 1}.`

                        );

                    }

                }
            );

        }
    );


    console.log(
        "FINAL DECISION MATRIX:",
        decisionMatrix
    );


    return decisionMatrix;

}


// ========================================
// GET CRITERIA TYPES
// ========================================

function getCriteriaTypes() {

    return criteria.map(
        criterion =>
            criterion.type
    );

}


// ========================================
// RUN DSS
// ========================================

async function runAnalysis() {

    try {

        // ==================================
        // DISABLE BUTTON
        // ==================================

        runAnalysisBtn.disabled =
            true;


        statusMessage.textContent =
            "Running decision analysis...";


        // ==================================
        // GET DECISION MATRIX
        // ==================================

        const decisionMatrix =
            getDecisionMatrix();


        // ==================================
        // GET CRITERIA TYPES
        // ==================================

        const criteriaTypes =
            getCriteriaTypes();


        // ==================================
        // DEBUG
        // ==================================

        console.log(
            "AHP Matrix:",
            ahpMatrix
        );


        console.log(
            "Decision Matrix:",
            decisionMatrix
        );


        console.log(
            "Decision Matrix Rows:",
            decisionMatrix.length
        );


        console.log(
            "Decision Matrix Columns:",
            decisionMatrix[0].length
        );


        console.log(
            "Criteria Types:",
            criteriaTypes
        );


        console.log(
            "Criteria Types Length:",
            criteriaTypes.length
        );


        console.log(
            "Alternatives:",
            alternatives
        );


        console.log(
            "Alternatives Length:",
            alternatives.length
        );


        // ==================================
        // SEND TO BACKEND
        // ==================================

        const response =
            await fetch(
                "http://localhost:5000/api/dss/run",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            ahpMatrix,

                            decisionMatrix,

                            alternatives,

                            criteriaTypes

                        })

                }
            );


        // ==================================
        // READ RESPONSE
        // ==================================

        const data =
            await response.json();


        console.log(
            "DSS Server Response:",
            data
        );


        // ==================================
        // SERVER ERROR
        // ==================================

        if (!response.ok) {

            throw new Error(

                data.message ||
                data.error ||
                `Server error: ${response.status}`

            );

        }


        // ==================================
        // DSS ERROR
        // ==================================

        if (!data.success) {

            throw new Error(

                data.message ||
                data.error ||
                "DSS analysis failed."

            );

        }


        // ==================================
        // SAVE RESULT
        // ==================================

        sessionStorage.setItem(

            "dssResult",

            JSON.stringify(
                data.result
            )

        );


        // ==================================
        // SUCCESS
        // ==================================

        statusMessage.textContent =
            "Analysis completed successfully. Redirecting...";


        // ==================================
        // GO TO DASHBOARD
        // ==================================

        window.location.href =
            "dashboard.html";


    } catch (error) {

        console.error(
            "DSS Analysis Error:",
            error
        );


        statusMessage.textContent =
            error.message;


        runAnalysisBtn.disabled =
            false;

    }

}


// ========================================
// BUTTON EVENT
// ========================================

runAnalysisBtn.addEventListener(
    "click",
    runAnalysis
);


// ========================================
// INITIALIZE
// ========================================

generateCriteriaTable();

const resetAnalysisBtn =
    document.getElementById(
        "resetAnalysisBtn"
    );


if (resetAnalysisBtn) {

    resetAnalysisBtn.addEventListener(
        "click",
        () => {

            const inputs =
                document.querySelectorAll(
                    ".score-input"
                );


            inputs.forEach(
                input => {

                    input.value = "";

                }
            );


            statusMessage.textContent =
                "All scores have been cleared.";

        }
    );

}
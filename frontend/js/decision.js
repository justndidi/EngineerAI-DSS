// ========================================
// ENGINEERAI DSS DECISION INPUT
// 19-CRITERION MODEL
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

const resetAnalysisBtn =
    document.getElementById("resetAnalysisBtn");

// ========================================
// CRITERIA
// ========================================

const criteria = [

    // ========================================
    // TECHNICAL - 5
    // ========================================

    {
        category: "Technical",
        name: "Laboratory Facilities",
        type: "benefit"
    },

    {
        category: "Technical",
        name: "Process Equipment",
        type: "benefit"
    },

    {
        category: "Technical",
        name: "Engineering Software",
        type: "benefit"
    },

    {
        category: "Technical",
        name: "Technical Manpower",
        type: "benefit"
    },

    {
        category: "Technical",
        name: "Process Optimization Capability",
        type: "benefit"
    },

    // ========================================
    // OPERATIONAL - 3
    // ========================================

    {
        category: "Operational",
        name: "Infrastructure Availability",
        type: "benefit"
    },

    {
        category: "Operational",
        name: "Maintenance Systems",
        type: "benefit"
    },

    {
        category: "Operational",
        name: "Industrial Utilities",
        type: "benefit"
    },

    // ========================================
    // ENVIRONMENTAL & SAFETY - 4
    // ========================================

    {
        category: "Environmental & Safety",
        name: "Environmental Compliance",
        type: "benefit"
    },

    {
        category: "Environmental & Safety",
        name: "Waste Management Capability",
        type: "benefit"
    },

    {
        category: "Environmental & Safety",
        name: "HAZOP/HAZID Capability",
        type: "benefit"
    },

    {
        category: "Environmental & Safety",
        name: "Safety Management Systems",
        type: "benefit"
    },

    // ========================================
    // FINANCIAL - 4
    // ========================================

    {
        category: "Financial",
        name: "Equipment Cost",
        type: "cost"
    },

    {
        category: "Financial",
        name: "Setup Cost",
        type: "cost"
    },

    {
        category: "Financial",
        name: "Operating Cost",
        type: "cost"
    },

    {
        category: "Financial",
        name: "Maintenance Cost",
        type: "cost"
    },

    // ========================================
    // REGULATORY - 3
    // ========================================

    {
        category: "Regulatory",
        name: "NUPRC Compliance",
        type: "benefit"
    },

    {
        category: "Regulatory",
        name: "Laboratory Certification",
        type: "benefit"
    },

    {
        category: "Regulatory",
        name: "Environmental Permits",
        type: "benefit"
    }

];

// ========================================
// DEFAULT ALTERNATIVES
// ========================================

const alternatives = [

    "Process Optimization-Focused Firm",

    "Environmental Compliance-Focused Firm",

    "Laboratory Testing-Focused Firm"

];

// ========================================
// API URL
// ========================================
//
// LOCAL:
// http://localhost:5000
//
// PRODUCTION:
// We will put the Railway URL here AFTER
// local testing succeeds.
//
// ========================================

const API_BASE_URL = "https://engineerai-dss-production.up.railway.app";

// ========================================
// GENERATE CRITERIA TABLE
// ========================================

function generateCriteriaTable() {

    criteriaTableBody.innerHTML = "";

    let currentCategory = "";

    criteria.forEach(
        (criterion, index) => {

            // ========================================
            // CATEGORY ROW
            // ========================================

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
                    <td colspan="6">
                        ${criterion.category}
                    </td>
                `;

                criteriaTableBody.appendChild(
                    categoryRow
                );

            }

            // ========================================
            // CRITERION ROW
            // ========================================

            const row =
                document.createElement("tr");

            const isCost =
                criterion.type === "cost";

            const inputAttributes =
                isCost
                    ? `
                        type="number"
                        class="score-input financial-input"
                        min="0.01"
                        step="0.01"
                        inputmode="decimal"
                        placeholder="e.g. 6958400"
                      `
                    : `
                        type="number"
                        class="score-input"
                        min="1"
                        max="10"
                        step="1"
                        inputmode="numeric"
                        placeholder="1-10"
                      `;

            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>

                    <strong>
                        ${criterion.name}
                    </strong>

                    ${
                        isCost
                            ? `
                                <small class="criterion-help">
                                    Enter actual amount in ₦
                                </small>
                              `
                            : `
                                <small class="criterion-help">
                                    Rate from 1 to 10
                                </small>
                              `
                    }

                </td>

                <td>

                    <span class="criterion-type">
                        ${criterion.type}
                    </span>

                </td>

                <td>

                    <input
                        ${inputAttributes}
                        data-criterion="${criterion.name}"
                        data-index="${index}"
                        data-alternative="0"
                        aria-label="${criterion.name} - Alternative 1"
                    >

                </td>

                <td>

                    <input
                        ${inputAttributes}
                        data-criterion="${criterion.name}"
                        data-index="${index}"
                        data-alternative="1"
                        aria-label="${criterion.name} - Alternative 2"
                    >

                </td>

                <td>

                    <input
                        ${inputAttributes}
                        data-criterion="${criterion.name}"
                        data-index="${index}"
                        data-alternative="2"
                        aria-label="${criterion.name} - Alternative 3"
                    >

                </td>

            `;

            criteriaTableBody.appendChild(
                row
            );

        }
    );

    updateAlternativeHeaders();

    attachInputListeners();

}

// ========================================
// UPDATE ALTERNATIVE HEADERS
// ========================================

function updateAlternativeHeaders() {

    alternatives.forEach(
        (alternative, index) => {

            const input =
                document.getElementById(
                    `alternative${index}`
                );

            const header =
                document.getElementById(
                    `alternativeHeader${index}`
                );

            if (
                !input ||
                !header
            ) {
                return;
            }

            const update =
                () => {

                    const value =
                        input.value.trim();

                    header.textContent =
                        value ||
                        `Alternative ${index + 1}`;

                };

            input.addEventListener(
                "input",
                update
            );

            update();

        }
    );

}

// ========================================
// INPUT STATUS
// ========================================

function attachInputListeners() {

    const inputs =
        document.querySelectorAll(
            ".score-input"
        );

    inputs.forEach(
        (input) => {

            input.addEventListener(
                "input",
                () => {

                    statusMessage.textContent =
                        "";

                }
            );

        }
    );

}

// ========================================
// GET ALTERNATIVE NAMES
// ========================================

function getAlternativeNames() {

    const names =
        alternatives.map(
            (_, index) => {

                const input =
                    document.getElementById(
                        `alternative${index}`
                    );

                return input
                    ? input.value.trim()
                    : "";

            }
        );

    names.forEach(
        (name, index) => {

            if (!name) {

                throw new Error(
                    `Please enter a name for Alternative ${
                        index + 1
                    }.`
                );

            }

        }
    );

    const normalized =
        names.map(
            (name) =>
                name.toLowerCase()
        );

    if (
        new Set(normalized).size !== 3
    ) {

        throw new Error(
            "Alternative names must be unique."
        );

    }

    return names;

}

// ========================================
// GET DECISION MATRIX
// ========================================
//
// Backend expects:
//
// 3 alternatives × 19 criteria
//
// Financial:
// actual ₦ amount
//
// Everything else:
// 1 - 10
//
// ========================================

function getDecisionMatrix() {

    const inputs =
        document.querySelectorAll(
            ".score-input"
        );

    const expectedInputs =
        criteria.length * 3;

    if (
        inputs.length !==
        expectedInputs
    ) {

        throw new Error(
            `The system expected ${
                expectedInputs
            } input fields but found ${
                inputs.length
            }.`
        );

    }

    const decisionMatrix = [

        new Array(
            criteria.length
        ).fill(null),

        new Array(
            criteria.length
        ).fill(null),

        new Array(
            criteria.length
        ).fill(null)

    ];

    inputs.forEach(
        (input) => {

            const criterionIndex =
                Number(
                    input.dataset.index
                );

            const alternativeIndex =
                Number(
                    input.dataset.alternative
                );

            const criterion =
                criteria[
                    criterionIndex
                ];

            const rawValue =
                input.value.trim();

            const value =
                Number(rawValue);

            // ========================================
            // GENERAL VALIDATION
            // ========================================

            if (
                rawValue === "" ||
                !Number.isFinite(value)
            ) {

                throw new Error(
                    `Enter a valid value for "${
                        criterion.name
                    }" in Alternative ${
                        alternativeIndex + 1
                    }.`
                );

            }

            // ========================================
            // FINANCIAL VALIDATION
            // ========================================

            if (
                criterion.type === "cost"
            ) {

                if (
                    value <= 0
                ) {

                    throw new Error(
                        `"${criterion.name}" must be greater than ₦0 for Alternative ${
                            alternativeIndex + 1
                        }.`
                    );

                }

            }

            // ========================================
            // NON-FINANCIAL VALIDATION
            // ========================================

            else {

                if (
                    value < 1 ||
                    value > 10
                ) {

                    throw new Error(
                        `"${criterion.name}" must be between 1 and 10 for Alternative ${
                            alternativeIndex + 1
                        }.`
                    );

                }

                if (
                    !Number.isInteger(value)
                ) {

                    throw new Error(
                        `"${criterion.name}" must be a whole number from 1 to 10.`
                    );

                }

            }

            // ========================================
            // STORE VALUE
            // ========================================

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

            if (
                row.length !==
                criteria.length
            ) {

                throw new Error(
                    `Alternative ${
                        alternativeIndex + 1
                    } does not contain ${
                        criteria.length
                    } criteria.`
                );

            }

            row.forEach(
                (value, criterionIndex) => {

                    if (
                        value === null ||
                        value === undefined
                    ) {

                        throw new Error(
                            `Missing value for "${
                                criteria[
                                    criterionIndex
                                ].name
                            }" in Alternative ${
                                alternativeIndex + 1
                            }.`
                        );

                    }

                }
            );

        }
    );

    console.log(
        "FINAL 19-CRITERION DECISION MATRIX:",
        decisionMatrix
    );

    return decisionMatrix;

}

// ========================================
// GET CRITERIA TYPES
// ========================================

function getCriteriaTypes() {

    return criteria.map(
        (criterion) =>
            criterion.type
    );

}

// ========================================
// RUN DSS ANALYSIS
// ========================================

async function runAnalysis() {

    try {

        // ========================================
        // DISABLE BUTTON
        // ========================================

        runAnalysisBtn.disabled =
            true;

        statusMessage.textContent =
            "Running decision analysis...";

        // ========================================
        // GET ALTERNATIVES
        // ========================================

        const currentAlternatives =
            getAlternativeNames();

        // ========================================
        // GET MATRIX
        // ========================================

        const decisionMatrix =
            getDecisionMatrix();

        // ========================================
        // GET CRITERIA TYPES
        // ========================================

        const criteriaTypes =
            getCriteriaTypes();

        // ========================================
        // DEBUG
        // ========================================

        console.log(
            "Alternatives:",
            currentAlternatives
        );

        console.log(
            "Alternatives count:",
            currentAlternatives.length
        );

        console.log(
            "Criteria count:",
            criteria.length
        );

        console.log(
            "Criteria types:",
            criteriaTypes
        );

        console.log(
            "Decision matrix:",
            decisionMatrix
        );

        console.log(
            "Decision matrix rows:",
            decisionMatrix.length
        );

        console.log(
            "Decision matrix columns:",
            decisionMatrix[0].length
        );

        // ========================================
        // SEND TO BACKEND
        // ========================================

        const response =
            await fetch(
                `${API_BASE_URL}/api/dss/run`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            decisionMatrix,

                            alternatives:
                                currentAlternatives,

                            criteriaTypes

                        })

                }
            );

        // ========================================
        // READ RESPONSE
        // ========================================

        let data;

        try {

            data =
                await response.json();

        }

        catch {

            throw new Error(
                `Server returned an invalid response (${
                    response.status
                }).`
            );

        }

        console.log(
            "DSS Server Response:",
            data
        );

        // ========================================
        // SERVER ERROR
        // ========================================

        if (
            !response.ok
        ) {

            throw new Error(

                data.message ||
                data.error ||
                `Server error: ${
                    response.status
                }`

            );

        }

        // ========================================
        // DSS ERROR
        // ========================================

        if (
            !data.success
        ) {

            throw new Error(

                data.message ||
                data.error ||
                "DSS analysis failed."

            );

        }

        // ========================================
        // SAVE RESULT
        // ========================================

        sessionStorage.setItem(

            "dssResult",

            JSON.stringify(
                data.result
            )

        );

        // ========================================
        // SUCCESS
        // ========================================

        statusMessage.textContent =
            "Analysis completed successfully. Redirecting...";

        // ========================================
        // DASHBOARD
        // ========================================

        window.location.href =
            "./dashboard.html";

    }

    catch (error) {

        console.error(
            "DSS Analysis Error:",
            error
        );

        statusMessage.textContent =
            error.message ||
            "Unable to run DSS analysis.";

        runAnalysisBtn.disabled =
            false;

    }

}

// ========================================
// RESET
// ========================================

function resetAnalysis() {

    const inputs =
        document.querySelectorAll(
            ".score-input"
        );

    inputs.forEach(
        (input) => {

            input.value = "";

        }
    );

    statusMessage.textContent =
        "All scores have been cleared.";

}

// ========================================
// BUTTON EVENTS
// ========================================

if (
    runAnalysisBtn
) {

    runAnalysisBtn.addEventListener(
        "click",
        runAnalysis
    );

}

if (
    resetAnalysisBtn
) {

    resetAnalysisBtn.addEventListener(
        "click",
        resetAnalysis
    );

}

// ========================================
// INITIALIZE
// ========================================

generateCriteriaTable();
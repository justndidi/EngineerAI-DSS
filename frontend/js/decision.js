// ========================================
// ENGINEERAI DSS DECISION INPUT
// 7 CRITERIA / 19 SUB-CRITERIA
// RATING SCALE: 1-9
// ========================================

const API_BASE_URL =
    "https://engineerai-dss.onrender.com";

// ========================================
// DOM ELEMENTS
// ========================================

const criteriaTableBody =
    document.getElementById(
        "criteriaTableBody"
    );

const runAnalysisBtn =
    document.getElementById(
        "runAnalysisBtn"
    );

const statusMessage =
    document.getElementById(
        "statusMessage"
    );

const resetAnalysisBtn =
    document.getElementById(
        "resetAnalysisBtn"
    );

// ========================================
// CRITERIA
// ========================================

const criteria = [

    // TECHNICAL - 3

    {
        category: "Technical",
        name: "Technical Manpower",
        type: "benefit"
    },

    {
        category: "Technical",
        name: "Technical Tools and Facilities",
        type: "benefit"
    },

    {
        category: "Technical",
        name: "Service-Specific Capability",
        type: "benefit"
    },

    // OPERATIONAL - 3

    {
        category: "Operational",
        name: "Facilities and Utilities",
        type: "benefit"
    },

    {
        category: "Operational",
        name: "Maintenance and Quality Systems",
        type: "benefit"
    },

    {
        category: "Operational",
        name: "Logistics and Project Delivery",
        type: "benefit"
    },

    // ENVIRONMENTAL & SAFETY - 3

    {
        category: "Environmental & Safety",
        name: "Environmental Compliance and Waste Management",
        type: "benefit"
    },

    {
        category: "Environmental & Safety",
        name: "Process-Hazard Analysis Capability",
        type: "benefit"
    },

    {
        category: "Environmental & Safety",
        name: "Safety Management System",
        type: "benefit"
    },

    // FINANCIAL - 3

    {
        category: "Financial",
        name: "Initial Capital Requirement",
        type: "cost"
    },

    {
        category: "Financial",
        name: "Operating and Maintenance Burden",
        type: "cost"
    },

    {
        category: "Financial",
        name: "Funding/Financial Resilience",
        type: "benefit"
    },

    // REGULATORY - 3

    {
        category: "Regulatory",
        name: "Petroleum-Sector Registration/Compliance",
        type: "benefit"
    },

    {
        category: "Regulatory",
        name: "Laboratory Quality/Accreditation Readiness",
        type: "benefit"
    },

    {
        category: "Regulatory",
        name: "Environmental Permits/Approvals",
        type: "benefit"
    },

    // COMMERCIAL FEASIBILITY - 3

    {
        category: "Commercial Feasibility",
        name: "Client Demand",
        type: "benefit"
    },

    {
        category: "Commercial Feasibility",
        name: "Contract Access and Business Development",
        type: "benefit"
    },

    {
        category: "Commercial Feasibility",
        name: "Competitive Position",
        type: "benefit"
    },

    // SCALE - 1

    {
        category: "Scale",
        name: "Scale Suitability",
        type: "benefit"
    }

];

// ========================================
// ALTERNATIVES
// ========================================

const alternatives = [
    "Alternative 1",
    "Alternative 2",
    "Alternative 3"
];

// ========================================
// GENERATE TABLE
// ========================================

function generateCriteriaTable() {

    criteriaTableBody.innerHTML = "";

    let currentCategory = "";

    criteria.forEach(
        (criterion, index) => {

            if (
                criterion.category !==
                currentCategory
            ) {

                currentCategory =
                    criterion.category;

                const categoryRow =
                    document.createElement(
                        "tr"
                    );

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

            const row =
                document.createElement(
                    "tr"
                );

            const inputAttributes = `
                type="number"
                min="1"
                max="9"
                step="any"
                class="score-input"
                required
            `;

            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${criterion.name}
                </td>

                <td>
                    <span class="criterion-type ${criterion.type}">
                        ${
                            criterion.type ===
                            "cost"
                                ? "Cost"
                                : "Benefit"
                        }
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
        (_, index) => {

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
// INPUT LISTENERS
// ========================================

function attachInputListeners() {

    const inputs =
        document.querySelectorAll(
            ".score-input"
        );

    inputs.forEach(
        input => {

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
// ALTERNATIVE NAMES
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
            name =>
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
// DECISION MATRIX
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
        input => {

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

            if (
                rawValue === "" ||
                !Number.isFinite(value)
            ) {

                throw new Error(
                    `Enter a valid rating for "${criterion.name}" in Alternative ${
                        alternativeIndex + 1
                    }.`
                );

            }

            if (
                value < 1 ||
                value > 9
            ) {

                throw new Error(
                    `"${criterion.name}" must be rated from 1 to 9.`
                );

            }

            

            decisionMatrix[
                alternativeIndex
            ][
                criterionIndex
            ] = value;

        }
    );

    decisionMatrix.forEach(
        (row, alternativeIndex) => {

            if (
                row.length !==
                criteria.length
            ) {

                throw new Error(
                    `Alternative ${
                        alternativeIndex + 1
                    } must contain exactly ${
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
        "FINAL 19-SUB-CRITERION DECISION MATRIX:",
        decisionMatrix
    );

    return decisionMatrix;

}

// ========================================
// CRITERIA TYPES
// ========================================

function getCriteriaTypes() {

    return criteria.map(
        criterion =>
            criterion.type
    );

}

// ========================================
// RUN ANALYSIS
// ========================================

async function runAnalysis() {

    try {

        runAnalysisBtn.disabled =
            true;

        statusMessage.textContent =
            "Running decision analysis...";

        const currentAlternatives =
            getAlternativeNames();

        const decisionMatrix =
            getDecisionMatrix();

        const criteriaTypes =
            getCriteriaTypes();

        console.log(
            "Alternatives:",
            currentAlternatives
        );

        console.log(
            "Criteria count:",
            criteria.length
        );

        console.log(
            "Decision matrix:",
            decisionMatrix
        );

        const controller =
            new AbortController();

        const timeoutId =
            setTimeout(
                () => controller.abort(),
                60000
            );

        const response =
            await fetch(
                `${API_BASE_URL}/api/dss/run`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
    decisionMatrix,
    alternatives: currentAlternatives,
    criteriaTypes
}),

                    signal: controller.signal
                }
            );

        clearTimeout(timeoutId);

        let data;

        try {

            data =
                await response.json();

        }
        catch {

            throw new Error(
                `Server returned an invalid response (${response.status}).`
            );

        }

        console.log(
            "DSS Server Response:",
            data
        );

        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                `Server error: ${response.status}`
            );

        }

        if (!data.success) {

            throw new Error(
                data.message ||
                data.error ||
                "DSS analysis failed."
            );

        }

        sessionStorage.setItem(
            "dssResult",
            JSON.stringify(
                data.result
            )
        );

        sessionStorage.setItem(
            "decisionMatrix",
            JSON.stringify(
                decisionMatrix
            )
        );

        sessionStorage.setItem(
            "alternatives",
            JSON.stringify(
                currentAlternatives
            )
        );

        statusMessage.textContent =
            "Analysis completed successfully. Redirecting...";

        window.location.href =
            "./dashboard.html";

    }
    catch (error) {

        console.error(
            "DSS Analysis Error:",
            error
        );

        statusMessage.textContent =
            error.name === "AbortError"
                ? "The analysis took too long to complete. Please try again."
                : error.message ||
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
        input => {
            input.value = "";
        }
    );

    sessionStorage.removeItem(
        "dssResult"
    );

    sessionStorage.removeItem(
        "decisionMatrix"
    );

    sessionStorage.removeItem(
        "alternatives"
    );

    statusMessage.textContent =
        "All ratings have been cleared.";

}

// ========================================
// BUTTONS
// ========================================

if (runAnalysisBtn) {

    runAnalysisBtn.addEventListener(
        "click",
        runAnalysis
    );

}

if (resetAnalysisBtn) {

    resetAnalysisBtn.addEventListener(
        "click",
        resetAnalysis
    );

}

// ========================================
// INITIALIZE
// ========================================

generateCriteriaTable();
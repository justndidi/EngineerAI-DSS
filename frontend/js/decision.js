// ========================================
// ENGINEERAI DSS DECISION INPUT
// 22-CRITERION MODEL
// ========================================

// ========================================
// ELEMENTS
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
// 22 CRITERIA
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
    // REGULATORY - 6
    // ========================================

    {
        category: "Regulatory",
        name: "NUPRC Compliance",
        type: "benefit"
    },
    {
        category: "Regulatory",
        name: "NMDPRA Compliance",
        type: "benefit"
    },
    {
        category: "Regulatory",
        name: "NCDMB Compliance",
        type: "benefit"
    },
    {
        category: "Regulatory",
        name: "NOSDRA Compliance",
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
// API
// ========================================

const API_BASE_URL =
    "https://engineerai-dss-production.up.railway.app";

// ========================================
// GENERATE TABLE
// ========================================

function generateCriteriaTable() {

    criteriaTableBody.innerHTML = "";

    let currentCategory = "";

    criteria.forEach((criterion, index) => {

        // Category header
        if (criterion.category !== currentCategory) {

            currentCategory = criterion.category;

            const categoryRow =
                document.createElement("tr");

            categoryRow.className =
                "category-row";

            const categoryCell =
                document.createElement("td");

            categoryCell.colSpan = 6;

            categoryCell.textContent =
                criterion.category;

            categoryRow.appendChild(categoryCell);

            criteriaTableBody.appendChild(
                categoryRow
            );
        }

        const row =
            document.createElement("tr");

        const numberCell =
            document.createElement("td");

        numberCell.textContent =
            index + 1;

        const criterionCell =
            document.createElement("td");

        criterionCell.textContent =
            criterion.name;

        const typeCell =
            document.createElement("td");

        typeCell.textContent =
            criterion.type === "cost"
                ? "Cost"
                : "Benefit";

        row.appendChild(numberCell);
        row.appendChild(criterionCell);
        row.appendChild(typeCell);

        for (let alternativeIndex = 0; alternativeIndex < 3; alternativeIndex++) {

            const cell =
                document.createElement("td");

            const input =
                document.createElement("input");

            input.type = "number";

            input.className =
                "score-input";

            input.dataset.criterionIndex =
                index;

            input.dataset.alternativeIndex =
                alternativeIndex;

            input.required = true;

            if (criterion.type === "cost") {

                input.min = "0.01";
                input.step = "0.01";

                input.placeholder =
                    "Enter amount in ₦";

                input.title =
                    "Enter actual amount in Nigerian Naira";

            } else {

                input.min = "1";
                input.max = "10";
                input.step = "1";

                input.placeholder =
                    "1 - 10";
            }

            cell.appendChild(input);

            row.appendChild(cell);
        }

        criteriaTableBody.appendChild(row);
    });

    updateAlternativeHeaders();
}

// ========================================
// ALTERNATIVE HEADERS
// ========================================

function updateAlternativeHeaders() {

    for (let i = 0; i < 3; i++) {

        const input =
            document.getElementById(
                `alternative${i}`
            );

        const header =
            document.getElementById(
                `alternativeHeader${i}`
            );

        if (!input || !header) {
            continue;
        }

        const update = () => {

            header.textContent =
                input.value.trim() ||
                `Alternative ${i + 1}`;
        };

        input.addEventListener(
            "input",
            update
        );

        update();
    }
}

// ========================================
// GET ALTERNATIVES
// ========================================

function getAlternatives() {

    return [0, 1, 2].map(index => {

        const input =
            document.getElementById(
                `alternative${index}`
            );

        return input.value.trim();
    });
}

// ========================================
// GET DECISION MATRIX
// ========================================

function getDecisionMatrix() {

    const matrix = [
        [],
        [],
        []
    ];

    const inputs =
        document.querySelectorAll(
            ".score-input"
        );

    if (inputs.length !== 66) {

        throw new Error(
            `Expected 66 input fields, but found ${inputs.length}.`
        );
    }

    inputs.forEach(input => {

        const criterionIndex =
            Number(
                input.dataset.criterionIndex
            );

        const alternativeIndex =
            Number(
                input.dataset.alternativeIndex
            );

        const criterion =
            criteria[criterionIndex];

        const value =
            Number(input.value);

        if (input.value === "") {

            throw new Error(
                `Please enter a value for "${criterion.name}" in Alternative ${
                    alternativeIndex + 1
                }.`
            );
        }

        if (!Number.isFinite(value)) {

            throw new Error(
                `Invalid value for "${criterion.name}" in Alternative ${
                    alternativeIndex + 1
                }.`
            );
        }

        if (criterion.type === "cost") {

            if (value <= 0) {

                throw new Error(
                    `"${criterion.name}" must be greater than 0.`
                );
            }

        } else {

            if (
                value < 1 ||
                value > 10
            ) {

                throw new Error(
                    `"${criterion.name}" must be between 1 and 10.`
                );
            }
        }

        matrix[alternativeIndex][criterionIndex] =
            value;
    });

    return matrix;
}

// ========================================
// RUN ANALYSIS
// ========================================

async function runAnalysis() {

    try {

        runAnalysisBtn.disabled = true;

        statusMessage.textContent =
            "Running AHP-TOPSIS analysis...";

        const currentAlternatives =
            getAlternatives();

        if (
            currentAlternatives.some(
                name => !name
            )
        ) {

            throw new Error(
                "Please enter all three alternative names."
            );
        }

        if (
            new Set(
                currentAlternatives.map(
                    name => name.toLowerCase()
                )
            ).size !== 3
        ) {

            throw new Error(
                "Alternative names must be unique."
            );
        }

        const decisionMatrix =
            getDecisionMatrix();

        console.log(
            "22-criterion decision matrix:",
            decisionMatrix
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
                        alternatives:
                            currentAlternatives,

                        criteriaTypes:
                            criteria.map(
                                criterion =>
                                    criterion.type
                            )
                    })
                }
            );

        let data;

        try {

            data =
                await response.json();

        } catch {

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
            JSON.stringify(data.result)
        );

        statusMessage.textContent =
            "Analysis completed successfully. Redirecting...";

        window.location.href =
            "./dashboard.html";

    } catch (error) {

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

    inputs.forEach(input => {
        input.value = "";
    });

    statusMessage.textContent =
        "All scores have been cleared.";
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
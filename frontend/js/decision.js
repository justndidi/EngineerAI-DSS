// ========================================
// ENGINEERAI DECISION ANALYSIS
// EXCEL-BASED DSS
// ========================================

// ========================================
// ELEMENTS
// ========================================

const criteriaTableBody = document.getElementById("criteriaTableBody");

const runAnalysisBtn = document.getElementById("runAnalysisBtn");

const resetAnalysisBtn = document.getElementById("resetAnalysisBtn");

const statusMessage = document.getElementById("statusMessage");

// ========================================
// ALTERNATIVE INPUTS
// ========================================

const alternativeInputs = [
  document.getElementById("alternative0"),

  document.getElementById("alternative1"),

  document.getElementById("alternative2"),
];

// ========================================
// CRITERIA
//
// These MUST match the Excel workbook.
// Excel remains the calculation engine.
// ========================================

const criteria = [
  // ========================================
  // TECHNICAL
  // ========================================

  {
    category: "Technical",
    name: "Laboratory Facilities",
    type: "benefit",
  },

  {
    category: "Technical",
    name: "Process Equipment",
    type: "benefit",
  },

  {
    category: "Technical",
    name: "Engineering Software",
    type: "benefit",
  },

  {
    category: "Technical",
    name: "Technical Manpower",
    type: "benefit",
  },

  {
    category: "Technical",
    name: "Process Optimization Capability",
    type: "benefit",
  },

  // ========================================
  // OPERATIONAL
  // ========================================

  {
    category: "Operational",
    name: "Infrastructure Availability",
    type: "benefit",
  },

  {
    category: "Operational",
    name: "Maintenance Systems",
    type: "benefit",
  },

  {
    category: "Operational",
    name: "Industrial Utilities",
    type: "benefit",
  },

  // ========================================
  // ENVIRONMENTAL & SAFETY
  // ========================================

  {
    category: "Environmental & Safety",
    name: "Environmental Compliance",
    type: "benefit",
  },

  {
    category: "Environmental & Safety",
    name: "Waste Management Capability",
    type: "benefit",
  },

  {
    category: "Environmental & Safety",
    name: "HAZOP/HAZID Capability",
    type: "benefit",
  },

  {
    category: "Environmental & Safety",
    name: "Safety Management Systems",
    type: "benefit",
  },

  // ========================================
  // FINANCIAL
  // ========================================

  {
    category: "Financial",
    name: "Equipment Cost",
    type: "benefit",
  },

  {
    category: "Financial",
    name: "Setup Cost",
    type: "benefit",
  },

  {
    category: "Financial",
    name: "Maintenance Cost",
    type: "benefit",
  },

  // ========================================
  // REGULATORY
  // ========================================

  {
    category: "Regulatory",
    name: "NUPRC Compliance",
    type: "cost",
  },

  {
    category: "Regulatory",
    name: "Laboratory Certification",
    type: "cost",
  },

  {
    category: "Regulatory",
    name: "Environmental Permits",
    type: "cost",
  },
];

// ========================================
// API
// ========================================

const API_BASE_URL = "http://localhost:5000";

// ========================================
// GENERATE TABLE
// ========================================

function generateCriteriaTable() {
  criteriaTableBody.innerHTML = "";

  let currentCategory = "";

  criteria.forEach((criterion, index) => {
    // ========================================
    // CATEGORY HEADER
    // ========================================

    if (criterion.category !== currentCategory) {
      currentCategory = criterion.category;

      const categoryRow = document.createElement("tr");

      categoryRow.className = "category-row";

      categoryRow.innerHTML = `

                    <td colspan="6">
                        ${criterion.category}
                    </td>

                `;

      criteriaTableBody.appendChild(categoryRow);
    }

    // ========================================
    // CRITERION ROW
    // ========================================

    const row = document.createElement("tr");

    row.innerHTML = `

                <td class="criteria-number">
                    ${index + 1}
                </td>

                <td class="criterion-name">
                    ${criterion.name}
                </td>

                <td>

                    <span
                        class="type-badge type-${criterion.type}"
                    >
                        ${criterion.type}
                    </span>

                </td>

                ${createScoreInput(index, 0, criterion.name)}

                ${createScoreInput(index, 1, criterion.name)}

                ${createScoreInput(index, 2, criterion.name)}

            `;

    criteriaTableBody.appendChild(row);
  });
}

// ========================================
// SCORE INPUT
// ========================================

function createScoreInput(criterionIndex, alternativeIndex, criterionName) {
  return `

        <td>

            <input
                type="number"
                class="score-input"
                min="1"
                max="10"
                step="1"
                placeholder="1-10"

                data-index="${criterionIndex}"

                data-alternative="${alternativeIndex}"

                data-criterion="${criterionName}"
            >

        </td>

    `;
}

// ========================================
// GET ALTERNATIVE NAMES
// ========================================

function getAlternatives() {
  const alternatives = alternativeInputs.map((input) => input.value.trim());

  alternatives.forEach((name, index) => {
    if (!name) {
      throw new Error(`Please enter a name for Alternative ${index + 1}.`);
    }
  });

  const uniqueNames = new Set(alternatives.map((name) => name.toLowerCase()));

  if (uniqueNames.size !== 3) {
    throw new Error("Each alternative must have a different name.");
  }

  return alternatives;
}

// ========================================
// GET DECISION MATRIX
// ========================================

function getDecisionMatrix() {
  const inputs = document.querySelectorAll(".score-input");

  if (inputs.length !== 54) {
    throw new Error(
      `The system expected 54 score fields but found ${inputs.length}.`,
    );
  }

  // ========================================
  // 3 ALTERNATIVES × 18 CRITERIA
  // ========================================

  const decisionMatrix = [
    new Array(18).fill(null),

    new Array(18).fill(null),

    new Array(18).fill(null),
  ];

  inputs.forEach((input) => {
    const criterionIndex = Number(input.dataset.index);

    const alternativeIndex = Number(input.dataset.alternative);

    const value = Number(input.value);

    if (
      input.value === "" ||
      !Number.isFinite(value) ||
      value < 1 ||
      value > 10
    ) {
      throw new Error(
        `Enter a score from 1 to 10 for "${input.dataset.criterion}".`,
      );
    }

    decisionMatrix[alternativeIndex][criterionIndex] = value;
  });

  decisionMatrix.forEach((row, alternativeIndex) => {
    row.forEach((value, criterionIndex) => {
      if (value === null || value === undefined) {
        throw new Error(
          `Missing score for Alternative ${alternativeIndex + 1}, criterion ${criterionIndex + 1}.`,
        );
      }
    });
  });

  return decisionMatrix;
}

// ========================================
// GET CRITERIA TYPES
// ========================================

function getCriteriaTypes() {
  return criteria.map((criterion) => criterion.type);
}

// ========================================
// RUN ANALYSIS
// ========================================

async function runAnalysis() {
  try {
    runAnalysisBtn.disabled = true;

    statusMessage.textContent = "Sending decision data to Excel...";

    // ========================================
    // ALTERNATIVES
    // ========================================

    const alternatives = getAlternatives();

    // ========================================
    // MATRIX
    // ========================================

    const decisionMatrix = getDecisionMatrix();

    // ========================================
    // TYPES
    // ========================================

    const criteriaTypes = getCriteriaTypes();

    console.log("Alternatives:", alternatives);

    console.log("Decision Matrix:", decisionMatrix);

    // ========================================
    // SEND TO EXPRESS
    // ========================================

    const response = await fetch(`${API_BASE_URL}/api/dss/run`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        decisionMatrix,

        alternatives,

        criteriaTypes,
      }),
    });

    // ========================================
    // READ RESPONSE SAFELY
    // ========================================

    const rawResponse = await response.text();

    let data;

    try {
      data = JSON.parse(rawResponse);
    } catch (error) {
      throw new Error(
        `Server returned an invalid response: ${rawResponse.substring(0, 300)}`,
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message || data.error || `Server error: ${response.status}`,
      );
    }

    if (!data.success) {
      throw new Error(
        data.message || data.error || "Decision analysis failed.",
      );
    }

    // ========================================
    // SAVE RESULT
    // ========================================

    sessionStorage.setItem(
      "dssResult",

      JSON.stringify(data.result),
    );

    // ========================================
    // SAVE ALTERNATIVE NAMES
    // ========================================

    sessionStorage.setItem(
      "dssAlternatives",

      JSON.stringify(alternatives),
    );

    // ========================================
    // SUCCESS
    // ========================================

    statusMessage.textContent =
      "Excel analysis completed successfully. Redirecting...";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 500);
  } catch (error) {
    console.error("DSS Analysis Error:", error);

    statusMessage.textContent = error.message;

    runAnalysisBtn.disabled = false;
  }
}

// ========================================
// RESET
// ========================================

function resetAnalysis() {
  alternativeInputs.forEach((input) => {
    input.value = "";
  });

  document.querySelectorAll(".score-input").forEach((input) => {
    input.value = "";
  });

  document.getElementById("alternativeHeader0").textContent = "Alternative 1";

  document.getElementById("alternativeHeader1").textContent = "Alternative 2";

  document.getElementById("alternativeHeader2").textContent = "Alternative 3";

  statusMessage.textContent = "All decision data has been cleared.";
}

// ========================================
// UPDATE TABLE HEADERS
// ========================================

alternativeInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    const name = input.value.trim();

    const header = document.getElementById(`alternativeHeader${index}`);

    header.textContent = name || `Alternative ${index + 1}`;
  });
});

// ========================================
// BUTTON EVENTS
// ========================================

runAnalysisBtn.addEventListener("click", runAnalysis);

resetAnalysisBtn.addEventListener("click", resetAnalysis);

// ========================================
// INITIALIZE
// ========================================

generateCriteriaTable();

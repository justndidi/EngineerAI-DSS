// ========================================
// ENGINEERAI DSS DASHBOARD
// ========================================

// ========================================
// API BASE URL
// ========================================

const API_BASE_URL = "https://engineerai-dss.onrender.com";

// ========================================
// GET ELEMENTS
// ========================================

const runDSSBtn = document.getElementById("runDSSBtn");

const analysisStatus = document.getElementById("analysisStatus");

const consistencyRatio = document.getElementById("consistencyRatio");

const consistencyStatus = document.getElementById("consistencyStatus");

const criteriaWeights = document.getElementById("criteriaWeights");

const rankingContainer = document.getElementById("rankingContainer");

const recommendationName = document.getElementById("recommendationName");

const recommendationScore = document.getElementById("recommendationScore");

const ahpChart = document.getElementById("ahpChart");

const topsisDetails = document.getElementById("topsisDetails");

// ========================================
// AHP CRITERIA
// ========================================

const criteria = [
  "Technical",
  "Operational",
  "Environmental & Safety",
  "Financial",
  "Regulatory",
  "Commercial Feasibility",
  "Scale",
];

// ========================================
// EMPTY STATE
// ========================================

function showEmptyState() {
  criteriaWeights.innerHTML = `
    <div class="empty-state">
      <strong>No analysis available</strong>
      Run a decision analysis to view the AHP results.
    </div>
  `;

  ahpChart.innerHTML = "";

  rankingContainer.innerHTML = `
    <div class="empty-state">
      <strong>No ranking available</strong>
      Run a decision analysis to view the TOPSIS ranking.
    </div>
  `;

  topsisDetails.innerHTML = "";

  recommendationName.textContent = "--";

  recommendationScore.textContent = "--";

  consistencyRatio.textContent = "--";

  consistencyStatus.textContent = "--";
}

// ========================================
// RUN DSS
// ========================================

async function runDSS() {
  try {
    analysisStatus.textContent = "Running decision analysis...";

    runDSSBtn.disabled = true;

    const decisionMatrix = JSON.parse(
      sessionStorage.getItem("decisionMatrix") || "[]"
    );

    const alternatives = JSON.parse(
      sessionStorage.getItem("alternatives") || "[]"
    );

    if (
      !Array.isArray(decisionMatrix) ||
      decisionMatrix.length === 0 ||
      !Array.isArray(alternatives) ||
      alternatives.length === 0
    ) {
      throw new Error(
        "No stored ratings found. Run a decision analysis first."
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/dss/run`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        decisionMatrix,

        alternatives,
      }),
    });

    const data = await response.json();

    console.log("DSS Dashboard Response:", data);

    if (!response.ok) {
      throw new Error(
        data.message || data.error || `Server error: ${response.status}`
      );
    }

    if (!data.success) {
      throw new Error(
        data.message || data.error || "DSS calculation failed."
      );
    }

    sessionStorage.setItem("dssResult", JSON.stringify(data.result));

    return data.result;
  } catch (error) {
    console.error("DSS Error:", error);

    analysisStatus.textContent =
      error.message || "Unable to run analysis.";

    return null;
  }
}

// ========================================
// DISPLAY AHP
// ========================================

function displayAHP(result) {
  if (!result || !result.ahp) {
    return;
  }

  const ahp = result.ahp;

  // ========================================
  // CONSISTENCY RATIO
  // ========================================

  const rawRatio = ahp.consistencyRatio;

  const ratio =
    rawRatio === null ||
    rawRatio === undefined ||
    rawRatio === ""
      ? NaN
      : Number(rawRatio);

  consistencyRatio.textContent = Number.isFinite(ratio)
    ? Math.abs(ratio).toFixed(4)
    : "--";

  // ========================================
  // CONSISTENCY STATUS
  // ========================================

  if (ahp.consistent) {
    consistencyStatus.textContent = "Consistent ✓";

    consistencyStatus.className = "consistent";
  } else {
    consistencyStatus.textContent = "Inconsistent ✕";

    consistencyStatus.className = "inconsistent";
  }

  // ========================================
  // CRITERIA WEIGHTS
  // ========================================

  criteriaWeights.innerHTML = "";

  const weights = Array.isArray(ahp.weights)
    ? ahp.weights
    : [];

  weights.forEach((weight, index) => {
    const percentage = Number(weight) * 100;

    const criterionName =
      criteria[index] ||
      ahp.weightDetails?.[index]?.criterion ||
      `Criterion ${index + 1}`;

    const item = document.createElement("div");

    item.className = "criterion-item";

    item.innerHTML = `
      <div class="criterion-info">
        <span>
          ${criterionName}
        </span>

        <strong>
          ${percentage.toFixed(2)}%
        </strong>
      </div>

      <div class="weight-bar">
        <div
          class="weight-fill"
          style="width: ${percentage}%">
        </div>
      </div>
    `;

    criteriaWeights.appendChild(item);
  });

  displayAHPChart(weights);
}

// ========================================
// AHP CHART
// ========================================

function displayAHPChart(weights) {
  ahpChart.innerHTML = "";

  weights.forEach((weight, index) => {
    const percentage = Number(weight) * 100;

    const criterionName =
      criteria[index] ||
      `Criterion ${index + 1}`;

    const chartItem = document.createElement("div");

    chartItem.className = "chart-item";

    chartItem.innerHTML = `
      <div class="chart-label">
        <span>
          ${criterionName}
        </span>

        <strong>
          ${percentage.toFixed(2)}%
        </strong>
      </div>

      <div class="chart-bar">
        <div
          class="chart-fill"
          style="width: ${percentage}%">
        </div>
      </div>
    `;

    ahpChart.appendChild(chartItem);
  });
}

// ========================================
// DISPLAY TOPSIS
// ========================================

function displayTOPSIS(result) {
  if (
    !result ||
    !result.topsis ||
    !Array.isArray(result.topsis.ranking)
  ) {
    return;
  }

  const ranking = result.topsis.ranking;

  rankingContainer.innerHTML = "";

  ranking.forEach((item) => {
    const rankingItem = document.createElement("div");

    rankingItem.className = "ranking-item";

    const score = Number(item.closenessCoefficient);

    rankingItem.innerHTML = `
      <div class="rank-number">
        ${item.rank}
      </div>

      <div class="alternative-info">
        <h3>
          ${item.alternative}
        </h3>

        <p>
          Closeness Coefficient:
          ${score.toFixed(4)}
        </p>
      </div>

      <div class="score">
        ${score.toFixed(4)}
      </div>
    `;

    rankingContainer.appendChild(rankingItem);
  });

  displayTOPSISDetails(ranking);
}

// ========================================
// TOPSIS DETAILS
// ========================================

function displayTOPSISDetails(ranking) {
  topsisDetails.innerHTML = "";

  ranking.forEach((item) => {
    const card = document.createElement("div");

    card.className = "topsis-detail";

    const score = Number(item.closenessCoefficient);

    const positiveDistance = Number(
      item.positiveDistance
    );

    const negativeDistance = Number(
      item.negativeDistance
    );

    card.innerHTML = `
      <div class="detail-header">
        <div>
          <span class="detail-rank">
            Rank ${item.rank}
          </span>

          <h3>
            ${item.alternative}
          </h3>
        </div>

        <strong class="detail-score">
          ${score.toFixed(4)}
        </strong>
      </div>

      <div class="detail-metrics">
        <div>
          <span>
            Closeness Coefficient
          </span>

          <strong>
            ${score.toFixed(4)}
          </strong>
        </div>

        <div>
          <span>
            Distance to Ideal (S+)
          </span>

          <strong>
            ${positiveDistance.toFixed(4)}
          </strong>
        </div>

        <div>
          <span>
            Distance to Negative Ideal (S-)
          </span>

          <strong>
            ${negativeDistance.toFixed(4)}
          </strong>
        </div>
      </div>
    `;

    topsisDetails.appendChild(card);
  });
}

// ========================================
// RECOMMENDATION
// ========================================

function displayRecommendation(result) {
  if (
    !result ||
    !result.topsis ||
    !result.topsis.recommendation
  ) {
    return;
  }

  const recommendation =
    result.topsis.recommendation;

  recommendationName.textContent =
    recommendation.alternative;

  recommendationScore.textContent = Number(
    recommendation.closenessCoefficient
  ).toFixed(4);
}

// ========================================
// DISPLAY COMPLETE RESULT
// ========================================

function displayResult(result) {
  if (!result) {
    showEmptyState();

    return;
  }

  displayAHP(result);

  displayTOPSIS(result);

  displayRecommendation(result);

  analysisStatus.textContent =
    "Analysis completed successfully ✓";
}

// ========================================
// LOAD SAVED RESULT
// ========================================

function loadSavedResult() {
  const savedResult =
    sessionStorage.getItem("dssResult");

  if (!savedResult) {
    showEmptyState();

    analysisStatus.textContent =
      "No analysis has been run yet.";

    return;
  }

  try {
    const result = JSON.parse(savedResult);

    console.log(
      "Loaded saved DSS result:",
      result
    );

    displayResult(result);
  } catch (error) {
    console.error(
      "Saved DSS result error:",
      error
    );

    sessionStorage.removeItem("dssResult");

    showEmptyState();
  }
}

// ========================================
// BUTTON
// ========================================

runDSSBtn.addEventListener(
  "click",
  async () => {
    const result = await runDSS();

    if (!result) {
      runDSSBtn.disabled = false;

      return;
    }

    displayResult(result);

    runDSSBtn.disabled = false;
  }
);

// ========================================
// INITIALIZE
// ========================================

loadSavedResult();
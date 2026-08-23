// ========================================
// DSS STATE SERVICE
// ========================================

let latestDSSResult = null;


// ========================================
// SAVE DSS RESULT
// ========================================

function setLatestDSSResult(result) {

    latestDSSResult = result;

}


// ========================================
// GET DSS RESULT
// ========================================

function getLatestDSSResult() {

    return latestDSSResult;

}


// ========================================
// CLEAR DSS RESULT
// ========================================

function clearLatestDSSResult() {

    latestDSSResult = null;

}


// ========================================
// EXPORT
// ========================================

module.exports = {

    setLatestDSSResult,

    getLatestDSSResult,

    clearLatestDSSResult

};
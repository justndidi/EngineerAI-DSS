const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { spawn } = require("child_process");
const ExcelJS = require("exceljs");

// ========================================
// WORKBOOK
// ========================================

const DEFAULT_WORKBOOK = path.join(
    __dirname,
    "..",
    "data",
    "EngineerAI_AHP_TOPSIS_7CRITERIA_19SUBCRITERIA_FINAL.xlsx"
);

const DEFAULT_LIBREOFFICE = "soffice";

const INPUT_SHEET = "CHATBOT_INPUT";
const OUTPUT_SHEET = "CHATBOT_OUTPUT";

// ========================================
// 19 SUB-CRITERIA
// ========================================

const CRITERIA = [

    // ========================================
    // 1. TECHNICAL - 3
    // ========================================

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

    // ========================================
    // 2. OPERATIONAL - 3
    // ========================================

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

    // ========================================
    // 3. ENVIRONMENTAL & SAFETY - 3
    // ========================================

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

    // ========================================
    // 4. FINANCIAL - 3
    // ========================================

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

    // ========================================
    // 5. REGULATORY - 3
    // ========================================

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

    // ========================================
    // 6. COMMERCIAL FEASIBILITY - 3
    // ========================================

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

    // ========================================
    // 7. SCALE - 1
    // ========================================

    {
        category: "Scale",
        name: "Scale Suitability",
        type: "benefit"
    }

];

// ========================================
// OUTPUT ROWS
// ========================================

const OUTPUT_ROWS = {

    alternativeACi: 2,
    alternativeBCi: 3,
    alternativeCCi: 4,

    bestAlternative: 5,

    rank1: 6,
    rank2: 7,
    rank3: 8,

    alternativeARank: 9,
    alternativeBRank: 10,
    alternativeCRank: 11,

    alternativeASPlus: 12,
    alternativeASMinus: 13,

    alternativeBSPlus: 14,
    alternativeBSMinus: 15,

    alternativeCSPlus: 16,
    alternativeCSMinus: 17,

    consistencyRatio: 18,
    consistencyStatus: 19,

    technicalWeight: 20,
    operationalWeight: 21,
    environmentalWeight: 22,
    financialWeight: 23,
    regulatoryWeight: 24,
    commercialWeight: 25,
    scaleWeight: 26

};

// ========================================
// PATH HELPERS
// ========================================

function getWorkbookPath() {

    return process.env.EXCEL_WORKBOOK_PATH
        ? path.resolve(process.env.EXCEL_WORKBOOK_PATH)
        : DEFAULT_WORKBOOK;

}

function getLibreOfficePath() {

    return process.env.LIBREOFFICE_PATH ||
        DEFAULT_LIBREOFFICE;

}

// ========================================
// RUN COMMAND
// ========================================

function runCommand(command, args) {

    return new Promise((resolve, reject) => {

        const child = spawn(
            command,
            args,
            {
                windowsHide: true,
                stdio: [
                    "ignore",
                    "pipe",
                    "pipe"
                ]
            }
        );

        let stdout = "";
        let stderr = "";

        child.stdout.on(
            "data",
            chunk => {
                stdout += chunk.toString();
            }
        );

        child.stderr.on(
            "data",
            chunk => {
                stderr += chunk.toString();
            }
        );

        child.on(
            "error",
            reject
        );

        child.on(
            "close",
            code => {

                if (code !== 0) {

                    reject(
                        new Error(
                            `LibreOffice failed with code ${code}.\n${
                                stderr || stdout
                            }`
                        )
                    );

                    return;
                }

                resolve({
                    stdout,
                    stderr
                });

            }
        );

    });

}

// ========================================
// VALUE HELPERS
// ========================================

function numberOrNull(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    if (
        typeof value === "object" &&
        value !== null &&
        Object.prototype.hasOwnProperty.call(
            value,
            "result"
        )
    ) {
        value = value.result;
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : null;

}

function textOrEmpty(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    if (
        typeof value === "object" &&
        value !== null &&
        Object.prototype.hasOwnProperty.call(
            value,
            "result"
        )
    ) {
        return textOrEmpty(
            value.result
        );
    }

    return String(value);

}

// ========================================
// VALIDATION
// ========================================

function validateRequest({
    decisionMatrix,
    alternatives
}) {

    if (!Array.isArray(alternatives)) {

        throw new Error(
            "Alternatives must be an array."
        );

    }

    if (alternatives.length !== 3) {

        throw new Error(
            "Exactly 3 alternatives are required."
        );

    }

    if (
        alternatives.some(
            name =>
                typeof name !== "string" ||
                !name.trim()
        )
    ) {

        throw new Error(
            "All three alternatives must have names."
        );

    }

    if (!Array.isArray(decisionMatrix)) {

        throw new Error(
            "Decision matrix must be an array."
        );

    }

    if (decisionMatrix.length !== 3) {

        throw new Error(
            "Decision matrix must contain exactly 3 alternatives."
        );

    }

    decisionMatrix.forEach(
        (row, alternativeIndex) => {

            if (!Array.isArray(row)) {

                throw new Error(
                    `Alternative ${
                        alternativeIndex + 1
                    } must be an array.`
                );

            }

            if (
                row.length !==
                CRITERIA.length
            ) {

                throw new Error(
                    `Alternative ${
                        alternativeIndex + 1
                    } must contain exactly ${
                        CRITERIA.length
                    } criteria.`
                );

            }

            row.forEach(
                (value, criterionIndex) => {

                    const criterion =
                        CRITERIA[
                            criterionIndex
                        ];

                    const numericValue =
                        Number(value);

                    if (
                        !Number.isFinite(
                            numericValue
                        )
                    ) {

                        throw new Error(
                            `"${criterion.name}" in Alternative ${
                                alternativeIndex + 1
                            } must be a number.`
                        );

                    }

                    if (
                        numericValue < 1 ||
                        numericValue > 9
                    ) {

                        throw new Error(
                            `"${criterion.name}" in Alternative ${
                                alternativeIndex + 1
                            } must be between 1 and 9.`
                        );

                    }

                    if (
                        !Number.isInteger(
                            numericValue
                        )
                    ) {

                        throw new Error(
                            `"${criterion.name}" in Alternative ${
                                alternativeIndex + 1
                            } must be a whole number from 1 to 9.`
                        );

                    }

                }
            );

        }
    );

}

// ========================================
// WRITE INPUTS
// ========================================

async function writeInputs(
    templatePath,
    outputPath,
    decisionMatrix,
    alternatives
) {

    const workbook =
        new ExcelJS.Workbook();

    await workbook.xlsx.load(
        await fs.readFile(
            templatePath
        )
    );

    const sheet =
        workbook.getWorksheet(
            INPUT_SHEET
        );

    if (!sheet) {

        throw new Error(
            `Workbook is missing the ${INPUT_SHEET} sheet.`
        );

    }

    // Alternative names
    sheet.getCell("C1").value =
        alternatives[0];

    sheet.getCell("D1").value =
        alternatives[1];

    sheet.getCell("E1").value =
        alternatives[2];

    // Decision matrix
    decisionMatrix.forEach(
        (row, alternativeIndex) => {

            row.forEach(
                (value, criterionIndex) => {

                    const rowNumber =
                        criterionIndex + 2;

                    const columnNumber =
                        alternativeIndex + 3;

                    sheet.getCell(
                        rowNumber,
                        columnNumber
                    ).value =
                        Number(value);

                }
            );

        }
    );

    await workbook.xlsx.writeFile(
        outputPath
    );

}

// ========================================
// RECALCULATE EXCEL
// ========================================

async function recalculateWorkbook(
    inputWorkbook,
    outputDirectory
) {

    await fs.mkdir(
        outputDirectory,
        {
            recursive: true
        }
    );

    await runCommand(
        getLibreOfficePath(),
        [
            "--headless",
            "--convert-to",
            "xlsx",
            "--outdir",
            outputDirectory,
            inputWorkbook
        ]
    );

    const outputPath =
        path.join(
            outputDirectory,
            path.basename(
                inputWorkbook
            )
        );

    await fs.access(
        outputPath
    );

    return outputPath;

}

// ========================================
// READ OUTPUTS
// ========================================

async function readOutputs(
    recalculatedWorkbookPath,
    alternatives
) {

    const workbook =
        new ExcelJS.Workbook();

    await workbook.xlsx.load(
        await fs.readFile(
            recalculatedWorkbookPath
        )
    );

    const sheet =
        workbook.getWorksheet(
            OUTPUT_SHEET
        );

    if (!sheet) {

        throw new Error(
            `Workbook is missing the ${OUTPUT_SHEET} sheet.`
        );

    }

    const value = row =>
        sheet.getCell(
            row,
            2
        ).value;

    // ========================================
    // RANKING
    // ========================================

    const ranking = [

        {
            alternative:
                alternatives[0],

            rank:
                numberOrNull(
                    value(
                        OUTPUT_ROWS
                            .alternativeARank
                    )
                ),

            closenessCoefficient:
                numberOrNull(
                    value(
                        OUTPUT_ROWS
                            .alternativeACi
                    )
                ),

            positiveDistance:
                numberOrNull(
                    value(
                        OUTPUT_ROWS
                            .alternativeASPlus
                    )
                ),

            negativeDistance:
                numberOrNull(
                    value(
                        OUTPUT_ROWS
                            .alternativeASMinus
                    )
                )
        },

        {
            alternative:
                alternatives[1],

            rank:
                numberOrNull(
                    value(
                        OUTPUT_ROWS
                            .alternativeBRank
                    )
                ),

            closenessCoefficient:
                numberOrNull(
                    value(
                        OUTPUT_ROWS
                            .alternativeBCi
                    )
                ),

            positiveDistance:
                numberOrNull(
                    value(
                        OUTPUT_ROWS
                            .alternativeBSPlus
                    )
                ),

            negativeDistance:
                numberOrNull(
                    value(
                        OUTPUT_ROWS
                            .alternativeBSMinus
                    )
                )
        },

        {
            alternative:
                alternatives[2],

            rank:
                numberOrNull(
                    value(
                        OUTPUT_ROWS
                            .alternativeCRank
                    )
                ),

            closenessCoefficient:
                numberOrNull(
                    value(
                        OUTPUT_ROWS
                            .alternativeCCi
                    )
                ),

            positiveDistance:
                numberOrNull(
                    value(
                        OUTPUT_ROWS
                            .alternativeCSPlus
                    )
                ),

            negativeDistance:
                numberOrNull(
                    value(
                        OUTPUT_ROWS
                            .alternativeCSMinus
                    )
                )
        }

    ];

    ranking.sort(
        (a, b) =>
            (a.rank ?? 999) -
            (b.rank ?? 999)
    );

    // ========================================
    // AHP WEIGHTS
    // ========================================

    const weightNames = [
        "Technical",
        "Operational",
        "Environmental & Safety",
        "Financial",
        "Regulatory",
        "Commercial Feasibility",
        "Scale"
    ];

    const weightRows = [
        OUTPUT_ROWS.technicalWeight,
        OUTPUT_ROWS.operationalWeight,
        OUTPUT_ROWS.environmentalWeight,
        OUTPUT_ROWS.financialWeight,
        OUTPUT_ROWS.regulatoryWeight,
        OUTPUT_ROWS.commercialWeight,
        OUTPUT_ROWS.scaleWeight
    ];

    const weights =
        weightRows.map(
            row =>
                numberOrNull(
                    value(row)
                )
        );

    const weightDetails =
        weightNames.map(
            (name, index) => ({
                criterion: name,
                weight: weights[index]
            })
        );

    // ========================================
    // CONSISTENCY
    // ========================================

    const consistencyStatus =
        textOrEmpty(
            value(
                OUTPUT_ROWS
                    .consistencyStatus
            )
        );

    const consistencyRatio =
        numberOrNull(
            value(
                OUTPUT_ROWS
                    .consistencyRatio
            )
        );

    // ========================================
    // RETURN
    // ========================================

    return {

        source:
            "Excel AHP-TOPSIS workbook",

        model: {
            majorCriteria: 7,
            subCriteria: 19,
            ratingScale: "1-9",

            criteria:
                CRITERIA.map(
                    criterion => ({
                        category:
                            criterion.category,
                        name:
                            criterion.name,
                        type:
                            criterion.type
                    })
                )
        },

        ahp: {

            weights,

            weightDetails,

            consistencyRatio,

            consistencyStatus,

            consistent:
                consistencyStatus
                    .toLowerCase() ===
                "consistent"

        },

        topsis: {

            ranking,

            recommendation:
                ranking[0]
                    ? {
                        alternative:
                            ranking[0]
                                .alternative,

                        rank:
                            ranking[0].rank,

                        closenessCoefficient:
                            ranking[0]
                                .closenessCoefficient,

                        positiveDistance:
                            ranking[0]
                                .positiveDistance,

                        negativeDistance:
                            ranking[0]
                                .negativeDistance
                    }
                    : null

        }

    };

}

// ========================================
// RUN DSS
// ========================================

async function runExcelDSS({
    decisionMatrix,
    alternatives
}) {

    validateRequest({
        decisionMatrix,
        alternatives
    });

    const templatePath =
        getWorkbookPath();

    await fs.access(
        templatePath
    );

    const tempDirectory =
        path.join(
            os.tmpdir(),
            `engineer-ai-dss-${crypto.randomUUID()}`
        );

    await fs.mkdir(
        tempDirectory,
        {
            recursive: true
        }
    );

    try {

        const inputWorkbookPath =
            path.join(
                tempDirectory,
                "EngineerAI_Input.xlsx"
            );

        await writeInputs(
            templatePath,
            inputWorkbookPath,
            decisionMatrix,
            alternatives
        );

        const recalculatedWorkbookPath =
            await recalculateWorkbook(
                inputWorkbookPath,
                path.join(
                    tempDirectory,
                    "recalculated"
                )
            );

        return await readOutputs(
            recalculatedWorkbookPath,
            alternatives
        );

    }
    finally {

        await fs.rm(
            tempDirectory,
            {
                recursive: true,
                force: true
            }
        );

    }

}

// ========================================
// EXPORT
// ========================================

module.exports = {
    runExcelDSS
};
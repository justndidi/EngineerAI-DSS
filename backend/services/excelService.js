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
  "EngineerAI_AHP_TOPSIS_Chatbot_PreserveModel.xlsx",
);

const DEFAULT_LIBREOFFICE = "soffice";

const INPUT_SHEET = "CHATBOT_INPUT";

const OUTPUT_SHEET = "CHATBOT_OUTPUT";

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
};

// ========================================
// WORKBOOK PATH
// ========================================

function getWorkbookPath() {
  return process.env.EXCEL_WORKBOOK_PATH
    ? path.resolve(process.env.EXCEL_WORKBOOK_PATH)
    : DEFAULT_WORKBOOK;
}

// ========================================
// LIBREOFFICE PATH
// ========================================

function getLibreOfficePath() {
  return process.env.LIBREOFFICE_PATH || DEFAULT_LIBREOFFICE;
}

// ========================================
// RUN COMMAND
// ========================================

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      windowsHide: true,

      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";

    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);

    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `LibreOffice failed with code ${code}.\n${stderr || stdout}`,
          ),
        );

        return;
      }

      resolve({
        stdout,

        stderr,
      });
    });
  });
}

// ========================================
// NUMBER HELPER
// ========================================

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    Object.prototype.hasOwnProperty.call(value, "result")
  ) {
    value = value.result;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

// ========================================
// TEXT HELPER
// ========================================

function textOrEmpty(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    if (
        typeof value === "object"
    ) {

        if (
            Object.prototype.hasOwnProperty.call(
                value,
                "result"
            )
        ) {

            return textOrEmpty(
                value.result
            );

        }


        if (
            Object.prototype.hasOwnProperty.call(
                value,
                "text"
            )
        ) {

            return textOrEmpty(
                value.text
            );

        }


        if (
            Object.prototype.hasOwnProperty.call(
                value,
                "value"
            )
        ) {

            return textOrEmpty(
                value.value
            );

        }


        return "";

    }


    return String(value).trim();

}

// ========================================
// VALIDATE REQUEST
// ========================================

function validateRequest({
  decisionMatrix,

  alternatives,
}) {
  if (!Array.isArray(decisionMatrix)) {
    throw new Error("Decision matrix is required.");
  }

  if (decisionMatrix.length !== 3) {
    throw new Error("Exactly 3 alternatives are required.");
  }

  decisionMatrix.forEach((row, rowIndex) => {
    if (!Array.isArray(row) || row.length !== 18) {
      throw new Error(
        `Alternative ${rowIndex + 1} must contain exactly 18 scores.`,
      );
    }

    row.forEach((value, columnIndex) => {
      const score = Number(value);

      if (!Number.isFinite(score) || score < 1 || score > 10) {
        throw new Error(
          `Invalid score at alternative ${rowIndex + 1}, criterion ${columnIndex + 1}. Scores must be between 1 and 10.`,
        );
      }
    });
  });

  if (!Array.isArray(alternatives) || alternatives.length !== 3) {
    throw new Error("Exactly 3 alternative names are required.");
  }

  alternatives.forEach((name, index) => {
    if (typeof name !== "string" || !name.trim()) {
      throw new Error(`Alternative ${index + 1} name is required.`);
    }
  });

  const normalizedNames = alternatives.map((name) => name.trim().toLowerCase());

  if (new Set(normalizedNames).size !== 3) {
    throw new Error("Alternative names must be unique.");
  }
}

// ========================================
// WRITE INPUTS
// ========================================

async function writeInputs(
  workbookPath,

  tempWorkbookPath,

  decisionMatrix,

  alternatives,
) {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.readFile(workbookPath);

  const sheet = workbook.getWorksheet(INPUT_SHEET);

  if (!sheet) {
    throw new Error(`Workbook is missing the ${INPUT_SHEET} sheet.`);
  }

  // ========================================
  // WRITE ALTERNATIVE NAMES
  //
  // CHATBOT_INPUT:
  //
  // C1 = Alternative 1
  // D1 = Alternative 2
  // E1 = Alternative 3
  // ========================================

  sheet.getCell(1, 3).value = alternatives[0].trim();

  sheet.getCell(1, 4).value = alternatives[1].trim();

  sheet.getCell(1, 5).value = alternatives[2].trim();

  // ========================================
  // WRITE SCORES
  //
  // C2:E19
  // ========================================

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 18; col++) {
      sheet.getCell(
        row + 2,

        col + 3,
      ).value = Number(decisionMatrix[row][col]);
    }
  }

  // ========================================
  // SAVE
  // ========================================

  await workbook.xlsx.writeFile(tempWorkbookPath);
}

// ========================================
// RECALCULATE EXCEL
// ========================================

async function recalculateWorkbook(
    inputWorkbookPath,
    outputDirectory
) {

    await fs.mkdir(
        outputDirectory,
        {
            recursive: true
        }
    );


    const profileDirectory =
        path.join(
            outputDirectory,
            "lo-profile"
        );


    await fs.mkdir(
        profileDirectory,
        {
            recursive: true
        }
    );


    const userInstallation =
        `-env:UserInstallation=file:///${profileDirectory.replace(/\\/g, "/")}`;


    // ========================================
    // IMPORTANT
    //
    // LibreOffice should NOT convert
    // XLSX -> XLSX into the same directory.
    //
    // We first convert the workbook to XLSX
    // in a separate output directory.
    // ========================================

    const libreOfficeOutputDirectory =
        path.join(
            outputDirectory,
            "recalculated"
        );


    await fs.mkdir(
        libreOfficeOutputDirectory,
        {
            recursive: true
        }
    );


    // ========================================
    // COPY INPUT WITH A DIFFERENT NAME
    // ========================================

    const libreOfficeInput =
        path.join(
            outputDirectory,
            "ExcelCalculationInput.xlsx"
        );


    await fs.copyFile(
        inputWorkbookPath,
        libreOfficeInput
    );


    // ========================================
    // RUN LIBREOFFICE
    // ========================================

    await runCommand(

        getLibreOfficePath(),

        [

            "--headless",

            userInstallation,

            "--convert-to",
            "xlsx",

            "--outdir",
            libreOfficeOutputDirectory,

            libreOfficeInput

        ]

    );


    // ========================================
    // EXPECTED OUTPUT
    // ========================================

    const outputWorkbookPath =
        path.join(

            libreOfficeOutputDirectory,

            "ExcelCalculationInput.xlsx"

        );


    // ========================================
    // VERIFY OUTPUT
    // ========================================

    await fs.access(
        outputWorkbookPath
    );


    return outputWorkbookPath;

}

// ========================================
// READ EXCEL OUTPUT
// ========================================

async function readOutputs(
  recalculatedWorkbookPath,

  alternatives,
) {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.load(await fs.readFile(recalculatedWorkbookPath));

  const sheet = workbook.getWorksheet(OUTPUT_SHEET);

  if (!sheet) {
    throw new Error(`Workbook is missing the ${OUTPUT_SHEET} sheet.`);
  }

  const value = (row) => sheet.getCell(row, 2).value;

  // ========================================
  // BUILD RANKING
  // ========================================

  const ranking = [
    {
      alternative: alternatives[0],

      excelAlternative: textOrEmpty(value(OUTPUT_ROWS.alternativeARank)),

      rank: numberOrNull(value(OUTPUT_ROWS.alternativeARank)),

      closenessCoefficient: numberOrNull(value(OUTPUT_ROWS.alternativeACi)),

      positiveDistance: numberOrNull(value(OUTPUT_ROWS.alternativeASPlus)),

      negativeDistance: numberOrNull(value(OUTPUT_ROWS.alternativeASMinus)),
    },

    {
      alternative: alternatives[1],

      excelAlternative: textOrEmpty(value(OUTPUT_ROWS.alternativeBRank)),

      rank: numberOrNull(value(OUTPUT_ROWS.alternativeBRank)),

      closenessCoefficient: numberOrNull(value(OUTPUT_ROWS.alternativeBCi)),

      positiveDistance: numberOrNull(value(OUTPUT_ROWS.alternativeBSPlus)),

      negativeDistance: numberOrNull(value(OUTPUT_ROWS.alternativeBSMinus)),
    },

    {
      alternative: alternatives[2],

      excelAlternative: textOrEmpty(value(OUTPUT_ROWS.alternativeCRank)),

      rank: numberOrNull(value(OUTPUT_ROWS.alternativeCRank)),

      closenessCoefficient: numberOrNull(value(OUTPUT_ROWS.alternativeCCi)),

      positiveDistance: numberOrNull(value(OUTPUT_ROWS.alternativeCSPlus)),

      negativeDistance: numberOrNull(value(OUTPUT_ROWS.alternativeCSMinus)),
    },
  ];

  ranking.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));

  // ========================================
  // CONSISTENCY
  // ========================================

  const consistencyStatus = textOrEmpty(value(OUTPUT_ROWS.consistencyStatus));

  // ========================================
  // RETURN
  // ========================================

  return {
    source: "Excel AHP-TOPSIS workbook",

    ahp: {
      weights: [
        numberOrNull(value(OUTPUT_ROWS.technicalWeight)),

        numberOrNull(value(OUTPUT_ROWS.operationalWeight)),

        numberOrNull(value(OUTPUT_ROWS.environmentalWeight)),

        numberOrNull(value(OUTPUT_ROWS.financialWeight)),

        numberOrNull(value(OUTPUT_ROWS.regulatoryWeight)),
      ],

      consistencyRatio: numberOrNull(value(OUTPUT_ROWS.consistencyRatio)),

      consistencyStatus,

      consistent: consistencyStatus.toLowerCase() === "consistent",
    },

    topsis: {
      ranking,

      recommendation: ranking[0]
        ? {
            alternative: ranking[0].alternative,

            rank: ranking[0].rank,

            closenessCoefficient: ranking[0].closenessCoefficient,

            positiveDistance: ranking[0].positiveDistance,

            negativeDistance: ranking[0].negativeDistance,
          }
        : null,
    },
  };
}

// ========================================
// RUN EXCEL DSS
// ========================================

async function runExcelDSS({
  decisionMatrix,

  alternatives,
}) {
  validateRequest({
    decisionMatrix,

    alternatives,
  });

  const templatePath = getWorkbookPath();

  await fs.access(templatePath);

  const tempDirectory = path.join(
    os.tmpdir(),

    `engineer-ai-dss-${crypto.randomUUID()}`,
  );

  await fs.mkdir(tempDirectory, {
    recursive: true,
  });

  try {
    const inputWorkbookPath = path.join(
      tempDirectory,

      "EngineerAI_Input.xlsx",
    );

    // ========================================
    // WRITE USER DATA
    // ========================================

    await writeInputs(
      templatePath,

      inputWorkbookPath,

      decisionMatrix,

      alternatives,
    );

    // ========================================
    // RECALCULATE
    // ========================================

    const recalculatedWorkbookPath = await recalculateWorkbook(
      inputWorkbookPath,

      tempDirectory,
    );

    // ========================================
    // READ OUTPUT
    // ========================================

    return await readOutputs(
      recalculatedWorkbookPath,

      alternatives,
    );
  } finally {
    await fs.rm(
      tempDirectory,

      {
        recursive: true,

        force: true,
      },
    );
  }
}

// ========================================
// EXPORT
// ========================================

module.exports = {
  runExcelDSS,
};

require("dotenv").config();

const {
    runExcelDSS
} = require("./services/excelService");

async function testExcelBridge() {

    try {

        console.log("");
        console.log("========================================");
        console.log("ENGINEERAI EXCEL BRIDGE TEST");
        console.log("========================================");
        console.log("");

        // 3 alternatives × 18 criteria
        const decisionMatrix = [

            [
                8, 7, 8, 7, 8,
                7, 8, 7,
                8, 9, 8, 7,
                7, 8, 7,
                8, 7, 8
            ],

            [
                7, 8, 7, 8, 7,
                8, 7, 8,
                7, 8, 7, 8,
                8, 7, 8,
                7, 8, 7
            ],

            [
                9, 8, 9, 8, 9,
                9, 8, 9,
                9, 8, 9, 8,
                9, 8, 9,
                9, 8, 9
            ]

        ];


        const alternatives = [

            "Laboratory Testing-Focused Firm",

            "Process Optimization-Focused Firm",

            "Environmental Compliance-Focused Firm"

        ];


        const criteriaTypes = [

            "benefit",
            "benefit",
            "benefit",
            "benefit",
            "benefit",

            "benefit",
            "benefit",
            "benefit",

            "benefit",
            "benefit",
            "benefit",
            "benefit",

            "benefit",
            "benefit",
            "benefit",

            "benefit",
            "benefit",
            "benefit"

        ];


        console.log("Sending decision data to Excel...");

        console.log("");

        const result =
            await runExcelDSS({

                decisionMatrix,

                alternatives,

                criteriaTypes

            });


        console.log("");
        console.log("========================================");
        console.log("EXCEL DSS RESULT");
        console.log("========================================");
        console.log("");

        console.log(
            JSON.stringify(
                result,
                null,
                2
            )
        );

        console.log("");

        console.log("========================================");
        console.log("EXCEL BRIDGE TEST SUCCESSFUL");
        console.log("========================================");
        console.log("");


    } catch (error) {

        console.error("");

        console.error(
            "========================================"
        );

        console.error(
            "EXCEL BRIDGE TEST FAILED"
        );

        console.error(
            "========================================"
        );

        console.error("");

        console.error(
            error
        );

        console.error("");

    }

}


testExcelBridge();
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chatRoutes");
const decisionRoutes = require("./routes/decision");
const dssRoutes = require("./routes/dssRoutes");

const app = express();

const PORT =
    process.env.PORT || 5000;


// ========================================
// CORS
// ========================================

app.use(
    cors({
        origin: true,
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);


// ========================================
// BODY PARSER
// ========================================

app.use(
    express.json()
);


// ========================================
// HEALTH CHECK
// ========================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Engineering AI DSS Backend is running"

        });

    }
);


// ========================================
// MASKED AI CONFIG HEALTH CHECK
// (never exposes the key itself)
// ========================================

app.get(
    "/api/health/ai",
    (req, res) => {

        const key =
            process.env.GEMINI_API_KEY;

        const trimmed =
            key ? key.trim() : "";

        res.json({

            success: true,

            hasGeminiKey: Boolean(trimmed),

            keyLength: trimmed.length,

            keyLooksValid:
                Boolean(trimmed) &&
                trimmed === key &&
                trimmed.length >= 30 &&
                !trimmed.includes(" ")

        });

    }
);


// ========================================
// API ROUTES
// ========================================

app.use(
    "/api/chat",
    chatRoutes
);

app.use(
    "/api/decision",
    decisionRoutes
);

app.use(
    "/api/dss",
    dssRoutes
);


// ========================================
// 404 HANDLER
// ========================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                `API route not found: ${req.method} ${req.originalUrl}`

        });

    }
);


// ========================================
// ERROR HANDLER
// ========================================

app.use(
    (error, req, res, next) => {

        console.error(
            "Express Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Internal server error."

        });

    }
);


// ========================================
// START SERVER
// ========================================

app.listen(
    PORT,
    () => {

        console.log(
            `Engineering AI DSS backend running on port ${PORT}`
        );

    }
);
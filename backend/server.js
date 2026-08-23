require("dotenv").config();

const express = require("express");

const cors = require("cors");


const chatRoutes =
    require("./routes/chatRoutes");


const decisionRoutes =
    require("./routes/decision");


const dssRoutes =
    require("./routes/dssRoutes");


const app =
    express();


const PORT =
    process.env.PORT || 5000;


// ========================================
// MIDDLEWARE
// ========================================

app.use(
    cors()
);


app.use(
    express.json()
);


// ========================================
// HOME
// ========================================

app.get(
    "/",
    (req, res) => {

        res.json({

            message:
                "Engineering AI DSS Backend is running"

        });

    }
);


// ========================================
// ROUTES
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
// START SERVER
// ========================================

app.listen(
    PORT,
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

    }
);
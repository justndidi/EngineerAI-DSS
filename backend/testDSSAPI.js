const http = require("http");

const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/dss/run",
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    }
};


const request =
    http.request(
        options,
        response => {

            let data = "";

            response.on(
                "data",
                chunk => {
                    data += chunk;
                }
            );

            response.on(
                "end",
                () => {

                    console.log(
                        "\nDSS API RESPONSE"
                    );

                    console.log(
                        "================"
                    );

                    console.log(
                        data
                    );

                }
            );

        }
    );


request.on(
    "error",
    error => {

        console.error(
            "Request error:",
            error.message
        );

    }
);


request.end();
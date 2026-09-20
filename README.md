# Engineering AI Decision Support System

An AI-assisted Engineering Decision Support System (DSS) designed to support structured decision-making by evaluating alternatives against multiple criteria.

The system combines web technologies with Multi-Criteria Decision-Making (MCDM) techniques to provide structured analysis and ranking of alternatives.

## Features

- Engineering decision-support workflow
- Multi-Criteria Decision-Making (MCDM)
- Analytic Hierarchy Process (AHP) for criteria weighting
- TOPSIS for ranking alternatives
- Interactive decision dashboard
- Frontend and backend architecture
- REST API communication
- Structured backend services and controllers
- Decision analysis and result presentation
- Test scripts for AHP, TOPSIS, DSS, and API functionality
- Docker configuration for backend deployment

## Technologies

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js
- REST APIs

### Decision-Making Methods
- Analytic Hierarchy Process (AHP)
- Technique for Order Preference by Similarity to Ideal Solution (TOPSIS)

### Tools
- Git
- GitHub
- Docker

## Project Structure

```text
EngineeringAI-DSS/
│
├── backend/
│   ├── controllers/
│   ├── data/
│   ├── routes/
│   ├── services/
│   ├── Dockerfile
│   ├── dssData.js
│   ├── server.js
│   ├── testAHP.js
│   ├── testDSS.js
│   ├── testDSSAPI.js
│   ├── testExcelBridge.js
│   ├── testTOPSIS.js
│   └── package.json
│
└── frontend/
    ├── css/
    ├── js/
    ├── dashboard.html
    ├── decision.html
    └── index.html

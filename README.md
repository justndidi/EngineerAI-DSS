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

How It Works

The system evaluates decision alternatives using multiple criteria.

1. Criteria Evaluation

The decision problem is defined using relevant criteria for evaluating engineering alternatives.

2. AHP

The Analytic Hierarchy Process is used to calculate the relative weights of the decision criteria.

3. TOPSIS

The calculated criteria weights are used with TOPSIS to determine how closely each alternative matches the ideal solution.

4. Ranking

The alternatives are ranked based on their calculated closeness coefficients.

5. Results

The frontend presents the decision-analysis results to the user through the dashboard and decision interface.

Purpose

The project demonstrates how software development and Multi-Criteria Decision-Making techniques can be combined to support structured engineering decisions.

Project Status

This project was developed as a practical engineering software project and is being further improved as development skills and functionality evolve.

Author

Jegbefume Joy Ndidi

Computer Science Student
Federal University of Petroleum Resources, Effurun

GitHub: https://github.com/justndidi

LinkedIn: https://www.linkedin.com/in/joy-jegbefume-96ba89391

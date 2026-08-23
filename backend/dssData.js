// ========================================
// ENGINEERING DSS DATA
// ========================================


// ========================================
// AHP PAIRWISE COMPARISON MATRIX
// ========================================

const ahpMatrix = [

    [1, 2.272, 3.031, 4.538, 8.247],

    [0.440, 1, 1.335, 1.998, 3.631],

    [0.330, 0.749, 1, 1.497, 2.721],

    [0.220, 0.501, 0.668, 1, 1.817],

    [0.121, 0.275, 0.368, 0.550, 1]

];


// ========================================
// ALTERNATIVES
// ========================================

const alternatives = [
    "Process Optimization-Focused Firm",
    "Environmental Compliance-Focused Firm",
    "Laboratory Testing-Focused Firm"
];


// ========================================
// TOPSIS DECISION MATRIX
//
// Rows = Alternatives
// Columns = 18 subcriteria
// ========================================

const decisionMatrix = [

    // Alternative A
    [
        5,   // Laboratory Facilities
        3,   // Process Equipment
        10,  // Engineering Software
        10,  // Technical Manpower
        10,  // Process Optimization Capability

        10,  // Infrastructure Availability
        3,   // Maintenance Systems
        3,   // Industrial Utilities

        3,   // Environmental Compliance
        3,   // Waste Management Capability
        10,  // HAZOP/HAZID Capability
        6,   // Safety Management Systems

        8,   // Equipment Cost
        8,   // Setup Cost
        8,   // Maintenance Cost

        5,   // NUPRC Compliance
        1,   // Laboratory Certification
        3    // Environmental Permits
    ],

    // Alternative B
    [
        7,
        5,
        5,
        10,
        3,

        10,
        5,
        5,

        8,
        10,
        6,
        8,

        6,
        8,
        6,

        5,
        4,
        10
    ],

    // Alternative C
    [
        10,
        5,
        5,
        10,
        4,

        10,
        7,
        7,

        8,
        5,
        6,
        8,

        3,
        3,
        3,

        5,
        10,
        7
    ]

];


// ========================================
// CRITERIA TYPES
//
// benefit = higher is better
// cost    = lower is better
// ========================================

const criteriaTypes = [

    // Technical
    "benefit",
    "benefit",
    "benefit",
    "benefit",
    "benefit",

    // Operational
    "benefit",
    "benefit",
    "benefit",

    // Environmental & Safety
    "benefit",
    "benefit",
    "benefit",
    "benefit",

    // Financial
    "cost",
    "cost",
    "cost",

    // Regulatory
    "benefit",
    "benefit",
    "benefit"

];


// ========================================
// CRITERIA NAMES
// ========================================

const criteriaNames = [

    "Laboratory Facilities",
    "Process Equipment",
    "Engineering Software",
    "Technical Manpower",
    "Process Optimization Capability",

    "Infrastructure Availability",
    "Maintenance Systems",
    "Industrial Utilities",

    "Environmental Compliance",
    "Waste Management Capability",
    "HAZOP/HAZID Capability",
    "Safety Management Systems",

    "Equipment Cost",
    "Setup Cost",
    "Maintenance Cost",

    "NUPRC Compliance",
    "Laboratory Certification",
    "Environmental Permits"

];


// ========================================
// EXPORT
// ========================================

module.exports = {

    ahpMatrix,

    decisionMatrix,

    alternatives,

    criteriaTypes,

    criteriaNames

};
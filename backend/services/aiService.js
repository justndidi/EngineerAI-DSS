const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// ========================================
// ENGINEERING DSS AI SERVICE
// ========================================

const MODEL_PREFERENCE = [

    "gemini-3.6-flash",
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.5-flash"

];

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

const BUSY_MESSAGE =
    "The AI assistant is busy right now. Please try again in a moment.";


function sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

}


function getStatus(error) {

    return Number(
        error &&
        (error.status || error.code)
    );

}


function isRetryable(error) {

    return RETRYABLE_STATUS.has(
        getStatus(error)
    );

}


function isModelMissing(error) {

    const status = getStatus(error);

    const text = String(
        (error && error.message) || ""
    ).toLowerCase();

    return (
        status === 404 ||
        text.includes("model not found") ||
        text.includes("is not found") ||
        text.includes("not found for api version")
    );

}


// Long quota resets (hours/days) cannot be
// fixed by retrying, so move to the next model.

function isLongQuotaError(error) {

    if (getStatus(error) !== 429) {
        return false;
    }

    const text = String(
        (error && error.message) || ""
    );

    return /retry in \d+(h|d)/i.test(text);

}


function toFriendlyError(error) {

    const status = getStatus(error);

    const message =
        !status ||
        isRetryable(error)
            ? BUSY_MESSAGE
            : "The AI assistant could not respond to this request. Please try again later.";

    const friendly = new Error(message);

    friendly.friendly = true;

    friendly.cause = error;

    return friendly;

}


// ========================================
// GENERATE WITH RETRY + MODEL FALLBACK
//
// Attempts are spread across rounds so a
// single busy model never blocks the others,
// and the whole search is capped so the
// frontend timeout is never hit.
// ========================================

const ROUND_DELAYS_MS = [0, 1000, 3000];

const REQUEST_BUDGET_MS = 45000;


function rotateModels() {

    const offset =
        Date.now() % MODEL_PREFERENCE.length;

    return MODEL_PREFERENCE
        .slice(offset)
        .concat(MODEL_PREFERENCE.slice(0, offset));

}


async function generateWithFallback(systemPrompt) {

    const startedAt = Date.now();

    const models = rotateModels();

    const dropped = new Set();

    let lastError = null;

    let quotaBlockedModels = 0;

    for (
        let round = 0;
        round < ROUND_DELAYS_MS.length;
        round++
    ) {

        if (ROUND_DELAYS_MS[round] > 0) {

            await sleep(ROUND_DELAYS_MS[round]);

        }

        if (
            Date.now() - startedAt >
            REQUEST_BUDGET_MS
        ) {

            break;

        }

        for (const model of models) {

            if (dropped.has(model)) {

                continue;

            }

            if (
                Date.now() - startedAt >
                REQUEST_BUDGET_MS
            ) {

                break;

            }

            try {

                const response =
                    await ai.models.generateContent({

                        model,

                        contents: systemPrompt

                    });

                const text = response.text;

                if (!text) {

                    const emptyError =
                        new Error(
                            "Model returned an empty response."
                        );

                    emptyError.status = 503;

                    throw emptyError;

                }

                return text;

            } catch (error) {

                lastError = error;

                console.error(
                    `AI Service Error (model=${model}, round=${round + 1}):`,
                    error && error.message
                );

                if (isModelMissing(error)) {

                    dropped.add(model);

                    continue;

                }

                if (isLongQuotaError(error)) {

                    dropped.add(model);

                    quotaBlockedModels++;

                    continue;

                }

                if (!isRetryable(error)) {

                    throw error;

                }

            }

        }

        if (
            dropped.size ===
            models.length
        ) {

            break;

        }

    }

    if (
        lastError &&
        isLongQuotaError(lastError) &&
        quotaBlockedModels ===
            MODEL_PREFERENCE.length
    ) {

        const quotaError = new Error(
            "The AI assistant has reached its usage limit for now. Please try again later."
        );

        quotaError.friendly = true;

        quotaError.cause = lastError;

        throw quotaError;

    }

    throw lastError || new Error(BUSY_MESSAGE);

}


async function askAI(message, context = {}) {

    const dss = context.dss || null;


    // ========================================
    // SYSTEM PROMPT
    // ========================================

    const systemPrompt = `

You are an Engineering Decision Support Assistant.

You assist engineers, engineering students, investors and
decision-makers in evaluating engineering business opportunities
and alternatives.

The system is specifically designed for engineering service firms,
especially chemical engineering service firms operating in Nigeria's
oil and gas industry.

The system combines:

1. Artificial Intelligence
2. Analytical Hierarchy Process (AHP)
3. Technique for Order Preference by Similarity to Ideal Solution
   (TOPSIS)


========================================
CORE RULES
========================================

1. Be accurate.

2. Do not invent facts.

3. Do not invent DSS scores.

4. Do not invent alternatives.

5. Do not invent criteria.

6. Do not invent AHP weights.

7. Do not invent TOPSIS scores.

8. Do not modify supplied mathematical results.

9. Do not perform a new DSS calculation yourself.

10. Treat the DSS result supplied by the backend as the official
mathematical result.

11. Clearly distinguish mathematical DSS results from AI
interpretation.

12. If information is not available, say so.

13. Never claim professional engineering approval.

14. Never claim regulatory approval.

15. Never claim legal certification.

16. Never guarantee financial returns.

17. Explain engineering concepts in clear language.

18. When discussing the DSS recommendation, always use:

dss.topsis.recommendation


========================================
AHP CRITERIA
========================================

The five AHP categories are:

1. Technical
2. Operational
3. Environmental & Safety
4. Financial
5. Regulatory


========================================
AHP WEIGHTS
========================================

The AHP weights represent the relative importance of the five
categories.

Higher weight = greater importance in the decision model.


========================================
AHP CONSISTENCY
========================================

A consistency ratio below 0.10 is considered acceptable.

Use the supplied consistencyRatio.

Use the supplied consistent value.

Do not change it.

If the consistency ratio is extremely close to zero because of
floating-point precision, describe it as approximately 0.0000.


========================================
TOPSIS
========================================

TOPSIS determines how close each alternative is to the ideal
solution.

Each alternative has:

- rank
- closeness coefficient
- positive distance
- negative distance

A higher closeness coefficient means the alternative is closer to
the ideal solution under the supplied criteria and weights.


========================================
IMPORTANT TIE RULE
========================================

If alternatives have identical scores across all criteria, the
TOPSIS results may produce equal closeness coefficients.

Do not claim that one alternative is mathematically better when
their supplied scores produce a tie.

If the alternatives are tied, clearly state that the DSS cannot
mathematically distinguish between them using the supplied data.


========================================
FINAL RECOMMENDATION
========================================

The official recommendation is:

dss.topsis.recommendation


If the recommendation is:

Laboratory Testing-Focused Firm

then report:

Laboratory Testing-Focused Firm


Do not replace the DSS recommendation with your own recommendation.


========================================
WHEN USER ASKS "WHY?"
========================================

Use:

- AHP weights
- TOPSIS ranking
- closeness coefficients
- positive distances
- negative distances

to explain the result.

Clearly identify which statements are mathematical results and
which are AI interpretation.


========================================
WHEN USER ASKS ABOUT SCORES
========================================

Use the exact supplied values.

Do not round values differently unless the user asks for rounding.


========================================
WHEN USER ASKS ABOUT THE DSS
========================================

Explain that:

AHP determines the importance of the decision categories.

The category weights are distributed across the 18 decision
criteria.

TOPSIS then evaluates the alternatives using the weighted criteria.


========================================
RESPONSE STYLE
========================================

Be:

- professional
- conversational
- concise
- technically clear

Do not unnecessarily repeat the entire DSS result.

For simple questions, answer directly.

For detailed questions, use headings and bullet points.


========================================
DISCLAIMER
========================================

When appropriate, remind the user that the system is a decision
support tool and does not replace validation by qualified
engineers, regulatory authorities, financial professionals or legal
professionals.


========================================
CURRENT DSS RESULT
========================================

${JSON.stringify(dss, null, 2)}


========================================
USER QUESTION
========================================

${message}

`;


    // ========================================
    // CALL GEMINI
    // ========================================

    try {

        return await generateWithFallback(
            systemPrompt
        );

    } catch (error) {

        if (error && error.friendly) {

            console.error(
                "AI Service Error:",
                error.message,
                "|",
                error.cause && error.cause.message
            );

            throw error;

        }

        console.error(
            "AI Service Error:",
            error
        );

        throw toFriendlyError(error);

    }

}


// ========================================
// EXPORT
// ========================================

module.exports = {
    askAI
};
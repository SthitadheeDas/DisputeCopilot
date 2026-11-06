You are building "Dispute Copilot" for the PayPal AI Hackathon. I am a solo, beginner developer, so work in small steps, run the app after each step, explain what you did in plain language, and commit to git after each working step.

GOAL
A web app that helps a small merchant respond to PayPal payment disputes. It pulls real disputes from the PayPal SANDBOX Disputes API, joins each with the merchant's order data from a simulated store, builds an evidence pack, scores how winnable the case is using deterministic code, uses Gemini to explain and draft the response, and submits only after the merchant clicks Approve.

HARD RULES
- Language: TypeScript everywhere. Node + Express backend (/server), React + Vite + Tailwind frontend (/web). No other languages.
- Never invent PayPal API endpoints, fields or enum values. Before writing any PayPal call, read the official docs (start with https://docs.paypal.ai/llms.txt and the Customer Disputes v1 reference) and use exactly what they say. If unsure, ask me.
- Sandbox only: base URL https://api-m.sandbox.paypal.com.
- Secrets only in a local .env (gitignored). Commit .env.example with empty values. Never log or print secrets.
- Nothing is submitted to PayPal without an explicit human click on an Approve button. Provide a DRY_RUN=true env flag that shows the exact request payload instead of sending it.
- The UI must show a "Data source" badge: "PayPal Sandbox" or "Fixture data". Never present fixture data as real.
- Ask me before: adding any dependency not listed here, changing scope, or making any decision I have not specified.
- Keep it small. Out of scope: appeals, escalation, webhooks, multi-merchant login, real courier tracking, payments.

ENV VARS (.env.example)
PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com, GEMINI_API_KEY, GEMINI_MODEL, DRY_RUN=true, DATA_MODE=sandbox (or fixture), PORT=3000

REPO LAYOUT
/server (src/paypal, src/store, src/scoring, src/ai, src/routes, src/index.ts), /web (src/pages, src/components), /data (store.json, fixtures/disputes.json, analysis-cache.json), /docs, /scripts, README.md, LICENSE (MIT), .gitignore, .env.example.
In production the Express server also serves the built /web files, so the whole app is ONE deployable service.

SIMULATED STORE (data/store.json)
A list of orders. Each has: orderId, paypalTransactionId (I will fill in real sandbox IDs), customerName, items [{name, description, price}], amount, currency, shippingAddress, billingAddress, orderedAt, carrier, trackingNumber, trackingEvents [{time, status, location, signedBy?}], refunds [{amount, date, reason}], customerMessages [{time, from, text}], listingDescription, returnPolicyText. Create 6 diverse sample orders: 2 clearly delivered with signature, 1 delivered without signature, 1 with no tracking, 1 where the item description mismatches the complaint, 1 with a partial refund already issued. Put clear placeholder IDs like REPLACE_WITH_TXN_ID.

PIPELINE (per dispute)
1. Pull: list disputes and fetch details from PayPal (reason, status, amount, dispute date, seller response due date, transaction ID). Check exact field names in the docs.
2. Join: find the order in the store by paypalTransactionId.
3. Evidence pack (plain code): an array of facts, each {id: "F1", label, value, source: "tracking" | "order" | "refund_history" | "customer_messages" | "paypal_dispute"}, plus a list of MISSING evidence items.
4. Score (plain code, no AI): 0 to 100 plus a breakdown, using a rubric per dispute reason. Support two reasons: the "item not received" reason and the "not as described" reason (confirm the exact enum names in the docs).
   Not received rubric: tracking number exists +20, carrier status delivered +30, delivered before the dispute date +10, signature on delivery +15, delivery address matches transaction shipping address +15, no customer complaint messages before delivery +5, no prior refund +5.
   Not as described rubric: order listing matches item description +25, evidence of return policy shown +15, customer messages show no earlier complaint +15, item photos or description evidence present +20, no prior refund or goodwill offer +10, delivery confirmed +15.
   Bands: 70+ strong, 40 to 69 medium, below 40 weak. Put weights in one config file. Write unit tests (vitest) for the scoring.
5. AI (Gemini): send the evidence pack, score breakdown, dispute reason and deadline. Require JSON output (use structured output with a response schema) with: summary, recommendation ("fight" | "accept" | "partial_offer"), recommendedOfferAmount (optional), draftNotes (a persuasive, factual explanation for PayPal), citedFactIds (array). The prompt must say: use ONLY facts in the pack, never invent dates, names or carriers, do not claim anything not in the pack. Temperature low. Afterwards the backend validates that every citedFactId exists in the pack; if not, retry once, then flag the draft as "needs review". The model name comes from GEMINI_MODEL.
6. Cache the analysis in data/analysis-cache.json so I don't re-spend calls.
7. Actions, only after a human click: (a) submit evidence to PayPal provide-evidence (multipart with an input JSON field; in sandbox the docs say to use evidence type OTHER, verify this), (b) accept claim, (c) make offer with a partial refund amount. After any action, re-fetch the dispute and show the new status. Log every action in an activity log.

BACKEND ENDPOINTS
GET /api/health; GET /api/disputes (sorted by response due date); GET /api/disputes/:id (detail + evidence pack + score + cached AI result); POST /api/disputes/:id/analyze; POST /api/disputes/:id/submit-evidence {notes}; POST /api/disputes/:id/accept; POST /api/disputes/:id/offer {amount, note}; GET /api/activity. Validate inputs with zod. Return clear error messages.

FRONTEND
- Dashboard: table of disputes sorted by deadline, with a live countdown (red under 48 hours), amount at stake, reason, status, evidence strength badge (strong/medium/weak with the number), and the Data source badge.
- Detail page: left side the dispute facts and evidence pack (each fact shows its source); score breakdown showing which rubric items passed or failed and what evidence is missing; the AI summary and recommendation; an EDITABLE draft response with cited fact IDs; action buttons: "Approve and submit evidence" (confirmation dialog showing the payload), "Accept claim", "Offer partial refund" (amount field). Buttons disabled after submitting. Show DRY_RUN clearly when on.
- Activity log page.
- Clean, modern, responsive design. Light theme. Loading and error states everywhere. Include a one-line "What is this?" intro for judges on the dashboard.

QUALITY
Run the app and the tests yourself after each phase and show me the results. Write the README as we go: what it is, prerequisites, step-by-step setup including how to create sandbox accounts, env vars, how to run, how to run tests, how to deploy on Render, and a clear note that order data is simulated.
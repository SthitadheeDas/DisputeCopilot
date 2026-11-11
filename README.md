# Dispute Copilot 🛡️

> **Autonomous Merchant Defense & Intelligence System for PayPal Payment Disputes**

[![Live Demo](https://img.shields.io/badge/Demo-Render-blue?style=for-the-badge&logo=render)](https://disputecopilot-front.onrender.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![AG Grid](https://img.shields.io/badge/AG_Grid-36.3-F26430?style=for-the-badge)](https://www.ag-grid.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

---

## 📌 Executive Summary

Dispute Copilot is an intelligent, human-in-the-loop merchant defense platform engineered to protect small- and medium-sized e-commerce merchants against PayPal customer disputes, chargebacks, and friendly fraud.

Small business owners frequently forfeit valid disputes due to aggressive submission countdowns, opaque evidence mandates, or the administrative burden of manually aggregating carrier tracking numbers, postal delivery signatures, catalog descriptions, and customer communications. 

**Dispute Copilot** bridges this operational gap by:
1. Ingesting payment disputes via the official **PayPal Customer Disputes API v1**.
2. Correlating transactions with store order history to assemble a structured **Evidence Pack**.
3. Evaluating defensibility with a **100% deterministic mathematical scoring engine (0–100)** with zero scoring hallucinations.
4. Drafting cited, formal defense responses using a resilient **3-Tier AI Pipeline** (Groq &rarr; Google Gemini &rarr; Grounded Rule Engine).
5. Enforcing a strict **Human-in-the-Loop Safety Harness**—no evidence is submitted, concession granted, or refund issued without explicit merchant authorization.

---

## 🏗️ Architecture & Workflow

```mermaid
flowchart TD
    subgraph DataIngestion ["1. Data Ingestion & Correlation"]
        PP[PayPal Disputes API v1<br/>or Fixture Payloads] --> Enricher[Dispute Correlation Engine]
        Store[Store Catalog & Orders DB<br/>data/store.json] --> Enricher
        Carrier[Carrier Tracking Events<br/>USPS / UPS / FedEx] --> Enricher
    end

    subgraph Evaluation ["2. Deterministic Scoring (0–100)"]
        Enricher --> EvPack[Indexed Evidence Pack<br/>F1, F2, F3...]
        EvPack --> Engine[Rubric Scoring Engine]
        Engine -->|INR & SNAD Rubrics| Score[Score & Band Classification<br/>Strong 70+ | Medium 40-69 | Weak <40]
    end

    subgraph AIAssistant ["3. Resilient 3-Tier AI Generation"]
        Score --> Tier1[Tier 1: Groq AI<br/>openai/gpt-oss-120b]
        Tier1 -->|Fallback on Rate Limit / Timeout| Tier2[Tier 2: Google Gemini<br/>gemini-2.5-flash]
        Tier2 -->|Fallback on Network / 503| Tier3[Tier 3: Grounded Rule Engine<br/>Deterministic Local Generator]
        Tier1 & Tier2 --> CitationValidator{Citation Validator<br/>Valid Fact IDs?}
        CitationValidator -->|Hallucination Detected| PromptRetry[Corrective Prompt Retry]
        PromptRetry --> Tier1
        CitationValidator -->|Valid| Draft[Grounded Defense Draft]
        Tier3 --> Draft
    end

    subgraph HumanInTheLoop ["4. Human-in-the-Loop Safety Harness"]
        Draft --> ReviewModal[Merchant Review Modal<br/>Payload Inspection & Strategy Recommendation]
        ReviewModal -->|1. Fight & Defend| SubmitEvidence[Submit Evidence to PayPal]
        ReviewModal -->|2. Propose Settlement| PartialOffer[Submit Partial Refund Offer]
        ReviewModal -->|3. Concede & Accept| AcceptClaim[Accept Customer Claim]
    end

    subgraph Audit ["5. P&L & Audit Trail"]
        SubmitEvidence & PartialOffer & AcceptClaim --> AuditTrail[Audit Activity Log<br/>activity-log.json]
        SubmitEvidence & PartialOffer & AcceptClaim --> AGGrid[Lifetime AG Grid Dashboard<br/>P&L Realization & Win Rate]
    end
```

---

## 🌟 Key Capabilities

### 🛡️ Deterministic Winnability Engine (0–100)
- **Zero Hallucination Scoring**: Evaluates dispute defensibility using a pure mathematical rubric without relying on LLMs for calculations.
- **Multi-Reason Support**:
  - **Item Not Received (`MERCHANDISE_OR_SERVICE_NOT_RECEIVED`)**: Evaluates carrier tracking existence, delivery confirmation timestamps relative to dispute creation, recipient signature proof, destination city/state match, customer complaint history prior to transit, and prior concessions.
  - **Not As Described (`MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED`)**: Evaluates catalog listing detail sufficiency, published checkout return policies, pre-delivery customer messages, authentic item condition disclosures, and confirmed buyer possession.
- **Score Classification Bands**:
  - 🟢 **Strong (70–100)**: Overwhelming defensibility; recommended strategy: **FIGHT**.
  - 🟡 **Medium (40–69)**: Partial defensibility or missing signature; recommended strategy: **PARTIAL_OFFER**.
  - 🔴 **Weak (0–39)**: Untracked or missing fulfillment proof; recommended strategy: **ACCEPT**.

### 🧠 Groq AI Defense Pipeline & Safety Net
- **Primary AI Provider**: **Groq** (`openai/gpt-oss-120b`, automatic fallback to `llama-3.3-70b-versatile`) for ultra-low latency response synthesis.
- **Offline Safety Net**: **Local Grounded Rule Engine** that generates cited, formatted drafts offline if Groq is unconfigured or unavailable.
- **Citation Verification Guardrail**: Every cited fact (`[F1]`, `[F2]`) is verified against the indexed Evidence Pack. If an invalid fact is cited, the system triggers an automatic corrective prompt retry.

### 👤 Human-in-the-Loop & Safety Harness
- **Mandatory Merchant Sign-Off**: The system never submits mutations to PayPal autonomously. Every defense package, settlement offer, or concession requires explicit user confirmation.
- **Dry-Run Simulation Mode (`DRY_RUN=true`)**: When enabled, PayPal mutations are safely simulated and logged in the audit trail without modifying live account state.
- **JSON Payload Inspector**: Merchants can inspect the raw JSON payload before transmission to PayPal.
- **Automatic Currency Preservation**: Settlement refund offers automatically inherit the transaction currency (e.g., USD, EUR, GBP) and validate against maximum disputed amount limits.

### 📊 Lifetime Financial & P&L Analytics Center
- **Powered by AG Grid (v36)**: High-performance, enterprise-grade transaction grid supporting sorting, filtering, and deep search.
- **Realized P&L Accounting**: Accurately tracks disputed capital, chargeback fees ($15.00/dispute), recovered funds, and net revenue impact.
- **Interactive "View Order" Modal**: Provides order line items, fulfillment timestamps, carrier tracking milestones, and customer chat histories.

### 🔄 Dynamic Demo Fixtures & Data Replenishment
- **Staggered Dynamic Deadlines**: Fixture disputes dynamically project deadlines (+3 to +8 days) from current wall-clock time so demo scenarios never appear expired or stale.
- **One-Click Demo Replenishment**: The **"Replenish Demo Data"** action in the navigation bar resets all disputes, concessions, and AI caches to their initial active state.
- **Dual Data Modes**: Seamlessly switch between zero-config offline fixture data (`DATA_MODE=fixture`) and the live PayPal Sandbox REST API (`DATA_MODE=sandbox`).

---

## 💻 Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Type-safe UI components and reactive state |
| **Build & Dev Tool** | [Vite 6](https://vitejs.dev/) | Optimized builds, code-splitting, and `/api` dev proxy |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) | Responsive, modern merchant portal styling |
| **Data Grid** | [AG Grid Community](https://www.ag-grid.com/) | Virtualized, interactive lifetime transaction grid |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent icons |
| **Backend Runtime** | [Node.js](https://nodejs.org/) (v20+) | High-performance server environment |
| **Server Framework**| [Express 4](https://expressjs.com/) | RESTful API routes, middleware, and static asset serving |
| **Validation** | [Zod 3](https://zod.dev/) | Strict runtime request and schema validation |
| **Primary AI** | [Groq SDK](https://groq.com/) | `openai/gpt-oss-120b` rapid reasoning engine |
| **Secondary AI** | [Google Gen AI SDK](https://ai.google.dev/) | `gemini-2.5-flash` secondary fallback engine |
| **Testing** | [Vitest 3](https://vitest.dev/) | Fast unit testing for scoring rubrics and citation checks |
| **API Specification**| [OpenAPI 3.0](https://swagger.io/specification/) | Machine-readable API contracts in `openapi.yaml` |

---

## 📁 Repository Structure

```text
DisputeCopilot/
├── data/
│   ├── store.json               # Simulated merchant catalog, orders, tracking & customer chat
│   ├── fixtures/disputes.json   # PayPal Customer Disputes v1 payloads (INR & SNAD scenarios)
│   ├── analysis-cache.json      # Cache for generated AI defense drafts
│   └── activity-log.json        # Merchant approval and submission audit trail
├── docs/
│   └── PROJECT_BRIEF.md         # Specification, evaluation rubrics & project notes
├── portal/                      # APIMatic interactive developer documentation portal
├── sdks/                        # Client SDK libraries
│   ├── python/                  # Generated Python SDK
│   └── typescript/              # Generated TypeScript SDK
├── server/                      # Express backend service
│   ├── src/
│   │   ├── ai/                  # 3-tier AI engine (Groq, Gemini, Rule Engine fallback)
│   │   ├── paypal/              # PayPal Sandbox OAuth 2.0 client & REST endpoints
│   │   ├── routes/              # Express API endpoints (/health, /disputes, /activity)
│   │   ├── scoring/             # Deterministic rubric scoring engine & Vitest unit tests
│   │   ├── store/               # In-memory & file storage persistence managers
│   │   ├── types/               # TypeScript domain interfaces
│   │   ├── config.ts            # Environment variable configuration
│   │   └── index.ts             # Express server entrypoint & rate limiting
│   ├── package.json
│   └── tsconfig.json
├── web/                         # React frontend service
│   ├── src/
│   │   ├── components/          # UI components (DisputeTable, DisputeDetailModal, AnalyticsTab)
│   │   ├── data/                # Lifetime transactions data for AG Grid
│   │   ├── utils/               # Date formatting and order data mapping utilities
│   │   ├── api.ts               # Typed client for backend endpoints
│   │   ├── types.ts             # Frontend TypeScript definitions
│   │   ├── App.tsx              # Main dashboard application
│   │   └── main.tsx             # React entrypoint
│   ├── package.json
│   ├── vite.config.ts           # Vite proxy & manual Rollup chunking
│   └── tailwind.config.js
├── .env.example                 # Environment variables template
├── openapi.yaml                 # OpenAPI 3.0 specification
├── package.json                 # Monorepo workspaces definition
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (`v20+` recommended)
- **npm**: v9.0.0 or higher
- *(Optional)* [PayPal Developer Account](https://developer.paypal.com) with Sandbox credentials
- *(Optional)* [Groq API Key](https://console.groq.com) and/or [Google AI Studio Gemini API Key](https://aistudio.google.com)

> [!TIP]
> **Zero-Config Offline Mode**: Providing external API keys is completely optional. If no external credentials are provided, Dispute Copilot automatically boots into offline fixture mode and utilizes the built-in Grounded Rule Engine.

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/felix-rogue/Personal-Dispute-Copilot.git
cd Personal-Dispute-Copilot
```

### Step 2: Install Dependencies

Install all dependencies across the monorepo root, `server`, and `web` workspaces:

```bash
npm install
```

### Step 3: Configure Environment Variables

Create your local `.env` configuration file from the template:

```bash
cp .env.example .env
```

Review and adjust variables in `.env` as required:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATA_MODE` | Data source: `fixture` (offline demo) or `sandbox` (live PayPal API) | `fixture` |
| `DRY_RUN` | Safety switch: `true` previews payloads; `false` mutates PayPal | `true` |
| `PORT` | Local Express backend port | `3000` |
| `GROQ_API_KEY` | API key for primary AI provider (Groq) | *(Leave empty for fallback)* |
| `GROQ_MODEL` | Primary model identifier on Groq | `openai/gpt-oss-120b` |
| `GEMINI_API_KEY`| API key for secondary AI fallback (Google Gemini) | *(Leave empty for fallback)* |
| `GEMINI_MODEL` | Secondary fallback model identifier | `gemini-2.5-flash` |
| `PAYPAL_CLIENT_ID` | PayPal Sandbox REST App Client ID | *(From PayPal Developer Portal)* |
| `PAYPAL_CLIENT_SECRET` | PayPal Sandbox REST App Client Secret | *(From PayPal Developer Portal)* |
| `PAYPAL_BASE_URL` | Base URL for PayPal API calls | `https://api-m.sandbox.paypal.com` |

---

### Step 4: Run Development Environment

Start both the backend server and frontend development client concurrently with live hot-reload:

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173) (Vite server with automatic `/api` proxy)
- **Backend API**: [http://localhost:3000](http://localhost:3000)
- **API Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

#### Running Workspaces Individually
```bash
# Backend server only (tsx watch)
npm run dev:server

# Frontend client only (Vite)
npm run dev:web
```

---

### Step 5: Run Unit Tests

Execute the Vitest test suite to verify the deterministic scoring engine, address matching heuristics, and citation verification logic:

```bash
npm run test
```

### Step 6: Production Build

Verify production TypeScript compilation and optimized asset chunking:

```bash
npm run build
```

To run the production build locally:

```bash
npm run start
```

---

## 🔌 Merchant SDK Integration

DisputeCopilot provides pre-generated SDKs (Python & TypeScript via APIMatic) for fast integration into Shopify, WooCommerce, or custom platforms:

```typescript
import { DisputeCopilotClient } from './sdks/typescript';

const client = new DisputeCopilotClient({ apiKey: process.env.DISPUTE_COPILOT_KEY });
const result = await client.disputes.evaluate('PP-D-1002');
console.log(result.score, result.defenseDraft);
```

---

## 📡 REST API Reference

The backend exposes a clean REST API documented in [`openapi.yaml`](openapi.yaml):

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns service status, active data mode, and credential indicators |
| `GET` | `/api/disputes` | Returns all enriched disputes sorted by response deadline |
| `GET` | `/api/disputes/:id` | Returns complete details, Evidence Pack, and score for a single dispute |
| `POST` | `/api/disputes/:id/analyze` | Executes or refreshes the Groq AI generation pipeline for a dispute |
| `POST` | `/api/disputes/:id/submit-evidence` | Merchant-approved submission of grounded defense package |
| `POST` | `/api/disputes/:id/accept` | Merchant-approved acceptance and concession of a customer claim |
| `POST` | `/api/disputes/:id/offer` | Proposes a partial refund settlement offer to the buyer |
| `POST` | `/api/disputes/reset` | Resets demo dispute database and store concessions to active state |
| `GET` | `/api/activity` | Returns chronological audit trail of all merchant actions |

---

## ☁️ Live Cloud Deployment

Dispute Copilot is deployed on Render as a decoupled two-tier architecture:

- 🌐 **Frontend Application (Static Site)**: [https://disputecopilot-front.onrender.com](https://disputecopilot-front.onrender.com)
- ⚡ **Backend API Service (Node.js)**: `https://disputecopilot.onrender.com`

---

## 🤝 Contribution Guidelines

Contributions are welcome! Please adhere to the following workflow:

1. **Fork & Branch**: Create a feature branch (`git checkout -b feature/your-feature-name`).
2. **Keep Safety Flags Enabled**: Always develop with `DRY_RUN=true` and `DATA_MODE=fixture` to avoid accidental live account state mutations.
3. **Workspace Hygiene**:
   - Add frontend packages inside the `web` workspace: `npm install <pkg> --workspace=web`
   - Add backend packages inside the `server` workspace: `npm install <pkg> --workspace=server`
4. **Quality Gates**: Ensure `npm run test` and `npm run build` pass with zero errors before submitting a pull request.
5. **Code Style**: Adhere to TypeScript strict mode standards and avoid scoring hallucinations.

---

## ⚖️ License

Distributed under the [MIT License](LICENSE).

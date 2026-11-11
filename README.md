# Dispute Copilot 🛡️
> **Autonomous Merchant Defense System for PayPal Payment Disputes**

[![Live Demo](https://img.shields.io/badge/Demo-Render-blue?style=flat-square)](https://dispute-copilot.onrender.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)

Dispute Copilot is an intelligent, human-in-the-loop assistant designed to help small merchants efficiently evaluate, manage, and defend against customer payment disputes on PayPal.

Small business owners often lose disputes due to strict submission deadlines, confusing evidence requirements, or lack of time to manually gather tracking numbers, order receipts, and customer chat logs. Dispute Copilot solves this by automatically ingesting disputes, assembling a cited **Evidence Pack**, evaluating case defensibility with a **100% deterministic mathematical scoring engine (0–100)**, and drafting persuasive evidence packages using a resilient **3-tier AI generation pipeline** (Groq &rarr; Google Gemini &rarr; Local Rule Engine).

Strict safety rule: **No action or evidence is ever submitted to PayPal without explicit human confirmation.**

---

## 🌟 Features

### 🛡️ 100% Deterministic Winnability Engine (0–100)
- Evaluates dispute defensibility using a pure mathematical rubric with **zero scoring hallucination**.
- Supports both **Item Not Received (`MERCHANDISE_OR_SERVICE_NOT_RECEIVED`)** and **Not As Described (`MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED`)** claims.
- Classifies cases into clear score bands: **Strong (70+)**, **Medium (40–69)**, and **Weak (<40)** defense strength.
- Automatically verifies:
  - Carrier tracking milestones and delivery status.
  - Delivery signature confirmation.
  - Carrier delivery location cross-referencing against order shipping city and state.
  - Customer complaint messages sent prior to delivery.
  - Prior partial refund or goodwill concession history.
  - Product listing descriptions and merchant return policies.

### 🧠 Resilient 3-Tier AI Defense Pipeline
- **Tier 1 (Primary)**: **Groq** (`openai/gpt-oss-120b`, fallback to Llama 3.3) for rapid response generation.
- **Tier 2 (Secondary Fallback)**: **Google Gemini 3.8 Flash** (`gemini-3.8-flash`) with automated retry logic for transient 503 service overload conditions.
- **Tier 3 (Offline Safety Net)**: **Local Grounded Rule Engine** that generates cited, formatted drafts offline if external AI services are unreachable or unconfigured.
- **Citation Verification Guardrail**: Every cited fact (`[F1]`, `[F2]`) is verified against the indexed Evidence Pack. If an invalid fact is cited, the system triggers an automatic corrective prompt retry.

### 👤 Human-in-the-Loop & Safety Harness
- **Human Approval Required**: Evidence submission, claim acceptance, and partial refund offers require explicit merchant approval.
- **Payload Inspection**: Merchants can inspect the exact JSON payload before it is transmitted.
- **Safety Flags (`DRY_RUN`)**: When `DRY_RUN=true`, mutations are simulated safely and recorded in the audit trail without modifying live account state.
- **Optimistic State Synchronization**: Dispute detail modal auto-closes upon submission, updates dispute status immediately in UI state, prevents redundant AI re-analysis, and displays confirmation toasts.

### 📊 Lifetime PayPal Transaction & P&L Control Center
- Built with **AG Grid** (`ag-grid-react`) to provide an interactive, high-performance financial dashboard.
- Monitors merchant lifetime transaction metrics, dispute win/loss rates, recovered capital, fee impacts, and net profit & loss.
- Includes an interactive **"View Order"** modal showing full order line items, tracking event history, and buyer messages.

### 🔄 Dynamic Demo Fixtures & Data Replenishment
- **Staggered Dynamic Deadlines**: Fixture disputes dynamically compute response due dates (+3 to +8 days) based on the current time so demo cases never display as expired or overdue.
- **One-Click Demo Replenishment**: Click **"Replenish Demo Data"** in the navigation bar (or call `POST /api/disputes/reset`) to instantly restore default fixtures and clear the AI cache.
- **Data Source Transparency**: Badges clearly indicate whether the app is running against the live **PayPal Sandbox** or simulated **Fixture data**.

### 📖 API Specification & Multi-Language SDKs
- Fully documented **OpenAPI 3.0 specification** (`openapi.yaml`).
- Pre-generated client SDKs for **Python** (`sdks/python`) and **TypeScript** (`sdks/typescript`) via APIMatic.
- Interactive documentation portal hosted in `portal/`.

---

## 💻 Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **Data Grid**: [AG Grid Community & React](https://www.ag-grid.com/) (v36)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (v18+ or v20+)
- **Server Framework**: [Express 4](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (with `tsx` for fast dev reload)
- **Validation**: [Zod](https://zod.dev/) (strict request schema validation)
- **Utilities**: `dotenv`, `cors`

### AI & Intelligence
- **Primary AI Provider**: [Groq SDK](https://groq.com/) (`groq-sdk`) &mdash; `openai/gpt-oss-120b`
- **Secondary AI Fallback**: [Google Gen AI SDK](https://ai.google.dev/) (`@google/genai`) &mdash; `gemini-3.8-flash`
- **Offline Fallback**: Pure TypeScript deterministic Grounded Rule Engine

### Testing & Tooling
- **Test Runner**: [Vitest](https://vitest.dev/) (unit tests for deterministic scoring engine rubrics)
- **API Specification**: OpenAPI 3.0 (`openapi.yaml`)
- **SDKs**: APIMatic generated SDKs (Python & TypeScript)

---

## 📁 Project Structure

```text
├── content/                     # Portal navigation configuration
├── data/
│   ├── store.json               # Simulated store catalog, orders, tracking & chat history
│   ├── fixtures/disputes.json   # Realistic PayPal Customer Disputes v1 payloads
│   ├── analysis-cache.json      # Cache for generated AI defense drafts
│   └── activity-log.json        # Merchant approval and submission audit trail
├── docs/
│   └── PROJECT_BRIEF.md         # Original specification and hackathon rules
├── portal/                      # APIMatic interactive developer documentation portal
├── sdks/                        # Generated client SDK libraries
│   ├── python/                  # Python SDK
│   └── typescript/              # TypeScript SDK
├── server/                      # Express backend service
│   ├── src/
│   │   ├── ai/                  # 3-tier AI engine (Groq, Gemini 3.8 Flash, fallback generator)
│   │   ├── paypal/              # PayPal Sandbox OAuth auth and REST client
│   │   ├── routes/              # Express API endpoints (/health, /disputes, /activity)
│   │   ├── scoring/             # Deterministic rubric scoring engine & Vitest unit tests
│   │   ├── store/               # Store order & dispute fixture loaders
│   │   ├── types/               # TypeScript interfaces
│   │   ├── config.ts            # Environment variable configuration
│   │   └── index.ts             # Express server entrypoint
│   ├── package.json
│   └── tsconfig.json
├── src/                         # APIMatic portal config and OpenAPI spec
├── web/                         # React frontend service
│   ├── src/
│   │   ├── components/          # UI components (DisputeTable, Modal, AnalyticsTab, Header)
│   │   ├── data/                # Lifetime transactions data for AG Grid
│   │   ├── utils/               # Date formatting and order data utilities
│   │   ├── api.ts               # Typed frontend client for backend endpoints
│   │   ├── types.ts             # Frontend TypeScript definitions
│   │   ├── App.tsx              # Main dashboard application
│   │   └── main.tsx             # React entrypoint
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── .env.example                 # Environment variables template
├── .gitignore
├── LICENSE                      # MIT License
├── openapi.yaml                 # OpenAPI 3.0 specification
├── package.json                 # Monorepo workspaces definition
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (`v20+` recommended)
- **npm**: v9.0.0 or higher
- *(Optional for live PayPal API)*: [PayPal Developer Account](https://developer.paypal.com) with Sandbox credentials
- *(Optional for AI drafts)*: [Groq API Key](https://console.groq.com) and/or [Google AI Studio Gemini API Key](https://aistudio.google.com)

> [!TIP]
> **Zero-Config Offline Mode**: Providing external API keys is optional for local development. If no AI keys are supplied, the application automatically uses the local Grounded Rule Engine fallback and sample fixtures without crashing.

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/SthitadheeDas/DisputeCopilot.git
cd DisputeCopilot

# Install monorepo dependencies across root, server, and web
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Configure the environment variables as needed:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `GROQ_API_KEY` | API key for primary AI provider (Groq) | *(Leave empty for fallback)* |
| `GROQ_MODEL` | Primary model identifier on Groq | `openai/gpt-oss-120b` |
| `GEMINI_API_KEY` | API key for secondary AI provider (Google Gemini) | *(Leave empty for fallback)* |
| `GEMINI_MODEL` | Secondary fallback model identifier | `gemini-3.8-flash` |
| `PAYPAL_CLIENT_ID` | PayPal Sandbox REST App Client ID | *(From PayPal Developer Portal)* |
| `PAYPAL_CLIENT_SECRET` | PayPal Sandbox REST App Client Secret | *(From PayPal Developer Portal)* |
| `PAYPAL_BASE_URL` | Base URL for PayPal API calls | `https://api-m.sandbox.paypal.com` |
| `DATA_MODE` | Data source: `fixture` (offline demo) or `sandbox` (live API) | `fixture` |
| `DRY_RUN` | Safety switch: `true` previews payloads; `false` calls PayPal | `true` |
| `PORT` | Local server port | `3000` |

### 3. Run Locally

#### Development Mode (Concurrent with Hot Reload)
Run backend and frontend concurrently in development mode:

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173) (Vite dev server with `/api` proxy)
- **Backend API**: [http://localhost:3000](http://localhost:3000)

#### Production Build & Run (Single Unified Service)
Build the frontend and TypeScript server into a unified production distribution:

```bash
# Build web and server distributions
npm run build

# Start the production server
npm run start
```

Access the unified application at [http://localhost:3000](http://localhost:3000).

### 4. Running Unit Tests

Run the Vitest test suite to verify the deterministic scoring engine and address matching logic:

```bash
npm run test
```

---

## ☁️ Deployment on Render

Dispute Copilot is designed to deploy seamlessly as a single **Web Service** on [Render](https://render.com). The Express server automatically serves the compiled React frontend from `web/dist` alongside all `/api` endpoints.

- **Live URL Placeholder**: `https://dispute-copilot.onrender.com` *(replace with your deployed Render service URL)*

### Render Configuration Settings

1. Connect your GitHub repository to Render.
2. Create a new **Web Service** with the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

### Required Render Environment Variables

Add the following environment variables in the Render dashboard:

| Variable | Recommended Render Value |
| :--- | :--- |
| `PORT` | `10000` |
| `DATA_MODE` | `fixture` *(recommended for demo evaluation)* or `sandbox` |
| `DRY_RUN` | `true` *(ensures submissions remain non-destructive)* |
| `GROQ_API_KEY` | *Your Groq API key (Primary AI)* |
| `GROQ_MODEL` | `openai/gpt-oss-120b` |
| `GEMINI_API_KEY` | *Your Gemini API key (Secondary AI)* |
| `GEMINI_MODEL` | `gemini-3.8-flash` |
| `PAYPAL_CLIENT_ID` | *Your PayPal Sandbox Client ID (if using sandbox)* |
| `PAYPAL_CLIENT_SECRET` | *Your PayPal Sandbox Client Secret (if using sandbox)* |
| `PAYPAL_BASE_URL` | `https://api-m.sandbox.paypal.com` |

---

## 🤝 How to Contribute

We welcome contributions from teammates! Follow these guidelines to keep work consistent and safe:

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Keep Safety Flags Enabled**:
   - Always develop with `DRY_RUN=true` to prevent accidental mutations to live or sandbox PayPal accounts.
   - Use `DATA_MODE=fixture` for quick offline verification before testing against live Sandbox accounts.
3. **Workspace Discipline**:
   - If adding frontend dependencies, install inside the `web` workspace (`npm install <pkg> --workspace=web`).
   - If adding backend dependencies, install inside the `server` workspace (`npm install <pkg> --workspace=server`).
4. **Run Unit Tests**:
   - Always run `npm run test` before opening a pull request to ensure scoring rubrics and fact validators pass.
5. **Test Data Replenishment**:
   - Use the **"Replenish Demo Data"** navbar button to verify that dispute mutations reset cleanly and state synchronizes properly.

---

## ⚖️ License

Distributed under the [MIT License](LICENSE).

# Dispute Copilot 🛡️
> **Autonomous Merchant Defense System for the PayPal AI Hackathon**

Dispute Copilot is an intelligent assistant designed to help small merchants defend against payment disputes on PayPal. It ingests customer disputes directly from the **PayPal Disputes API (v1)**, correlates each dispute with the merchant's fulfillment and customer communication records from a simulated store, synthesizes an indexed **Evidence Pack**, evaluates case defensibility via a **100% deterministic scoring engine**, and drafts grounded evidence responses using Google Gemini.

Per strict safety guidelines, **no actions or evidence are submitted without explicit human approval**.

---

## 🌟 Key Features

- **Grounded Evidence Packs**: Aggregates order specs, carrier tracking milestones, signature-on-delivery events, customer messages, and prior refund records into cited facts (`F1`, `F2`, etc.).
- **100% Deterministic Winnability Engine**: Scores dispute defensibility on a mathematical 0–100 rubric with zero AI scoring hallucination.
  - Supports `MERCHANDISE_OR_SERVICE_NOT_RECEIVED` (Item Not Received) and `MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED` (Not As Described).
  - Clear categorization into **Strong (70+)**, **Medium (40–69)**, and **Weak (&lt;40)** defense strength.
- **Human-In-The-Loop Safety Guardrail**: Actions require merchant confirmation. A payload preview dialog displays the exact JSON transmitted before sending.
- **Safety Flags (`DRY_RUN`)**: When `DRY_RUN=true`, mutations to PayPal are simulated and logged in the immutable audit trail without modifying live account state.
- **Data Source Transparency**: Distinct badges clearly indicate whether the application is running against live **PayPal Sandbox** or simulated **Fixture data**.
- **Decoupled 2-Service Architecture**: Deployed as a high-performance decoupled 2-service setup:
  - **Frontend Service**: Static Site (`DisputeCopilot_Front`) hosted globally on Render CDN.
  - **Backend API Service**: Node.js / Express Web Service (`DisputeCopilot`) hosted in Singapore.

> [!NOTE]
> **Simulated Store Notice**: Store order data (items, carrier tracking, customer chat history) is simulated in `data/store.json`. PayPal dispute data connects to the official PayPal Sandbox API (`api-m.sandbox.paypal.com`) or runs offline via `data/fixtures/disputes.json`.

---

## 🏗️ Repository Layout

```text
├── data/
│   ├── store.json                  # Simulated store catalog & order fulfillment records
│   ├── fixtures/disputes.json      # Realistic PayPal Customer Disputes v1 payloads
│   ├── analysis-cache.json         # Local cache for AI-generated analyses
│   └── activity-log.json           # Merchant approval and submission audit trail
├── docs/
│   └── PROJECT_BRIEF.md            # Hackathon project specification and rules
├── server/
│   ├── src/
│   │   ├── scoring/                # Deterministic scoring engine & evidence packs
│   │   │   ├── weights.ts          # Configurable rubric weights & score bands
│   │   │   ├── evidencePack.ts     # Fact indexing & missing item detection
│   │   │   ├── engine.ts           # Pure TypeScript evaluation engine
│   │   │   └── __tests__/          # Vitest unit test suite (13 test cases)
│   │   ├── store/                  # Store order & fixture data loaders
│   │   ├── routes/                 # Express API routes (/health, /disputes, /activity)
│   │   ├── types/                  # Shared TypeScript type definitions
│   │   ├── config.ts               # Environment configuration
│   │   └── index.ts                # Express application entrypoint
│   ├── package.json
│   └── tsconfig.json
├── web/
│   ├── src/
│   │   ├── components/             # React UI components (Table, Modal, Banner, Audit)
│   │   ├── api.ts                  # Typed backend API client
│   │   ├── types.ts                # Frontend types
│   │   ├── App.tsx                 # Dashboard application
│   │   └── main.tsx                # React DOM root
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── .env.example                    # Sample environment variables
├── .gitignore
├── LICENSE                         # MIT License
├── package.json                    # Monorepo workspaces definition
└── README.md
```

---

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **PayPal Developer Account**: [developer.paypal.com](https://developer.paypal.com)
- **Google Gemini API Key**: [aistudio.google.com](https://aistudio.google.com)

---

## ⚙️ Step-by-Step Setup

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/DisputeCopilot_PayPal_AI.git
cd DisputeCopilot_PayPal_AI

# Install monorepo dependencies (server + web)
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```dotenv
# PayPal Sandbox Credentials (from developer.paypal.com)
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret_here
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com

# Groq API Key (Primary Provider)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

# Google Gemini API Key (Secondary Fallback)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash

# Application Mode: 'fixture' (offline) or 'sandbox' (live PayPal API)
DATA_MODE=fixture

# Safety Harness: 'true' simulates mutations and previews payload; 'false' submits live
DRY_RUN=true

# Server Port
PORT=3000
```

### 3. Setting Up PayPal Sandbox Accounts

1. Log in to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard).
2. Navigate to **Testing Tools** &gt; **Sandbox Accounts**.
3. Locate or create a **Business (Merchant)** account and a **Personal (Buyer)** account.
4. Under **Apps & Credentials**, create a new REST API app associated with your Sandbox Business account.
5. Copy the **Client ID** and **Secret** into your `.env` file.

---

## 🧪 Running Unit Tests

Unit tests are written using [Vitest](https://vitest.dev/) to rigorously test the deterministic scoring engine for both `ITEM_NOT_RECEIVED` and `NOT_AS_DESCRIBED` claims:

```bash
# Run scoring engine unit tests
npm run test
```

Test coverage includes:
- Score band classifications (Strong &ge;70, Medium 40–69, Weak &lt;40)
- Perfect evidence scores (100 pts)
- Delivery without signature deductions (-15 pts)
- Missing tracking number penalties (weak score)
- Pre-delivery customer complaint deductions (-5 pts)
- Prior refund / goodwill concession penalties (-5 to -10 pts)
- Return policy and listing description verification
- Evidence Pack fact indexing and missing item detection

---

## 🚀 Running the Application

### Development Mode

Run backend and frontend concurrently with hot-reloading:

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173) (proxies `/api` to backend)
- **Backend API**: [http://localhost:3000](http://localhost:3000)

### Production Build

Build the React frontend and TypeScript server:

```bash
# Build web and server
npm run build

# Start backend server
npm run start
```

---

## ☁️ Live Architecture & Deployment

DisputeCopilot is deployed on Render as a high-performance decoupled 2-service architecture:

* 🌐 **Frontend App (Static Site):** [https://disputecopilot-front.onrender.com](https://disputecopilot-front.onrender.com)
* ⚡ **Backend API (Node.js Service):** `https://disputecopilot.onrender.com`

### Environment Configuration (Backend Service)

| Variable | Value |
| :--- | :--- |
| `PORT` | `10000` |
| `DATA_MODE` | `fixture` *(recommended for demo evaluation)* or `sandbox` |
| `DRY_RUN` | `true` *(ensures non-destructive submissions)* |
| `GROQ_API_KEY` | `your_groq_api_key` *(Primary AI)* |
| `GROQ_MODEL` | `openai/gpt-oss-120b` |
| `GEMINI_API_KEY` | `your_gemini_api_key` *(Secondary Fallback)* |
| `GEMINI_MODEL` | `gemini-3.8-flash` |

---

## ⚖️ License

Distributed under the [MIT License](LICENSE).

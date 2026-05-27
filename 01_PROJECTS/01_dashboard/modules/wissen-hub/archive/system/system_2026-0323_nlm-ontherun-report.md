# ONTHERUN Backend & NEXUZ-API: Comprehensive Briefing

## Executive Summary

ONTHERUN serves as the central backend backbone for the DkZ devkitz ecosystem. It is a dual-purpose system functioning as both a standards-compliant Model Context Protocol (MCP) server and a REST-based NEXUZ-API. The platform facilitates deep integration between AI models and productivity tools, offering a suite of over 34 specialized tools across various categories including chat, file operations, SEO, and workflow management. 

Designed for modularity and extensibility, ONTHERUN supports a wide array of high-performance providers such as OpenRouter, NVIDIA NIM, and GitHub. It occupies the third layer of the DkZ 5-layer architecture, acting as the bridge between the frontend user interface and the underlying storage and infrastructure layers.

---

## System Architecture and Ecosystem Integration

ONTHERUN is positioned as Layer 3 within the DkZ 5-layer architecture. Its role is to process requests from the NEXUZ connector (Layer 2) and interact with both Storage (Layer 4) and Infrastructure (Layer 5).

### The DkZ 5-Layer Architecture
| Layer | Component | Description |
| :--- | :--- | :--- |
| 1 | **Frontend** | Dashboard with 89+ modules and the Wiki Hub™ (4,121 entries). |
| 2 | **NEXUZ** | Frontend-backend connector (nexuz.js). |
| 3 | **ONTHERUN** | The core backend repo providing MCP and NEXUZ-API. |
| 4 | **Storage** | LocalStorage, DuckDB, Apache Iceberg, and File System. |
| 5 | **Infrastructure** | Hostinger VPS, n8n, CI/CD, and NotebookLM. |

---

## NEXUZ-API: Core Endpoints and Communication

The NEXUZ-API is a RESTful interface (Base URL: `http://localhost:3040`) designed for local environment interactions.

### Primary API Endpoints
| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Health** | GET | `/api/v1/health` | Returns status, version, uptime, and active modules. |
| **Chat** | POST | `/api/v1/chat` | AI chat interface supporting history, system prompts, and model selection. |
| **Modules** | GET | `/api/v1/modules` | Lists all available modules or details for specific modules. |
| **Files** | GET/POST| `/api/v1/files/*` | Facilitates reading and writing to the file system. |
| **Tools** | POST | `/api/v1/tools/execute` | Executes any MCP tool via REST. |
| **SEO** | POST | `/api/v1/seo/analyze` | Performs URL analysis for search engine optimization. |
| **Sync** | POST | `/api/v1/sync` | Triggers Git commit and push operations. |

### Real-Time Connectivity (WebSocket)
The system utilizes WebSockets (`ws://localhost:3040`) for real-time event broadcasting, including:
*   **connection:** Monitoring connection status.
*   **module:update:** Tracking changes to system modules.
*   **health:change:** Monitoring system status fluctuations.

### Authentication Security
Currently, the system operates without authentication as it is intended for `localhost` use only. However, there is a planned implementation for an API-Key Header using the key `X-DKZ-Key`.

---

## Model Context Protocol (MCP) Capabilities

ONTHERUN features 34+ MCP tools, which allow AI models to perform specific actions or retrieve data. These tools follow a strict naming convention: `dkz_*` for general ecosystem tools and `otr_*` for ONTHERUN-specific operations.

### Tool Categories
*   **Chat & Content:** `dkz_chat`, `dkz_summarize`, `dkz_translate`, `dkz_code_gen`.
*   **System & File Management:** `dkz_read_file`, `dkz_write_file`, `dkz_list_dir`, `dkz_git_sync`.
*   **SEO & Analytics:** `dkz_seo_analyze`, `dkz_meta_generate`.
*   **Automation & External Services:** 
    *   **n8n:** Workflow execution on Hetzner VPS.
    *   **NotebookLM:** Research notebook management.
    *   **Integrations:** Specialized tools for GitHub, Notion, and HuggingFace.
*   **Token Management:** `otr_token_set`, `otr_token_status`, `otr_token_remove` for API key administration.

---

## External Provider Integrations

The system supports over 10 AI and productivity platforms. OpenRouter is the recommended gateway due to its access to various free models.

### Supported Providers and Models
| Provider | Key Features / Models |
| :--- | :--- |
| **OpenRouter** | Gemini Flash, Llama 70B, DeepSeek R1, Qwen 72B. |
| **NVIDIA NIM** | Specialized LLM Inference. |
| **HuggingFace** | Community models and inference. |
| **NotebookLM** | Research pipeline via CLI (authenticated via Google). |
| **n8n** | Self-hosted automation via Hetzner VPS. |
| **Productivity** | Full API integrations for GitHub and Notion. |

---

## Setup and Development Standards

### Prerequisites
*   **Runtime:** Node.js v18+ (v20+ recommended).
*   **Research Tools:** Python 3.10+ (required for NotebookLM CLI).
*   **Package Management:** npm and pip.

### Installation and Configuration
1.  **Automated Setup:** Users on Windows can utilize `DKZ_START.bat` in the ecosystem root for automatic installation and launch.
2.  **Manual Configuration:** API keys and environment variables are managed via `.env` or `config.local.json`. 
3.  **MCP Integration:** The server can be configured for use in external IDEs like VS Code, Cursor, or the Claude Desktop client.

### Contribution Guidelines
The project is licensed under **AGPL-3.0**. Contributors are required to adhere to specific coding standards:
*   Use of **ESM modules** (import/export syntax).
*   **Zod** for MCP tool validation.
*   Strict adherence to **DkZ naming conventions**.

---

## Strategic Insights and Key Quotes

The development philosophy of ONTHERUN emphasizes precision and procedural integrity over raw output.

> **"Das exacte Verfahren ist wichtiger als das Ergebnis."**
*(The exact procedure is more important than the result.)*

This quote underscores the ecosystem's focus on standardized, reliable processes—reflected in the use of Zod for validation and the structured 5-layer architecture.

**Key Technical Insights:**
*   **Provider Versatility:** By utilizing OpenRouter, the system remains cost-effective by leveraging high-tier free models like Llama 70B and DeepSeek R1.
*   **Local-First Design:** The current lack of authentication and the `localhost` focus suggest a development-heavy, local-first environment intended for high-speed iteration before deployment.
*   **Extensibility:** The "Tools" endpoint (`/api/v1/tools/execute`) allows any MCP tool to be triggered via standard REST, making the backend incredibly flexible for non-MCP-native frontends.

---

## Actionable Insights

*   **Deployment Optimization:** To ensure full functionality of research pipelines, ensure Python 3.10+ is installed specifically for the NotebookLM CLI integration.
*   **Security Migration:** While the system currently lacks authentication, developers should prepare for the transition to the `X-DKZ-Key` header as the project moves beyond local-only environments.
*   **Automation Leverage:** Users should utilize the `otr_n8n_workflows` tools to offload complex tasks to a self-hosted Hetzner VPS, reducing local compute load.
*   **Workflow Efficiency:** The `DKZ_START.bat` script is the prioritized method for deployment, ensuring that all 5 layers of the architecture are synchronized and initialized correctly.
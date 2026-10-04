# 🌾 KrishiMind AI — Agricultural Intelligence & Decision Support System

[![React](https://img.shields.io/badge/Frontend-React_19_+_TypeScript-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS_3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**KrishiMind AI** is an intelligent, data-driven agricultural decision workspace engineered for modern farmers, agronomists, and agricultural advisors. It combines real-time field telemetry, micro-climate weather forecasts, ICAR agronomic research, and state-of-the-art LLM reasoning (Google Gemini) to deliver actionable, verifiable recommendations in **English**, **Hindi (हिन्दी)**, and **Gujarati (ગુજરાતી)**.

---

## 🌟 Key Features

### 1. Transparent & Grounded Agronomic Intelligence
- **No Fabricated Telemetry**: Does not simulate or generate fake sensor readings. Every agronomic metric has a transparent source:
  - *Soil Lab Reports* (explicit farmer entries with NPK, pH, and organic carbon).
  - *In-situ IoT sensors* (calibrated field hardware).
  - *Farmer Manual Observations* (visual moisture, weed pressure, pest sightings).
  - Unrecorded values remain clearly marked as `"Not provided"` rather than being assumed.
- **Micro-Climate Telemetry**: Live weather integration via Open-Meteo API fetching hyper-local temperature, relative humidity, wind speed, precipitation probability, and UV index.

### 2. Conversational AI Advisor with Multimedia & Step-by-Step Guides
- **Dynamic Reasoning**: Replaces static, hardcoded scripts with a multi-model Google Gemini reasoning pipeline (`gemini-2.5-flash`, `gemini-2.0-flash`).
- **Detailed Operational Procedures**: Breaks down recommendations into sequential, actionable field steps (calibration, basal dosing, spray timings).
- **Curated Educational Media**: Automatically associates queries with:
  - **Video Tutorials**: Direct links to practical demonstrations (drip irrigation setup, pest control techniques).
  - **Visual Guides & Diagrams**: High-resolution leaf deficiency charts, pest identification matrices, and soil health infographics.
- **Multilingual Native Interaction**: Native conversational reasoning in English, Hindi, and Gujarati with automatic language switching and transcription support.

### 3. Realistic Farmer Onboarding & Hierarchy
- **Hierarchical Farm Architecture**:
  - **Farm** (Location, GPS Coordinates, Total Area, Soil Type, State/District/City).
  - **Field** (Field Name, Sub-area, Area Unit: Bigha, Acre, Guntha, Hectare, SqM, Irrigation Source).
  - **Crop** (Crop Type, Variety, Sowing Date, Growth Stage, Expected Harvest, Target Yield).
- **Live Geolocation & Mapping**: One-touch GPS coordinate detection with integrated reverse geocoding to automatically resolve village, taluka/city, district, and state.
- **Local Unit Flexibility**: Seamlessly supports regional Indian land measurement units (`Bigha`, `Guntha`, `Acre`, `Hectare`, `Sq Meters`).

### 4. Interactive Analytics & Executive KPIs
- Modern dashboard with glassmorphism aesthetics, color-coded health meters, and SVG trend charts.
- Crop distribution radar, water consumption efficiency metrics, and prioritized urgency alerts (Critical, High, Medium, Info).

---

## 🏗️ Architecture & Technology Stack

```
KrishiMind-AI/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/              # RESTful API Endpoints (Auth, Farms, Fields, Crops, AI, Weather)
│   │   ├── core/             # Configuration, Database Engine & Auto-Migrations
│   │   ├── models/           # SQLAlchemy Data Models (User, Farm, Field, Crop, SoilReading, AIConversation)
│   │   ├── schemas/          # Pydantic v2 Validation & Response Schemas
│   │   └── services/         # AI Service (Gemini RAG), Language, Agent & Weather Integrations
│   ├── krishimind.db         # SQLite Local Database (or PostgreSQL connection)
│   └── requirements.txt      # Python Dependencies
│
├── frontend/                 # React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── components/       # Reusable UI, Layout, Modal, Forms & AI Cards
│   │   ├── context/          # Farm, Field, Auth, and Language Context Providers
│   │   ├── pages/            # Farmer & Advisor Views (Dashboard, Farms, Crops, Advisor, Soil)
│   │   ├── services/         # Axios / Fetch API Client & TypeScript Interfaces
│   │   └── i18n/             # Multilingual Translations (en, hi, gu)
│   ├── package.json          # Node Dependencies & Build Scripts
│   └── tailwind.config.js    # Custom Agronomic Color Palette & Typography
```

### Backend Stack
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12+)
- **ORM & Database**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/) with self-healing auto-migrations for SQLite and PostgreSQL.
- **Authentication**: JWT (JSON Web Tokens) with `passlib` bcrypt password hashing and Role-Based Access Control (`FARMER`, `ADVISOR`, `ADMIN`).
- **AI & Reasoning**: Google Gemini API (`google-genai` / HTTP REST cascade) + Pinecone Vector Database integration for RAG.
- **External Integrations**: Open-Meteo Weather API, Nominatim OpenStreetMap Geocoding API.

### Frontend Stack
- **Library**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite 6](https://vitejs.dev/) with hot module replacement (HMR).
- **Styling**: [TailwindCSS 3](https://tailwindcss.com/) with `@tailwindcss/typography`.
- **Icons & Animation**: [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/).
- **Data Visualization**: [Recharts](https://recharts.org/) for soil telemetry and moisture trends.
- **Internationalization**: `i18next` and `react-i18next`.

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Python**: 3.10+ (Recommended: Python 3.12)
- **Node.js**: 18+ (Recommended: Node 20 LTS)
- **Git**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/KrishiMind-AI.git
cd KrishiMind-AI
```

---

### Step 2: Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in the `backend/` folder:
   ```env
   # backend/.env
   PROJECT_NAME="KrishiMind AI"
   API_V1_STR="/api"
   SECRET_KEY="your-secure-random-secret-key"
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   
   # Database (Defaults to local SQLite if left empty)
   DATABASE_URL="sqlite:///./krishimind.db"
   
   # Optional: Google Gemini API for live multi-modal reasoning
   GEMINI_API_KEY="your-gemini-api-key"
   
   # Optional: Pinecone Vector Database for agronomic RAG
   PINECONE_API_KEY="your-pinecone-api-key"
   PINECONE_INDEX_NAME="krishimind-icar-knowledge"
   ```

5. **Start the Backend Server**:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8080 --reload
   ```
   - Swagger Interactive Documentation: [http://127.0.0.1:8080/docs](http://127.0.0.1:8080/docs)
   - Alternative ReDoc: [http://127.0.0.1:8080/redoc](http://127.0.0.1:8080/redoc)

---

### Step 3: Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Configure Frontend Environment**:
   Ensure `frontend/.env` points to the running backend:
   ```env
   VITE_API_URL=http://127.0.0.1:8080/api
   ```

4. **Start the Frontend Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Default Credentials

For rapid testing and evaluation, pre-seeded demo accounts are available:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@krishimind.ai` | `password123` | Farm management, crop telemetry, AI advisor |
| **Advisor** | `advisor@krishimind.ai` | `password123` | Multi-farm consultations, advisory publishing |
| **Admin** | `admin@krishimind.ai` | `password123` | System oversight, user and model configurations |

*You can also create a new account directly from the **Register** tab in the UI.*

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new farmer or advisor account |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT bearer token |
| `GET` | `/api/auth/me` | Fetch active user profile and language preference |
| `GET` | `/api/farms` | List all farms belonging to the authenticated user |
| `POST` | `/api/farms` | Create a new farm with location, soil type, and coordinates |
| `GET` | `/api/fields` | List fields filtered by farm ID |
| `POST` | `/api/fields` | Register field boundaries, soil characteristics, and irrigation |
| `GET` | `/api/crops` | Fetch crops and current vegetative/reproductive stage |
| `POST` | `/api/crops` | Register new crop variety, sowing date, and target yield |
| `GET` | `/api/soil-readings` | Retrieve historical soil lab & sensor measurements |
| `POST` | `/api/soil-readings` | Submit new verified soil test reading (NPK, pH, Moisture) |
| `GET` | `/api/weather/live` | Fetch real-time Open-Meteo weather for given latitude/longitude |
| `POST` | `/api/ai/ask` | Submit agricultural query to Gemini multi-lingual reasoning engine |
| `GET` | `/api/ai/recommendations` | Get active advisory recommendations and operational steps |

---

## 🛡️ Database Self-Healing & Migrations

KrishiMind AI includes an automatic migration manager (`backend/app/core/migrations.py`) executed at startup in the FastAPI lifespan. It verifies that all database tables (`farms`, `fields`, `crops`, `soil_readings`, `users`, `ai_conversations`) match the active schema, automatically applying missing columns (such as `area_unit`, `irrigation_method`, `organic_carbon`) without dropping existing data.

---

## 🧪 Testing

### Backend Unit & Integration Tests
Run the end-to-end integration and farm lifecycle test:
```bash
cd backend
python test_farm_api.py
```

### Frontend Build & Typecheck
Ensure zero TypeScript compilation errors:
```bash
cd frontend
npm run build
```

---

## 🤝 Contributing

Contributions to KrishiMind AI are welcome! Please follow these steps:
1. Fork the repository.
2. Create a descriptive feature branch (`git checkout -b feature/precision-irrigation`).
3. Commit your changes (`git commit -m "Add smart evapotranspiration calculator"`).
4. Push to the branch (`git push origin feature/precision-irrigation`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

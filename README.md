# AttriSense — workforce-attrition-ai

AI-powered HR analytics platform that predicts employee attrition risk, explains flight risk drivers with SHAP, forecasts departure timelines with survival analysis, and recommends retention actions using Gemini.

> Predict who will leave, when they will leave, and what can stop them.

---

## What Makes This Different

Most HR attrition projects stop at a binary prediction. AttriSense adds:

- **Time-to-attrition forecasting** via Cox Proportional Hazards
- **SHAP explainability** for each employee's flight drivers
- **LLM-powered retention guidance** using Gemini instead of a local model

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS + Recharts |
| Backend | FastAPI + SQLAlchemy |
| Database | PostgreSQL |
| Classifier | XGBoost + SMOTE + SHAP |
| Survival model | lifelines Cox Proportional Hazards |
| LLM | Google Gemini |
| Data | IBM HR Employee Attrition Dataset |

---

## Project Structure

```
workforce-attrition-ai/
├── attritioniq/
│   └── backend/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       ├── load_data.py
│       ├── train_model.py
│       ├── train_survival.py
│       ├── predict.py
│       ├── shap_explain.py
│       ├── survival_predict.py
│       └── routes/
│           ├── employees.py
│           ├── predictions.py
│           └── chat.py
├── frontend/
│   └── attrition/
│       ├── package.json
│       ├── package-lock.json
│       └── src/
│           ├── App.jsx
│           ├── api/client.js
│           ├── components/
│           └── pages/
│               ├── Dashboard.jsx
│               ├── Employees.jsx
│               ├── Predictions.jsx
│               ├── Chat.jsx
│               └── Upload.jsx
└── README.md
```

---

## Machine Learning Pipeline

### Classifier — XGBoost
- Data source: `WA_Fn-UseC_-HR-Employee-Attrition.csv`
- Categorical label encoding and one-hot encoding
- SMOTE balancing on training data
- Threshold: 0.25 for recall-priority risk classification
- Risk levels: High (>0.6), Medium (>0.35), Low (≤0.35)

### Survival Model — Cox PH
- Uses `YearsAtCompany * 12` as duration
- Event label: attrition
- Produces employee survival curves over time

### Explainability — SHAP
- TreeExplainer on XGBoost
- Returns top 3 features driving attrition risk per employee

---

## API Endpoints

### Employees
| Method | Endpoint | Description |
|---|---|---|
| GET | `/employees/` | List all employees |
| GET | `/employees/{id}` | Fetch profile for a single employee |

### Predictions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/predictions/predict/{id}` | Predict attrition for one employee |
| POST | `/predictions/predict_all` | Batch predict all employees |
| GET | `/predictions/explain/{id}` | SHAP explanation for one employee |
| GET | `/predictions/survival/{id}` | 12-month survival timeline |
| GET | `/predictions/all` | List employees with predictions |

### Chat
| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat/ask/{employee_id}` | Ask Gemini about an employee or workforce trends |

---

## Environment Variables

Create a `.env` file in the backend root:

```
DATABASE_URL=postgresql://user:password@localhost:5432/attritioniq
GEMINI_API_KEY=your_key_from_aistudio.google.com
```

---

## Running the Project

### Backend

```bash
python -m venv .venv
.venv\Scripts\activate    # Windows
source .venv/bin/activate # Mac/Linux

pip install fastapi uvicorn sqlalchemy psycopg2-binary pandas scikit-learn \
    xgboost imbalanced-learn shap lifelines joblib python-dotenv \
    google-generativeai python-multipart

python attritioniq/backend/load_data.py
python attritioniq/backend/train_model.py
python attritioniq/backend/train_survival.py
uvicorn attritioniq.backend.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend/attrition
npm install
npm run dev
```

---

## Recent Changes

- Updated the HR assistant chat integration to use Google Gemini instead of Ollama.
- Clarified backend and frontend startup commands.
- Added README notes about PostgreSQL and Gemini configuration.

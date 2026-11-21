# AttriSense — AI-Powered HR Attrition Platform

Predicts **who** is likely to leave, **when**, and **why**, then lets HR test retention ideas with an LLM what-if assistant.

**[Live demo](https://workforce-attrition-ai.vercel.app)** · Python · FastAPI · XGBoost · Cox survival model · SHAP · Gemini · React · PostgreSQL

---

## The problem

HR teams usually learn about attrition at the exit interview, when it is too late. A plain "will leave / will stay" model is also not very useful on its own: HR needs to know *when* the risk peaks, *what is driving it*, and *what could change it*.

## What it does

| Question HR asks | How AttriSense answers |
|---|---|
| Who is at risk? | Class-weighted XGBoost classifier, tuned to catch most leavers |
| When might they leave? | Cox Proportional Hazards survival curve (12-month view) |
| Why is this person at risk? | Per-employee SHAP: top 3 drivers |
| What could we do about it? | Gemini-powered assistant for what-if scenarios and retention ideas |

Plus a React dashboard with employee list, predictions, CSV upload and chat.

---

## Results

IBM HR Employee Attrition dataset: 1,470 employees, 16% attrition.
Reproduce with `python attritioniq/backend/train_model.py` (writes `attritioniq/backend/metrics.json`).

| Evaluation | ROC-AUC | Recall | Precision |
|---|---|---|---|
| Repeated 5-fold CV (5 x 3), threshold 0.45 | 0.823 +/- 0.031 | 70.5% | 40.7% |
| 80/20 hold-out (294 employees, 47 leavers), threshold chosen on train data only | 0.810 | 70.2% | 37.5% |

**How to read this:** the model is tuned for recall. It flags about 7 in 10 leavers, and about 4 in 10 of the people it flags actually leave. That trade-off suits an early-warning screen where a human reviews each flag, not an automated decision.

**Improvement over v1:** the first version (SMOTE, depth-5 trees, threshold 0.25) scored 0.787 ROC-AUC in the same cross-validation and only 47% recall on the hold-out.

---

## Engineering decisions

- **Recall over accuracy.** Missing a leaver costs more than a false alarm, so the operating threshold is chosen to reach about 70% recall.
- **Threshold chosen on out-of-fold predictions**, not on the test set. The hold-out number above comes from a threshold picked using training data only, so it is not tuned on the answer.
- **Class weighting instead of SMOTE.** With 237 leavers, synthetic oversampling added noise. Shallow, regularised trees (`max_depth=2`) with `scale_pos_weight` gave a better ROC-AUC (0.823 vs 0.787) in the same cross-validation.
- **Repeated cross-validation** because a single 294-row test set (47 leavers) is too small to trust on its own.
- **Survival analysis for timing.** `YearsAtCompany * 12` as duration, attrition as the event, so HR sees a risk curve over time, not only a yes/no.
- **Config-driven threshold.** `train_model.py` writes `model_config.json`; `predict.py` reads it, so retraining updates the serving threshold without code edits.

## Limitations (and what I would do next)

- **Small public benchmark.** Treat this as a demonstration of the full pipeline, not a production-grade predictor.
- **Precision is about 40%.** Use as a prioritisation aid with human review.
- **Fairness is not audited.** The model uses attributes such as age, gender and marital status because they are in the dataset. A production version would need a bias audit and a decision on which attributes to exclude.
- **Next steps:** calibration of predicted probabilities, fairness metrics across groups, and monitoring for drift on real company data.

---

## Architecture

```mermaid
flowchart LR
    UI[React + Vite dashboard<br/>Vercel] --> API[FastAPI<br/>Railway]
    API --> DB[(PostgreSQL)]
    API --> XGB[XGBoost classifier]
    API --> SHAP[SHAP explanations]
    API --> COX[Cox survival model]
    API --> LLM[Gemini API]
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Recharts |
| Backend | FastAPI, SQLAlchemy |
| Database | PostgreSQL |
| Classifier | XGBoost (class-weighted) + SHAP |
| Survival model | lifelines Cox Proportional Hazards |
| LLM | Google Gemini |
| Deployment | Vercel (frontend), Railway (backend + Postgres) |

---

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/employees/` | List all employees |
| GET | `/employees/{id}` | Profile for one employee |
| POST | `/predictions/predict/{id}` | Predict attrition for one employee |
| POST | `/predictions/predict_all` | Batch predict all employees |
| GET | `/predictions/explain/{id}` | SHAP explanation for one employee |
| GET | `/predictions/survival/{id}` | 12-month survival timeline |
| GET | `/predictions/all` | Employees with predictions |
| POST | `/chat/ask/{employee_id}` | Ask Gemini about an employee or workforce trends |

Risk bands shown in the UI (display only): High (> 0.6), Medium (> 0.35), Low (otherwise). The classification threshold itself comes from `model_config.json`.

## Project structure

```
workforce-attrition-ai/
├── attritioniq/backend/
│   ├── main.py, database.py, models.py, schemas.py
│   ├── load_data.py            # loads the dataset into PostgreSQL
│   ├── train_model.py          # CV evaluation, threshold selection, saves model + metrics
│   ├── train_survival.py       # Cox model
│   ├── predict.py, shap_explain.py, survival_predict.py
│   └── routes/ (employees, predictions, chat)
├── frontend/attrition/         # React + Vite app
└── README.md
```

---

## Run locally

Create a `.env` file in the backend folder:

```
DATABASE_URL=postgresql://user:password@localhost:5432/attritioniq
GEMINI_API_KEY=your_key_from_aistudio.google.com
```

Backend:

```bash
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

pip install fastapi uvicorn sqlalchemy psycopg2-binary pandas scikit-learn \
    xgboost shap lifelines joblib python-dotenv google-generativeai python-multipart

python attritioniq/backend/load_data.py
python attritioniq/backend/train_model.py
python attritioniq/backend/train_survival.py
uvicorn attritioniq.backend.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend/attrition
npm install
npm run dev
```

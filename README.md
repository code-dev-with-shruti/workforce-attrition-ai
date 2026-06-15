# workforce-attrition-ai

AI-powered HR analytics platform for predicting employee attrition risk, explaining flight drivers, and recommending retention actions.

## Project Summary

This project combines a Python/FastAPI backend, a machine learning pipeline, and a React/Vite frontend to deliver an interactive HR attrition intelligence system.

### What has been built

- Backend API with FastAPI and SQLAlchemy
- Data ingestion from IBM HR Employee Attrition CSV into a PostgreSQL-compatible database
- Employee attrition prediction using XGBoost with SMOTE preprocessing
- Risk scoring and probability output per employee
- SHAP-based explanation of top importance features
- Survival timeline prediction for employee flight risk
- Interactive HR chatbot powered by Ollama LLM for retention recommendations
- Frontend dashboard with employee data, risk visualization, predictions, and chat

## Key Components

### Backend (`attritioniq/backend`)

- `main.py` — FastAPI app setup, router registration, CORS middleware
- `database.py` — SQLAlchemy database connection and session management
- `models.py` — `Employee` ORM model matching the HR dataset and prediction fields
- `load_data.py` — CSV loader that prepares the dataset, drops unused columns, and inserts employee records into the database
- `train_model.py` — preprocessing, label encoding, one-hot encoding, SMOTE balancing, XGBoost training, and artifact serialization
- `predict.py` — prediction utilities for individual employees and batch CSV prediction output
- `shap_explain.py` — SHAP explanation integration to expose top attrition factors
- `survival_predict.py` — survival model timeline generation for predicted attrition risk
- `routes/` — API endpoints for employees, predictions, and chat
  - `employees.py` — list and fetch employee profile endpoints
  - `predictions.py` — predict employee attrition, batch risk inference, explain predictions, and survival timeline
  - `chat.py` — HR assistant chat endpoint with contextual employee recommendations using Ollama

### Frontend (`frontend/attrition`)

- React + Vite application
- Pages for:
  - dashboard overview
  - employee list
  - prediction management
  - HR chat support
  - CSV upload
- Uses `react-router-dom`, `recharts`, and `lucide-react`
- API client configured in `src/api/client.js` to connect to the FastAPI backend

## Data and Machine Learning

- Source dataset: `WA_Fn-UseC_-HR-Employee-Attrition.csv`
- Data preprocessing includes:
  - categorical label encoding
  - one-hot encoding for travel, department, education field, job role, marital status
  - removal of unused columns: `EmployeeCount`, `StandardHours`, `Over18`, `EmployeeNumber`
- Model training produces saved artifacts:
  - `xgb_model.pkl`
  - `encoder.pkl`
  - `feature_columns.pkl`
- Prediction logic uses a threshold of `0.25` for classification and maps probabilities to risk levels:
  - `High` if > 0.6
  - `Medium` if > 0.35
  - `Low` otherwise

## Running the project

### Backend

1. Create and activate your Python virtual environment.
2. Install required Python packages (example):
   ```bash
   pip install fastapi uvicorn sqlalchemy psycopg2-binary pandas scikit-learn xgboost imbalanced-learn shap joblib python-dotenv ollama
   ```
3. Set `DATABASE_URL` in the environment or `.env` file.
4. Load dataset into the database:
   ```bash
   python attritioniq/backend/load_data.py
   ```
5. Train the model:
   ```bash
   python attritioniq/backend/train_model.py
   ```
6. Start the API:
   ```bash
   uvicorn attritioniq.backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend

1. Navigate to `frontend/attrition`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Main features

- Predict employee attrition risk with an XGBoost model
- Store results in a SQL-backed employee table
- Provide SHAP interpretable feature explanations
- Predict attrition survival timelines
- Offer a conversational HR recommendation assistant using LLM
- Interactive data visualization dashboard

## Notes

- The backend uses `DATABASE_URL` from environment variables.
- The chat endpoint uses an Ollama model: `llama3.2:3b`.
- The frontend is configured to connect to `http://localhost:8000` by default.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import os
import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from dotenv import load_dotenv
import re

load_dotenv()

router = APIRouter(prefix="/chat", tags=["Chat"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# ✅ Updated — 2.5-flash is current, free tier, no deprecation warning
GEMINI_MODEL = "gemini-2.5-flash"


def query_gemini(prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set in .env")

    # ✅ Correct endpoint — v1beta with generateContent, not v1beta2 with generateText
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

    body = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 2048,
            "topP": 0.95,
        }
    }

    request = Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        with urlopen(request) as response:
            data = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        message = error.read().decode("utf-8")
        raise RuntimeError(f"Gemini API error {error.code}: {message}")
    except URLError as error:
        raise RuntimeError(f"Gemini request failed: {error.reason}")

    # ✅ Correct response path for generateContent
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError):
        raise RuntimeError(f"Unexpected Gemini response structure: {data}")
@router.post("/ask/{employee_id}")
def ask_chat(employee_id: int, question: str, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Pull top 5 high risk employees for workforce-wide questions
    top_risk = db.query(models.Employee).filter(
        models.Employee.Risk_Level == "High"
    ).order_by(models.Employee.Attrition_Probability.desc()).limit(5).all()

    top_risk_context = "\n".join([
        f"  - Employee #{e.id} | {e.JobRole} | {e.Department} | "
        f"Age {e.Age} | Income ${e.MonthlyIncome:,} | "
        f"Overtime: {e.OverTime} | Job Satisfaction: {e.JobSatisfaction}/4 | "
        f"Years at Company: {e.YearsAtCompany} | Risk: {e.Attrition_Probability:.1%}"
        for e in top_risk if e.Attrition_Probability
    ]) or "No predictions run yet — call /predictions/predict_all first"

    context = f"""
    Specific Employee Profile (ID: {employee.id}):
    - Age: {employee.Age}
    - Department: {employee.Department}
    - Job Role: {employee.JobRole}
    - Monthly Income: ${employee.MonthlyIncome:,}
    - Years at Company: {employee.YearsAtCompany}
    - Overtime: {employee.OverTime}
    - Job Satisfaction: {employee.JobSatisfaction}/4
    - Work Life Balance: {employee.WorkLifeBalance}/4
    - Environment Satisfaction: {employee.EnvironmentSatisfaction}/4
    - Years Since Last Promotion: {employee.YearsSinceLastPromotion}
    - Attrition Risk: {employee.Risk_Level or 'Not predicted yet'}
    - Attrition Probability: {f'{employee.Attrition_Probability:.1%}' if employee.Attrition_Probability else 'Not predicted yet'}

    Top 5 High Risk Employees Across Workforce:
{top_risk_context}
    """

    prompt = (
        f"You are an HR retention specialist AI assistant for AttriSense.\n"
        f"Workforce data:\n{context}\n"
        f"HR question: {question}\n"
        f"Answer specifically using the data provided above. "
        f"For workforce-wide questions use the top risk employees list and mention each employee's ID, role, department, and one key risk factor from their data. "
        f"For what-if questions estimate how changes affect risk level. "
        f"Be concise and actionable. Plain text only, no markdown symbols."
    )

    try:
        answer = query_gemini(prompt)
        answer = answer.replace("**", "").replace("##", "").replace("###", "")
        answer = re.sub(r'\*([^*]+)\*', r'\1', answer)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "employee_id": employee_id,
        "question": question,
        "recommendation": answer
    }
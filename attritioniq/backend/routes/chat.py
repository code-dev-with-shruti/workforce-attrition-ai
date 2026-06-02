from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import ollama

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

@router.post("/ask/{employee_id}")
def ask_chat(employee_id: int, question: str, db: Session = Depends(get_db)):
    # Step 1 — fetch employee
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Step 2 — build context
    employee_context = f"""
    Employee ID: {employee.id}
    Employee Profile:
    - Age: {employee.Age}
    - Department: {employee.Department}
    - Job Role: {employee.JobRole}
    - Monthly Income: {employee.MonthlyIncome}
    - Years at Company: {employee.YearsAtCompany}
    - Overtime: {employee.OverTime}
    - Job Satisfaction: {employee.JobSatisfaction}/4
    - Work Life Balance: {employee.WorkLifeBalance}/4
    - Environment Satisfaction: {employee.EnvironmentSatisfaction}/4
    - Years Since Last Promotion: {employee.YearsSinceLastPromotion}
    - Attrition Risk: {employee.Risk_Level}
    - Attrition Probability: {employee.Attrition_Probability}
    """

    # Step 3 — call Ollama
    response = ollama.chat(
        model="llama3.2:3b",
        messages=[{
            "role": "user",
            "content": f"""You are an HR retention specialist AI assistant.
Here is the profile of an employee:
{employee_context}
HR has asked you the following question about this employee: {question}
Based on the employee profile, answer the question asked by the user.
Provide specific, actionable retention recommendations based on this employee's data.
Be concise and actionable in your response."""
        }]
    )

    # Step 4 — return response
    return {
        "employee_id": employee_id,
        "question": question,
        "recommendation": response["message"]["content"]
    }
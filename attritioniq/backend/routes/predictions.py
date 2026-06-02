from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from predict import predict_single
from shap_explain import get_shap_explanation
from survival_predict import get_survival_timeline

router = APIRouter(
    prefix="/predictions",
    tags=["Predictions"]
)

# For individual employee prediction and DB update
@router.post("/predict/{employee_id}")
def predict_employee(employee_id: int, db: Session = Depends(get_db)):
    # Step 1 — fetch employee
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Step 2 — build dict
    employee_dict = {
        "Age": employee.Age,
        "BusinessTravel": employee.BusinessTravel,
        "DailyRate": employee.DailyRate,
        "Department": employee.Department,
        "DistanceFromHome": employee.DistanceFromHome,
        "Education": employee.Education,
        "EducationField": employee.EducationField,
        "EnvironmentSatisfaction": employee.EnvironmentSatisfaction,
        "Gender": employee.Gender,
        "HourlyRate": employee.HourlyRate,
        "JobInvolvement": employee.JobInvolvement,
        "JobLevel": employee.JobLevel,
        "JobRole": employee.JobRole,
        "JobSatisfaction": employee.JobSatisfaction,
        "MaritalStatus": employee.MaritalStatus,
        "MonthlyIncome": employee.MonthlyIncome,
        "MonthlyRate": employee.MonthlyRate,
        "NumCompaniesWorked": employee.NumCompaniesWorked,
        "OverTime": employee.OverTime,
        "PercentSalaryHike": employee.PercentSalaryHike,
        "PerformanceRating": employee.PerformanceRating,
        "RelationshipSatisfaction": employee.RelationshipSatisfaction,
        "StockOptionLevel": employee.StockOptionLevel,
        "TotalWorkingYears": employee.TotalWorkingYears,
        "TrainingTimesLastYear": employee.TrainingTimesLastYear,
        "WorkLifeBalance": employee.WorkLifeBalance,
        "YearsAtCompany": employee.YearsAtCompany,
        "YearsInCurrentRole": employee.YearsInCurrentRole,
        "YearsSinceLastPromotion": employee.YearsSinceLastPromotion,
        "YearsWithCurrManager": employee.YearsWithCurrManager,
    }

    # Step 3 — run ML model
    result = predict_single(employee_dict)

    # Step 4 — save back to DB
    employee.Attrition_Probability = result["attrition_probability"]
    employee.Risk_Level = result["risk_level"]
    db.commit()
    db.refresh(employee)

    # Step 5 — return result
    return {
        "employee_id": employee_id,
        "prediction": result["prediction"],
        "attrition_probability": result["attrition_probability"],
        "risk_level": result["risk_level"]
    }

# For fetching predictions of risk levels of all employees with predictions
@router.post("/predict_all")
def predict_all_employees(db: Session = Depends(get_db)):
    employees = db.query(models.Employee).all()
    results = {
        "total":0,
        "high_risk":0,
        "medium_risk":0,
        "low_risk":0,
        "processed":0
    }

    for employee in employees:
        try:
            employee_dict = {
                "Age": employee.Age,
                "BusinessTravel": employee.BusinessTravel,
                "DailyRate": employee.DailyRate,
                "Department": employee.Department,
                "DistanceFromHome": employee.DistanceFromHome,
                "Education": employee.Education,
                "EducationField": employee.EducationField,
                "EnvironmentSatisfaction": employee.EnvironmentSatisfaction,
                "Gender": employee.Gender,
                "HourlyRate": employee.HourlyRate,
                "JobInvolvement": employee.JobInvolvement,
                "JobLevel": employee.JobLevel,
                "JobRole": employee.JobRole,
                "JobSatisfaction": employee.JobSatisfaction,
                "MaritalStatus": employee.MaritalStatus,
                "MonthlyIncome": employee.MonthlyIncome,
                "MonthlyRate": employee.MonthlyRate,
                "NumCompaniesWorked": employee.NumCompaniesWorked,
                "OverTime": employee.OverTime,
                "PercentSalaryHike": employee.PercentSalaryHike,
                "PerformanceRating": employee.PerformanceRating,
                "RelationshipSatisfaction": employee.RelationshipSatisfaction,
                "StockOptionLevel": employee.StockOptionLevel,
                "TotalWorkingYears": employee.TotalWorkingYears,
                "TrainingTimesLastYear": employee.TrainingTimesLastYear,
                "WorkLifeBalance": employee.WorkLifeBalance,
                "YearsAtCompany": employee.YearsAtCompany,
                "YearsInCurrentRole": employee.YearsInCurrentRole,
                "YearsSinceLastPromotion": employee.YearsSinceLastPromotion,
                "YearsWithCurrManager": employee.YearsWithCurrManager,
            }
            result = predict_single(employee_dict)
            employee.Attrition_Probability = result["attrition_probability"]
            employee.Risk_Level = result["risk_level"]

            results["processed"] += 1
            if result["risk_level"] == "High":
                results["high_risk"] += 1
            elif result["risk_level"] == "Medium":
                results["medium_risk"] += 1
            else:
                results["low_risk"] += 1
    
        except Exception as e:
            print(f"Error processing employee ID {employee.id}: {e}")
            continue
    db.commit()
    results["total"] = len(employees)
    return results


@router.get("/all")
def get_all_predictions(db: Session = Depends(get_db)):
    employees = db.query(models.Employee).filter(
        models.Employee.Risk_Level != None).all()
    return employees

@router.get("/explain/{employee_id}")
def explain_prediction(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    employee_dict = {
        "Age": employee.Age,
        "BusinessTravel": employee.BusinessTravel,
        "DailyRate": employee.DailyRate,
        "Department": employee.Department,
        "DistanceFromHome": employee.DistanceFromHome,
        "Education": employee.Education,
        "EducationField": employee.EducationField,
        "EnvironmentSatisfaction": employee.EnvironmentSatisfaction,
        "Gender": employee.Gender,
        "HourlyRate": employee.HourlyRate,
        "JobInvolvement": employee.JobInvolvement,
        "JobLevel": employee.JobLevel,
        "JobRole": employee.JobRole,
        "JobSatisfaction": employee.JobSatisfaction,
        "MaritalStatus": employee.MaritalStatus,
        "MonthlyIncome": employee.MonthlyIncome,
        "MonthlyRate": employee.MonthlyRate,
        "NumCompaniesWorked": employee.NumCompaniesWorked,
        "OverTime": employee.OverTime,
        "PercentSalaryHike": employee.PercentSalaryHike,
        "PerformanceRating": employee.PerformanceRating,
        "RelationshipSatisfaction": employee.RelationshipSatisfaction,
        "StockOptionLevel": employee.StockOptionLevel,
        "TotalWorkingYears": employee.TotalWorkingYears,
        "TrainingTimesLastYear": employee.TrainingTimesLastYear,
        "WorkLifeBalance": employee.WorkLifeBalance,
        "YearsAtCompany": employee.YearsAtCompany,
        "YearsInCurrentRole": employee.YearsInCurrentRole,
        "YearsSinceLastPromotion": employee.YearsSinceLastPromotion,
        "YearsWithCurrManager": employee.YearsWithCurrManager,
    }
    explanation = get_shap_explanation(employee_dict)
    return{
        "Employee ID": employee_id,
        "Risk Level": employee.Risk_Level,
        "Attrition Probability": employee.Attrition_Probability,
        "Explanation(Top 3 Factors)": explanation
    }

@router.get("/survival/{employee_id}")
def get_survival(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(
        models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    employee_dict = {
        "Age": employee.Age,
        "BusinessTravel": employee.BusinessTravel,
        "DailyRate": employee.DailyRate,
        "Department": employee.Department,
        "DistanceFromHome": employee.DistanceFromHome,
        "Education": employee.Education,
        "EducationField": employee.EducationField,
        "EnvironmentSatisfaction": employee.EnvironmentSatisfaction,
        "Gender": employee.Gender,
        "HourlyRate": employee.HourlyRate,
        "JobInvolvement": employee.JobInvolvement,
        "JobLevel": employee.JobLevel,
        "JobRole": employee.JobRole,
        "JobSatisfaction": employee.JobSatisfaction,
        "MaritalStatus": employee.MaritalStatus,
        "MonthlyIncome": employee.MonthlyIncome,
        "MonthlyRate": employee.MonthlyRate,
        "NumCompaniesWorked": employee.NumCompaniesWorked,
        "OverTime": employee.OverTime,
        "PercentSalaryHike": employee.PercentSalaryHike,
        "PerformanceRating": employee.PerformanceRating,
        "RelationshipSatisfaction": employee.RelationshipSatisfaction,
        "StockOptionLevel": employee.StockOptionLevel,
        "TotalWorkingYears": employee.TotalWorkingYears,
        "TrainingTimesLastYear": employee.TrainingTimesLastYear,
        "WorkLifeBalance": employee.WorkLifeBalance,
        "YearsAtCompany": employee.YearsAtCompany,
        "YearsInCurrentRole": employee.YearsInCurrentRole,
        "YearsSinceLastPromotion": employee.YearsSinceLastPromotion,
        "YearsWithCurrManager": employee.YearsWithCurrManager,
    }

    timeline = get_survival_timeline(employee_dict)
    return {
        "employee_id": employee_id,
        "risk_level": employee.Risk_Level,
        "overall_12month_risk": timeline[-1]["attrition_risk"],
        "survival_timeline": timeline
    }


@router.get("/{employee_id}")
def get_prediction(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(
        models.Employee.id == employee_id
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {
        "employee_id": employee_id,
        "attrition_probability": employee.Attrition_Probability,
        "risk_level": employee.Risk_Level
    }
import joblib
import pandas as pd
from predict import preprocess

cox_model = joblib.load('cox_model.pkl')

# Test with a sample employee
employee_dict = {
    "Age": 35,
    "BusinessTravel": "Travel_Rarely",
    "DailyRate": 800,
    "Department": "Sales",
    "DistanceFromHome": 5,
    "Education": 3,
    "EducationField": "Life Sciences",
    "EnvironmentSatisfaction": 2,
    "Gender": "Male",
    "HourlyRate": 60,
    "JobInvolvement": 3,
    "JobLevel": 2,
    "JobRole": "Sales Executive",
    "JobSatisfaction": 2,
    "MaritalStatus": "Single",
    "MonthlyIncome": 4000,
    "MonthlyRate": 15000,
    "NumCompaniesWorked": 3,
    "OverTime": "Yes",
    "PercentSalaryHike": 12,
    "PerformanceRating": 3,
    "RelationshipSatisfaction": 2,
    "StockOptionLevel": 0,
    "TotalWorkingYears": 8,
    "TrainingTimesLastYear": 2,
    "WorkLifeBalance": 2,
    "YearsAtCompany": 3,
    "YearsInCurrentRole": 2,
    "YearsSinceLastPromotion": 2,
    "YearsWithCurrManager": 2,
}

df = pd.DataFrame([employee_dict])
processed_df = preprocess(df)

# Debug
print("Model time points:", cox_model.baseline_survival_.index.tolist()[:15])

survival_func = cox_model.predict_survival_function(processed_df)
print("Survival values:", survival_func.iloc[:10])

print("RUN SCRIPT")
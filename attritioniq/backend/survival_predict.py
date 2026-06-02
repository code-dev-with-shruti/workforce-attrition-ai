import joblib
import pandas as pd
import numpy as np
from predict import preprocess

cox_model = joblib.load('cox_model.pkl')

def get_survival_timeline(employee_dict: dict):
    # Step 1 — preprocess
    df = pd.DataFrame([employee_dict])
    processed_df = preprocess(df)

    # Step 2 — use exact time points from model
    time_points = [1, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120]

    # Step 3 — get survival function
    survival_func = cox_model.predict_survival_function(
        processed_df,
        times=time_points
    )

    # Step 4 — format timeline
    timeline = []
    for month in time_points:
        prob = float(survival_func.loc[month].iloc[0])
        timeline.append({
            "month": month,
            "survival_probability": round(prob, 4),
            "attrition_risk": round(1 - prob, 4)
        })

    return timeline
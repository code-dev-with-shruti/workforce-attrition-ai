import joblib
import pandas as pd
import numpy as np
from predict import preprocess
import shap

model = joblib.load('xgb_model.pkl')
feature_cols = joblib.load('feature_columns.pkl')
encoder = joblib.load('encoder.pkl')

def get_shap_explanation(employee_dict):
    df = pd.DataFrame([employee_dict])
    processed_df = preprocess(df)

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(processed_df)

    shap_series = pd.Series(np.abs(shap_values[0]), index=feature_cols)
    top_factors = shap_series.nlargest(3)

    explanations = []
    for feature, importance in top_factors.items():
        explanations.append({
            "factor": feature,
            "importance": round(float(importance), 4)
        })
    return explanations 
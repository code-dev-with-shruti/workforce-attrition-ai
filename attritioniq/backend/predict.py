# predict.py

import pandas as pd
import joblib

# Load saved files
model = joblib.load("xgb_model.pkl")
encoder = joblib.load("encoder.pkl")
feature_cols = joblib.load("feature_columns.pkl")


def preprocess(df):
    """Apply same preprocessing as training"""

    # Remove target if exists
    if "Attrition" in df.columns:
        df = df.drop("Attrition", axis=1)

    # Label encoding
    for col in ['Gender', 'OverTime']:
        if col in df.columns:
            le = encoder[col]
            df[col] = le.transform(df[col])

    # One-hot encoding
    df = pd.get_dummies(
        df,
        columns=['BusinessTravel', 'Department', 'EducationField', 'JobRole', 'MaritalStatus'],
        drop_first=True
    )

    # Align columns
    df = df.reindex(columns=feature_cols, fill_value=0)

    # Ensure numeric
    df = df.apply(pd.to_numeric, errors='coerce').fillna(0)

    return df


def predict_csv(input_file, output_file="output_predictions.csv"):
    """Main function: CSV → Predictions → Output CSV"""

    df = pd.read_csv(input_file)

    # Keep original for output
    original_df = df.copy()

    # Preprocess
    processed_df = preprocess(df)

    # Predict
    probs = model.predict_proba(processed_df)[:, 1]
    preds = (probs > 0.25).astype(int)

    # Add results
    original_df["Prediction"] = ["Will Leave" if p == 1 else "Will Stay" for p in preds]
    original_df["Attrition_Probability"] = probs

    # Risk categorization
    def get_risk(p):
        if p > 0.6:
            return "High"
        elif p > 0.35:
            return "Medium"
        else:
            return "Low"

    original_df["Risk_Level"] = original_df["Attrition_Probability"].apply(get_risk)

    # Save output
    original_df.to_csv(output_file, index=False)

    print(f"✅ Predictions saved to {output_file}")


"""For FastAPI — takes one employee as dict, returns prediction"""
def predict_single(employee_dict: dict) -> dict:
    df = pd.DataFrame([employee_dict])
    processed = preprocess(df)
    
    prob = model.predict_proba(processed)[0][1]
    pred = int(prob > 0.25)
    
    risk = "High" if prob > 0.6 else "Medium" if prob > 0.35 else "Low"
    
    return {
        "prediction": "Will Leave" if pred == 1 else "Will Stay",
        "attrition_probability": round(float(prob), 4),
        "risk_level": risk
    }


# 🔥 Run this file directly to test
if __name__ == "__main__":
    predict_csv("WA_Fn-UseC_-HR-Employee-Attrition.csv")
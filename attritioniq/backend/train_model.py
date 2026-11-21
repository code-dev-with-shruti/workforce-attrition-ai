"""Train and evaluate the attrition classifier.

Run from anywhere:  python train_model.py
Outputs: xgb_model.pkl, encoder.pkl, feature_columns.pkl, model_config.json, metrics.json
"""
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (average_precision_score, precision_score,
                             recall_score, roc_auc_score)
from sklearn.model_selection import (RepeatedStratifiedKFold, StratifiedKFold,
                                     train_test_split)
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier

HERE = Path(__file__).resolve().parent
DATA_PATH = HERE / "WA_Fn-UseC_-HR-Employee-Attrition.csv"
TARGET_RECALL = 0.70   # recall-priority: flag at least ~70% of leavers
SEED = 42

# Shallow, regularised trees + class weighting (replaces SMOTE: better CV ROC-AUC
# on this small dataset, 0.823 vs 0.787 in repeated 5-fold CV).
PARAMS = dict(
    n_estimators=400,
    max_depth=2,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.7,
    min_child_weight=5,
    reg_lambda=10,
    scale_pos_weight=5.2,   # ~ (stayers / leavers) = 1233 / 237
    eval_metric="logloss",
    random_state=SEED,
)

# ---------------------------------------------------------------- data
df = pd.read_csv(DATA_PATH)
encoder = {}
for col in ["Attrition", "Gender", "OverTime"]:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoder[col] = le

df = pd.get_dummies(
    df,
    columns=["BusinessTravel", "Department", "EducationField", "JobRole", "MaritalStatus"],
    drop_first=True,
)
df.drop(["EmployeeCount", "EmployeeNumber", "StandardHours", "Over18"], axis=1, inplace=True)

X = df.drop("Attrition", axis=1)
y = df["Attrition"]
print(f"Dataset: {X.shape[0]} employees, {X.shape[1]} features, {y.mean():.1%} attrition")


def new_model():
    return XGBClassifier(**PARAMS)


def pick_threshold(y_true, probs, target_recall=TARGET_RECALL):
    """Highest threshold that still reaches the target recall (best precision)."""
    best = 0.5
    for t in np.arange(0.10, 0.90, 0.01):
        if recall_score(y_true, probs > t) >= target_recall:
            best = float(t)
    return round(best, 2)


# ------------------------------------- 1) repeated 5-fold CV (5 x 3 = 15 folds)
cv = RepeatedStratifiedKFold(n_splits=5, n_repeats=3, random_state=SEED)
cv_probs = []
for tr, te in cv.split(X, y):
    p = new_model().fit(X.iloc[tr], y.iloc[tr]).predict_proba(X.iloc[te])[:, 1]
    cv_probs.append((y.iloc[te].values, p))

# threshold chosen from pooled out-of-fold predictions
all_y = np.concatenate([a for a, _ in cv_probs])
all_p = np.concatenate([b for _, b in cv_probs])
threshold = pick_threshold(all_y, all_p)

cv_auc = [roc_auc_score(a, b) for a, b in cv_probs]
cv_pr = [average_precision_score(a, b) for a, b in cv_probs]
cv_rec = [recall_score(a, b > threshold) for a, b in cv_probs]
cv_prec = [precision_score(a, b > threshold) for a, b in cv_probs]

# ------------- 2) honest hold-out: threshold chosen on TRAIN only, scored on TEST
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=SEED, stratify=y)
oof = np.zeros(len(y_tr))
for a, b in StratifiedKFold(5, shuffle=True, random_state=SEED).split(X_tr, y_tr):
    oof[b] = new_model().fit(X_tr.iloc[a], y_tr.iloc[a]).predict_proba(X_tr.iloc[b])[:, 1]
holdout_threshold = pick_threshold(y_tr, oof)
p_te = new_model().fit(X_tr, y_tr).predict_proba(X_te)[:, 1]
holdout = {
    "threshold": holdout_threshold,
    "roc_auc": round(roc_auc_score(y_te, p_te), 3),
    "pr_auc": round(average_precision_score(y_te, p_te), 3),
    "recall": round(recall_score(y_te, p_te > holdout_threshold), 3),
    "precision": round(precision_score(y_te, p_te > holdout_threshold), 3),
    "n_test": int(len(y_te)),
    "n_test_leavers": int(y_te.sum()),
}

metrics = {
    "cv_5x3": {
        "threshold": threshold,
        "roc_auc_mean": round(float(np.mean(cv_auc)), 3),
        "roc_auc_std": round(float(np.std(cv_auc)), 3),
        "pr_auc_mean": round(float(np.mean(cv_pr)), 3),
        "recall_mean": round(float(np.mean(cv_rec)), 3),
        "precision_mean": round(float(np.mean(cv_prec)), 3),
    },
    "holdout_80_20": holdout,
}
print(json.dumps(metrics, indent=2))

# -------------------------- 3) final model on all data + artifacts for the API
model = new_model().fit(X, y)
joblib.dump(model, HERE / "xgb_model.pkl")
joblib.dump(encoder, HERE / "encoder.pkl")
joblib.dump(list(X.columns), HERE / "feature_columns.pkl")
(HERE / "model_config.json").write_text(json.dumps({"threshold": threshold}, indent=2))
(HERE / "metrics.json").write_text(json.dumps(metrics, indent=2))
print(f"Saved model + artifacts. Operating threshold = {threshold}")

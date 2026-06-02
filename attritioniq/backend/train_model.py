import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix,accuracy_score, precision_score, recall_score  
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE

# Load dataset
df = pd.read_csv("C:/Users/KIIT01/Desktop/Revised_Full_Stack_Project/WA_Fn-UseC_-HR-Employee-Attrition.csv")
print(df.head())

# Encode categorical columns
encoder = {}
cols = ['Attrition', 'Gender', 'OverTime']

for col in cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoder[col] = le

# One-hot encoding
df = pd.get_dummies(
    df,
    columns=['BusinessTravel', 'Department', 'EducationField', 'JobRole', 'MaritalStatus'],
    drop_first=True
)

# Drop unnecessary columns
df.drop(['EmployeeCount', 'EmployeeNumber', 'StandardHours', 'Over18'], axis=1, inplace=True)


print("---- TO CHECK SHAPE OF DATASET AFTER PREPROCESSING ----")
print(df.shape)
print(df.info())

# Split data
X = df.drop('Attrition', axis=1)
y = df['Attrition']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42,stratify=y)

# SMOTE
smote = SMOTE(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X_train, y_train)

# Train model
model = XGBClassifier(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.1,
    eval_metric='logloss',
    use_label_encoder=False,
    random_state=42
)

model.fit(X_resampled, y_resampled)
probs = model.predict_proba(X_test)[:, 1]
y_pred = (probs > 0.25).astype(int)

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
class_report = classification_report(y_test, y_pred)
confusion_mat = confusion_matrix(y_test, y_pred)
print("METRICS FOR PREFORMANCE:")
print(f"Accuracy: {accuracy}")
print(f"Precision: {precision}")
print(f"Recall: {recall}")
print(f"Classification Report:\n{class_report}")
print(f"Confusion Matrix:\n{confusion_mat}")

# Save artifacts
joblib.dump(model, "xgb_model.pkl")
joblib.dump(encoder, "encoder.pkl")
joblib.dump(list(X.columns), "feature_columns.pkl")

print("✅ Model trained and saved successfully!")
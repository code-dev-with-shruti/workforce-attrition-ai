# import pandas as pd
# import joblib
# from lifelines import CoxPHFitter

# # Load dataset
# df = pd.read_csv("C:/Users/KIIT01/Desktop/Revised_Full_Stack_Project/WA_Fn-UseC_-HR-Employee-Attrition.csv")

# # Drop useless columns
# df.drop(['EmployeeCount', 'EmployeeNumber', 'StandardHours', 'Over18'], axis=1, inplace=True)

# # Convert Attrition to binary
# df['Attrition'] = df['Attrition'].map({'Yes': 1, 'No': 0})

# # Reuse existing encoder
# encoder = joblib.load('encoder.pkl')
# for col in ['Gender', 'OverTime']:
#     le = encoder[col]
#     df[col] = le.transform(df[col])

# # One-hot encoding
# df = pd.get_dummies(
#     df,
#     columns=['BusinessTravel', 'Department', 'EducationField', 'JobRole', 'MaritalStatus'],
#     drop_first=True
# )

# # Convert bool to int
# bool_cols = df.select_dtypes(include='bool').columns # Will find all boolean cols
# df[bool_cols] = df[bool_cols].astype(int)

# # Duration column
# df['duration'] = (df['YearsAtCompany']*12).clip(lower=1) # How many years did an employee serve and also if there is a new joiner it will change to 1

# # Train Cox model
# cph = CoxPHFitter()
# cph.fit(df, duration_col='duration', event_col='Attrition')

# # Save
# joblib.dump(cph, 'cox_model.pkl')
# print("Cox Survival model trained and saved!")



from lifelines import CoxPHFitter
import pandas as pd
import joblib

df = pd.read_csv("C:/Users/KIIT01/Desktop/Revised_Full_Stack_Project/WA_Fn-UseC_-HR-Employee-Attrition.csv")

df.drop(['EmployeeCount', 'EmployeeNumber', 'StandardHours', 'Over18'], axis=1, inplace=True)

df['Attrition'] = df['Attrition'].map({'Yes': 1, 'No': 0})

encoder = joblib.load('encoder.pkl')
for col in ['Gender', 'OverTime']:
    le = encoder[col]
    df[col] = le.transform(df[col])

df = pd.get_dummies(
    df,
    columns=['BusinessTravel', 'Department', 'EducationField', 'JobRole', 'MaritalStatus'],
    drop_first=True
)

bool_cols = df.select_dtypes(include='bool').columns
df[bool_cols] = df[bool_cols].astype(int)

df['duration'] = (df['YearsAtCompany'] * 12).clip(lower=1)

# Separate attrition and non-attrition
attrition_df = df[df['Attrition'] == 1]
no_attrition_df = df[df['Attrition'] == 0]

# Oversample attrition cases to balance
attrition_oversampled = attrition_df.sample(
    n=len(no_attrition_df),
    replace=True,
    random_state=42
)

# Combine balanced dataset
balanced_df = pd.concat([no_attrition_df, attrition_oversampled])
balanced_df = balanced_df.sample(frac=1, random_state=42).reset_index(drop=True)

print(f"Balanced dataset: {balanced_df['Attrition'].value_counts()}")

# Train with penalizer for stability
cph = CoxPHFitter(penalizer=0.1)
cph.fit(balanced_df, duration_col='duration', event_col='Attrition')

print("Concordance index:", cph.concordance_index_)

joblib.dump(cph, 'cox_model.pkl')
print("✅ Cox Survival model trained and saved!")
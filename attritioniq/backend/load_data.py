import pandas as pd
from sqlalchemy import create_engine
from database import engine, Base
import models

# Step 1 — Let SQLAlchemy create the table with correct types
Base.metadata.drop_all(bind=engine)   # drops old table
Base.metadata.create_all(bind=engine) # creates fresh table with correct types

# Step 2 — Load CSV
df = pd.read_csv("WA_Fn-UseC_-HR-Employee-Attrition.csv")

# Step 3 — Drop useless columns
df.drop(['EmployeeCount', 'StandardHours', 'Over18'], axis=1, inplace=True)

# Step 4 — Force correct string types
df['Attrition'] = df['Attrition'].astype(str)
df['Gender'] = df['Gender'].astype(str)
df['OverTime'] = df['OverTime'].astype(str)
df['BusinessTravel'] = df['BusinessTravel'].astype(str)
df['Department'] = df['Department'].astype(str)
df['EducationField'] = df['EducationField'].astype(str)
df['JobRole'] = df['JobRole'].astype(str)
df['MaritalStatus'] = df['MaritalStatus'].astype(str)

# Step 5 — Add empty prediction columns
df['Attrition_Probability'] = None
df['Risk_Level'] = None

# Step 6 — Insert data into SQLAlchemy created table
# if_exists='append' means just INSERT data, don't recreate table!
df.to_sql('employees', engine, if_exists='append', index=True, index_label='id')

print(f"{len(df)} employees loaded into PostgreSQL!")
from sqlalchemy import Column, Integer, String, Float, Boolean
from database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    Age = Column(Integer)
    Attrition = Column(String)
    BusinessTravel = Column(String)
    DailyRate = Column(Integer)
    Department = Column(String)
    DistanceFromHome = Column(Integer)
    Education = Column(Integer)
    EducationField = Column(String)
    EmployeeNumber = Column(Integer)
    EnvironmentSatisfaction = Column(Integer)
    Gender = Column(String)
    HourlyRate = Column(Integer)
    JobInvolvement = Column(Integer)
    JobLevel = Column(Integer)
    JobRole = Column(String)
    JobSatisfaction = Column(Integer)
    MaritalStatus = Column(String)
    MonthlyIncome = Column(Integer)
    MonthlyRate = Column(Integer)
    NumCompaniesWorked = Column(Integer)
    OverTime = Column(String)
    PercentSalaryHike = Column(Integer)
    PerformanceRating = Column(Integer)
    RelationshipSatisfaction = Column(Integer)
    StockOptionLevel = Column(Integer)
    TotalWorkingYears = Column(Integer)
    TrainingTimesLastYear = Column(Integer)
    WorkLifeBalance = Column(Integer)
    YearsAtCompany = Column(Integer)
    YearsInCurrentRole = Column(Integer)
    YearsSinceLastPromotion = Column(Integer)
    YearsWithCurrManager = Column(Integer)

    # ML prediction results
    Attrition_Probability = Column(Float, nullable=True)
    Risk_Level = Column(String, nullable=True)
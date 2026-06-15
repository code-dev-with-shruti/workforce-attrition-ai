from fastapi import FastAPI
from database import Base, engine
import models
from routes import employees,predictions,chat
from fastapi.middleware.cors import CORSMiddleware
# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title = "AttritionIQ API",
    description = "AI Powered Employee Attrition Prediction API built with FastAPI and SQLAlchemy",
    version = "1.0.0"
)

app.include_router(employees.router)
app.include_router(predictions.router)
app.include_router(chat.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "AttritionIQ API is running!"}

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="KisanIQ API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class FarmData(BaseModel):
    location: str
    season: str
    water: str
    soil_ph: Optional[float] = None


@app.get("/")
def home():
    return {"message": "KisanIQ backend is running!"}


@app.post("/recommend")
def recommend_crops(farm: FarmData):
    return {
        "location": farm.location,
        "recommendations": [
            {
                "crop": "Soybean",
                "score": 85,
                "reason": "Mock result for interface testing"
            },
            {
                "crop": "Cotton",
                "score": 75,
                "reason": "Mock result for interface testing"
            }
        ]
    }

from recommender import router as recommender_router
app.include_router(recommender_router)


from weather import router as weather_router
app.include_router(weather_router)


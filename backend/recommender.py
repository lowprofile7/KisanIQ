"""Rule-based crop recommendations from backend/data/crops.csv.
Scores are demonstration rules over provisional (unverified) data."""
import csv
import re
from pathlib import Path
from typing import Optional

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api")

CSV_PATH = Path(__file__).parent / "data" / "crops.csv"
REGION = "maharashtra"
TOP_N = 5
LEVELS = ["low", "moderate", "high"]
SOIL_KEYWORDS = {
    "black": ["black", "clay"],
    "loamy": ["loam"],
    "alluvial": ["alluvial"],
}
# Provisional safeguard: paddy rice is water-intensive.
# The CSV's crop-water figure may not represent total irrigation demand.
FLOODED_CROPS = {"rice"}

def _load_rows():
    with open(CSV_PATH, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    return [r for r in rows if (r.get("region") or "").strip().lower() == REGION]


ROWS = _load_rows()


class FarmDetails(BaseModel):
    soilType: str = "black"
    season: str = "kharif"
    waterAvailability: str = "moderate"
    farmSizeAcres: Optional[float] = None
    ph: Optional[float] = None


def _num(value):
    try:
        return float(str(value).strip())
    except ValueError:
        return None


def _water_need(text):
    m = re.search(r"(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)", text or "")
    if not m:
        return None
    mid = (float(m.group(1)) + float(m.group(2))) / 2
    if mid < 600:
        return "low"
    return "moderate" if mid <= 1000 else "high"


def _score_row(row, farm, personalized):
    soil_w, water_w, ph_w = (30, 40, 30) if personalized else (40, 60, 0)
    score = 0.0
    reasons = []

    soil_text = (row.get("soil_types") or "").strip()
    keywords = SOIL_KEYWORDS.get(farm.soilType.lower(), [])
    if any(k in soil_text.lower() for k in keywords):
        score += soil_w
        reasons.append(f"Soil: its needs ({soil_text}) fit {farm.soilType} soil.")
    else:
        reasons.append(
            f"Soil: its needs ({soil_text or 'not recorded'}) are not a clear match for {farm.soilType} soil."
        )

    have = farm.waterAvailability.strip().lower()
    need = _water_need(row.get("water_requirement"))
    flooded = (row.get("crop") or "").strip().lower() in FLOODED_CROPS

    if flooded:
        need = "high"
    if need is None or have not in LEVELS:
        reasons.append("Water: no usable water-need figure, so no water points were given.")
    else:
        gap = abs(LEVELS.index(need) - LEVELS.index(have))
        if gap == 0:
            score += water_w
            reasons.append(f"Water: its {need} water need matches your {have} water availability.")
        elif gap == 1:
            score += water_w * 0.5
            reasons.append(f"Water: its {need} water need is one step from your {have} availability.")
        else:
            reasons.append(f"Water: its {need} water need does not match your {have} availability.")
    if flooded:
        reasons.append(
            "Water: paddy rice is provisionally treated as high-water-demand; "
            "the CSV crop-water figure may not include total irrigation needs."
        )
    if personalized:
        lo, hi = _num(row.get("ph_min")), _num(row.get("ph_max"))
        if lo is None or hi is None:
            reasons.append("pH: no pH range recorded for this crop.")
        elif lo <= farm.ph <= hi:
            score += ph_w
            reasons.append(f"pH: your {farm.ph} is inside its preferred {lo}-{hi} range.")
        elif lo - 0.5 <= farm.ph <= hi + 0.5:
            score += ph_w * 0.5
            reasons.append(f"pH: your {farm.ph} is just outside its preferred {lo}-{hi} range.")
        else:
            reasons.append(f"pH: your {farm.ph} is outside its preferred {lo}-{hi} range.")

    return score, reasons


def _recommend(farm, personalized):
    season = farm.season.strip().lower()
    best = {}
    for row in ROWS:
        row_season = (row.get("season") or "").strip().lower()
        crop = (row.get("crop") or "").strip()
        if not crop or row_season not in (season, "whole year"):
            continue
        score, reasons = _score_row(row, farm, personalized)
        if crop not in best or score > best[crop][0]:
            best[crop] = (score, reasons, row)

    ranked = sorted(best.items(), key=lambda kv: (-kv[1][0], kv[0]))[:TOP_N]
    recommendations = []
    for rank, (crop, (score, reasons, row)) in enumerate(ranked, start=1):
        sowing = (row.get("sowing_window") or "").strip()
        recommendations.append({
            "cropId": re.sub(r"[^a-z0-9]+", "-", crop.lower()).strip("-"),
            "rank": rank,
            "cropName": crop,
            "score": int(round(score)),
            "description": f"Typical sowing window: {sowing}" if sowing
                           else f"{crop} for the {season.title()} season in Maharashtra.",
            "reasons": reasons,
        })

    if recommendations:
        message = (f"Top {len(recommendations)} options for the {season.title()} season in "
                   "Maharashtra, ranked by demonstration rules over provisional (not yet verified) crop data.")
    else:
        message = f"No Maharashtra crop rows found for the {season.title()} season."
    return {
        "mode": "soil-personalized" if personalized else "general",
        "message": message,
        "recommendations": recommendations,
    }


@router.get("/health")
def health():
    return {"status": "ok", "message": "KisanIQ backend is running", "cropRows": len(ROWS)}


@router.post("/crops/recommendations")
def general_recommendations(farm: FarmDetails):
    return _recommend(farm, personalized=False)


@router.post("/crops/personalized")
def personalized_recommendations(farm: FarmDetails):
    if farm.ph is None:
        return JSONResponse(status_code=400,
                            content={"message": "Soil pH is required for personalized recommendations."})
    return _recommend(farm, personalized=True)
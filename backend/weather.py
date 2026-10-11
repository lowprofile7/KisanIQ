"""Weather routes for the dashboard, backed by Open-Meteo (free, no API key)."""
import json
import urllib.error
import urllib.parse
import urllib.request

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api")

GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
CURRENT_FIELDS = (
    "temperature_2m,relative_humidity_2m,apparent_temperature,"
    "is_day,precipitation,weather_code,wind_speed_10m"
)
DAILY_FIELDS = "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum"
NETWORK_ERRORS = (urllib.error.URLError, TimeoutError, ValueError)


def _get_json(base_url, params):
    url = f"{base_url}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


@router.get("/weather/search")
def search_locations(location: str = Query("")):
    parts = [p.strip() for p in location.split(",") if p.strip()]
    if not parts:
        return JSONResponse(status_code=400,
                            content={"code": "weather.locationRequired",
                                     "message": "Enter a village or city name."})
    try:
        data = _get_json(GEOCODE_URL, {
            "name": parts[0], "count": 10, "language": "en",
            "format": "json", "countryCode": "IN",
        })
    except NETWORK_ERRORS:
        return JSONResponse(status_code=502, content={
            "code": "weather.searchUnavailable",
            "message": "Location search is unavailable right now. Check the internet connection."})

    results = data.get("results") or []
    if len(parts) > 1:  # e.g. "Nagpur, Maharashtra": use the second part as a hint
        hint = parts[1].lower()
        narrowed = [r for r in results if hint in (r.get("admin1") or "").lower()]
        results = narrowed or results

    return {"locations": [{
        "id": r.get("id"),
        "name": r.get("name"),
        "latitude": r.get("latitude"),
        "longitude": r.get("longitude"),
        "district": r.get("admin2") or r.get("admin3"),
        "state": r.get("admin1"),
        "country": r.get("country"),
    } for r in results]}


@router.get("/weather")
def get_weather(latitude: float, longitude: float):
    try:
        return _get_json(FORECAST_URL, {
            "latitude": latitude, "longitude": longitude,
            "current": CURRENT_FIELDS, "daily": DAILY_FIELDS,
            "timezone": "auto", "forecast_days": 5,
        })
    except NETWORK_ERRORS:
        return JSONResponse(status_code=502, content={
            "code": "weather.unavailable",
            "message": "Weather is unavailable right now. Check the internet connection."})

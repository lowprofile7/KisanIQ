# KisanIQ: how to run locally

You need Python 3, Node.js (LTS), and two terminals.

## 1. Backend (FastAPI, port 5000)

```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --port 5000 --reload
```

Quick check in another terminal:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/crops/recommendations -ContentType "application/json" -Body '{"soilType":"black","season":"kharif","waterAvailability":"moderate","farmSizeAcres":2}' | ConvertTo-Json -Depth 5
```

## 2. Frontend (Vite + React, port 5173)

```powershell
cd frontend
npm install
npm run dev
```

If PowerShell blocks scripts, use `npm.cmd install` and `npm.cmd run dev`.
Open http://localhost:5173. Vite forwards `/api` calls to the backend on port 5000
(see `frontend/vite.config.js`), so the backend must be running first.

## What to know

- Crop data (`backend/data/crops.csv`, maintained by Shivansh) is provisional: rows are not yet verified.
- Scores come from simple demonstration rules in `backend/recommender.py` (soil, water, season, pH),
  using Maharashtra rows only. They are not probabilities of crop success.
- As of 11 Oct 2026 the weather routes (`/api/weather`) are not implemented in the backend.
- `mobile/` (Flutter) is not part of the current demo.

## Team workflow

- Don't commit straight to `main`. Make a branch, push it, open a pull request, merge.
- `backend/data/crops.csv` belongs to Shivansh; code only reads it.
- Don't `git add .` (stray generated folders exist under `mobile/`).

# KisanIQ Crop Dataset

## Goal
Build a verified crop dataset covering Maharashtra.

## Rules
- One row represents one crop-season-region combination.
- Use district names consistently.
- Leave unknown numeric values blank.
- Do not invent crop suitability scores or soil requirements.
- Keep the source URL for every verified record.
- Set `verified` to `yes` only after checking the source.

## Responsibilities
- Collect crop-season and district-level growing information.
- Record soil, temperature, rainfall, and water requirements only when supported by reliable sources.
- Prefer Maharashtra Agriculture Department, ICAR, and agricultural university publications.
- Distinguish crops commonly grown in a district from crops scientifically suitable there.

## CSV file
The dataset is stored in `crops.csv`.

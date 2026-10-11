
from recommender import _score_row, FarmDetails


def test_rice_is_treated_as_high_water_demand():
    rice = {
        "crop": "Rice",
        "soil_types": "Clay loam to clay; water-retentive soils common",
        "water_requirement": "450.0-700.0 mm seasonal crop-water need",
        "ph_min": "5.0",
        "ph_max": "7.0",
    }

    low_water_farm = FarmDetails(
        soilType="black",
        season="kharif",
        waterAvailability="low",
    )

    score, reasons = _score_row(
        rice,
        low_water_farm,
        personalized=False,
    )

    assert score == 40
    assert any("high-water-demand" in reason for reason in reasons)
    assert any("does not match your low availability" in reason for reason in reasons)


def test_rice_gets_partial_water_points_for_moderate_water():
    rice = {
        "crop": "Rice",
        "soil_types": "Clay loam to clay; water-retentive soils common",
        "water_requirement": "450.0-700.0 mm seasonal crop-water need",
        "ph_min": "5.0",
        "ph_max": "7.0",
    }

    moderate_water_farm = FarmDetails(
        soilType="black",
        season="kharif",
        waterAvailability="moderate",
    )

    score, reasons = _score_row(
        rice,
        moderate_water_farm,
        personalized=False,
    )

    assert score == 70
    assert any("high-water-demand" in reason for reason in reasons)
    assert any("one step from your moderate availability" in reason for reason in reasons)

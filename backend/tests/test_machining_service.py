import math
import pytest
from app.services.machining_service import calculate_turning_machining_time


def test_aluminum_6061_turning_calculation():
    # Aluminum 6061: V_c = 300 m/min, f = 0.25 mm/rev
    # Part: Diameter = 50 mm, Length = 100 mm
    result = calculate_turning_machining_time(
        cutting_speed_m_min=300.0,
        feed_rate_mm_rev=0.25,
        part_diameter_mm=50.0,
        cut_length_mm=100.0,
    )

    expected_rpm = round((300.0 * 1000.0) / (math.pi * 50.0), 2)
    expected_cycle_time = round(100.0 / (((300.0 * 1000.0) / (math.pi * 50.0)) * 0.25), 4)

    assert result["rpm"] == expected_rpm
    assert result["rpm"] == 1909.86
    assert result["cycle_time_mins"] == expected_cycle_time
    assert result["cycle_time_mins"] == 0.2094


def test_mild_steel_turning_calculation():
    # Mild Steel A36: V_c = 180 m/min, f = 0.20 mm/rev
    # Part: Diameter = 40 mm, Length = 80 mm
    result = calculate_turning_machining_time(
        cutting_speed_m_min=180.0,
        feed_rate_mm_rev=0.20,
        part_diameter_mm=40.0,
        cut_length_mm=80.0,
    )

    expected_rpm = round((180.0 * 1000.0) / (math.pi * 40.0), 2)
    expected_cycle_time = round(80.0 / (((180.0 * 1000.0) / (math.pi * 40.0)) * 0.20), 4)

    assert result["rpm"] == expected_rpm
    assert result["rpm"] == 1432.39
    assert result["cycle_time_mins"] == expected_cycle_time
    assert result["cycle_time_mins"] == 0.2793


def test_zero_or_negative_guards():
    res1 = calculate_turning_machining_time(
        cutting_speed_m_min=0,
        feed_rate_mm_rev=0.2,
        part_diameter_mm=50,
        cut_length_mm=100,
    )
    assert res1["rpm"] == 0.0
    assert res1["cycle_time_mins"] == 0.0

    res2 = calculate_turning_machining_time(
        cutting_speed_m_min=300,
        feed_rate_mm_rev=0.25,
        part_diameter_mm=0,
        cut_length_mm=100,
    )
    assert res2["rpm"] == 0.0
    assert res2["cycle_time_mins"] == 0.0

    res3 = calculate_turning_machining_time(
        cutting_speed_m_min=300,
        feed_rate_mm_rev=0,
        part_diameter_mm=50,
        cut_length_mm=100,
    )
    assert res3["rpm"] == 1909.86
    assert res3["cycle_time_mins"] == 0.0

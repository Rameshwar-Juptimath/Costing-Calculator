import math
from typing import Dict


def calculate_turning_machining_time(
    cutting_speed_m_min: float,
    feed_rate_mm_rev: float,
    part_diameter_mm: float,
    cut_length_mm: float,
) -> Dict[str, float]:
    """
    Calculate spindle RPM and machining cycle time for cylindrical / turned operations.

    Formulas:
        RPM = (cutting_speed_m_min * 1000) / (math.pi * part_diameter_mm)
        cycle_time_mins = cut_length_mm / (RPM * feed_rate_mm_rev)

    Args:
        cutting_speed_m_min: Metallurgical cutting speed V_c in meters per minute.
        feed_rate_mm_rev: Feed rate f in millimeters per spindle revolution.
        part_diameter_mm: Extracted CAD turning outer diameter in mm.
        cut_length_mm: Extracted CAD turned feature length / height in mm.

    Returns:
        Dict with keys "rpm" and "cycle_time_mins".
    """
    if part_diameter_mm <= 0 or cutting_speed_m_min <= 0:
        return {
            "rpm": 0.0,
            "cycle_time_mins": 0.0,
            "cutting_speed_m_min": cutting_speed_m_min,
            "feed_rate_mm_rev": feed_rate_mm_rev,
            "part_diameter_mm": part_diameter_mm,
            "cut_length_mm": cut_length_mm,
        }

    rpm = (cutting_speed_m_min * 1000.0) / (math.pi * part_diameter_mm)

    if rpm <= 0 or feed_rate_mm_rev <= 0 or cut_length_mm <= 0:
        cycle_time_mins = 0.0
    else:
        cycle_time_mins = cut_length_mm / (rpm * feed_rate_mm_rev)

    return {
        "rpm": round(rpm, 2),
        "cycle_time_mins": round(cycle_time_mins, 4),
        "cutting_speed_m_min": cutting_speed_m_min,
        "feed_rate_mm_rev": feed_rate_mm_rev,
        "part_diameter_mm": part_diameter_mm,
        "cut_length_mm": cut_length_mm,
    }

# -*- coding: utf-8 -*-
"""
סימולטור חישוב זמני יירוט וטווחים - מערך ההגנה הרב-שכבתי של ישראל
"""

def calculate_interception(distance_km, speed_mach):
    # Mach 1 = ~1235 km/h
    speed_km_s = (speed_mach * 1235) / 3600
    time_seconds = distance_km / speed_km_s
    return round(time_seconds, 2)

systems = {
    "Iron Dome (כיפת ברזל)": {"range_km": 70, "speed_mach": 2.2},
    "David's Sling (קלע דוד)": {"range_km": 300, "speed_mach": 7.5},
    "Arrow 3 (חץ 3)": {"range_km": 2400, "speed_mach": 9.0}
}

if __name__ == "__main__":
    print("=== סימולציית זמני תגובה ויירוט ב-Python ===")
    for name, specs in systems.items():
        t = calculate_interception(specs["range_km"], specs["speed_mach"])
        print(f"{name}: טווח מרבי {specs['range_km']} ק\"מ | זמן תגובה מחושב: {t} שניות")

import pandas as pd
import numpy as np
from datetime import datetime, time

def load_sales_data(sales_path="data/sales.csv"):
    """Loads sales data."""
    try:
        sales_df = pd.read_csv(sales_path)
        sales_df['timestamp'] = pd.to_datetime(sales_df['timestamp'])
        return sales_df
    except FileNotFoundError as e:
        print(f"Error: {e}. Make sure sales data file is generated and path is correct.")
        return None

def infer_footfall_from_sales(sales_df):
    """Infers hourly footfall patterns from sales timestamps."""
    if sales_df is None or sales_df.empty:
        return pd.Series(dtype=int)

    # Assuming each sale transaction roughly corresponds to a customer visit
    footfall_by_hour = sales_df['timestamp'].dt.hour.value_counts().sort_index()

    # Ensure all hours from 0 to 23 are present, fill missing with 0
    all_hours = pd.Series(0, index=range(24))
    footfall_by_hour = footfall_by_hour.reindex(all_hours.index, fill_value=0)

    return footfall_by_hour

def recommend_lighting_ac_schedule(footfall_by_hour,
                                   store_open_hour=8,
                                   store_close_hour=22,
                                   peak_threshold_factor=0.7,
                                   off_peak_reduction_pct=50):
    """
    Recommends lighting/AC schedules based on footfall.
    - Full power during operating hours with significant footfall.
    - Reduced power during operating hours with low footfall.
    - Minimal/Off outside operating hours.
    """
    recommendations = []

    if footfall_by_hour.empty:
        # Default recommendation if no footfall data
        for hour in range(24):
            if store_open_hour <= hour < store_close_hour:
                recommendations.append({'hour': hour, 'setting': 'Standard Operation', 'reason': 'Default operating hours'})
            else:
                recommendations.append({'hour': hour, 'setting': 'Minimal/Off', 'reason': 'Outside operating hours'})
        return pd.DataFrame(recommendations)

    # Determine peak footfall within operating hours to set a dynamic threshold
    operating_hours_footfall = footfall_by_hour.loc[store_open_hour:store_close_hour-1]
    if operating_hours_footfall.empty: # Should not happen if store_open_hour < store_close_hour
         max_footfall_in_operating_hours = 0
    else:
        max_footfall_in_operating_hours = operating_hours_footfall.max()

    peak_threshold = max_footfall_in_operating_hours * peak_threshold_factor

    for hour in range(24):
        current_footfall = footfall_by_hour.get(hour, 0)

        if store_open_hour <= hour < store_close_hour:
            if current_footfall >= peak_threshold:
                recommendations.append({
                    'hour': hour,
                    'setting': 'Full Power',
                    'reason': f'High footfall ({current_footfall} visits)'
                })
            else:
                recommendations.append({
                    'hour': hour,
                    'setting': f'Reduced Power ({off_peak_reduction_pct}% savings mode)',
                    'reason': f'Low footfall ({current_footfall} visits)'
                })
        else: # Outside operating hours
            recommendations.append({
                'hour': hour,
                'setting': 'Minimal/Off',
                'reason': 'Outside operating hours'
            })

    return pd.DataFrame(recommendations)

if __name__ == '__main__':
    # Example Usage
    sales_df = load_sales_data("../../data/sales.csv") # Adjusted path for direct script run

    if sales_df is not None:
        print("Sales data loaded successfully.")

        footfall = infer_footfall_from_sales(sales_df)
        print("\n--- Inferred Hourly Footfall ---")
        print(footfall)

        # Use STORE_OPEN_HOUR and STORE_CLOSE_HOUR from data generation script for consistency
        # These would ideally come from employee schedules or a config file in a real app
        # For this example, let's use typical hours
        # In a real app, you might infer this from employee_schedules.csv
        # For now, we'll use the hardcoded values from generate_data.py for demonstration
        # from data.generate_data import STORE_OPEN_HOUR, STORE_CLOSE_HOUR
        # This import won't work directly due to paths, so hardcoding for example:
        example_store_open = 8
        example_store_close = 22

        schedule_recommendations = recommend_lighting_ac_schedule(footfall,
                                                                  store_open_hour=example_store_open,
                                                                  store_close_hour=example_store_close,
                                                                  peak_threshold_factor=0.6,
                                                                  off_peak_reduction_pct=50)
        print("\n--- Recommended Lighting/AC Schedule ---")
        print(schedule_recommendations)

        print("\n--- Schedule Summary ---")
        current_setting = None
        start_hour_block = None
        for _, row in schedule_recommendations.iterrows():
            if current_setting != row['setting']:
                if current_setting is not None and start_hour_block is not None:
                    print(f"From {start_hour_block:02d}:00 to {row['hour']:02d}:00 - {current_setting} (Reason: {prev_reason})")
                current_setting = row['setting']
                start_hour_block = row['hour']
                prev_reason = row['reason']
        if start_hour_block is not None: # Print the last block
             print(f"From {start_hour_block:02d}:00 to 00:00 (next day) - {current_setting} (Reason: {prev_reason})")

    else:
        print("Failed to load sales data.")

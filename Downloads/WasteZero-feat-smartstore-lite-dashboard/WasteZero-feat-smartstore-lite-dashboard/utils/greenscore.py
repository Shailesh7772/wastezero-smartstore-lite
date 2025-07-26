import pandas as pd

# These are simplified estimations for a hackathon context
BASE_ENERGY_CONSUMPTION_PER_HOUR_AC_LIGHTING_KW = 10  # kW for a small/medium store
COST_PER_KWH = 0.15  # $ per kWh
AVERAGE_PRODUCT_COST_FOR_WASTE = 20 # $ average cost of a wasted item if not available

def calculate_predicted_waste_value(at_risk_products_df):
    """
    Calculates the total estimated value of products predicted to be wasted.
    Uses 'cost_price' for valuation.
    """
    if at_risk_products_df is None or at_risk_products_df.empty:
        return 0.0, 0.0

    at_risk_products_df['predicted_waste_value'] = at_risk_products_df['quantity_in_stock'] * at_risk_products_df['cost_price']
    total_predicted_waste_value = at_risk_products_df['predicted_waste_value'].sum()
    total_items_at_risk = at_risk_products_df['quantity_in_stock'].sum()

    return total_predicted_waste_value, total_items_at_risk

def estimate_energy_savings(schedule_recommendations_df,
                            base_consumption_kwh=BASE_ENERGY_CONSUMPTION_PER_HOUR_AC_LIGHTING_KW,
                            off_peak_reduction_pct=50): # Must match the one in schedule_optimization
    """
    Estimates daily energy savings based on the recommended schedule.
    Assumes 'Full Power' is base_consumption_kwh,
    'Reduced Power' applies off_peak_reduction_pct,
    and 'Minimal/Off' is near zero (e.g., 10% of base for essential systems).
    """
    if schedule_recommendations_df is None or schedule_recommendations_df.empty:
        return 0.0, 0.0

    daily_standard_consumption = base_consumption_kwh * 24 # Baseline: full power 24h

    optimized_consumption = 0
    for _, row in schedule_recommendations_df.iterrows():
        if row['setting'] == 'Full Power':
            optimized_consumption += base_consumption_kwh
        elif 'Reduced Power' in row['setting']: # Handles "Reduced Power (50% savings mode)"
            # Extract reduction from setting string if needed, or use parameter
            optimized_consumption += base_consumption_kwh * (1 - (off_peak_reduction_pct / 100.0))
        elif row['setting'] == 'Minimal/Off':
            optimized_consumption += base_consumption_kwh * 0.1 # Assume 10% for minimal systems

    daily_energy_saved_kwh = daily_standard_consumption - optimized_consumption
    daily_cost_saved = daily_energy_saved_kwh * COST_PER_KWH

    return daily_energy_saved_kwh, daily_cost_saved

def calculate_greenscore(predicted_waste_value, total_inventory_value,
                         daily_energy_saved_kwh, max_possible_daily_energy_savings_kwh,
                         waste_weight=0.6, energy_weight=0.4):
    """
    Calculates a GreenScore (0-100).
    Higher score is better (less waste, more energy savings).

    - Waste component: Score is higher if predicted waste value is a smaller percentage of total inventory value.
    - Energy component: Score is higher if energy savings are closer to the maximum possible.
    """

    # Waste Score (0-100): 100 if no waste, 0 if 20% or more of inventory value is waste (arbitrary cap)
    if total_inventory_value == 0: # Avoid division by zero
        waste_score = 50 # Neutral if no inventory
    else:
        waste_percentage = (predicted_waste_value / total_inventory_value) * 100
        waste_score = max(0, 100 - waste_percentage * 5) # Scaled: 1% waste = 95 score, 10% waste = 50 score, 20% waste = 0 score

    # Energy Score (0-100): 100 if max savings achieved, 0 if no savings.
    if max_possible_daily_energy_savings_kwh == 0: # Avoid division by zero if no savings possible
        energy_score = 50 # Neutral if no savings possible (e.g. store runs 24/7 at full capacity)
    else:
        energy_savings_percentage = (daily_energy_saved_kwh / max_possible_daily_energy_savings_kwh) * 100
        energy_score = max(0, min(100, energy_savings_percentage))

    # Weighted average
    green_score = (waste_score * waste_weight) + (energy_score * energy_weight)

    return round(green_score, 2), round(waste_score, 2), round(energy_score, 2)

if __name__ == '__main__':
    # Example Usage (requires outputs from other utils or mock data)

    # Mock at_risk_products_df (normally from waste_prediction.py)
    mock_at_risk_data = {
        'product_id': ['P0001', 'P0002'],
        'quantity_in_stock': [10, 5],
        'cost_price': [50, 20]
    }
    at_risk_df = pd.DataFrame(mock_at_risk_data)

    waste_value, items_at_risk = calculate_predicted_waste_value(at_risk_df)
    print(f"--- Waste Calculation ---")
    print(f"Total predicted waste value: ${waste_value:.2f}")
    print(f"Total items at risk: {items_at_risk}")

    # Mock schedule_recommendations_df (normally from schedule_optimization.py)
    # Assume a store that could save energy for 10 hours a day if it went to minimal
    # And 6 hours a day if it went to 50% reduction
    mock_schedule_data = []
    for h in range(24):
        if h < 6 or h >= 22: # 8 hours minimal/off
            mock_schedule_data.append({'hour':h, 'setting': 'Minimal/Off'})
        elif 6 <= h < 8 or 18 <= h < 22: # 6 hours reduced
             mock_schedule_data.append({'hour':h, 'setting': f'Reduced Power ({50}% savings mode)'})
        else: # 10 hours full power
            mock_schedule_data.append({'hour':h, 'setting': 'Full Power'})

    schedule_df = pd.DataFrame(mock_schedule_data)

    energy_saved_kwh, cost_saved = estimate_energy_savings(schedule_df, off_peak_reduction_pct=50)
    print(f"\n--- Energy Savings Calculation ---")
    print(f"Estimated daily energy saved: {energy_saved_kwh:.2f} kWh")
    print(f"Estimated daily cost saved: ${cost_saved:.2f}")

    # For GreenScore calculation:
    # Mock total_inventory_value
    total_inv_value = 10000  # Example total inventory value

    # Max possible savings: assume store could be 'Minimal/Off' for 12 hours and 'Reduced' for 4 hours
    # instead of 'Full Power' for 16 hours (open hours)
    # Max saving = (16 hours * BASE_ENERGY_CONSUMPTION_PER_HOUR_AC_LIGHTING_KW * (1 - 0.1 for minimal))
    # This is a rough way to set a ceiling. A better way is to define a "perfect schedule"
    # Standard consumption for 16 open hours = 16 * 10 = 160 kWh
    # Optimized consumption (example): 8h Minimal (8*1=8kWh), 8h Reduced (8*5=40kWh) = 48kWh. Savings = 112 kWh
    # Max possible for a 24h store = 24 * 10kWh * (1 - 0.1) = 216 kWh (if it could run minimal 24/7)
    # Let's assume max daily savings is if the store is closed 12h (minimal) and operates at 50% for 12h (open).
    # Standard 24h full: 24 * 10 = 240 kWh
    # Ideal: 12h minimal (12*1=12) + 12h reduced (12*5=60) = 72 kWh. Max Savings = 240 - 72 = 168 kWh.
    max_potential_savings_kwh = (BASE_ENERGY_CONSUMPTION_PER_HOUR_AC_LIGHTING_KW * 24) - \
                                ( (12 * BASE_ENERGY_CONSUMPTION_PER_HOUR_AC_LIGHTING_KW * 0.1) + \
                                  (12 * BASE_ENERGY_CONSUMPTION_PER_HOUR_AC_LIGHTING_KW * 0.5) )


    score, waste_s, energy_s = calculate_greenscore(waste_value, total_inv_value, energy_saved_kwh, max_potential_savings_kwh)
    print(f"\n--- GreenScore Calculation ---")
    print(f"Overall GreenScore: {score}/100")
    print(f"Waste Component Score: {waste_s}/100")
    print(f"Energy Component Score: {energy_s}/100")

    # Test with zero waste
    score_zero_waste, _, _ = calculate_greenscore(0, total_inv_value, energy_saved_kwh, max_potential_savings_kwh)
    print(f"GreenScore with zero waste: {score_zero_waste}/100")

    # Test with zero energy savings
    score_zero_savings, _, _ = calculate_greenscore(waste_value, total_inv_value, 0, max_potential_savings_kwh)
    print(f"GreenScore with zero energy savings: {score_zero_savings}/100")

    # Test with high waste (e.g. 25% of inventory)
    score_high_waste, _, _ = calculate_greenscore(total_inv_value * 0.25, total_inv_value, energy_saved_kwh, max_potential_savings_kwh)
    print(f"GreenScore with high waste (25% of inventory): {score_high_waste}/100")

    # Test with max energy savings
    score_max_savings, _, _ = calculate_greenscore(waste_value, total_inv_value, max_potential_savings_kwh, max_potential_savings_kwh)
    print(f"GreenScore with max energy savings: {score_max_savings}/100")

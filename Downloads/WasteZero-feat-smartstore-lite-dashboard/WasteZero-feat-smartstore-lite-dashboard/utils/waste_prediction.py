import pandas as pd
from datetime import datetime

def load_data(inventory_path="data/inventory.csv", sales_path="data/sales.csv"):
    """Loads inventory and sales data."""
    try:
        inventory_df = pd.read_csv(inventory_path)
        sales_df = pd.read_csv(sales_path)
    except FileNotFoundError as e:
        print(f"Error: {e}. Make sure data files are generated and paths are correct.")
        return None, None

    # Convert date columns to datetime objects
    inventory_df['purchase_date'] = pd.to_datetime(inventory_df['purchase_date'])
    inventory_df['expiry_date'] = pd.to_datetime(inventory_df['expiry_date'])
    sales_df['timestamp'] = pd.to_datetime(sales_df['timestamp'])
    return inventory_df, sales_df

def preprocess_for_waste_prediction(inventory_df, sales_df):
    """Preprocesses data for waste prediction."""
    if inventory_df is None or sales_df is None:
        return None

    current_date = datetime.now()

    # Calculate days to expiry
    inventory_df['days_to_expiry'] = (inventory_df['expiry_date'] - current_date).dt.days

    # Calculate sales velocity (average daily sales for each product in the last 30 days)
    recent_sales_cutoff = current_date - pd.Timedelta(days=30)
    recent_sales = sales_df[sales_df['timestamp'] >= recent_sales_cutoff]

    if not recent_sales.empty:
        daily_sales = recent_sales.groupby('product_id')['quantity_sold'].sum() / 30
        daily_sales = daily_sales.rename('avg_daily_sales_last_30d')
        inventory_df = inventory_df.merge(daily_sales, on='product_id', how='left').fillna(0)
    else:
        inventory_df['avg_daily_sales_last_30d'] = 0


    # Estimate days of stock left with more realistic logic
    def calculate_stock_days(row):
        if row['avg_daily_sales_last_30d'] > 0:
            return row['quantity_in_stock'] / row['avg_daily_sales_last_30d']
        else:
            # If no sales, estimate based on category and stock level
            category = row['category']
            stock_level = row['quantity_in_stock']
            
            # Realistic estimates based on category
            if category == 'Groceries':
                # Groceries typically sell within 30-90 days
                return min(90, max(30, stock_level * 2))
            elif category == 'Beauty & Health':
                # Beauty products sell within 60-180 days
                return min(180, max(60, stock_level * 3))
            elif category == 'Electronics':
                # Electronics sell within 90-365 days
                return min(365, max(90, stock_level * 5))
            elif category == 'Clothing':
                # Clothing sells within 30-180 days
                return min(180, max(30, stock_level * 2))
            else:
                # Other categories: 60-365 days
                return min(365, max(60, stock_level * 4))
    
    inventory_df['estimated_days_stock_left'] = inventory_df.apply(calculate_stock_days, axis=1)

    return inventory_df

def predict_expiring_products(processed_inventory_df, expiry_threshold_days=30, stock_threshold_factor=1.5):
    """
    Predicts products likely to expire based on days to expiry and estimated stock duration.
    Uses different logic based on expiry type:
    - Groceries: Actual expiry dates
    - Beauty & Health: Expiration dates
    - Electronics: Warranty periods (less critical)
    - Clothing: Fashion seasons (less critical)
    - Home Goods: Quality periods (less critical)
    - Books: Obsolescence (less critical)
    - Sports: Wear periods (less critical)
    
    expiry_threshold_days can be either:
    - A single number (backward compatibility)
    - A dictionary mapping expiry types to thresholds (dynamic thresholds)
    """
    if processed_inventory_df is None:
        return pd.DataFrame()

    # Check if expiry_type column exists, if not, create it based on category
    if 'expiry_type' not in processed_inventory_df.columns:
        def get_expiry_type(row):
            category = row['category']
            if category == 'Groceries':
                return 'Shelf Life'
            elif category == 'Beauty & Health':
                return 'Expiration Date'
            elif category == 'Electronics':
                return 'Warranty Period'
            elif category == 'Clothing':
                return 'Fashion Season'
            elif category == 'Home Goods':
                return 'Quality Period'
            elif category == 'Books':
                return 'Obsolescence'
            else:  # Sports & Outdoors
                return 'Wear Period'
        
        processed_inventory_df['expiry_type'] = processed_inventory_df.apply(get_expiry_type, axis=1)

    # Define expiry type categories for risk calculation
    critical_expiry_types = ['Shelf Life', 'Expiration Date']
    moderate_expiry_types = ['Warranty Period', 'Fashion Season']
    low_priority_expiry_types = ['Quality Period', 'Obsolescence', 'Wear Period']
    
    # Handle dynamic thresholds
    if isinstance(expiry_threshold_days, dict):
        # Use dynamic thresholds from dictionary
        def get_risk_threshold(row):
            return expiry_threshold_days.get(row['expiry_type'], 30)  # Default to 30 if not found
    else:
        # Backward compatibility: use single threshold with multipliers
        def get_risk_threshold(row):
            if row['expiry_type'] in critical_expiry_types:
                return expiry_threshold_days  # Use full threshold for critical items
            elif row['expiry_type'] in moderate_expiry_types:
                return expiry_threshold_days * 0.5  # Half threshold for moderate items
            else:
                return expiry_threshold_days * 0.25  # Quarter threshold for low priority items

    # Calculate risk threshold for each product
    processed_inventory_df['risk_threshold'] = processed_inventory_df.apply(get_risk_threshold, axis=1)
    
    # Filter products within their respective risk thresholds
    expiring_soon_df = processed_inventory_df[
        processed_inventory_df['days_to_expiry'] <= processed_inventory_df['risk_threshold']
    ].copy()

    # Apply different risk logic based on expiry type
    def calculate_risk_score(row):
        base_risk = 0
        
        # Factor 1: Days to expiry (closer = higher risk)
        if row['days_to_expiry'] <= 0:
            base_risk += 100  # Already expired
        elif row['days_to_expiry'] <= 7:
            base_risk += 80   # Expiring very soon
        elif row['days_to_expiry'] <= 30:
            base_risk += 60   # Expiring soon
        elif row['days_to_expiry'] <= 90:
            base_risk += 40   # Expiring in medium term
        else:
            base_risk += 20   # Expiring in long term

        # Factor 2: Stock vs sales velocity
        if row['avg_daily_sales_last_30d'] == 0:
            base_risk += 30   # No recent sales
        elif row['estimated_days_stock_left'] > row['days_to_expiry'] * stock_threshold_factor:
            base_risk += 25   # Stock will outlast expiry

        # Factor 3: Expiry type priority
        if row['expiry_type'] in critical_expiry_types:
            base_risk *= 1.0   # Full weight for critical items
        elif row['expiry_type'] in moderate_expiry_types:
            base_risk *= 0.7   # Reduced weight for moderate items
        else:
            base_risk *= 0.4   # Minimal weight for low priority items

        return min(base_risk, 100)  # Cap at 100

    expiring_soon_df['risk_score'] = expiring_soon_df.apply(calculate_risk_score, axis=1)

    # Filter for high-risk products (risk score > 30 for critical items, > 50 for others)
    def is_high_risk(row):
        if row['expiry_type'] in critical_expiry_types:
            return row['risk_score'] > 30
        elif row['expiry_type'] in moderate_expiry_types:
            return row['risk_score'] > 50
        else:
            return row['risk_score'] > 70

    expiring_soon_df['at_risk_of_expiry'] = expiring_soon_df.apply(is_high_risk, axis=1)

    # Filter for products that are at risk and not yet expired
    at_risk_products = expiring_soon_df[
        (expiring_soon_df['at_risk_of_expiry']) & (expiring_soon_df['days_to_expiry'] >= 0)
    ].sort_values(by=['risk_score', 'days_to_expiry'], ascending=[False, True])

    return at_risk_products

if __name__ == '__main__':
    # Example Usage
    inventory_df, sales_df = load_data("../../data/inventory.csv", "../../data/sales.csv") # Adjusted path for direct script run

    if inventory_df is not None and sales_df is not None:
        print("Data loaded successfully.")

        processed_inventory = preprocess_for_waste_prediction(inventory_df.copy(), sales_df.copy())
        if processed_inventory is not None:
            print("\n--- Processed Inventory Data (sample) ---")
            print(processed_inventory[['product_id', 'product_name', 'expiry_date', 'days_to_expiry', 'quantity_in_stock', 'avg_daily_sales_last_30d', 'estimated_days_stock_left']].head())

            expiring_products = predict_expiring_products(processed_inventory, expiry_threshold_days=15, stock_threshold_factor=1.2)
            print("\n--- Products Predicted to Expire Soon (at risk) ---")
            if not expiring_products.empty:
                print(expiring_products[['product_id', 'product_name', 'category', 'expiry_date', 'days_to_expiry', 'quantity_in_stock', 'avg_daily_sales_last_30d']])
            else:
                print("No products predicted to be at high risk of expiry with current thresholds.")
        else:
            print("Failed to process inventory for waste prediction.")
    else:
        print("Failed to load data.")

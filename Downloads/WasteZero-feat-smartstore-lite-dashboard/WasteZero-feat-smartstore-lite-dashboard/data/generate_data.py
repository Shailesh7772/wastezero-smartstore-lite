import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Enhanced Configuration
NUM_PRODUCTS = 150  # Increased from 50
NUM_SALES_RECORDS = 2000  # Increased from 1000
NUM_EMPLOYEES = 15  # Increased from 10
NUM_SUPPLIERS = 20
# Use current dates for realistic demo
current_date = datetime.now()
START_DATE = current_date - timedelta(days=60)  # 60 days ago
END_DATE = current_date  # Today
STORE_OPEN_HOUR = 8
STORE_CLOSE_HOUR = 22

def generate_product_id(index):
    return f"P{str(index).zfill(4)}"

def generate_employee_id(index):
    return f"E{str(index).zfill(3)}"

def generate_supplier_id(index):
    return f"S{str(index).zfill(3)}"

def generate_realistic_product_names():
    """Generate realistic product names with proper categorization"""
    products = {
        'Electronics': [
            'Wireless Bluetooth Headphones', 'Smartphone Charger Cable', 'USB-C Power Adapter',
            'Wireless Mouse', 'Bluetooth Speaker', 'Phone Stand', 'Laptop Cooling Pad',
            'HDMI Cable', 'Memory Card 64GB', 'Portable Power Bank', 'Webcam HD',
            'Wireless Keyboard', 'Gaming Mouse Pad', 'Phone Screen Protector',
            'USB Flash Drive 32GB', 'Wireless Earbuds', 'Tablet Stand', 'Cable Organizer',
            'Wireless Charger', 'Bluetooth Car Speaker'
        ],
        'Clothing': [
            'Cotton T-Shirt', 'Denim Jeans', 'Hooded Sweatshirt', 'Polo Shirt',
            'Casual Dress', 'Formal Shirt', 'Winter Jacket', 'Summer Shorts',
            'Athletic Leggings', 'Business Blazer', 'Casual Blouse', 'Knit Sweater',
            'Denim Jacket', 'Pajama Set', 'Swimwear', 'Formal Pants',
            'Casual Skirt', 'Winter Scarf', 'Baseball Cap', 'Running Shoes'
        ],
        'Groceries': [
            'Organic Bananas', 'Fresh Milk 2L', 'Whole Grain Bread', 'Free-Range Eggs',
            'Greek Yogurt', 'Organic Spinach', 'Cherry Tomatoes', 'Avocados',
            'Chicken Breast', 'Salmon Fillet', 'Brown Rice', 'Quinoa',
            'Almond Milk', 'Cheddar Cheese', 'Bell Peppers', 'Sweet Potatoes',
            'Broccoli Crowns', 'Strawberries', 'Blueberries', 'Cucumber'
        ],
        'Home Goods': [
            'Kitchen Towel Set', 'Bath Towel', 'Bed Sheet Set', 'Pillow Cases',
            'Coffee Mug Set', 'Dinner Plate Set', 'Glass Water Bottle', 'Storage Containers',
            'Kitchen Utensils', 'Bathroom Rug', 'Shower Curtain', 'Laundry Basket',
            'Trash Can', 'Desk Lamp', 'Wall Clock', 'Picture Frame',
            'Throw Pillow', 'Blanket', 'Curtains', 'Area Rug'
        ],
        'Books': [
            'The Great Gatsby', 'To Kill a Mockingbird', '1984', 'Pride and Prejudice',
            'The Catcher in the Rye', 'Lord of the Flies', 'Animal Farm', 'Brave New World',
            'The Hobbit', 'The Alchemist', 'Rich Dad Poor Dad', 'Atomic Habits',
            'The Power of Habit', 'Think and Grow Rich', 'How to Win Friends',
            'The 7 Habits', 'Mindset', 'Deep Work', 'Essentialism', 'The Subtle Art'
        ],
        'Beauty & Health': [
            'Facial Cleanser', 'Moisturizing Cream', 'Sunscreen SPF 50', 'Shampoo',
            'Conditioner', 'Toothpaste', 'Deodorant', 'Hand Lotion',
            'Lip Balm', 'Face Mask', 'Hair Brush', 'Nail Polish',
            'Perfume', 'Makeup Remover', 'Vitamin C Serum', 'Eye Cream',
            'Body Wash', 'Razor Blades', 'Cotton Pads', 'Hair Dryer'
        ],
        'Sports & Outdoors': [
            'Yoga Mat', 'Dumbbells Set', 'Resistance Bands', 'Jump Rope',
            'Water Bottle', 'Gym Bag', 'Running Shorts', 'Athletic Socks',
            'Tennis Racket', 'Basketball', 'Soccer Ball', 'Bicycle Helmet',
            'Camping Tent', 'Sleeping Bag', 'Backpack', 'Hiking Boots',
            'Fishing Rod', 'Golf Clubs', 'Swimming Goggles', 'Tennis Shoes'
        ]
    }
    return products

def generate_supplier_data(num_suppliers):
    """Generate supplier information"""
    supplier_names = [
        'Global Electronics Corp', 'Fashion Forward Ltd', 'Fresh Foods Inc', 'Home Essentials Co',
        'BookWorld Publishers', 'Beauty & Beyond', 'Sports Gear Pro', 'Tech Solutions Ltd',
        'Style & Co', 'Organic Harvest', 'Living Spaces', 'Knowledge Hub',
        'Glow & Grace', 'Active Lifestyle', 'Digital Dynamics', 'Trendy Threads',
        'Farm Fresh', 'Comfort Zone', 'Literary Corner', 'Wellness World'
    ]
    
    data = []
    for i in range(num_suppliers):
        supplier_id = generate_supplier_id(i)
        name = supplier_names[i] if i < len(supplier_names) else f"Supplier {i+1}"
        reliability_score = np.random.uniform(0.7, 1.0)  # Supplier reliability
        delivery_time_days = np.random.randint(1, 14)  # Days to deliver
        
        data.append({
            "supplier_id": supplier_id,
            "supplier_name": name,
            "reliability_score": round(reliability_score, 2),
            "delivery_time_days": delivery_time_days,
            "contact_email": f"contact@{name.lower().replace(' ', '').replace('&', 'and')}.com",
            "phone": f"+1-555-{str(np.random.randint(100, 999))}-{str(np.random.randint(1000, 9999))}"
        })
    return pd.DataFrame(data)

def generate_inventory_data(num_products, suppliers_df):
    data = []
    product_categories = generate_realistic_product_names()
    all_categories = list(product_categories.keys())
    
    for i in range(num_products):
        product_id = generate_product_id(i)
        category = np.random.choice(all_categories)
        
        # Get realistic product name from the category
        category_products = product_categories[category]
        product_name = np.random.choice(category_products)
        
        # Assign supplier
        supplier = suppliers_df.iloc[np.random.randint(0, len(suppliers_df))]
        supplier_id = supplier['supplier_id']
        
        # Create some products that are expiring very soon for demo
        if np.random.random() < 0.3:  # 30% chance of very recent purchase
            purchase_days_ago = np.random.randint(1, 30)  # Very recent
        else:
            purchase_days_ago = np.random.randint(30, 90)  # Recent
        purchase_date = END_DATE - timedelta(days=purchase_days_ago)

        # Realistic expiry logic based on category
        if category == 'Groceries':
            # Groceries expire quickly (1-30 days) - more very soon for demo
            expiry_days = int(np.random.choice([
                np.random.randint(1, 5),     # 50% chance: very soon (1-5 days)
                np.random.randint(5, 10),    # 30% chance: soon (5-10 days)
                np.random.randint(10, 20)    # 20% chance: moderate (10-20 days)
            ], p=[0.5, 0.3, 0.2]))
            expiry_date = purchase_date + timedelta(days=expiry_days)
        elif category == 'Beauty & Health':
            # Beauty products expire within 10-90 days - more soon for demo
            expiry_days = int(np.random.choice([
                np.random.randint(10, 30),   # 40% chance: very soon (10-30 days)
                np.random.randint(30, 60),   # 35% chance: soon (30-60 days)
                np.random.randint(60, 90)    # 25% chance: moderate (60-90 days)
            ], p=[0.4, 0.35, 0.25]))
            expiry_date = purchase_date + timedelta(days=expiry_days)
        elif category == 'Electronics':
            # Electronics have warranty periods (30-730 days) - some soon for demo
            warranty_days = int(np.random.choice([
                np.random.randint(30, 180),  # 20% chance: short warranty (30-180 days)
                np.random.randint(180, 365), # 40% chance: standard warranty (180-365 days)
                np.random.randint(365, 730)  # 40% chance: extended warranty (365-730 days)
            ], p=[0.2, 0.4, 0.4]))
            expiry_date = purchase_date + timedelta(days=warranty_days)
        elif category == 'Clothing':
            # Clothing has fashion seasons (5-60 days) - more very soon for demo
            fashion_days = int(np.random.choice([
                np.random.randint(5, 15),    # 45% chance: very soon (5-15 days)
                np.random.randint(15, 30),   # 35% chance: soon (15-30 days)
                np.random.randint(30, 60)    # 20% chance: moderate (30-60 days)
            ], p=[0.45, 0.35, 0.2]))
            expiry_date = purchase_date + timedelta(days=fashion_days)
        elif category == 'Home Goods':
            # Home goods have quality periods (90-730 days)
            quality_days = int(np.random.choice([
                np.random.randint(90, 180),  # 25% chance: short quality period (90-180 days)
                np.random.randint(180, 365), # 40% chance: standard (180-365 days)
                np.random.randint(365, 730)  # 35% chance: longer (365-730 days)
            ], p=[0.25, 0.4, 0.35]))
            expiry_date = purchase_date + timedelta(days=quality_days)
        elif category == 'Books':
            # Books become obsolete (180-1095 days)
            obsolescence_days = int(np.random.choice([
                np.random.randint(180, 365), # 20% chance: quick obsolescence (180-365 days)
                np.random.randint(365, 730), # 40% chance: moderate (365-730 days)
                np.random.randint(730, 1095) # 40% chance: longer (730-1095 days)
            ], p=[0.2, 0.4, 0.4]))
            expiry_date = purchase_date + timedelta(days=obsolescence_days)
        else:  # Sports & Outdoors
            # Sports equipment wear period (90-730 days)
            wear_period_days = int(np.random.choice([
                np.random.randint(90, 180),  # 25% chance: quick wear (90-180 days)
                np.random.randint(180, 365), # 40% chance: standard (180-365 days)
                np.random.randint(365, 730)  # 35% chance: longer (365-730 days)
            ], p=[0.25, 0.4, 0.35]))
            expiry_date = purchase_date + timedelta(days=wear_period_days)

        # Realistic pricing based on category
        if category == 'Electronics':
            cost_price = round(np.random.uniform(15.0, 200.0), 2)
        elif category == 'Clothing':
            cost_price = round(np.random.uniform(8.0, 80.0), 2)
        elif category == 'Groceries':
            cost_price = round(np.random.uniform(2.0, 25.0), 2)
        elif category == 'Home Goods':
            cost_price = round(np.random.uniform(5.0, 100.0), 2)
        elif category == 'Books':
            cost_price = round(np.random.uniform(5.0, 30.0), 2)
        elif category == 'Beauty & Health':
            cost_price = round(np.random.uniform(3.0, 50.0), 2)
        else:  # Sports & Outdoors
            cost_price = round(np.random.uniform(10.0, 150.0), 2)

        # Realistic markup based on category
        markup_ranges = {
            'Electronics': (1.3, 1.8),
            'Clothing': (1.4, 2.2),
            'Groceries': (1.2, 1.6),
            'Home Goods': (1.3, 1.9),
            'Books': (1.2, 1.5),
            'Beauty & Health': (1.4, 2.0),
            'Sports & Outdoors': (1.3, 1.8)
        }
        
        markup_min, markup_max = markup_ranges.get(category, (1.2, 2.0))
        selling_price = round(cost_price * np.random.uniform(markup_min, markup_max), 2)

        # Realistic stock levels based on category
        if category == 'Groceries':
            quantity_in_stock = np.random.randint(20, 300)
        elif category == 'Electronics':
            quantity_in_stock = np.random.randint(5, 100)
        else:
            quantity_in_stock = np.random.randint(10, 200)

        # Add seasonal demand factor
        current_month = datetime.now().month
        seasonal_boost = 1.0
        if category == 'Clothing' and current_month in [3, 4, 9, 10]:  # Spring/Fall
            seasonal_boost = 1.3
        elif category == 'Sports & Outdoors' and current_month in [5, 6, 7, 8]:  # Summer
            seasonal_boost = 1.4
        elif category == 'Home Goods' and current_month in [11, 12]:  # Holiday season
            seasonal_boost = 1.2

        # Determine expiry type based on category
        if category == 'Groceries':
            expiry_type = 'Shelf Life'
        elif category == 'Beauty & Health':
            expiry_type = 'Expiration Date'
        elif category == 'Electronics':
            expiry_type = 'Warranty Period'
        elif category == 'Clothing':
            expiry_type = 'Fashion Season'
        elif category == 'Home Goods':
            expiry_type = 'Quality Period'
        elif category == 'Books':
            expiry_type = 'Obsolescence'
        else:  # Sports & Outdoors
            expiry_type = 'Wear Period'

        data.append({
            "product_id": product_id,
            "product_name": product_name,
            "category": category,
            "supplier_id": supplier_id,
            "purchase_date": purchase_date.strftime('%Y-%m-%d'),
            "expiry_date": expiry_date.strftime('%Y-%m-%d'),
            "expiry_type": expiry_type,
            "quantity_in_stock": quantity_in_stock,
            "cost_price": cost_price,
            "selling_price": selling_price,
            "seasonal_demand_factor": round(seasonal_boost, 2)
        })
    return pd.DataFrame(data)

def generate_sales_data(num_records, product_ids, start_date, end_date):
    data = []
    date_range_days = (end_date - start_date).days
    
    # Create product sales profiles for more realistic patterns
    product_sales_profiles = {}
    for product_id in product_ids:
        # Assign different sales scenarios for hackathon demo
        scenario = np.random.choice(['high_demand', 'low_demand', 'seasonal', 'trending', 'stagnant'], 
                                  p=[0.2, 0.3, 0.2, 0.15, 0.15])
        
        if scenario == 'high_demand':
            base_daily_sales = np.random.uniform(3.0, 8.0)
            volatility = 0.2
        elif scenario == 'low_demand':
            base_daily_sales = np.random.uniform(0.1, 1.0)
            volatility = 0.5
        elif scenario == 'seasonal':
            base_daily_sales = np.random.uniform(1.0, 4.0)
            volatility = 0.4
        elif scenario == 'trending':
            base_daily_sales = np.random.uniform(2.0, 6.0)
            volatility = 0.3
        else:  # stagnant
            base_daily_sales = np.random.uniform(0.05, 0.5)
            volatility = 0.6
        
        product_sales_profiles[product_id] = {
            'scenario': scenario,
            'base_daily_sales': base_daily_sales,
            'volatility': volatility
        }

    # Generate sales for each day
    for day_offset in range(date_range_days + 1):
        current_date = start_date + timedelta(days=day_offset)
        
        for product_id in product_ids:
            profile = product_sales_profiles[product_id]
            
            # Calculate daily sales with trend and seasonal factors
            trend_factor = 1.0
            if profile['scenario'] == 'trending':
                # Trending products increase over time
                trend_factor = 1.0 + (day_offset / date_range_days) * 0.8
            
            seasonal_factor = 1.0
            if profile['scenario'] == 'seasonal':
                # Weekly pattern for seasonal products
                seasonal_factor = 1.0 + 0.4 * np.sin(day_offset * 2 * np.pi / 7)
            
            # Calculate expected daily sales
            expected_sales = profile['base_daily_sales'] * trend_factor * seasonal_factor
            
            # Add randomness
            daily_sales = max(0, np.random.normal(expected_sales, expected_sales * profile['volatility']))
            
            # Round to appropriate precision
            if daily_sales > 0:
                daily_sales = round(daily_sales, 1) if daily_sales < 1 else int(daily_sales)
                
                # Generate multiple sales throughout the day
                num_sales_events = max(1, int(daily_sales / 2) + np.random.randint(0, 3))
                sales_per_event = max(1, int(daily_sales / num_sales_events))
                
                for _ in range(num_sales_events):
                    # Simulate peak hours (e.g., lunch time, after work)
                    hour_probabilities = np.ones(STORE_CLOSE_HOUR - STORE_OPEN_HOUR)
                    # Higher probability for 12-2 PM and 5-7 PM
                    peak_hours_lunch = [h - STORE_OPEN_HOUR for h in range(12, 14)]
                    peak_hours_evening = [h - STORE_OPEN_HOUR for h in range(17, 19)]

                    for h_idx in peak_hours_lunch:
                        if 0 <= h_idx < len(hour_probabilities): 
                            hour_probabilities[h_idx] *= 2
                    for h_idx in peak_hours_evening:
                        if 0 <= h_idx < len(hour_probabilities): 
                            hour_probabilities[h_idx] *= 2

                    hour_probabilities /= np.sum(hour_probabilities)  # Normalize

                    sale_hour = np.random.choice(range(STORE_OPEN_HOUR, STORE_CLOSE_HOUR), p=hour_probabilities)
                    sale_minute = np.random.randint(0, 60)
                    sale_second = np.random.randint(0, 60)

                    timestamp = datetime(current_date.year, current_date.month, current_date.day,
                                       sale_hour, sale_minute, sale_second)

                    data.append({
                        "product_id": product_id,
                        "timestamp": timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                        "quantity_sold": sales_per_event
                    })
    
    df = pd.DataFrame(data)
    df = df.sort_values(by="timestamp").reset_index(drop=True)
    return df

def generate_employee_schedules(num_employees, start_date, end_date):
    data = []
    num_days = (end_date - start_date).days

    for i in range(num_employees):
        employee_id = generate_employee_id(i)
        # Assign each employee to work ~5 days a week
        for day_offset in range(num_days + 1):
            if np.random.rand() < 5/7: # Approx 5 out of 7 days
                current_date = start_date + timedelta(days=day_offset)

                # Simple shift logic: 8 AM - 4 PM or 2 PM - 10 PM
                if np.random.rand() < 0.5:
                    shift_start_time = f"{STORE_OPEN_HOUR:02d}:00:00"
                    shift_end_time = f"{(STORE_OPEN_HOUR + 8):02d}:00:00" # 8 hour shift
                    if (STORE_OPEN_HOUR + 8) > STORE_CLOSE_HOUR: # Adjust if shift ends after closing
                        shift_end_time = f"{STORE_CLOSE_HOUR:02d}:00:00"
                else:
                    shift_start_time = f"{(STORE_CLOSE_HOUR - 8):02d}:00:00" # Start 8 hours before close
                    if (STORE_CLOSE_HOUR - 8) < STORE_OPEN_HOUR: # Adjust if shift starts before opening
                         shift_start_time = f"{STORE_OPEN_HOUR:02d}:00:00"
                    shift_end_time = f"{STORE_CLOSE_HOUR:02d}:00:00"

                # Ensure start time is not after end time if adjustments were made
                st_h = int(shift_start_time.split(":")[0])
                et_h = int(shift_end_time.split(":")[0])
                if st_h >= et_h and not (st_h == STORE_OPEN_HOUR and et_h == STORE_CLOSE_HOUR) : # Allow full day shift
                    # if invalid, assign a default full day shift
                    shift_start_time = f"{STORE_OPEN_HOUR:02d}:00:00"
                    shift_end_time = f"{STORE_CLOSE_HOUR:02d}:00:00"


                data.append({
                    "employee_id": employee_id,
                    "date": current_date.strftime('%Y-%m-%d'),
                    "shift_start_time": shift_start_time,
                    "shift_end_time": shift_end_time
                })
    return pd.DataFrame(data)

if __name__ == "__main__":
    print("Generating supplier data...")
    suppliers_df = generate_supplier_data(NUM_SUPPLIERS)
    suppliers_df.to_csv("suppliers.csv", index=False)
    print("Supplier data generated and saved to suppliers.csv")

    print("\nGenerating inventory data...")
    inventory_df = generate_inventory_data(NUM_PRODUCTS, suppliers_df)
    inventory_df.to_csv("inventory.csv", index=False)
    print("Inventory data generated and saved to inventory.csv")

    print("\nGenerating sales data...")
    product_ids = inventory_df["product_id"].unique()
    sales_df = generate_sales_data(NUM_SALES_RECORDS, product_ids, START_DATE, END_DATE)
    sales_df.to_csv("sales.csv", index=False)
    print("Sales data generated and saved to sales.csv")

    print("\nGenerating employee schedules...")
    employee_schedules_df = generate_employee_schedules(NUM_EMPLOYEES, START_DATE, END_DATE)
    employee_schedules_df.to_csv("employee_schedules.csv", index=False)
    print("Employee schedules generated and saved to employee_schedules.csv")

    print("\nSample data generation complete.")
    print(f"\n--- Supplier Data (first 5 rows) ---")
    print(suppliers_df.head())
    print(f"\n--- Inventory Data (first 5 rows) ---")
    print(inventory_df.head())
    print(f"\n--- Sales Data (first 5 rows) ---")
    print(sales_df.head())
    print(f"\n--- Employee Schedules Data (first 5 rows) ---")
    print(employee_schedules_df.head())

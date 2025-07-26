import pandas as pd
from datetime import datetime

# Load inventory data
df = pd.read_csv('inventory.csv')

# Convert dates
df['purchase_date'] = pd.to_datetime(df['purchase_date'])
df['expiry_date'] = pd.to_datetime(df['expiry_date'])

# Calculate days to expiry
today = datetime.now()
df['days_to_expiry'] = (df['expiry_date'] - today).dt.days

print("=== INVENTORY DATA CHECK ===")
print(f"Total products: {len(df)}")
print(f"Current date: {today.strftime('%Y-%m-%d')}")
print(f"Latest purchase date: {df['purchase_date'].max().strftime('%Y-%m-%d')}")
print(f"Earliest expiry date: {df['expiry_date'].min().strftime('%Y-%m-%d')}")

print("\n=== PRODUCTS EXPIRING SOON ===")
soon_expiring = df[df['days_to_expiry'] <= 30].sort_values('days_to_expiry')
print(f"Products expiring within 30 days: {len(soon_expiring)}")

if not soon_expiring.empty:
    print("\nTop 10 products expiring soon:")
    for _, row in soon_expiring.head(10).iterrows():
        print(f"- {row['product_name']} ({row['category']}): {row['days_to_expiry']} days")

print("\n=== CATEGORY BREAKDOWN ===")
print(df['category'].value_counts())

print("\n=== EXPIRY TYPES ===")
print(df['expiry_type'].value_counts()) 
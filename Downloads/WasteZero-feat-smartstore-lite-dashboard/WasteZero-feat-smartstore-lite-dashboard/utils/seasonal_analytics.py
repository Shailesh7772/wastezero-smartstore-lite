import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import calendar

def analyze_seasonal_trends(sales_df, inventory_df):
    """Analyze seasonal trends in sales and inventory"""
    if sales_df is None or inventory_df is None:
        return None
    
    # Convert timestamp to datetime
    sales_df['timestamp'] = pd.to_datetime(sales_df['timestamp'])
    sales_df['month'] = sales_df['timestamp'].dt.month
    sales_df['season'] = sales_df['timestamp'].dt.month.map(get_season)
    
    # Merge with inventory to get category information
    merged_sales = sales_df.merge(inventory_df[['product_id', 'category', 'seasonal_demand_factor']], 
                                 on='product_id', how='left')
    
    # Monthly sales analysis
    monthly_sales = merged_sales.groupby('month').agg({
        'quantity_sold': 'sum',
        'product_id': 'count'
    }).rename(columns={'product_id': 'transaction_count'})
    
    # Seasonal sales analysis
    seasonal_sales = merged_sales.groupby('season').agg({
        'quantity_sold': 'sum',
        'product_id': 'count'
    }).rename(columns={'product_id': 'transaction_count'})
    
    # Category performance by season
    category_seasonal = merged_sales.groupby(['category', 'season']).agg({
        'quantity_sold': 'sum'
    }).reset_index()
    
    return {
        'monthly_sales': monthly_sales,
        'seasonal_sales': seasonal_sales,
        'category_seasonal': category_seasonal
    }

def get_season(month):
    """Map month to season"""
    if month in [12, 1, 2]:
        return 'Winter'
    elif month in [3, 4, 5]:
        return 'Spring'
    elif month in [6, 7, 8]:
        return 'Summer'
    else:
        return 'Fall'

def forecast_seasonal_demand(inventory_df, sales_df, forecast_months=3):
    """Forecast demand for the next few months based on seasonal patterns"""
    if sales_df is None or inventory_df is None:
        return None
    
    # Get historical sales data
    sales_df['timestamp'] = pd.to_datetime(sales_df['timestamp'])
    sales_df['month'] = sales_df['timestamp'].dt.month
    
    # Merge with inventory
    merged_sales = sales_df.merge(inventory_df[['product_id', 'category', 'seasonal_demand_factor']], 
                                 on='product_id', how='left')
    
    # Calculate average daily sales by category and month
    daily_sales = merged_sales.groupby(['category', 'month']).agg({
        'quantity_sold': 'sum'
    }).reset_index()
    
    # Calculate days in each month for the sales period
    sales_start = sales_df['timestamp'].min()
    sales_end = sales_df['timestamp'].max()
    total_days = (sales_end - sales_start).days
    
    # Estimate daily sales rate
    daily_sales['daily_rate'] = daily_sales['quantity_sold'] / (total_days / 12)  # Approximate days per month
    
    # Generate forecast for next months
    current_month = datetime.now().month
    forecast_data = []
    
    for i in range(1, forecast_months + 1):
        forecast_month = ((current_month + i - 1) % 12) + 1
        forecast_season = get_season(forecast_month)
        
        for category in inventory_df['category'].unique():
            # Get historical data for this category and month
            historical_data = daily_sales[
                (daily_sales['category'] == category) & 
                (daily_sales['month'] == forecast_month)
            ]
            
            if not historical_data.empty:
                base_daily_rate = historical_data['daily_rate'].iloc[0]
            else:
                # Use category average if no historical data for this month
                base_daily_rate = daily_sales[daily_sales['category'] == category]['daily_rate'].mean()
            
            # Apply seasonal factor
            seasonal_factor = inventory_df[
                inventory_df['category'] == category
            ]['seasonal_demand_factor'].iloc[0]
            
            forecasted_daily_rate = base_daily_rate * seasonal_factor
            days_in_month = calendar.monthrange(datetime.now().year, forecast_month)[1]
            forecasted_monthly_sales = forecasted_daily_rate * days_in_month
            
            forecast_data.append({
                'category': category,
                'month': forecast_month,
                'season': forecast_season,
                'forecasted_sales': forecasted_monthly_sales,
                'daily_rate': forecasted_daily_rate
            })
    
    return pd.DataFrame(forecast_data)

def get_seasonal_recommendations(inventory_df, sales_df):
    """Generate seasonal recommendations for inventory management"""
    recommendations = []
    
    if inventory_df is None or sales_df is None:
        return recommendations
    
    # Analyze current seasonal trends
    seasonal_trends = analyze_seasonal_trends(sales_df, inventory_df)
    if seasonal_trends is None:
        return recommendations
    
    current_month = datetime.now().month
    current_season = get_season(current_month)
    
    # Get category performance for current season
    current_season_performance = seasonal_trends['category_seasonal'][
        seasonal_trends['category_seasonal']['season'] == current_season
    ]
    
    # Find underperforming categories
    if not current_season_performance.empty:
        avg_sales = current_season_performance['quantity_sold'].mean()
        underperforming = current_season_performance[
            current_season_performance['quantity_sold'] < avg_sales * 0.5
        ]
        
        for _, category_data in underperforming.iterrows():
            recommendations.append({
                'category': category_data['category'],
                'issue': 'Low Seasonal Sales',
                'recommendation': f"Consider promotional pricing for {category_data['category']} "
                                f"during {current_season} to boost sales.",
                'priority': 'Medium'
            })
    
    # Check for seasonal inventory mismatches
    for category in inventory_df['category'].unique():
        category_inventory = inventory_df[inventory_df['category'] == category]
        avg_seasonal_factor = category_inventory['seasonal_demand_factor'].mean()
        
        if avg_seasonal_factor > 1.2:  # High seasonal demand
            # Check if inventory levels are sufficient
            total_stock = category_inventory['quantity_in_stock'].sum()
            if total_stock < 100:  # Low stock threshold
                recommendations.append({
                    'category': category,
                    'issue': 'Seasonal Stock Shortage',
                    'recommendation': f"Increase stock levels for {category} during {current_season} "
                                    f"to meet seasonal demand (current stock: {total_stock}).",
                    'priority': 'High'
                })
    
    return recommendations

def calculate_seasonal_efficiency_score(inventory_df, sales_df):
    """Calculate how well the store manages seasonal inventory"""
    if inventory_df is None or sales_df is None:
        return 0
    
    # Analyze seasonal alignment
    seasonal_trends = analyze_seasonal_trends(sales_df, inventory_df)
    if seasonal_trends is None:
        return 0
    
    score = 100  # Start with perfect score
    
    # Factor 1: Seasonal demand alignment (40 points)
    current_month = datetime.now().month
    current_season = get_season(current_month)
    
    # Check if high seasonal factor categories have good sales
    high_seasonal_categories = inventory_df[
        inventory_df['seasonal_demand_factor'] > 1.2
    ]['category'].unique()
    
    if len(high_seasonal_categories) > 0:
        seasonal_sales = seasonal_trends['category_seasonal'][
            (seasonal_trends['category_seasonal']['season'] == current_season) &
            (seasonal_trends['category_seasonal']['category'].isin(high_seasonal_categories))
        ]
        
        if not seasonal_sales.empty:
            avg_seasonal_sales = seasonal_sales['quantity_sold'].mean()
            if avg_seasonal_sales < 50:  # Low threshold
                score -= 20
    
    # Factor 2: Inventory turnover by season (30 points)
    # This is a simplified calculation
    total_inventory = inventory_df['quantity_in_stock'].sum()
    total_sales = sales_df['quantity_sold'].sum()
    
    if total_inventory > 0:
        turnover_ratio = total_sales / total_inventory
        if turnover_ratio < 0.1:  # Low turnover
            score -= 15
    
    # Factor 3: Seasonal factor utilization (30 points)
    avg_seasonal_factor = inventory_df['seasonal_demand_factor'].mean()
    if avg_seasonal_factor < 1.0:  # Not leveraging seasonal factors
        score -= 15
    
    return max(score, 0)  # Ensure non-negative score 
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def load_supplier_data(suppliers_path="data/suppliers.csv"):
    """Load supplier data from CSV file"""
    try:
        suppliers_df = pd.read_csv(suppliers_path)
        return suppliers_df
    except FileNotFoundError:
        print(f"Supplier data file not found: {suppliers_path}")
        return None
    except Exception as e:
        print(f"Error loading supplier data: {e}")
        return None

def analyze_supplier_performance(inventory_df, suppliers_df):
    """Analyze supplier performance based on inventory data"""
    if inventory_df is None or suppliers_df is None:
        return None
    
    # Merge inventory with supplier data
    merged_df = inventory_df.merge(suppliers_df, on='supplier_id', how='left')
    
    # Calculate supplier metrics
    supplier_metrics = []
    
    for supplier_id in merged_df['supplier_id'].unique():
        supplier_data = merged_df[merged_df['supplier_id'] == supplier_id]
        supplier_info = suppliers_df[suppliers_df['supplier_id'] == supplier_id].iloc[0]
        
        # Calculate metrics
        total_products = len(supplier_data)
        total_inventory_value = (supplier_data['cost_price'] * supplier_data['quantity_in_stock']).sum()
        avg_product_price = supplier_data['cost_price'].mean()
        
        # Calculate expiry risk
        current_date = datetime.now()
        supplier_data_copy = supplier_data.copy()
        supplier_data_copy['expiry_date'] = pd.to_datetime(supplier_data_copy['expiry_date'])
        supplier_data_copy['days_to_expiry'] = (supplier_data_copy['expiry_date'] - current_date).dt.days
        
        expiring_soon = supplier_data_copy[supplier_data_copy['days_to_expiry'] <= 30]
        expiry_risk_value = (expiring_soon['cost_price'] * expiring_soon['quantity_in_stock']).sum()
        
        # Calculate stock turnover (estimated)
        avg_stock_level = supplier_data['quantity_in_stock'].mean()
        
        supplier_metrics.append({
            'supplier_id': supplier_id,
            'supplier_name': supplier_info['supplier_name'],
            'total_products': total_products,
            'total_inventory_value': total_inventory_value,
            'avg_product_price': avg_product_price,
            'expiry_risk_value': expiry_risk_value,
            'avg_stock_level': avg_stock_level,
            'reliability_score': supplier_info['reliability_score'],
            'delivery_time_days': supplier_info['delivery_time_days'],
            'risk_score': calculate_supplier_risk_score(supplier_data, supplier_info)
        })
    
    return pd.DataFrame(supplier_metrics)

def calculate_supplier_risk_score(supplier_data, supplier_info):
    """Calculate a risk score for the supplier based on various factors"""
    risk_score = 0
    
    # Factor 1: Reliability score (lower reliability = higher risk)
    risk_score += (1 - supplier_info['reliability_score']) * 30
    
    # Factor 2: Delivery time (longer delivery = higher risk)
    delivery_risk = min(supplier_info['delivery_time_days'] / 14, 1) * 20
    risk_score += delivery_risk
    
    # Factor 3: Expiry risk (higher expiry risk = higher risk)
    current_date = datetime.now()
    supplier_data_copy = supplier_data.copy()
    supplier_data_copy['expiry_date'] = pd.to_datetime(supplier_data_copy['expiry_date'])
    supplier_data_copy['days_to_expiry'] = (supplier_data_copy['expiry_date'] - current_date).dt.days
    
    expiring_soon = supplier_data_copy[supplier_data_copy['days_to_expiry'] <= 30]
    total_value = (supplier_data_copy['cost_price'] * supplier_data_copy['quantity_in_stock']).sum()
    expiry_risk_value = (expiring_soon['cost_price'] * expiring_soon['quantity_in_stock']).sum()
    
    if total_value > 0:
        expiry_risk_ratio = expiry_risk_value / total_value
        risk_score += expiry_risk_ratio * 50
    
    return min(risk_score, 100)  # Cap at 100

def get_supplier_recommendations(supplier_metrics_df):
    """Generate recommendations based on supplier performance"""
    recommendations = []
    
    if supplier_metrics_df is None or supplier_metrics_df.empty:
        return recommendations
    
    # Sort by risk score (highest risk first)
    high_risk_suppliers = supplier_metrics_df.nlargest(3, 'risk_score')
    
    for _, supplier in high_risk_suppliers.iterrows():
        if supplier['risk_score'] > 70:
            recommendations.append({
                'supplier_name': supplier['supplier_name'],
                'issue': 'High Risk Supplier',
                'recommendation': f"Consider finding alternative suppliers for {supplier['supplier_name']}. "
                                f"Risk score: {supplier['risk_score']:.1f}/100",
                'priority': 'High'
            })
        elif supplier['risk_score'] > 50:
            recommendations.append({
                'supplier_name': supplier['supplier_name'],
                'issue': 'Moderate Risk Supplier',
                'recommendation': f"Monitor {supplier['supplier_name']} closely. "
                                f"Risk score: {supplier['risk_score']:.1f}/100",
                'priority': 'Medium'
            })
    
    # Check for suppliers with high expiry risk
    high_expiry_risk = supplier_metrics_df.nlargest(3, 'expiry_risk_value')
    for _, supplier in high_expiry_risk.iterrows():
        if supplier['expiry_risk_value'] > 1000:  # $1000 threshold
            recommendations.append({
                'supplier_name': supplier['supplier_name'],
                'issue': 'High Expiry Risk',
                'recommendation': f"${supplier['expiry_risk_value']:,.2f} worth of inventory from "
                                f"{supplier['supplier_name']} expires within 30 days. "
                                "Consider promotional pricing or supplier returns.",
                'priority': 'High'
            })
    
    return recommendations

def get_supplier_summary_stats(supplier_metrics_df):
    """Get summary statistics for suppliers"""
    if supplier_metrics_df is None or supplier_metrics_df.empty:
        return None
    
    summary = {
        'total_suppliers': len(supplier_metrics_df),
        'avg_reliability_score': supplier_metrics_df['reliability_score'].mean(),
        'avg_delivery_time': supplier_metrics_df['delivery_time_days'].mean(),
        'total_inventory_value': supplier_metrics_df['total_inventory_value'].sum(),
        'total_expiry_risk_value': supplier_metrics_df['expiry_risk_value'].sum(),
        'high_risk_suppliers': len(supplier_metrics_df[supplier_metrics_df['risk_score'] > 70]),
        'moderate_risk_suppliers': len(supplier_metrics_df[
            (supplier_metrics_df['risk_score'] > 50) & (supplier_metrics_df['risk_score'] <= 70)
        ]),
        'low_risk_suppliers': len(supplier_metrics_df[supplier_metrics_df['risk_score'] <= 50])
    }
    
    return summary 
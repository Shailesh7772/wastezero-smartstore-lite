import streamlit as st
import pandas as pd
from datetime import datetime

# Import utility functions
from utils.waste_prediction import load_data as load_wp_data, preprocess_for_waste_prediction, predict_expiring_products
from utils.schedule_optimization import load_sales_data, infer_footfall_from_sales, recommend_lighting_ac_schedule
from utils.greenscore import calculate_predicted_waste_value, estimate_energy_savings, calculate_greenscore, BASE_ENERGY_CONSUMPTION_PER_HOUR_AC_LIGHTING_KW
from utils.supplier_analytics import load_supplier_data, analyze_supplier_performance, get_supplier_recommendations, get_supplier_summary_stats
from utils.seasonal_analytics import analyze_seasonal_trends, forecast_seasonal_demand, get_seasonal_recommendations, calculate_seasonal_efficiency_score

# Configuration (could be moved to a config file)
STORE_OPEN_HOUR = 8  # Default, consider inferring from employee_schedules.csv if more dynamic needed
STORE_CLOSE_HOUR = 22 # Default
EXPIRY_THRESHOLD_DAYS = 30 # For waste prediction
STOCK_THRESHOLD_FACTOR = 1.5 # For waste prediction heuristic
ENERGY_OFF_PEAK_REDUCTION_PCT = 50 # For energy saving calculations

# --- Data Loading and Caching ---
@st.cache_data(ttl=600) # Cache for 10 minutes
def load_all_data():
    inventory_df, sales_df_for_wp = load_wp_data(inventory_path="data/inventory.csv", sales_path="data/sales.csv")
    sales_df_for_so = load_sales_data(sales_path="data/sales.csv") # For schedule optimization
    suppliers_df = load_supplier_data(suppliers_path="data/suppliers.csv")

    # We could also load employee_schedules_df here if needed for dynamic open/close hours
    # For now, using fixed values.

    if inventory_df is None or sales_df_for_wp is None or sales_df_for_so is None:
        st.error("Failed to load one or more data files. Please ensure 'data/inventory.csv' and 'data/sales.csv' exist in the data directory.")
        return None, None, None, None, None

    # Calculate total inventory value (used in GreenScore)
    # Ensure 'cost_price' and 'quantity_in_stock' are numeric
    inventory_df['cost_price'] = pd.to_numeric(inventory_df['cost_price'], errors='coerce').fillna(0)
    inventory_df['quantity_in_stock'] = pd.to_numeric(inventory_df['quantity_in_stock'], errors='coerce').fillna(0)
    total_inventory_value = (inventory_df['cost_price'] * inventory_df['quantity_in_stock']).sum()

    return inventory_df, sales_df_for_wp, sales_df_for_so, suppliers_df, total_inventory_value

# --- Main App Logic ---
st.set_page_config(page_title="SmartStore Lite", layout="wide", initial_sidebar_state="expanded")
st.title("🛍️ SmartStore Lite Dashboard")
st.markdown("Helping retail stores reduce energy and inventory waste with simulated data.")

# Load data
inventory_df, sales_df_wp, sales_df_so, suppliers_df, total_inventory_value = load_all_data()

if inventory_df is not None:
    # --- Sidebar for Controls (Optional) ---
    st.sidebar.header("Settings")
    
    # Automatic intelligent thresholds based on product characteristics
    st.sidebar.subheader("🤖 Automatic Thresholds")
    
    # Calculate automatic thresholds based on current data
    def calculate_automatic_thresholds(inventory_df):
        """Calculate intelligent thresholds based on product characteristics"""
        if inventory_df is None or inventory_df.empty:
            return {
                'Shelf Life': 7,
                'Expiration Date': 7,
                'Warranty Period': 90,
                'Fashion Season': 90,
                'Quality Period': 180,
                'Obsolescence': 180,
                'Wear Period': 180
            }
        
        # Analyze current inventory to determine optimal thresholds
        current_date = datetime.now()
        inventory_df['expiry_date'] = pd.to_datetime(inventory_df['expiry_date'])
        inventory_df['days_to_expiry'] = (inventory_df['expiry_date'] - current_date).dt.days
        
        # Calculate thresholds based on actual data patterns
        thresholds = {}
        
        # Critical items: Use actual expiry patterns
        critical_items = inventory_df[inventory_df['category'].isin(['Groceries', 'Beauty & Health'])]
        if not critical_items.empty:
            # Use 75th percentile of days to expiry for critical items
            critical_days = critical_items['days_to_expiry'].quantile(0.75)
            thresholds['Shelf Life'] = max(3, min(14, int(critical_days)))
            thresholds['Expiration Date'] = max(3, min(14, int(critical_days)))
        else:
            thresholds['Shelf Life'] = 7
            thresholds['Expiration Date'] = 7
        
        # Moderate items: Use warranty/fashion patterns
        moderate_items = inventory_df[inventory_df['category'].isin(['Electronics', 'Clothing'])]
        if not moderate_items.empty:
            moderate_days = moderate_items['days_to_expiry'].quantile(0.75)
            thresholds['Warranty Period'] = max(30, min(180, int(moderate_days)))
            thresholds['Fashion Season'] = max(30, min(180, int(moderate_days)))
        else:
            thresholds['Warranty Period'] = 90
            thresholds['Fashion Season'] = 90
        
        # Low priority items: Use quality/obsolescence patterns
        low_priority_items = inventory_df[inventory_df['category'].isin(['Home Goods', 'Books', 'Sports & Outdoors'])]
        if not low_priority_items.empty:
            low_priority_days = low_priority_items['days_to_expiry'].quantile(0.75)
            thresholds['Quality Period'] = max(90, min(365, int(low_priority_days)))
            thresholds['Obsolescence'] = max(90, min(365, int(low_priority_days)))
            thresholds['Wear Period'] = max(90, min(365, int(low_priority_days)))
        else:
            thresholds['Quality Period'] = 180
            thresholds['Obsolescence'] = 180
            thresholds['Wear Period'] = 180
        
        return thresholds
    
    # Calculate automatic thresholds
    automatic_thresholds = calculate_automatic_thresholds(inventory_df)
    
    # Display current automatic thresholds
    st.sidebar.info("🎯 **Current Automatic Thresholds:**")
    for expiry_type, threshold in automatic_thresholds.items():
        st.sidebar.text(f"• {expiry_type}: {threshold} days")
    
    st.sidebar.markdown("---")
    st.sidebar.subheader("⚡ Energy Settings")
    energy_reduction_pct = st.sidebar.slider("Energy: Off-Peak Reduction %", 10, 90, ENERGY_OFF_PEAK_REDUCTION_PCT, 10,
                                             help="Assumed % reduction in energy use during off-peak or low-footfall hours.")

    # --- 1. Waste Prediction ---
    st.header("🍎 Waste Prediction")
    st.markdown("Predicts products likely to expire based on sales trends and inventory levels.")

    with st.spinner("Analyzing inventory and sales for waste prediction..."):
        processed_inventory = preprocess_for_waste_prediction(inventory_df.copy(), sales_df_wp.copy())
        at_risk_products = predict_expiring_products(processed_inventory,
                                                     expiry_threshold_days=automatic_thresholds,
                                                     stock_threshold_factor=STOCK_THRESHOLD_FACTOR)

    if not at_risk_products.empty:
        # Create summary of automatic thresholds for display
        critical_threshold = automatic_thresholds.get('Shelf Life', 7)
        moderate_threshold = automatic_thresholds.get('Warranty Period', 90)
        low_priority_threshold = automatic_thresholds.get('Quality Period', 180)
        threshold_summary = f"Auto: Critical {critical_threshold}d, Moderate {moderate_threshold}d, Low {low_priority_threshold}d"
        st.subheader(f"🚨 At-Risk Products (Automatic Thresholds: {threshold_summary})")
        # Prepare columns for display, handling missing expiry_type column
        display_columns = ['product_name', 'category', 'quantity_in_stock',
                          'expiry_date', 'days_to_expiry', 'avg_daily_sales_last_30d', 'estimated_days_stock_left']
        column_names = {
            'product_name': 'Product', 'category': 'Category',
            'quantity_in_stock': 'Stock Qty', 'expiry_date': 'Expiry Date', 'days_to_expiry': 'Days to Exp.',
            'avg_daily_sales_last_30d': 'Avg Daily Sales (30d)', 'estimated_days_stock_left': 'Est. Stock Days Left'
        }
        
        # Add expiry_type if it exists
        if 'expiry_type' in at_risk_products.columns:
            display_columns.insert(2, 'expiry_type')
            column_names['expiry_type'] = 'Expiry Type'
        
        st.dataframe(at_risk_products[display_columns].rename(columns=column_names), height=300)

        # For GreenScore calculation
        predicted_waste_value, total_items_at_risk = calculate_predicted_waste_value(at_risk_products)
        st.info(f"**Summary:** Found **{len(at_risk_products)} product(s)** ({total_items_at_risk:.0f} items) at high risk, with an estimated total cost value of **${predicted_waste_value:,.2f}**.", icon="💡")
        
        # Add emergency alerts for hackathon demo
        st.markdown("---")
        st.markdown("### 🚨 **EMERGENCY ALERTS** 🚨")
        
        # Find products expiring within 7 days
        critical_7_days = at_risk_products[at_risk_products['days_to_expiry'] <= 7]
        if not critical_7_days.empty:
            st.error(f"**URGENT**: {len(critical_7_days)} products expiring within 7 days!")
            for _, product in critical_7_days.head(3).iterrows():
                st.error(f"🔥 {product['product_name']} - Expires in {product['days_to_expiry']} days (Risk: {product['risk_score']:.0f})")
        
        # Find products with very high stock levels
        high_stock_risk = at_risk_products[at_risk_products['estimated_days_stock_left'] > 365]
        if not high_stock_risk.empty:
            st.warning(f"**OVERSTOCK ALERT**: {len(high_stock_risk)} products with excessive stock levels!")
            for _, product in high_stock_risk.head(3).iterrows():
                st.warning(f"📦 {product['product_name']} - {product['estimated_days_stock_left']:.0f} days of stock left")
        
        # Find products with zero sales
        zero_sales = at_risk_products[at_risk_products['avg_daily_sales_last_30d'] == 0]
        if not zero_sales.empty:
            st.info(f"**NO SALES ALERT**: {len(zero_sales)} products with zero sales in 30 days!")
            for _, product in zero_sales.head(3).iterrows():
                st.info(f"📊 {product['product_name']} - No sales, {product['quantity_in_stock']} units in stock")
    else:
        st.success("No products currently identified as high risk of wastage with the selected criteria. Good job!", icon="✅")
        predicted_waste_value = 0.0 # For GreenScore

    st.markdown("""
    <small>_**How this works:** This section uses intelligent expiry logic based on product type:
    - **Critical (Groceries, Beauty)**: Actual expiry dates with full priority
    - **Moderate (Electronics, Clothing)**: Warranty/fashion periods with reduced priority  
    - **Low Priority (Home Goods, Books, Sports)**: Quality/obsolescence periods with minimal priority
    Products are flagged based on expiry type, days remaining, and sales velocity. Adjust the 'Days to Expiry Threshold' in the sidebar to fine-tune._</small>
    """, unsafe_allow_html=True)
    st.divider()

    # --- 2. Energy Optimization ---
    st.header("💡 Energy Optimization")
    st.markdown("Recommends optimized lighting/AC schedules based on footfall patterns inferred from sales timestamps.")

    with st.spinner("Analyzing sales for footfall patterns..."):
        footfall_by_hour = infer_footfall_from_sales(sales_df_so)

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("👟 Hourly Footfall Pattern (from Sales)")
        if not footfall_by_hour.empty:
            st.bar_chart(footfall_by_hour)
            st.markdown("<small>_**Note:** Footfall is estimated based on the number of sales transactions per hour._</small>", unsafe_allow_html=True)
        else:
            st.warning("No sales data available to infer footfall.")

    with col2:
        st.subheader("📅 Recommended Energy Schedule")
        if not footfall_by_hour.empty:
            schedule_recs = recommend_lighting_ac_schedule(footfall_by_hour,
                                                           store_open_hour=STORE_OPEN_HOUR,
                                                           store_close_hour=STORE_CLOSE_HOUR,
                                                           off_peak_reduction_pct=energy_reduction_pct)
            # Create styled dataframe with better visibility
            def style_settings(val):
                if val == 'Full Power':
                    return 'background-color: #cceeff; color: #000000; font-weight: bold'
                elif 'Reduced Power' in str(val):
                    return 'background-color: #fff3cc; color: #000000; font-weight: bold'
                elif val == 'Minimal/Off':
                    return 'background-color: #e6e6e6; color: #000000; font-weight: bold'
                else:
                    return 'color: #000000; font-weight: bold'
            
            styled_df = schedule_recs.style.map(style_settings, subset=['setting'])
            st.dataframe(styled_df, height=350)
            st.markdown(f"<small>_**Recommendation Logic:** 'Full Power' during peak hours, 'Reduced Power ({energy_reduction_pct}% savings)' during low footfall operating hours, and 'Minimal/Off' outside store hours ({STORE_OPEN_HOUR:02}:00 - {STORE_CLOSE_HOUR:02}:00)._</small>", unsafe_allow_html=True)

            # For GreenScore
            daily_energy_saved_kwh, daily_cost_saved = estimate_energy_savings(schedule_recs, off_peak_reduction_pct=energy_reduction_pct)
            st.info(f"**Estimated Daily Savings:** {daily_energy_saved_kwh:.2f} kWh (approx. ${daily_cost_saved:.2f})", icon="💰")
        else:
            st.warning("Cannot generate schedule recommendations without footfall data.")
            daily_energy_saved_kwh = 0.0 # For GreenScore
    st.divider()

    # --- 3. GreenScore ---
    st.header("♻️ GreenScore")
    st.markdown("A sustainability score based on predicted waste and estimated energy savings.")

    # Max possible energy savings for GreenScore normalization
    # This is a simplified calculation: assumes max savings if store is 'Minimal/Off' outside operating hours
    # and 'Reduced Power' during all operating hours.
    # Standard consumption if always full power during operating hours (and minimal outside):
    operating_hours = STORE_CLOSE_HOUR - STORE_OPEN_HOUR
    standard_op_consumption = operating_hours * BASE_ENERGY_CONSUMPTION_PER_HOUR_AC_LIGHTING_KW
    standard_non_op_consumption = (24 - operating_hours) * BASE_ENERGY_CONSUMPTION_PER_HOUR_AC_LIGHTING_KW * 0.1 # Minimal
    total_standard_daily_consumption = standard_op_consumption + standard_non_op_consumption

    # Ideal optimized: minimal outside op_hours, reduced during all op_hours
    ideal_op_consumption = operating_hours * BASE_ENERGY_CONSUMPTION_PER_HOUR_AC_LIGHTING_KW * (1 - energy_reduction_pct/100)
    # Non-op consumption is already minimal in standard calculation for this baseline
    total_ideal_daily_consumption = ideal_op_consumption + standard_non_op_consumption

    # This max_possible_daily_energy_savings_kwh represents savings compared to a baseline of
    # 'Full Power' during all operating hours and 'Minimal/Off' outside operating hours.
    max_possible_daily_energy_savings_kwh = total_standard_daily_consumption - total_ideal_daily_consumption
    # Ensure it's not negative if ideal is somehow higher (e.g. reduction_pct is 0)
    max_possible_daily_energy_savings_kwh = max(0, max_possible_daily_energy_savings_kwh)


    greenscore_val, waste_score, energy_score = calculate_greenscore(
        predicted_waste_value,
        total_inventory_value,
        daily_energy_saved_kwh,
        max_possible_daily_energy_savings_kwh if max_possible_daily_energy_savings_kwh > 0 else 1.0, # Avoid div by zero if no savings possible
        waste_weight=0.6,
        energy_weight=0.4
    )

    # Display GreenScore
    # Determine color based on score
    if greenscore_val >= 75:
        score_color = "green"
    elif greenscore_val >= 50:
        score_color = "orange"
    else:
        score_color = "red"

    st.subheader("Overall GreenScore:")
    st.markdown(f"""
    <div style="text-align: center;">
        <p style="font-size: 72px; color: {score_color}; font-weight: bold; margin-bottom: 0px;">
            {greenscore_val:.1f} <span style="font-size: 36px; color: grey;">/ 100</span>
        </p>
    </div>
    """, unsafe_allow_html=True)

    # Breakdown
    col_gs1, col_gs2 = st.columns(2)
    with col_gs1:
        st.metric(label="Waste Reduction Score", value=f"{waste_score:.1f}/100",
                  help=f"Based on predicted waste value (${predicted_waste_value:,.2f}) relative to total inventory value (${total_inventory_value:,.2f}). Lower waste = higher score.")
    with col_gs2:
        st.metric(label="Energy Savings Score", value=f"{energy_score:.1f}/100",
                  help=f"Based on estimated daily energy savings ({daily_energy_saved_kwh:.2f} kWh) relative to potential savings ({max_possible_daily_energy_savings_kwh:.2f} kWh with current settings). Higher savings = higher score.")

    st.markdown("""
    <small>_**GreenScore Calculation:** The GreenScore is a weighted average of the Waste Reduction Score (60%) and the Energy Savings Score (40%).
    A higher score indicates better sustainability practices in terms of minimizing waste and optimizing energy._</small>
    """, unsafe_allow_html=True)

    st.divider()

    # --- 4. Supplier Analytics ---
    st.header("🏭 Supplier Analytics")
    st.markdown("Analyze supplier performance, reliability, and risk factors.")

    if suppliers_df is not None:
        with st.spinner("Analyzing supplier performance..."):
            supplier_metrics = analyze_supplier_performance(inventory_df, suppliers_df)
            supplier_recommendations = get_supplier_recommendations(supplier_metrics)
            supplier_summary = get_supplier_summary_stats(supplier_metrics)

        if supplier_metrics is not None:
            col1, col2 = st.columns(2)
            
            with col1:
                st.subheader("📊 Supplier Performance Overview")
                if supplier_summary:
                    st.metric("Total Suppliers", supplier_summary['total_suppliers'])
                    st.metric("Avg Reliability Score", f"{supplier_summary['avg_reliability_score']:.2f}")
                    st.metric("Avg Delivery Time", f"{supplier_summary['avg_delivery_time']:.1f} days")
                    st.metric("High Risk Suppliers", supplier_summary['high_risk_suppliers'])

            with col2:
                st.subheader("⚠️ Risk Distribution")
                if supplier_summary:
                    risk_data = {
                        'Risk Level': ['Low Risk', 'Moderate Risk', 'High Risk'],
                        'Count': [
                            supplier_summary['low_risk_suppliers'],
                            supplier_summary['moderate_risk_suppliers'],
                            supplier_summary['high_risk_suppliers']
                        ]
                    }
                    risk_df = pd.DataFrame(risk_data)
                    st.bar_chart(risk_df.set_index('Risk Level'))

            st.subheader("🔍 Top Suppliers by Risk Score")
            if not supplier_metrics.empty:
                high_risk_suppliers = supplier_metrics.nlargest(5, 'risk_score')
                st.dataframe(high_risk_suppliers[[
                    'supplier_name', 'total_products', 'total_inventory_value',
                    'expiry_risk_value', 'reliability_score', 'risk_score'
                ]].rename(columns={
                    'supplier_name': 'Supplier', 'total_products': 'Products',
                    'total_inventory_value': 'Inventory Value', 'expiry_risk_value': 'Expiry Risk',
                    'reliability_score': 'Reliability', 'risk_score': 'Risk Score'
                }), height=300)

            if supplier_recommendations:
                st.subheader("💡 Supplier Recommendations")
                for rec in supplier_recommendations:
                    priority_color = "🔴" if rec['priority'] == 'High' else "🟡" if rec['priority'] == 'Medium' else "🟢"
                    st.info(f"{priority_color} **{rec['issue']}**: {rec['recommendation']}")
    else:
        st.warning("Supplier data not available. Please ensure 'data/suppliers.csv' exists.")

    st.divider()

    # --- 5. Seasonal Analytics ---
    st.header("📅 Seasonal Analytics")
    st.markdown("Analyze seasonal trends and forecast future demand.")

    with st.spinner("Analyzing seasonal patterns..."):
        seasonal_trends = analyze_seasonal_trends(sales_df_so, inventory_df)
        seasonal_forecast = forecast_seasonal_demand(inventory_df, sales_df_so)
        seasonal_recommendations = get_seasonal_recommendations(inventory_df, sales_df_so)
        seasonal_efficiency = calculate_seasonal_efficiency_score(inventory_df, sales_df_so)

    if seasonal_trends is not None:
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("📈 Monthly Sales Trends")
            if not seasonal_trends['monthly_sales'].empty:
                st.line_chart(seasonal_trends['monthly_sales']['quantity_sold'])

        with col2:
            st.subheader("🌤️ Seasonal Performance")
            if not seasonal_trends['seasonal_sales'].empty:
                st.bar_chart(seasonal_trends['seasonal_sales']['quantity_sold'])

        st.subheader("🔮 Demand Forecast (Next 3 Months)")
        if seasonal_forecast is not None and not seasonal_forecast.empty:
            # Handle duplicate entries and create a more robust pivot
            try:
                # First, ensure unique category-season combinations
                forecast_agg = seasonal_forecast.groupby(['category', 'season'])['forecasted_sales'].mean().reset_index()
                
                # Create pivot table instead of pivot for better handling
                forecast_pivot = forecast_agg.pivot_table(
                    index='category', 
                    columns='season', 
                    values='forecasted_sales',
                    aggfunc='mean',
                    fill_value=0
                )
                st.dataframe(forecast_pivot.round(0), height=400)
            except Exception as e:
                # Fallback: show simple table if pivot fails
                st.dataframe(forecast_agg[['category', 'season', 'forecasted_sales']].round(0), height=400)
                st.warning("Forecast visualization simplified due to data structure.")

        if seasonal_recommendations:
            st.subheader("💡 Seasonal Recommendations")
            for rec in seasonal_recommendations:
                priority_color = "🔴" if rec['priority'] == 'High' else "🟡" if rec['priority'] == 'Medium' else "🟢"
                st.info(f"{priority_color} **{rec['issue']}**: {rec['recommendation']}")

        st.metric("Seasonal Efficiency Score", f"{seasonal_efficiency:.1f}/100",
                  help="Measures how well the store manages seasonal inventory and demand patterns.")

    st.divider()

    # --- 6. Enhanced Dashboard Summary ---
    st.header("📊 Dashboard Summary")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Total Products", len(inventory_df))
        st.metric("Categories", inventory_df['category'].nunique())
        st.metric("Total Inventory Value", f"${total_inventory_value:,.2f}")
    
    with col2:
        if suppliers_df is not None:
            st.metric("Total Suppliers", len(suppliers_df))
            st.metric("Avg Supplier Reliability", f"{suppliers_df['reliability_score'].mean():.2f}")
        else:
            st.metric("Total Suppliers", "N/A")
            st.metric("Avg Supplier Reliability", "N/A")
    
    with col3:
        st.metric("Total Sales Records", len(sales_df_so))
        st.metric("Seasonal Efficiency", f"{seasonal_efficiency:.1f}/100")

    st.divider()
    st.sidebar.markdown("---")
    if st.sidebar.button("🔄 Refresh Data & Rerun"):
        st.cache_data.clear() # Clear cached data
        st.rerun()

    st.sidebar.markdown("---")
    st.sidebar.info("SmartStore Lite v2.0 (Enhanced Edition)")

else:
    st.error("App cannot start due to data loading issues. Please check the console for specific error messages from utility scripts if data files are present.")

# To run this app:
# 1. Ensure you have data files: `python data/generate_data.py`
# 2. Run streamlit: `streamlit run app.py`

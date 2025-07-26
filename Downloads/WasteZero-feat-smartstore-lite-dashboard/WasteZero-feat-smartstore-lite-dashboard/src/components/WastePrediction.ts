import Chart from 'chart.js/auto'
import { DataService } from '../services/DataService'

export class WastePrediction {
    private dataService: DataService
    private container: HTMLElement

    constructor(container: HTMLElement) {
        this.container = container
        this.dataService = new DataService()
        this.initialize()
    }

    private async initialize(): Promise<void> {
        await this.dataService.loadData()
        this.render()
        this.createCharts()
    }

    private render(): void {
        const expiringProducts = this.dataService.getExpiringProducts();
        const criticalProducts = this.dataService.getCriticalExpiringProducts();
        const highStockRisk = this.dataService.getHighStockRiskProducts();
        const zeroSales = this.dataService.getZeroSalesProducts();
        const thresholds = this.dataService.getExpiryThresholds();
        const predictedWasteValue = this.dataService.getPredictedWasteValue();
        let totalItemsAtRisk = this.dataService.getTotalItemsAtRisk();
        if (Array.isArray(totalItemsAtRisk)) {
            totalItemsAtRisk = totalItemsAtRisk.length;
        }
        if (typeof totalItemsAtRisk !== 'number') {
            totalItemsAtRisk = Number(totalItemsAtRisk) || 0;
        }
        const thresholdSummary = `Auto: Critical ${thresholds['Shelf Life']}d, Moderate ${thresholds['Warranty Period']}d, Low ${thresholds['Quality Period']}d`;

        this.container.innerHTML = `
            <div class="full-width-container section-spacing">
                <!-- Header -->
                <div class="text-center mb-12">
                    <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-4 floating">
                        <span class="gradient-text">Waste</span> Prediction
                    </h1>
                    <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                        AI-powered forecasting to minimize waste and optimize inventory
                    </p>
                </div>

                <!-- Key Metrics -->
                <div class="responsive-grid mb-12">
                    <div class="metric-card floating-delay-1">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Predicted Waste</h3>
                        <p class="text-3xl font-bold gradient-text">${this.dataService.getPredictedWaste()}kg</p>
                        <p class="text-sm text-gray-500 mt-2">Next 30 days</p>
                    </div>
                    <div class="metric-card floating-delay-2">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Accuracy Rate</h3>
                        <p class="text-3xl font-bold gradient-text">${this.dataService.getPredictionAccuracy()}%</p>
                        <p class="text-sm text-gray-500 mt-2">Model performance</p>
                    </div>
                    <div class="metric-card floating">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Cost Savings</h3>
                        <p class="text-3xl font-bold gradient-text">$${this.dataService.getWasteCostSavings().toLocaleString()}</p>
                        <p class="text-sm text-gray-500 mt-2">Monthly savings</p>
                    </div>
                    <div class="metric-card floating-delay-1">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Optimization Score</h3>
                        <p class="text-3xl font-bold gradient-text">${this.dataService.getWasteOptimizationScore()}/100</p>
                        <p class="text-sm text-gray-500 mt-2">Current efficiency</p>
                    </div>
                </div>

                <!-- At-Risk Products Table -->
                <div class="chart-container mb-12">
                    <h3 class="text-2xl font-bold text-gray-900 mb-6">🚨 At-Risk Products (${thresholdSummary})</h3>
                    ${expiringProducts.length > 0 ? `
                        <div class="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200 overflow-x-auto">
                            <table class="w-full text-gray-800">
                                <thead>
                                    <tr class="border-b border-gray-200">
                                        <th class="text-left py-3 px-4 font-semibold text-gray-900">Product</th>
                                        <th class="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
                                        <th class="text-left py-3 px-4 font-semibold text-gray-900">Expiry Type</th>
                                        <th class="text-left py-3 px-4 font-semibold text-gray-900">Stock Qty</th>
                                        <th class="text-left py-3 px-4 font-semibold text-gray-900">Expiry Date</th>
                                        <th class="text-left py-3 px-4 font-semibold text-gray-900">Days to Exp.</th>
                                        <th class="text-left py-3 px-4 font-semibold text-gray-900">Avg Daily Sales</th>
                                        <th class="text-left py-3 px-4 font-semibold text-gray-900">Risk Level</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${expiringProducts.map(item => `
                                        <tr class="border-b border-gray-100 hover:bg-gray-50">
                                            <td class="py-3 px-4 text-gray-700">${item.product_name}</td>
                                            <td class="py-3 px-4 text-gray-700">${item.category}</td>
                                            <td class="py-3 px-4 text-gray-700">${item.expiry_type}</td>
                                            <td class="py-3 px-4 text-gray-700">${item.quantity_in_stock}</td>
                                            <td class="py-3 px-4 text-gray-700">${item.expiry_date}</td>
                                            <td class="py-3 px-4 ${(item.days_to_expiry || 0) <= 7 ? 'text-red-600 font-bold' : (item.days_to_expiry || 0) <= 14 ? 'text-yellow-600' : 'text-green-600'}">${item.days_to_expiry}</td>
                                            <td class="py-3 px-4 text-gray-700">${item.avg_daily_sales_last_30d || 0}</td>
                                            <td class="py-3 px-4">
                                                <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                                                    (item.days_to_expiry || 0) <= 7 ? 'bg-red-100 text-red-700' :
                                                    (item.days_to_expiry || 0) <= 14 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                                }">
                                                    ${(item.days_to_expiry || 0) <= 7 ? 'Critical' : (item.days_to_expiry || 0) <= 14 ? 'High' : 'Medium'}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        <div class="mt-4 p-4 bg-green-100 border border-green-200 rounded-lg">
                            <p class="text-green-700 text-sm">
                                <strong>Summary:</strong> Found <strong>${expiringProducts.length} product(s)</strong> 
                                (${totalItemsAtRisk.toFixed(0)} items) at high risk, with an estimated total cost value of 
                                <strong>$${predictedWasteValue.toLocaleString()}</strong>.
                            </p>
                        </div>
                    ` : `
                        <div class="bg-green-100 border border-green-200 rounded-lg p-6 text-center">
                            <p class="text-green-700 text-lg">✅ No products currently identified as high risk of wastage with the selected criteria. Good job!</p>
                        </div>
                    `}
                </div>

                <!-- Emergency Alerts -->
                <div class="chart-container mb-12">
                    <h3 class="text-2xl font-bold text-gray-900 mb-6">🚨 EMERGENCY ALERTS</h3>
                    
                    <!-- Critical 7 Days -->
                    ${criticalProducts.length > 0 ? `
                        <div class="bg-red-100 border border-red-200 rounded-lg p-4 mb-4">
                            <h4 class="text-red-700 font-bold mb-2">🔥 URGENT: ${criticalProducts.length} products expiring within 7 days!</h4>
                            ${criticalProducts.slice(0, 3).map(product => `
                                <div class="text-red-600 text-sm mb-1">
                                    • ${product.product_name} - Expires in ${product.days_to_expiry} days 
                                    (Stock: ${product.quantity_in_stock} units)
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- High Stock Risk -->
                    ${highStockRisk.length > 0 ? `
                        <div class="bg-yellow-100 border border-yellow-200 rounded-lg p-4 mb-4">
                            <h4 class="text-yellow-700 font-bold mb-2">📦 OVERSTOCK ALERT: ${highStockRisk.length} products with excessive stock levels!</h4>
                            ${highStockRisk.slice(0, 3).map(product => `
                                <div class="text-yellow-600 text-sm mb-1">
                                    • ${product.product_name} - ${product.quantity_in_stock} units in stock
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Zero Sales -->
                    ${zeroSales.length > 0 ? `
                        <div class="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-4">
                            <h4 class="text-blue-700 font-bold mb-2">📊 NO SALES ALERT: ${zeroSales.length} products with zero sales in 30 days!</h4>
                            ${zeroSales.slice(0, 3).map(product => `
                                <div class="text-blue-600 text-sm mb-1">
                                    • ${product.product_name} - No sales, ${product.quantity_in_stock} units in stock
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <!-- Charts Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div class="chart-container">
                        <h3 class="text-xl font-semibold text-gray-900 mb-4">Waste Prediction Trend</h3>
                        <canvas id="wastePredictionChart" width="400" height="300"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3 class="text-xl font-semibold text-gray-900 mb-4">Category-wise Waste</h3>
                        <canvas id="wasteCategoryChart" width="400" height="300"></canvas>
                    </div>
                </div>

                <!-- AI Recommendations -->
                <div class="chart-container">
                    <h3 class="text-xl font-semibold text-gray-900 mb-6">AI Recommendations</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                            <div class="flex items-center mb-3">
                                <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                    </svg>
                                </div>
                                <h4 class="text-lg font-semibold text-gray-900">Reduce Dairy Orders</h4>
                            </div>
                            <p class="text-gray-700 text-sm">Decrease dairy product orders by 15% to reduce spoilage waste</p>
                        </div>
                        <div class="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                            <div class="flex items-center mb-3">
                                <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <h4 class="text-lg font-semibold text-gray-900">Optimize Storage</h4>
                            </div>
                            <p class="text-gray-700 text-sm">Implement FIFO storage system for perishable items</p>
                        </div>
                        <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                            <div class="flex items-center mb-3">
                                <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <h4 class="text-lg font-semibold text-gray-900">Smart Pricing</h4>
                            </div>
                            <p class="text-gray-700 text-sm">Implement dynamic pricing for items approaching expiry</p>
                        </div>
                    </div>
                </div>

                <!-- How it works explanation -->
                <div class="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <h4 class="text-lg font-semibold text-gray-900 mb-3">How this works:</h4>
                    <p class="text-gray-700 text-sm mb-3">
                        This section uses intelligent expiry logic based on product type:
                    </p>
                    <ul class="text-gray-700 text-sm space-y-1">
                        <li>• <strong>Critical (Groceries, Beauty):</strong> Actual expiry dates with full priority</li>
                        <li>• <strong>Moderate (Electronics, Clothing):</strong> Warranty/fashion periods with reduced priority</li>
                        <li>• <strong>Low Priority (Home Goods, Books, Sports):</strong> Quality/obsolescence periods with minimal priority</li>
                    </ul>
                    <p class="text-gray-700 text-sm mt-3">
                        Products are flagged based on expiry type, days remaining, and sales velocity.
                    </p>
                </div>
            </div>
        `;
        this.createCharts();
    }

    private createCharts(): void {
        // Waste Prediction Trend Chart
        try {
            console.log('DEBUG: Creating Waste Prediction Trend Chart...');
            const predictionCtx = document.getElementById('wastePredictionChart') as HTMLCanvasElement;
            if (predictionCtx) {
                new Chart(predictionCtx, {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                            label: 'Actual Waste',
                            data: [120, 135, 110, 125, 140, 130],
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4
                        }, {
                            label: 'Predicted Waste',
                            data: [115, 130, 105, 120, 135, 125],
                            borderColor: '#06b6d4',
                            backgroundColor: 'rgba(6, 182, 212, 0.1)',
                            borderDash: [5, 5],
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                labels: { color: '#1e293b' }
                            }
                        },
                        scales: {
                            y: {
                                ticks: { color: '#1e293b' },
                                grid: { color: 'rgba(255, 255, 255, 0.1)' }
                            },
                            x: {
                                ticks: { color: '#1e293b' },
                                grid: { color: 'rgba(255, 255, 255, 0.1)' }
                            }
                        }
                    }
                });
                console.log('DEBUG: Waste Prediction Trend Chart created successfully.');
            } else {
                console.warn('DEBUG: wastePredictionChart canvas not found.');
            }
        } catch (err) {
            console.error('ERROR creating Waste Prediction Trend Chart:', err);
        }

        // Waste Category Chart
        try {
            console.log('DEBUG: Creating Waste Category Chart...');
            const categoryCtx = document.getElementById('wasteCategoryChart') as HTMLCanvasElement;
            if (categoryCtx) {
                new Chart(categoryCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Dairy', 'Produce', 'Bakery', 'Meat', 'Packaged'],
                        datasets: [{
                            data: [30, 25, 20, 15, 10],
                            backgroundColor: [
                                '#10b981',
                                '#06b6d4',
                                '#8b5cf6',
                                '#f59e0b',
                                '#ef4444'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                labels: { color: '#1e293b' }
                            }
                        }
                    }
                });
                console.log('DEBUG: Waste Category Chart created successfully.');
            } else {
                console.warn('DEBUG: wasteCategoryChart canvas not found.');
            }
        } catch (err) {
            console.error('ERROR creating Waste Category Chart:', err);
        }
    }
} 
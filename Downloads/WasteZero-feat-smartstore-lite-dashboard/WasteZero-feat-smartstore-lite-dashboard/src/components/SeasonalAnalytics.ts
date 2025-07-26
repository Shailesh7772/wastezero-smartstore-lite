import Chart from 'chart.js/auto'
import { DataService } from '../services/DataService'

export class SeasonalAnalytics {
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
        this.container.innerHTML = `
            <div class="full-width-container section-spacing">
                <!-- Header -->
                <div class="text-center mb-12">
                    <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-4 floating">
                        <span class="gradient-text">Seasonal</span> Analytics
                    </h1>
                    <p class="text-xl text-gray-700/80 max-w-3xl mx-auto">
                        Seasonal trends analysis and demand forecasting for optimal inventory management
                    </p>
                </div>

                <!-- Key Metrics -->
                <div class="responsive-grid mb-12">
                    <div class="metric-card floating-delay-1">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Peak Season</h3>
                        <p class="text-3xl font-bold gradient-text">${this.dataService.getPeakSeason()}</p>
                        <p class="text-sm text-gray-700/60 mt-2">Highest demand period</p>
                    </div>
                    <div class="metric-card floating-delay-2">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Seasonal Growth</h3>
                        <p class="text-3xl font-bold gradient-text">+${this.dataService.getSeasonalGrowth()}%</p>
                        <p class="text-sm text-gray-700/60 mt-2">Peak vs off-peak</p>
                    </div>
                    <div class="metric-card floating">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Forecast Accuracy</h3>
                        <p class="text-3xl font-bold gradient-text">${this.dataService.getForecastAccuracy()}%</p>
                        <p class="text-sm text-gray-700/60 mt-2">Prediction reliability</p>
                    </div>
                    <div class="metric-card floating-delay-1">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Inventory Turnover</h3>
                        <p class="text-3xl font-bold gradient-text">${this.dataService.getInventoryTurnover()}</p>
                        <p class="text-sm text-gray-700/60 mt-2">Annual cycles</p>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div class="chart-container">
                        <h3 class="text-xl font-bold text-gray-900 mb-4">Seasonal Sales Trend</h3>
                        <canvas id="seasonalSalesChart" width="400" height="300"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3 class="text-xl font-bold text-gray-900 mb-4">Product Category Performance</h3>
                        <canvas id="categoryPerformanceChart" width="400" height="300"></canvas>
                    </div>
                </div>

                <!-- Seasonal Insights -->
                <div class="chart-container">
                    <h3 class="text-xl font-bold text-gray-900 mb-6">Seasonal Insights & Recommendations</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                            <div class="flex items-center mb-3">
                                <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                    </svg>
                                </div>
                                <h4 class="text-lg font-semibold text-gray-900">Summer Strategy</h4>
                            </div>
                            <p class="text-gray-700 text-sm">Increase cold beverages and fresh produce inventory by 40% during summer months</p>
                        </div>
                        <div class="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                            <div class="flex items-center mb-3">
                                <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                </div>
                                <h4 class="text-lg font-semibold text-gray-900">Holiday Planning</h4>
                            </div>
                            <p class="text-gray-700 text-sm">Stock up on premium products and gift items 2 weeks before major holidays</p>
                        </div>
                        <div class="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                            <div class="flex items-center mb-3">
                                <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <h4 class="text-lg font-semibold text-gray-900">Weather Adaptation</h4>
                            </div>
                            <p class="text-gray-700 text-sm">Adjust inventory based on weather forecasts for optimal demand matching</p>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    private createCharts(): void {
        // Seasonal Sales Trend Chart
        const salesCtx = document.getElementById('seasonalSalesChart') as HTMLCanvasElement
        if (salesCtx) {
            new Chart(salesCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Sales Volume',
                        data: [120, 135, 150, 165, 180, 200, 220, 210, 190, 175, 160, 140],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
                            grid: { color: '#e5e7eb' }
                        },
                        x: {
                            ticks: { color: '#1e293b' },
                            grid: { color: '#e5e7eb' }
                        }
                    }
                }
            })
        }

        // Category Performance Chart
        const categoryCtx = document.getElementById('categoryPerformanceChart') as HTMLCanvasElement
        if (categoryCtx) {
            new Chart(categoryCtx, {
                type: 'radar',
                data: {
                    labels: ['Dairy', 'Produce', 'Bakery', 'Meat', 'Beverages', 'Snacks'],
                    datasets: [{
                        label: 'Spring',
                        data: [80, 90, 85, 75, 70, 80],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)'
                    }, {
                        label: 'Summer',
                        data: [85, 95, 80, 70, 95, 85],
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)'
                    }, {
                        label: 'Fall',
                        data: [90, 85, 90, 85, 75, 90],
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)'
                    }, {
                        label: 'Winter',
                        data: [95, 80, 95, 90, 80, 95],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)'
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
                        r: {
                            ticks: { color: '#1e293b' },
                            grid: { color: '#e5e7eb' },
                            pointLabels: { color: '#1e293b' }
                        }
                    }
                }
            })
        }
    }
} 

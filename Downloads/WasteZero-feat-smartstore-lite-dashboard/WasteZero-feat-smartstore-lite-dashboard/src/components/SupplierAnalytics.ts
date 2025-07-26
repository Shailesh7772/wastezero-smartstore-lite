import Chart from 'chart.js/auto'
import { DataService } from '../services/DataService'

export class SupplierAnalytics {
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
                        <span class="gradient-text">Supplier</span> Analytics
                    </h1>
                    <p class="text-xl text-gray-700/80 max-w-3xl mx-auto">
                        Comprehensive supplier performance and sustainability metrics analysis
                    </p>
                </div>

                <!-- Key Metrics -->
                <div class="responsive-grid mb-12">
                    <div class="metric-card floating-delay-1">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Total Suppliers</h3>
                        <p class="text-3xl font-bold gradient-text">${this.dataService.getSupplierCount()}</p>
                        <p class="text-sm text-gray-700/60 mt-2">Active partnerships</p>
                    </div>
                    <div class="metric-card floating-delay-2">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Sustainable Suppliers</h3>
                        <p class="text-3xl font-bold gradient-text">${this.dataService.getSustainableSupplierCount()}</p>
                        <p class="text-sm text-gray-700/60 mt-2">Certified green partners</p>
                    </div>
                    <div class="metric-card floating">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Average Rating</h3>
                        <p class="text-3xl font-bold gradient-text">${this.dataService.getAverageSupplierRating()}/5</p>
                        <p class="text-sm text-gray-700/60 mt-2">Performance score</p>
                    </div>
                    <div class="metric-card floating-delay-1">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">On-Time Delivery</h3>
                        <p class="text-3xl font-bold gradient-text">${this.dataService.getOnTimeDeliveryRate()}%</p>
                        <p class="text-sm text-gray-700/60 mt-2">Reliability metric</p>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div class="chart-container">
                        <h3 class="text-xl font-semibold text-gray-900 mb-4">Supplier Performance</h3>
                        <canvas id="supplierPerformanceChart" width="400" height="300"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3 class="text-xl font-semibold text-gray-900 mb-4">Sustainability Distribution</h3>
                        <canvas id="sustainabilityChart" width="400" height="300"></canvas>
                    </div>
                </div>

                <!-- Top Suppliers -->
                <div class="chart-container">
                    <h3 class="text-xl font-semibold text-gray-900 mb-6">Top Performing Suppliers</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                            <div class="flex items-center mb-3">
                                <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                                    <span class="text-gray-800 font-bold">1</span>
                                </div>
                                <h4 class="text-lg font-semibold text-gray-900">Fresh Farms Co.</h4>
                            </div>
                            <p class="text-gray-700 text-sm mb-3">Organic produce supplier with 98% on-time delivery</p>
                            <div class="flex justify-between text-sm">
                                <span class="text-emerald-400">Rating: 4.8/5</span>
                                <span class="text-cyan-400">Green Certified</span>
                            </div>
                        </div>
                        <div class="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                            <div class="flex items-center mb-3">
                                <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                    <span class="text-gray-800 font-bold">2</span>
                                </div>
                                <h4 class="text-lg font-semibold text-gray-900">Dairy Delights</h4>
                            </div>
                            <p class="text-gray-700 text-sm mb-3">Local dairy products with sustainable packaging</p>
                            <div class="flex justify-between text-sm">
                                <span class="text-emerald-400">Rating: 4.6/5</span>
                                <span class="text-cyan-400">Green Certified</span>
                            </div>
                        </div>
                        <div class="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                            <div class="flex items-center mb-3">
                                <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                                    <span class="text-gray-800 font-bold">3</span>
                                </div>
                                <h4 class="text-lg font-semibold text-gray-900">Bakery Fresh</h4>
                            </div>
                            <p class="text-gray-700 text-sm mb-3">Artisan bakery with zero-waste practices</p>
                            <div class="flex justify-between text-sm">
                                <span class="text-emerald-400">Rating: 4.5/5</span>
                                <span class="text-cyan-400">Green Certified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    private createCharts(): void {
        // Supplier Performance Chart
        const performanceCtx = document.getElementById('supplierPerformanceChart') as HTMLCanvasElement
        if (performanceCtx) {
            new Chart(performanceCtx, {
                type: 'bar',
                data: {
                    labels: ['Fresh Farms', 'Dairy Delights', 'Bakery Fresh', 'Meat Masters', 'Pantry Plus'],
                    datasets: [{
                        label: 'Performance Rating',
                        data: [4.8, 4.6, 4.5, 4.3, 4.1],
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

        // Sustainability Distribution Chart
        const sustainabilityCtx = document.getElementById('sustainabilityChart') as HTMLCanvasElement
        if (sustainabilityCtx) {
            new Chart(sustainabilityCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Green Certified', 'Partially Sustainable', 'Traditional'],
                    datasets: [{
                        data: [65, 25, 10],
                        backgroundColor: [
                            '#10b981',
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
            })
        }
    }
} 

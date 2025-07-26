import Chart from 'chart.js/auto'
import { DataService } from '../services/DataService'

export class GreenScore {
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
                        <span class="gradient-text">Green</span> Score
                    </h1>
                    <p class="text-xl text-gray-700/80 max-w-3xl mx-auto">
                        Comprehensive sustainability performance tracking and scoring
                    </p>
                </div>

                <!-- Green Score Display -->
                <div class="text-center mb-12">
                    <div class="inline-block relative">
                        <div class="w-48 h-48 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl floating">
                            <div class="text-center">
                                <div class="text-5xl font-bold text-gray-900">${this.dataService.getGreenScore()}</div>
                                <div class="text-gray-700/80">out of 100</div>
                            </div>
                        </div>
                        <div class="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                    </div>
                </div>

                <!-- Score Breakdown -->
                <div class="responsive-grid mb-12">
                    <div class="metric-card floating-delay-1">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Waste Management</h3>
                        <div class="flex items-center justify-between">
                            <div class="w-full bg-white/20 rounded-full h-3 mr-4">
                                <div class="bg-emerald-500 h-3 rounded-full" style="width: ${this.dataService.getWasteScore()}%"></div>
                            </div>
                            <span class="text-2xl font-bold gradient-text">${this.dataService.getWasteScore()}</span>
                        </div>
                    </div>
                    <div class="metric-card floating-delay-2">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Energy Efficiency</h3>
                        <div class="flex items-center justify-between">
                            <div class="w-full bg-white/20 rounded-full h-3 mr-4">
                                <div class="bg-cyan-500 h-3 rounded-full" style="width: ${this.dataService.getEnergyScore()}%"></div>
                            </div>
                            <span class="text-2xl font-bold gradient-text">${this.dataService.getEnergyScore()}</span>
                        </div>
                    </div>
                    <div class="metric-card floating">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Sustainable Sourcing</h3>
                        <div class="flex items-center justify-between">
                            <div class="w-full bg-white/20 rounded-full h-3 mr-4">
                                <div class="bg-purple-500 h-3 rounded-full" style="width: ${this.dataService.getSourcingScore()}%"></div>
                            </div>
                            <span class="text-2xl font-bold gradient-text">${this.dataService.getSourcingScore()}</span>
                        </div>
                    </div>
                    <div class="metric-card floating-delay-1">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Carbon Footprint</h3>
                        <div class="flex items-center justify-between">
                            <div class="w-full bg-white/20 rounded-full h-3 mr-4">
                                <div class="bg-orange-500 h-3 rounded-full" style="width: ${this.dataService.getCarbonScore()}%"></div>
                            </div>
                            <span class="text-2xl font-bold gradient-text">${this.dataService.getCarbonScore()}</span>
                        </div>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div class="chart-container">
                        <h3 class="text-xl font-semibold text-gray-900 mb-4">Score Trend</h3>
                        <canvas id="scoreTrendChart" width="400" height="300"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3 class="text-xl font-semibold text-gray-900 mb-4">Category Breakdown</h3>
                        <canvas id="categoryBreakdownChart" width="400" height="300"></canvas>
                    </div>
                </div>

                <!-- Recommendations -->
                <div class="chart-container">
                    <h3 class="text-xl font-semibold text-gray-900 mb-6">Improvement Recommendations</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                            <div class="flex items-center mb-3">
                                <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
                                </div>
                                <h4 class="text-lg font-semibold text-gray-900">Recycling Program</h4>
                            </div>
                            <p class="text-gray-700 text-sm">Implement comprehensive recycling program for all waste categories</p>
                        </div>
                        <div class="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                            <div class="flex items-center mb-3">
                                <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                    </svg>
                                </div>
                                <h4 class="text-lg font-semibold text-gray-900">Energy Audit</h4>
                            </div>
                            <p class="text-gray-700 text-sm">Conduct comprehensive energy audit to identify optimization opportunities</p>
                        </div>
                        <div class="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                            <div class="flex items-center mb-3">
                                <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                    </svg>
                                </div>
                                <h4 class="text-lg font-semibold text-gray-900">Local Suppliers</h4>
                            </div>
                            <p class="text-gray-700 text-sm">Increase sourcing from local and sustainable suppliers</p>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    private createCharts(): void {
        // Score Trend Chart
        const trendCtx = document.getElementById('scoreTrendChart') as HTMLCanvasElement
        if (trendCtx) {
            new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Green Score',
                        data: [65, 68, 72, 75, 78, 82],
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

        // Category Breakdown Chart
        const breakdownCtx = document.getElementById('categoryBreakdownChart') as HTMLCanvasElement
        if (breakdownCtx) {
            new Chart(breakdownCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Waste Management', 'Energy Efficiency', 'Sustainable Sourcing', 'Carbon Footprint'],
                    datasets: [{
                        data: [25, 30, 25, 20],
                        backgroundColor: [
                            '#10b981',
                            '#06b6d4',
                            '#8b5cf6',
                            '#f59e0b'
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

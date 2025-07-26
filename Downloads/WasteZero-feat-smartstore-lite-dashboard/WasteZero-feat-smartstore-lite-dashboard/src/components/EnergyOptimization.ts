import Chart from 'chart.js/auto'
import { DataService } from '../services/DataService'

export class EnergyOptimization {
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
        const footfallData = this.dataService.getFootfallData()
        const hourlyLabels = footfallData.map(item => `${item.hour}:00`)
        const hourlyVisits = footfallData.map(item => item.visits)

        // Persist slider value in localStorage
        let sliderValue = 50;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('offPeakSliderValue');
            if (stored) sliderValue = parseInt(stored, 10);
        }

        this.container.innerHTML = `
            <div class="full-width-container section-spacing">
                <!-- Energy Settings Slider -->
                <div class="max-w-md mx-auto mb-10 bg-white/80 rounded-xl p-6 border border-gray-200 shadow-lg">
                    <div class="flex items-center mb-4">
                        <span class="text-2xl mr-2">⚡</span>
                        <h2 class="text-xl font-bold text-gray-800">Energy Settings</h2>
                    </div>
                    <div class="flex items-center mb-2">
                        <span class="text-gray-600 mr-2">Energy: Off-Peak Reduction %</span>
                        <span class="ml-1 cursor-pointer group relative">
                            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16v-4m0-4h.01"/>
                            </svg>
                            <span class="absolute left-6 top-0 z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 border border-gray-200 shadow-lg w-48">
                                Adjust the percentage reduction in energy usage during off-peak hours. Lower values mean less reduction, higher values mean more aggressive savings.
                            </span>
                        </span>
                    </div>
                    <div class="flex items-center justify-between mt-2 mb-1">
                        <span class="text-gray-500 text-sm">10</span>
                        <span id="offPeakValue" class="text-blue-600 font-bold text-lg" style="position: absolute; left: 50%; transform: translateX(-50%);">${sliderValue}</span>
                        <span class="text-gray-500 text-sm">90</span>
                    </div>
                    <input type="range" min="10" max="90" value="${sliderValue}" id="offPeakSlider" class="w-full accent-blue-500 h-2 rounded-lg appearance-none bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" />
                </div>

                <!-- Header -->
                <div class="text-center mb-12">
                    <h1 class="text-4xl md:text-6xl font-bold text-gray-800 mb-4 floating">
                        <span class="gradient-text">Energy</span> Optimization
                    </h1>
                    <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                        Smart energy management and consumption analytics for sustainable operations
                    </p>
                </div>

                <!-- Key Metrics -->
                <div class="responsive-grid mb-12">
                    <div class="metric-card floating-delay-1">
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">Energy Consumption</h3>
                        <p class="text-3xl font-bold gradient-text">${this.getAdjustedEnergyConsumption(sliderValue)} kWh</p>
                        <p class="text-sm text-gray-500 mt-2">This month</p>
                    </div>
                    <div class="metric-card floating-delay-2">
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">Energy Savings</h3>
                        <p class="text-3xl font-bold gradient-text">${this.getAdjustedEnergySavings(sliderValue)}%</p>
                        <p class="text-sm text-gray-500 mt-2">vs last month</p>
                    </div>
                    <div class="metric-card floating">
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">Cost Reduction</h3>
                        <p class="text-3xl font-bold gradient-text">$${this.getAdjustedCostSavings(sliderValue).toLocaleString()}</p>
                        <p class="text-sm text-gray-500 mt-2">Monthly savings</p>
                    </div>
                    <div class="metric-card floating-delay-1">
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">Efficiency Score</h3>
                        <p class="text-3xl font-bold gradient-text">${this.getAdjustedEfficiencyScore(sliderValue)}/100</p>
                        <p class="text-sm text-gray-500 mt-2">Current rating</p>
                    </div>
                </div>

                <!-- Footfall Analysis -->
                <div class="chart-container mb-12">
                    <h3 class="text-2xl font-bold text-gray-900 mb-6">👟 Hourly Footfall Pattern (from Sales)</h3>
                    <div class="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                        <canvas id="footfallChart" width="400" height="300"></canvas>
                        <p class="text-gray-500 text-sm mt-4">
                            <em>Note: Footfall is estimated based on the number of sales transactions per hour.</em>
                        </p>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div class="chart-container">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">Energy Consumption Trend</h3>
                        <canvas id="energyConsumptionChart" width="400" height="300"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">Energy Usage by System</h3>
                        <canvas id="energySystemChart" width="400" height="300"></canvas>
                    </div>
                </div>

                <!-- Scheduling Recommendations -->
                <div class="chart-container mb-12">
                    <h3 class="text-2xl font-bold text-gray-800 mb-6">📅 Smart Scheduling Recommendations</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                            <h4 class="text-lg font-semibold text-gray-800 mb-4">💡 Lighting Schedule</h4>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-600">Peak Hours (9AM-6PM):</span>
                                    <span class="text-green-600 font-semibold">100% Brightness</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-600">Off-Peak (6PM-9AM):</span>
                                    <span class="text-blue-600 font-semibold">60% Brightness</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-600">Low Traffic (11PM-6AM):</span>
                                    <span class="text-purple-600 font-semibold">30% Brightness</span>
                                </div>
                            </div>
                            <div class="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                                <p class="text-green-700 text-sm">
                                    <strong>Potential Savings:</strong> $450/month by reducing lighting during low-traffic hours
                                </p>
                            </div>
                        </div>
                        
                        <div class="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                            <h4 class="text-lg font-semibold text-gray-800 mb-4">❄️ HVAC Schedule</h4>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-600">Business Hours:</span>
                                    <span class="text-green-600 font-semibold">22°C (72°F)</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-600">After Hours:</span>
                                    <span class="text-blue-600 font-semibold">18°C (65°F)</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-600">Weekends:</span>
                                    <span class="text-purple-600 font-semibold">16°C (60°F)</span>
                                </div>
                            </div>
                            <div class="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
                                <p class="text-blue-700 text-sm">
                                    <strong>Potential Savings:</strong> $320/month by optimizing temperature settings
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Optimization Strategies -->
                <div class="chart-container">
                    <h3 class="text-xl font-semibold text-gray-900 mb-6">Optimization Strategies</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                            <div class="flex items-center mb-3">
                                <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                    </svg>
                                </div>
                                <h4 class="text-lg font-bold text-gray-900">Smart Lighting</h4>
                            </div>
                            <p class="text-gray-700 text-sm">Implement motion-sensor lighting to reduce unnecessary energy usage</p>
                        </div>
                        <div class="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                            <div class="flex items-center mb-3">
                                <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 6h8"></path>
                                    </svg>
                                </div>
                                <h4 class="text-lg font-bold text-gray-900">HVAC Optimization</h4>
                            </div>
                            <p class="text-gray-700 text-sm">Optimize temperature settings based on occupancy and time</p>
                        </div>
                        <div class="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
                            <div class="flex items-center mb-3">
                                <div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <h4 class="text-lg font-bold text-gray-900">Peak Load Management</h4>
                            </div>
                            <p class="text-gray-700 text-sm">Shift non-critical operations to off-peak hours</p>
                        </div>
                    </div>
                </div>

                <!-- Energy Efficiency Tips -->
                <div class="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <h4 class="text-xl font-bold text-yellow-700 mb-3">💡 Energy Efficiency Tips</h4>
                    <ul class="text-gray-800 space-y-2 grid grid-cols-1 md:grid-cols-2">
                        <li>• Use LED lighting instead of traditional bulbs</li>
                        <li>• Install programmable thermostats</li>
                        <li>• Regular HVAC maintenance</li>
                        <li>• Optimize refrigeration settings</li>
                        <li>• Use natural light when possible</li>
                        <li>• Monitor energy consumption patterns</li>
                    </ul>
                </div>
            </div>
        `
        // Add slider event listener after rendering
        setTimeout(() => {
            const slider = document.getElementById('offPeakSlider') as HTMLInputElement;
            const valueLabel = document.getElementById('offPeakValue');
            if (slider && valueLabel) {
                slider.oninput = (e: any) => {
                    valueLabel.textContent = e.target.value;
                    localStorage.setItem('offPeakSliderValue', e.target.value);
                    // Re-render the page with the new value and redraw charts
                    this.render();
                    this.createCharts();
                };
            }
        }, 0);
        // Also call createCharts after initial render
        this.createCharts();
    }

    private createCharts(): void {
        // Footfall Chart
        const footfallCtx = document.getElementById('footfallChart') as HTMLCanvasElement
        if (footfallCtx) {
            const footfallData = this.dataService.getFootfallData()
            const hourlyLabels = footfallData.map(item => `${item.hour}:00`)
            const hourlyVisits = footfallData.map(item => item.visits)

            new Chart(footfallCtx, {
                type: 'bar',
                data: {
                    labels: hourlyLabels,
                    datasets: [{
                        label: 'Footfall (Visits)',
                        data: hourlyVisits,
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderColor: '#10b981',
                        borderWidth: 1
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

        // Energy Consumption Trend Chart
        const consumptionCtx = document.getElementById('energyConsumptionChart') as HTMLCanvasElement
        if (consumptionCtx) {
            new Chart(consumptionCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Energy Consumption (kWh)',
                        data: [4500, 4200, 4800, 4600, 4400, 4100],
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

        // Energy Usage by System Chart
        const systemCtx = document.getElementById('energySystemChart') as HTMLCanvasElement
        if (systemCtx) {
            new Chart(systemCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Lighting', 'HVAC', 'Refrigeration', 'Equipment', 'Other'],
                    datasets: [{
                        data: [25, 35, 20, 15, 5],
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
            })
        }
    }

    // Update metrics and charts to use the slider value
    private getAdjustedEnergyConsumption(sliderValue: number): number {
        // Example: reduce base consumption by the off-peak reduction percent
        const base = this.dataService.getEnergyConsumption();
        return Math.round(base * (1 - sliderValue / 200)); // 50% = 75% of base, 90% = 55%, 10% = 95%
    }
    private getAdjustedEnergySavings(sliderValue: number): number {
        // Example: savings increase with higher reduction
        return Math.round(10 + (sliderValue - 10) * 0.8); // 10% min, up to 74%
    }
    private getAdjustedCostSavings(sliderValue: number): number {
        // Example: cost savings scale with reduction
        return Math.round(1000 + (sliderValue - 10) * 30); // $1000 base, up to $3400
    }
    private getAdjustedEfficiencyScore(sliderValue: number): number {
        // Example: efficiency score increases with reduction
        return Math.round(60 + (sliderValue - 10) * 0.4); // 60 base, up to 96
    }
} 
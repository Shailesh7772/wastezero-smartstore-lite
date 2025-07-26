import { DataService } from '../services/DataService'

export class Dashboard {
    private dataService: DataService
    private container: HTMLElement
    // private isLoading = true

    constructor(container: HTMLElement) {
        this.container = container
        this.dataService = new DataService()
        this.initialize()
    }

    private async initialize(): Promise<void> {
        try {
            await this.dataService.loadData()
            this.render()
        } catch (error) {
            console.error('Failed to initialize dashboard:', error)
            this.showError('Failed to load data. Please check if the data files exist in the data directory.')
        }
    }

    render(): HTMLElement {
        this.container.innerHTML = `
            <div class="full-width-container section-spacing">
                <!-- About the App Section -->
                <div class="max-w-3xl mx-auto mb-10 p-8 rounded-2xl bg-white/80 backdrop-blur-lg border border-gray-200 shadow-xl flex flex-col items-center text-center animate-fade-in">
                    <div class="mb-4">
                        <svg class="w-16 h-16 mx-auto text-blue-600 pulse-glow" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                            <circle cx="24" cy="24" r="22" stroke-width="4" class="text-blue-600" fill="rgba(59,130,246,0.1)"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M24 34c-6-4-10-8-10-14a10 10 0 1120 0c0 6-4 10-10 14z" class="text-blue-600"/>
                        </svg>
                    </div>
                    <h2 class="text-3xl md:text-4xl font-bold gradient-text mb-2">Welcome to WasteZero SmartStore Lite</h2>
                    <p class="text-lg text-gray-700 mb-4">
                        Your all-in-one dashboard for sustainable retail management. WasteZero empowers you to reduce waste, optimize energy, and make data-driven decisions for a greener, more efficient store.
                    </p>
                    <ul class="text-gray-600 text-base mb-2 list-disc list-inside">
                        <li>AI-powered waste prediction and reduction</li>
                        <li>Smart energy optimization and cost savings</li>
                        <li>Supplier sustainability analytics</li>
                        <li>Seasonal demand forecasting</li>
                        <li>Comprehensive Green Score for your store</li>
                    </ul>
                    <p class="text-gray-500 text-sm mt-2">Start exploring the features using the navigation menu above!</p>
                </div>

                <!-- Header Section -->
                <div class="text-center mb-12">
                    <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-4 floating">
                        <span class="gradient-text">WasteZero</span> SmartStore
                    </h1>
                    <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                        Advanced analytics and optimization platform for sustainable retail operations
                    </p>
                </div>

                <!-- Key Metrics -->
                <div class="responsive-grid mb-12">
                    <div class="metric-card floating-delay-1">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Total Sales</h3>
                        <p class="text-3xl font-bold gradient-text">$${this.dataService.getTotalSales().toLocaleString()}</p>
                        <p class="text-sm text-gray-500 mt-2">+12.5% from last month</p>
                    </div>
                    <div class="metric-card floating-delay-2">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Waste Reduction</h3>
                        <p class="text-3xl font-bold gradient-text">${this.dataService.getWasteReduction()}%</p>
                        <p class="text-sm text-gray-500 mt-2">+8.3% improvement</p>
                    </div>
                    <div class="metric-card floating">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Energy Savings</h3>
                        <p class="text-3xl font-bold gradient-text">${this.dataService.getEnergySavings()}%</p>
                        <p class="text-sm text-gray-500 mt-2">+15.2% efficiency</p>
                    </div>
                    <div class="metric-card floating-delay-1">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">Green Score</h3>
                        <p class="text-3xl font-bold gradient-text">${this.dataService.getGreenScore()}/100</p>
                        <p class="text-sm text-gray-500 mt-2">Excellent rating</p>
                    </div>
                </div>

                <!-- Feature Cards -->
                <div class="responsive-grid">
                    <div class="feature-card glow" onclick="window.location.href='#waste-prediction'">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-4">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-800">Waste Prediction</h3>
                        </div>
                        <p class="text-gray-600 mb-4">AI-powered waste forecasting and optimization strategies</p>
                        <div class="flex items-center text-blue-600">
                            <span>Explore</span>
                            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </div>
                    </div>

                    <div class="feature-card glow" onclick="window.location.href='#energy-optimization'">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-800">Energy Optimization</h3>
                        </div>
                        <p class="text-gray-600 mb-4">Smart energy management and consumption analytics</p>
                        <div class="flex items-center text-blue-600">
                            <span>Explore</span>
                            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </div>
                    </div>

                    <div class="feature-card glow" onclick="window.location.href='#green-score'">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center mr-4">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-800">Green Score</h3>
                        </div>
                        <p class="text-gray-600 mb-4">Comprehensive sustainability performance tracking</p>
                        <div class="flex items-center text-green-600">
                            <span>Explore</span>
                            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </div>
                    </div>

                    <div class="feature-card glow" onclick="window.location.href='#supplier-analytics'">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-4">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-800">Supplier Analytics</h3>
                        </div>
                        <p class="text-gray-600 mb-4">Supplier performance and sustainability metrics</p>
                        <div class="flex items-center text-orange-600">
                            <span>Explore</span>
                            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </div>
                    </div>

                    <div class="feature-card glow" onclick="window.location.href='#seasonal-analytics'">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mr-4">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-800">Seasonal Analytics</h3>
                        </div>
                        <p class="text-gray-600 mb-4">Seasonal trends and demand forecasting</p>
                        <div class="flex items-center text-pink-600">
                            <span>Explore</span>
                            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </div>
                    </div>

                    <div class="feature-card glow">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-800">Smart Scheduling</h3>
                        </div>
                        <p class="text-gray-600 mb-4">AI-powered employee scheduling optimization</p>
                        <div class="flex items-center text-indigo-600">
                            <span>Coming Soon</span>
                            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        `

        // Add click handlers for navigation
        this.addNavigationHandlers()

        return this.container
    }

    private addNavigationHandlers(): void {
        const cards = this.container.querySelectorAll('.feature-card')
        cards.forEach((card, index) => {
            card.addEventListener('click', () => {
                const pages = ['waste-prediction', 'energy-optimization', 'green-score', 'supplier-analytics', 'seasonal-analytics']
                if (pages[index]) {
                    // Trigger navigation through the NavigationManager
                    const navLink = document.querySelector(`[data-page="${pages[index]}"]`)
                    if (navLink) {
                        (navLink as HTMLElement).click()
                    }
                }
            })
        })
    }

    // private createLoadingSpinner(): HTMLElement {
    //     const spinner = document.createElement('div')
    //     spinner.className = 'flex items-center justify-center min-h-screen w-full'
    //     spinner.innerHTML = `
    //         <div class="text-center">
    //             <div class="loading-spinner w-32 h-32 mb-8"></div>
    //             <h2 class="text-2xl font-bold text-gray-900 mb-4">Loading SmartStore Dashboard</h2>
    //             <p class="text-gray-700 text-lg">Analyzing your retail data...</p>
    //             <div class="mt-8 flex space-x-2 justify-center">
    //                 <div class="w-3 h-3 bg-white rounded-full animate-bounce"></div>
    //                 <div class="w-3 h-3 bg-white rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
    //                 <div class="w-3 h-3 bg-white rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
    //             </div>
    //         </div>
    //     `
    //     return spinner
    // }

    private showError(message: string): void {
        this.container.innerHTML = `
            <div class="min-h-screen flex items-center justify-center w-full">
                <div class="text-center bg-white/95 backdrop-blur-sm rounded-3xl p-12 max-w-md">
                    <div class="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">
                        🔄 Try Again
                    </button>
                </div>
            </div>
        `
    }

    // private async refreshData(): Promise<void> {
    //     this.render()
    //     
    //     try {
    //         await this.dataService.loadData()
    //         this.render()
    //     } catch (error) {
    //         console.error('Failed to refresh data:', error)
    //         this.showError('Failed to refresh data. Please try again.')
    //     }
    // }

    // private createSummary(): HTMLElement {
    //     const summary = document.createElement('section')
    //     summary.className = 'card w-full'
    //     
    //     const inventoryData = this.dataService.getInventoryData()
    //     const suppliersData = this.dataService.getSuppliersData()
    //     const salesData = this.dataService.getSalesData()
    //     const totalInventoryValue = this.dataService.getTotalInventoryValue()

    //     summary.innerHTML = `
    //         <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">📊 Dashboard Summary</h2>
    //         <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    //             <div class="metric-card">
    //                 <h3 class="text-xl font-semibold text-gray-700 mb-4">📦 Inventory Overview</h3>
    //                 <div class="space-y-4">
    //                     <div class="flex justify-between items-center">
    //                         <span class="text-gray-600">Total Products:</span>
    //                         <span class="font-bold text-2xl text-gray-900">${inventoryData.length}</span>
    //                     </div>
    //                     <div class="flex justify-between items-center">
    //                         <span class="text-gray-600">Categories:</span>
    //                         <span class="font-bold text-2xl text-gray-900">${new Set(inventoryData.map((item: any) => item.category)).size}</span>
    //                     </div>
    //                     <div class="flex justify-between items-center">
    //                         <span class="text-gray-600">Total Value:</span>
    //                         <span class="font-bold text-2xl text-green-600">$${totalInventoryValue.toLocaleString()}</span>
    //                     </div>
    //                 </div>
    //             </div>
    //             
    //             <div class="metric-card">
    //                 <h3 class="text-xl font-semibold text-gray-700 mb-4">🏭 Supplier Overview</h3>
    //                 <div class="space-y-4">
    //                     <div class="flex justify-between items-center">
    //                         <span class="text-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
    //                         </svg>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     `
    //     return summary
    // }
} 
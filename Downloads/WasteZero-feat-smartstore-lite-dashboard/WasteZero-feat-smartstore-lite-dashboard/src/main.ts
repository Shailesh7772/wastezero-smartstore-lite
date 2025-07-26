import './style.css'
import { Dashboard } from './components/Dashboard'
import { DataService } from './services/DataService'
import { WastePrediction } from './components/WastePrediction'
import { EnergyOptimization } from './components/EnergyOptimization'
import { GreenScore } from './components/GreenScore'
import { SupplierAnalytics } from './components/SupplierAnalytics'
import { SeasonalAnalytics } from './components/SeasonalAnalytics'

class NavigationManager {
    private currentPage: string = 'dashboard'

    constructor() {
        this.initializeNavigation()
        this.initializeMobileMenu()
        this.loadPage('dashboard')
    }

    private initializeNavigation(): void {
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link')
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault()
                const page = (e.target as HTMLElement).getAttribute('data-page')
                if (page) {
                    this.navigateToPage(page)
                }
            })
        })
    }

    private initializeMobileMenu(): void {
        const mobileMenuButton = document.getElementById('mobile-menu-button')
        const mobileMenu = document.getElementById('mobile-menu')

        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden')
            })

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenuButton.contains(e.target as Node) && !mobileMenu.contains(e.target as Node)) {
                    mobileMenu.classList.add('hidden')
                }
            })
        }
    }

    private navigateToPage(page: string): void {
        // Update navigation links
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            link.classList.remove('active')
            if ((link as HTMLElement).getAttribute('data-page') === page) {
                link.classList.add('active')
            }
        })

        // Hide all pages
        document.querySelectorAll('.page-content').forEach(pageEl => {
            pageEl.classList.remove('active')
        })

        // Show target page
        const targetPage = document.getElementById(`${page}-page`)
        if (targetPage) {
            targetPage.classList.add('active')
            this.currentPage = page
            this.loadPage(page)
        }

        // Close mobile menu
        const mobileMenu = document.getElementById('mobile-menu')
        if (mobileMenu) {
            mobileMenu.classList.add('hidden')
        }
    }

    private loadPage(page: string): void {
        const containerId = `${page}-container`
        const container = document.getElementById(containerId)
        
        if (!container) return

        // Clear container
        container.innerHTML = ''

        // Load appropriate component
        switch (page) {
            case 'dashboard':
                new Dashboard(container)
                break
            case 'waste-prediction':
                new WastePrediction(container)
                break
            case 'energy-optimization':
                new EnergyOptimization(container)
                break
            case 'green-score':
                new GreenScore(container)
                break
            case 'supplier-analytics':
                new SupplierAnalytics(container)
                break
            case 'seasonal-analytics':
                new SeasonalAnalytics(container)
                break
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new NavigationManager()
}) 
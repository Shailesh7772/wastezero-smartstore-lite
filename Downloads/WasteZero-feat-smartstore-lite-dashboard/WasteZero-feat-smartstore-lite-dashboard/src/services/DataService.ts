export interface InventoryItem {
    product_id: string;
    product_name: string;
    category: string;
    supplier_id: string;
    purchase_date: string;
    expiry_date: string;
    expiry_type: string;
    quantity_in_stock: number;
    cost_price: number;
    selling_price: number;
    seasonal_demand_factor: number;
    days_to_expiry?: number;
    avg_daily_sales_last_30d?: number;
    estimated_days_stock_left?: number;
    risk_score?: number;
}

export interface SalesRecord {
    product_id: string;
    timestamp: string;
    quantity_sold: number;
}

export interface Supplier {
    supplier_id: string;
    supplier_name: string;
    reliability_score: number;
    delivery_time_days: number;
    contact_email: string;
    phone: string;
}

export interface SupplierMetrics {
    supplier_id: string;
    supplier_name: string;
    total_products: number;
    total_inventory_value: number;
    expiry_risk_value: number;
    reliability_score: number;
    risk_score: number;
}

export class DataService {
    private inventoryData: InventoryItem[] = [];
    private salesData: SalesRecord[] = [];
    private suppliersData: Supplier[] = [];

    async loadData(): Promise<void> {
        try {
            // Load data from CSV files
            this.inventoryData = await this.loadCSV('data/inventory.csv');
            this.salesData = await this.loadCSV('data/sales.csv');
            this.suppliersData = await this.loadCSV('data/suppliers.csv');
        } catch (error) {
            console.error('Error loading data:', error);
            // Generate sample data if files don't exist
            this.generateSampleData();
        }
    }

    private async loadCSV(filePath: string): Promise<any[]> {
        try {
            const response = await fetch(filePath);
            const csvText = await response.text();
            return this.parseCSV(csvText);
        } catch (error) {
            console.warn(`Could not load ${filePath}, using sample data`);
            return [];
        }
    }

    private parseCSV(csvText: string): any[] {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        return lines.slice(1).map(line => {
            const values = line.split(',');
            const obj: any = {};
            headers.forEach((header, index) => {
                obj[header.trim()] = values[index]?.trim() || '';
            });
            return obj;
        });
    }

    private generateSampleData(): void {
        // Generate sample inventory data
        this.inventoryData = [
            {
                product_id: '1',
                product_name: 'Milk',
                category: 'Dairy',
                supplier_id: '1',
                purchase_date: '2024-01-15',
                expiry_date: '2024-02-15',
                expiry_type: 'Perishable',
                quantity_in_stock: 50,
                cost_price: 2.5,
                selling_price: 3.99,
                seasonal_demand_factor: 1.2
            },
            {
                product_id: '2',
                product_name: 'Bread',
                category: 'Bakery',
                supplier_id: '2',
                purchase_date: '2024-01-10',
                expiry_date: '2024-02-10',
                expiry_type: 'Perishable',
                quantity_in_stock: 30,
                cost_price: 1.5,
                selling_price: 2.49,
                seasonal_demand_factor: 1.0
            },
            {
                product_id: '3',
                product_name: 'Apples',
                category: 'Produce',
                supplier_id: '3',
                purchase_date: '2024-01-20',
                expiry_date: '2024-02-20',
                expiry_type: 'Perishable',
                quantity_in_stock: 100,
                cost_price: 1.2,
                selling_price: 1.99,
                seasonal_demand_factor: 1.5
            },
            {
                product_id: '4',
                product_name: 'Chicken',
                category: 'Meat',
                supplier_id: '4',
                purchase_date: '2024-01-08',
                expiry_date: '2024-02-08',
                expiry_type: 'Perishable',
                quantity_in_stock: 25,
                cost_price: 6.5,
                selling_price: 8.99,
                seasonal_demand_factor: 1.1
            },
            {
                product_id: '5',
                product_name: 'Rice',
                category: 'Pantry',
                supplier_id: '5',
                purchase_date: '2024-01-01',
                expiry_date: '2024-12-31',
                expiry_type: 'Non-perishable',
                quantity_in_stock: 40,
                cost_price: 3.5,
                selling_price: 4.99,
                seasonal_demand_factor: 0.9
            }
        ];

        // Generate sample sales data
        this.salesData = [
            { product_id: '1', timestamp: '2024-02-01T10:30:00', quantity_sold: 2 },
            { product_id: '2', timestamp: '2024-02-01T11:15:00', quantity_sold: 1 },
            { product_id: '3', timestamp: '2024-02-02T09:45:00', quantity_sold: 3 },
            { product_id: '4', timestamp: '2024-02-02T14:20:00', quantity_sold: 1 },
            { product_id: '5', timestamp: '2024-02-03T16:10:00', quantity_sold: 2 }
        ];

        // Generate sample suppliers data
        this.suppliersData = [
            {
                supplier_id: '1',
                supplier_name: 'Fresh Farms Co.',
                reliability_score: 4.8,
                delivery_time_days: 2,
                contact_email: 'contact@freshfarms.com',
                phone: '+1-555-0101'
            },
            {
                supplier_id: '2',
                supplier_name: 'Dairy Delights',
                reliability_score: 4.6,
                delivery_time_days: 1,
                contact_email: 'orders@dairydelights.com',
                phone: '+1-555-0102'
            },
            {
                supplier_id: '3',
                supplier_name: 'Bakery Fresh',
                reliability_score: 4.5,
                delivery_time_days: 1,
                contact_email: 'sales@bakeryfresh.com',
                phone: '+1-555-0103'
            },
            {
                supplier_id: '4',
                supplier_name: 'Meat Masters',
                reliability_score: 4.3,
                delivery_time_days: 3,
                contact_email: 'info@meatmasters.com',
                phone: '+1-555-0104'
            },
            {
                supplier_id: '5',
                supplier_name: 'Pantry Plus',
                reliability_score: 4.1,
                delivery_time_days: 5,
                contact_email: 'orders@pantryplus.com',
                phone: '+1-555-0105'
            }
        ];
    }

    // Dashboard methods
    getTotalSales(): number {
        // Calculate total sales by matching sales records with inventory items
        return this.salesData.reduce((total, sale) => {
            const inventoryItem = this.inventoryData.find(item => item.product_id === sale.product_id);
            if (inventoryItem) {
                return total + (sale.quantity_sold * inventoryItem.selling_price);
            }
            return total;
        }, 0);
    }

    getWasteReduction(): number {
        return 85; // Sample data
    }

    getEnergySavings(): number {
        return 92; // Sample data
    }

    getGreenScore(): number {
        return 82; // Sample data
    }

    // Waste Prediction methods
    getPredictedWaste(): number {
        return 125; // Sample data in kg
    }

    getPredictionAccuracy(): number {
        return 94; // Sample data in percentage
    }

    getWasteCostSavings(): number {
        return 2500; // Sample data in dollars
    }

    getWasteOptimizationScore(): number {
        return 78; // Sample data out of 100
    }

    // Energy Optimization methods
    getEnergyConsumption(): number {
        return 4100; // Sample data in kWh
    }

    getEnergyCostSavings(): number {
        return 1800; // Sample data in dollars
    }

    getEnergyEfficiencyScore(): number {
        return 88; // Sample data out of 100
    }

    // Green Score methods
    getWasteScore(): number {
        return 85; // Sample data out of 100
    }

    getEnergyScore(): number {
        return 88; // Sample data out of 100
    }

    getSourcingScore(): number {
        return 82; // Sample data out of 100
    }

    getCarbonScore(): number {
        return 75; // Sample data out of 100
    }

    // Supplier Analytics methods
    getSupplierCount(): number {
        return this.suppliersData.length;
    }

    getSustainableSupplierCount(): number {
        return this.suppliersData.filter(supplier => supplier.reliability_score >= 4.0).length;
    }

    getAverageSupplierRating(): number {
        const totalRating = this.suppliersData.reduce((sum, supplier) => sum + supplier.reliability_score, 0);
        return Math.round((totalRating / this.suppliersData.length) * 10) / 10;
    }

    getOnTimeDeliveryRate(): number {
        return 96; // Sample data in percentage
    }

    // Seasonal Analytics methods
    getPeakSeason(): string {
        return 'Summer'; // Sample data
    }

    getSeasonalGrowth(): number {
        return 35; // Sample data in percentage
    }

    getForecastAccuracy(): number {
        return 91; // Sample data in percentage
    }

    getInventoryTurnover(): number {
        return 12; // Sample data - annual cycles
    }

    // Legacy methods for compatibility
    getInventoryData(): InventoryItem[] {
        return this.inventoryData;
    }

    getSalesData(): SalesRecord[] {
        return this.salesData;
    }

    getSuppliersData(): Supplier[] {
        return this.suppliersData;
    }

    getFootfallData(): { hour: number; visits: number }[] {
        // Generate sample footfall data based on sales
        const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
            hour,
            visits: Math.floor(Math.random() * 50) + 10
        }));
        return hourlyData;
    }

    getAtRiskProducts() {
        // Return mock at-risk products
        return [
            { name: 'Milk', risk: 'High' },
            { name: 'Bread', risk: 'Medium' },
        ];
    }

    // Enhanced methods for detailed expiry information
    getExpiringProducts(): InventoryItem[] {
        const today = new Date();
        return this.inventoryData
            .map(item => {
                const expiryDate = new Date(item.expiry_date);
                const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return {
                    ...item,
                    days_to_expiry: daysToExpiry
                };
            })
            .filter(item => item.days_to_expiry <= 30)
            .sort((a, b) => (a.days_to_expiry || 0) - (b.days_to_expiry || 0));
    }

    getCriticalExpiringProducts(): InventoryItem[] {
        return this.getExpiringProducts().filter(item => (item.days_to_expiry || 0) <= 7);
    }

    getHighStockRiskProducts(): InventoryItem[] {
        return this.inventoryData.filter(item => item.quantity_in_stock > 100);
    }

    getZeroSalesProducts(): InventoryItem[] {
        // Mock implementation - in real app this would check sales data
        return this.inventoryData.slice(0, 3).map(item => ({
            ...item,
            avg_daily_sales_last_30d: 0
        }));
    }

    getExpiryThresholds(): { [key: string]: number } {
        return {
            'Shelf Life': 7,
            'Expiration Date': 7,
            'Warranty Period': 90,
            'Fashion Season': 90,
            'Quality Period': 180,
            'Obsolescence': 180,
            'Wear Period': 180
        };
    }

    getPredictedWasteValue(): number {
        const expiringProducts = this.getExpiringProducts();
        return expiringProducts.reduce((total, item) => {
            return total + (item.cost_price * item.quantity_in_stock);
        }, 0);
    }

    getTotalItemsAtRisk(): number {
        return this.getExpiringProducts().reduce((total, item) => total + item.quantity_in_stock, 0);
    }

    getTotalInventoryValue(): number {
        return this.inventoryData.reduce((total, item) => total + (item.quantity_in_stock * item.cost_price), 0);
    }

    getSupplierMetrics() {
        // Return mock supplier metrics
        return [
            { risk_score: 80 },
            { risk_score: 60 },
            { risk_score: 90 },
        ];
    }
} 
# WasteZero SmartStore Lite Dashboard

A comprehensive full-stack retail analytics platform that combines React frontend with Python backend to provide AI-powered waste prediction, energy optimization, and sustainable retail management.

## 🚀 Features

### Frontend (React + TypeScript)
- **Interactive Dashboard**: Real-time metrics and analytics visualization
- **Waste Prediction**: AI-powered forecasting to minimize waste and optimize inventory
- **Energy Optimization**: Smart energy management with interactive controls
- **Green Score**: Comprehensive sustainability performance tracking
- **Supplier Analytics**: Supplier performance and sustainability metrics
- **Seasonal Analytics**: Seasonal trends and demand forecasting
- **Responsive Design**: Modern UI with Tailwind CSS

### Backend (Python)
- **Data Processing**: CSV data handling and analysis
- **AI Models**: Machine learning for waste prediction
- **Analytics Engine**: Comprehensive business intelligence
- **API Ready**: Flask/FastAPI integration ready

## 🛠️ Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Chart.js** for data visualization
- **Custom Data Service** for state management

### Backend
- **Python 3.8+**
- **Pandas** for data manipulation
- **NumPy** for numerical computations
- **Scikit-learn** for machine learning
- **Flask/FastAPI** (ready for API implementation)

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Git

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run Python scripts
python app.py
```

## 🚀 Quick Start

1. **Clone the repository**
```bash
   git clone https://github.com/yourusername/wastezero-smartstore-lite.git
   cd wastezero-smartstore-lite
```

2. **Install dependencies**
```bash
   # Frontend
   npm install
   
   # Backend
pip install -r requirements.txt
```

3. **Start the development server**
```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
WasteZero-feat-smartstore-lite-dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.ts
│   │   ├── WastePrediction.ts
│   │   ├── EnergyOptimization.ts
│   │   ├── GreenScore.ts
│   │   ├── SupplierAnalytics.ts
│   │   └── SeasonalAnalytics.ts
│   ├── services/           # Data services
│   │   └── DataService.ts
│   ├── main.ts            # App entry point
│   └── style.css          # Global styles
├── data/                  # CSV data files
│   ├── inventory.csv
│   ├── sales.csv
│   ├── suppliers.csv
│   └── employee_schedules.csv
├── utils/                 # Python utilities
│   ├── waste_prediction.py
│   ├── energy_optimization.py
│   ├── seasonal_analytics.py
│   ├── supplier_analytics.py
│   └── greenscore.py
├── model/                 # ML models
│   └── train_model.py
├── app.py                 # Main Python app
├── requirements.txt       # Python dependencies
├── package.json          # Node.js dependencies
└── README.md
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
# API Configuration
API_BASE_URL=http://localhost:5000
NODE_ENV=development

# Data Configuration
DATA_PATH=./data
```

## 📊 Data Sources

The application uses CSV data files for demonstration:
- `inventory.csv`: Product inventory data
- `sales.csv`: Sales transaction data
- `suppliers.csv`: Supplier information
- `employee_schedules.csv`: Employee scheduling data

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
# Build the project
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod
```

### Backend Deployment (Heroku/Railway)
```bash
# Create Procfile
echo "web: python app.py" > Procfile

# Deploy to Heroku
heroku create
git push heroku main
```

### Docker Deployment
```bash
# Build and run with Docker
docker build -t wastezero-dashboard .
docker run -p 3000:3000 wastezero-dashboard
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React and TypeScript community
- Tailwind CSS for the beautiful UI components
- Chart.js for data visualization
- Python data science ecosystem

## 📞 Support

For support, email support@wastezero.com or create an issue in this repository.

---

**Built with ❤️ for sustainable retail management**

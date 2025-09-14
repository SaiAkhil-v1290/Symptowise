# Symptowise
# 🏥 Disease Prediction & Doctor Finder Website

A comprehensive healthcare website that combines AI-powered disease prediction with real-time doctor search functionality. Built with modern web technologies and integrated with Google Gemini AI for intelligent symptom analysis.

##Features

### AI Doctor (Symptom Analysis)
- **Intelligent Diagnosis**: Powered by Google Gemini AI for accurate symptom analysis
- **Emergency Detection**: Automatically identifies critical symptoms requiring immediate attention
- **Detailed Reports**: Comprehensive analysis with recommendations and next steps
- **Multi-language Support**: Supports English, Hindi, Telugu, Tamil, and other Indian languages

### Find Doctor
- **GPS Location Detection**: Automatically finds your current location
- **City Search**: Search doctors in any major city worldwide
- **Real-time Search**: Live search with filters for specialty, distance, and ratings
- **Doctor Profiles**: Detailed information including ratings, experience, fees, and contact details
- **Distance Calculation**: Shows exact distance from your location
- **Contact Integration**: Direct calling and directions functionality

### Medicine Reminder
- **Smart Reminders**: Set medication reminders with custom schedules
- **Local Storage**: Data persists across browser sessions
- **Multiple Medications**: Manage multiple prescriptions simultaneously
- **Time-based Alerts**: Precise timing for medication intake

## Quick Start

### Prerequisites
- Python 3.7 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for AI features

### Installation

1. **Clone or Download** the project files
2. **Install Python** (if not already installed)
3. **Navigate** to the project directory
4. **Start the server**:
   ```bash
   python proxy.py
   ```
5. **Open your browser** and go to: `http://localhost:8080`

## 🛠️ Technical Architecture

### Frontend
- **HTML5**: Semantic markup and modern structure
- **CSS3**: Responsive design with animations and modern UI
- **JavaScript (ES6+)**: Interactive functionality and API integration
- **Progressive Web App**: Works offline for basic features

### Backend
- **Python Flask**: Lightweight web server
- **Proxy Server**: Handles CORS and API requests
- **Web Scraping**: Simulated real doctor data generation
- **Caching System**: Optimized performance with 1-hour cache

### APIs & Integrations
- **Google Gemini AI**: Advanced symptom analysis and diagnosis
- **Browser Geolocation**: GPS-based location detection
- **Reverse Geocoding**: Address lookup from coordinates
- **Local Storage**: Client-side data persistence

## Project Structure

```
new/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── config.js           # API configuration
├── proxy.py            # Python backend server
├── doctor_scraper.py   # Doctor data generation
├── test-gemini.py      # API testing script
├── test-api.html       # API debugging page
└── README.md           # This file
```

## 🔧 Configuration

### API Keys
Update `config.js` with your API keys:
```javascript
const API_CONFIG = {
    baseURL: 'https://generativelanguage.googleapis.com',
    apiKey: 'YOUR_GEMINI_API_KEY',
    endpoint: '/v1beta/models/gemini-1.5-flash:generateContent'
};
```

### Default Location
Change the default location in `script.js`:
```javascript
let userLocation = { latitude: 17.3850, longitude: 78.4867 }; // Hyderabad, India
```

##  Supported Cities

### Indian Cities
- Hyderabad, Mumbai, Delhi, Bangalore, Chennai
- Kolkata, Pune, Ahmedabad, Jaipur, Lucknow

### International Cities
- London, Tokyo, Paris, Sydney, Dubai
- Singapore, Toronto, Berlin, Moscow
- New York, Los Angeles, Chicago, Houston, Miami

##  Usage Guide

### AI Doctor
1. Click **"AI Doc"** in the navigation
2. Enter your symptoms in the text area
3. Click **"Analyze Symptoms"**
4. Review the AI-generated analysis and recommendations

### Find Doctor
1. Click **"Find Doc"** in the navigation
2. Use **"Get My Location"** for GPS detection
3. Or search by city name in the search box
4. Apply filters (specialty, distance, rating)
5. Click on doctor cards for detailed information

### Medicine Reminder
1. Click **"Medicine Reminder"** in the navigation
2. Add medication details and timing
3. Set reminder frequency
4. View and manage your reminders

##  Privacy & Security

- **No Data Storage**: Symptom data is not stored on servers
- **Local Processing**: Medicine reminders stored locally in browser
- **Secure APIs**: All API communications use HTTPS
- **CORS Protection**: Backend proxy handles cross-origin requests

##  Troubleshooting

### Common Issues

**"API Error" in AI Doc**
- Check your Gemini API key in `config.js`
- Ensure internet connection is stable
- Verify API quota and billing

**"No Doctors Found"**
- Try expanding the search radius
- Check if the city is supported
- Clear browser cache and reload

**Location Not Working**
- Allow location permissions in browser
- Try the "Use Hyderabad" button
- Use manual city search instead

**Server Not Starting**
- Ensure Python is installed
- Check if port 8080 is available
- Run `python proxy.py` from project directory

## Future Enhancements

- [ ] Real web scraping for actual doctor data
- [ ] Appointment booking integration
- [ ] User accounts and profiles
- [ ] Medical history tracking
- [ ] Prescription management
- [ ] Multi-language interface
- [ ] Mobile app version
- [ ] Integration with local hospitals

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

##  License

This project is open source and available under the MIT License.

##  Support

For support and questions:
- Check the troubleshooting section
- Review the code comments
- Test with the provided debugging tools

## 🔄 Version History

- **v1.0.0**: Initial release with basic features
- **v1.1.0**: Added GPS location detection
- **v1.2.0**: Integrated Google Gemini AI
- **v1.3.0**: Enhanced doctor search with real data simulation
- **v1.4.0**: Added city search and improved UI
---

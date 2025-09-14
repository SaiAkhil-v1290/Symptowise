// Global variables
let reminders = [];
let currentReminderId = 0;
let userLocation = null;
let currentDoctors = [];
let currentSearchCity = '';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadReminders();
});

// Initialize app functionality
function initializeApp() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }

    // Navigation functionality
    setupNavigation();
    
    // Medicine reminder form
    setupReminderForm();
    
    // Find Doc functionality
    setupFindDoc();
    
    // Auto-search with Hyderabad as default
    setTimeout(() => {
        if (window.location.hash === '#find-doc' || window.location.hash === '') {
            searchWithDefaultLocation();
        }
    }, 1000);
    
    // Check for active reminders
    checkReminders();
    
    // Check reminders every minute
    setInterval(checkReminders, 60000);
}

// Navigation functionality
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('href').substring(1);
            showPage(targetPage);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Show specific page
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update URL hash
    window.location.hash = pageId;
}

// AI Doctor functionality
async function analyzeSymptoms() {
    const symptomsInput = document.getElementById('symptoms-input');
    const symptoms = symptomsInput.value.trim();
    
    if (!symptoms) {
        showNotification('Please describe your symptoms first!');
        return;
    }
    
    try {
        // Show loading state
        const analyzeBtn = document.querySelector('.btn-primary');
        const originalText = analyzeBtn.innerHTML;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        analyzeBtn.disabled = true;
        
        // Call actual API
        const analysis = await callSymptomAnalysisAPI(symptoms);
        
        // Display results
        displayAnalysisResult(analysis);
        
        // Reset button
        analyzeBtn.innerHTML = originalText;
        analyzeBtn.disabled = false;
        
    } catch (error) {
        console.error('Analysis error:', error);
        showNotification('API Error: Unable to analyze symptoms. Please check your internet connection and try again.');
        
        // Reset button
        const analyzeBtn = document.querySelector('.btn-primary');
        analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Symptoms';
        analyzeBtn.disabled = false;
    }
}

// API Configuration is now loaded from config.js

// Call symptom analysis via proxy server (to avoid CORS issues)
async function callSymptomAnalysisAPI(symptoms) {
    try {
        console.log('Making API request to proxy server with symptoms:', symptoms);

        const response = await fetch('/api/analyze-symptoms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                symptoms: symptoms
            })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const analysisResult = await response.json();
        console.log('Analysis result:', analysisResult);
        
        // Validate and return the analysis
        return {
            severity: analysisResult.severity || 'medium',
            analysis: analysisResult.analysis || 'Analysis completed by AI.',
            recommendations: Array.isArray(analysisResult.recommendations) 
                ? analysisResult.recommendations 
                : ['Please consult a healthcare professional'],
            isEmergency: Boolean(analysisResult.isEmergency)
        };

    } catch (error) {
        console.error('API call failed:', error);
        throw error; // Let the calling function handle the error
    }
}

// No fallback - using only Gemini API

// Display analysis result
function displayAnalysisResult(result) {
    const resultDiv = document.getElementById('analysis-result');
    const severityLevel = document.getElementById('severity-level');
    const analysisText = document.getElementById('analysis-text');
    const recommendationsList = document.getElementById('recommendations-list');
    const emergencyAlert = document.getElementById('emergency-alert');
    
    // Update severity badge
    severityLevel.textContent = result.severity.toUpperCase();
    severityLevel.className = `severity-badge severity-${result.severity}`;
    
    // Update analysis text
    analysisText.textContent = result.analysis;
    
    // Update recommendations
    recommendationsList.innerHTML = '';
    result.recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        recommendationsList.appendChild(li);
    });
    
    // Show/hide emergency alert
    if (result.isEmergency) {
        emergencyAlert.classList.remove('hidden');
    } else {
        emergencyAlert.classList.add('hidden');
    }
    
    // Show result
    resultDiv.classList.remove('hidden');
    
    // Scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// Clear input
function clearInput() {
    document.getElementById('symptoms-input').value = '';
    document.getElementById('analysis-result').classList.add('hidden');
}

// Medicine Reminder functionality
function setupReminderForm() {
    const form = document.getElementById('reminder-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            addReminder();
        });
    }
}

function addReminder() {
    const medicineName = document.getElementById('medicine-name').value;
    const dosage = document.getElementById('dosage').value;
    const reminderTime = document.getElementById('reminder-time').value;
    const frequency = document.getElementById('frequency').value;
    
    if (!medicineName || !dosage || !reminderTime) {
        showNotification('Please fill in all required fields!');
        return;
    }
    
    const reminder = {
        id: currentReminderId++,
        medicineName,
        dosage,
        time: reminderTime,
        frequency,
        createdAt: new Date().toISOString()
    };
    
    reminders.push(reminder);
    saveReminders();
    displayReminders();
    
    // Clear form
    document.getElementById('reminder-form').reset();
    
    showNotification(`Reminder added for ${medicineName} at ${reminderTime}`);
}

function displayReminders() {
    const remindersList = document.getElementById('reminders-list');
    
    if (reminders.length === 0) {
        remindersList.innerHTML = `
            <div class="no-reminders">
                <i class="fas fa-bell-slash"></i>
                <p>No reminders set yet. Add your first reminder above!</p>
            </div>
        `;
        return;
    }
    
    remindersList.innerHTML = reminders.map(reminder => `
        <div class="reminder-item">
            <h4>${reminder.medicineName}</h4>
            <div class="reminder-details">
                <strong>Dosage:</strong> ${reminder.dosage}<br>
                <strong>Time:</strong> ${formatTime(reminder.time)}<br>
                <strong>Frequency:</strong> ${formatFrequency(reminder.frequency)}
            </div>
            <div class="reminder-actions">
                <button class="btn btn-small btn-primary" onclick="editReminder(${reminder.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-small btn-danger" onclick="deleteReminder(${reminder.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function deleteReminder(id) {
    if (confirm('Are you sure you want to delete this reminder?')) {
        reminders = reminders.filter(r => r.id !== id);
        saveReminders();
        displayReminders();
        showNotification('Reminder deleted successfully!');
    }
}

function editReminder(id) {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
        document.getElementById('medicine-name').value = reminder.medicineName;
        document.getElementById('dosage').value = reminder.dosage;
        document.getElementById('reminder-time').value = reminder.time;
        document.getElementById('frequency').value = reminder.frequency;
        
        // Delete the original reminder
        deleteReminder(id);
        
        // Scroll to form
        document.getElementById('medicine-name').scrollIntoView({ behavior: 'smooth' });
    }
}

function checkReminders() {
    const now = new Date();
    const currentTime = formatTime(now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'));
    
    reminders.forEach(reminder => {
        const reminderTime = formatTime(reminder.time);
        
        // Check if it's time for this reminder (within 1 minute)
        if (Math.abs(getTimeDifference(reminderTime, currentTime)) <= 1) {
            showMedicineReminder(reminder);
        }
    });
}

function showMedicineReminder(reminder) {
    // Check if notification permission is granted
    if (Notification.permission === 'granted') {
        new Notification(`Time for ${reminder.medicineName}`, {
            body: `Take ${reminder.dosage} now`,
            icon: '/favicon.ico'
        });
    }
    
    // Show in-app notification
    showNotification(`⏰ Time to take ${reminder.medicineName}: ${reminder.dosage}`);
    
    // Play sound (if supported)
    playNotificationSound();
}

function playNotificationSound() {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Utility functions
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function formatFrequency(frequency) {
    const frequencyMap = {
        'once': 'One time only',
        'daily': 'Every day',
        'twice': 'Twice daily',
        'three': 'Three times daily',
        'weekly': 'Once a week'
    };
    return frequencyMap[frequency] || frequency;
}

function getTimeDifference(time1, time2) {
    const [h1, m1] = time1.split(':');
    const [h2, m2] = time2.split(':');
    return (parseInt(h1) * 60 + parseInt(m1)) - (parseInt(h2) * 60 + parseInt(m2));
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    notificationText.textContent = message;
    notification.classList.remove('hidden');
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 300);
    }, 3000);
}

// Local storage functions
function saveReminders() {
    localStorage.setItem('healthAI_reminders', JSON.stringify(reminders));
}

function loadReminders() {
    const saved = localStorage.getItem('healthAI_reminders');
    if (saved) {
        reminders = JSON.parse(saved);
        displayReminders();
        
        // Update current reminder ID
        if (reminders.length > 0) {
            currentReminderId = Math.max(...reminders.map(r => r.id)) + 1;
        }
    }
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Initialize notification permission on page load
document.addEventListener('DOMContentLoaded', function() {
    requestNotificationPermission();
});

// Handle page hash changes
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        showPage(hash);
        
        // Update active nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`[href="#${hash}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
});

// Load page based on hash on initial load
document.addEventListener('DOMContentLoaded', function() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        showPage(hash);
        
        // Update active nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`[href="#${hash}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
});

// ==================== FIND DOC FUNCTIONALITY ====================

// Setup Find Doc functionality
function setupFindDoc() {
    // Get location button
    const getLocationBtn = document.getElementById('get-location-btn');
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', getCurrentLocation);
    }
    
    // Search button
    const searchBtn = document.querySelector('#find-doc .btn-primary');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchDoctors);
    }
    
    // Search input enter key
    const searchInput = document.getElementById('doctor-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchDoctors();
            }
        });
    }
    
    // Filter change events
    const filters = document.querySelectorAll('#find-doc select');
    filters.forEach(filter => {
        filter.addEventListener('change', searchDoctors);
    });
}

// Get user's current location
function getCurrentLocation() {
    const getLocationBtn = document.getElementById('get-location-btn');
    const locationDetails = document.getElementById('location-details');
    
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by this browser. Using default location instead.');
        searchWithDefaultLocation();
        return;
    }
    
    getLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Location...';
    getLocationBtn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            
            // Get address from coordinates
            getAddressFromCoordinates(userLocation.latitude, userLocation.longitude);
            
            // Show location details
            locationDetails.classList.remove('hidden');
            
            // Update button
            getLocationBtn.innerHTML = '<i class="fas fa-check"></i> Location Found';
            getLocationBtn.disabled = false;
            
            // Auto-search for doctors
            searchDoctors();
        },
        function(error) {
            console.error('Geolocation error:', error);
            let errorMessage = 'Unable to get your location. ';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Location access denied. Using default location instead.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location unavailable. Using default location instead.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Location request timed out. Using default location instead.';
                    break;
                default:
                    errorMessage += 'Using default location instead.';
                    break;
            }
            
            showNotification(errorMessage);
            
            // Reset button and use default location
            getLocationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Get My Location';
            getLocationBtn.disabled = false;
            
            // Automatically use default location as fallback
            setTimeout(() => {
                searchWithDefaultLocation();
            }, 2000);
        },
        {
            enableHighAccuracy: true,   // Try high accuracy first
            timeout: 10000,             // 10 seconds timeout
            maximumAge: 300000          // 5 minutes cache
        }
    );
}

// Get address from coordinates using reverse geocoding
async function getAddressFromCoordinates(lat, lon) {
    try {
        // Using a free reverse geocoding service
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const data = await response.json();
        
        const address = data.localityInfo?.administrative?.[0]?.name || 'Unknown Location';
        const coordinates = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        
        document.getElementById('user-address').textContent = address;
        document.getElementById('user-coordinates').textContent = coordinates;
        
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        document.getElementById('user-address').textContent = 'Location found';
        document.getElementById('user-coordinates').textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
}

// Search for doctors
async function searchDoctors() {
    if (!userLocation) {
        // Use default location if GPS is not available
        userLocation = {
            latitude: 17.3850,  // Hyderabad, Telangana, India
            longitude: 78.4867
        };
        showNotification('Using default location (Hyderabad, India). Click "Get My Location" for your actual location.');
    }
    
    const searchTerm = document.getElementById('doctor-search').value;
    const specialty = document.getElementById('specialty-filter').value;
    const maxDistance = parseInt(document.getElementById('distance-filter').value);
    const minRating = parseFloat(document.getElementById('rating-filter').value) || 0;
    
    // Show loading state
    showLoadingState(true);
    
    try {
        const response = await fetch('/api/search-doctors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                specialty: specialty,
                max_distance: maxDistance,
                min_rating: minRating,
                search_term: searchTerm,
                search_city: currentSearchCity || ''
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentDoctors = data.doctors;
            displayDoctors(data.doctors);
            updateResultsCount(data.count);
        } else {
            showNotification('Error searching for doctors: ' + data.error);
            displayNoResults();
        }
        
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Error searching for doctors. Please try again.');
        displayNoResults();
    } finally {
        showLoadingState(false);
    }
}

// Display doctors in the results
function displayDoctors(doctors) {
    const doctorsList = document.getElementById('doctors-list');
    const noResults = document.getElementById('no-results');
    const resultsSection = document.getElementById('doctor-results');
    
    if (doctors.length === 0) {
        displayNoResults();
        return;
    }
    
    // Hide no results, show results
    noResults.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    
    // Generate doctor cards
    doctorsList.innerHTML = doctors.map(doctor => createDoctorCard(doctor)).join('');
}

// Create a doctor card HTML
function createDoctorCard(doctor) {
    const stars = '★'.repeat(Math.floor(doctor.rating)) + '☆'.repeat(5 - Math.floor(doctor.rating));
    const availabilityClass = doctor.availability.toLowerCase();
    
    return `
        <div class="doctor-card" data-doctor-id="${doctor.id}">
            <div class="doctor-header">
                <div>
                    <h4 class="doctor-name">${doctor.name}</h4>
                    <p class="doctor-specialty">${doctor.specialty}</p>
                    <div class="doctor-rating">
                        <span class="stars">${stars}</span>
                        <span class="rating-text">${doctor.rating} (${doctor.review_count} reviews)</span>
                    </div>
                </div>
                <div class="distance-badge">${doctor.distance} km</div>
            </div>
            
            <div class="doctor-details">
                <p><i class="fas fa-hospital"></i> ${doctor.hospital}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${doctor.address}</p>
                <p><i class="fas fa-phone"></i> ${doctor.phone}</p>
                <p><i class="fas fa-clock"></i> 
                    <span class="availability ${availabilityClass}">${doctor.availability}</span>
                </p>
                <p><i class="fas fa-dollar-sign"></i> Consultation: $${doctor.consultation_fee}</p>
                <p><i class="fas fa-graduation-cap"></i> ${doctor.experience_years} years experience</p>
            </div>
            
            <div class="doctor-actions">
                <button class="btn-small btn-call" onclick="callDoctor('${doctor.phone}')">
                    <i class="fas fa-phone"></i> Call
                </button>
                <button class="btn-small btn-directions" onclick="getDirections(${doctor.latitude}, ${doctor.longitude})">
                    <i class="fas fa-directions"></i> Directions
                </button>
                <button class="btn-small btn-book" onclick="bookAppointment('${doctor.id}')">
                    <i class="fas fa-calendar-plus"></i> Book
                </button>
            </div>
        </div>
    `;
}

// Display no results
function displayNoResults() {
    const doctorsList = document.getElementById('doctors-list');
    const noResults = document.getElementById('no-results');
    const resultsSection = document.getElementById('doctor-results');
    
    doctorsList.innerHTML = '';
    resultsSection.classList.add('hidden');
    noResults.classList.remove('hidden');
}

// Update results count
function updateResultsCount(count) {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = count;
    }
}

// Show/hide loading state
function showLoadingState(show) {
    const loadingSection = document.getElementById('search-loading');
    const resultsSection = document.getElementById('doctor-results');
    const noResults = document.getElementById('no-results');
    
    if (show) {
        loadingSection.classList.remove('hidden');
        resultsSection.classList.add('hidden');
        noResults.classList.add('hidden');
    } else {
        loadingSection.classList.add('hidden');
    }
}

// Call doctor
function callDoctor(phoneNumber) {
    if (confirm(`Call ${phoneNumber}?`)) {
        window.open(`tel:${phoneNumber}`, '_self');
    }
}

// Get directions to doctor
function getDirections(lat, lon) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    window.open(url, '_blank');
}

// Book appointment
function bookAppointment(doctorId) {
    const doctor = currentDoctors.find(d => d.id === doctorId);
    if (doctor) {
        showNotification(`Booking appointment with ${doctor.name}... (Feature coming soon!)`);
        // In a real implementation, this would open a booking modal or redirect to booking system
    }
}

// Search with default location (Hyderabad)
function searchWithDefaultLocation() {
    userLocation = {
        latitude: 17.3850,  // Hyderabad, Telangana, India
        longitude: 78.4867
    };
    
    // Update location display
    document.getElementById('user-address').textContent = 'Hyderabad, Telangana, India (500090)';
    document.getElementById('user-coordinates').textContent = '17.3850, 78.4867';
    document.getElementById('location-details').classList.remove('hidden');
    
    showNotification('Searching doctors in Hyderabad, India...');
    searchDoctors();
}

// Search by city name
function searchByCity() {
    const cityInput = document.getElementById('city-input');
    const city = cityInput.value.trim();
    
    if (!city) {
        showNotification('Please enter a city name!');
        return;
    }
    
    // Common city coordinates
    const cityCoordinates = {
        'hyderabad': { lat: 17.3850, lon: 78.4867, name: 'Hyderabad, Telangana, India' },
        'mumbai': { lat: 19.0760, lon: 72.8777, name: 'Mumbai, Maharashtra, India' },
        'delhi': { lat: 28.7041, lon: 77.1025, name: 'Delhi, India' },
        'bangalore': { lat: 12.9716, lon: 77.5946, name: 'Bangalore, Karnataka, India' },
        'chennai': { lat: 13.0827, lon: 80.2707, name: 'Chennai, Tamil Nadu, India' },
        'kolkata': { lat: 22.5726, lon: 88.3639, name: 'Kolkata, West Bengal, India' },
        'pune': { lat: 18.5204, lon: 73.8567, name: 'Pune, Maharashtra, India' },
        'ahmedabad': { lat: 23.0225, lon: 72.5714, name: 'Ahmedabad, Gujarat, India' },
        'jaipur': { lat: 26.9124, lon: 75.7873, name: 'Jaipur, Rajasthan, India' },
        'lucknow': { lat: 26.8467, lon: 80.9462, name: 'Lucknow, Uttar Pradesh, India' },
        'london': { lat: 51.5074, lon: -0.1278, name: 'London, UK' },
        'tokyo': { lat: 35.6762, lon: 139.6503, name: 'Tokyo, Japan' },
        'paris': { lat: 48.8566, lon: 2.3522, name: 'Paris, France' },
        'sydney': { lat: -33.8688, lon: 151.2093, name: 'Sydney, Australia' },
        'dubai': { lat: 25.2048, lon: 55.2708, name: 'Dubai, UAE' },
        'singapore': { lat: 1.3521, lon: 103.8198, name: 'Singapore' },
        'toronto': { lat: 43.6532, lon: -79.3832, name: 'Toronto, Canada' },
        'berlin': { lat: 52.5200, lon: 13.4050, name: 'Berlin, Germany' },
        'moscow': { lat: 55.7558, lon: 37.6176, name: 'Moscow, Russia' },
        'new york': { lat: 40.7128, lon: -74.0060, name: 'New York City, USA' },
        'los angeles': { lat: 34.0522, lon: -118.2437, name: 'Los Angeles, USA' },
        'chicago': { lat: 41.8781, lon: -87.6298, name: 'Chicago, USA' },
        'houston': { lat: 29.7604, lon: -95.3698, name: 'Houston, USA' },
        'miami': { lat: 25.7617, lon: -80.1918, name: 'Miami, USA' }
    };
    
    const cityKey = city.toLowerCase();
    const coordinates = cityCoordinates[cityKey];
    
    if (coordinates) {
        userLocation = {
            latitude: coordinates.lat,
            longitude: coordinates.lon
        };
        
        // Store the search city
        currentSearchCity = coordinates.name;
        
        // Update location display
        document.getElementById('user-address').textContent = coordinates.name;
        document.getElementById('user-coordinates').textContent = `${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}`;
        document.getElementById('location-details').classList.remove('hidden');
        
        showNotification(`Searching doctors in ${coordinates.name}...`);
        searchDoctors();
    } else {
        showNotification('City not found. Please try: Hyderabad, Mumbai, Delhi, Bangalore, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, Lucknow, London, Tokyo, Paris, Sydney, Dubai, Singapore, Toronto, Berlin, Moscow, New York, Los Angeles, Chicago, Houston, Miami');
    }
}

// Global search function for onclick
window.searchDoctors = searchDoctors;
window.searchWithDefaultLocation = searchWithDefaultLocation;
window.searchByCity = searchByCity;

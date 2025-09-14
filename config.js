// API Configuration File
// Update these settings with your actual API details

const API_CONFIG = {
    // Gemini API endpoint
    baseURL: 'https://generativelanguage.googleapis.com',
    
    // Your Gemini API key
    apiKey: 'AIzaSyDBXeJit7F640FOzhO2zbSFdeqlcdSCc0Q',
    
    // Gemini API endpoint path
    endpoint: '/v1beta/models/gemini-pro:generateContent',
    
    // Request timeout in milliseconds
    timeout: 15000,
    
    // Additional headers for Gemini API
    additionalHeaders: {
        'Content-Type': 'application/json'
    },
    
    // API version
    version: 'v1beta'
};

// Common API endpoints for health/symptom analysis
const POPULAR_APIS = {
    // Example configurations for popular health APIs
    
    // OpenAI GPT for medical analysis (you'd need to implement medical prompts)
    openai: {
        baseURL: 'https://api.openai.com',
        endpoint: '/v1/chat/completions',
        headers: {
            'Authorization': `Bearer ${API_CONFIG.apiKey}`
        }
    },
    
    // IBM Watson Health (if you have access)
    watson: {
        baseURL: 'https://your-watson-instance.com',
        endpoint: '/v1/analyze',
        headers: {
            'Authorization': `Bearer ${API_CONFIG.apiKey}`
        }
    },
    
    // Custom medical API
    custom: {
        baseURL: 'https://your-medical-api.com',
        endpoint: '/symptoms/analyze',
        headers: {
            'Authorization': `Bearer ${API_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
        }
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, POPULAR_APIS };
}

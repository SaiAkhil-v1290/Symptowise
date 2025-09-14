#!/usr/bin/env python3
"""
Simple proxy server to handle Gemini API requests and avoid CORS issues
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request
import urllib.parse
import json
import os
from doctor_scraper import search_doctors_api, get_doctor_details_api

class ProxyHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/analyze-symptoms':
            self.handle_symptom_analysis()
        elif self.path == '/api/search-doctors':
            self.handle_doctor_search()
        else:
            self.send_error(404, "Not Found")
    
    def do_GET(self):
        if self.path.startswith('/api/doctor/'):
            self.handle_doctor_details()
        elif self.path == '/':
            self.path = '/index.html'
            self.serve_static_file()
        else:
            self.serve_static_file()
    
    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def handle_symptom_analysis(self):
        try:
            # Read the request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            symptoms = request_data.get('symptoms', '')
            
            # Prepare Gemini API request
            gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDBXeJit7F640FOzhO2zbSFdeqlcdSCc0Q"
            
            prompt = f"""You are a medical AI assistant. Analyze the following symptoms and provide a health assessment.

SYMPTOMS: "{symptoms}"

Please respond with a JSON object in this exact format:
{{
    "severity": "low|medium|high",
    "analysis": "Detailed analysis of the symptoms",
    "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
    "isEmergency": true/false
}}

Guidelines:
- Use "low" for minor symptoms that can be managed at home
- Use "medium" for symptoms that need medical attention within 24-48 hours
- Use "high" for serious symptoms requiring immediate medical attention
- Set isEmergency to true only for life-threatening conditions
- Provide 3-4 practical recommendations
- Be professional but accessible in your analysis
- Always emphasize that this is not a substitute for professional medical advice

IMPORTANT: Respond ONLY with the JSON object, no additional text."""

            gemini_request = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.3,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 1024,
                }
            }
            
            # Make request to Gemini API
            req = urllib.request.Request(
                gemini_url,
                data=json.dumps(gemini_request).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            
            with urllib.request.urlopen(req) as response:
                gemini_response = json.loads(response.read().decode('utf-8'))
                
                # Extract the generated text
                generated_text = gemini_response.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                
                if generated_text:
                    # Parse the JSON response from Gemini
                    try:
                        # Clean the response text
                        cleaned_text = generated_text.replace('```json', '').replace('```', '').strip()
                        analysis_result = json.loads(cleaned_text)
                        
                        # Send response back to client
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(json.dumps(analysis_result).encode('utf-8'))
                        
                    except json.JSONDecodeError:
                        self.send_error(500, "Invalid response from AI")
                else:
                    self.send_error(500, "No response from AI")
                    
        except Exception as e:
            print(f"Error: {e}")
            self.send_error(500, f"Internal server error: {str(e)}")
    
    def handle_doctor_search(self):
        """Handle doctor search requests"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            user_lat = request_data.get('latitude', 17.3850)  # Default to Hyderabad
            user_lon = request_data.get('longitude', 78.4867)
            specialty = request_data.get('specialty', '')
            max_distance = request_data.get('max_distance', 10)
            min_rating = request_data.get('min_rating', 0)
            search_term = request_data.get('search_term', '')
            search_city = request_data.get('search_city', '')
            
            print(f"Searching doctors: lat={user_lat}, lon={user_lon}, specialty={specialty}, city={search_city}")
            
            # Call the doctor search API
            result = search_doctors_api(
                user_lat, user_lon, specialty, max_distance, min_rating, search_term, search_city
            )
            
            # Send response back to client
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))
            
        except Exception as e:
            print(f"Doctor search error: {e}")
            error_response = {
                "success": False,
                "error": str(e),
                "count": 0,
                "doctors": []
            }
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def handle_doctor_details(self):
        """Handle doctor details requests"""
        try:
            # Extract doctor ID from path
            doctor_id = self.path.split('/')[-1]
            
            print(f"Getting details for doctor: {doctor_id}")
            
            # Call the doctor details API
            result = get_doctor_details_api(doctor_id)
            
            # Send response back to client
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))
            
        except Exception as e:
            print(f"Doctor details error: {e}")
            error_response = {
                "success": False,
                "error": str(e)
            }
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def serve_static_file(self):
        """Serve static files"""
        try:
            # Serve static files
            file_path = self.path[1:]  # Remove leading slash
            if not file_path:
                file_path = 'index.html'
            
            if os.path.exists(file_path):
                with open(file_path, 'rb') as f:
                    content = f.read()
                
                self.send_response(200)
                
                # Set content type based on file extension
                if file_path.endswith('.html'):
                    self.send_header('Content-Type', 'text/html')
                elif file_path.endswith('.css'):
                    self.send_header('Content-Type', 'text/css')
                elif file_path.endswith('.js'):
                    self.send_header('Content-Type', 'application/javascript')
                else:
                    self.send_header('Content-Type', 'application/octet-stream')
                
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_error(404, "File not found")
                
        except Exception as e:
            self.send_error(500, f"Error serving file: {str(e)}")
    
    def log_message(self, format, *args):
        print(f"{self.address_string()} - {format % args}")

def run_server(port=8080):
    server_address = ('', port)
    httpd = HTTPServer(server_address, ProxyHandler)
    print(f"Server running on http://localhost:{port}")
    print("Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.shutdown()

if __name__ == '__main__':
    run_server()

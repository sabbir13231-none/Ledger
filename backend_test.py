#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Mileage Tracker
Tests all FastAPI endpoints with PostgreSQL database integration
"""

import requests
import json
import base64
from datetime import datetime, timezone, timedelta
import uuid
import subprocess
import sys
import os
from typing import Dict, Any

# Configuration
BACKEND_URL = "https://taxitracker-15.preview.emergentagent.com/api"
TEST_USER_ID = "test_user_001"
TEST_EMAIL = "test@example.com"
TEST_NAME = "Test User"
TEST_TOKEN = "test_token_123"

class MileageTrackerTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.headers = {
            "Authorization": f"Bearer {TEST_TOKEN}",
            "Content-Type": "application/json"
        }
        self.test_data = {}
        self.results = []
        
    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        print(f"{status} {test_name}")
        if details:
            print(f"    Details: {details}")
    
    def setup_test_data(self):
        """Setup test user and session in PostgreSQL"""
        print("🔧 Setting up test data in PostgreSQL...")
        
        try:
            # Create test user
            user_cmd = [
                "psql", "-U", "postgres", "-d", "mileage_tracker", "-c",
                f"INSERT INTO users (user_id, email, name, picture) VALUES ('{TEST_USER_ID}', '{TEST_EMAIL}', '{TEST_NAME}', 'https://example.com/pic.jpg') ON CONFLICT (user_id) DO NOTHING;"
            ]
            subprocess.run(user_cmd, check=True, capture_output=True)
            
            # Create test session
            expires_at = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
            session_cmd = [
                "psql", "-U", "postgres", "-d", "mileage_tracker", "-c",
                f"INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES ('{TEST_USER_ID}', '{TEST_TOKEN}', '{expires_at}') ON CONFLICT (session_token) DO UPDATE SET expires_at = EXCLUDED.expires_at;"
            ]
            subprocess.run(session_cmd, check=True, capture_output=True)
            
            print("✅ Test data setup complete")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to setup test data: {e}")
            return False
    
    def cleanup_test_data(self):
        """Clean up test data from PostgreSQL"""
        print("🧹 Cleaning up test data...")
        
        try:
            # Delete test session
            cleanup_cmd = [
                "psql", "-U", "postgres", "-d", "mileage_tracker", "-c",
                f"DELETE FROM user_sessions WHERE user_id = '{TEST_USER_ID}';"
            ]
            subprocess.run(cleanup_cmd, check=True, capture_output=True)
            
            # Delete test user (cascades to all related data)
            cleanup_cmd = [
                "psql", "-U", "postgres", "-d", "mileage_tracker", "-c",
                f"DELETE FROM users WHERE user_id = '{TEST_USER_ID}';"
            ]
            subprocess.run(cleanup_cmd, check=True, capture_output=True)
            
            print("✅ Test data cleanup complete")
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to cleanup test data: {e}")
    
    def test_health_endpoints(self):
        """Test health and basic endpoints"""
        print("\n🏥 Testing Health & Basic Endpoints...")
        
        # Test root endpoint
        try:
            response = requests.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "status" in data:
                    self.log_result("GET /api/ - API status", True, f"Status: {data.get('status')}")
                else:
                    self.log_result("GET /api/ - API status", False, "Missing required fields in response")
            else:
                self.log_result("GET /api/ - API status", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("GET /api/ - API status", False, f"Exception: {str(e)}")
        
        # Test health endpoint
        try:
            response = requests.get(f"{self.base_url}/health")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_result("GET /api/health - Health check", True, f"Database: {data.get('database')}")
                else:
                    self.log_result("GET /api/health - Health check", False, f"Unhealthy status: {data}")
            else:
                self.log_result("GET /api/health - Health check", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("GET /api/health - Health check", False, f"Exception: {str(e)}")
    
    def test_authentication(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication...")
        
        # Test /auth/me endpoint
        try:
            response = requests.get(f"{self.base_url}/auth/me", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                if data.get("user_id") == TEST_USER_ID and data.get("email") == TEST_EMAIL:
                    self.log_result("GET /auth/me - User authentication", True, f"User: {data.get('name')}")
                    self.test_data["user"] = data
                else:
                    self.log_result("GET /auth/me - User authentication", False, f"Incorrect user data: {data}")
            else:
                self.log_result("GET /auth/me - User authentication", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("GET /auth/me - User authentication", False, f"Exception: {str(e)}")
    
    def test_vehicles_crud(self):
        """Test vehicle CRUD operations"""
        print("\n🚗 Testing Vehicles CRUD...")
        
        # Create vehicle
        vehicle_data = {
            "name": "Test Vehicle",
            "make": "Toyota",
            "model": "Camry",
            "year": 2022,
            "business_percentage": 80
        }
        
        try:
            response = requests.post(f"{self.base_url}/vehicles", 
                                   headers=self.headers, 
                                   json=vehicle_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("name") == vehicle_data["name"]:
                    self.log_result("POST /vehicles - Create vehicle", True, f"Vehicle ID: {data.get('vehicle_id')}")
                    self.test_data["vehicle"] = data
                else:
                    self.log_result("POST /vehicles - Create vehicle", False, f"Incorrect vehicle data: {data}")
            else:
                self.log_result("POST /vehicles - Create vehicle", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("POST /vehicles - Create vehicle", False, f"Exception: {str(e)}")
        
        # List vehicles
        try:
            response = requests.get(f"{self.base_url}/vehicles", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    self.log_result("GET /vehicles - List vehicles", True, f"Found {len(data)} vehicles")
                else:
                    self.log_result("GET /vehicles - List vehicles", False, f"No vehicles found or invalid response: {data}")
            else:
                self.log_result("GET /vehicles - List vehicles", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("GET /vehicles - List vehicles", False, f"Exception: {str(e)}")
    
    def test_trips_crud(self):
        """Test trip CRUD operations"""
        print("\n🛣️ Testing Trips CRUD...")
        
        vehicle_id = self.test_data.get("vehicle", {}).get("vehicle_id")
        
        # Create manual trip
        manual_trip_data = {
            "vehicle_id": vehicle_id,
            "start_time": "2024-01-15T09:00:00Z",
            "end_time": "2024-01-15T10:30:00Z",
            "distance": 25.5,
            "start_location": "123 Main St, City A",
            "end_location": "456 Oak Ave, City B",
            "purpose": "Client meeting",
            "is_business": True,
            "is_automatic": False
        }
        
        try:
            response = requests.post(f"{self.base_url}/trips", 
                                   headers=self.headers, 
                                   json=manual_trip_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("distance") == manual_trip_data["distance"]:
                    self.log_result("POST /trips - Create manual trip", True, f"Trip ID: {data.get('trip_id')}")
                    self.test_data["manual_trip"] = data
                else:
                    self.log_result("POST /trips - Create manual trip", False, f"Incorrect trip data: {data}")
            else:
                self.log_result("POST /trips - Create manual trip", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("POST /trips - Create manual trip", False, f"Exception: {str(e)}")
        
        # Create automatic trip
        auto_trip_data = {
            "vehicle_id": vehicle_id,
            "start_time": "2024-01-15T14:00:00Z",
            "end_time": "2024-01-15T15:15:00Z",
            "distance": 18.2,
            "start_location": "GPS: 40.7128,-74.0060",
            "end_location": "GPS: 40.7589,-73.9851",
            "purpose": "Automatic tracking",
            "is_business": True,
            "is_automatic": True
        }
        
        try:
            response = requests.post(f"{self.base_url}/trips", 
                                   headers=self.headers, 
                                   json=auto_trip_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("is_automatic") == True:
                    self.log_result("POST /trips - Create automatic trip", True, f"Trip ID: {data.get('trip_id')}")
                    self.test_data["auto_trip"] = data
                else:
                    self.log_result("POST /trips - Create automatic trip", False, f"Incorrect trip data: {data}")
            else:
                self.log_result("POST /trips - Create automatic trip", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("POST /trips - Create automatic trip", False, f"Exception: {str(e)}")
        
        # List trips
        try:
            response = requests.get(f"{self.base_url}/trips", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) >= 2:
                    self.log_result("GET /trips - List trips", True, f"Found {len(data)} trips")
                else:
                    self.log_result("GET /trips - List trips", False, f"Expected at least 2 trips, got: {len(data) if isinstance(data, list) else 'invalid response'}")
            else:
                self.log_result("GET /trips - List trips", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("GET /trips - List trips", False, f"Exception: {str(e)}")
        
        # Update trip
        if "manual_trip" in self.test_data:
            trip_id = self.test_data["manual_trip"]["trip_id"]
            update_data = {
                "purpose": "Updated client meeting",
                "distance": 26.0
            }
            
            try:
                response = requests.put(f"{self.base_url}/trips/{trip_id}", 
                                      headers=self.headers, 
                                      json=update_data)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("purpose") == update_data["purpose"]:
                        self.log_result("PUT /trips/{id} - Update trip", True, f"Updated purpose and distance")
                    else:
                        self.log_result("PUT /trips/{id} - Update trip", False, f"Update failed: {data}")
                else:
                    self.log_result("PUT /trips/{id} - Update trip", False, f"Status code: {response.status_code}")
            except Exception as e:
                self.log_result("PUT /trips/{id} - Update trip", False, f"Exception: {str(e)}")
    
    def test_expenses_crud(self):
        """Test expense CRUD operations"""
        print("\n💰 Testing Expenses CRUD...")
        
        vehicle_id = self.test_data.get("vehicle", {}).get("vehicle_id")
        
        # Create expense with different categories
        expense_data = {
            "vehicle_id": vehicle_id,
            "amount": 45.67,
            "category": "Fuel",
            "date": "2024-01-15T12:00:00Z",
            "notes": "Gas station fill-up"
        }
        
        try:
            response = requests.post(f"{self.base_url}/expenses", 
                                   headers=self.headers, 
                                   json=expense_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("amount") == expense_data["amount"]:
                    self.log_result("POST /expenses - Create expense (Fuel)", True, f"Expense ID: {data.get('expense_id')}")
                    self.test_data["fuel_expense"] = data
                else:
                    self.log_result("POST /expenses - Create expense (Fuel)", False, f"Incorrect expense data: {data}")
            else:
                self.log_result("POST /expenses - Create expense (Fuel)", False, f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("POST /expenses - Create expense (Fuel)", False, f"Exception: {str(e)}")
        
        # Create expense with base64 receipt image
        # Create a simple base64 encoded image (1x1 pixel PNG)
        receipt_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        
        receipt_expense_data = {
            "vehicle_id": vehicle_id,
            "amount": 125.00,
            "category": "Maintenance",
            "date": "2024-01-16T10:00:00Z",
            "notes": "Oil change and inspection",
            "receipt_image_base64": receipt_image_b64
        }
        
        try:
            response = requests.post(f"{self.base_url}/expenses", 
                                   headers=self.headers, 
                                   json=receipt_expense_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("receipt_image_base64") == receipt_image_b64:
                    self.log_result("POST /expenses - Create expense with receipt", True, f"Expense ID: {data.get('expense_id')}")
                    self.test_data["receipt_expense"] = data
                else:
                    self.log_result("POST /expenses - Create expense with receipt", False, f"Receipt image not stored correctly")
            else:
                self.log_result("POST /expenses - Create expense with receipt", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("POST /expenses - Create expense with receipt", False, f"Exception: {str(e)}")
        
        # List expenses
        try:
            response = requests.get(f"{self.base_url}/expenses", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) >= 2:
                    self.log_result("GET /expenses - List expenses", True, f"Found {len(data)} expenses")
                else:
                    self.log_result("GET /expenses - List expenses", False, f"Expected at least 2 expenses, got: {len(data) if isinstance(data, list) else 'invalid response'}")
            else:
                self.log_result("GET /expenses - List expenses", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("GET /expenses - List expenses", False, f"Exception: {str(e)}")
    
    def test_dashboard_reports(self):
        """Test dashboard and reports endpoints"""
        print("\n📊 Testing Dashboard & Reports...")
        
        # Test dashboard stats
        try:
            response = requests.get(f"{self.base_url}/dashboard/stats", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                required_fields = ["month_miles", "year_miles", "total_expenses", "mileage_deduction", "total_deduction", "estimated_tax_savings"]
                if all(field in data for field in required_fields):
                    # Verify IRS rate calculation ($0.67/mile)
                    year_miles = data.get("year_miles", 0)
                    mileage_deduction = data.get("mileage_deduction", 0)
                    expected_deduction = year_miles * 0.67
                    
                    if abs(mileage_deduction - expected_deduction) < 0.01:
                        self.log_result("GET /dashboard/stats - Dashboard calculations", True, f"Year miles: {year_miles}, Deduction: ${mileage_deduction}")
                    else:
                        self.log_result("GET /dashboard/stats - Dashboard calculations", False, f"IRS rate calculation incorrect. Expected: ${expected_deduction}, Got: ${mileage_deduction}")
                else:
                    self.log_result("GET /dashboard/stats - Dashboard calculations", False, f"Missing required fields: {data}")
            else:
                self.log_result("GET /dashboard/stats - Dashboard calculations", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("GET /dashboard/stats - Dashboard calculations", False, f"Exception: {str(e)}")
        
        # Test tax report
        start_date = "2024-01-01T00:00:00Z"
        end_date = "2024-12-31T23:59:59Z"
        
        try:
            response = requests.get(f"{self.base_url}/reports/tax", 
                                  headers=self.headers,
                                  params={"start_date": start_date, "end_date": end_date})
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_miles", "business_miles", "total_deduction", "total_expenses", "total_tax_savings"]
                if all(field in data for field in required_fields):
                    # Verify IRS rate calculation
                    business_miles = data.get("business_miles", 0)
                    total_expenses = data.get("total_expenses", 0)
                    total_deduction = data.get("total_deduction", 0)
                    expected_deduction = (business_miles * 0.67) + total_expenses
                    
                    if abs(total_deduction - expected_deduction) < 0.01:
                        self.log_result("GET /reports/tax - Tax report generation", True, f"Business miles: {business_miles}, Total deduction: ${total_deduction}")
                    else:
                        self.log_result("GET /reports/tax - Tax report generation", False, f"Tax calculation incorrect. Expected: ${expected_deduction}, Got: ${total_deduction}")
                else:
                    self.log_result("GET /reports/tax - Tax report generation", False, f"Missing required fields: {data}")
            else:
                self.log_result("GET /reports/tax - Tax report generation", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("GET /reports/tax - Tax report generation", False, f"Exception: {str(e)}")
        
        # Test subscription status (mock)
        try:
            response = requests.get(f"{self.base_url}/subscription/status", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                if data.get("plan_type") == "pro" and data.get("is_active") == True:
                    features = data.get("features", [])
                    if len(features) > 0:
                        self.log_result("GET /subscription/status - Mock subscription", True, f"Plan: {data.get('plan_type')}, Features: {len(features)}")
                    else:
                        self.log_result("GET /subscription/status - Mock subscription", False, "No features returned")
                else:
                    self.log_result("GET /subscription/status - Mock subscription", False, f"Unexpected subscription data: {data}")
            else:
                self.log_result("GET /subscription/status - Mock subscription", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("GET /subscription/status - Mock subscription", False, f"Exception: {str(e)}")
    
    def test_cleanup_operations(self):
        """Test delete operations"""
        print("\n🗑️ Testing Cleanup Operations...")
        
        # Delete expense
        if "fuel_expense" in self.test_data:
            expense_id = self.test_data["fuel_expense"]["expense_id"]
            try:
                response = requests.delete(f"{self.base_url}/expenses/{expense_id}", headers=self.headers)
                if response.status_code == 200:
                    self.log_result("DELETE /expenses/{id} - Delete expense", True, f"Deleted expense {expense_id}")
                else:
                    self.log_result("DELETE /expenses/{id} - Delete expense", False, f"Status code: {response.status_code}")
            except Exception as e:
                self.log_result("DELETE /expenses/{id} - Delete expense", False, f"Exception: {str(e)}")
        
        # Delete trip
        if "auto_trip" in self.test_data:
            trip_id = self.test_data["auto_trip"]["trip_id"]
            try:
                response = requests.delete(f"{self.base_url}/trips/{trip_id}", headers=self.headers)
                if response.status_code == 200:
                    self.log_result("DELETE /trips/{id} - Delete trip", True, f"Deleted trip {trip_id}")
                else:
                    self.log_result("DELETE /trips/{id} - Delete trip", False, f"Status code: {response.status_code}")
            except Exception as e:
                self.log_result("DELETE /trips/{id} - Delete trip", False, f"Exception: {str(e)}")
        
        # Delete vehicle
        if "vehicle" in self.test_data:
            vehicle_id = self.test_data["vehicle"]["vehicle_id"]
            try:
                response = requests.delete(f"{self.base_url}/vehicles/{vehicle_id}", headers=self.headers)
                if response.status_code == 200:
                    self.log_result("DELETE /vehicles/{id} - Delete vehicle", True, f"Deleted vehicle {vehicle_id}")
                else:
                    self.log_result("DELETE /vehicles/{id} - Delete vehicle", False, f"Status code: {response.status_code}")
            except Exception as e:
                self.log_result("DELETE /vehicles/{id} - Delete vehicle", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Mileage Tracker Backend API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Setup
        if not self.setup_test_data():
            print("❌ Failed to setup test data. Aborting tests.")
            return False
        
        # Run tests
        self.test_health_endpoints()
        self.test_authentication()
        self.test_vehicles_crud()
        self.test_trips_crud()
        self.test_expenses_crud()
        self.test_dashboard_reports()
        self.test_cleanup_operations()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Summary
        self.print_summary()
        
        return True
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📋 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.results if r["success"])
        failed = len(self.results) - passed
        
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Total: {len(self.results)}")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.results:
                if not result["success"]:
                    print(f"  ❌ {result['test']}")
                    if result["details"]:
                        print(f"     {result['details']}")
        
        print("\n" + "=" * 60)
        
        return failed == 0

if __name__ == "__main__":
    tester = MileageTrackerTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)
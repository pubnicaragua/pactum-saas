#!/usr/bin/env python3
"""
Mini-Pactum Backend API Testing Suite
Tests all endpoints with both admin and client users
"""

import requests
import sys
import json
from datetime import datetime

class MiniPactumAPITester:
    def __init__(self, base_url="https://pactum-tracker.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.admin_token = None
        self.client_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        # Test credentials
        self.admin_email = "admin@pactum.com"
        self.client_email = "activo2_26@gmail.com"
        self.password = "Pactum#2026!"

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            self.failed_tests.append({"test": test_name, "details": details})
            print(f"❌ {test_name} - {details}")

    def make_request(self, method, endpoint, data=None, token=None, files=None):
        """Make HTTP request with proper headers"""
        url = f"{self.api_base}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        if files:
            headers.pop('Content-Type', None)  # Let requests set it for multipart
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            
            return response
        except Exception as e:
            return None

    def test_health_check(self):
        """Test basic health endpoint"""
        print("\n🔍 Testing Health Check...")
        response = self.make_request('GET', 'health')
        success = response and response.status_code == 200
        self.log_result("Health Check", success, 
                       f"Status: {response.status_code if response else 'No response'}")
        return success

    def test_authentication(self):
        """Test login for both users"""
        print("\n🔍 Testing Authentication...")
        
        # Test admin login
        admin_response = self.make_request('POST', 'auth/login', {
            'email': self.admin_email,
            'password': self.password
        })
        
        admin_success = admin_response and admin_response.status_code == 200
        if admin_success:
            self.admin_token = admin_response.json().get('access_token')
        
        self.log_result("Admin Login", admin_success,
                       f"Status: {admin_response.status_code if admin_response else 'No response'}")
        
        # Test client login
        client_response = self.make_request('POST', 'auth/login', {
            'email': self.client_email,
            'password': self.password
        })
        
        client_success = client_response and client_response.status_code == 200
        if client_success:
            self.client_token = client_response.json().get('access_token')
        
        self.log_result("Client Login", client_success,
                       f"Status: {client_response.status_code if client_response else 'No response'}")
        
        return admin_success and client_success

    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        print("\n🔍 Testing Dashboard Stats...")
        
        response = self.make_request('GET', 'dashboard/stats', token=self.admin_token)
        success = response and response.status_code == 200
        
        if success:
            data = response.json()
            required_keys = ['projects', 'phases', 'payments', 'tasks', 'crm']
            has_all_keys = all(key in data for key in required_keys)
            success = success and has_all_keys
        
        self.log_result("Dashboard Stats", success,
                       f"Status: {response.status_code if response else 'No response'}")
        return success

    def test_projects_api(self):
        """Test projects endpoints"""
        print("\n🔍 Testing Projects API...")
        
        # Get projects
        response = self.make_request('GET', 'projects', token=self.admin_token)
        success = response and response.status_code == 200
        
        project_id = None
        if success and response.json():
            project_id = response.json()[0].get('id')
        
        self.log_result("Get Projects", success,
                       f"Status: {response.status_code if response else 'No response'}")
        
        # Get specific project
        if project_id:
            response = self.make_request('GET', f'projects/{project_id}', token=self.admin_token)
            success = response and response.status_code == 200
            self.log_result("Get Project Details", success,
                           f"Status: {response.status_code if response else 'No response'}")
        
        return project_id is not None

    def test_phases_api(self):
        """Test phases endpoints"""
        print("\n🔍 Testing Phases API...")
        
        # Get phases
        response = self.make_request('GET', 'phases', token=self.admin_token)
        success = response and response.status_code == 200
        
        phase_id = None
        if success and response.json():
            phase_id = response.json()[0].get('id')
        
        self.log_result("Get Phases", success,
                       f"Status: {response.status_code if response else 'No response'}")
        
        # Test phase approval (admin only)
        if phase_id:
            response = self.make_request('POST', f'phases/{phase_id}/approve', token=self.admin_token)
            success = response and response.status_code == 200
            self.log_result("Approve Phase", success,
                           f"Status: {response.status_code if response else 'No response'}")
        
        return phase_id is not None

    def test_payments_api(self):
        """Test payments endpoints"""
        print("\n🔍 Testing Payments API...")
        
        # Get payments
        response = self.make_request('GET', 'payments', token=self.admin_token)
        success = response and response.status_code == 200
        
        payment_id = None
        if success and response.json():
            payment_id = response.json()[0].get('id')
        
        self.log_result("Get Payments", success,
                       f"Status: {response.status_code if response else 'No response'}")
        
        # Update payment status
        if payment_id:
            response = self.make_request('PUT', f'payments/{payment_id}', 
                                       {'status': 'Pagado'}, token=self.admin_token)
            success = response and response.status_code == 200
            self.log_result("Update Payment Status", success,
                           f"Status: {response.status_code if response else 'No response'}")
        
        return payment_id is not None

    def test_tasks_api(self):
        """Test tasks CRUD operations"""
        print("\n🔍 Testing Tasks API...")
        
        # Get tasks
        response = self.make_request('GET', 'tasks', token=self.admin_token)
        success = response and response.status_code == 200
        
        self.log_result("Get Tasks", success,
                       f"Status: {response.status_code if response else 'No response'}")
        
        # Create new task
        new_task = {
            "project_id": "project-crm-amaru",
            "title": "Test Task API",
            "description": "Testing task creation via API",
            "week": 1,
            "priority": "Media",
            "status": "Backlog"
        }
        
        response = self.make_request('POST', 'tasks', new_task, token=self.admin_token)
        success = response and response.status_code == 200
        
        task_id = None
        if success:
            task_id = response.json().get('id')
        
        self.log_result("Create Task", success,
                       f"Status: {response.status_code if response else 'No response'}")
        
        # Update task
        if task_id:
            response = self.make_request('PUT', f'tasks/{task_id}', 
                                       {'status': 'En progreso'}, token=self.admin_token)
            success = response and response.status_code == 200
            self.log_result("Update Task", success,
                           f"Status: {response.status_code if response else 'No response'}")
        
        # Delete task (admin only)
        if task_id:
            response = self.make_request('DELETE', f'tasks/{task_id}', token=self.admin_token)
            success = response and response.status_code == 200
            self.log_result("Delete Task", success,
                           f"Status: {response.status_code if response else 'No response'}")
        
        return True

    def test_crm_clients_api(self):
        """Test CRM clients CRUD"""
        print("\n🔍 Testing CRM Clients API...")
        
        # Get clients
        response = self.make_request('GET', 'clients', token=self.admin_token)
        success = response and response.status_code == 200
        
        self.log_result("Get Clients", success,
                       f"Status: {response.status_code if response else 'No response'}")
        
        # Create client
        new_client = {
            "name": "Test Client API",
            "email": "test@api.com",
            "phone": "+505 1234-5678",
            "company": "API Test Corp",
            "tags": ["Test"]
        }
        
        response = self.make_request('POST', 'clients', new_client, token=self.admin_token)
        success = response and response.status_code == 200
        
        client_id = None
        if success:
            client_id = response.json().get('id')
        
        self.log_result("Create Client", success,
                       f"Status: {response.status_code if response else 'No response'}")
        
        # Update client
        if client_id:
            response = self.make_request('PUT', f'clients/{client_id}', 
                                       {'name': 'Updated Test Client'}, token=self.admin_token)
            success = response and response.status_code == 200
            self.log_result("Update Client", success,
                           f"Status: {response.status_code if response else 'No response'}")
        
        # Delete client
        if client_id:
            response = self.make_request('DELETE', f'clients/{client_id}', token=self.admin_token)
            success = response and response.status_code == 200
            self.log_result("Delete Client", success,
                           f"Status: {response.status_code if response else 'No response'}")
        
        return True

    def test_crm_opportunities_api(self):
        """Test CRM opportunities CRUD"""
        print("\n🔍 Testing CRM Opportunities API...")
        
        # Get opportunities
        response = self.make_request('GET', 'opportunities', token=self.admin_token)
        success = response and response.status_code == 200
        
        opp_id = None
        if success and response.json():
            opp_id = response.json()[0].get('id')
        
        self.log_result("Get Opportunities", success,
                       f"Status: {response.status_code if response else 'No response'}")
        
        # Update opportunity stage
        if opp_id:
            response = self.make_request('PUT', f'opportunities/{opp_id}', 
                                       {'stage': 'Negociación'}, token=self.admin_token)
            success = response and response.status_code == 200
            self.log_result("Update Opportunity", success,
                           f"Status: {response.status_code if response else 'No response'}")
        
        return opp_id is not None

    def test_crm_activities_api(self):
        """Test CRM activities CRUD"""
        print("\n🔍 Testing CRM Activities API...")
        
        # Get activities
        response = self.make_request('GET', 'activities', token=self.admin_token)
        success = response and response.status_code == 200
        
        self.log_result("Get Activities", success,
                       f"Status: {response.status_code if response else 'No response'}")
        
        # Create activity
        new_activity = {
            "type": "tarea",
            "title": "Test Activity API",
            "description": "Testing activity creation",
            "due_date": "2026-01-10",
            "completed": False
        }
        
        response = self.make_request('POST', 'activities', new_activity, token=self.admin_token)
        success = response and response.status_code == 200
        
        activity_id = None
        if success:
            activity_id = response.json().get('id')
        
        self.log_result("Create Activity", success,
                       f"Status: {response.status_code if response else 'No response'}")
        
        # Update activity
        if activity_id:
            response = self.make_request('PUT', f'activities/{activity_id}', 
                                       {'completed': True}, token=self.admin_token)
            success = response and response.status_code == 200
            self.log_result("Update Activity", success,
                           f"Status: {response.status_code if response else 'No response'}")
        
        # Delete activity
        if activity_id:
            response = self.make_request('DELETE', f'activities/{activity_id}', token=self.admin_token)
            success = response and response.status_code == 200
            self.log_result("Delete Activity", success,
                           f"Status: {response.status_code if response else 'No response'}")
        
        return True

    def test_activity_logs(self):
        """Test activity logs endpoint"""
        print("\n🔍 Testing Activity Logs...")
        
        response = self.make_request('GET', 'activity-logs', token=self.admin_token)
        success = response and response.status_code == 200
        
        self.log_result("Get Activity Logs", success,
                       f"Status: {response.status_code if response else 'No response'}")
        
        return success

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        print("\n🔍 Testing Admin Endpoints...")
        
        # Get users (admin only)
        response = self.make_request('GET', 'users', token=self.admin_token)
        success = response and response.status_code == 200
        
        self.log_result("Get Users (Admin)", success,
                       f"Status: {response.status_code if response else 'No response'}")
        
        # Test client access to admin endpoint (should fail)
        response = self.make_request('GET', 'users', token=self.client_token)
        success = response and response.status_code == 403
        
        self.log_result("Client Access Denied", success,
                       f"Status: {response.status_code if response else 'No response'}")
        
        return True

    def test_contracts_api(self):
        """Test contracts endpoints"""
        print("\n🔍 Testing Contracts API...")
        
        # Get contracts
        response = self.make_request('GET', 'contracts', token=self.admin_token)
        success = response and response.status_code == 200
        
        self.log_result("Get Contracts", success,
                       f"Status: {response.status_code if response else 'No response'}")
        
        return success

    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting Mini-Pactum Backend API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Basic connectivity
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return False
        
        # Authentication
        if not self.test_authentication():
            print("❌ Authentication failed - stopping tests")
            return False
        
        # Core functionality tests
        self.test_dashboard_stats()
        self.test_projects_api()
        self.test_phases_api()
        self.test_payments_api()
        self.test_tasks_api()
        
        # CRM tests
        self.test_crm_clients_api()
        self.test_crm_opportunities_api()
        self.test_crm_activities_api()
        
        # Additional features
        self.test_activity_logs()
        self.test_admin_endpoints()
        self.test_contracts_api()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        print(f"✅ Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = MiniPactumAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
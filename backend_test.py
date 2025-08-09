import requests
import sys
import json
from datetime import datetime
import uuid

class Mega12APITester:
    def __init__(self, base_url="https://f05d7bbe-da9f-49a4-85ef-9afa0edc1282.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_user_id = None
        self.test_raffle_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_create_user(self):
        """Test user creation"""
        test_phone = f"(11) 99999-{datetime.now().strftime('%H%M%S')}"
        success, response = self.run_test(
            "Create User",
            "POST",
            "users",
            200,
            data={"phone": test_phone, "name": "Test User"}
        )
        if success and 'id' in response:
            self.test_user_id = response['id']
            print(f"   Created user ID: {self.test_user_id}")
        return success

    def test_get_user(self):
        """Test get user by ID"""
        if not self.test_user_id:
            print("❌ Skipped - No test user ID available")
            return False
        
        return self.run_test(
            "Get User",
            "GET",
            f"users/{self.test_user_id}",
            200
        )[0]

    def test_get_raffles(self):
        """Test get active raffles"""
        success, response = self.run_test(
            "Get Active Raffles",
            "GET",
            "raffles",
            200
        )
        if success and response:
            print(f"   Found {len(response)} active raffles")
            if len(response) > 0:
                self.test_raffle_id = response[0]['id']
                print(f"   Using raffle ID for tests: {self.test_raffle_id}")
        return success

    def test_create_raffle(self):
        """Test raffle creation"""
        raffle_data = {
            "title": "Test Raffle - iPhone 15",
            "description": "Rifa de teste para iPhone 15 Pro Max",
            "image_url": "https://via.placeholder.com/400x300",
            "price_per_ticket": 5.0,
            "total_tickets": 1000,
            "draw_date": None,
            "prizes": [
                {
                    "name": "iPhone 15 Pro Max",
                    "value": 8000.0,
                    "type": "product",
                    "image_url": "https://via.placeholder.com/200x200",
                    "is_available": True
                }
            ],
            "bonus_boxes": [
                {"quantity": 10, "boxes": 1},
                {"quantity": 50, "boxes": 5},
                {"quantity": 100, "boxes": 12}
            ]
        }
        
        success, response = self.run_test(
            "Create Raffle",
            "POST",
            "raffles",
            200,
            data=raffle_data
        )
        
        if success and 'id' in response:
            if not self.test_raffle_id:  # Only set if we don't have one from get_raffles
                self.test_raffle_id = response['id']
                print(f"   Created raffle ID: {self.test_raffle_id}")
        return success

    def test_get_raffle_by_id(self):
        """Test get specific raffle"""
        if not self.test_raffle_id:
            print("❌ Skipped - No test raffle ID available")
            return False
            
        return self.run_test(
            "Get Raffle by ID",
            "GET",
            f"raffles/{self.test_raffle_id}",
            200
        )[0]

    def test_get_raffle_tickets(self):
        """Test get raffle sold tickets"""
        if not self.test_raffle_id:
            print("❌ Skipped - No test raffle ID available")
            return False
            
        return self.run_test(
            "Get Raffle Tickets",
            "GET",
            f"raffles/{self.test_raffle_id}/tickets",
            200
        )[0]

    def test_create_purchase(self):
        """Test purchase creation"""
        if not self.test_user_id or not self.test_raffle_id:
            print("❌ Skipped - Missing user ID or raffle ID")
            return False
            
        purchase_data = {
            "user_id": self.test_user_id,
            "raffle_id": self.test_raffle_id,
            "quantity": 10
        }
        
        success, response = self.run_test(
            "Create Purchase",
            "POST",
            "purchases",
            200,
            data=purchase_data
        )
        
        if success:
            print(f"   Purchase created with {len(response.get('tickets', []))} tickets")
            print(f"   Total amount: R$ {response.get('total_amount', 0)}")
            print(f"   Bonus boxes: {response.get('bonus_boxes', 0)}")
        
        return success

    def test_get_user_purchases(self):
        """Test get user purchases"""
        if not self.test_user_id:
            print("❌ Skipped - No test user ID available")
            return False
            
        success, response = self.run_test(
            "Get User Purchases",
            "GET",
            f"purchases/user/{self.test_user_id}",
            200
        )
        
        if success:
            print(f"   Found {len(response)} purchases for user")
        
        return success

    def test_get_raffle_purchases(self):
        """Test get raffle purchases"""
        if not self.test_raffle_id:
            print("❌ Skipped - No test raffle ID available")
            return False
            
        success, response = self.run_test(
            "Get Raffle Purchases",
            "GET",
            f"purchases/raffle/{self.test_raffle_id}",
            200
        )
        
        if success:
            print(f"   Found {len(response)} purchases for raffle")
        
        return success

    def test_get_top_buyers(self):
        """Test get top buyers ranking"""
        return self.run_test(
            "Get Top Buyers",
            "GET",
            "rankings/top-buyers",
            200
        )[0]

    def test_get_daily_top_buyers(self):
        """Test get daily top buyers"""
        return self.run_test(
            "Get Daily Top Buyers",
            "GET",
            "rankings/daily-buyers",
            200
        )[0]

    def test_get_winners(self):
        """Test get winners"""
        return self.run_test(
            "Get Winners",
            "GET",
            "winners",
            200
        )[0]

    def test_create_winner(self):
        """Test create winner"""
        if not self.test_user_id or not self.test_raffle_id:
            print("❌ Skipped - Missing user ID or raffle ID")
            return False
            
        winner_data = {
            "user_id": self.test_user_id,
            "user_phone": "(11) 99999-1234",
            "raffle_id": self.test_raffle_id,
            "raffle_title": "Test Raffle",
            "prize_name": "iPhone 15 Pro Max",
            "winning_number": 1234
        }
        
        return self.run_test(
            "Create Winner",
            "POST",
            "winners",
            200,
            data=winner_data
        )[0]

    def test_get_stats(self):
        """Test get statistics"""
        success, response = self.run_test(
            "Get Statistics",
            "GET",
            "stats",
            200
        )
        
        if success:
            print(f"   Total raffles: {response.get('total_raffles', 0)}")
            print(f"   Active raffles: {response.get('active_raffles', 0)}")
            print(f"   Total users: {response.get('total_users', 0)}")
            print(f"   Total purchases: {response.get('total_purchases', 0)}")
        
        return success

def main():
    print("🎲 MEGA12 - Sistema de Rifas - API Testing")
    print("=" * 50)
    
    tester = Mega12APITester()
    
    # Test sequence
    tests = [
        ("API Root", tester.test_api_root),
        ("Create User", tester.test_create_user),
        ("Get User", tester.test_get_user),
        ("Get Raffles", tester.test_get_raffles),
        ("Create Raffle", tester.test_create_raffle),
        ("Get Raffle by ID", tester.test_get_raffle_by_id),
        ("Get Raffle Tickets", tester.test_get_raffle_tickets),
        ("Create Purchase", tester.test_create_purchase),
        ("Get User Purchases", tester.test_get_user_purchases),
        ("Get Raffle Purchases", tester.test_get_raffle_purchases),
        ("Get Top Buyers", tester.test_get_top_buyers),
        ("Get Daily Top Buyers", tester.test_get_daily_top_buyers),
        ("Get Winners", tester.test_get_winners),
        ("Create Winner", tester.test_create_winner),
        ("Get Statistics", tester.test_get_stats)
    ]
    
    print(f"\n🚀 Running {len(tests)} API tests...\n")
    
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed. Check the logs above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
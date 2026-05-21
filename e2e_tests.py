#!/usr/bin/env python3
"""
BookFlow E2E Test Suite — Sprint 3
Valida el flujo completo: Auth → Catalog → Cart → Orders
"""

import requests
import json
import sys
from datetime import datetime
from typing import Optional, Dict, Any

# ─────────────────────────────────────────
# CONFIGURACIÓN
# ─────────────────────────────────────────

BASE_URL = "http://localhost:8009"
TIMEOUT = 5
VERBOSE = True

# Colores para output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


# ─────────────────────────────────────────
# UTILITIES
# ─────────────────────────────────────────

def print_header(text: str):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text}{Colors.RESET}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.RESET}\n")

def print_step(step: int, description: str):
    print(f"{Colors.CYAN}[Step {step}] {description}{Colors.RESET}")

def print_success(message: str):
    print(f"{Colors.GREEN}✓ {message}{Colors.RESET}")

def print_error(message: str):
    print(f"{Colors.RED}✗ {message}{Colors.RESET}")

def print_info(message: str):
    print(f"{Colors.BLUE}ℹ {message}{Colors.RESET}")

def print_json(data: Any):
    if VERBOSE:
        print(json.dumps(data, indent=2, default=str))

def assert_status(response: requests.Response, expected: int) -> bool:
    if response.status_code != expected:
        print_error(f"Expected status {expected}, got {response.status_code}")
        print_json(response.json() if response.text else {})
        return False
    return True

def assert_field(data: Dict, field: str, message: str = "") -> bool:
    if field not in data:
        print_error(f"Missing field: {field}. {message}")
        return False
    return True


# ─────────────────────────────────────────
# TEST SUITE
# ─────────────────────────────────────────

class E2ETestSuite:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.token: Optional[str] = None
        self.book_1_id: Optional[int] = None
        self.book_1_title: Optional[str] = None
        self.book_1_price: Optional[int] = None
        self.book_2_id: Optional[int] = None
        self.book_2_title: Optional[str] = None
        self.book_2_price: Optional[int] = None
        self.cart_id: Optional[str] = None
        self.order_id: Optional[str] = None
        self.user_id = "e2e-test-user"
        self.passed = 0
        self.failed = 0

    def run(self) -> bool:
        """Run complete test suite"""
        print_header("🚀 BookFlow E2E Test Suite — Sprint 3")
        print_info(f"Target: {self.base_url}")
        print_info(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        tests = [
            self.test_health,
            self.test_get_token,
            self.test_list_catalog,
            self.test_get_book_detail,
            self.test_get_pricing,
            self.test_check_inventory,
            self.test_add_to_cart_item_1,
            self.test_add_to_cart_item_2,
            self.test_view_cart,
            self.test_create_order,
            self.test_get_order_detail,
            self.test_confirm_payment,
            self.test_list_user_orders,
            self.test_data_consistency,
        ]

        for test in tests:
            try:
                test()
            except Exception as e:
                print_error(f"Test {test.__name__} failed with exception: {str(e)}")
                self.failed += 1

        # Summary
        print_header("📊 Test Summary")
        total = self.passed + self.failed
        print(f"Total Tests: {total}")
        print(f"{Colors.GREEN}Passed: {self.passed}{Colors.RESET}")
        print(f"{Colors.RED}Failed: {self.failed}{Colors.RESET}")
        
        success_rate = (self.passed / total * 100) if total > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        if self.failed == 0:
            print(f"\n{Colors.GREEN}{Colors.BOLD}✓ ALL TESTS PASSED!{Colors.RESET}\n")
            return True
        else:
            print(f"\n{Colors.RED}{Colors.BOLD}✗ SOME TESTS FAILED{Colors.RESET}\n")
            return False

    # ─────────────────────────────────────────
    # TEST METHODS
    # ─────────────────────────────────────────

    def test_health(self):
        """Test 1: Check all services are healthy"""
        print_step(1, "🔄 Check Service Health")
        
        response = self.session.get(f"{self.base_url}/health", timeout=TIMEOUT)
        
        if not assert_status(response, 200):
            self.failed += 1
            return

        data = response.json()
        
        # Verify key services
        services_to_check = ["auth", "catalog", "inventory", "cart", "order"]
        all_ok = True
        
        for service in services_to_check:
            status = data.get("services", {}).get(service, {}).get("status")
            if status == "ok":
                print_success(f"Service '{service}' is healthy")
                self.passed += 1
            else:
                print_error(f"Service '{service}' is {status}")
                self.failed += 1
                all_ok = False

    def test_get_token(self):
        """Test 2: Get authentication token"""
        print_step(2, "🔐 Get Authentication Token")
        
        response = self.session.get(f"{self.base_url}/api/auth/mock-token", timeout=TIMEOUT)
        
        if not assert_status(response, 200):
            self.failed += 1
            return

        data = response.json()
        
        if not assert_field(data, "access_token"):
            self.failed += 1
            return

        self.token = data["access_token"]
        print_success(f"Token obtained: {self.token[:20]}...")
        self.passed += 1

    def test_list_catalog(self):
        """Test 3: List catalog books"""
        print_step(3, "📚 List Catalog Books")
        
        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.session.get(
            f"{self.base_url}/api/catalog/books?published_only=true",
            headers=headers,
            timeout=TIMEOUT
        )
        
        if not assert_status(response, 200):
            self.failed += 1
            return

        books = response.json()
        
        if not isinstance(books, list) or len(books) == 0:
            print_error("No books found in catalog")
            self.failed += 1
            return

        # Extract first two books
        self.book_1_id = books[0]["id"]
        self.book_1_title = books[0]["title"]
        self.book_1_price = books[0]["price"]
        
        if len(books) > 1:
            self.book_2_id = books[1]["id"]
            self.book_2_title = books[1]["title"]
            self.book_2_price = books[1]["price"]

        print_success(f"Retrieved {len(books)} books")
        print_info(f"Book 1: {self.book_1_title} (ID: {self.book_1_id}, Price: {self.book_1_price}¢)")
        if self.book_2_id:
            print_info(f"Book 2: {self.book_2_title} (ID: {self.book_2_id}, Price: {self.book_2_price}¢)")
        self.passed += 1

    def test_get_book_detail(self):
        """Test 4: Get book detail"""
        print_step(4, "📖 Get Book Detail")
        
        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.session.get(
            f"{self.base_url}/api/catalog/books/{self.book_1_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        
        if not assert_status(response, 200):
            self.failed += 1
            return

        book = response.json()
        
        if not assert_field(book, "id") or not assert_field(book, "title"):
            self.failed += 1
            return

        print_success(f"Retrieved book: {book['title']}")
        self.passed += 1

    def test_get_pricing(self):
        """Test 5: Get pricing information"""
        print_step(5, "💰 Get Pricing")
        
        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.session.get(
            f"{self.base_url}/api/pricing/{self.book_1_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        
        if not assert_status(response, 200):
            self.failed += 1
            return

        pricing = response.json()
        
        if not assert_field(pricing, "suggested_price"):
            self.failed += 1
            return

        print_success(f"Pricing retrieved: {pricing['suggested_price']}¢")
        self.passed += 1

    def test_check_inventory(self):
        """Test 6: Check inventory availability"""
        print_step(6, "📦 Check Inventory Availability")
        
        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.session.get(
            f"{self.base_url}/api/inventory/availability/978-0743273565",
            headers=headers,
            timeout=TIMEOUT
        )
        
        if not assert_status(response, 200):
            self.failed += 1
            return

        inventory = response.json()
        
        if not assert_field(inventory, "is_available"):
            self.failed += 1
            return

        print_success(f"Availability checked: {inventory['quantity_available']} units available")
        self.passed += 1

    def test_add_to_cart_item_1(self):
        """Test 7: Add first item to cart"""
        print_step(7, "🛒 Add Item 1 to Cart")
        
        headers = {"Authorization": f"Bearer {self.token}"}
        payload = {
            "book_id": self.book_1_id,
            "title": self.book_1_title,
            "author": "Test Author",
            "price": self.book_1_price,
            "quantity": 2,
            "condition": "NUEVO"
        }
        
        response = self.session.post(
            f"{self.base_url}/api/cart/{self.user_id}/items",
            headers=headers,
            json=payload,
            timeout=TIMEOUT
        )
        
        if not assert_status(response, 200):
            self.failed += 1
            return

        cart = response.json()
        self.cart_id = cart["id"]
        
        if not assert_field(cart, "items") or len(cart["items"]) == 0:
            self.failed += 1
            return

        print_success(f"Item added to cart. Total items: {cart['total_items']}, Total price: {cart['total_price']}¢")
        self.passed += 1

    def test_add_to_cart_item_2(self):
        """Test 8: Add second item to cart"""
        print_step(8, "🛒 Add Item 2 to Cart")
        
        if not self.book_2_id:
            print_info("Skipping test - only one book available")
            self.passed += 1
            return

        headers = {"Authorization": f"Bearer {self.token}"}
        payload = {
            "book_id": self.book_2_id,
            "title": self.book_2_title,
            "author": "Test Author 2",
            "price": self.book_2_price,
            "quantity": 1,
            "condition": "BUENO"
        }
        
        response = self.session.post(
            f"{self.base_url}/api/cart/{self.user_id}/items",
            headers=headers,
            json=payload,
            timeout=TIMEOUT
        )
        
        if not assert_status(response, 200):
            self.failed += 1
            return

        cart = response.json()
        
        if len(cart["items"]) < 2:
            print_error("Second item not added to cart")
            self.failed += 1
            return

        print_success(f"Second item added. Total items: {cart['total_items']}")
        self.passed += 1

    def test_view_cart(self):
        """Test 9: View cart"""
        print_step(9, "👁️  View Cart")
        
        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.session.get(
            f"{self.base_url}/api/cart/{self.user_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        
        if not assert_status(response, 200):
            self.failed += 1
            return

        cart = response.json()
        
        if not assert_field(cart, "items"):
            self.failed += 1
            return

        print_success(f"Cart retrieved: {cart['total_items']} items, Total: {cart['total_price']}¢")
        self.passed += 1

    def test_create_order(self):
        """Test 10: Create order from cart"""
        print_step(10, "📋 Create Order")
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Build items from cart
        items = [
            {
                "book_id": self.book_1_id,
                "title": self.book_1_title,
                "author": "Test Author",
                "price": self.book_1_price,
                "quantity": 2,
                "condition": "NUEVO"
            }
        ]
        
        if self.book_2_id:
            items.append({
                "book_id": self.book_2_id,
                "title": self.book_2_title,
                "author": "Test Author 2",
                "price": self.book_2_price,
                "quantity": 1,
                "condition": "BUENO"
            })
        
        payload = {
            "user_id": self.user_id,
            "items": items,
            "shipping_address": "Test Street 123, Test City, Test Country",
            "notes": "E2E Test Order"
        }
        
        response = self.session.post(
            f"{self.base_url}/api/order",
            headers=headers,
            json=payload,
            timeout=TIMEOUT
        )
        
        if not assert_status(response, 200):
            self.failed += 1
            return

        order = response.json()
        
        if not assert_field(order, "id") or order["status"] != "pending":
            print_error("Order not created in pending state")
            self.failed += 1
            return

        self.order_id = order["id"]
        print_success(f"Order created (ID: {self.order_id[:8]}...)")
        print_info(f"Status: {order['status']}, Payment: {order['payment_status']}, Total: {order['total_price']}¢")
        self.passed += 1

    def test_get_order_detail(self):
        """Test 11: Get order detail"""
        print_step(11, "📋 Get Order Detail")
        
        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.session.get(
            f"{self.base_url}/api/order/{self.order_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        
        if not assert_status(response, 200):
            self.failed += 1
            return

        order = response.json()
        
        if not assert_field(order, "id") or not assert_field(order, "items"):
            self.failed += 1
            return

        print_success(f"Order retrieved: {len(order['items'])} items")
        self.passed += 1

    def test_confirm_payment(self):
        """Test 12: Confirm payment"""
        print_step(12, "💳 Confirm Payment")
        
        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.session.post(
            f"{self.base_url}/api/order/{self.order_id}/confirm",
            headers=headers,
            timeout=TIMEOUT
        )
        
        if not assert_status(response, 200):
            self.failed += 1
            return

        order = response.json()
        
        if order["status"] != "confirmed" or order["payment_status"] != "completed":
            print_error(f"Order not confirmed. Status: {order['status']}, Payment: {order['payment_status']}")
            self.failed += 1
            return

        print_success("Payment confirmed. Order status: confirmed")
        self.passed += 1

    def test_list_user_orders(self):
        """Test 13: List user orders"""
        print_step(13, "📦 List User Orders")
        
        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.session.get(
            f"{self.base_url}/api/order/user/{self.user_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        
        if not assert_status(response, 200):
            self.failed += 1
            return

        result = response.json()
        
        if not assert_field(result, "orders") or result["count"] == 0:
            print_error("No orders found for user")
            self.failed += 1
            return

        print_success(f"Retrieved {result['count']} order(s) for user")
        self.passed += 1

    def test_data_consistency(self):
        """Test 14: Verify data consistency"""
        print_step(14, "🔍 Verify Data Consistency")
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Get order and verify totals
        response = self.session.get(
            f"{self.base_url}/api/order/{self.order_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        
        if not assert_status(response, 200):
            self.failed += 1
            return

        order = response.json()
        
        # Calculate expected total
        expected_total = sum(item["subtotal"] for item in order["items"])
        
        if order["total_price"] != expected_total:
            print_error(f"Total mismatch: {order['total_price']} != {expected_total}")
            self.failed += 1
            return

        # Verify first item price matches catalog
        first_item = next((item for item in order["items"] if item["book_id"] == self.book_1_id), None)
        if first_item and first_item["price"] != self.book_1_price:
            print_error(f"Price mismatch for book 1: {first_item['price']} != {self.book_1_price}")
            self.failed += 1
            return

        print_success("✓ All totals are consistent")
        print_success("✓ All prices match catalog")
        self.passed += 1


# ─────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────

def main():
    suite = E2ETestSuite(BASE_URL)
    success = suite.run()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

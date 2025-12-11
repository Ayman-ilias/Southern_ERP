"""
Comprehensive System Test Script
Tests Client Info and Sample Department modules with dummy data
"""

import requests
import json
from typing import Dict, Any, List

BASE_URL = "http://localhost:8000/api/v1"

class SystemTester:
    def __init__(self):
        self.results = {
            "client_info": {},
            "sample_department": {},
            "errors": []
        }
        self.created_ids = {
            "buyers": [],
            "suppliers": [],
            "styles": [],
            "variants": [],
            "samples": [],
            "tna": [],
            "plan": []
        }

    def log_error(self, module: str, operation: str, error: str):
        """Log errors"""
        error_msg = f"{module} - {operation}: {error}"
        self.results["errors"].append(error_msg)
        print(f"❌ {error_msg}")

    def test_endpoint(self, method: str, url: str, data: Dict = None, expected_status: int = 200) -> Any:
        """Test an API endpoint"""
        try:
            if method == "GET":
                response = requests.get(url)
            elif method == "POST":
                response = requests.post(url, json=data)
            elif method == "PUT":
                response = requests.put(url, json=data)
            elif method == "DELETE":
                response = requests.delete(url)
            else:
                raise ValueError(f"Unknown method: {method}")

            if response.status_code == expected_status:
                return response.json() if response.content else None
            else:
                raise Exception(f"Status {response.status_code}: {response.text}")
        except Exception as e:
            raise Exception(str(e))

    # ==================== CLIENT INFO TESTS ====================

    def test_buyers(self):
        """Test Buyers CRUD"""
        print("\n📋 Testing Buyers...")
        module = "buyers"
        
        # CREATE
        try:
            buyer_data = {
                "buyer_name": "Test Buyer Inc",
                "brand_name": "TestBrand",
                "company_name": "Test Buyer Company Ltd",
                "head_office_country": "United States",
                "email": "test@buyer.com",
                "phone": "+1-555-0123",
                "website": "https://testbuyer.com",
                "rating": 4.5,
                "status": "active"
            }
            result = self.test_endpoint("POST", f"{BASE_URL}/buyers/", buyer_data, 201)
            buyer_id = result["id"]
            self.created_ids["buyers"].append(buyer_id)
            print(f"  ✅ Created buyer: {buyer_id}")
            self.results["client_info"]["buyers_create"] = "✅ PASS"
        except Exception as e:
            self.log_error("Buyers", "CREATE", str(e))
            self.results["client_info"]["buyers_create"] = "❌ FAIL"
            return

        # READ
        try:
            result = self.test_endpoint("GET", f"{BASE_URL}/buyers/{buyer_id}")
            print(f"  ✅ Read buyer: {buyer_id}")
            self.results["client_info"]["buyers_read"] = "✅ PASS"
        except Exception as e:
            self.log_error("Buyers", "READ", str(e))
            self.results["client_info"]["buyers_read"] = "❌ FAIL"

        # UPDATE
        try:
            update_data = {"rating": 4.8}
            result = self.test_endpoint("PUT", f"{BASE_URL}/buyers/{buyer_id}", update_data)
            print(f"  ✅ Updated buyer: {buyer_id}")
            self.results["client_info"]["buyers_update"] = "✅ PASS"
        except Exception as e:
            self.log_error("Buyers", "UPDATE", str(e))
            self.results["client_info"]["buyers_update"] = "❌ FAIL"

        # LIST
        try:
            result = self.test_endpoint("GET", f"{BASE_URL}/buyers/")
            print(f"  ✅ Listed buyers: {len(result)} records")
            self.results["client_info"]["buyers_list"] = "✅ PASS"
        except Exception as e:
            self.log_error("Buyers", "LIST", str(e))
            self.results["client_info"]["buyers_list"] = "❌ FAIL"

    def test_contacts(self):
        """Test Contact Persons"""
        print("\n📋 Testing Contact Persons...")
        
        if not self.created_ids["buyers"]:
            print("  ⚠️  Skipping - No buyers created")
            return

        buyer_id = self.created_ids["buyers"][0]
        
        try:
            contact_data = {
                "buyer_id": buyer_id,
                "contact_person_name": "John Doe",
                "company": "Test Buyer Inc",
                "department": "Procurement",
                "designation": "Manager",
                "phone_number": "+1-555-0124",
                "corporate_mail": "john@testbuyer.com",
                "country": "United States"
            }
            result = self.test_endpoint("POST", f"{BASE_URL}/buyers/contacts", contact_data, 201)
            print(f"  ✅ Created contact: {result['id']}")
            self.results["client_info"]["contacts_create"] = "✅ PASS"
        except Exception as e:
            self.log_error("Contacts", "CREATE", str(e))
            self.results["client_info"]["contacts_create"] = "❌ FAIL"

    def test_shipping(self):
        """Test Shipping Info"""
        print("\n📋 Testing Shipping Info...")
        
        if not self.created_ids["buyers"]:
            print("  ⚠️  Skipping - No buyers created")
            return

        buyer_id = self.created_ids["buyers"][0]
        
        try:
            shipping_data = {
                "buyer_id": buyer_id,
                "brand_name": "TestBrand",
                "company_name": "Test Buyer Company Ltd",
                "destination_country": "United States",
                "destination_country_code": "US",
                "destination_port": "Los Angeles",
                "place_of_delivery": "LA Warehouse",
                "incoterm": "FOB"
            }
            result = self.test_endpoint("POST", f"{BASE_URL}/buyers/shipping", shipping_data, 201)
            print(f"  ✅ Created shipping info: {result['id']}")
            self.results["client_info"]["shipping_create"] = "✅ PASS"
        except Exception as e:
            self.log_error("Shipping", "CREATE", str(e))
            self.results["client_info"]["shipping_create"] = "❌ FAIL"

    def test_banking(self):
        """Test Banking Info"""
        print("\n📋 Testing Banking Info...")
        
        try:
            banking_data = {
                "client_name": "Test Buyer Inc",
                "country": "United States",
                "bank_name": "Test Bank",
                "sort_code": "123456",
                "swift_code": "TESTUS33",
                "account_number": "1234567890",
                "currency": "USD",
                "account_type": "Checking"
            }
            result = self.test_endpoint("POST", f"{BASE_URL}/buyers/banking", banking_data, 201)
            print(f"  ✅ Created banking info: {result['id']}")
            self.results["client_info"]["banking_create"] = "✅ PASS"
        except Exception as e:
            self.log_error("Banking", "CREATE", str(e))
            self.results["client_info"]["banking_create"] = "❌ FAIL"

    # ==================== SAMPLE DEPARTMENT TESTS ====================

    def test_style_summary(self):
        """Test Style Summary"""
        print("\n📋 Testing Style Summary...")
        
        if not self.created_ids["buyers"]:
            print("  ⚠️  Skipping - No buyers created")
            return

        buyer_id = self.created_ids["buyers"][0]
        
        try:
            style_data = {
                "buyer_id": buyer_id,
                "style_name": "Test Polo Shirt",
                "style_id": "TEST-001",
                "product_category": "Apparel",
                "product_type": "Polo Shirt",
                "gauge": "7",
                "is_set": True,
                "set_piece_count": 2
            }
            result = self.test_endpoint("POST", f"{BASE_URL}/samples/styles", style_data, 201)
            style_id = result["id"]
            self.created_ids["styles"].append(style_id)
            print(f"  ✅ Created style: {style_id} (Style ID: {result['style_id']})")
            self.results["sample_department"]["style_summary_create"] = "✅ PASS"
        except Exception as e:
            self.log_error("Style Summary", "CREATE", str(e))
            self.results["sample_department"]["style_summary_create"] = "❌ FAIL"
            return

        # READ
        try:
            result = self.test_endpoint("GET", f"{BASE_URL}/samples/styles/{style_id}")
            print(f"  ✅ Read style: {style_id}")
            self.results["sample_department"]["style_summary_read"] = "✅ PASS"
        except Exception as e:
            self.log_error("Style Summary", "READ", str(e))
            self.results["sample_department"]["style_summary_read"] = "❌ FAIL"

    def test_style_variants(self):
        """Test Style Variants"""
        print("\n📋 Testing Style Variants...")
        
        if not self.created_ids["styles"]:
            print("  ⚠️  Skipping - No styles created")
            return

        style_id = self.created_ids["styles"][0]
        
        try:
            # Get style to get style_id string
            style = self.test_endpoint("GET", f"{BASE_URL}/samples/styles/{style_id}")
            base_style_id = style["style_id"]
            
            # Create variant with format: StyleID_piece_count_size_count
            variant_data = {
                "style_summary_id": style_id,
                "style_name": "Test Polo Shirt",
                "style_id": f"{base_style_id}_2_2",  # 2 pieces, 2 sizes
                "colour_name": "Navy Blue",
                "colour_code": "#001F3F",
                "piece_name": "Top",
                "sizes": ["S", "M"],
                "is_multicolor": False
            }
            result = self.test_endpoint("POST", f"{BASE_URL}/samples/style-variants", variant_data, 201)
            variant_id = result["id"]
            self.created_ids["variants"].append(variant_id)
            print(f"  ✅ Created variant: {variant_id} (Variant ID: {result['style_id']})")
            self.results["sample_department"]["style_variants_create"] = "✅ PASS"
        except Exception as e:
            self.log_error("Style Variants", "CREATE", str(e))
            self.results["sample_department"]["style_variants_create"] = "❌ FAIL"

    def test_samples(self):
        """Test Sample Primary Info"""
        print("\n📋 Testing Sample Primary Info...")
        
        if not self.created_ids["buyers"] or not self.created_ids["styles"]:
            print("  ⚠️  Skipping - Missing dependencies")
            return

        buyer_id = self.created_ids["buyers"][0]
        style_id = self.created_ids["styles"][0]
        
        try:
            sample_data = {
                "sample_id": "TEST_2025_12_001",
                "buyer_id": buyer_id,
                "style_id": style_id,
                "sample_type": "Proto",
                "sample_description": "Test sample for system testing",
                "item": "Apparel",
                "gauge": "7",
                "worksheet_rcv_date": "2025-12-09",
                "notes": "Test sample"
            }
            result = self.test_endpoint("POST", f"{BASE_URL}/samples/", sample_data, 201)
            sample_id = result["id"]
            self.created_ids["samples"].append(sample_id)
            print(f"  ✅ Created sample: {sample_id} (Sample ID: {result['sample_id']})")
            self.results["sample_department"]["samples_create"] = "✅ PASS"
        except Exception as e:
            self.log_error("Samples", "CREATE", str(e))
            self.results["sample_department"]["samples_create"] = "❌ FAIL"

    def test_tna(self):
        """Test TNA (Time and Action)"""
        print("\n📋 Testing TNA...")
        
        if not self.created_ids["samples"]:
            print("  ⚠️  Skipping - No samples created")
            return

        sample_id = "TEST_2025_12_001"  # Use the sample_id string
        
        try:
            tna_data = {
                "sample_id": sample_id,
                "buyer_name": "Test Buyer Inc",
                "style_name": "Test Polo Shirt",
                "sample_type": "Proto",
                "yarn_rcv_date": "2025-12-10",
                "required_date": "2025-12-20",
                "color": "Navy Blue",
                "piece_name": "Top",
                "notes": "Test TNA record"
            }
            result = self.test_endpoint("POST", f"{BASE_URL}/samples/tna", tna_data, 201)
            tna_id = result["id"]
            self.created_ids["tna"].append(tna_id)
            print(f"  ✅ Created TNA: {tna_id}")
            self.results["sample_department"]["tna_create"] = "✅ PASS"
            
            # Test UPDATE
            try:
                update_data = {"notes": "Updated TNA notes"}
                result = self.test_endpoint("PUT", f"{BASE_URL}/samples/tna/{tna_id}", update_data)
                print(f"  ✅ Updated TNA: {tna_id}")
                self.results["sample_department"]["tna_update"] = "✅ PASS"
            except Exception as e:
                self.log_error("TNA", "UPDATE", str(e))
                self.results["sample_department"]["tna_update"] = "❌ FAIL"
                
        except Exception as e:
            self.log_error("TNA", "CREATE", str(e))
            self.results["sample_department"]["tna_create"] = "❌ FAIL"

    def test_plan(self):
        """Test Sample Plan"""
        print("\n📋 Testing Sample Plan...")
        
        if not self.created_ids["samples"]:
            print("  ⚠️  Skipping - No samples created")
            return

        sample_id = "TEST_2025_12_001"
        
        try:
            plan_data = {
                "sample_id": sample_id,
                "buyer_name": "Test Buyer Inc",
                "style_name": "Test Polo Shirt",
                "sample_type": "Proto",
                "assigned_designer": "John Designer",
                "required_sample_quantity": 5,
                "round": 1,
                "submit_status": "Pending"
            }
            result = self.test_endpoint("POST", f"{BASE_URL}/samples/plan", plan_data, 201)
            print(f"  ✅ Created plan: {result['id']}")
            self.results["sample_department"]["plan_create"] = "✅ PASS"
        except Exception as e:
            self.log_error("Plan", "CREATE", str(e))
            self.results["sample_department"]["plan_create"] = "❌ FAIL"

    def test_required_materials(self):
        """Test Required Materials"""
        print("\n📋 Testing Required Materials...")
        
        if not self.created_ids["variants"]:
            print("  ⚠️  Skipping - No variants created")
            return

        variant_id = self.created_ids["variants"][0]
        
        try:
            material_data = {
                "style_variant_id": variant_id,
                "style_name": "Test Polo Shirt",
                "style_id": "TEST-001_2_2",
                "material": "Cotton Fabric",
                "uom": "Meter",
                "consumption_per_piece": 2.5,
                "converted_uom": "Yard",
                "converted_consumption": 2.73,
                "remarks": "Test material"
            }
            result = self.test_endpoint("POST", f"{BASE_URL}/samples/required-materials", material_data, 201)
            print(f"  ✅ Created required material: {result['id']}")
            self.results["sample_department"]["materials_create"] = "✅ PASS"
        except Exception as e:
            self.log_error("Required Materials", "CREATE", str(e))
            self.results["sample_department"]["materials_create"] = "❌ FAIL"

    def run_all_tests(self):
        """Run all tests"""
        print("=" * 60)
        print("🧪 COMPREHENSIVE SYSTEM TEST")
        print("=" * 60)
        
        # Client Info Tests
        print("\n" + "=" * 60)
        print("📁 CLIENT INFO MODULE")
        print("=" * 60)
        self.test_buyers()
        self.test_contacts()
        self.test_shipping()
        self.test_banking()
        
        # Sample Department Tests
        print("\n" + "=" * 60)
        print("📦 SAMPLE DEPARTMENT MODULE")
        print("=" * 60)
        self.test_style_summary()
        self.test_style_variants()
        self.test_samples()
        self.test_tna()
        self.test_plan()
        self.test_required_materials()
        
        # Print Summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        print("\n📁 CLIENT INFO:")
        for test, result in self.results["client_info"].items():
            print(f"  {result} {test}")
        
        print("\n📦 SAMPLE DEPARTMENT:")
        for test, result in self.results["sample_department"].items():
            print(f"  {result} {test}")
        
        if self.results["errors"]:
            print("\n❌ ERRORS:")
            for error in self.results["errors"]:
                print(f"  - {error}")
        else:
            print("\n✅ No errors found!")
        
        print("\n" + "=" * 60)

if __name__ == "__main__":
    tester = SystemTester()
    tester.run_all_tests()


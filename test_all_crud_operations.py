#!/usr/bin/env python3
"""
Comprehensive CRUD Testing Script for ERP System
Tests all entities with real data and verifies Create, Read, Update, Delete operations
"""

import requests
import json
import time
from typing import Dict, Any, List

BASE_URL = "http://localhost:8000/api/v1"
results = []

# Add retry logic for requests
def make_request(method, url, **kwargs):
    """Make request with retry logic"""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = requests.request(method, url, timeout=10, **kwargs)
            return response
        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                time.sleep(1)
                continue
            raise
    return None

def log_result(entity: str, operation: str, status: str, details: str = ""):
    """Log test result"""
    result = {
        "entity": entity,
        "operation": operation,
        "status": status,
        "details": details
    }
    results.append(result)
    status_icon = "✅" if status == "PASS" else "❌"
    print(f"{status_icon} {entity} - {operation}: {status} {details}")

def create_buyer(data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a buyer"""
    response = make_request('POST', f"{BASE_URL}/buyers/", json=data)
    if response and response.status_code == 201:
        return response.json()
    raise Exception(f"Failed to create buyer: {response.status_code if response else 'No response'} - {response.text if response else 'Connection error'}")

def create_supplier(data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a supplier"""
    response = make_request('POST', f"{BASE_URL}/suppliers/", json=data)
    if response and response.status_code == 201:
        return response.json()
    raise Exception(f"Failed to create supplier: {response.status_code if response else 'No response'} - {response.text if response else 'Connection error'}")

def create_contact(data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a contact"""
    response = make_request('POST', f"{BASE_URL}/buyers/contacts/", json=data)
    if response and response.status_code == 201:
        return response.json()
    raise Exception(f"Failed to create contact: {response.status_code if response else 'No response'} - {response.text if response else 'Connection error'}")

def create_shipping(data: Dict[str, Any]) -> Dict[str, Any]:
    """Create shipping info"""
    response = make_request('POST', f"{BASE_URL}/buyers/shipping", json=data)
    if response and response.status_code == 201:
        return response.json()
    raise Exception(f"Failed to create shipping: {response.status_code if response else 'No response'} - {response.text if response else 'Connection error'}")

def create_banking(data: Dict[str, Any]) -> Dict[str, Any]:
    """Create banking info"""
    response = make_request('POST', f"{BASE_URL}/buyers/banking", json=data)
    if response and response.status_code == 201:
        return response.json()
    raise Exception(f"Failed to create banking: {response.status_code if response else 'No response'} - {response.text if response else 'Connection error'}")

def test_buyers():
    """Test Buyers CRUD"""
    print("\n" + "="*60)
    print("Testing BUYERS CRUD Operations")
    print("="*60)
    
    buyer_ids = []
    
    # CREATE - Add 3 buyers
    buyers_data = [
        {
            "buyer_name": "H&M Group",
            "brand_name": "H&M",
            "company_name": "Hennes & Mauritz AB",
            "head_office_country": "Sweden",
            "email": "contact@hm.com",
            "phone": "+46 8 796 55 00",
            "website": "https://www.hm.com",
            "rating": 4.5,
            "status": "active"
        },
        {
            "buyer_name": "Zara Fashion",
            "brand_name": "Zara",
            "company_name": "Inditex Group",
            "head_office_country": "Spain",
            "email": "info@zara.com",
            "phone": "+34 981 185 400",
            "website": "https://www.zara.com",
            "rating": 4.7,
            "status": "active"
        },
        {
            "buyer_name": "Gap Inc",
            "brand_name": "Gap",
            "company_name": "Gap Inc.",
            "head_office_country": "United States",
            "email": "customerservice@gap.com",
            "phone": "+1 650 952 4400",
            "website": "https://www.gap.com",
            "rating": 4.3,
            "status": "active"
        }
    ]
    
    for buyer_data in buyers_data:
        try:
            buyer = create_buyer(buyer_data)
            buyer_ids.append(buyer['id'])
            log_result("Buyers", "CREATE", "PASS", f"Created buyer ID: {buyer['id']} - {buyer['buyer_name']}")
        except Exception as e:
            log_result("Buyers", "CREATE", "FAIL", str(e))
    
    if not buyer_ids:
        print("⚠️  No buyers created, skipping READ/UPDATE/DELETE tests")
        return
    
    # READ - Get all buyers
    try:
        response = make_request('GET', f"{BASE_URL}/buyers/")
        if response and response.status_code == 200:
            buyers = response.json()
            log_result("Buyers", "READ", "PASS", f"Retrieved {len(buyers)} buyers")
        else:
            log_result("Buyers", "READ", "FAIL", f"Status: {response.status_code if response else 'No response'}")
    except Exception as e:
        log_result("Buyers", "READ", "FAIL", str(e))
    
    # UPDATE - Update first buyer
    if buyer_ids:
        try:
            update_data = {"rating": 4.8}
            response = make_request('PUT', f"{BASE_URL}/buyers/{buyer_ids[0]}", json=update_data)
            if response and response.status_code == 200:
                log_result("Buyers", "UPDATE", "PASS", f"Updated buyer ID: {buyer_ids[0]}")
            else:
                log_result("Buyers", "UPDATE", "FAIL", f"Status: {response.status_code if response else 'No response'}")
        except Exception as e:
            log_result("Buyers", "UPDATE", "FAIL", str(e))
    
    # DELETE - Delete last buyer (keep first two)
    if len(buyer_ids) > 2:
        try:
            response = make_request('DELETE', f"{BASE_URL}/buyers/{buyer_ids[-1]}")
            if response and (response.status_code == 200 or response.status_code == 204):
                log_result("Buyers", "DELETE", "PASS", f"Deleted buyer ID: {buyer_ids[-1]}")
            else:
                log_result("Buyers", "DELETE", "FAIL", f"Status: {response.status_code if response else 'No response'}")
        except Exception as e:
            log_result("Buyers", "DELETE", "FAIL", str(e))

def test_suppliers():
    """Test Suppliers CRUD"""
    print("\n" + "="*60)
    print("Testing SUPPLIERS CRUD Operations")
    print("="*60)
    
    supplier_ids = []
    
    # CREATE - Add 3 suppliers
    suppliers_data = [
        {
            "supplier_name": "Premium Fabrics Ltd",
            "company_name": "Premium Textile Industries",
            "supplier_type": "Fabric",
            "contact_person": "Ahmed Rahman",
            "email": "ahmed@premiumfabrics.com",
            "phone": "+880 1712 345678",
            "country": "Bangladesh",
            "rating": 4.6
        },
        {
            "supplier_name": "Global Trims Co",
            "company_name": "Global Trims & Accessories",
            "supplier_type": "Trims",
            "contact_person": "Fatima Khan",
            "email": "fatima@globaltrims.com",
            "phone": "+880 1812 345679",
            "country": "Bangladesh",
            "rating": 4.4
        },
        {
            "supplier_name": "Elite Accessories",
            "company_name": "Elite Accessories Manufacturing",
            "supplier_type": "Accessories",
            "contact_person": "Mohammad Hassan",
            "email": "hassan@eliteacc.com",
            "phone": "+880 1912 345680",
            "country": "Bangladesh",
            "rating": 4.5
        }
    ]
    
    for supplier_data in suppliers_data:
        try:
            supplier = create_supplier(supplier_data)
            supplier_ids.append(supplier['id'])
            log_result("Suppliers", "CREATE", "PASS", f"Created supplier ID: {supplier['id']} - {supplier['supplier_name']}")
        except Exception as e:
            log_result("Suppliers", "CREATE", "FAIL", str(e))
    
    if not supplier_ids:
        print("⚠️  No suppliers created, skipping READ/UPDATE/DELETE tests")
        return
    
    # READ
    try:
        response = requests.get(f"{BASE_URL}/suppliers/")
        if response.status_code == 200:
            suppliers = response.json()
            log_result("Suppliers", "READ", "PASS", f"Retrieved {len(suppliers)} suppliers")
        else:
            log_result("Suppliers", "READ", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        log_result("Suppliers", "READ", "FAIL", str(e))
    
    # UPDATE
    if supplier_ids:
        try:
            update_data = {"rating": 4.7}
            response = requests.put(f"{BASE_URL}/suppliers/{supplier_ids[0]}", json=update_data)
            if response.status_code == 200:
                log_result("Suppliers", "UPDATE", "PASS", f"Updated supplier ID: {supplier_ids[0]}")
            else:
                log_result("Suppliers", "UPDATE", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            log_result("Suppliers", "UPDATE", "FAIL", str(e))
    
    # DELETE
    if len(supplier_ids) > 2:
        try:
            response = requests.delete(f"{BASE_URL}/suppliers/{supplier_ids[-1]}")
            if response.status_code == 200 or response.status_code == 204:
                log_result("Suppliers", "DELETE", "PASS", f"Deleted supplier ID: {supplier_ids[-1]}")
            else:
                log_result("Suppliers", "DELETE", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            log_result("Suppliers", "DELETE", "FAIL", str(e))

def test_contacts():
    """Test Contacts CRUD"""
    print("\n" + "="*60)
    print("Testing CONTACTS CRUD Operations")
    print("="*60)
    
    # First get buyer and supplier IDs
    try:
        buyers_resp = requests.get(f"{BASE_URL}/buyers/")
        buyers = buyers_resp.json() if buyers_resp.status_code == 200 else []
        
        suppliers_resp = requests.get(f"{BASE_URL}/suppliers/")
        suppliers = suppliers_resp.json() if suppliers_resp.status_code == 200 else []
    except:
        buyers = []
        suppliers = []
    
    if not buyers and not suppliers:
        print("⚠️  No buyers/suppliers found, skipping contacts test")
        return
    
    contact_ids = []
    buyer_id = buyers[0]['id'] if buyers else None
    supplier_id = suppliers[0]['id'] if suppliers else None
    
    # CREATE - Add 3 contacts
    contacts_data = []
    if buyer_id:
        contacts_data.append({
            "contact_person_name": "John Smith",
            "buyer_id": buyer_id,
            "supplier_id": None,
            "department": "Merchandising",
            "designation": "Senior Buyer",
            "phone_number": "+1 555 123 4567",
            "corporate_mail": "john.smith@hm.com",
            "country": "Sweden"
        })
    if buyer_id and len(buyers) > 1:
        contacts_data.append({
            "contact_person_name": "Maria Garcia",
            "buyer_id": buyers[1]['id'],
            "supplier_id": None,
            "department": "Quality Control",
            "designation": "QC Manager",
            "phone_number": "+34 555 987 6543",
            "corporate_mail": "maria.garcia@zara.com",
            "country": "Spain"
        })
    if supplier_id:
        contacts_data.append({
            "contact_person_name": "Rashid Ali",
            "buyer_id": None,
            "supplier_id": supplier_id,
            "department": "Sales",
            "designation": "Sales Manager",
            "phone_number": "+880 1712 345678",
            "corporate_mail": "rashid@premiumfabrics.com",
            "country": "Bangladesh"
        })
    
    for contact_data in contacts_data:
        try:
            contact = create_contact(contact_data)
            contact_ids.append(contact['id'])
            log_result("Contacts", "CREATE", "PASS", f"Created contact ID: {contact['id']} - {contact['contact_person_name']}")
        except Exception as e:
            log_result("Contacts", "CREATE", "FAIL", str(e))
    
    if not contact_ids:
        print("⚠️  No contacts created, skipping READ/UPDATE/DELETE tests")
        return
    
    # READ
    try:
        response = requests.get(f"{BASE_URL}/buyers/contacts")
        if response.status_code == 200:
            contacts = response.json()
            log_result("Contacts", "READ", "PASS", f"Retrieved {len(contacts)} contacts")
        else:
            log_result("Contacts", "READ", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        log_result("Contacts", "READ", "FAIL", str(e))
    
    # UPDATE
    if contact_ids:
        try:
            update_data = {"designation": "Lead Buyer"}
            response = requests.put(f"{BASE_URL}/buyers/contacts/{contact_ids[0]}", json=update_data)
            if response.status_code == 200:
                log_result("Contacts", "UPDATE", "PASS", f"Updated contact ID: {contact_ids[0]}")
            else:
                log_result("Contacts", "UPDATE", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            log_result("Contacts", "UPDATE", "FAIL", str(e))
    
    # DELETE
    if len(contact_ids) > 2:
        try:
            response = requests.delete(f"{BASE_URL}/buyers/contacts/{contact_ids[-1]}")
            if response.status_code == 200 or response.status_code == 204:
                log_result("Contacts", "DELETE", "PASS", f"Deleted contact ID: {contact_ids[-1]}")
            else:
                log_result("Contacts", "DELETE", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            log_result("Contacts", "DELETE", "FAIL", str(e))

def test_shipping():
    """Test Shipping CRUD"""
    print("\n" + "="*60)
    print("Testing SHIPPING CRUD Operations")
    print("="*60)
    
    # Get buyer ID
    try:
        buyers_resp = requests.get(f"{BASE_URL}/buyers/")
        buyers = buyers_resp.json() if buyers_resp.status_code == 200 else []
    except:
        buyers = []
    
    if not buyers:
        print("⚠️  No buyers found, skipping shipping test")
        return
    
    buyer = buyers[0]
    shipping_ids = []
    
    # CREATE - Add 3 shipping destinations
    shipping_data = [
        {
            "buyer_id": buyer['id'],
            "buyer_name": buyer['buyer_name'],
            "brand_name": buyer.get('brand_name', buyer['buyer_name']),
            "company_name": buyer.get('company_name', buyer['buyer_name']),
            "destination_country": "United States",
            "destination_country_code": "US",
            "destination_port": "Los Angeles",
            "place_of_delivery": "LA Port Terminal 5",
            "destination_code": "USLAX",
            "warehouse_no": "WH-001",
            "address": "123 Port Street, Los Angeles, CA 90001"
        },
        {
            "buyer_id": buyer['id'],
            "buyer_name": buyer['buyer_name'],
            "brand_name": buyer.get('brand_name', buyer['buyer_name']),
            "company_name": buyer.get('company_name', buyer['buyer_name']),
            "destination_country": "United Kingdom",
            "destination_country_code": "GB",
            "destination_port": "Felixstowe",
            "place_of_delivery": "Felixstowe Port",
            "destination_code": "GBFEL",
            "warehouse_no": "WH-002",
            "address": "Port of Felixstowe, Suffolk, UK"
        },
        {
            "buyer_id": buyer['id'],
            "buyer_name": buyer['buyer_name'],
            "brand_name": buyer.get('brand_name', buyer['buyer_name']),
            "company_name": buyer.get('company_name', buyer['buyer_name']),
            "destination_country": "Germany",
            "destination_country_code": "DE",
            "destination_port": "Hamburg",
            "place_of_delivery": "Hamburg Port",
            "destination_code": "DEHAM",
            "warehouse_no": "WH-003",
            "address": "Hamburg Port, 20457 Hamburg, Germany"
        }
    ]
    
    for ship_data in shipping_data:
        try:
            shipping = create_shipping(ship_data)
            shipping_ids.append(shipping['id'])
            log_result("Shipping", "CREATE", "PASS", f"Created shipping ID: {shipping['id']} - {ship_data['destination_port']}")
        except Exception as e:
            log_result("Shipping", "CREATE", "FAIL", str(e))
    
    if not shipping_ids:
        print("⚠️  No shipping records created, skipping READ/UPDATE/DELETE tests")
        return
    
    # READ
    try:
        response = requests.get(f"{BASE_URL}/buyers/shipping")
        if response.status_code == 200:
            shipping_list = response.json()
            log_result("Shipping", "READ", "PASS", f"Retrieved {len(shipping_list)} shipping records")
        else:
            log_result("Shipping", "READ", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        log_result("Shipping", "READ", "FAIL", str(e))
    
    # UPDATE
    if shipping_ids:
        try:
            update_data = {"warehouse_no": "WH-UPDATED-001"}
            response = requests.put(f"{BASE_URL}/buyers/shipping/{shipping_ids[0]}", json=update_data)
            if response.status_code == 200:
                log_result("Shipping", "UPDATE", "PASS", f"Updated shipping ID: {shipping_ids[0]}")
            else:
                log_result("Shipping", "UPDATE", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            log_result("Shipping", "UPDATE", "FAIL", str(e))
    
    # DELETE
    if len(shipping_ids) > 2:
        try:
            response = requests.delete(f"{BASE_URL}/buyers/shipping/{shipping_ids[-1]}")
            if response.status_code == 200 or response.status_code == 204:
                log_result("Shipping", "DELETE", "PASS", f"Deleted shipping ID: {shipping_ids[-1]}")
            else:
                log_result("Shipping", "DELETE", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            log_result("Shipping", "DELETE", "FAIL", str(e))

def test_banking():
    """Test Banking CRUD"""
    print("\n" + "="*60)
    print("Testing BANKING CRUD Operations")
    print("="*60)
    
    # Get buyer and supplier IDs
    try:
        buyers_resp = requests.get(f"{BASE_URL}/buyers/")
        buyers = buyers_resp.json() if buyers_resp.status_code == 200 else []
        
        suppliers_resp = requests.get(f"{BASE_URL}/suppliers/")
        suppliers = suppliers_resp.json() if suppliers_resp.status_code == 200 else []
    except:
        buyers = []
        suppliers = []
    
    if not buyers and not suppliers:
        print("⚠️  No buyers/suppliers found, skipping banking test")
        return
    
    banking_ids = []
    
    # CREATE - Add 3 banking records
    banking_data = []
    if buyers:
        banking_data.append({
            "client_type": "buyer",
            "client_id": str(buyers[0]['id']),
            "client_name": buyers[0]['buyer_name'],
            "country": "Sweden",
            "bank_name": "Swedbank AB",
            "sort_code": "SWED-123",
            "account_number": "SE1234567890123456789012"
        })
    if buyers and len(buyers) > 1:
        banking_data.append({
            "client_type": "buyer",
            "client_id": str(buyers[1]['id']),
            "client_name": buyers[1]['buyer_name'],
            "country": "Spain",
            "bank_name": "Banco Santander",
            "sort_code": "BS-456",
            "account_number": "ES9121000418450200051332"
        })
    if suppliers:
        banking_data.append({
            "client_type": "supplier",
            "client_id": str(suppliers[0]['id']),
            "client_name": suppliers[0]['supplier_name'],
            "country": "Bangladesh",
            "bank_name": "Sonali Bank Limited",
            "sort_code": "SB-789",
            "account_number": "1234567890123"
        })
    
    for bank_data in banking_data:
        try:
            banking = create_banking(bank_data)
            banking_ids.append(banking['id'])
            log_result("Banking", "CREATE", "PASS", f"Created banking ID: {banking['id']} - {bank_data['bank_name']}")
        except Exception as e:
            log_result("Banking", "CREATE", "FAIL", str(e))
    
    if not banking_ids:
        print("⚠️  No banking records created, skipping READ/UPDATE/DELETE tests")
        return
    
    # READ
    try:
        response = requests.get(f"{BASE_URL}/buyers/banking")
        if response.status_code == 200:
            banking_list = response.json()
            log_result("Banking", "READ", "PASS", f"Retrieved {len(banking_list)} banking records")
        else:
            log_result("Banking", "READ", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        log_result("Banking", "READ", "FAIL", str(e))
    
    # UPDATE
    if banking_ids:
        try:
            update_data = {"bank_name": "Updated Bank Name"}
            response = requests.put(f"{BASE_URL}/buyers/banking/{banking_ids[0]}", json=update_data)
            if response.status_code == 200:
                log_result("Banking", "UPDATE", "PASS", f"Updated banking ID: {banking_ids[0]}")
            else:
                log_result("Banking", "UPDATE", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            log_result("Banking", "UPDATE", "FAIL", str(e))
    
    # DELETE
    if len(banking_ids) > 2:
        try:
            response = requests.delete(f"{BASE_URL}/buyers/banking/{banking_ids[-1]}")
            if response.status_code == 200 or response.status_code == 204:
                log_result("Banking", "DELETE", "PASS", f"Deleted banking ID: {banking_ids[-1]}")
            else:
                log_result("Banking", "DELETE", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            log_result("Banking", "DELETE", "FAIL", str(e))

def print_summary():
    """Print test summary"""
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    total = len(results)
    passed = len([r for r in results if r['status'] == 'PASS'])
    failed = len([r for r in results if r['status'] == 'FAIL'])
    
    print(f"\nTotal Tests: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"Success Rate: {(passed/total*100):.1f}%")
    
    print("\n" + "-"*60)
    print("Detailed Results:")
    print("-"*60)
    
    entities = {}
    for result in results:
        entity = result['entity']
        if entity not in entities:
            entities[entity] = []
        entities[entity].append(result)
    
    for entity, entity_results in entities.items():
        print(f"\n{entity}:")
        for result in entity_results:
            status_icon = "✅" if result['status'] == "PASS" else "❌"
            print(f"  {status_icon} {result['operation']}: {result['details']}")

if __name__ == "__main__":
    print("="*60)
    print("ERP SYSTEM - COMPREHENSIVE CRUD TESTING")
    print("="*60)
    print(f"Testing API at: {BASE_URL}")
    print("="*60)
    
    try:
        # Test all entities
        test_buyers()
        test_suppliers()
        test_contacts()
        test_shipping()
        test_banking()
        
        # Print summary
        print_summary()
        
    except Exception as e:
        print(f"\n❌ Test suite failed with error: {e}")
        import traceback
        traceback.print_exc()


# Comprehensive CRUD Testing Guide

This guide provides step-by-step instructions to test all CRUD operations with real data.

## Prerequisites
- All Docker containers are running
- Frontend accessible at: http://localhost:2222
- Backend API accessible at: http://localhost:8000

---

## 1. BUYERS CRUD Testing

### CREATE - Add 3 Buyers
1. Navigate to: http://localhost:2222/dashboard/erp/clients/buyers
2. Click "Add Buyer" button
3. Fill in the form with:

**Buyer 1:**
- Buyer Name: `H&M Group`
- Brand Name: `H&M`
- Company Name: `Hennes & Mauritz AB`
- Head Office Country: `Sweden`
- Email: `contact@hm.com`
- Phone: `+46 8 796 55 00`
- Website: `https://www.hm.com`
- Rating: `4.5`
- Status: `Active`
- Click "Create"

**Buyer 2:**
- Buyer Name: `Zara Fashion`
- Brand Name: `Zara`
- Company Name: `Inditex Group`
- Head Office Country: `Spain`
- Email: `info@zara.com`
- Phone: `+34 981 185 400`
- Website: `https://www.zara.com`
- Rating: `4.7`
- Status: `Active`
- Click "Create"

**Buyer 3:**
- Buyer Name: `Gap Inc`
- Brand Name: `Gap`
- Company Name: `Gap Inc.`
- Head Office Country: `United States`
- Email: `customerservice@gap.com`
- Phone: `+1 650 952 4400`
- Website: `https://www.gap.com`
- Rating: `4.3`
- Status: `Active`
- Click "Create"

### READ - Verify Data
- ✅ Check that all 3 buyers appear in the table
- ✅ Verify all fields are displayed correctly
- ✅ Test filters (search, country, status)
- ✅ Test row limit (10, 20, 50, All)

### UPDATE - Modify Buyer
1. Click the Edit icon (pencil) on the first buyer
2. Change Rating from `4.5` to `4.8`
3. Click "Update"
4. ✅ Verify the rating is updated in the table

### DELETE - Remove Buyer
1. Click the Delete icon (trash) on the last buyer (Gap Inc)
2. Confirm deletion
3. ✅ Verify the buyer is removed from the table

---

## 2. SUPPLIERS CRUD Testing

### CREATE - Add 3 Suppliers
1. Navigate to: http://localhost:2222/dashboard/erp/clients/suppliers
2. Click "Add Supplier" button
3. Fill in the form with:

**Supplier 1:**
- Supplier Name: `Premium Fabrics Ltd`
- Company Name: `Premium Textile Industries`
- Supplier Type: `Fabric`
- Contact Person: `Ahmed Rahman`
- Email: `ahmed@premiumfabrics.com`
- Phone: `+880 1712 345678`
- Country: `Bangladesh`
- Rating: `4.6`
- Click "Create"

**Supplier 2:**
- Supplier Name: `Global Trims Co`
- Company Name: `Global Trims & Accessories`
- Supplier Type: `Trims`
- Contact Person: `Fatima Khan`
- Email: `fatima@globaltrims.com`
- Phone: `+880 1812 345679`
- Country: `Bangladesh`
- Rating: `4.4`
- Click "Create"

**Supplier 3:**
- Supplier Name: `Elite Accessories`
- Company Name: `Elite Accessories Manufacturing`
- Supplier Type: `Accessories`
- Contact Person: `Mohammad Hassan`
- Email: `hassan@eliteacc.com`
- Phone: `+880 1912 345680`
- Country: `Bangladesh`
- Rating: `4.5`
- Click "Create"

### READ - Verify Data
- ✅ Check that all 3 suppliers appear in the table
- ✅ Verify all fields are displayed correctly
- ✅ Test filters (search, type, country, rating)
- ✅ Test export functionality

### UPDATE - Modify Supplier
1. Click the Edit icon on the first supplier
2. Change Rating from `4.6` to `4.7`
3. Click "Update"
4. ✅ Verify the rating is updated

### DELETE - Remove Supplier
1. Click the Delete icon on the last supplier (Elite Accessories)
2. Confirm deletion
3. ✅ Verify the supplier is removed

---

## 3. CONTACTS CRUD Testing

### CREATE - Add 3 Contacts
1. Navigate to: http://localhost:2222/dashboard/erp/clients/contacts
2. Click "Add Contact" button
3. Fill in the form with:

**Contact 1 (Buyer Contact):**
- Contact Person Name: `John Smith`
- Company Type: `Buyer`
- Company: Select `H&M Group` (created in step 1)
- Department: `Merchandising`
- Designation: `Senior Buyer`
- Phone Number: `+1 555 123 4567`
- Corporate Mail: `john.smith@hm.com`
- Country: `Sweden`
- Click "Create"

**Contact 2 (Buyer Contact):**
- Contact Person Name: `Maria Garcia`
- Company Type: `Buyer`
- Company: Select `Zara Fashion`
- Department: `Quality Control`
- Designation: `QC Manager`
- Phone Number: `+34 555 987 6543`
- Corporate Mail: `maria.garcia@zara.com`
- Country: `Spain`
- Click "Create"

**Contact 3 (Supplier Contact):**
- Contact Person Name: `Rashid Ali`
- Company Type: `Supplier`
- Company: Select `Premium Fabrics Ltd`
- Department: `Sales`
- Designation: `Sales Manager`
- Phone Number: `+880 1712 345678`
- Corporate Mail: `rashid@premiumfabrics.com`
- Country: `Bangladesh`
- Click "Create"

### READ - Verify Data
- ✅ Check that all 3 contacts appear in the table
- ✅ Verify company name displays correctly
- ✅ Test filters (search, company type, buyer, supplier, country)

### UPDATE - Modify Contact
1. Click the Edit icon on the first contact
2. Change Designation from `Senior Buyer` to `Lead Buyer`
3. Click "Update"
4. ✅ Verify the designation is updated

### DELETE - Remove Contact
1. Click the Delete icon on the last contact (Rashid Ali)
2. Confirm deletion
3. ✅ Verify the contact is removed

---

## 4. SHIPPING CRUD Testing

### CREATE - Add 3 Shipping Destinations
1. Navigate to: http://localhost:2222/dashboard/erp/clients/shipping
2. Click "Add Shipping Info" button
3. Fill in the form with:

**Shipping 1:**
- Select Buyer: `H&M Group`
- Destination Country: `United States`
- Country Code: `US`
- Destination Port: `Los Angeles`
- Place of Delivery: `LA Port Terminal 5`
- Destination Code: `USLAX`
- Warehouse No: `WH-001`
- Address: `123 Port Street, Los Angeles, CA 90001`
- Click "Create"

**Shipping 2:**
- Select Buyer: `H&M Group`
- Destination Country: `United Kingdom`
- Country Code: `GB`
- Destination Port: `Felixstowe`
- Place of Delivery: `Felixstowe Port`
- Destination Code: `GBFEL`
- Warehouse No: `WH-002`
- Address: `Port of Felixstowe, Suffolk, UK`
- Click "Create"

**Shipping 3:**
- Select Buyer: `Zara Fashion`
- Destination Country: `Germany`
- Country Code: `DE`
- Destination Port: `Hamburg`
- Place of Delivery: `Hamburg Port`
- Destination Code: `DEHAM`
- Warehouse No: `WH-003`
- Address: `Hamburg Port, 20457 Hamburg, Germany`
- Click "Create"

### READ - Verify Data
- ✅ Check that all 3 shipping records appear in the table
- ✅ Verify all fields are displayed correctly
- ✅ Test filters (search, buyer, country)

### UPDATE - Modify Shipping
1. Click the Edit icon on the first shipping record
2. Change Warehouse No from `WH-001` to `WH-UPDATED-001`
3. Click "Update"
4. ✅ Verify the warehouse number is updated

### DELETE - Remove Shipping
1. Click the Delete icon on the last shipping record (Hamburg)
2. Confirm deletion
3. ✅ Verify the shipping record is removed

---

## 5. BANKING CRUD Testing

### CREATE - Add 3 Banking Records
1. Navigate to: http://localhost:2222/dashboard/erp/clients/banking
2. Click "Add Banking Info" button
3. Fill in the form with:

**Banking 1 (Buyer):**
- Client Type: `Buyer`
- Client: Select `H&M Group`
- Country: `Sweden`
- Bank Name: `Swedbank AB`
- SORT Code: `SWED-123`
- Account Number: `SE1234567890123456789012`
- Click "Create"

**Banking 2 (Buyer):**
- Client Type: `Buyer`
- Client: Select `Zara Fashion`
- Country: `Spain`
- Bank Name: `Banco Santander`
- SORT Code: `BS-456`
- Account Number: `ES9121000418450200051332`
- Click "Create"

**Banking 3 (Supplier):**
- Client Type: `Supplier`
- Client: Select `Premium Fabrics Ltd`
- Country: `Bangladesh`
- Bank Name: `Sonali Bank Limited`
- SORT Code: `SB-789`
- Account Number: `1234567890123`
- Click "Create"

### READ - Verify Data
- ✅ Check that all 3 banking records appear in the table
- ✅ Verify all fields are displayed correctly
- ✅ Test filters (search, client type, buyer, supplier, country)

### UPDATE - Modify Banking
1. Click the Edit icon on the first banking record
2. Change Bank Name from `Swedbank AB` to `Updated Bank Name`
3. Click "Update"
4. ✅ Verify the bank name is updated

### DELETE - Remove Banking
1. Click the Delete icon on the last banking record (Supplier banking)
2. Confirm deletion
3. ✅ Verify the banking record is removed

---

## Test Checklist

### ✅ Functionality Tests
- [ ] All CREATE operations work correctly
- [ ] All READ operations display data correctly
- [ ] All UPDATE operations modify data correctly
- [ ] All DELETE operations remove data correctly
- [ ] Filters work on all pages
- [ ] Search functionality works
- [ ] Row limits work (10, 20, 50, All)
- [ ] Export functionality works (Excel/CSV)

### ✅ Data Validation Tests
- [ ] Required fields are validated
- [ ] Email format is validated
- [ ] Phone number format is accepted
- [ ] Country selection works
- [ ] Dropdowns populate correctly

### ✅ UI/UX Tests
- [ ] Loading states display during operations
- [ ] Success messages appear after operations
- [ ] Error messages display for failures
- [ ] Forms reset after submission
- [ ] Dialogs close properly

### ✅ Integration Tests
- [ ] Buyer data is available in Contacts form
- [ ] Buyer/Supplier data is available in Banking form
- [ ] Buyer data is available in Shipping form
- [ ] Related data displays correctly (e.g., company name in contacts)

---

## Expected Results

After completing all tests:
- ✅ **Buyers**: 2 buyers remaining (H&M Group, Zara Fashion)
- ✅ **Suppliers**: 2 suppliers remaining (Premium Fabrics, Global Trims)
- ✅ **Contacts**: 2 contacts remaining (John Smith, Maria Garcia)
- ✅ **Shipping**: 2 shipping records remaining (Los Angeles, Felixstowe)
- ✅ **Banking**: 2 banking records remaining (H&M banking, Zara banking)

---

## Notes

1. **Order Matters**: Create Buyers and Suppliers BEFORE Contacts, Shipping, and Banking as they depend on them.

2. **Test Export**: After creating data, test the Export button on each page to verify Excel/CSV export works.

3. **Browser Console**: Open browser DevTools (F12) and check for any JavaScript errors during operations.

4. **Network Tab**: Check the Network tab to verify API calls are successful (status 200/201).

5. **Database**: If you need to reset all data, you can restart the containers or clear the database.

---

## Troubleshooting

**If CREATE fails:**
- Check browser console for errors
- Verify backend is running: `docker compose ps`
- Check backend logs: `docker compose logs backend --tail 50`

**If data doesn't appear:**
- Refresh the page
- Check filters are not hiding data
- Verify API response in Network tab

**If UPDATE/DELETE fails:**
- Verify the record exists
- Check backend logs for errors
- Verify required fields are present


# Complete Beginner's Guide to RMG ERP System

## Table of Contents
1. [Introduction](#introduction)
2. [What is This Project?](#what-is-this-project)
3. [Technology Stack Explained](#technology-stack-explained)
4. [Project Structure](#project-structure)
5. [How to Start the Project](#how-to-start-the-project)
6. [Frontend Explained](#frontend-explained)
7. [Backend Explained](#backend-explained)
8. [Database Structure](#database-structure)
9. [How to Add a New Feature](#how-to-add-a-new-feature)
10. [Common Tasks](#common-tasks)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)

---

## 1. Introduction

Welcome to the RMG (Ready-Made Garment) ERP System! This is a complete business management system for garment manufacturing companies. Don't worry if this seems overwhelming - we'll explain everything step by step.

### What You'll Learn:
- How to run the project on your computer
- Where to find different parts of the code
- How to make changes safely
- How to add new features

---

## 2. What is This Project?

This is an **ERP (Enterprise Resource Planning)** system designed specifically for garment manufacturing businesses. It helps manage:

- **Buyers** - Companies that purchase garments
- **Suppliers** - Companies that supply fabric, trims, accessories
- **Orders** - Purchase orders from buyers
- **Samples** - Sample garments before production
- **Styles** - Different garment designs
- **Production** - Manufacturing operations

### Real-World Example:
Imagine a t-shirt factory:
1. A buyer (like H&M) places an order for 10,000 t-shirts
2. The factory needs to order fabric from a supplier
3. They create a sample first to get approval
4. Then they start production
5. This system manages all of that!

---

## 3. Technology Stack Explained

### Frontend (What Users See)
- **Next.js 15** - A React framework for building the website
  - Think of it like Microsoft Word - it's what users interact with
- **TypeScript** - JavaScript with types (helps catch errors)
- **Tailwind CSS** - Makes things look pretty
- **Shadcn UI** - Pre-built components (like buttons, tables)

### Backend (The Brain)
- **FastAPI** - Python framework for building APIs
  - Think of it like a waiter - it takes requests and brings back data
- **SQLAlchemy** - Talks to the database
- **PostgreSQL** - The database (where all data is stored)

### Infrastructure
- **Docker** - Packages everything so it runs the same everywhere
- **Docker Compose** - Runs multiple services together

### Simple Analogy:
- **Frontend** = The restaurant menu and dining area
- **Backend** = The kitchen
- **Database** = The pantry where ingredients are stored

---

## 4. Project Structure

```
shad-theme-dashboard/
├── app/                          # Frontend code
│   ├── dashboard/               # Main application pages
│   │   ├── (auth)/             # Pages that require login
│   │   │   └── erp/           # All ERP pages
│   │   │       ├── buyers/    # Buyer management page
│   │   │       ├── suppliers/ # Supplier management page
│   │   │       ├── orders/    # Order management page
│   │   │       └── samples/   # Sample management pages
│   ├── components/             # Reusable UI components
│   └── lib/                   # Helper functions
│
├── backend/                    # Backend code
│   └── app/
│       ├── api/               # API endpoints (routes)
│       ├── models/            # Database table definitions
│       ├── schemas/           # Data validation rules
│       └── core/              # Configuration files
│
├── docker-compose.yml         # Defines how to run the app
└── package.json              # Frontend dependencies
```

### Where to Find Things:

| What You Want | Where to Look |
|--------------|---------------|
| A page (like Buyers page) | `app/dashboard/(auth)/erp/buyers/page.tsx` |
| A button or table component | `components/ui/` |
| API endpoint (backend logic) | `backend/app/api/` |
| Database table structure | `backend/app/models/` |
| Styling | Most files have `className="..."` - that's Tailwind CSS |

---

## 5. How to Start the Project

### Prerequisites (What You Need Installed)
1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
3. **VS Code** (recommended editor) - [Download here](https://code.visualstudio.com/)

### Step-by-Step Startup

#### Step 1: Start the Backend (Database + API)
```bash
# Open Terminal/Command Prompt
# Navigate to the project folder
cd e:\erp_southern_final\erp_southern_final\shad-theme-dashboard\shad-theme-dashboard

# Start Docker containers
docker-compose up -d

# Check if it's running
docker ps
# You should see: rmg_erp_backend and rmg_erp_db
```

**What Just Happened?**
- Docker started PostgreSQL database on port 5432
- Docker started FastAPI backend on port 8000
- You can access the API at: http://localhost:8000/docs

#### Step 2: Start the Frontend
```bash
# In the same folder, open a new terminal
# Install dependencies (first time only)
npm install

# Start the frontend development server
npm run dev
```

**What Just Happened?**
- Next.js started on port 3000
- Open your browser to: http://localhost:3000
- Any changes you make will auto-reload!

#### Step 3: Verify Everything Works
1. Open http://localhost:3000 in your browser
2. You should see the login page
3. Open http://localhost:8000/docs to see the API documentation

---

## 6. Frontend Explained

### How Pages Work in Next.js

Every page is a React component. Let's look at the Suppliers page as an example:

**File:** `app/dashboard/(auth)/erp/suppliers/page.tsx`

```typescript
"use client"  // This means it runs in the browser

// 1. IMPORTS - Bringing in tools we need
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// 2. INTERFACE - Defining what a Supplier looks like
interface Supplier {
  id?: number;
  supplier_name: string;
  company_name: string;
  supplier_type: string;
  contact_person: string;
  email: string;
  phone: string;
  country: string;
  rating?: number;
}

// 3. COMPONENT - The actual page
export default function SuppliersPage() {
  // STATE - Variables that can change
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // EFFECT - Runs when page loads
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // FUNCTION - Get suppliers from API
  const fetchSuppliers = async () => {
    const response = await fetch("http://localhost:8000/api/v1/suppliers/");
    const data = await response.json();
    setSuppliers(data);
  };

  // RENDER - What appears on screen
  return (
    <div>
      <h1>Suppliers</h1>
      {/* Table of suppliers */}
    </div>
  );
}
```

### Key Concepts:

#### State Management
```typescript
const [suppliers, setSuppliers] = useState<Supplier[]>([]);
```
- `suppliers` - Current value
- `setSuppliers` - Function to change the value
- When you call `setSuppliers`, the page re-renders automatically

#### Fetching Data
```typescript
const response = await fetch("http://localhost:8000/api/v1/suppliers/");
const data = await response.json();
```
- `fetch` - Makes HTTP request to backend
- `await` - Waits for response
- `.json()` - Converts response to JavaScript object

#### Filtering System
Every listing page has filters. Here's how they work:

```typescript
// 1. Define filter state
const [filters, setFilters] = useState({
  search: "",
  type: "",
  country: "",
});

// 2. Apply filters whenever data or filters change
useEffect(() => {
  let result = [...suppliers];

  // Search filter
  if (filters.search) {
    result = result.filter(s =>
      s.supplier_name.toLowerCase().includes(filters.search.toLowerCase())
    );
  }

  // Type filter
  if (filters.type && filters.type !== "all") {
    result = result.filter(s => s.supplier_type === filters.type);
  }

  setFilteredSuppliers(result);
}, [suppliers, filters]);
```

### Components

Components are reusable pieces of UI. Located in `components/ui/`:

```typescript
// Example: Using a Button component
import { Button } from "@/components/ui/button";

<Button onClick={() => alert("Clicked!")}>
  Click Me
</Button>

// Example: Using a Table
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

<Table>
  <TableBody>
    {suppliers.map((supplier) => (
      <TableRow key={supplier.id}>
        <TableCell>{supplier.supplier_name}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 7. Backend Explained

### How the Backend Works

The backend has 3 main layers:

#### Layer 1: API Routes (api/)
These are the URLs that the frontend calls.

**File:** `backend/app/api/suppliers.py`

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core import get_db
from ..models import Supplier
from ..schemas import SupplierCreate, SupplierResponse

router = APIRouter()

# GET /api/v1/suppliers/ - Get all suppliers
@router.get("/", response_model=List[SupplierResponse])
def get_suppliers(db: Session = Depends(get_db)):
    suppliers = db.query(Supplier).all()
    return suppliers

# POST /api/v1/suppliers/ - Create a new supplier
@router.post("/", response_model=SupplierResponse)
def create_supplier(supplier_data: SupplierCreate, db: Session = Depends(get_db)):
    new_supplier = Supplier(**supplier_data.model_dump())
    db.add(new_supplier)
    db.commit()
    db.refresh(new_supplier)
    return new_supplier
```

#### Layer 2: Models (models/)
These define database tables.

**File:** `backend/app/models/client.py`

```python
from sqlalchemy import Column, Integer, String, Float
from ..core.database import Base

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    supplier_name = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    supplier_type = Column(String, nullable=True)
    contact_person = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    country = Column(String, nullable=True)
    rating = Column(Float, nullable=True)
```

**What This Means:**
- Each `Column` = a field in the database
- `String` = text
- `Integer` = number
- `Float` = decimal number
- `nullable=True` = optional field

#### Layer 3: Schemas (schemas/)
These validate data coming in/out.

**File:** `backend/app/schemas/supplier.py`

```python
from pydantic import BaseModel, EmailStr
from typing import Optional

class SupplierCreate(BaseModel):
    supplier_name: str  # Required
    company_name: str   # Required
    supplier_type: Optional[str] = None  # Optional
    email: Optional[EmailStr] = None  # Optional, must be valid email
    phone: Optional[str] = None
```

---

## 8. Database Structure

### Main Tables

#### buyers
Stores buyer/customer information
- `id` - Unique identifier
- `buyer_name` - Name of the buyer
- `company_name` - Company name
- `email`, `phone` - Contact info
- `rating` - Quality rating (0-5)

#### suppliers
Stores supplier information
- `id` - Unique identifier
- `supplier_name` - Name of the supplier
- `company_name` - Company name
- `supplier_type` - Fabric/Trims/Accessories/Packaging
- `contact_person` - Contact name
- `email`, `phone` - Contact info
- `country` - Location
- `rating` - Quality rating (0-5)

#### order_management
Stores production orders
- `id` - Unique identifier
- `order_no` - Order number (e.g., SCL-241201)
- `buyer_id` - Foreign key to buyers table
- `style_id` - Foreign key to style_summaries table
- `season` - Spring/Summer/Fall/Winter
- `order_quantity` - Number of pieces
- `order_date` - When order was placed
- `delivery_date` - When order should be delivered

#### samples
Stores sample information
- `id` - Unique identifier
- `buyer_id` - Who requested the sample
- `style_id` - Which style
- `sample_type` - SMS/PP/TOP/Size Set
- `submit_status` - Pending/Approved/Rejected
- `submit_date` - When sample was submitted

### Relationships (How Tables Connect)

```
buyers (1) -----> (many) orders
  One buyer can have many orders

style_summaries (1) -----> (many) orders
  One style can be used in many orders

style_summaries (1) -----> (many) style_variants
  One style can have many color variants

style_variants (1) -----> (many) required_materials
  One variant needs many materials
```

---

## 9. How to Add a New Feature

Let's walk through adding a complete feature: **"Add Notes to Suppliers"**

### Step 1: Update Database Model

**File:** `backend/app/models/client.py`

```python
class Supplier(Base):
    __tablename__ = "suppliers"

    # ... existing columns ...
    notes = Column(Text, nullable=True)  # ADD THIS LINE
```

### Step 2: Update Schema

**File:** `backend/app/schemas/supplier.py`

```python
class SupplierBase(BaseModel):
    supplier_name: str
    # ... existing fields ...
    notes: Optional[str] = None  # ADD THIS LINE
```

### Step 3: Run Database Migration

```bash
# Create migration script
docker exec rmg_erp_backend python -c "
from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text('ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS notes TEXT'))
    conn.commit()
    print('Added notes column')
"
```

### Step 4: Restart Backend

```bash
docker restart rmg_erp_backend
```

### Step 5: Update Frontend Interface

**File:** `app/dashboard/(auth)/erp/suppliers/page.tsx`

```typescript
// Update interface
interface Supplier {
  // ... existing fields ...
  notes?: string;  // ADD THIS LINE
}

// Update form data
const [formData, setFormData] = useState<Supplier>({
  // ... existing fields ...
  notes: "",  // ADD THIS LINE
});
```

### Step 6: Add UI Field in Form

```typescript
// Inside the dialog form, add:
<div className="space-y-2">
  <Label htmlFor="notes">Notes</Label>
  <Textarea
    id="notes"
    value={formData.notes}
    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
    rows={3}
    placeholder="Additional notes about this supplier..."
  />
</div>
```

### Step 7: Display in Table

```typescript
<TableHead>Notes</TableHead>  // Add header

<TableCell>{supplier.notes || "-"}</TableCell>  // Add cell
```

### Step 8: Test

1. Restart frontend: `npm run dev`
2. Open http://localhost:3000/dashboard/erp/suppliers
3. Click "Add Supplier"
4. Fill in the notes field
5. Save and verify it appears in the table

---

## 10. Common Tasks

### Task 1: Adding a Filter

**Example:** Add a filter for supplier rating

```typescript
// 1. Add to filters state
const [filters, setFilters] = useState({
  search: "",
  type: "",
  country: "",
  rating: "",  // ADD THIS
});

// 2. Add filter logic
useEffect(() => {
  let result = [...suppliers];

  // ... existing filters ...

  // Rating filter
  if (filters.rating && filters.rating !== "all") {
    const ratingValue = parseFloat(filters.rating);
    result = result.filter(s => (s.rating || 0) >= ratingValue);
  }

  setFilteredSuppliers(result);
}, [suppliers, filters]);

// 3. Add UI dropdown
<Select
  value={filters.rating}
  onValueChange={(value) => setFilters({ ...filters, rating: value })}
>
  <SelectTrigger className="w-[150px]">
    <SelectValue placeholder="Rating" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Ratings</SelectItem>
    <SelectItem value="4">4+ Stars</SelectItem>
    <SelectItem value="3">3+ Stars</SelectItem>
  </SelectContent>
</Select>
```

### Task 2: Adding a New API Endpoint

**Example:** Get suppliers by country

```python
# In backend/app/api/suppliers.py

@router.get("/by-country/{country}")
def get_suppliers_by_country(country: str, db: Session = Depends(get_db)):
    suppliers = db.query(Supplier).filter(Supplier.country == country).all()
    return suppliers
```

### Task 3: Changing Colors/Styling

All styling uses Tailwind CSS classes:

```typescript
// Background colors
className="bg-blue-500"  // Blue background
className="bg-red-500"   // Red background

// Text colors
className="text-white"
className="text-gray-500"

// Spacing
className="p-4"   // Padding 4
className="m-2"   // Margin 2
className="gap-4" // Gap between items 4

// Sizing
className="w-full"     // Width 100%
className="h-screen"   // Height 100vh
```

### Task 4: Adding Toast Notifications

```typescript
import { toast } from "sonner";

// Success message
toast.success("Supplier created successfully!");

// Error message
toast.error("Failed to create supplier");

// Info message
toast.info("Loading suppliers...");
```

---

## 11. Troubleshooting

### Problem: Frontend won't start

**Error:** `Cannot find module 'next'`

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Problem: Backend not responding

**Error:** `Connection refused on port 8000`

**Solution:**
```bash
# Check if Docker is running
docker ps

# If no containers, start them
docker-compose up -d

# Check logs
docker logs rmg_erp_backend
```

### Problem: Database changes not showing

**Solution:**
```bash
# Restart backend to reload models
docker restart rmg_erp_backend

# Check if column exists
docker exec -it rmg_erp_db psql -U rmguser -d rmgdb -c "\d suppliers"
```

### Problem: TypeScript errors

**Error:** `Property 'xyz' does not exist on type 'Supplier'`

**Solution:**
Update the interface in the TypeScript file:

```typescript
interface Supplier {
  // ... existing properties ...
  xyz: string;  // Add the missing property
}
```

### Problem: Port already in use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- -p 3001
```

---

## 12. Best Practices

### Coding Standards

#### Naming Conventions

```typescript
// Variables and functions: camelCase
const supplierName = "ABC Inc";
function fetchSuppliers() {}

// Components and Interfaces: PascalCase
interface Supplier {}
function SuppliersPage() {}

// Constants: UPPERCASE
const API_URL = "http://localhost:8000";

// Files: kebab-case
// supplier-details.tsx
// buyer-info.tsx
```

#### File Organization

```
One component per file
Keep files under 500 lines
Group related code together
```

#### Comments

```typescript
// Good: Explain WHY, not WHAT
// Calculate total including 15% tax
const total = subtotal * 1.15;

// Bad: States the obvious
// Set suppliers to data
setSuppliers(data);
```

### Git Workflow

```bash
# 1. Create a new branch for your feature
git checkout -b feature/add-supplier-notes

# 2. Make your changes
# ... edit files ...

# 3. Check what changed
git status
git diff

# 4. Stage your changes
git add .

# 5. Commit with a clear message
git commit -m "Add notes field to suppliers table and form"

# 6. Push to remote
git push origin feature/add-supplier-notes

# 7. Create Pull Request on GitHub
```

### Testing Before Committing

**Checklist:**
- [ ] Frontend starts without errors (`npm run dev`)
- [ ] Backend starts without errors (check Docker logs)
- [ ] No TypeScript errors
- [ ] Test the feature manually
- [ ] Check browser console for errors (F12)
- [ ] Test on Chrome and Firefox

### When You Get Stuck

1. **Read the error message carefully** - It often tells you exactly what's wrong
2. **Check the browser console** (F12) - Frontend errors appear here
3. **Check backend logs** - `docker logs rmg_erp_backend`
4. **Google the error** - Someone has probably had the same issue
5. **Ask your team** - Don't struggle alone for more than 30 minutes
6. **Take a break** - Sometimes stepping away helps

---

## Quick Reference

### Useful Commands

```bash
# Start everything
docker-compose up -d && npm run dev

# Stop everything
docker-compose down && Ctrl+C (in npm terminal)

# Restart backend only
docker restart rmg_erp_backend

# View backend logs
docker logs -f rmg_erp_backend

# Access database directly
docker exec -it rmg_erp_db psql -U rmguser -d rmgdb

# Run migration
docker exec rmg_erp_backend python migrate_suppliers.py

# Install new npm package
npm install package-name

# Update all npm packages
npm update
```

### Useful URLs

- Frontend: http://localhost:3000
- Backend API Docs: http://localhost:8000/docs
- Backend API: http://localhost:8000/api/v1/

### File Locations Quick Reference

| Need | Location |
|------|----------|
| Suppliers page | `app/dashboard/(auth)/erp/suppliers/page.tsx` |
| Buyers page | `app/dashboard/(auth)/erp/buyers/page.tsx` |
| Orders page | `app/dashboard/(auth)/erp/orders/page.tsx` |
| Suppliers API | `backend/app/api/suppliers.py` |
| Database models | `backend/app/models/client.py` |
| Database config | `backend/app/core/database.py` |
| Docker setup | `docker-compose.yml` |

---

## Next Steps

### Week 1: Learning Phase
- Read through this entire guide
- Start the project and explore each page
- Make a small change (like changing a button color)
- Try adding a simple field to a form

### Week 2: Practice Phase
- Add a new filter to any page
- Modify an existing page layout
- Add a new field to a database table
- Create a simple new API endpoint

### Week 3: Building Phase
- Add a complete new feature (with backend + frontend)
- Fix a bug
- Optimize a slow page

---

## Glossary

**API (Application Programming Interface)** - A way for frontend and backend to communicate

**Component** - A reusable piece of UI (like a button or table)

**Docker** - A tool that packages applications so they run the same everywhere

**Frontend** - The part users see and interact with (website)

**Backend** - The server that handles business logic and database operations

**Database** - Where all data is permanently stored

**Migration** - A script that changes the database structure

**State** - Data that can change and causes the UI to update

**Props** - Data passed from parent component to child component

**Hook** - Special React functions (useState, useEffect, etc.)

**Endpoint** - A specific URL in the API (like /api/v1/suppliers/)

**Schema** - Definition of data structure and validation rules

**ORM (Object-Relational Mapping)** - SQLAlchemy, converts Python code to SQL

**SQL** - Language used to talk to databases

---

## Remember

- **Ask questions** - There are no stupid questions
- **Take breaks** - Programming requires focus
- **Read error messages** - They're trying to help you
- **Google is your friend** - Everyone looks things up constantly
- **Make mistakes** - That's how you learn
- **Comment your code** - Your future self will thank you
- **Save often** - Ctrl+S is your friend
- **Test frequently** - Don't wait until everything is done

---

## Contact & Resources

### Internal Resources
- Project Repository: [GitHub Link]
- Team Slack: [Slack Channel]
- Tech Lead: [Name & Contact]

### Learning Resources
- Next.js Docs: https://nextjs.org/docs
- React Tutorial: https://react.dev/learn
- FastAPI Tutorial: https://fastapi.tiangolo.com/tutorial/
- Tailwind CSS: https://tailwindcss.com/docs
- TypeScript Handbook: https://www.typescriptlang.org/docs/

### Video Tutorials
- Next.js Crash Course: [YouTube Link]
- React Hooks Explained: [YouTube Link]
- FastAPI Tutorial: [YouTube Link]

---

**Good luck! You've got this! 🚀**

*Version 1.0 - Created December 2025*

# 🎨 Multi-Color Style Variant Implementation Guide

**Feature:** Support for garments with multiple color parts (e.g., Polo with Navy Body + White Collar + Red Sleeves)

**Date:** December 8, 2025

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Backend Implementation](#backend-implementation)
4. [API Usage Examples](#api-usage-examples)
5. [Frontend Implementation](#frontend-implementation)
6. [Migration Guide](#migration-guide)
7. [Common Use Cases](#common-use-cases)

---

## 🎯 OVERVIEW

### Problem Statement
In the garment industry, a single style can have multiple colors in different parts:
- **Polo Shirt:** Body (Navy) + Collar (White) + Sleeves (Red)
- **Jacket:** Main Body (Black) + Lining (Grey) + Trim (Yellow)
- **T-Shirt:** Front (Blue) + Back (Green) + Sleeves (White)

The previous implementation only supported **single-color** variants, limiting the system's ability to accurately represent real-world garments.

### Solution
We've implemented a **normalized database structure** that:
- ✅ Supports **both single-color and multi-color** variants
- ✅ Allows **unlimited color parts** per variant
- ✅ Maintains **backward compatibility** with existing data
- ✅ Provides **automatic display name generation**
- ✅ Enables **flexible querying and reporting**

---

## 🗄️ DATABASE SCHEMA

### New Table: `style_variant_colors`

```sql
CREATE TABLE style_variant_colors (
    id                SERIAL PRIMARY KEY,
    style_variant_id  INTEGER NOT NULL REFERENCES style_variants(id) ON DELETE CASCADE,
    part_name         VARCHAR NOT NULL,           -- e.g., "Body", "Collar", "Sleeves"
    colour_name       VARCHAR NOT NULL,           -- e.g., "Navy Blue", "White"
    colour_code       VARCHAR,                    -- e.g., "#001F3F", "Pantone 19-4052"
    sort_order        INTEGER NOT NULL DEFAULT 0, -- Display order
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_variant_colors_variant_id ON style_variant_colors(style_variant_id);
CREATE INDEX idx_variant_colors_part_name ON style_variant_colors(part_name);
```

### Updated Table: `style_variants`

**New Columns:**
```sql
ALTER TABLE style_variants
ADD COLUMN is_multicolor BOOLEAN DEFAULT FALSE,
ADD COLUMN display_name VARCHAR;
```

**Column Descriptions:**
- `is_multicolor`: `true` if variant has multiple color parts, `false` for single color
- `display_name`: Auto-generated name like "Navy Body + White Collar + Red Sleeves"
- `colour_name`: Still used for single-color variants (backward compatible)
- `colour_code`: Still used for single-color variants (backward compatible)

---

## 💻 BACKEND IMPLEMENTATION

### SQLAlchemy Models

#### VariantColorPart Model
```python
class VariantColorPart(Base):
    __tablename__ = "style_variant_colors"

    id = Column(Integer, primary_key=True)
    style_variant_id = Column(Integer, ForeignKey("style_variants.id", ondelete="CASCADE"))
    part_name = Column(String, nullable=False)
    colour_name = Column(String, nullable=False)
    colour_code = Column(String, nullable=True)
    sort_order = Column(Integer, default=0)

    # Relationship
    variant = relationship("StyleVariant", back_populates="color_parts")
```

#### Updated StyleVariant Model
```python
class StyleVariant(Base):
    __tablename__ = "style_variants"

    # Existing columns...
    is_multicolor = Column(Boolean, default=False)
    display_name = Column(String, nullable=True)

    # Relationships
    color_parts = relationship("VariantColorPart",
                              back_populates="variant",
                              cascade="all, delete-orphan")

    @property
    def full_color_description(self):
        """Auto-generate full color description"""
        if self.is_multicolor and self.color_parts:
            parts = sorted(self.color_parts, key=lambda x: x.sort_order)
            return ", ".join([f"{p.part_name}: {p.colour_name}" for p in parts])
        else:
            return self.colour_name
```

### Pydantic Schemas

#### VariantColorPart Schemas
```python
class VariantColorPartBase(BaseModel):
    part_name: str
    colour_name: str
    colour_code: Optional[str] = None
    sort_order: int = 0

class VariantColorPartResponse(VariantColorPartBase):
    id: int
    style_variant_id: int
    created_at: datetime

    class Config:
        from_attributes = True
```

#### Updated StyleVariant Schemas
```python
class StyleVariantCreate(BaseModel):
    style_summary_id: int
    style_name: str
    style_id: str
    colour_name: str
    colour_code: Optional[str] = None
    is_multicolor: bool = False
    display_name: Optional[str] = None
    color_parts: Optional[List[VariantColorPartBase]] = None

class StyleVariantResponse(BaseModel):
    id: int
    # ... existing fields ...
    is_multicolor: bool
    display_name: Optional[str]
    color_parts: List[VariantColorPartResponse] = []
    full_color_description: Optional[str]

    class Config:
        from_attributes = True
```

---

## 🔌 API USAGE EXAMPLES

### Example 1: Create Single-Color Variant (Backward Compatible)

**Request:**
```http
POST /api/v1/samples/style-variants
Content-Type: application/json

{
  "style_summary_id": 1,
  "style_name": "Basic T-Shirt",
  "style_id": "TS-001",
  "colour_name": "Navy Blue",
  "colour_code": "#001F3F",
  "is_multicolor": false
}
```

**Response:**
```json
{
  "id": 10,
  "style_summary_id": 1,
  "style_name": "Basic T-Shirt",
  "style_id": "TS-001",
  "colour_name": "Navy Blue",
  "colour_code": "#001F3F",
  "is_multicolor": false,
  "display_name": null,
  "color_parts": [],
  "full_color_description": "Navy Blue",
  "created_at": "2025-12-08T10:30:00Z"
}
```

---

### Example 2: Create Multi-Color Variant

**Request:**
```http
POST /api/v1/samples/style-variants
Content-Type: application/json

{
  "style_summary_id": 1,
  "style_name": "Polo Shirt",
  "style_id": "PS-001",
  "colour_name": "Multi-Color",
  "is_multicolor": true,
  "display_name": "Navy + White + Red",
  "color_parts": [
    {
      "part_name": "Body",
      "colour_name": "Navy Blue",
      "colour_code": "#001F3F",
      "sort_order": 1
    },
    {
      "part_name": "Collar",
      "colour_name": "White",
      "colour_code": "#FFFFFF",
      "sort_order": 2
    },
    {
      "part_name": "Sleeves",
      "colour_name": "Red",
      "colour_code": "#FF0000",
      "sort_order": 3
    }
  ]
}
```

**Response:**
```json
{
  "id": 11,
  "style_summary_id": 1,
  "style_name": "Polo Shirt",
  "style_id": "PS-001",
  "colour_name": "Multi-Color",
  "colour_code": null,
  "is_multicolor": true,
  "display_name": "Navy + White + Red",
  "color_parts": [
    {
      "id": 1,
      "style_variant_id": 11,
      "part_name": "Body",
      "colour_name": "Navy Blue",
      "colour_code": "#001F3F",
      "sort_order": 1,
      "created_at": "2025-12-08T10:35:00Z"
    },
    {
      "id": 2,
      "style_variant_id": 11,
      "part_name": "Collar",
      "colour_name": "White",
      "colour_code": "#FFFFFF",
      "sort_order": 2,
      "created_at": "2025-12-08T10:35:00Z"
    },
    {
      "id": 3,
      "style_variant_id": 11,
      "part_name": "Sleeves",
      "colour_name": "Red",
      "colour_code": "#FF0000",
      "sort_order": 3,
      "created_at": "2025-12-08T10:35:00Z"
    }
  ],
  "full_color_description": "Body: Navy Blue, Collar: White, Sleeves: Red",
  "created_at": "2025-12-08T10:35:00Z"
}
```

---

### Example 3: Update Multi-Color Variant

**Request:**
```http
PUT /api/v1/samples/style-variants/11
Content-Type: application/json

{
  "color_parts": [
    {
      "part_name": "Body",
      "colour_name": "Black",
      "colour_code": "#000000",
      "sort_order": 1
    },
    {
      "part_name": "Collar",
      "colour_name": "Gold",
      "colour_code": "#FFD700",
      "sort_order": 2
    },
    {
      "part_name": "Sleeves",
      "colour_name": "Black",
      "colour_code": "#000000",
      "sort_order": 3
    }
  ]
}
```

---

### Example 4: Query Variants with Color Parts

**Request:**
```http
GET /api/v1/samples/style-variants?style_summary_id=1
```

**Response:**
```json
[
  {
    "id": 10,
    "colour_name": "Navy Blue",
    "is_multicolor": false,
    "full_color_description": "Navy Blue"
  },
  {
    "id": 11,
    "colour_name": "Multi-Color",
    "is_multicolor": true,
    "full_color_description": "Body: Navy Blue, Collar: White, Sleeves: Red",
    "color_parts": [...]
  }
]
```

---

## 🎨 FRONTEND IMPLEMENTATION

### React Component Example: Multi-Color Variant Form

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ColorPart {
  part_name: string;
  colour_name: string;
  colour_code: string;
  sort_order: number;
}

export function StyleVariantForm() {
  const [isMulticolor, setIsMulticolor] = useState(false);
  const [colorParts, setColorParts] = useState<ColorPart[]>([]);

  const addColorPart = () => {
    setColorParts([
      ...colorParts,
      {
        part_name: '',
        colour_name: '',
        colour_code: '',
        sort_order: colorParts.length + 1
      }
    ]);
  };

  const updateColorPart = (index: number, field: keyof ColorPart, value: string | number) => {
    const updated = [...colorParts];
    updated[index] = { ...updated[index], [field]: value };
    setColorParts(updated);
  };

  const removeColorPart = (index: number) => {
    setColorParts(colorParts.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Single/Multi Color Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isMulticolor}
          onChange={(e) => setIsMulticolor(e.target.checked)}
          id="multicolor"
        />
        <label htmlFor="multicolor">Multi-Color Variant</label>
      </div>

      {/* Single Color Fields */}
      {!isMulticolor && (
        <div className="space-y-2">
          <Input placeholder="Color Name (e.g., Navy Blue)" />
          <Input placeholder="Color Code (e.g., #001F3F)" />
        </div>
      )}

      {/* Multi-Color Fields */}
      {isMulticolor && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Color Parts</h4>
            <Button onClick={addColorPart} size="sm">+ Add Part</Button>
          </div>

          {colorParts.map((part, index) => (
            <div key={index} className="flex gap-2 items-start p-4 border rounded">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Part Name (e.g., Body, Collar)"
                  value={part.part_name}
                  onChange={(e) => updateColorPart(index, 'part_name', e.target.value)}
                />
                <Input
                  placeholder="Color Name (e.g., Navy Blue)"
                  value={part.colour_name}
                  onChange={(e) => updateColorPart(index, 'colour_name', e.target.value)}
                />
                <Input
                  placeholder="Color Code (e.g., #001F3F)"
                  value={part.colour_code}
                  onChange={(e) => updateColorPart(index, 'colour_code', e.target.value)}
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeColorPart(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 MIGRATION GUIDE

### Step 1: Run Database Migration
```bash
# Navigate to backend directory
cd backend

# Run migration
python -m app.migrations.add_multicolor_support

# Or use Alembic if configured
alembic upgrade head
```

### Step 2: Verify Migration
```sql
-- Check if new table exists
SELECT * FROM style_variant_colors LIMIT 1;

-- Check if new columns exist
SELECT is_multicolor, display_name FROM style_variants LIMIT 1;
```

### Step 3: Update Existing Code
1. Update API imports to include `VariantColorPart` schemas
2. Update frontend forms to support multi-color selection
3. Update display components to show `full_color_description`

### Step 4: Test
```python
# Test creating single-color variant (backward compatible)
POST /api/v1/samples/style-variants
{
  "style_summary_id": 1,
  "style_name": "Test",
  "style_id": "T-001",
  "colour_name": "Blue",
  "is_multicolor": false
}

# Test creating multi-color variant
POST /api/v1/samples/style-variants
{
  "style_summary_id": 1,
  "style_name": "Test Multi",
  "style_id": "T-002",
  "colour_name": "Multi",
  "is_multicolor": true,
  "color_parts": [
    {"part_name": "Body", "colour_name": "Red", "sort_order": 1},
    {"part_name": "Sleeves", "colour_name": "Blue", "sort_order": 2}
  ]
}
```

---

## 💡 COMMON USE CASES

### Use Case 1: Polo Shirt with Different Collar
```json
{
  "style_name": "Polo Shirt Classic",
  "is_multicolor": true,
  "color_parts": [
    {"part_name": "Body", "colour_name": "Navy Blue", "sort_order": 1},
    {"part_name": "Collar", "colour_name": "White", "sort_order": 2}
  ]
}
```

### Use Case 2: Jacket with Contrast Lining
```json
{
  "style_name": "Premium Jacket",
  "is_multicolor": true,
  "color_parts": [
    {"part_name": "Outer Shell", "colour_name": "Black", "sort_order": 1},
    {"part_name": "Lining", "colour_name": "Red", "sort_order": 2},
    {"part_name": "Trim", "colour_name": "Gold", "sort_order": 3}
  ]
}
```

### Use Case 3: T-Shirt with Color Block Design
```json
{
  "style_name": "Color Block Tee",
  "is_multicolor": true,
  "color_parts": [
    {"part_name": "Front Top", "colour_name": "Blue", "sort_order": 1},
    {"part_name": "Front Bottom", "colour_name": "Green", "sort_order": 2},
    {"part_name": "Back", "colour_name": "White", "sort_order": 3},
    {"part_name": "Sleeves", "colour_name": "Black", "sort_order": 4}
  ]
}
```

### Use Case 4: Hoodie with Multiple Parts
```json
{
  "style_name": "Premium Hoodie",
  "is_multicolor": true,
  "color_parts": [
    {"part_name": "Body", "colour_name": "Heather Gray", "sort_order": 1},
    {"part_name": "Hood Lining", "colour_name": "Navy", "sort_order": 2},
    {"part_name": "Drawstring", "colour_name": "White", "sort_order": 3},
    {"part_name": "Pocket", "colour_name": "Black", "sort_order": 4}
  ]
}
```

---

## 📊 BENEFITS

### For Business Users
- ✅ Accurately represent multi-color garments
- ✅ Better costing and material tracking
- ✅ Clearer communication with buyers
- ✅ Detailed color specifications

### For Developers
- ✅ Normalized database structure
- ✅ Backward compatible with existing data
- ✅ Flexible and scalable
- ✅ Easy to query and report

### For the System
- ✅ Handles unlimited color parts
- ✅ Maintains data integrity
- ✅ Optimized with indexes
- ✅ Supports complex queries

---

## 🚀 NEXT STEPS

1. **Run the migration** to add multi-color support
2. **Update the frontend** to include multi-color form fields
3. **Test with real data** using the examples above
4. **Train users** on the new functionality
5. **Monitor performance** and optimize as needed

---

**Feature Status:** ✅ **IMPLEMENTED AND READY TO USE**

**Documentation Version:** 1.0
**Last Updated:** December 8, 2025

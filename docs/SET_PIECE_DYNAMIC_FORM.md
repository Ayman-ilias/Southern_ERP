# Dynamic Set Piece Form Implementation

## Feature Overview

The Style Variant form now automatically adapts based on whether the selected style is marked as a "set" in the Style Summary.

### User Workflow

**Scenario: Creating a 2-Piece Tracksuit Set**

#### Step 1: Create Style Summary (Set)
1. Go to Style Summary page
2. Create new style:
   - Style Name: "Athletic Tracksuit"
   - ✅ Check "Is this a set?"
   - Select "2 Pieces"
   - Save

#### Step 2: Create Style Variants
1. Go to Style Variants page
2. Click "Add Style Variant"
3. Select "Athletic Tracksuit" from dropdown

**The form automatically transforms:**

```
┌─────────────────────────────────────────────────────┐
│ Set Pieces (2 pieces)                               │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ Piece 1                                      │   │
│ │ ┌──────────┬──────────────┬──────────────┐  │   │
│ │ │Piece Name│    Colour    │  Color Code  │  │   │
│ │ │  "Top"   │  Navy Blue ● │  Pantone...  │  │   │
│ │ └──────────┴──────────────┴──────────────┘  │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ Piece 2                                      │   │
│ │ ┌──────────┬──────────────┬──────────────┐  │   │
│ │ │Piece Name│    Colour    │  Color Code  │  │   │
│ │ │ "Bottom" │  Charcoal ●  │  Pantone...  │  │   │
│ │ └──────────┴──────────────┴──────────────┘  │   │
│ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

4. Fill in each piece:
   - **Piece 1:**
     - Piece Name: "Top"
     - Colour: "Navy Blue"
     - Color Code: "Pantone 19-4052"

   - **Piece 2:**
     - Piece Name: "Bottom"
     - Colour: "Charcoal"
     - Color Code: "Pantone 426 C"

5. Select sizes (S, M, L, XL)
6. Submit

**Result:** Creates 2 separate style variant records:
- Variant 1: Athletic Tracksuit - Top (Navy Blue)
- Variant 2: Athletic Tracksuit - Bottom (Charcoal)

## Technical Implementation

### New State Variables

```typescript
const [isSetStyle, setIsSetStyle] = useState(false);
const [setPieceCount, setSetPieceCount] = useState(0);
const [setPieces, setSetPieces] = useState<Array<{
  piece_name: string;
  colour_name: string;
  colour_code: string;
}>>([]);
```

### Auto-Detection Logic

When a style is selected, the form checks if it's a set:

```typescript
const handleStyleSummaryChange = (styleSummaryId: string) => {
  const selectedStyle = styleSummaries.find(/* ... */);

  if (selectedStyle.is_set && selectedStyle.set_piece_count > 0) {
    setIsSetStyle(true);
    setSetPieceCount(selectedStyle.set_piece_count);

    // Initialize empty piece inputs
    const pieces = Array.from(
      { length: selectedStyle.set_piece_count },
      () => ({
        piece_name: "",
        colour_name: "",
        colour_code: "",
      })
    );
    setSetPieces(pieces);
  }
};
```

### Dynamic Form Rendering

```typescript
{isSetStyle ? (
  // Show multiple piece inputs
  {setPieces.map((piece, index) => (
    <div className="grid grid-cols-3 gap-3">
      <Input placeholder="Piece Name" />
      <ColorSelector />
      <ColorCodeSelector />
    </div>
  ))}
) : (
  // Show single color inputs
  <ColorSelector />
  <ColorCodeSelector />
)}
```

### Batch Variant Creation

```typescript
if (isSetStyle) {
  const createPromises = setPieces.map((piece) => {
    return api.styleVariants.create({
      ...formData,
      colour_name: piece.colour_name,
      colour_code: piece.colour_code,
      piece_name: piece.piece_name,
    });
  });

  await Promise.all(createPromises);
  toast.success(`${setPieces.length} variants created`);
}
```

## UI Features

### Visual Indicators

1. **Set Badge**
   ```
   Set Pieces (2 pieces)
   ```

2. **Piece Cards**
   - Each piece has its own bordered card
   - Gray background for visual separation
   - Clear numbering: "Piece 1", "Piece 2"

3. **Three-Column Grid Layout**
   ```
   [Piece Name]  [Colour]  [Color Code]
   ```
   - Perfectly aligned fields
   - Responsive to different piece counts

### Form Validation

- Piece names are required (marked with *)
- Colors are required (marked with *)
- Color codes are optional but recommended
- Visual color balls show selected colors
- Color code filtered by selected color

## Database Schema

Each piece creates a separate record in `style_variants`:

```sql
INSERT INTO style_variants (
  style_summary_id,
  style_name,
  style_id,
  piece_name,      -- "Top", "Bottom", etc.
  colour_name,     -- Different for each piece
  colour_code,     -- Different for each piece
  sizes            -- Same for all pieces
)
```

## Example Use Cases

### 1. **2-Piece Tracksuit**
- Top: Navy Blue
- Bottom: Black

### 2. **3-Piece Formal Set**
- Jacket: Charcoal
- Vest: Gray
- Pants: Charcoal

### 3. **4-Piece School Uniform**
- Shirt: White
- Sweater: Navy Blue
- Skirt: Navy Blue
- Blazer: Navy Blue

### 4. **5-Piece Layering Set**
- Base Layer: White
- Mid Layer: Gray
- Outer Layer: Black
- Scarf: Navy Blue
- Cap: Navy Blue

### 6-Piece Professional Wardrobe**
- Dress Shirt: White
- Blouse: Light Blue
- Blazer: Navy
- Pants: Black
- Skirt: Navy
- Cardigan: Gray

## Benefits

✅ **Automatic Adaptation** - Form changes based on selected style
✅ **No Manual Entry** - Piece count detected automatically
✅ **Batch Creation** - All pieces created in one submission
✅ **Consistent Data** - Same style_id and sizes for all pieces
✅ **Visual Clarity** - Clear separation between pieces
✅ **Efficient Workflow** - Enter all piece data at once

## Form States

### Non-Set Style Selected
```
┌─────────────────────────┐
│ Colour Name *           │
│ [ColorSelector]         │
├─────────────────────────┤
│ Colour Code             │
│ [ColorCodeSelector]     │
├─────────────────────────┤
│ Piece Name (optional)   │
│ [Input]                 │
└─────────────────────────┘
```

### Set Style Selected (2 pieces)
```
┌─────────────────────────────────────┐
│ Set Pieces (2 pieces)               │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Piece 1                         │ │
│ │ [Name] [Color] [Code]          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Piece 2                         │ │
│ │ [Name] [Color] [Code]          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Files Modified

- `app/dashboard/(authenticated)/erp/samples/style-variants/page.tsx`
  - Added set piece state management
  - Added dynamic form rendering
  - Updated form submission logic
  - Added piece update handlers

## Future Enhancements

### Potential Improvements:
1. **Individual Sizes** - Allow different sizes per piece
2. **Piece Templates** - Save common piece configurations
3. **Drag & Drop** - Reorder pieces
4. **Duplicate Piece** - Copy data from one piece to another
5. **Bulk Edit** - Apply same color to multiple pieces
6. **Validation Rules** - Ensure unique piece names

## Testing Checklist

- [ ] Select non-set style → Shows single color fields
- [ ] Select 2-piece set → Shows 2 piece rows
- [ ] Select 3-piece set → Shows 3 piece rows
- [ ] Update piece name → State updates correctly
- [ ] Select color → Color code filters correctly
- [ ] Submit set form → Creates multiple variants
- [ ] Toast shows correct count (e.g., "2 variants created")
- [ ] Reset form → Clears all piece data
- [ ] Switch between set/non-set → Form adapts correctly

## Summary

This implementation provides a seamless, automatic form adaptation that detects set styles and presents the appropriate number of input fields, making it intuitive and efficient to create multi-piece garment sets in the RMG ERP system.

# ERP Module Navigation

## How to Access ERP Modules

After starting the system with `docker-compose up` and logging in at http://localhost:2222, you can access the ERP modules by directly navigating to these URLs:

### Main ERP Modules

1. **Buyer Management**
   ```
   http://localhost:2222/dashboard/erp/buyers
   ```
   - View all buyers
   - Add new buyers
   - Edit existing buyers
   - Delete buyers
   - Pre-loaded with H&M, Zara, and Gap

2. **Sample Department**
   ```
   http://localhost:2222/dashboard/erp/samples
   ```
   - 6-part sample workflow
   - Create and track samples
   - Manage sample status
   - Auto-increment rounds on rejection

## Quick Navigation

### From Login:
1. Login at http://localhost:2222
2. Click on the URL bar
3. Type: `/dashboard/erp/buyers` or `/dashboard/erp/samples`
4. Press Enter

### Bookmark These URLs:
- Buyers: http://localhost:2222/dashboard/erp/buyers
- Samples: http://localhost:2222/dashboard/erp/samples

## Adding to Sidebar (Optional Future Enhancement)

To add these pages to the sidebar navigation, you would edit:
- File: `components/layout/sidebar/nav-main.tsx`
- Add entries for "ERP" → "Buyers" and "Samples"

Example structure:
```typescript
{
  title: "ERP",
  items: [
    {
      title: "Buyers",
      url: "/dashboard/erp/buyers",
    },
    {
      title: "Samples",
      url: "/dashboard/erp/samples",
    }
  ]
}
```

## Current Status

The ERP pages are fully functional but not yet added to the theme's default sidebar menu. You can:

1. **Access directly via URL** (current method)
2. **Bookmark the pages** in your browser
3. **Add to sidebar** by modifying the navigation config (future enhancement)

## Demo Flow

### For Testing Buyers:
1. Navigate to: http://localhost:2222/dashboard/erp/buyers
2. See 3 pre-loaded buyers
3. Click "Add Buyer" button
4. Fill in buyer information
5. Click "Create Buyer"
6. See the new buyer in the list

### For Testing Samples:
1. Navigate to: http://localhost:2222/dashboard/erp/samples
2. Go to "Part 1: Create" tab
3. Fill in sample information
4. Select a buyer and style from dropdowns
5. Click "Create Sample"
6. Move to "Part 2: Info" tab
7. Select your created sample from dropdown
8. See auto-filled information
9. Continue through the workflow

## API Access

You can also interact directly with the API:
- API Docs: http://localhost:8000/docs
- Try endpoints interactively
- Test with tools like Postman or cURL

---

**Note**: The ERP modules are working perfectly. They just need to be added to the sidebar menu for easier navigation. For now, use direct URLs or bookmarks.

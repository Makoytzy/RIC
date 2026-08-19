# 🏷️ Barcode & QR Code System - Setup Guide

## Quick Setup (5 minutes)

### Step 1: Run Database Migration
1. Open Supabase Dashboard: https://supabase.com/dashboard/project/vsucdxobztcioyyxbbrx/sql
2. Click "New Query"
3. Copy and paste the contents of: `backend/database/SETUP_BARCODE_COMPLETE.sql`
4. Click "Run" or press `Ctrl+Enter`
5. Wait for "Success" message
6. **Important:** Wait 30 seconds for PostgREST schema cache to reload

### Step 2: Verify Backend Server is Running
```bash
cd backend
npm run dev
```

Should show:
```
[INFO] Inventory API listening on http://0.0.0.0:4000 (development)
```

### Step 3: Test API Endpoints
```bash
cd backend
node test-barcode-endpoints.mjs
```

Expected output:
```
✅ Barcodes table accessible
✅ Barcode sequence exists: 200000000000
✅ RPC function works! Next value: 200000000001
✅ Products table accessible
```

### Step 4: Start Frontend
```bash
cd frontend
npm run dev
```

Access: http://localhost:5174

### Step 5: Test Barcode Generation
1. Login to the system
2. Navigate to: **Dashboard → Operational → Barcode Generation**
3. Select a product
4. Click "Generate"
5. You should see:
   - Barcode value (e.g., `200000000001-3`)
   - QR code image
   - Product information
   - Print and export options

---

## System Architecture

### Database Tables
- `barcodes` - Stores unique barcodes with QR codes
- `barcode_sequences` - Atomic sequence counter (prevents duplicates)
- `barcode_configurations` - System-wide barcode format settings

### API Endpoints
- `GET /api/barcodes/config` - Get current configuration
- `POST /api/barcodes/config` - Update configuration
- `POST /api/barcodes` - Generate new barcode
- `GET /api/barcodes` - List all barcodes
- `GET /api/barcodes/:value` - Get specific barcode
- `DELETE /api/barcodes/:id` - Delete barcode
- `POST /api/barcodes/:value/scan` - Record scan event

### Features
✅ Unique barcode generation (concurrent-safe)
✅ QR code generation with traceability URL
✅ CODE128 barcode format
✅ Checksum validation
✅ Batch generation
✅ Print labels (individual or bulk)
✅ Export to CSV
✅ Product linking
✅ Scan tracking

---

## Troubleshooting

### "Schema cache" errors
**Solution:** Run this in Supabase SQL Editor:
```sql
NOTIFY pgrst, 'reload schema';
```
Then wait 30 seconds.

### "Connection timeout" errors
**Check:**
1. Backend server running? `npm run dev` in `backend/`
2. Check console for errors
3. Test: `curl http://localhost:4000/health`

### "No products found"
**Solution:** Ensure products table has data. Run:
```sql
SELECT COUNT(*) FROM products;
```

### Barcodes not generating
1. Check backend logs for errors
2. Verify database tables exist: `SELECT * FROM barcodes LIMIT 1;`
3. Test sequence function: `SELECT increment_barcode_sequence('default');`

---

## Configuration

Edit barcode format in the UI or via SQL:
```sql
UPDATE barcode_configurations
SET 
  format = 'CODE128',
  prefix = 'RIC-',
  include_checksum = true,
  serial_length = 12
WHERE is_active = true;
```

---

## Production Checklist
- [ ] Database migrations run successfully
- [ ] PostgREST schema cache reloaded
- [ ] Backend server running and accessible
- [ ] Test barcode generation works
- [ ] Test QR code scanning works
- [ ] Print labels test successful
- [ ] Export CSV test successful
- [ ] All API endpoints responding

---

## Support
For issues, check:
1. Backend logs: `npm run dev` output
2. Browser console: F12 → Console tab
3. Network tab: F12 → Network tab
4. Database logs: Supabase Dashboard → Logs

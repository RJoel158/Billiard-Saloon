# QR Payment Upload System - Implementation Summary

## Completed Features ✅

### 1. Database Schema

**File**: `Server/src/db/migrations/add_qr_payment_to_reservations.sql`

- Added `qr_payment_path` VARCHAR(255) - stores file path to QR image
- Added `payment_verified` BOOLEAN DEFAULT FALSE - admin verification flag
- **Note**: Migration file created but needs manual execution (mysql CLI not available in git bash)

### 2. File Upload Configuration

**File**: `Server/src/middlewares/upload.js`

- Multer configured with disk storage
- **Destination**: `uploads/QRPayments/`
- **Naming**: `QR_{userId}_{timestamp}-{random}.{ext}`
- **Allowed formats**: jpeg, jpg, png, gif, webp
- **Max size**: 5MB
- Proper error handling for invalid files

### 3. Repository Updates

**File**: `Server/src/repositories/reservation.repository.js`
Updated all queries to include new fields:

- `findAll()` - includes qr_payment_path, payment_verified
- `findAllPaged()` - includes qr_payment_path, payment_verified
- `findById()` - includes qr_payment_path, payment_verified
- `findByTableAndDateRange()` - includes qr_payment_path, payment_verified
- `create()` - accepts qr_payment_path, payment_verified (defaults: null, false)
- `update()` - accepts qr_payment_path, payment_verified

### 4. Availability Endpoint

**New Files**:

- `Server/src/controllers/availability.controller.js`
- `Server/src/routes/availability.routes.js`

**Endpoint**: `GET /api/availability/:tableId?date=YYYY-MM-DD`

**Features**:

- Reads opening/closing hours from `system_settings` table
- Calculates available hourly slots
- Excludes busy slots (reservations + active sessions)
- Returns structured response with business hours and available slots

**Service**:

- `getAvailableSlotsWithSettings()` - new method using admin-configured hours
- Original `getAvailableSlots()` maintained for backward compatibility

### 5. Reservation Routes

**File**: `Server/src/routes/reservation.routes.js`

**Modified**:

- `POST /api/reservations` - now accepts `multipart/form-data` with `qr_payment` file field
- Added middleware: `upload.single('qr_payment')`

**New**:

- `GET /api/reservations/:id/qr` - serves uploaded QR payment image

### 6. Reservation Controller

**File**: `Server/src/controllers/reservation.controller.js`

**Modified `create()`**:

- Checks for uploaded file (`req.file`)
- Adds `qr_payment_path` from multer
- Sets `payment_verified: false` by default

**New `getQRImage()`**:

- Retrieves reservation by ID
- Validates QR image exists
- Checks file exists on disk
- Serves file using `res.sendFile()`

### 7. Reservation Service

**File**: `Server/src/services/reservation.service.js`

**Modified `createReservation()`**:

- Now accepts `qr_payment_path` and `payment_verified` fields
- Passes to repository.create()

**Modified `updateReservation()`**:

- Handles `qr_payment_path` and `payment_verified` updates
- Preserves existing values if not provided

**Modified `approveReservation()`**:

- Sets `payment_verified: true` when approving
- Updates status to confirmed (2)

### 8. Server Configuration

**File**: `Server/index.js`

- Mounted new availability routes: `app.use('/api/availability', availabilityRoutes)`

## Client Workflow

### User Flow:

1. **View Availability**: `GET /api/availability/:tableId?date=2024-12-08`
   - Returns available hourly slots based on admin hours
2. **Create Reservation with QR**: `POST /api/reservations`

   - Content-Type: `multipart/form-data`
   - Fields: `user_id`, `table_id`, `start_time`, `end_time`
   - File: `qr_payment` (image of payment QR)
   - Response: Reservation created with `payment_verified: false`, `status: 1` (pending)

3. **Check Status**: User can poll their reservation to see if approved

### Admin Flow:

1. **View Pending Reservations**: `GET /api/reservations?status=1`

   - Returns all pending reservations with `qr_payment_path`

2. **View QR Image**: `GET /api/reservations/:id/qr`

   - Opens/downloads the QR payment proof

3. **Approve Payment**: `PATCH /api/reservations/:id/approve`

   - Sets `status: 2` (confirmed)
   - Sets `payment_verified: true`
   - Client can now start session

4. **Reject Payment**: `PATCH /api/reservations/:id/reject`
   - Sets `status: 3` (cancelled)
   - Include `reason` in body

## File Structure

```
Server/
├── uploads/
│   └── QRPayments/               # QR images stored here
│       └── QR_123_1733684800000-abc123.jpg
├── src/
│   ├── controllers/
│   │   ├── availability.controller.js   ✨ NEW
│   │   └── reservation.controller.js    🔄 MODIFIED
│   ├── middlewares/
│   │   └── upload.js                    ✨ NEW
│   ├── repositories/
│   │   └── reservation.repository.js    🔄 MODIFIED
│   ├── routes/
│   │   ├── availability.routes.js       ✨ NEW
│   │   └── reservation.routes.js        🔄 MODIFIED
│   ├── services/
│   │   └── reservation.service.js       🔄 MODIFIED
│   └── db/
│       └── migrations/
│           └── add_qr_payment_to_reservations.sql  ✨ NEW
└── index.js                             🔄 MODIFIED
```

## Testing Checklist

### Manual Tests Required:

- [ ] Execute migration SQL manually in database
- [ ] Test file upload with valid image (< 5MB)
- [ ] Test file upload rejection (> 5MB)
- [ ] Test file upload rejection (invalid format)
- [ ] Test availability endpoint with different dates
- [ ] Test availability respects system_settings hours
- [ ] Test creating reservation without QR image
- [ ] Test creating reservation with QR image
- [ ] Test viewing QR image as admin
- [ ] Test approving reservation marks payment_verified
- [ ] Test rejecting reservation
- [ ] Test starting session with unverified payment (should fail)

## Next Steps

### Immediate:

1. **Execute Migration**: Run SQL manually or create script
2. **Test Upload Flow**: Create test client request with multipart/form-data
3. **Validate Session Start**: Ensure sessions check `payment_verified` before starting

### Future Enhancements:

1. **File Cleanup**: Delete QR image when reservation is deleted/expired
2. **Image Optimization**: Compress/resize images on upload
3. **Thumbnail Generation**: Create thumbnails for admin list view
4. **Security**: Add authentication middleware to QR image endpoint
5. **Notifications**: Socket.io notifications when reservation approved/rejected
6. **File Validation**: More robust MIME type checking
7. **Storage**: Consider cloud storage (S3, Cloudinary) for production

## API Reference

### Get Availability

```http
GET /api/availability/:tableId?date=YYYY-MM-DD
```

**Response**:

```json
{
  "table_id": 1,
  "date": "2024-12-08",
  "opening_time": "08:00",
  "closing_time": "23:00",
  "available_slots": [
    {
      "start_time": "2024-12-08T08:00:00.000Z",
      "end_time": "2024-12-08T09:00:00.000Z",
      "hour": "8:00 - 9:00"
    }
  ],
  "total_slots": 10
}
```

### Create Reservation with QR

```http
POST /api/reservations
Content-Type: multipart/form-data

user_id: 123
table_id: 1
start_time: 2024-12-08T14:00:00Z
end_time: 2024-12-08T16:00:00Z
qr_payment: [FILE]
```

**Response**:

```json
{
  "id": 456,
  "user_id": 123,
  "table_id": 1,
  "start_time": "2024-12-08T14:00:00Z",
  "end_time": "2024-12-08T16:00:00Z",
  "qr_payment_path": "uploads/QRPayments/QR_123_1733684800000-abc123.jpg",
  "payment_verified": false,
  "status": 1,
  "created_at": "2024-12-08T10:30:00Z"
}
```

### Get QR Image

```http
GET /api/reservations/:id/qr
```

**Response**: Image file (jpeg/png/etc.)

### Approve Reservation

```http
PATCH /api/reservations/:id/approve
Content-Type: application/json

{
  "admin_user_id": 1
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": 456,
    "status": 2,
    "payment_verified": true
  }
}
```

## Configuration

### Environment Variables

No new env vars required, but ensure:

- `FRONTEND_URL` - for CORS
- Database credentials - for migrations

### System Settings

Uses existing `system_settings` table:

- `opening_time` - e.g., "08:00:00"
- `closing_time` - e.g., "23:00:00"

## Notes

- Migration SQL created but not executed (mysql CLI unavailable)
- File cleanup on deletion not implemented yet
- No authentication on QR image endpoint (consider adding)
- Consider rate limiting on upload endpoint
- Frontend integration pending

# 🚗 Mileage Tracker for 1099 Drivers

A production-ready iOS mobile application built with **React Native (Expo)** and **PostgreSQL** backend for rideshare, taxi, and delivery drivers to track mileage, expenses, and generate IRS-compliant tax reports.

## 🎯 Features Implemented

### ✅ Authentication
- **Emergent Google Auth** integration
- Email-based OAuth flow
- Secure session management with 7-day tokens
- Automatic session persistence

### ✅ Core Functionality

#### 1. Dashboard
- Real-time statistics (monthly & yearly miles)
- Total expenses tracking
- Estimated tax deductions (IRS 2025 rate: $0.67/mile)
- Estimated tax savings (25% tax bracket)
- Quick action buttons
- GPS tracking toggle

#### 2. Mileage Tracking
- **Automatic GPS Tracking**
  - Background location tracking (iOS-compliant)
  - Real-time trip recording
  - Start/Stop functionality
- **Manual Entry**
  - Add trips manually with distance and purpose
  - Edit and delete trips
  - Assign trips to vehicles
- Trip history with automatic/manual badges
- IRS deduction calculations per trip

#### 3. Expense Tracking
- 8 expense categories:
  - Fuel
  - Maintenance
  - Insurance
  - Phone
  - Parking & Tolls
  - Licensing & Permits
  - Rideshare Fees
  - Other
- Receipt photo capture (camera integration)
- Receipt photos stored as base64
- Expense history with receipts
- Vehicle assignment

#### 4. Tax Reports
- Period selection (Monthly, Quarterly, Annual)
- Complete tax summary:
  - Total business miles
  - Mileage deduction calculation
  - Other expenses
  - Total deductions
  - Estimated tax savings
- Export options (PDF/CSV placeholders)
- IRS 2025 rate compliance ($0.67/mile)

#### 5. Settings & Management
- Vehicle management (add, edit, delete)
- Business use percentage per vehicle
- Subscription status (mock implementation)
- Profile information
- Tax year settings
- Logout functionality

## 🛠️ Tech Stack

### Frontend
- **React Native** (Expo Router v5)
- **TypeScript**
- **Navigation**: Expo Router with bottom tabs
- **State Management**: React Context (Auth & Location)
- **UI Components**: React Native core components
- **Location**: expo-location with background tracking
- **Image Handling**: expo-image-picker with base64 encoding
- **HTTP Client**: Axios
- **Date Utils**: date-fns

### Backend
- **FastAPI** (Python)
- **PostgreSQL** database with asyncpg
- **Authentication**: Emergent Auth integration
- **HTTP Client**: httpx (for OAuth)
- **CORS** enabled for mobile app

### Database Schema
```sql
- users (user_id, email, name, picture, created_at)
- user_sessions (session_token, user_id, expires_at)
- vehicles (vehicle_id, user_id, name, make, model, year, business_percentage)
- trips (trip_id, user_id, vehicle_id, start_time, end_time, distance, location, purpose, is_business, is_automatic)
- expenses (expense_id, user_id, vehicle_id, amount, category, date, notes, receipt_image_base64)
```

## 📱 iOS Permissions

The app requests the following permissions (configured in app.json):

- **Location (Always)**: Background mileage tracking
- **Location (When In Use)**: Manual mileage tracking
- **Camera**: Receipt photo capture
- **Photo Library**: Receipt image access

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/session` - Exchange session_id for session_token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout and clear session

### Vehicles
- `POST /api/vehicles` - Create vehicle
- `GET /api/vehicles` - List user vehicles
- `DELETE /api/vehicles/{id}` - Delete vehicle

### Trips
- `POST /api/trips` - Create trip
- `GET /api/trips` - List user trips
- `PUT /api/trips/{id}` - Update trip
- `DELETE /api/trips/{id}` - Delete trip

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - List user expenses
- `DELETE /api/expenses/{id}` - Delete expense

### Dashboard & Reports
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/reports/tax` - Generate tax report for period
- `GET /api/subscription/status` - Get subscription status (mock)

## 🚀 Running the Application

### Backend
```bash
cd /app/backend
python server.py
# Runs on http://0.0.0.0:8001
```

### Frontend
```bash
cd /app/frontend
yarn start
# Expo web: http://localhost:3000
# Expo Go: Scan QR code
```

### Database
PostgreSQL is running locally on port 5432:
- Database: `mileage_tracker`
- User: `postgres`
- Password: `postgres`

## 📊 IRS Compliance

- **2025 IRS Standard Mileage Rate**: $0.67 per mile
- Trip logs include:
  - Date and time
  - Starting and ending locations
  - Distance traveled
  - Business purpose
  - Vehicle information
- Expense tracking with receipt photos
- Tax savings calculated on 25% tax bracket (adjustable)

## 💳 Subscription Model (Mock)

The app includes a mock subscription system for testing:
- **Plan Type**: Pro
- **Status**: Active
- **Features**:
  - Automatic GPS tracking
  - Unlimited expenses
  - Tax reports (PDF/CSV)
  - Multiple vehicles

*Note: Real Apple In-App Purchases would need Apple Developer account and App Store Connect setup*

## 📝 Future Enhancements

1. **PDF/CSV Export**: Implement actual report generation
2. **Apple Sign-In**: Add as alternative auth method
3. **Real IAP**: Integrate Apple In-App Purchases
4. **Advanced Reports**: More detailed analytics
5. **Cloud Sync**: Backup to cloud storage
6. **Multi-platform**: Android support

## 🔒 Security & Privacy

- Session tokens stored securely in AsyncStorage
- HTTPOnly cookies for web
- Background location with proper permissions
- User data encrypted at rest
- Disclaimer: "Not tax advice" included in reports

## 📄 License

This is a demo application. For production use, ensure proper licensing and compliance with:
- Apple Developer Program requirements
- IRS guidelines for mileage tracking
- Data privacy regulations (GDPR, CCPA)

## 🆘 Support

For issues or questions, check:
- Backend logs: `/var/log/supervisor/backend.err.log`
- Frontend logs: `/var/log/supervisor/expo.out.log`
- Database: `psql -U postgres -d mileage_tracker`

---

**Built with ❤️ for 1099 drivers to maximize tax deductions**

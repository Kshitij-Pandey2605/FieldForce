# FieldForce - Employee Field Visit Management App

FieldForce is a React Native mobile application built with Expo for managing employee field visits. It includes location tracking, photo capture, contact management, and a complete backend API for visit data management.

## Features

- **Authentication** — Secure login and registration with JWT tokens
- **Field Visits** — Create, view, edit, and manage field visits
- **Location Tracking** — Real-time GPS tracking and address lookup
- **Photo Capture** — Built-in camera for capturing visit photos
- **Contacts Management** — Searchable employee contact list
- **Visit Details** — Comprehensive visit information including location, contact, and notes
- **Protected APIs** — JWT-based backend authentication
- **Secure Storage** — Encrypted token storage on device

## Project Structure

```
FieldForce/
├── app/                      # Expo Router screens
│   ├── (auth)/              # Authentication routes
│   │   ├── login.jsx
│   │   └── register.jsx
│   ├── (tabs)/              # Main app routes
│   │   ├── index.jsx        # Dashboard
│   │   ├── visits.jsx       # Visit list
│   │   ├── map.jsx          # Location tracking
│   │   ├── camera.jsx       # Photo capture
│   │   ├── contacts.jsx     # Contact management
│   │   ├── profile.jsx      # User profile
│   │   └── visits/[id].jsx  # Visit detail screen
│   ├── index.jsx            # Landing page
│   └── _layout.jsx          # Root layout with auth guard
├── backend/                  # Express.js backend
│   ├── models/              # MongoDB schemas
│   │   ├── User.js
│   │   └── Visit.js
│   ├── controllers/         # Route handlers
│   │   ├── authController.js
│   │   └── visitController.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   └── visitRoutes.js
│   ├── middleware/          # Express middleware
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── config/              # Database config
│   │   └── db.js
│   ├── server.js            # Express server entry
│   ├── .env                 # Environment variables
│   └── package.json
├── components/              # Reusable UI components
│   ├── CustomButton.jsx
│   ├── CustomInput.jsx
│   ├── Loading.jsx
│   └── EmptyState.jsx
├── hooks/                   # Custom React hooks
│   ├── useAuthContext.js
│   ├── useLocation.js
│   ├── useVisitService.js
│   └── useImageUpload.js
├── context/                 # React Context providers
│   └── AuthContext.jsx
├── constants/               # App constants
│   └── api.js
└── package.json            # Frontend dependencies
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- MongoDB (local or cloud)
- Expo CLI: `npm install -g expo-cli`
- Android Emulator or iOS Simulator (or physical device with Expo Go)

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd c:\Users\Kshitij Pandey\OneDrive\Desktop\Native\FieldForce
   npm install
   ```

2. **Start the Expo server**
   ```bash
   npx expo start
   ```

3. **Open on device/emulator**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app on physical device

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (`.env` file)
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fieldforce
   JWT_SECRET=your_jwt_secret_here
   ```

4. **Start MongoDB**
   - Local: `mongod`
   - Or use MongoDB Atlas cloud connection string in `MONGODB_URI`

5. **Start the backend server**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login user

### Visits (Protected - requires JWT)
- `GET /api/visits` — Get all user visits
- `POST /api/visits` — Create new visit
- `GET /api/visits/:id` — Get visit details
- `PUT /api/visits/:id` — Update visit
- `DELETE /api/visits/:id` — Delete visit

## Testing the App

1. **Create an account**
   - Open app and register with email/password
   - Credentials are securely stored locally

2. **Create a visit**
   - Navigate to Visits tab
   - Click "Start New Visit"
   - View visit details by tapping on a visit card

3. **Test features**
   - **Map** — View current location with GPS tracking
   - **Camera** — Capture photos for visits
   - **Contacts** — Search and view employee contacts
   - **Profile** — View user info and logout

## Tech Stack

### Frontend
- **Expo 54** — React Native framework
- **Expo Router** — File-based navigation
- **React Native** — Cross-platform UI
- **React Hooks** — State management
- **expo-secure-store** — Encrypted token storage
- **expo-camera** — Camera integration
- **expo-location** — GPS tracking
- **expo-constants** — Configuration

### Backend
- **Express.js** — Node.js web framework
- **MongoDB + Mongoose** — Database
- **JWT** — Token-based authentication
- **bcryptjs** — Password hashing
- **dotenv** — Environment configuration

## Important Notes

### Android Emulator Configuration
- Frontend uses `http://10.0.2.2:5000/api` to reach backend on host machine
- For physical device: Update `API_BASE` in `constants/api.js` to your machine's IP

### Camera Permissions
- App requests camera permissions on first use
- Android: Permissions configured in `app.json`
- iOS: Requires `NSCameraUsageDescription` in Info.plist

### Location Permissions
- Foreground location permission required for map and GPS features
- Automatically requested when accessing location features

### MongoDB Connection
- Default: localhost MongoDB
- Production: Use MongoDB Atlas connection string
- Update `MONGODB_URI` in `backend/.env`

## Development Tips

- Use Expo logs: `npx expo start --clear`
- Debug with React Native Debugger or Flipper
- Check permissions with: `expo credentials:manager`
- Test errors: Use browser DevTools when running on web (`npm run web`)

## Building for Production

### Android APK
```bash
eas build --platform android --local
```

### iOS IPA
```bash
eas build --platform ios --local
```

## Troubleshooting

### Backend not connecting
- Ensure MongoDB is running
- Check `backend/.env` configuration
- Verify backend server is running on port 5000
- For Android emulator, confirm `10.0.2.2` is correct

### Camera not working
- Grant camera permissions when prompted
- Check `app.json` camera plugin configuration
- Verify device has camera hardware

### Location not updating
- Enable location services on device
- Grant foreground location permission
- Check GPS signal availability

## Future Enhancements

- Media gallery for visit photos
- Visit filtering and sorting
- Offline sync support
- Push notifications
- Team collaboration features
- Advanced reporting and analytics
- Export visit reports

## License

MIT

## Support

For issues and questions, refer to the Expo documentation:
- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Community](https://chat.expo.dev/)

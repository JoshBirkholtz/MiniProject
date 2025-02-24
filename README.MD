# Cape Town Festivals Platform

A comprehensive web application for managing and discovering cultural events and festivals in Cape Town. Built with React, Node.js, and Firebase.

## Features

- **User Authentication**: Secure login/signup system with role-based access
- **Event Management**: Create, edit, and manage events with detailed information
- **Interactive Map**: View all events on an interactive map interface
- **Weather Integration**: Real-time weather forecasts for event dates
- **RSVP System**: Easy event registration and attendance tracking
- **Rating System**: Post-event feedback and rating functionality
- **Admin Dashboard**: Comprehensive analytics and event management tools
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

### Frontend
- React with Vite
- Mantine UI Components
- TailwindCSS
- Firebase Authentication
- Google Maps API
- OpenWeather API

### Backend
- Node.js/Express
- Firebase Admin SDK
- Firestore Database
- Firebase Storage

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
cd client && npm install
cd ../server && npm install
```

3. Set up environment variables:
```bash
# Client (.env)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key
VITE_OPENWEATHER_API_KEY=your_weather_api_key

# Server (.env)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_CERT_URL=your_cert_url
```

4. Run the development servers:
```bash
# Frontend
cd client
npm run dev

# Backend
cd server
npm run dev
```

## Test Users

### Admin Account
```plaintext
Email: admin@gmail.com
Password: Admin123
```

### Test User Accounts

#### 1. Young Art Enthusiast
```json
{
  "email": "sarah@example.com",
  "password": "Test123!",
  "profile": {
    "name": "Sarah Chen",
    "age": 23,
    "gender": "Female",
    "budget": "R501-R1000",
    "interests": ["Art", "Fashion", "Music"]
  }
}
```

#### 2. Mid-Career Music Lover
```json
{
  "email": "james@example.com",
  "password": "Test123!",
  "profile": {
    "name": "James Wilson",
    "age": 35,
    "gender": "Male",
    "budget": "R1001-R2000",
    "interests": ["Music", "Beer", "Food"]
  }
}
```

#### 3. Budget-Conscious Student
```json
{
  "email": "zoe@example.com",
  "password": "Test123!",
  "profile": {
    "name": "Zoe Adams",
    "age": 19,
    "gender": "Female",
    "budget": "R0-R500",
    "interests": ["Music", "Art"]
  }
}
```

#### 4. High-Budget Professional
```json
{
  "email": "michael@example.com",
  "password": "Test123!",
  "profile": {
    "name": "Michael Patel",
    "age": 42,
    "gender": "Male",
    "budget": "R2000+",
    "interests": ["Food", "Beer", "Fashion"]
  }
}
```

#### 5. Senior Arts Patron
```json
{
  "email": "linda@example.com",
  "password": "Test123!",
  "profile": {
    "name": "Linda Thompson",
    "age": 58,
    "gender": "Female",
    "budget": "R2000+",
    "interests": ["Art", "Fashion", "Food"]
  }
}
```

## Production Deployment

The application is deployed on Render:

- Frontend + Backend: [https://cape-town-festivals.onrender.com](https://cape-town-festivals.onrender.com)

## License

This project is licensed under the MIT License.
# Gym Management API

A comprehensive NestJS API for gym management with Google OAuth authentication, workout plan management, availability scheduling, and slot booking system.

## Features

- 🔐 **Google OAuth Authentication** - Secure login with Google
- 💪 **Workout Management** - Create, read, update, and delete workout plans with exercises
- 📅 **Availability Management** - Set available time slots for trainers
- 🎯 **Booking System** - Clients can book available slots with trainers
- 🗄️ **PostgreSQL Database** - Using Neon DB with Prisma ORM
- 🔒 **JWT Authentication** - Secure API endpoints

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL (Neon DB)
- **ORM**: Prisma
- **Authentication**: Passport (Google OAuth 2.0, JWT)
- **Validation**: class-validator, class-transformer

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Neon DB account (or any PostgreSQL database)
- Google OAuth credentials

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Neon DB

1. Go to [Neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback`
7. Copy Client ID and Client Secret

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@your-neon-db-host/gym_db?sslmode=require"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"

# Application
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

### 5. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 6. Start the Server

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api`

## API Endpoints

### Authentication

- `GET /api/auth/google` - Initiate Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/profile` - Get current user profile (requires JWT)

### Workout Plans

- `POST /api/workouts` - Create workout plan
- `GET /api/workouts` - Get all workout plans
- `GET /api/workouts/:id` - Get workout plan by ID
- `PUT /api/workouts/:id` - Update workout plan
- `DELETE /api/workouts/:id` - Delete workout plan

### Availability

- `POST /api/availability` - Create availability
- `GET /api/availability` - Get all availabilities
- `GET /api/availability/slots` - Get available slots (with optional date filter)
- `GET /api/availability/:id` - Get availability by ID
- `PUT /api/availability/:id` - Update availability
- `DELETE /api/availability/:id` - Delete availability

### Bookings

- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get all user bookings
- `GET /api/bookings/trainer` - Get trainer bookings
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

## API Usage Examples

### 1. Authentication Flow

```bash
# Step 1: Redirect user to Google OAuth
# User visits: http://localhost:3000/api/auth/google

# Step 2: User is redirected back with token
# Frontend receives token at: http://localhost:5173/auth/callback?token=JWT_TOKEN

# Step 3: Use token for authenticated requests
curl -H "Authorization: Bearer JWT_TOKEN" \
  http://localhost:3000/api/auth/profile
```

### 2. Create Workout Plan

```bash
curl -X POST http://localhost:3000/api/workouts \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Beginner Full Body",
    "description": "3-day full body workout for beginners",
    "duration": 90,
    "exercises": [
      {
        "name": "Squats",
        "sets": 3,
        "reps": 10,
        "notes": "Keep back straight",
        "order": 0
      },
      {
        "name": "Push-ups",
        "sets": 3,
        "reps": 12,
        "order": 1
      }
    ]
  }'
```

### 3. Set Availability

```bash
curl -X POST http://localhost:3000/api/availability \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-15",
    "startTime": "09:00",
    "endTime": "17:00",
    "isRecurring": false
  }'
```

This will automatically generate 1-hour slots from 9 AM to 5 PM.

### 4. Get Available Slots

```bash
# Get all future slots
curl http://localhost:3000/api/availability/slots \
  -H "Authorization: Bearer JWT_TOKEN"

# Get slots for specific date
curl "http://localhost:3000/api/availability/slots?date=2026-02-15" \
  -H "Authorization: Bearer JWT_TOKEN"
```

### 5. Book a Slot

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "slot-id-from-available-slots",
    "notes": "First training session"
  }'
```

## Database Schema

### User
- id, email, name, picture, googleId, role, timestamps

### WorkoutPlan
- id, name, description, duration, createdBy, timestamps

### Exercise
- id, name, sets, reps, notes, order, workoutPlanId, timestamps

### Availability
- id, date, startTime, endTime, isRecurring, dayOfWeek, userId, timestamps

### Slot
- id, startTime, endTime, status, availabilityId, trainerId, timestamps

### Booking
- id, slotId, clientId, status, notes, timestamps

## Project Structure

```
gym-api/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── workout/
│   │   ├── dto/
│   │   ├── workout.controller.ts
│   │   ├── workout.module.ts
│   │   └── workout.service.ts
│   ├── availability/
│   │   ├── dto/
│   │   ├── availability.controller.ts
│   │   ├── availability.module.ts
│   │   └── availability.service.ts
│   ├── booking/
│   │   ├── dto/
│   │   ├── booking.controller.ts
│   │   ├── booking.module.ts
│   │   └── booking.service.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── app.module.ts
│   └── main.ts
├── .env
├── .gitignore
├── nest-cli.json
├── package.json
└── tsconfig.json
```

## Key Features Implementation

### 1. Google OAuth Integration
- Users can sign in with their Google account
- Automatic user creation on first login
- JWT tokens issued for subsequent requests

### 2. Workout Plan Management
- Create custom workout plans with multiple exercises
- Each exercise includes sets, reps, and optional notes
- Exercises are ordered for proper workout flow

### 3. Availability System
- Trainers can set their available time slots
- Automatic generation of hourly slots
- Support for recurring availabilities
- Date and time validation

### 4. Booking System
- Clients can view and book available slots
- Prevents double booking
- Booking cancellation with slot release
- Trainer can view all their bookings

## Security Features

- JWT-based authentication
- Protected routes with guards
- User ownership validation
- SQL injection prevention (Prisma)
- Input validation with class-validator

## Testing the API

You can test the API using:
- **Postman**: Import the endpoints and test
- **Thunder Client** (VS Code extension)
- **curl**: Command-line testing
- **Prisma Studio**: View database records

## Troubleshooting

### Database Connection Issues
- Verify your DATABASE_URL is correct
- Ensure Neon DB is accessible
- Check if `?sslmode=require` is added to the connection string

### Google OAuth Issues
- Verify redirect URIs match exactly
- Check if Google+ API is enabled
- Ensure OAuth consent screen is configured

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

## Future Enhancements

- [ ] Email notifications for bookings
- [ ] Payment integration
- [ ] Workout progress tracking
- [ ] Admin dashboard
- [ ] Mobile app support
- [ ] Calendar integration
- [ ] Real-time notifications

## License

MIT

## Support

For issues or questions, please create an issue in the repository.

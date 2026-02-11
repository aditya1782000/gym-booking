# API Testing Guide

## Quick Start Testing with curl

### 1. Authentication

#### Start Google OAuth Flow
```bash
# Open in browser
http://localhost:3000/api/auth/google
```

After authentication, you'll be redirected to your frontend with a token:
```
http://localhost:5173/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Get User Profile
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Workout Plans

#### Create Workout Plan
```bash
curl -X POST http://localhost:3000/api/workouts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Beginner 3-Day Split",
    "description": "Perfect for those starting their fitness journey",
    "duration": 90,
    "exercises": [
      {
        "name": "Bench Press",
        "sets": 3,
        "reps": 10,
        "notes": "Focus on form over weight",
        "order": 0
      },
      {
        "name": "Squats",
        "sets": 3,
        "reps": 12,
        "notes": "Keep knees aligned with toes",
        "order": 1
      },
      {
        "name": "Deadlifts",
        "sets": 3,
        "reps": 8,
        "notes": "Engage core throughout",
        "order": 2
      },
      {
        "name": "Planks",
        "sets": 3,
        "reps": 10,
        "notes": "Hold for 30-60 seconds",
        "order": 3
      }
    ]
  }'
```

#### Get All Workout Plans
```bash
curl -X GET http://localhost:3000/api/workouts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Specific Workout Plan
```bash
curl -X GET http://localhost:3000/api/workouts/WORKOUT_PLAN_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update Workout Plan
```bash
curl -X PUT http://localhost:3000/api/workouts/WORKOUT_PLAN_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Beginner Full Body - Updated",
    "duration": 60
  }'
```

#### Delete Workout Plan
```bash
curl -X DELETE http://localhost:3000/api/workouts/WORKOUT_PLAN_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Availability Management

#### Create Availability (Single Day)
```bash
curl -X POST http://localhost:3000/api/availability \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-20",
    "startTime": "09:00",
    "endTime": "17:00",
    "isRecurring": false
  }'
```

This creates availability from 9 AM to 5 PM and automatically generates hourly slots:
- 09:00 - 10:00
- 10:00 - 11:00
- 11:00 - 12:00
- ... and so on

#### Create Recurring Availability
```bash
curl -X POST http://localhost:3000/api/availability \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-20",
    "startTime": "09:00",
    "endTime": "13:00",
    "isRecurring": true,
    "dayOfWeek": 1
  }'
```

dayOfWeek: 0=Sunday, 1=Monday, 2=Tuesday, ..., 6=Saturday

#### Get All Availabilities
```bash
curl -X GET http://localhost:3000/api/availability \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Available Slots (All Future)
```bash
curl -X GET http://localhost:3000/api/availability/slots \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Available Slots for Specific Date
```bash
curl -X GET "http://localhost:3000/api/availability/slots?date=2026-02-20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update Availability
```bash
curl -X PUT http://localhost:3000/api/availability/AVAILABILITY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "10:00",
    "endTime": "16:00"
  }'
```

#### Delete Availability
```bash
curl -X DELETE http://localhost:3000/api/availability/AVAILABILITY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Booking Management

#### Create Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "SLOT_ID_FROM_AVAILABLE_SLOTS",
    "notes": "Looking forward to the session!"
  }'
```

#### Get All User Bookings
```bash
curl -X GET http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Trainer's Bookings
```bash
curl -X GET http://localhost:3000/api/bookings/trainer \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Specific Booking
```bash
curl -X GET http://localhost:3000/api/bookings/BOOKING_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update Booking
```bash
curl -X PUT http://localhost:3000/api/bookings/BOOKING_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Please bring yoga mat",
    "status": "CONFIRMED"
  }'
```

#### Cancel Booking
```bash
curl -X DELETE http://localhost:3000/api/bookings/BOOKING_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Postman Collection

### Environment Variables
Create a Postman environment with:
- `base_url`: `http://localhost:3000/api`
- `jwt_token`: Your JWT token (set after authentication)

### Collection Structure

#### Folder: Auth
1. **Google OAuth Start**
   - GET: `{{base_url}}/auth/google`
   - Description: Open in browser

2. **Get Profile**
   - GET: `{{base_url}}/auth/profile`
   - Headers: `Authorization: Bearer {{jwt_token}}`

#### Folder: Workouts
1. **Create Workout Plan**
   - POST: `{{base_url}}/workouts`
   - Headers: `Authorization: Bearer {{jwt_token}}`
   - Body: JSON (see example above)

2. **Get All Workouts**
   - GET: `{{base_url}}/workouts`
   - Headers: `Authorization: Bearer {{jwt_token}}`

3. **Get Workout by ID**
   - GET: `{{base_url}}/workouts/:id`
   - Headers: `Authorization: Bearer {{jwt_token}}`

4. **Update Workout**
   - PUT: `{{base_url}}/workouts/:id`
   - Headers: `Authorization: Bearer {{jwt_token}}`
   - Body: JSON

5. **Delete Workout**
   - DELETE: `{{base_url}}/workouts/:id`
   - Headers: `Authorization: Bearer {{jwt_token}}`

#### Folder: Availability
(Similar structure as workouts)

#### Folder: Bookings
(Similar structure as workouts)

## Common Response Examples

### Successful Workout Plan Creation
```json
{
  "id": "clxxx1234567890abcdef",
  "name": "Beginner 3-Day Split",
  "description": "Perfect for those starting their fitness journey",
  "duration": 90,
  "createdBy": "user-id",
  "createdAt": "2026-02-11T10:30:00.000Z",
  "updatedAt": "2026-02-11T10:30:00.000Z",
  "exercises": [
    {
      "id": "ex-id-1",
      "name": "Bench Press",
      "sets": 3,
      "reps": 10,
      "notes": "Focus on form over weight",
      "order": 0,
      "workoutPlanId": "clxxx1234567890abcdef",
      "createdAt": "2026-02-11T10:30:00.000Z",
      "updatedAt": "2026-02-11T10:30:00.000Z"
    }
  ]
}
```

### Available Slots Response
```json
[
  {
    "id": "slot-id-1",
    "startTime": "2026-02-20T09:00:00.000Z",
    "endTime": "2026-02-20T10:00:00.000Z",
    "status": "OPEN",
    "availabilityId": "avail-id",
    "trainerId": "trainer-id",
    "trainer": {
      "id": "trainer-id",
      "name": "John Trainer",
      "email": "trainer@example.com",
      "picture": "https://..."
    },
    "availability": {
      "id": "avail-id",
      "date": "2026-02-20T00:00:00.000Z",
      "startTime": "09:00",
      "endTime": "17:00"
    }
  }
]
```

### Booking Creation Response
```json
{
  "id": "booking-id",
  "slotId": "slot-id",
  "clientId": "user-id",
  "status": "CONFIRMED",
  "notes": "Looking forward to the session!",
  "createdAt": "2026-02-11T10:30:00.000Z",
  "updatedAt": "2026-02-11T10:30:00.000Z",
  "slot": {
    "id": "slot-id",
    "startTime": "2026-02-20T09:00:00.000Z",
    "endTime": "2026-02-20T10:00:00.000Z",
    "trainer": {
      "id": "trainer-id",
      "name": "John Trainer",
      "email": "trainer@example.com"
    }
  },
  "client": {
    "id": "user-id",
    "name": "Jane Client",
    "email": "client@example.com"
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Workout plan not found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "duration must be an integer number"
  ],
  "error": "Bad Request"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You do not have access to this workout plan"
}
```

## Testing Workflow

### Complete Booking Flow

1. **Authenticate**
   ```bash
   # Visit http://localhost:3000/api/auth/google in browser
   # Save the JWT token
   ```

2. **Create Availability (as Trainer)**
   ```bash
   curl -X POST http://localhost:3000/api/availability \
     -H "Authorization: Bearer TRAINER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "date": "2026-02-20",
       "startTime": "09:00",
       "endTime": "12:00"
     }'
   ```

3. **View Available Slots (as Client)**
   ```bash
   curl -X GET "http://localhost:3000/api/availability/slots?date=2026-02-20" \
     -H "Authorization: Bearer CLIENT_TOKEN"
   ```

4. **Book a Slot (as Client)**
   ```bash
   curl -X POST http://localhost:3000/api/bookings \
     -H "Authorization: Bearer CLIENT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "slotId": "SLOT_ID_FROM_STEP_3",
       "notes": "First session"
     }'
   ```

5. **View Bookings**
   ```bash
   # As client
   curl -X GET http://localhost:3000/api/bookings \
     -H "Authorization: Bearer CLIENT_TOKEN"

   # As trainer
   curl -X GET http://localhost:3000/api/bookings/trainer \
     -H "Authorization: Bearer TRAINER_TOKEN"
   ```

## Tips for Testing

1. **Save your JWT token**: After authentication, save it for reuse
2. **Use environment variables**: Store `base_url` and `jwt_token`
3. **Test authorization**: Try accessing resources with wrong tokens
4. **Test validation**: Send invalid data to see validation in action
5. **Use Prisma Studio**: View database changes in real-time

## Debugging

Enable detailed logging in your `.env`:
```env
LOG_LEVEL=debug
```

Check server logs for detailed error messages and request information.

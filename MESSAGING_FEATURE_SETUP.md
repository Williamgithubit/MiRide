# Messaging Feature Implementation Guide

## Overview
A complete messaging system has been implemented for the MiRide car rental platform, allowing renters to send messages to car owners and owners to manage their inquiries.

## ✅ Completed Components

### Backend (Node.js + Express)

#### 1. Message Model (`server/models/Message.js`)
- **Fields:**
  - `id`: Auto-incrementing primary key
  - `carId`: Reference to the car
  - `ownerId`: Reference to the car owner
  - `senderId`: Reference to the message sender
  - `messageText`: The message content
  - `isRead`: Boolean flag for read status
  - `readAt`: Timestamp when message was read
  - `createdAt`, `updatedAt`: Timestamps

#### 2. Database Migration (`server/migrations/20251128-create-messages.js`)
- Creates the `messages` table
- Adds indexes for performance:
  - `owner_id` + `is_read`
  - `sender_id`
  - `car_id`
  - `created_at`

**To run the migration:**
```bash
cd server
npx sequelize-cli db:migrate
```

#### 3. Message Controller (`server/controllers/messageController.js`)
- **Endpoints:**
  - `sendMessage`: Send a message to car owner
  - `getOwnerMessages`: Get all messages for the owner
  - `getSentMessages`: Get messages sent by the user
  - `markMessageAsRead`: Mark a message as read
  - `getUnreadCount`: Get count of unread messages
  - `deleteMessage`: Delete a message (owner only)

#### 4. Message Routes (`server/routes/messageRoutes.js`)
- `POST /api/messages/send` - Send a message
- `GET /api/messages/owner` - Get owner's messages
- `GET /api/messages/sent` - Get sent messages
- `GET /api/messages/owner/unread-count` - Get unread count
- `PUT /api/messages/:id/read` - Mark as read
- `DELETE /api/messages/:id` - Delete message

#### 5. Server Configuration (`server/server.js`)
- Message routes integrated at `/api/messages`
- All routes protected with JWT authentication

### Frontend (React + TypeScript)

#### 1. Redux API Slice (`client/src/store/Message/messageApi.ts`)
- **RTK Query endpoints:**
  - `sendMessage`: Mutation to send a message
  - `getOwnerMessages`: Query to fetch owner's messages
  - `getSentMessages`: Query to fetch sent messages
  - `getUnreadCount`: Query for unread count
  - `markMessageAsRead`: Mutation to mark as read
  - `deleteMessage`: Mutation to delete a message

#### 2. Redux Store Integration (`client/src/store/store.ts`)
- Message API added to the store
- Middleware configured
- Persistence blacklisted for message cache

#### 3. MessageModal Component (`client/src/components/MessageModal.tsx`)
- **Features:**
  - Modal dialog for sending messages
  - Message text input with character counter (max 5000)
  - Displays car and owner information
  - Form validation
  - Loading states
  - Success/error toast notifications
  - Prevents sending messages to yourself

#### 4. CarDetails Component Updates (`client/src/components/CarDetails.tsx`)
- **New Features:**
  - Displays actual owner name from backend
  - "Message Owner" button opens MessageModal
  - Authentication check before messaging
  - Owner initials displayed in avatar
  - Integrated MessageModal component

#### 5. OwnerMessages Component (`client/src/components/OwnerMessages.tsx`)
- **Features:**
  - Dashboard for car owners to view messages
  - Statistics cards (Total, Unread, Read)
  - Filter by all/unread messages
  - Message list with:
    - Sender information
    - Car details
    - Timestamp
    - Message content
    - Read/unread status
  - Actions:
    - Mark as read
    - Delete message
  - Empty state handling
  - Responsive design

#### 6. Type Definitions (`client/src/types/index.ts`)
- Updated `User` interface to support both `name` and `firstName`/`lastName` formats

## 🚀 How to Use

### For Renters (Sending Messages)

1. Navigate to any car details page
2. Click the "Message Owner" button
3. Enter your message in the modal
4. Click "Send Message"
5. Receive confirmation toast

**Requirements:**
- Must be logged in
- Cannot message yourself (if you own the car)

### For Owners (Viewing Messages)

1. Add the OwnerMessages component to your owner dashboard
2. View all messages in one place
3. Filter by unread messages
4. Mark messages as read
5. Delete unwanted messages

**Example integration:**
```tsx
import OwnerMessages from './components/OwnerMessages';

// In your owner dashboard route
<Route path="/owner/messages" element={<OwnerMessages />} />
```

## 📋 Next Steps

### 1. Run Database Migration
```bash
cd server
npx sequelize-cli db:migrate
```

### 2. Restart the Server
```bash
cd server
npm start
```

### 3. Add OwnerMessages to Dashboard
Add a route in your owner dashboard for the messages component.

### 4. Optional Enhancements

#### Add to Owner Dashboard Navigation
```tsx
// In your owner dashboard navigation
<NavLink to="/owner/messages">
  <FaEnvelope />
  Messages
  {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
</NavLink>
```

#### Real-time Notifications
Consider adding:
- WebSocket integration for real-time message notifications
- Email notifications when new messages arrive
- Push notifications for mobile

#### Message Threading
- Group messages by conversation
- Reply functionality
- Message history per car/user

#### Advanced Features
- Message search functionality
- Archive messages
- Message templates for common responses
- Attachment support (images, documents)

## 🔒 Security Features

- **Authentication Required**: All endpoints require JWT authentication
- **Authorization**: Users can only:
  - Send messages to car owners (not themselves)
  - View their own received messages (if owner)
  - View their own sent messages
  - Delete only their own received messages
- **Input Validation**:
  - Message text required and limited to 5000 characters
  - Car and owner validation
  - Prevents empty messages
- **SQL Injection Protection**: Sequelize ORM with parameterized queries
- **XSS Protection**: React automatically escapes content

## 📊 Database Schema

```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_owner_read (owner_id, is_read),
  INDEX idx_sender (sender_id),
  INDEX idx_car (car_id),
  INDEX idx_created (created_at)
);
```

## 🧪 Testing Checklist

- [ ] Run database migration successfully
- [ ] Send a message from car details page
- [ ] Verify message appears in owner's messages
- [ ] Mark message as read
- [ ] Delete a message
- [ ] Test authentication (logged out users redirected)
- [ ] Test validation (empty message rejected)
- [ ] Test self-messaging prevention
- [ ] Test unread count display
- [ ] Test filter functionality (all/unread)

## 📝 API Documentation

### Send Message
```
POST /api/messages/send
Authorization: Bearer <token>

Body:
{
  "carId": 1,
  "ownerId": "uuid-here",
  "messageText": "Hi, I'm interested in renting this car..."
}

Response:
{
  "message": "Message sent successfully",
  "data": { /* message object */ }
}
```

### Get Owner Messages
```
GET /api/messages/owner?limit=50&offset=0&unreadOnly=false&carId=1
Authorization: Bearer <token>

Response:
{
  "messages": [ /* array of messages */ ],
  "total": 10,
  "limit": 50,
  "offset": 0
}
```

### Mark as Read
```
PUT /api/messages/:id/read
Authorization: Bearer <token>

Response:
{
  "message": "Message marked as read",
  "data": { /* updated message */ }
}
```

## 🎨 UI Components

### MessageModal Props
```typescript
interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId: number;
  ownerId: string;
  ownerName: string;
  carName: string;
}
```

### OwnerMessages Features
- Responsive grid layout
- Statistics dashboard
- Filter controls
- Message cards with actions
- Empty states
- Loading states
- Error handling

## ✨ Features Summary

✅ **Complete messaging system**
✅ **Owner name display on car details**
✅ **Message modal with validation**
✅ **Owner dashboard for messages**
✅ **Read/unread status tracking**
✅ **Message deletion**
✅ **Unread count**
✅ **Filtering capabilities**
✅ **Responsive design**
✅ **Authentication & authorization**
✅ **Toast notifications**
✅ **Error handling**

## 🐛 Troubleshooting

### Migration Issues
If migration fails, check:
- Database connection in `server/config/config.js`
- Sequelize CLI is installed: `npm install -g sequelize-cli`
- Database exists and is accessible

### Messages Not Appearing
- Verify JWT token is valid
- Check browser console for errors
- Verify API endpoints are accessible
- Check Redux DevTools for API calls

### Owner Name Not Showing
- Ensure car query includes owner association
- Check User model has `name` field
- Verify owner exists for the car

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Check server logs
3. Verify database migration ran successfully
4. Ensure all dependencies are installed

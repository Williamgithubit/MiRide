# Customer Review System Guide

## Overview
The review system allows customers to rate and review cars they have rented. This guide explains how the system works and how to use it.

## How It Works

### 1. **Complete a Rental**
- First, you need to rent a car and complete the rental
- Only rentals with status `completed` can be reviewed
- Each rental can only be reviewed once

### 2. **Access My Reviews**
- Navigate to the Customer Dashboard
- Click on "My Reviews" in the sidebar
- You'll see three main sections:
  - **Total Reviews**: Number of reviews you've written
  - **Average Rating**: Your average rating across all reviews
  - **Can Review**: Number of completed rentals waiting for review

### 3. **Write a Review**

#### Option A: From the "Completed Rentals" Section
1. In the "My Reviews" page, look for the blue section titled "Completed Rentals - Write Reviews"
2. You'll see cards showing all your completed rentals that haven't been reviewed yet
3. Each card displays:
   - Car image
   - Car brand and model (e.g., "Toyota Camry")
   - Rental dates
   - "Write Review" button
4. Click the "Write Review" button on any car

#### Option B: From Empty State
1. If you have no reviews yet but have completed rentals
2. Click the "Write Your First Review" button

### 4. **Fill Out the Review Form**
The review form includes:
- **Car Information**: Displays the car you're reviewing with image and rental dates
- **Rating**: Click on stars to rate (1-5 stars)
- **Comment**: Write your detailed review (required, minimum 10 characters)

### 5. **Submit Your Review**
- Click "Submit Review"
- The review is immediately published
- The car owner receives a notification about your review
- The car's average rating is automatically updated

### 6. **Manage Your Reviews**

#### View Your Reviews
- All submitted reviews appear in the main reviews grid
- Each review card shows:
  - Car image and details
  - Your rating (stars)
  - Your comment
  - Date posted
  - Edit and Delete buttons

#### Edit a Review
1. Click the "Edit" button on any review card
2. Modify the rating or comment
3. Click "Update Review"

#### Delete a Review
1. Click the "Delete" button on any review card
2. Confirm the deletion
3. The review is permanently removed
4. The car's average rating is recalculated

### 7. **Search and Filter**
- **Search**: Type car brand, model, or comment text
- **Filter by Rating**: Select 1-5 stars to filter reviews
- **Pagination**: Navigate through multiple pages if you have many reviews

## Technical Details

### Fixed Issues
✅ Changed `make` to `brand` throughout the codebase to match database schema
✅ Added support for car images from the `images` array
✅ Updated TypeScript types for proper type safety
✅ Fixed car data display in review cards and forms

### API Endpoints Used
- `GET /api/reviews/customer/:customerId` - Get customer's reviews
- `GET /api/rentals/customer` - Get customer's rentals
- `POST /api/reviews` - Create new review
- `PUT /api/reviews/:id` - Update existing review
- `DELETE /api/reviews/:id` - Delete review

### Data Flow
1. Customer completes a rental → Rental status becomes `completed`
2. System fetches all customer rentals
3. Filters rentals: `status === 'completed' && !alreadyReviewed`
4. Displays completed rentals in "Write Reviews" section
5. Customer writes review → Sends to backend
6. Backend creates review, updates car rating, notifies owner
7. Review appears in customer's review list

## Owner Notification
When you submit a review:
- The car owner receives a notification
- Notification includes: car name, your rating, and review comment
- Owner can respond to your review (optional)

## Best Practices
1. **Be Honest**: Provide genuine feedback about your rental experience
2. **Be Specific**: Mention specific aspects (cleanliness, performance, etc.)
3. **Be Constructive**: Help other renters and the car owner
4. **Minimum Length**: Write at least 10 characters for meaningful feedback

## Troubleshooting

### "No completed rentals to review"
- Make sure you have rentals with `completed` status
- Check that you haven't already reviewed those rentals

### "Can't see car image"
- The system uses a fallback placeholder if image is unavailable
- Contact support if images consistently fail to load

### "Review not appearing"
- Check your internet connection
- Refresh the page
- Reviews appear immediately after submission

## Support
If you encounter any issues with the review system, please contact support or check the application logs for error messages.

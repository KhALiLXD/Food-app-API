# FoodApp API — Quick Guide

## Base URL
```
http://localhost:2525
```
---

## Setup
1. Clone the repository.
2. Install dependencies:
```
npm install
```
3. import the `food_delivery.sql` database schema into your MySQL server and update the database configuration in `.env`.
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=food_delivery
```
4. Start the server:
```
pm2 start ecosystem.config.js
```

## Note
- This is an full API server you can test it via Postman or any API client [Test Link](https://app.getpostman.com/join-team?invite_code=0eda020304444e9917584008fc7eaf4680fb1861507cf9621dc1f28d6b8ff57a&target_code=d239c672a22cf012240c154b0d0505df).
- some pages that reqires frontend (like chat and image upload progress) you can test it via simple HTML files in the `public` folder.


## Auth & Sessions
- used `send` & `response` pattern.
- Session cookie (e.g. `connect.sid`) is set after **register** or **login**.

### Register
```http
POST /auth/register
```
Body:
```json
{ "username": "khalil", "email": "user@example.com", "password": "password" }
```

### Login
```http
POST /auth/login
```
Body:
```json
{ "email": "user@example.com", "password": "password" }
```

---

## User Profile
### Get Profile
```http
GET /user/profile
```


### Update Profile
```http
PUT /user/profile
```
Body (example):
```json
{ "username": "Khalil", "phone_number": "+970...", "location": "Gaza, PS" }
```

---

## Orders Tracking
### Create Order
- used `send` & `response` pattern.
```http
POST /user/order/create
```
Body:
```json
{ "name": "Burger", "details": "No onions", "restaurant_id": 1 }
```

### Get Order
- used `send` & `response` pattern.
```http
GET /user/order/{orderId}
```


### Order Status (SSE)
- used Server-Sent Events (SSE) for real-time updates and lightweight communication during the order lifecycle.
- firstly i think about make it with WebSocket but SSE is more suitable for this case specially for mobile data.
```http
GET /user/order/{orderId}/order-status
Accept: text/event-stream
```
Events:
```
data: {"status":"Confirmed"}
data: {"status":"Preparing"}
...
```

---

## Driver Tracking
### Update Driver Location
- used `send` & `response` pattern.
```http
PUT /driver/update-location
```
Body:
```json
{ "driverId": 2, "location": { "lat": "55", "lng": "4", "speed": "122.5", "heading": 270 } }
```

### Stream Driver Location (SSE + PUB/SUB)
- used redis PUB/SUB to manage driver location updates (like send driver location for manager and client in the same time) with SSE connection for real-time tracking.


```http
GET /driver/{driverId}/order-tracking
Accept: text/event-stream
```
Events:
```
data: {"lat":"55","lng":"4","speed":"122.5","heading":270}
```

---

## Support Chat
- used websocket for realtime chatting.
### Customer View
- You can test it via [this simple HTML file](http://localhost:2525/login.html).

### Agent View
- You can test it via [this simple HTML file](http://localhost:2525/login.html).

---

## Notifications (Order notifications + Server-wide Notifications)

### Notification Stream (SSE + PUB/SUB)
- used redis PUB/SUB to broadcast notifications to all connected clients in real-time.
- Also i used Notification worker when select `broadcast` type for making the process more efficient like send notification in batches for all users.

```http
GET /notifications/stream
```
Events:
```
data: {"type":"broadcast","message":"System maintenance at 2 PM"}
data: {"type":"user","message":"Your order #123 is ready"}
```

### Send Notification
- used `send` & `response` pattern.
```http
POST /notifications/broadcast
```
Body:
```json
{ "message": "promo live now", "type": "broadcast" }
```

---

## Restaurant Orders Tracking
### Stream New Orders (SSE + PUB/SUB)
- used redis PUB/SUB to send new orders to restaurant in real-time.
```http
GET /resturant/{restaurant_id}/orders
```
Events:
```
data: {"order_id":456,"name":"Pizza","details":"Extra cheese","status":"Confirmed"}
```

---

## Image Upload
### Upload Image 
- when user upload image, the server responds immediately with an `imageId(jobID)` and starts processing the image in the background.
- In background a worker handles the image processing (validation, resizing, optimization) and stores the image.
- The client can then use the `imageId(jobID)` to subscribe to an SSE endpoint to receive real-time updates on the upload progress and final status.
```http
POST /upload/upload-image
```
Form-data: `image` (jpeg/png/webp/avif, 2–10MB)

### Upload Progress (SSE)
- also u cab test it via [this simple HTML file](http://localhost:2525/sse-image-progress-test.html).
```http
GET /upload/image-upload-progress/{imageId}
```
Events:
```
data: {"progress":10,"state":"queued"}
data: {"progress":100,"state":"done","url":"/uploads/..."}
```
Errors:
```
data: {"state":"error","message":"File too small"}
```

---

## redis Health
```http
GET /health/redis
```
Response:
```json
{ "ok": true }
```
---

## Made with ❤️ by Khalil Alyacoubi

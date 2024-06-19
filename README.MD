# Flight Booking System

This project is a Flight Booking System built with Node.js, Express, MongoDB, and Socket.io. It provides functionality to manage flight bookings with real-time updates and email confirmations with PDF attachments.

## Features

- **CRUD Operations** for managing flight bookings
- **Real-time updates** using Socket.io
- **Email confirmations** with PDF attachments using Nodemailer
- **Dynamic HTML view** using EJS

## Getting Started

1. **Clone the repository**

    ```bash
    git clone https://github.com/amansirohiii/flightbooking.git
    cd flightbooking
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up environment variables**

    Create a `.env.local` file in the root of the project and add the following:

    ```env
   PORT= 3000
   MONGODB_URI=
   EMAILJS_USER_ID=
   EMAILJS_SERVICE_ID=
   EMAILJS_TEMPLATE_ID=
   EMAIL_USER= admin@amansirohi.me
   EMAIL_PASSWORD=
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_SECRET=
   CLOUDINARY_API_KEY=
    ```

4. **Start the server**

    ```bash
    npm start
    ```

    The server will start on the port specified in the `.env.local` file (default is 3000).

## API Endpoints

### Create a Booking

- **URL:** `/bookings`
- **Method:** POST
- **Request Body:**

    ```json
    {
        "flightNumber": "ABC123",
        "passengerName": "Aman Sirohi",
        "departureDate": "2024-06-16T00:00:00.000Z",
        "seatNumber": "12A",
        "email": "amansirohi077@gmail.com" *Optional & Default is amansirohi077@gmail.com*
    }
    ```
### Get All Bookings

- **URL:** `/bookings`
- **Method:** GET

### Update a Booking

- **URL:** `/bookings/:id`
- **Method:** PUT
- **Request Body:**

    ```json
    {
        "flightNumber": "DEF456",
        "passengerName": "Jane Doe",
        "departureDate": "2024-06-18T00:00:00.000Z",
        "seatNumber": "14B",
        "email": "amansirohi077@gmail.com"
    }
    ```

### Delete a Booking

- **URL:** `/bookings/:id`
- **Method:** DELETE

## Real-Time Updates

Clients connected to the server via Socket.io will receive real-time updates when a booking is created, updated, or deleted.

### Events

- **bookingCreated:** Sent when a new booking is created
- **bookingUpdated:** Sent when a booking is updated
- **bookingDeleted:** Sent when a booking is deleted

## Frontend

The frontend is served at the `/bookings` endpoint. It displays the list of bookings and updates in real-time using Socket.io.

### Access the frontend

Navigate to [http://localhost:3000/bookings](http://localhost:3000/bookings) in your browser to view the flight bookings and see real-time updates.

## Folder Structure

```bash
.
├── bookings             # Directory where PDF files are saved
├── db
│   └── connection.js    # MongoDB connection setup
├── views
│   └── bookings.ejs     # EJS template for the frontend
│   └── edit.ejs
│   └── index.ejs
│   └── new.ejs
├── .env                 # Environment variables
├── package.json         # Project metadata and dependencies
├── index.js            # Main server file

```
## Acknowledgements

- Express
- Mongoose
- Socket.io
- Nodemailer
- PDFKit
- EJS




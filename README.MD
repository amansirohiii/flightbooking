# Flight Booking System

This project is a Flight Booking System built with Node.js, Express, MongoDB, and Socket.io. It provides functionality to manage flight bookings with real-time updates and email confirmations with PDF attachments.

## Features

- **CRUD Operations** for managing flight bookings
- **Real-time updates** using Socket.io
- **Email confirmations** with PDF attachments using Nodemailer
- **Dynamic HTML view** using EJS

## Prerequisites

- Node.js and npm installed
- MongoDB instance running
- Gmail account for sending emails

## Getting Started

1. **Clone the repository**

    ```bash
    git clone https://github.com/amansirohiii/flightbooking.git
    cd flight-booking-system
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up environment variables**

    Create a `.env` file in the root of the project and add the following:

    ```env
    PORT=3000
    MONGO_URI=your_mongodb_connection_string
    EMAIL_USER=your_gmail_email
    EMAIL_PASS=your_gmail_password
    ```

4. **Start the server**

    ```bash
    npm start
    ```

    The server will start on the port specified in the `.env` file (default is 3000).

## API Endpoints

### Create a Booking

- **URL:** `/bookings`
- **Method:** POST
- **Request Body:**

    ```json
    {
        "flightNumber": "ABC123",
        "passengerName": "John Doe",
        "departureDate": "2024-06-16T00:00:00.000Z",
        "seatNumber": "12A"
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
        "seatNumber": "14B"
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
├── .env                 # Environment variables
├── package.json         # Project metadata and dependencies
├── server.js            # Main server file

```
## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements

- Express
- Mongoose
- Socket.io
- Nodemailer
- PDFKit
- EJS

## Troubleshooting

### MongoDB Connection Issues

- Ensure that your MongoDB instance is running and accessible.
- Verify the `MONGO_URI` in your `.env` file is correct.

### Email Sending Issues

- Ensure that less secure apps access is enabled for your Gmail account (for testing purposes only).
- Verify the `EMAIL_USER` and `EMAIL_PASS` in your `.env` file are correct.
- Check the transporter configuration in the `server.js` file.

### Real-Time Updates Not Working

- Ensure that the Socket.io client is correctly connected to the server.
- Check the server logs for any errors related to Socket.io connections.

### PDF Generation Issues

- Ensure the `bookings` directory exists in the root of your project.
- Check the permissions of the `bookings` directory to ensure the server can write files to it.

## Contributions

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.
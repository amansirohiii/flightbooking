import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import http from 'http';
import { Server as socketIo } from 'socket.io';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import ejs from 'ejs';
import connectDB from './db/connection.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration for handling file storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// MongoDB connection
connectDB();

// MongoDB Schema and Model
const bookingSchema = new mongoose.Schema({
    flightNumber: String,
    passengerName: String,
    departureDate: Date,
    seatNumber: String,
    pdfUrl: String,
    email: { type: String, default: 'amansirohi077@gmail.com' },
});


const Booking = mongoose.model('Booking', bookingSchema);

const createPDF = (booking, pdfPath) => {
    return new Promise((resolve, reject) => {
        const pdfDoc = new PDFDocument();
        const writeStream = fs.createWriteStream(pdfPath);
        pdfDoc.pipe(writeStream);

        pdfDoc.text(`Booking Details:\nEmail Address: ${booking.email}\nFlight Number: ${booking.flightNumber}\nPassenger Name: ${booking.passengerName}\nDeparture Date: ${booking.departureDate}\nSeat Number: ${booking.seatNumber}`);
        pdfDoc.end();

        writeStream.on('finish', () => resolve(pdfPath));
        writeStream.on('error', reject);
    });
};

app.get("/", (req, res) => {
    res.render('index');
}
);
// CRUD Operations
app.post('/bookings', async (req, res) => {
    try {
        const bookingData = req.body;
        if (!bookingData.email) {
            bookingData.email = 'amansirohi077@gmail.com';
        }
        const booking = new Booking(req.body);
        await booking.save();

        // Notify via Socket.io
        io.emit('bookingCreated', booking);

        // Generate PDF and store it temporarily
        const tempPdfPath = path.join(__dirname, `${booking._id}.pdf`);
        await createPDF(booking, tempPdfPath);

        // Upload PDF to Cloudinary
        cloudinary.uploader.upload(tempPdfPath, { folder: 'bookings', public_id: booking._id.toString(), resource_type: 'raw' }, async (error, result) => {
            if (error) {
                throw error;
            }

            // Save the Cloudinary URL in the database
            booking.pdfUrl = result.secure_url;
            await booking.save();

            // Send email
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: booking.email,
                subject: 'Booking Confirmation',
                text: `Your booking details are attached.\n\nYou can also access your booking details here: ${booking.pdfUrl}`,
                attachments: [
                    {
                        filename: `${booking._id}.pdf`,
                        path: tempPdfPath
                    }
                ]
            };

            await transporter.sendMail(mailOptions);

            // Delete the temporary file
            fs.unlinkSync(tempPdfPath);

            res.status(201).send(booking);
        });
    } catch (error) {
        console.error('Error creating booking', error);
        res.status(400).send(error);
    }
});

app.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.render('bookings', { bookings });
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/bookings/:id/edit', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).send('Booking not found');
        }
        res.render('edit', { booking });
    } catch (error) {
        res.status(500).send(error);
    }
});

app.put('/bookings/:id', async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!booking) {
            return res.status(404).send();
        }

        // Notify via Socket.io
        io.emit('bookingUpdated', booking);

        // Send email
        const tempPdfPath = path.join(__dirname, `${booking._id}.pdf`);
        await createPDF(booking, tempPdfPath);

        cloudinary.uploader.upload(tempPdfPath, { folder: 'bookings', public_id: booking._id.toString(), resource_type: 'raw' }, async (error, result) => {
            if (error) {
                throw error;
            }

            booking.pdfUrl = result.secure_url;
            await booking.save();

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: booking.email,
                subject: 'Booking Update',
                text: `Your booking details have been updated.\n\nYou can access your updated booking details here: ${booking.pdfUrl}`,
                attachments: [
                    {
                        filename: `${booking._id}.pdf`,
                        path: tempPdfPath
                    }
                ]
            };

            await transporter.sendMail(mailOptions);
            fs.unlinkSync(tempPdfPath);
            res.redirect('/bookings');
            // res.send(booking);
        });
    } catch (error) {
        res.status(400).send(error);
    }
});

app.delete('/bookings/:id', async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).send();
        }

        // Notify via Socket.io
        io.emit('bookingDeleted', booking);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: booking.email,
            subject: 'Booking Cancellation',
            text: `Your booking has been canceled.`
        };

        await transporter.sendMail(mailOptions);

        res.redirect('/bookings');
        } catch (error) {
        res.status(500).send(error);
    }
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

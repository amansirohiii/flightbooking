import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import http from 'http';
import { Server as socketIo } from 'socket.io';
import nodemailer from 'nodemailer';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';
import path from 'path';
import connectDB from './db/connection.js';
import Booking from './models/Booking.model.js'
import { createPDF } from "./utils/pdf.js";
import dotenv from 'dotenv';

dotenv.config({ path: `.env.local`, override: true });

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


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
connectDB();


app.get("/", (req, res) => {
    res.render('index');
});

// CRUD Operations
app.post('/bookings', async (req, res) => {
    try {
        const bookingData = req.body;
        if (!bookingData.email) {
            bookingData.email = 'amansirohi077@gmail.com';
        }
        const booking = new Booking(bookingData);
        await booking.save();

        // Notify via Socket.io
        io.emit('bookingCreated', booking);

        // Generate PDF in memory
        const pdfBuffer = await createPDF(booking);

        // Upload PDF to Cloudinary
        cloudinary.uploader.upload_stream({ folder: 'bookings', public_id: booking._id.toString(), resource_type: 'raw' }, async (error, result) => {
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
                text: `Your booking details are attached.\n\nThank you for choosing us.`,
                attachments: [
                    {
                        filename: `${booking._id}.pdf`,
                        content: pdfBuffer
                    }
                ]
            };

            await transporter.sendMail(mailOptions);

            res.status(201).redirect("/bookings");
        }).end(pdfBuffer);
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

app.get('/bookings/new', (req, res) => {
    res.render('new');
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

        // Generate PDF in memory
        const pdfBuffer = await createPDF(booking);

        cloudinary.uploader.upload_stream({ folder: 'bookings', public_id: booking._id.toString(), resource_type: 'raw' }, async (error, result) => {
            if (error) {
                throw error;
            }

            booking.pdfUrl = result.secure_url;
            await booking.save();

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: booking.email,
                subject: 'Booking Update',
                text: `Your booking details have been updated.\n\nThank you for choosing us.`,
                attachments: [
                    {
                        filename: `${booking._id}.pdf`,
                        content: pdfBuffer
                    }
                ]
            };

            await transporter.sendMail(mailOptions);
            res.redirect('/bookings');
        }).end(pdfBuffer);
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

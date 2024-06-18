import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  flightNumber: String,
  passengerName: String,
  departureDate: Date,
  seatNumber: String,
  pdfUrl: String,
  email: { type: String, default: 'amansirohi077@gmail.com' },
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;

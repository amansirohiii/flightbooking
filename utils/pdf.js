import { PassThrough } from 'stream';
import PDFDocument from 'pdfkit';

export const createPDF = (booking) => {
  return new Promise((resolve, reject) => {
      const pdfDoc = new PDFDocument();
      const passThrough = new PassThrough();

      const chunks = [];
      passThrough.on('data', chunk => chunks.push(chunk));
      passThrough.on('end', () => resolve(Buffer.concat(chunks)));
      passThrough.on('error', reject);

      pdfDoc.pipe(passThrough);

      pdfDoc.text(`Booking Details:\nEmail Address: ${booking.email}\nFlight Number: ${booking.flightNumber}\nPassenger Name: ${booking.passengerName}\nDeparture Date: ${booking.departureDate}\nSeat Number: ${booking.seatNumber}`);
      pdfDoc.end();
  });
};
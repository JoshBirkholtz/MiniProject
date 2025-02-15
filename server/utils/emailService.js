const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD // Use Gmail App Password
    }
});

class EmailService {
    static async sendRSVPConfirmation(userEmail, eventName, eventDetails) {
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: `RSVP Confirmation - ${eventName}`,
                html: `
                    <h1>RSVP Confirmation</h1>
                    <p>Thank you for RSVPing to ${eventName}!</p>
                    <h2>Event Details:</h2>
                    <p>Date: ${eventDetails.date}</p>
                    <p>Time: ${eventDetails.time}</p>
                    <p>Location: ${eventDetails.location}</p>
                `
            });
        } catch (error) {
            console.error('Email Error:', error);
            throw error;
        }
    }

    static async sendEventReminder(userEmail, eventName, eventDetails) {
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: `Reminder: ${eventName} is Tomorrow!`,
                html: `
                    <h1>Event Reminder</h1>
                    <p>Don't forget about ${eventName} tomorrow!</p>
                    <h2>Event Details:</h2>
                    <p>Time: ${eventDetails.time}</p>
                    <p>Location: ${eventDetails.location}</p>
                `
            });
        } catch (error) {
            console.error('Email Error:', error);
            throw error;
        }
    }
}

module.exports = EmailService;
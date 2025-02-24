const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

class EmailService {
    /**
     * Sends an email confirmation to a user after they RSVP to an event
     * Includes event name, date, time, and location details
     */
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

    /**
     * Sends a reminder email to users the day before their RSVP'd event
     * Includes event name, time, and location details
     */
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
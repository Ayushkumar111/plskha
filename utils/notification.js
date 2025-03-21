//twillo wagera ke  acc bna ke auth token wagera env me dalna uske bad kam karega 


const nodemailer = require('nodemailer');
const twilio = require('twilio');

exports.sendEmail = async (to, subject, text) => {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Send mail
    await transporter.sendMail({
      from: `MediSync <${process.env.EMAIL_USERNAME}>`,
      to,
      subject,
      text
    });

    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

exports.sendSMS = async (to, body) => {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });

    return true;
  } catch (error) {
    console.error('SMS sending failed:', error);
    return false;
  }
};
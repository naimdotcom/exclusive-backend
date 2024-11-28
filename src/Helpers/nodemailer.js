const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.HOST_MAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const emailTemplate = (firstName, Otp) => {
  return `
   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4CAF50; text-align: center;">OTP Verification</h2>
        <p style="font-size: 16px; color: #333;">Hi,</p>
        <p style="font-size: 16px; color: #333;">Your OTP code for verification is:</p>
        <h1 style="text-align: center; color: #4CAF50; font-size: 36px; margin: 20px 0;">${Otp}</h1>
        <p style="font-size: 14px; color: #555;">This OTP is valid for the next 10 minutes. Please do not share it with anyone.</p>
        <p style="font-size: 14px; color: #555;">If you didn’t request this, please ignore this email.</p>
        <p style="font-size: 16px; color: #333;">Thank you,</p>
        <p style="font-size: 16px; color: #333;"><strong>${firstName}</strong></p>
        <footer style="margin-top: 20px; font-size: 12px; color: #666; text-align: center;">
          <p>You are receiving this email because a verification request was made with your email address.</p>
        </footer>
      </div>
  `;
};

const SendMail = async (firstName, Otp, email) => {
  console.log(firstName, Otp, email);

  try {
    const info = await transporter.sendMail({
      from: process.env.HOST_MAIL,
      to: email,
      subject: "Verification Email  ✔",
      html: emailTemplate(firstName, Otp),
    });

    return info.messageId;
  } catch (error) {
    console.log(`error from sending mail: ${error}`);
  }
};

module.exports = { SendMail };

import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// ✅ Debug — confirm env vars are loading
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("PASS SET:", !!process.env.EMAIL_APP_PASSWORD);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,          // ✅ no quotes
    pass: process.env.EMAIL_APP_PASSWORD,  // ✅ no quotes
  },
});

const sendOTPEmail = async (toEmail, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"Nazir Sons" <${process.env.EMAIL_USER}>`,  // ✅ no quotes
      to: toEmail,                                        // ✅ dynamic recipient
      subject: "Your Email Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; 
                    padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #111827;">Verify your email</h2>
          <p style="color: #6b7280;">Your verification code is:</p>
          <div style="font-size: 40px; font-weight: bold; letter-spacing: 12px; 
                      color: #4f46e5; padding: 16px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280;">Expires in <strong>10 minutes</strong>.</p>
          <p style="color: #9ca3af; font-size: 12px;">
            If you didn't request this, ignore this email.
          </p>
        </div>
      `,
    });
    console.log("Email sent ✅:", info.messageId);
  } catch (err) {
    console.error("sendOTPEmail failed ❌:", err.message);
    throw err;
  }
};

export { sendOTPEmail };
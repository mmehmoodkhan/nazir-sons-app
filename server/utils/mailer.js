import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("PASS SET:", !!process.env.EMAIL_APP_PASSWORD);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,          
    pass: process.env.EMAIL_APP_PASSWORD, 
  },
});

const sendOTPEmail = async (toEmail, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"Nazir Sons" <${process.env.EMAIL_USER}>`,  
      to: toEmail,                                       
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
          <p style="color: #6b7280;">Expires in <strong>5 minutes</strong>.</p>
          <p style="color: #9ca3af; font-size: 12px;">
            If you didn't request this, ignore this email.
          </p>
        </div>
      `,
    });
    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("sendOTPEmail failed:", err.message);
    throw err;
  }
};

const sendContactEmail = async (payload) => {
  const { name, phone, email, message } = payload || {};
  const to = process.env.CONTACT_RECEIVER || process.env.EMAIL_USER || "mehmoodkhan6060@gmail.com";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: auto; padding: 24px;">
      <h2>New contact form message</h2>
      <p><strong>Name:</strong> ${name || "-"}</p>
      <p><strong>Phone:</strong> ${phone || "-"}</p>
      <p><strong>Email:</strong> ${email || "-"}</p>
      <p><strong>Message:</strong></p>
      <div style="border-left:4px solid #e5e7eb;padding:12px;margin-top:8px;color:#111;">${(message || "-").replace(/\n/g, "<br/>")}</div>
      <hr/>
      <p style="color:#6b7280;font-size:12px">This message was sent from the website contact form.</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Website Contact" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Contact form: ${name || "New message"}`,
      html,
    });
    console.log("Contact email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("sendContactEmail failed:", err && err.message ? err.message : err);
    throw err;
  }
};

const sendPasswordResetEmail = async (toEmail, resetLink) => {
  try {
    const info = await transporter.sendMail({
      from: `"Nazir Sons" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Password reset instructions",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #111827;">Reset your password</h2>
          <p style="color: #6b7280;">Click the button below to choose a new password for your account.</p>
          <a href="${resetLink}" style="display: inline-block; margin: 18px 0; padding: 12px 24px; background: #25d366; color: white; text-decoration: none; border-radius: 8px;">Reset Password</a>
          <p style="color: #6b7280;">If the button does not work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #334155;">${resetLink}</p>
          <p style="color: #9ca3af; font-size: 12px;">If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log("Password reset email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("sendPasswordResetEmail failed:", err.message);
    throw err;
  }
};

export { sendOTPEmail, sendContactEmail, sendPasswordResetEmail };
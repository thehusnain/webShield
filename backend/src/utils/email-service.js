import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASSWORD;

if (!emailUser || !emailPass) {
  console.error("Email credentials missing! Check .env file");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});
transporter.verify(function (error, success) {
  if (error) {
    console.log("Email transporter error:", error);
  } else {
    console.log("Email transporter is ready");
  }
});

export async function sendResetPassEmail(email, resetToken) {
  try {
    console.log(`Attempting to send reset email to: ${email}`);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    console.log("Reset link:", resetLink);

    const mailOptions = {
      from: `"WebShield Security" <${emailUser}>`,
      to: email,
      subject: "Reset your WebShield Password",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Password Reset Request</h2>
                    
                    <p>Hello,</p>
                    
                    <p>We received a request to reset your password for your <strong>WebShield Security Scanner</strong> account.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" 
                           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; font-weight: bold;">
                            🔐 Reset Password
                        </a>
                    </div>
                    
                    <p>Or copy this link:</p>
                    <p style="background-color: #f1f5f9; padding: 10px; border-radius: 5px; 
                              word-break: break-all;">
                        ${resetLink}
                    </p>
                    
                    <p><strong>This link will expire in 1 hour.</strong></p>
                    
                    <hr style="border: 1px solid #e2e8f0; margin: 20px 0;">
                    
                    <p style="color: #64748b; font-size: 14px;">
                        If you didn't request this password reset, please ignore this email.<br>
                        Your password will not be changed.
                    </p>
                    
                    <p style="color: #64748b; font-size: 14px;">
                        <strong>WebShield Security Scanner</strong><br>
                        Your Website Security Partner
                    </p>
                </div>
            `,
    };

    console.log("Sending email...");
    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to: ${email}`);
    console.log(`Email ID: ${info.messageId}`);

    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    console.error("Full error:", error);
    return false;
  }
}

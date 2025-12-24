import nodemailer from "nodemailer";

/**
 * Send an email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content (optional)
 * @returns {Promise<Object>} - Nodemailer send result
 */
const sendEmail = async ({ to, subject, text, html }) => {
  console.log("[SENDMAIL] Initiating email send:", {
    to,
    subject: subject.substring(0, 50),
    timestamp: new Date().toISOString(),
  });

  // Validate email configuration
  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const emailPort = parseInt(process.env.EMAIL_PORT) || 587;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailSecure = process.env.EMAIL_SECURE === "true";

  console.log("[SENDMAIL] Email config check:", {
    host: emailHost,
    port: emailPort,
    secure: emailSecure,
    userConfigured: !!emailUser,
    passwordConfigured: !!emailPass,
  });

  if (!emailUser || !emailPass) {
    console.error("[SENDMAIL] Missing email credentials:", {
      EMAIL_USER: emailUser ? "SET" : "MISSING",
      EMAIL_PASS: emailPass ? "SET" : "MISSING",
    });
    throw new Error(
      "Email configuration incomplete. Missing EMAIL_USER or EMAIL_PASS."
    );
  }

  // Create transporter using environment variables
  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailSecure,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_FROM || `"MiRide" <${emailUser}>`,
    to,
    subject,
    text,
    html: html || text,
  };

  console.log("[SENDMAIL] Mail options prepared:", {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject.substring(0, 50),
  });

  try {
    console.log("[SENDMAIL] Attempting to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("[SENDMAIL] Email sent successfully:", {
      messageId: info.messageId,
      response: info.response,
      timestamp: new Date().toISOString(),
    });
    return info;
  } catch (error) {
    console.error("[SENDMAIL] Error sending email:", {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command,
      timestamp: new Date().toISOString(),
      stack: error.stack,
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name for personalization
 * @returns {Promise<Object>} - Nodemailer send result
 */
export const sendPasswordResetEmail = async (
  email,
  resetToken,
  userName = "User"
) => {
  console.log("[PASSWORD_RESET_EMAIL] Starting password reset email process:", {
    email,
    userName,
    tokenLength: resetToken.length,
    timestamp: new Date().toISOString(),
  });

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  console.log("[PASSWORD_RESET_EMAIL] Reset URL generated:", {
    clientUrl,
    resetUrlLength: resetUrl.length,
  });

  const subject = "Password Reset Request - MiRide";

  const text = `
Hello ${userName},

You requested to reset your password for your MiRide account.

Please click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you did not request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
The MiRide Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset - MiRide</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: #166534; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">MiRide</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Password Reset Request</h2>
              <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">
                Hello <strong>${userName}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">
                You requested to reset your password for your MiRide account. Click the button below to set a new password:
              </p>
              
              <!-- Button -->
              <table role="presentation" style="margin: 30px 0; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background-color: #166534; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 10px; color: #666666; font-size: 14px; line-height: 1.5;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 20px; color: #166534; font-size: 14px; word-break: break-all;">
                <a href="${resetUrl}" style="color: #166534;">${resetUrl}</a>
              </p>
              
              <div style="margin-top: 30px; padding: 20px; background-color: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  <strong>⏰ This link will expire in 1 hour.</strong>
                </p>
              </div>
              
              <p style="margin: 30px 0 0; color: #999999; font-size: 14px; line-height: 1.5;">
                If you did not request a password reset, please ignore this email or contact support if you have concerns.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} MiRide. All rights reserved.
              </p>
              <p style="margin: 10px 0 0; color: #999999; font-size: 12px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  console.log("[PASSWORD_RESET_EMAIL] About to call sendEmail function");
  try {
    const result = await sendEmail({ to: email, subject, text, html });
    console.log(
      "[PASSWORD_RESET_EMAIL] Password reset email sent successfully"
    );
    return result;
  } catch (error) {
    console.error(
      "[PASSWORD_RESET_EMAIL] Failed to send password reset email:",
      {
        email,
        error: error.message,
        timestamp: new Date().toISOString(),
      }
    );
    throw error;
  }
};

export default sendEmail;

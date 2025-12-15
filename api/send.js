import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { recipientEmail, otp } = req.body;

  if (!recipientEmail || !otp) {
    return res.status(400).json({ error: "Missing recipientEmail or otp" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:40px 0;">
              <table width="500" style="background:#ffffff; border-radius:8px; padding:30px;">
                <tr>
                  <td align="center" style="font-size:22px; font-weight:bold;">
                    OTP Verification
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 0; text-align:center; font-size:14px;">
                    Your OTP is valid for <b>5 minutes</b>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <div style="font-size:28px; font-weight:bold; color:#2563eb;">
                      ${otp}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:20px; text-align:center; font-size:12px; color:#777;">
                    If you did not request this, ignore this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Your App" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: "Your OTP Code",
      html: htmlTemplate,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Mail error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}

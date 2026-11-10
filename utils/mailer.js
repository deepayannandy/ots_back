const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;

  const port = Number(process.env.SMTP_PORT || 587);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendMail({ to, subject, text, html }) {
  const t = getTransporter();
  if (!t) throw new Error("SMTP is not configured (set SMTP_HOST in .env)");
  return t.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

async function sendGuestCredentials({ fullName, email, password, validTill }) {
  const loginUrl = process.env.DASHBOARD_URL ? `${process.env.DASHBOARD_URL}/auth/login` : "";
  const expiry = new Date(validTill).toUTCString();

  const text = [
    `Hello ${fullName},`,
    "",
    "A guest account has been created for you on the OTS Dashboard.",
    "",
    `Email: ${email}`,
    `Password: ${password}`,
    `Valid till: ${expiry}`,
    ...(loginUrl ? [`Login: ${loginUrl}`] : []),
    "",
    "After the validity period ends your account will be locked. Contact your administrator to unlock it.",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
      <p>Hello ${escapeHtml(fullName)},</p>
      <p>A guest account has been created for you on the OTS Dashboard.</p>
      <table cellpadding="6" style="border-collapse:collapse;border:1px solid #ddd">
        <tr><td><b>Email</b></td><td>${escapeHtml(email)}</td></tr>
        <tr><td><b>Password</b></td><td><code>${escapeHtml(password)}</code></td></tr>
        <tr><td><b>Valid till</b></td><td>${escapeHtml(expiry)}</td></tr>
      </table>
      ${loginUrl ? `<p><a href="${escapeHtml(loginUrl)}">Login to the dashboard</a></p>` : ""}
      <p style="color:#666">After the validity period ends your account will be locked.
      Contact your administrator to unlock it.</p>
    </div>`;

  return sendMail({ to: email, subject: "Your OTS Dashboard guest account", text, html });
}

module.exports = { sendMail, sendGuestCredentials };

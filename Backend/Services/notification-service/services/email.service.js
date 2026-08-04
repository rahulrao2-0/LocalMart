const sendEmail = async (toEmail, subject, htmlContent) => {
  try {
    const apiKey = (process.env.BREVO_API_KEY || "").trim();
    const senderEmail = (process.env.BREVO_SENDER_EMAIL || "noreply@localmart.com").trim();

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "LocalMart",
          email: senderEmail,
        },
        to: [{ email: toEmail }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Brevo Error:", data);
      throw new Error("Email sending failed");
    }

    console.log("✅ Email sent successfully");
    return data;

  } catch (err) {
    console.error("❌ Email error:", err.message);
    throw err;
  }
};

export default { sendEmail };

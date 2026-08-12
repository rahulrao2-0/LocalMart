const sendEmail = async ({ to, subject, html }) => {
  try {
    const apiKey = (process.env.BREVO_API_KEY || "").trim();
    const senderEmail = (process.env.BREVO_SENDER_EMAIL || "").trim();

    console.log(`\n📨 [EMAIL SERVICE] Attempting to send email to: ${to}`);
    console.log(`📧 [EMAIL SERVICE] Sender Email Configured: ${senderEmail || 'MISSING!'}`);
    console.log(`🔑 [EMAIL SERVICE] API Key Length: ${apiKey.length > 0 ? apiKey.length : 'MISSING!'}`);

    if (!apiKey || !senderEmail) {
       console.error("❌ [EMAIL SERVICE] Missing Brevo configuration in .env!");
       return;
    }

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
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ [EMAIL SERVICE] Brevo API Error [${response.status}]:`, JSON.stringify(data, null, 2));
      throw new Error(`Email sending failed with status ${response.status}`);
    }

    console.log(`✅ [EMAIL SERVICE] Email successfully delivered via Brevo to ${to}`);
    console.log(`📝 [EMAIL SERVICE] Brevo MessageId: ${data.messageId}`);

  } catch (err) {
    console.error(`❌ [EMAIL SERVICE] Critical Error sending email to ${to}:`, err.message);
  }
};

export default sendEmail;
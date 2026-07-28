const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "LocalMart",
          email: process.env.BREVO_SENDER_EMAIL, // must be verified in Brevo
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Brevo Error:", data);
      throw new Error("Email sending failed");
    }

    console.log("✅ Email sent successfully");
    console.log("Response:", data);

  } catch (err) {
    console.error("❌ Email error:", err.message);
  }
};

export default sendEmail;
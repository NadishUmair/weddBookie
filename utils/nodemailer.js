const nodemailer = require("nodemailer");


const SendEmail = async (res, EmailAddress,template) => {

  try {
    const Transporter = nodemailer.createTransport({
      service: "Gmail",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // <== ignore self-signed certificate errors
      },
    });

    const MailOptions = {
      from: process.env.SMTP_EMAIL,
      to: EmailAddress,
      subject: template.subject,
      html:`
     <html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #ffffff;
    }
    table {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      border-spacing: 0;
      background-color: #ffffff;
      border: 1px solid #eaeaea;
      border-radius: 10px;
    }
    .container {
      padding: 40px;
    }
    .header {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      color: #007c26;
      padding-bottom: 20px;
    }
    .content {
      font-size: 16px;
      line-height: 1.6;
      color: #333333;
      text-align: justify;
      max-width: 520px;
      margin: 0 auto;
    }
 
    .footer {
      font-size: 12px;
      text-align: center;
      color: #666666;
      margin-top: 40px;
    }
    .cta {
      background-color: #007c26;
      color: #fff;
      padding: 12px 24px;
      text-align: center;
      display: inline-block;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 30px auto 0;
    }
    .logo {
      text-align: center;
      padding: 20px;
    }
    .logo img {
      max-width: 150px;
      height: auto;
    }
    .weblink {
      color: #014f1b;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <table>
    <tr>
      <td>
        <div class="logo">
          <img src="/uploads/logo.png" alt="WedBookie Logo" />
        </div>
        <div class="container">
          <div class="content">
            <p>${template.message}</p>
            
            <p>We’re happy to have you with us. Feel free to explore and enjoy the features we’ve built just for you.</p>
         
          </div>
          <div class="footer">
            <p>WED BOOKIE (Pvt) Ltd</p>
            <a href="https://www.WedBookie.com/" class="weblink">WedBookie.com</a>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`

    
    };

    await Transporter.sendMail(MailOptions);
    return { success: true };
  } catch (error) {
    console.log("error",error);
    return res.status(500).json({message:"Email Sending failed",error}) 
  }
};

module.exports = SendEmail;

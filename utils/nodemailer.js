const nodemailer = require("nodemailer");


const SendEmail = async (res, EmailAddress, request, userName = "User",otp='') => {
  // console.log("request",res)
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
      subject: request.subject,
      html: `
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              margin: 0;
              padding: 0;
            }
            table {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              border-spacing: 0;
            }
              .main {
               background-color: #f4f4f4;
               border-radius: 10px;
              }
            .container {
              padding: 40px;
              
            }
            .header {
              font-size: 24px;
              font-weight: bold;
              text-align: center;
              padding-bottom: 20px;
              color: #333;
            }
           .content {
          font-size: 16px;
          line-height: 1.6; /* Increased line-height for better readability */
          color: #555;
          padding-bottom: 30px;
          text-align: justify; /* This property balances the text */
          max-width: 520px; /* Limit the width of the content */
          margin: 0 auto; /* Center the content */
        }
            .footer {
              font-size: 12px;
              text-align: center;
              color: #888;
            }
                .otp{
      color: red;
      text-align: center;
    }
          
            .cta {
              background-color: #3498db;
              color: #fff;
              padding: 10px 20px;
              text-align: center;
              display: block;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
            .logo {
              text-align: center;
              margin-bottom: 20px;
              background-color: black;
              padding: 10px;
              border-radius: 10px;
            }
            .logo img {
              max-width: 150px;
              height: auto;
            }
              .weblink {
                color: red;
                text-decoration: underline;
              }
          </style>
        </head>
        <body>
          <table>
            <tr>
              <td class="main">
                <div class="logo">
                  <img src="" alt="weddBookie Logo"/>
                </div>
                <div class="container">
                <div class="header">
                  Dear, ${userName}
                </div>
                <div class="content">
                  <p>${request?.message}</p>
                  <h1 class="otp">${otp}</h1>
                  <p>We hope you enjoy using our service!</p>
                </div>
                <div class="footer">
                  
                  <p>OBO MAX (Pvt) Ltd</p>
                
                  <p>This message was emailed to ${userName} by weddBookie because you created an weddBookie account.</p>
                   <a href="https://www.weddBookie.com/" class="weblink">weddBookie.com</a>
                  </div>
                 </div>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    await Transporter.sendMail(MailOptions);
    return { success: true };
  } catch (error) {
    console.log("error",error);
    return res.status(500).json({message:"Email Sending failed",error}) 
  }
};

module.exports = SendEmail;

// welcome tempolate
exports.welcomeEmailTemplate = (firstName) => {
  return {
    subject: "Welcome to Wed Bookie!",
    message: `Hi ${firstName}!
  
  Welcome to Wed Bookie! 🎉 We're excited to have you on board.
  
  To get started, we've sent you a One-Time Password (OTP) to verify your account.
  
  Please enter this OTP in the app to complete your sign-up process.
  
  You can now log in and start exploring all the awesome features we offer. If you ever have any questions or need help, our support team is just an email away.
  
  Thanks for joining us!
  
  Cheers,  
  The Wed Bookie Team`,
  };
};

// signup otp template
exports.signupOtpTemplate = (first_name, otp) => {
  return {
    subject: "Welcome to Wed Bookie!",
    message: `Hi ${first_name}!
  
  Welcome to Wed Bookie! 🎉 We're excited to have you on board.
  
  To get started, here is your One-Time Password (OTP) to verify your account:
  
 <h1 style="color: #007c26; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
  ${otp}
</h1>

  
  Please enter this OTP in the app to complete your sign-up process.
  
  You can now log in and start exploring all the awesome features we offer. If you ever have any questions or need help, our support team is just an email away.
  
  Thanks for joining us!
  
  Cheers,  
  The Wed Bookie Team`,
  };
};

//   for get password tempalte
exports.forgetPasswordTempalate = (first_name, otp) => {
  return {
    subject: `forget passsword`,
    message: `Hi ${first_name},
    
    Please enter this OTP in the application to proceed. Remember, this OTP is valid for a limited time only. 
      <h1 style="color: #007c26; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
  ${otp}
</h1>                   
    
    If you did not request this OTP, please disregard this email or contact our support team for assistance.
    Cheers,  
    The Wed Bookie Team`,
  };
};

//   reset password email template
exports.resetPasswordTemplate = (first_name) => {
  return {
    subject: `passsword changed`,
    message: `Hi ${first_name},
    
   Hi there,
    
    We wanted to let you know that your password was successfully updated. If you made this change, no further action is needed.
    
    If you didn’t update your password, please contact our support team immediately so we can secure your account.
    
    Stay safe!
    
    Cheers,  
    The Wed Bookie Team`,
  };
};

// Update Password Template
exports.updatePasswordTemplate = (first_name) => {
  return {
    subject: `passsword changed`,
    message: `Hi ${first_name},
          
          We wanted to let you know that your password was successfully updated. If you made this change, no further action is needed.
          
          If you didn’t update your password, please contact our support team immediately so we can secure your account.
          
          Stay safe!
          
          Cheers,  
          The Wed Bookie Team`,
  };
};

//booking tempalate for host
exports.hostBookingTemplates = (firstName, serviceName, bookingTime) => {
  return {
    subject: `Your ${serviceName} Booking is Confirmed! 🎉`,
    message: `Hi ${firstName},
  
  Thank you for booking the ${serviceName} with Wed Bookie!
  
       <p>
          <strong>Booking Time:</strong>
          <span style="background-color: #d4edda; color: #155724; padding: 5px 10px; border-radius: 4px; display: inline-block;">
            ${bookingTime}
          </span>
        </p>
  
  We’re thrilled to be part of your special occasion. You can view all your bookings anytime in your dashboard.
  
  If you have any questions or need assistance, feel free to reach out to our support team.
  
  We look forward to helping make your event amazing!
  
  Cheers,  
  The Wed Bookie Team`,
  };
};

// booking template for vendor
exports.vendorBookingTemplates = (
  vendorName,
  venueName,
  bookingTime,
  hostName
) => {
  return {
    subject: `New Booking Request for ${venueName}!`,
    message: `Hi ${vendorName},
  
  You have received a new booking request for your venue, ${venueName}, from ${hostName}.
  
    <p>
          <strong>Booking Time:</strong>
          <span style="background-color: #d4edda; color: #155724; padding: 5px 10px; border-radius: 4px; display: inline-block;">
            ${bookingTime}
          </span>
        </p>
  
  If you have any questions or need assistance, feel free to reach out to our support team.
  
  We look forward to making this event successful!
  
  Cheers,  
  The Wed Bookie Team`,
  };
};

// Booking cancellation template for host
exports.hostBookingCancelTemplate = ({
  hostName,
  serviceName,
  timeDetails,
}) => {
  return {
    subject: `Your ${serviceName} Booking Has Been Cancelled`,
    message: `Hi ${hostName},

We’re confirming that your booking for ${serviceName} has been successfully cancelled.

<p>
  <strong>Booking Time:</strong>
  <span style="background-color: #f8d7da; color: #721c24; padding: 5px 10px; border-radius: 4px; display: inline-block;">
    ${timeDetails}
  </span>
</p>

If this was a mistake or if you need to reschedule, you can do so anytime through your dashboard.

We hope to assist you again in the future.

Best regards,  
The Wed Bookie Team`,
  };
};


// Booking cancellation template for vendor
exports.vendorBookingCancelTemplate = ({
  vendorName,
  vendorCompany,
  hostName,
  timeDetails,
}) => {
  return {
    subject: `A Booking Has Been Cancelled – ${vendorCompany}`,
    message: `Hi ${vendorName},

We wanted to let you know that a booking for your venue, ${vendorCompany}, has been cancelled by ${hostName}.

<p>
  <strong>Booking Time:</strong>
  <span style="background-color: #f8d7da; color: #721c24; padding: 5px 10px; border-radius: 4px; display: inline-block;">
    ${timeDetails}
  </span>
</p>

You can review your updated bookings in your vendor dashboard.

Thanks for using Wed Bookie. We’ll keep you posted on future bookings.

Warm regards,  
The Wed Bookie Team`,
  };
};

// Host Service Buying Template
exports.hostServicePurchaseTemplate = (
  firstName,
  serviceName,
  purchaseTime,
  servicePrice
) => {
  return {
    subject: `Your Purchase of ${serviceName} is Confirmed! 🎉`,
    message: `Hi ${firstName},<br><br>

Thank you for purchasing the <strong>${serviceName}</strong> through <strong>Wed Bookie</strong>!<br><br>

<strong>Purchase Details:</strong><br>
- <strong>Service:</strong> ${serviceName}<br>
- <strong>Price:</strong> $${servicePrice}<br>
- <strong>Purchase Time:</strong> <span style="color: green;"><strong>${purchaseTime}</strong></span><br><br>

We’re excited that you chose Wed Bookie for your event needs. All of your services and bookings are accessible from your dashboard, where you can keep track of upcoming events and services you've purchased.<br><br>

If you have any questions or need assistance, don't hesitate to reach out to our support team.<br><br>

We are looking forward to making your event an unforgettable experience!<br><br>

Cheers,<br>
<strong>The Wed Bookie Team</strong>`,
  };
};

// Vendor Service Booking Template
exports.vendorServiceBookingTemplate = (
  firstName,
  serviceName,
  bookingTime,
  hostName,
  servicePrice
) => {
  return {
    subject: `You Have a New Booking for ${serviceName}! 🎉`,
    message: `Hi ${firstName},<br><br>

Good news! You’ve received a new booking for your <strong>${serviceName}</strong> service!<br><br>

<strong>Booking Details:</strong><br>
- <strong>Service:</strong> ${serviceName}<br>
- <strong>Price:</strong> $${servicePrice}<br>
- <strong>Booking Time:</strong> <span style="color: green;"><strong>${bookingTime}</strong></span><br>
- <strong>Host Name:</strong> ${hostName}<br><br>

We are excited to help make this event a memorable one. Please ensure you prepare everything to provide the best experience for the host.<br><br>

You can view all your bookings anytime in your vendor dashboard.<br><br>

If you need any assistance or have questions, feel free to reach out to our support team.<br><br>

We look forward to helping you make this event amazing!<br><br>

Cheers,<br>
<strong>The Wed Bookie Team</strong>`,
  };
};

exports.adminTwoFactorCodeTemplate = (first_name, otp) => {
  return {
    subject: "Your Wed Bookie 2FA Verification Code",
    message: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <p>Hi ${first_name},</p>

      <p>We received a request to log into your admin account on <strong>Wed Bookie</strong>.</p>

      <p>Please use the following One-Time Password (OTP) to complete your login:</p>

      <div style="background-color: #f7f7f7; padding: 20px; text-align: center; border-radius: 8px;">
        <h1 style="color: #007c26; font-size: 32px; margin: 0;">${otp}</h1>
      </div>

      <p>This code is valid for <strong>5 minutes</strong>. If you didn’t request this login, please ignore this email or contact support.</p>

      <p>Thanks,<br>The Wed Bookie Team</p>
    </div>
    `,
  };
};

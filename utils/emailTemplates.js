
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
  The Wed Bookie Team`
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
  The Wed Bookie Team`
    };
  };


//   for get password tempalte 
  exports.forgetPasswordTempalate=(first_name,otp)=>{
    return {
        subject: `forget passsword`,
        message: `Hi ${first_name},
    
    Please enter this OTP in the application to proceed. Remember, this OTP is valid for a limited time only. 
      <h1 style="color: #007c26; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
  ${otp}
</h1>                   
    
    If you did not request this OTP, please disregard this email or contact our support team for assistance.
    Cheers,  
    The Wed Bookie Team`
      };
  }
  

//   reset password email template
  exports.resetPasswordTemplate=(first_name)=>{
    return {
        subject: `passsword changed`,
        message: `Hi ${first_name},
    
   Hi there,
    
    We wanted to let you know that your password was successfully updated. If you made this change, no further action is needed.
    
    If you didn’t update your password, please contact our support team immediately so we can secure your account.
    
    Stay safe!
    
    Cheers,  
    The Wed Bookie Team`
      };
  }



  //   booking tempalate
exports.hostBookingTemplates = (firstName, serviceName, bookingTime) => {
    return {
      subject: `Your ${serviceName} Booking is Confirmed! 🎉`,
      message: `Hi ${firstName},
  
  Thank you for booking the ${serviceName} with Wed Bookie!
  
  📅 Booking Time: ${bookingTime}
  
  We’re thrilled to be part of your special occasion. You can view all your bookings anytime in your dashboard.
  
  If you have any questions or need assistance, feel free to reach out to our support team.
  
  We look forward to helping make your event amazing!
  
  Cheers,  
  The Wed Bookie Team`
    };
  };
  

  
  
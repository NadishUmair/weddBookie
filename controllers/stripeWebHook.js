const express = require('express');
const stripe = require('stripe')('your-secret-key');
const bodyParser = require('body-parser');
const crypto = require('crypto');



exports.Webhook=async (req, res) => {
  const sig = req.headers['stripe-signature']; // Stripe signature header
  const endpointSecret = 'your-webhook-signing-secret'; // Webhook signing secret from Stripe

  let event;

  try {
    // Verify the webhook signature to ensure the event is from Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle different events based on the metadata or type
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const bookingType = paymentIntent.metadata.booking_type; // Check the metadata for the type of booking

      if (bookingType === 'venue') {
        console.log(`Venue booking payment succeeded! PaymentIntent ID: ${paymentIntent.id}`);
       
      } else if (bookingType === 'service') {
        console.log(`Service booking payment succeeded! PaymentIntent ID: ${paymentIntent.id}`);
     
      } else {
        console.log(`Other booking payment succeeded! PaymentIntent ID: ${paymentIntent.id}`);
        
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      console.log(`Payment failed for PaymentIntent ID: ${failedPaymentIntent.id}`);
   
      break;

  
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }


  res.status(200).json({ received: true });
}


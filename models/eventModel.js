const eventSchema = new Schema({
    host: {
      type: Schema.Types.ObjectId,
      ref: 'host',
      required: true
    },
    venue: {
      type: Schema.Types.ObjectId,
      ref: 'venue',
      required: true
    },
    services: [{
      type: Schema.Types.ObjectId,
      ref: 'service'
    }],
    eventDate: {
      type: Date,
      required: true
    },
    eventType: {
      type: String, // Wedding, Reception, Engagement, etc.
      required: true
    },
    status: {
      type: String, 
      enumm:['pending','confirmed','cancelled'],// Pending, Confirmed, Cancelled
      default: 'pending'
    }
  }, { timestamps: true });
  
  const EventsModel= mongoose.model('event', eventSchema);
  module,exports=EventsModel;
  
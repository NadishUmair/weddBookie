const eventSchema = new Schema({
    host: {
      type: Schema.Types.ObjectId,
      ref: 'Host',
      required: true
    },
    venue: {
      type: Schema.Types.ObjectId,
      ref: 'Venue',
      required: true
    },
    services: [{
      type: Schema.Types.ObjectId,
      ref: 'Service'
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
      type: String, // Pending, Confirmed, Cancelled
      default: 'Pending'
    }
  }, { timestamps: true });
  
  const EventsModel= mongoose.model('Event', eventSchema);
  module,exports=EventsModel;
  
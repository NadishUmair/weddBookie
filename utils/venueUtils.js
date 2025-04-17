
const isValidTimeRange = (start, end) => {
    const formatTime = timeStr => {
      // Convert to 24-hour time using Date (note: locale must be 'en-US' or similar)
      return new Date(`1970-01-01T${new Date(`1970-01-01 ${timeStr}`).toLocaleTimeString('en-GB')}`);
    };
    const startTime = formatTime(start);
    const endTime = formatTime(end);
    return startTime < endTime;
  };
  
  const validateTimings = (timings) => {
    const periods = ['morning', 'afternoon', 'evening'];
    for (const [day, slots] of Object.entries(timings)) {
      for (const period of periods) {
        const slot = slots[period];
        if (slot?.start && slot?.end) {
          if (!isValidTimeRange(slot.start, slot.end)) {
            return `Invalid time range on ${day} during ${period} (start: ${slot.start}, end: ${slot.end})`;
          }
        }
      }
    }
  
    return null; // all good
  };

  module.exports=validateTimings;
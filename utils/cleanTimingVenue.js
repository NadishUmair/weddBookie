// utils/cleanTimingsVenue.js
function cleanTimingsVenue(timings_venue) {
    const cleaned = {};
  
    if (timings_venue && typeof timings_venue === "object") {
      for (const [day, daySlots] of Object.entries(timings_venue)) {
        const validDay = {};
  
        ["morning", "afternoon", "evening"].forEach((slotName) => {
          const slot = daySlots[slotName];
          if (slot?.start && slot?.end) {
            validDay[slotName] = {
              start: slot.start,
              end: slot.end,
              status: slot.status || "active",
            };
          }
        });
  
        if (Object.keys(validDay).length > 0) {
          cleaned[day] = validDay;
        }
      }
    }
  
    return cleaned;
  }
  
  module.exports = cleanTimingsVenue;
  
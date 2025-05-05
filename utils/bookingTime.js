const moment = require("moment-timezone");

/**
 * Returns formatted slot time string for email display.
 */
function formatSlotTime(slotTiming, localDate, time_slot, timezone) {
  const slotStart = moment.tz(`${localDate} ${slotTiming.start}`, "YYYY-MM-DD HH:mm", timezone);
  const slotEnd = moment.tz(`${localDate} ${slotTiming.end}`, "YYYY-MM-DD HH:mm", timezone);

  const formatted = `${capitalize(slotTimeLabel(time_slot))} slot: ${slotStart.format("h:mm A")} to ${slotEnd.format("h:mm A")} on ${slotStart.format("dddd, MMMM Do YYYY")}`;
  return { formatted, start_time: slotStart.utc().toDate(), end_time: slotEnd.utc().toDate() };
}

/**
 * Capitalizes a string.
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Label cleaner
 */
function slotTimeLabel(slot) {
  return slot.replace(/_/g, ' ');
}

module.exports = {
  formatSlotTime,
};

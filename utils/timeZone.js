// utils/dateUtils.js
const moment = require("moment-timezone");

/**
 * Converts a date + time + timezone to a UTC moment object.
 * @param {string} event_date - Format: DD-MM-YYYY
 * @param {string} time_slot - Format: HH:mm (24-hr time, e.g., "14:30")
 * @param {string} timezone - IANA timezone string (e.g., "America/New_York")
 * @returns {Object} { utcMoment, error }
 */
function getUTCFromLocal(event_date, time_slot, timezone) {
  if (!event_date || !time_slot || !timezone) {
    return { error: "Missing required parameters." };
  }

  if (!moment.tz.zone(timezone)) {
    return { error: "Invalid timezone." };
  }

  const localDateTime = `${event_date} ${time_slot}`;
  const localMoment = moment.tz(localDateTime, "DD-MM-YYYY HH:mm", timezone);

  if (!localMoment.isValid()) {
    return { error: "Invalid date or time format. Use DD-MM-YYYY and HH:mm." };
  }

  if (localMoment.isBefore(moment.utc())) {
    return { error: "Cannot book for a past date/time." };
  }

  return { utcMoment: localMoment.clone().utc() };
}

module.exports = { getUTCFromLocal };

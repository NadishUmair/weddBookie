const moment = require("moment");

const generateServiceSlots = (working_hours, slot_duration) => {
  const weeklySlots = {};

  for (let day of Object.keys(working_hours)) {
    const slots = [];

    const daySchedule = working_hours[day];
    // Support 12-hour format with AM/PM
    const startTime = moment(daySchedule.start, ["h:mm A", "hh:mm A"]);
    const endTime = moment(daySchedule.end, ["h:mm A", "hh:mm A"]);

    while (startTime < endTime) {
      const endSlotTime = moment(startTime).add(slot_duration, "minutes");
      if (endSlotTime > endTime) break;

      slots.push({
        start: startTime.format("hh:mm A"),
        end: endSlotTime.format("hh:mm A"),
        status: "active",
      });

      startTime.add(slot_duration, "minutes");
    }

    weeklySlots[day] = slots;
  }

  return weeklySlots;
};

module.exports = generateServiceSlots;

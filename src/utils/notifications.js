export const scheduleDailyReminder = async (hour = 20, minute = 0) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  if (date <= new Date()) {
    date.setDate(date.getDate() + 1);
  }

  console.warn(
    "Daily reminder is not configured yet. Install and wire a local notification library before enabling it."
  );

  return {
    ok: false,
    scheduledFor: date,
    reason: "Notifications are not configured in this build yet.",
  };
};

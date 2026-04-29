import { Platform } from "react-native";

export const scheduleDailyReminder = async (hour = 20, minute = 0) => {
  try {
    // This implementation is optional and will attempt to use PushNotification if available.
    const PushNotification = require("react-native-push-notification");
    PushNotification.configure({
      onNotification: function (notification) {},
      requestPermissions: true,
    });
    PushNotification.cancelAllLocalNotifications();
    const date = new Date();
    date.setHours(hour, minute, 0);
    if (date <= new Date()) date.setDate(date.getDate() + 1);
    PushNotification.localNotificationSchedule({
      message: "Log your expenses for today",
      date,
      repeatType: "day",
    });
  } catch (err) {
    // not fatal - package may not be installed
    console.warn("Notification scheduling unavailable", err);
  }
};

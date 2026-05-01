import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import notifee, {
  AndroidNotificationSetting,
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  TriggerType,
} from "@notifee/react-native";

const DAILY_REMINDER_ID = "daily-expense-reminder";
const DAILY_REMINDER_CHANNEL_ID = "daily-reminders";
const REMINDER_ENABLED_KEY = "@flowcash:daily-reminder-enabled";
const REMINDER_TIME_KEY = "@flowcash:daily-reminder-time";
const DEFAULT_REMINDER_TIME = { hour: 20, minute: 0 };

const DAILY_REMINDER_TITLE = "FlowCash reminder";
const DAILY_REMINDER_BODY =
  "Aaj ke expenses add kar lo taaki spending clear rahe.";

const clampTimePart = (value, max) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  if (parsed < 0) {
    return 0;
  }

  if (parsed > max) {
    return max;
  }

  return Math.floor(parsed);
};

const getNextReminderDate = (hour, minute) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  if (date <= new Date()) {
    date.setDate(date.getDate() + 1);
  }

  return date;
};

const ensureNotificationPermission = async () => {
  const settings = await notifee.requestPermission();

  if (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  ) {
    return { ok: true };
  }

  return {
    ok: false,
    reason: "Notifications permission allow karni padegi.",
    action: "notifications",
  };
};

const ensureAndroidAlarmPermission = async () => {
  if (Platform.OS !== "android" || Platform.Version < 31) {
    return { ok: true };
  }

  const settings = await notifee.getNotificationSettings();

  if (settings.android?.alarm === AndroidNotificationSetting.ENABLED) {
    return { ok: true };
  }

  return {
    ok: false,
    reason:
      "Daily reminder ke liye Android me Alarms & reminders access enable karna padega.",
    action: "alarm",
  };
};

const ensureReminderChannel = async () =>
  notifee.createChannel({
    id: DAILY_REMINDER_CHANNEL_ID,
    name: "Daily reminders",
    description: "Expense logging reminders for every evening.",
    importance: AndroidImportance.HIGH,
  });

export const scheduleDailyReminder = async (hour = 20, minute = 0) => {
  const permission = await ensureNotificationPermission();
  if (!permission.ok) {
    return permission;
  }

  const alarmPermission = await ensureAndroidAlarmPermission();
  if (!alarmPermission.ok) {
    return alarmPermission;
  }

  const scheduledFor = getNextReminderDate(hour, minute);
  const channelId = await ensureReminderChannel();

  await notifee.cancelNotification(DAILY_REMINDER_ID);
  await notifee.createTriggerNotification(
    {
      id: DAILY_REMINDER_ID,
      title: DAILY_REMINDER_TITLE,
      body: DAILY_REMINDER_BODY,
      android: {
        channelId,
        pressAction: {
          id: "default",
        },
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: scheduledFor.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    }
  );

  await AsyncStorage.setItem(REMINDER_ENABLED_KEY, "true");
  await AsyncStorage.setItem(
    REMINDER_TIME_KEY,
    JSON.stringify({
      hour: clampTimePart(hour, 23),
      minute: clampTimePart(minute, 59),
    })
  );

  return {
    ok: true,
    scheduledFor,
  };
};

export const cancelDailyReminder = async () => {
  await notifee.cancelNotification(DAILY_REMINDER_ID);
  await AsyncStorage.setItem(REMINDER_ENABLED_KEY, "false");

  return { ok: true };
};

export const getDailyReminderEnabled = async () => {
  const value = await AsyncStorage.getItem(REMINDER_ENABLED_KEY);
  return value === "true";
};

export const getDailyReminderTime = async () => {
  try {
    const value = await AsyncStorage.getItem(REMINDER_TIME_KEY);

    if (!value) {
      return DEFAULT_REMINDER_TIME;
    }

    const parsed = JSON.parse(value);
    return {
      hour: clampTimePart(parsed?.hour, 23),
      minute: clampTimePart(parsed?.minute, 59),
    };
  } catch (error) {
    console.error("Reminder time load failed", error);
    return DEFAULT_REMINDER_TIME;
  }
};

export const saveDailyReminderTime = async (hour, minute) => {
  const nextTime = {
    hour: clampTimePart(hour, 23),
    minute: clampTimePart(minute, 59),
  };

  await AsyncStorage.setItem(REMINDER_TIME_KEY, JSON.stringify(nextTime));
  return nextTime;
};

export const syncDailyReminder = async () => {
  const enabled = await getDailyReminderEnabled();

  if (!enabled) {
    return { ok: true, enabled: false };
  }

  const time = await getDailyReminderTime();
  const result = await scheduleDailyReminder(time.hour, time.minute);
  return {
    ...result,
    enabled: result?.ok === true,
  };
};

export const openReminderSettings = async (action) => {
  if (action === "alarm") {
    await notifee.openAlarmPermissionSettings();
    return;
  }

  await notifee.openNotificationSettings();
};
